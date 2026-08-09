#!/usr/bin/env python3
"""Stamp local CSS/JS references in HTML with a hash of the asset's content.

Every page links its assets as `css/site.css?v=...`. The query string is what
makes a browser fetch the new file instead of reusing the copy in its HTTP
cache. That stamp used to be a hand-written date, so it went stale the moment
someone edited a JS file without remembering to bump it: visitors kept running
the old script until they cleared their cache by hand.

The stamp is now the first 10 hex chars of the asset's SHA-256, rewritten by
this script. It changes exactly when the file's bytes change, so it can't drift
out of sync with the content it's supposed to describe.

Usage:
    python/stamp_assets.py            # rewrite HTML in place
    python/stamp_assets.py --check    # exit 1 if any stamp is out of date
"""

from __future__ import annotations

import hashlib
import re
import subprocess
import sys
from pathlib import Path

# Matches src="…/foo.js" / href="…/bar.css", with or without an existing query
# string, capturing any trailing #fragment so it survives the rewrite.
ASSET_REF = re.compile(
    r'(?P<attr>\b(?:src|href))="(?P<path>[^"?#]+\.(?:js|css))'
    r'(?P<query>\?[^"#]*)?(?P<fragment>#[^"]*)?"'
)

STAMP_LENGTH = 10


def is_external(path: str) -> bool:
    return path.startswith(("http://", "https://", "//", "data:"))


def content_stamp(asset: Path) -> str:
    digest = hashlib.sha256(asset.read_bytes()).hexdigest()
    return digest[:STAMP_LENGTH]


def list_html_files(repo_root: Path) -> list[Path]:
    result = subprocess.run(
        ["git", "ls-files", "-z", "*.html"],
        check=True,
        capture_output=True,
        cwd=repo_root,
    )
    names = result.stdout.decode("utf-8", errors="surrogateescape").split("\0")
    return [repo_root / name for name in names if name]


def stamp_html(html_file: Path, repo_root: Path, stamps: dict[Path, str]) -> list[str]:
    original = html_file.read_text(encoding="utf-8")
    changes: list[str] = []

    def replace(match: re.Match[str]) -> str:
        path = match.group("path")
        if is_external(path):
            return match.group(0)

        asset = (html_file.parent / path).resolve()
        try:
            asset.relative_to(repo_root)
        except ValueError:
            return match.group(0)
        if not asset.is_file():
            print(f"  ! {html_file.relative_to(repo_root)}: missing asset {path}")
            return match.group(0)

        if asset not in stamps:
            stamps[asset] = content_stamp(asset)
        stamp = stamps[asset]

        old_query = match.group("query") or ""
        if old_query == f"?v={stamp}":
            return match.group(0)

        changes.append(f"{path}{old_query} -> {path}?v={stamp}")
        fragment = match.group("fragment") or ""
        return f'{match.group("attr")}="{path}?v={stamp}{fragment}"'

    updated = ASSET_REF.sub(replace, original)
    if updated != original:
        html_file.write_text(updated, encoding="utf-8")
    return changes


def main(argv: list[str]) -> int:
    check_only = "--check" in argv[1:]
    repo_root = Path.cwd().resolve()

    stamps: dict[Path, str] = {}
    stale = 0

    for html_file in list_html_files(repo_root):
        if check_only:
            before = html_file.read_text(encoding="utf-8")
        changes = stamp_html(html_file, repo_root, stamps)
        if changes:
            stale += len(changes)
            print(f"{html_file.relative_to(repo_root)}:")
            for change in changes:
                print(f"  {change}")
        if check_only:
            html_file.write_text(before, encoding="utf-8")

    if not stale:
        print("All asset stamps are up to date.")
        return 0

    if check_only:
        print(f"\n{stale} stale asset stamp(s). Run python/stamp_assets.py.")
        return 1

    print(f"\nUpdated {stale} asset stamp(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
