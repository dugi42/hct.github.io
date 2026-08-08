import os
import json
import datetime
import requests
import pandas as pd

# --- CONFIGURATION ---
API_TOKEN = os.environ.get("VEREINSPLANER_API_TOKEN")
if not API_TOKEN:
    raise RuntimeError("Missing VEREINSPLANER_API_TOKEN environment variable.")

BASE_URL = "https://api.vereinsplaner.at/v1/admin/group/radteam-g-w4w295/events/analysis"
today = datetime.date.today().strftime("%Y-%m-%d")
params = {
    "start": "2026-01-01",
    "end": today,
    "category_ids": "24864,24699",
}
headers = {
    "accept": "application/json",
    "X-Auth-Token": API_TOKEN,
}

RAW_PATH  = "public/202526_season/raw/202526_bike_attendance.json"
GOLD_PATH = "public/202526_season/gold/202526_top_bikers.csv"
TOP_N = 15

# --- MAIN ---
print(f"Fetching bike attendance from {params['start']} to {params['end']}...")
response = requests.get(BASE_URL, headers=headers, params=params)
response.raise_for_status()

json_data = response.json()

# Save raw JSON
with open(RAW_PATH, "w", encoding="utf-8") as f:
    json.dump(json_data, f, ensure_ascii=False, indent=2)
print(f"Raw JSON saved to {RAW_PATH}")

# Extract user statistics
user_stats = json_data.get("data", {}).get("user_statistics", [])
if not user_stats:
    raise RuntimeError("No user_statistics found in API response.")

df = pd.DataFrame(user_stats)
df["name"] = df["first_name"].str.strip() + " " + df["last_name"].str.strip()
df = df[df["attendance_count"] > 0].copy()
df = df.sort_values(
    by=["attendance_count", "attendance_in_percent"],
    ascending=[False, False],
)
top = df[["name", "attendance_count", "attendance_in_percent"]].head(TOP_N).reset_index(drop=True)

top.to_csv(GOLD_PATH, index=False)
print(f"Top-{TOP_N} CSV saved to {GOLD_PATH}")
print(top.to_string(index=False))
