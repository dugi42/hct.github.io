#!/usr/bin/env python3
"""Upload changed tracked files from the pushed commit range via FTPS."""

from __future__ import annotations

import ftplib
import os
import posixpath
import ssl
import subprocess
import sys
import time
from pathlib import Path


ZERO_SHA = "0" * 40


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


def get_changed_files(before_sha: str, current_sha: str, repo_root: Path) -> list[str]:
    if before_sha and before_sha != ZERO_SHA:
        try:
            raw = run_git_command(
                [
                    "git",
                    "diff",
                    "--name-only",
                    "-z",
                    "--diff-filter=ACMR",
                    before_sha,
                    current_sha,
                ]
            )
        except subprocess.CalledProcessError:
            raw = run_git_command(
                [
                    "git",
                    "diff-tree",
                    "--no-commit-id",
                    "--name-only",
                    "-r",
                    "-z",
                    current_sha,
                ]
            )
    else:
        raw = run_git_command(
            [
                "git",
                "diff-tree",
                "--no-commit-id",
                "--name-only",
                "-r",
                "-z",
                current_sha,
            ]
        )

    changed = []
    seen = set()

    for rel_path in parse_null_separated_paths(raw):
        candidate = (repo_root / rel_path).resolve()
        try:
            candidate.relative_to(repo_root)
        except ValueError:
            continue
        if not candidate.is_file():
            continue
        if rel_path in seen:
            continue
        seen.add(rel_path)
        changed.append(rel_path)

    return changed


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


def remote_dir_for_file(remote_base: str, rel_path: str) -> str:
    relative_dir = posixpath.dirname(rel_path.replace("\\", "/"))
    if relative_dir in {"", "."}:
        return remote_base
    return posixpath.normpath(posixpath.join(remote_base, relative_dir))


def upload_once(
    files: list[str],
    repo_root: Path,
    host: str,
    port: int,
    user: str,
    password: str,
    remote_base: str,
    timeout_seconds: int,
    verify_certificate: bool,
) -> None:
    context = ssl.create_default_context() if verify_certificate else ssl._create_unverified_context()
    ftp = ftplib.FTP_TLS(timeout=timeout_seconds, context=context)
    try:
        ftp.connect(host=host, port=port)
        ftp.auth()
        ftp.login(user=user, passwd=password)
        ftp.prot_p()

        for index, rel_path in enumerate(files, start=1):
            local_path = repo_root / rel_path
            remote_dir = remote_dir_for_file(remote_base, rel_path)
            ensure_remote_dir(ftp, remote_dir)
            ftp.cwd(remote_dir)
            remote_name = Path(rel_path).name
            with local_path.open("rb") as source:
                ftp.storbinary(f"STOR {remote_name}", source)
            print(f"[{index}/{len(files)}] Uploaded: {rel_path} -> {remote_dir}/{remote_name}")
    finally:
        try:
            ftp.quit()
        except Exception:
            ftp.close()


def main() -> int:
    repo_root = Path.cwd().resolve()

    host = get_required_env("FTP_HOST")
    user = get_required_env("FTP_USER")
    password = get_required_env("FTP_PASSWORD")
    remote_dir = get_required_env("FTP_REMOTE_DIR")
    port = get_int_env("FTP_PORT", 21)

    before_sha = os.getenv("BEFORE_SHA", "").strip()
    current_sha = os.getenv("CURRENT_SHA", "").strip() or os.getenv("GITHUB_SHA", "").strip()
    if not current_sha:
        raise RuntimeError("Missing CURRENT_SHA (or GITHUB_SHA).")

    timeout_seconds = get_int_env("FTP_TIMEOUT_SECONDS", 30)
    max_retries = get_int_env("FTP_MAX_RETRIES", 10)
    retry_delay_seconds = get_int_env("FTP_RETRY_DELAY_SECONDS", 2)
    verify_certificate = get_bool_env("FTP_VERIFY_CERTIFICATE", False)

    remote_base = remote_dir.rstrip("/")
    if not remote_base:
        remote_base = "/"

    files = get_changed_files(before_sha=before_sha, current_sha=current_sha, repo_root=repo_root)
    if not files:
        print("No changed tracked files to upload.")
        return 0

    print("Changed tracked files to upload:")
    for rel_path in files:
        print(rel_path)

    last_error: Exception | None = None
    for attempt in range(1, max_retries + 1):
        try:
            upload_once(
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
            print("FTP upload completed.")
            return 0
        except Exception as exc:
            last_error = exc
            if attempt >= max_retries:
                break
            print(f"Upload attempt {attempt}/{max_retries} failed: {exc}")
            print(f"Retrying in {retry_delay_seconds} seconds...")
            time.sleep(retry_delay_seconds)

    raise RuntimeError(f"FTP upload failed after {max_retries} attempts: {last_error}")


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(error, file=sys.stderr)
        raise SystemExit(1)
