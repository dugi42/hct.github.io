# Python 3.12+ — Fetch Hockey Report stats and write /public/hcstats.json
import asyncio
import json
import os
from datetime import datetime
import httpx

TOKEN = os.environ.get("HC_REPORT_TOKEN")
TEAM_ID_RAW = os.environ.get("HC_REPORT_TEAM_ID")
SEASON_ID_RAW = os.environ.get("HC_REPORT_SEASON_ID")
PHASE_ID_RAW = os.environ.get("HC_REPORT_PHASE_ID")

if not TOKEN or not TEAM_ID_RAW:
    print("Missing required envs: HC_REPORT_TOKEN, HC_REPORT_TEAM_ID.")
    exit(1)

try:
    TEAM_ID = int(TEAM_ID_RAW)
except (ValueError, TypeError):
    print("HC_REPORT_TEAM_ID must be a valid number.")
    exit(1)

SEASON_ID = None
if SEASON_ID_RAW:
    try:
        SEASON_ID = int(SEASON_ID_RAW)
    except (ValueError, TypeError):
        print("HC_REPORT_SEASON_ID must be a valid number.")
        exit(1)

PHASE_ID = None
if PHASE_ID_RAW:
    try:
        PHASE_ID = int(PHASE_ID_RAW)
    except (ValueError, TypeError):
        print("HC_REPORT_PHASE_ID must be a valid number.")
        exit(1)

API = "https://hockey-report.eu/api"
payload = {"token": TOKEN, "team_id": TEAM_ID}

if SEASON_ID is not None:
    payload["season_id"] = SEASON_ID
if PHASE_ID is not None:
    payload["phase_id"] = PHASE_ID


async def post_json(client, endpoint):
    res = await client.post(
        f"{API}/{endpoint}",
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
    async with httpx.AsyncClient() as client:
        table, games, players = await asyncio.gather(
            post_json(client, "api_json_table.php"),
            post_json(client, "api_json_games.php"),
            post_json(client, "api_json_top_players.php"),
        )

    output = {
        "updated_at": datetime.now().isoformat(),
        "team_id": TEAM_ID,
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


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        print(e)
        exit(1)
