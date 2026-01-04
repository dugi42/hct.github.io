import os
import datetime
import requests
import pandas as pd

# --- CONFIGURATION ---
API_TOKEN = os.environ.get("VEREINSPLANER_API_TOKEN")
if not API_TOKEN:
    raise RuntimeError("Missing VEREINSPLANER_API_TOKEN environment variable.")

# The URL and date parameters (Sept 1, 2025 to today)
url = os.environ.get("VEREINSPLANER_API_URL")
if not url:
    raise RuntimeError("Missing VEREINSPLANER_API_URL environment variable.")
today = datetime.date.today().strftime("%Y-%m-%d")
params = {
    "start": "2025-09-01",
    "end": today,
    "category_ids": 24507 # category for training sessions
}

headers = {
    "accept": "application/json",
    "X-Auth-Token": API_TOKEN
}

# --- MAIN SCRIPT ---
try:
    print(f"Fetching data from {params['start']} to {params['end']}...")
    
    # 1. Make the API Request
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status() # Check for valid connection (200 OK)

    # 2. Parse the JSON response
    # The API returns a dictionary structure. Based on your data, 
    # the relevant stats are likely nested under ['data']['user_statistics']
    json_data = response.json()
    
    # Safety check to locate the list of users inside the JSON structure
    user_stats_list = []
    
    if 'data' in json_data and 'user_statistics' in json_data['data']:
        # Standard structure found
        user_stats_list = json_data['data']['user_statistics']
    elif isinstance(json_data, list):
        # Fallback if the API returns a flat list
        user_stats_list = json_data
    else:
        # Fallback: Try to find any key that holds a list
        print("Standard path 'data.user_statistics' not found. Searching...")
        for key, value in json_data.items():
            if isinstance(value, list):
                user_stats_list = value
                break
    
    if not user_stats_list:
        print("Error: Could not find user statistics list in response.")
    else:
        # 3. Convert to DataFrame
        df = pd.DataFrame(user_stats_list)

        # 4. Data Cleaning
        # Create 'name' by combining First and Last names
        if 'first_name' in df.columns and 'last_name' in df.columns:
            df['name'] = df['first_name'] + " " + df['last_name']
        else:
            df['name'] = "Unknown Name"

        # Select only the specific columns you wanted
        # We use .get() to avoid errors if a column is missing
        cols_to_keep = ['name', 'attendance_count', 'attendance_in_percent']
        final_df = df[cols_to_keep].copy()
        
        # Sort by 'attendance_count' in descending order (highest first)
        final_df = final_df.sort_values(by='attendance_count', ascending=False)

        # 5. Display and Save
        print("\n--- Processed Data ---")
        print(final_df.to_string(index=False))
        
        # Optional: Save to Excel or CSV
        # final_df.to_excel("attendance_report.xlsx", index=False)
        final_df.to_csv("public/attendance_report.csv", index=False)

except requests.exceptions.HTTPError as err:
    print(f"HTTP Error: {err}")
except Exception as e:
    print(f"An error occurred: {e}")
