import datetime
import os
import sys

import pandas as pd
import requests

# --- CONFIGURATION ---
API_TOKEN = os.environ.get("VEREINSPLANER_API_TOKEN")
if not API_TOKEN:
    raise RuntimeError("Missing VEREINSPLANER_API_TOKEN environment variable.")

url = os.environ.get("VEREINSPLANER_API_URL")
if not url:
    raise RuntimeError("Missing VEREINSPLANER_API_URL environment variable.")

today = datetime.date.today().strftime("%Y-%m-%d")
params = {
    "start": "2025-09-01",
    "end": today,
    # "category_ids": 24507 # category for training sessions
}

headers = {
    "accept": "application/json",
    "X-Auth-Token": API_TOKEN,
}

# The frontend (js/inline-scripts.js) reads this exact path.
OUT_PATH = "public/202526_season/gold/202526_attendance_report.csv"


def main() -> int:
    print(f"Fetching data from {params['start']} to {params['end']}...")

    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    json_data = response.json()

    # Locate the list of users inside the JSON structure.
    user_stats_list = []
    if "data" in json_data and "user_statistics" in json_data["data"]:
        user_stats_list = json_data["data"]["user_statistics"]
    elif isinstance(json_data, list):
        user_stats_list = json_data
    else:
        print("Standard path 'data.user_statistics' not found. Searching...")
        for value in json_data.values():
            if isinstance(value, list):
                user_stats_list = value
                break

    if not user_stats_list:
        print("Error: Could not find user statistics list in response.")
        return 1

    df = pd.DataFrame(user_stats_list)
    if "first_name" in df.columns and "last_name" in df.columns:
        df["name"] = df["first_name"] + " " + df["last_name"]
    else:
        df["name"] = "Unknown Name"

    final_df = df[["name", "attendance_count", "attendance_in_percent"]].copy()
    final_df = final_df.sort_values(by="attendance_count", ascending=False)

    print("\n--- Processed Data ---")
    print(final_df.to_string(index=False))

    final_df.to_csv(OUT_PATH, index=False)
    print(f"Saved to {OUT_PATH}")
    return 0


if __name__ == "__main__":
    # Let exceptions propagate: a swallowed error used to leave the workflow
    # green with no data committed.
    sys.exit(main())
