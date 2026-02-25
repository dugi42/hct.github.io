# Python 3.12+ - Fetch Hockey Report stats and write /public/hcstats.json
import argparse
import asyncio
import json
import os
from datetime import datetime
from pathlib import Path

import httpx
from dotenv import load_dotenv

load_dotenv()

API_BASE_URL = os.environ.get("HC_REPORT_API_URL")
TOKEN = os.environ.get("HC_REPORT_TOKEN")
DEFAULT_CONFIG_PATH = Path(__file__).resolve().parent / "config_season.json"
REQUIRED_QUERY_FIELDS = ("team_id", "league_id", "division_id", "season_id", "phase_id")


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


async def post_json(client, endpoint, api_base_url, payload):
    res = await client.post(
        f"{api_base_url}/{endpoint}",
        json=payload,
        headers={"Content-Type": "application/json"},
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

    output = {
        "updated_at": datetime.now().isoformat(),
        "team_id": query_config["team_id"],
        "context": table.get("context")
        or games.get("context")
        or players.get("context")
        or {},
        "standings": table.get("standings") or [],
        "games": games.get("games") or [],
        "players": players.get("players") or [],
    }

    out_dir = os.path.join(os.getcwd(), "public")
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "hcstats.json"), "w", encoding="utf8") as f:
        json.dump(output, f, indent=2)
        f.write("\n")

    print("Wrote public/hcstats.json")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(asyncio.run(main()))
    except Exception as e:
        print(e)
        exit(1)
