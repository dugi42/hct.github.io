#!/usr/bin/env python3
"""Mirror the git-tracked website tree to the FTP server.

The script walks the list of files tracked in the current git working tree,
compares each one against the remote file on the FTP server (size + modtime),
uploads anything that's missing or different, and deletes any remote file or
directory that isn't tracked locally.

This replaces the previous behaviour of trusting a git SHA range — that
approach silently skipped files whenever the FTP state had drifted from
what we last pushed.
"""

from __future__ import annotations

import ftplib
import os
import posixpath
import ssl
import subprocess
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path


# Repo-root paths that should never be published to the web server.
# Matched as the first path segment of each tracked file.
EXCLUDED_TOP_LEVEL = {
    ".git",
    ".github",
    ".claude",
    ".venv",
    ".gitignore",
    ".python-version",
    "python",
    "scripts",
    "pyproject.toml",
    "uv.lock",
    "package.json",
    "package-lock.json",
    "README.md",
}

# Tolerance for modtime comparison — FTP MLSD timestamps are second-precision
# and some servers round, so anything within this window is treated as equal.
MTIME_TOLERANCE_SECONDS = 2


def get_required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def get_int_env(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None or raw.strip() == "":
        return default
    try:
        return int(raw)
    except ValueError as exc:
        raise RuntimeError(f"Environment variable {name} must be an integer.") from exc


def get_bool_env(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None or raw.strip() == "":
        return default
    value = raw.strip().lower()
    if value in {"1", "true", "yes", "y", "on"}:
        return True
    if value in {"0", "false", "no", "n", "off"}:
        return False
    raise RuntimeError(f"Environment variable {name} must be a boolean.")


def run_git_command(args: list[str]) -> bytes:
    result = subprocess.run(args, check=True, capture_output=True)
    return result.stdout


def parse_null_separated_paths(blob: bytes) -> list[str]:
    text = blob.decode("utf-8", errors="surrogateescape")
    return [entry for entry in text.split("\0") if entry]


def get_tracked_files(repo_root: Path) -> list[str]:
    raw = run_git_command(["git", "ls-files", "-z"])
    files = []
    for rel_path in parse_null_separated_paths(raw):
        # First segment determines whether the path is publishable.
        first = rel_path.split("/", 1)[0]
        if first in EXCLUDED_TOP_LEVEL:
            continue
        candidate = (repo_root / rel_path).resolve()
        try:
            candidate.relative_to(repo_root)
        except ValueError:
            continue
        if not candidate.is_file():
            continue
        files.append(rel_path)
    return files


@dataclass
class RemoteEntry:
    name: str
    is_dir: bool
    size: int | None
    mtime: float | None  # epoch seconds, UTC


def parse_mlsd_modify(value: str) -> float | None:
    # MLSD "modify" facts are YYYYMMDDHHMMSS in UTC, optionally fractional.
    if not value:
        return None
    main = value.split(".")[0]
    try:
        dt = datetime.strptime(main, "%Y%m%d%H%M%S").replace(tzinfo=timezone.utc)
    except ValueError:
        return None
    return dt.timestamp()


def list_remote(ftp: ftplib.FTP_TLS, remote_dir: str) -> dict[str, RemoteEntry]:
    """Return {name: RemoteEntry} for the given remote directory.

    Falls back gracefully when MLSD isn't supported: size comes from SIZE and
    modtime from MDTM. Returns an empty dict if the directory doesn't exist.
    """
    entries: dict[str, RemoteEntry] = {}

    try:
        ftp.cwd(remote_dir)
    except ftplib.error_perm:
        return entries

    try:
        for name, facts in ftp.mlsd():
            if name in (".", ".."):
                continue
            entry_type = facts.get("type", "").lower()
            is_dir = entry_type in {"dir", "cdir", "pdir"}
            size_raw = facts.get("size")
            size = int(size_raw) if size_raw and size_raw.isdigit() else None
            mtime = parse_mlsd_modify(facts.get("modify", ""))
            entries[name] = RemoteEntry(name=name, is_dir=is_dir, size=size, mtime=mtime)
        return entries
    except ftplib.error_perm:
        # MLSD not supported — fall back to LIST + per-file SIZE/MDTM.
        pass

    names: list[str] = []
    try:
        ftp.retrlines("NLST", names.append)
    except ftplib.error_perm:
        return entries

    for raw in names:
        name = posixpath.basename(raw.strip())
        if name in (".", "..", ""):
            continue
        is_dir = False
        try:
            ftp.cwd(name)
            is_dir = True
            ftp.cwd("..")
        except ftplib.error_perm:
            is_dir = False

        size: int | None = None
        mtime: float | None = None
        if not is_dir:
            try:
                size = ftp.size(name)
            except (ftplib.error_perm, ftplib.error_reply):
                size = None
            try:
                resp = ftp.sendcmd(f"MDTM {name}")
                # Response form: "213 YYYYMMDDHHMMSS"
                parts = resp.split(maxsplit=1)
                if len(parts) == 2:
                    mtime = parse_mlsd_modify(parts[1].strip())
            except (ftplib.error_perm, ftplib.error_reply):
                mtime = None

        entries[name] = RemoteEntry(name=name, is_dir=is_dir, size=size, mtime=mtime)

    return entries


def ensure_remote_dir(ftp: ftplib.FTP_TLS, remote_dir: str) -> None:
    normalized = posixpath.normpath(remote_dir)
    if normalized in {"", "."}:
        return

    parts = [part for part in normalized.split("/") if part]
    current = "/" if normalized.startswith("/") else ""

    for part in parts:
        if current == "":
            current = part
        elif current == "/":
            current = f"/{part}"
        else:
            current = f"{current}/{part}"

        try:
            ftp.mkd(current)
        except ftplib.error_perm as exc:
            message = str(exc).lower()
            if "exist" not in message and not message.startswith("550"):
                raise


def needs_upload(local_path: Path, remote: RemoteEntry | None) -> bool:
    if remote is None or remote.is_dir:
        return True
    try:
        local_size = local_path.stat().st_size
        local_mtime = local_path.stat().st_mtime
    except OSError:
        return True
    if remote.size != local_size:
        return True
    if remote.mtime is None:
        # No reliable remote modtime — size matched, trust it.
        return False
    # Re-upload if local is strictly newer than remote (beyond tolerance).
    return local_mtime - remote.mtime > MTIME_TOLERANCE_SECONDS


def remote_path_join(*parts: str) -> str:
    cleaned = [p for p in parts if p not in ("", ".")]
    if not cleaned:
        return "/"
    joined = posixpath.normpath(posixpath.join(*cleaned))
    return joined


def delete_remote_tree(ftp: ftplib.FTP_TLS, remote_path: str) -> None:
    """Recursively delete a remote file or directory."""
    # Try file delete first — cheaper than detecting type.
    try:
        ftp.delete(remote_path)
        print(f"Deleted remote file: {remote_path}")
        return
    except ftplib.error_perm:
        pass

    # Treat as directory: enumerate, recurse, then rmd.
    parent, name = posixpath.split(remote_path)
    try:
        ftp.cwd(remote_path)
    except ftplib.error_perm:
        return

    children = list_remote(ftp, remote_path)
    for child_name, child in children.items():
        child_path = remote_path_join(remote_path, child_name)
        delete_remote_tree(ftp, child_path)

    try:
        ftp.cwd(parent if parent else "/")
    except ftplib.error_perm:
        pass
    try:
        ftp.rmd(remote_path)
        print(f"Deleted remote directory: {remote_path}")
    except ftplib.error_perm as exc:
        print(f"Could not remove remote directory {remote_path}: {exc}")


def build_local_tree(files: list[str]) -> dict[str, set[str]]:
    """Return {dir_path: {entry_names}} describing what *should* exist remotely.

    Dir paths are POSIX, relative to the remote base (empty string == base).
    Each entry is just a name (file or subdir); we recurse using the map.
    """
    tree: dict[str, set[str]] = {"": set()}
    for rel in files:
        parts = rel.replace("\\", "/").split("/")
        for depth in range(len(parts)):
            parent = "/".join(parts[:depth])
            entry = parts[depth]
            tree.setdefault(parent, set()).add(entry)
            if depth < len(parts) - 1:
                tree.setdefault("/".join(parts[: depth + 1]), set())
    return tree


def sync_directory(
    ftp: ftplib.FTP_TLS,
    repo_root: Path,
    remote_base: str,
    local_tree: dict[str, set[str]],
    rel_dir: str,
    stats: dict[str, int],
) -> None:
    """Sync one directory level, then recurse into subdirectories."""
    remote_dir = remote_path_join(remote_base, rel_dir) if rel_dir else remote_base
    ensure_remote_dir(ftp, remote_dir)
    remote_entries = list_remote(ftp, remote_dir)

    expected = local_tree.get(rel_dir, set())

    # 1. Delete remote entries that shouldn't be here.
    for name, entry in list(remote_entries.items()):
        if name in expected:
            continue
        target = remote_path_join(remote_dir, name)
        delete_remote_tree(ftp, target)
        remote_entries.pop(name, None)
        stats["deleted"] += 1

    # 2. Upload / refresh files at this level.
    for name in expected:
        child_rel = f"{rel_dir}/{name}" if rel_dir else name
        local_path = repo_root / child_rel
        if local_path.is_file():
            remote_entry = remote_entries.get(name)
            if remote_entry and remote_entry.is_dir:
                # Remote has a directory where we want a file — remove it first.
                delete_remote_tree(ftp, remote_path_join(remote_dir, name))
                remote_entry = None
                stats["deleted"] += 1
            if needs_upload(local_path, remote_entry):
                ensure_remote_dir(ftp, remote_dir)
                ftp.cwd(remote_dir)
                with local_path.open("rb") as source:
                    ftp.storbinary(f"STOR {name}", source)
                stats["uploaded"] += 1
                print(f"Uploaded: {child_rel} -> {remote_dir}/{name}")
            else:
                stats["skipped"] += 1

    # 3. Recurse into subdirectories.
    for name in expected:
        child_rel = f"{rel_dir}/{name}" if rel_dir else name
        local_path = repo_root / child_rel
        if local_path.is_dir():
            remote_entry = remote_entries.get(name)
            if remote_entry and not remote_entry.is_dir:
                # Remote has a file where we want a directory — delete it.
                try:
                    ftp.delete(remote_path_join(remote_dir, name))
                    stats["deleted"] += 1
                except ftplib.error_perm:
                    pass
            sync_directory(ftp, repo_root, remote_base, local_tree, child_rel, stats)


def sync_once(
    files: list[str],
    repo_root: Path,
    host: str,
    port: int,
    user: str,
    password: str,
    remote_base: str,
    timeout_seconds: int,
    verify_certificate: bool,
) -> dict[str, int]:
    context = ssl.create_default_context() if verify_certificate else ssl._create_unverified_context()
    ftp = ftplib.FTP_TLS(timeout=timeout_seconds, context=context)
    stats = {"uploaded": 0, "skipped": 0, "deleted": 0}
    try:
        ftp.connect(host=host, port=port)
        ftp.auth()
        ftp.login(user=user, passwd=password)
        ftp.prot_p()
        local_tree = build_local_tree(files)
        sync_directory(ftp, repo_root, remote_base, local_tree, "", stats)
    finally:
        try:
            ftp.quit()
        except Exception:
            ftp.close()
    return stats


def main() -> int:
    repo_root = Path.cwd().resolve()

    host = get_required_env("FTP_HOST")
    user = get_required_env("FTP_USER")
    password = get_required_env("FTP_PASSWORD")
    remote_dir = get_required_env("FTP_REMOTE_DIR")
    port = get_int_env("FTP_PORT", 21)

    timeout_seconds = get_int_env("FTP_TIMEOUT_SECONDS", 30)
    max_retries = get_int_env("FTP_MAX_RETRIES", 10)
    retry_delay_seconds = get_int_env("FTP_RETRY_DELAY_SECONDS", 2)
    verify_certificate = get_bool_env("FTP_VERIFY_CERTIFICATE", False)

    remote_base = remote_dir.rstrip("/")
    if not remote_base:
        remote_base = "/"

    files = get_tracked_files(repo_root)
    if not files:
        print("No tracked publishable files found — refusing to sync.")
        return 1

    print(f"Mirroring {len(files)} tracked files to {host}:{port}{remote_base} ...")

    last_error: Exception | None = None
    for attempt in range(1, max_retries + 1):
        try:
            stats = sync_once(
                files=files,
                repo_root=repo_root,
                host=host,
                port=port,
                user=user,
                password=password,
                remote_base=remote_base,
                timeout_seconds=timeout_seconds,
                verify_certificate=verify_certificate,
            )
            print(
                "FTP mirror completed: "
                f"{stats['uploaded']} uploaded, "
                f"{stats['skipped']} unchanged, "
                f"{stats['deleted']} deleted."
            )
            return 0
        except Exception as exc:
            last_error = exc
            if attempt >= max_retries:
                break
            print(f"Sync attempt {attempt}/{max_retries} failed: {exc}")
            print(f"Retrying in {retry_delay_seconds} seconds...")
            time.sleep(retry_delay_seconds)

    raise RuntimeError(f"FTP mirror failed after {max_retries} attempts: {last_error}")


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(error, file=sys.stderr)
        raise SystemExit(1)
