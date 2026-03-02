# Python 3.12+ - Fetch Hockey Report stats and write /public/hcstats.json
import argparse
import asyncio
import json
import os
import time
from datetime import datetime
from pathlib import Path

import httpx
from dotenv import load_dotenv

load_dotenv()

API_BASE_URL = os.environ.get("HC_REPORT_API_URL")
TOKEN = os.environ.get("HC_REPORT_TOKEN")
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
DEFAULT_CONFIG_PATH = SCRIPT_DIR / "config_season.json"
OUTPUT_FILE_PATH = REPO_ROOT / "public" / "hcstats.json"
REQUIRED_QUERY_FIELDS = ("team_id", "league_id", "division_id", "season_id", "phase_id")
CONTEXT_FIELDS = ("league_id", "division_id", "season_id", "phase_id")


def parse_args():
    parser = argparse.ArgumentParser(
        description="Fetch Hockey Report stats and write public/hcstats.json."
    )
    parser.add_argument(
        "--config",
        default=str(DEFAULT_CONFIG_PATH),
        help=(
            "Path to query config JSON with fields: team_id, league_id, "
            "division_id, season_id, phase_id."
        ),
    )
    parser.add_argument(
        "--strict-context",
        action="store_true",
        help=(
            "Fail if API response context (season/phase/league/division) "
            "does not match config values."
        ),
    )
    return parser.parse_args()


def load_query_config(config_path):
    try:
        with open(config_path, "r", encoding="utf8") as config_file:
            raw_config = json.load(config_file)
    except FileNotFoundError as err:
        raise ValueError(f"Config file not found: {config_path}") from err
    except json.JSONDecodeError as err:
        raise ValueError(f"Invalid JSON in config file {config_path}: {err}") from err

    config = {}
    for field in REQUIRED_QUERY_FIELDS:
        if field not in raw_config:
            raise ValueError(f"Missing required config field: {field}")
        try:
            config[field] = int(raw_config[field])
        except (ValueError, TypeError) as err:
            raise ValueError(f"Config field {field} must be a valid number.") from err
    return config


def parse_int(value):
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


def extract_context(payload):
    if not isinstance(payload, dict):
        return {}
    raw_context = payload.get("context")
    if not isinstance(raw_context, dict):
        return {}
    context = {}
    for field in CONTEXT_FIELDS:
        parsed = parse_int(raw_context.get(field))
        if parsed is not None:
            context[field] = parsed
    return context


def find_context_mismatches(endpoint_contexts, query_config):
    mismatches = {}
    for endpoint, context in endpoint_contexts.items():
        if not context:
            continue
        endpoint_mismatches = {}
        for field in CONTEXT_FIELDS:
            actual = context.get(field)
            expected = query_config.get(field)
            if actual is None or expected is None:
                continue
            if actual != expected:
                endpoint_mismatches[field] = {"expected": expected, "actual": actual}
        if endpoint_mismatches:
            mismatches[endpoint] = endpoint_mismatches
    return mismatches


async def post_json(client, endpoint, api_base_url, payload):
    res = await client.post(
        f"{api_base_url}/{endpoint}",
        params={"_": int(time.time() * 1000)},
        json=payload,
        headers={
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
        },
    )
    text = res.text
    if not res.is_success:
        raise Exception(f"{endpoint}: {res.status_code} {res.reason_phrase} - {text}")
    data = res.json()
    if data and data.get("error"):
        raise Exception(f"{endpoint}: {data['error']}")
    return data


async def main():
    args = parse_args()

    if not API_BASE_URL or not TOKEN:
        print("Missing required envs: HC_REPORT_API_URL, HC_REPORT_TOKEN.")
        return 1

    try:
        query_config = load_query_config(args.config)
    except ValueError as err:
        print(err)
        return 1

    payload = {"token": TOKEN, **query_config}

    async with httpx.AsyncClient() as client:
        table, games, players = await asyncio.gather(
            post_json(client, "api_json_table.php", API_BASE_URL, payload),
            post_json(client, "api_json_games.php", API_BASE_URL, payload),
            post_json(client, "api_json_top_players.php", API_BASE_URL, payload),
        )

    endpoint_contexts = {
        "table": extract_context(table),
        "games": extract_context(games),
        "players": extract_context(players),
    }
    context_mismatches = find_context_mismatches(endpoint_contexts, query_config)
    if context_mismatches:
        print(f"Warning: API context differs from config: {json.dumps(context_mismatches)}")
        if args.strict_context:
            return 1

    output = {
        "updated_at": datetime.now().isoformat(),
        "team_id": query_config["team_id"],
        "context": {field: query_config[field] for field in CONTEXT_FIELDS},
        "response_contexts": endpoint_contexts,
        "standings": table.get("standings") or [],
        "games": games.get("games") or [],
        "players": players.get("players") or [],
    }

    OUTPUT_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_FILE_PATH.open("w", encoding="utf8") as f:
        json.dump(output, f, indent=2)
        f.write("\n")

    print(f"Wrote {OUTPUT_FILE_PATH}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(asyncio.run(main()))
    except Exception as e:
        print(e)
        exit(1)
