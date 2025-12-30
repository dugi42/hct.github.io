// Node 20+ — Fetch Hockey Report stats and write /public/hcstats.json

import fs from "node:fs/promises";
import path from "node:path";

const TOKEN = process.env.HC_REPORT_TOKEN;
const TEAM_ID_RAW = process.env.HC_REPORT_TEAM_ID;
const SEASON_ID_RAW = process.env.HC_REPORT_SEASON_ID;
const PHASE_ID_RAW = process.env.HC_REPORT_PHASE_ID;

if (!TOKEN || !TEAM_ID_RAW) {
  console.error("Missing required envs: HC_REPORT_TOKEN, HC_REPORT_TEAM_ID.");
  process.exit(1);
}

const TEAM_ID = Number(TEAM_ID_RAW);
if (!Number.isFinite(TEAM_ID)) {
  console.error("HC_REPORT_TEAM_ID must be a valid number.");
  process.exit(1);
}

const SEASON_ID = SEASON_ID_RAW ? Number(SEASON_ID_RAW) : undefined;
if (SEASON_ID_RAW && !Number.isFinite(SEASON_ID)) {
  console.error("HC_REPORT_SEASON_ID must be a valid number.");
  process.exit(1);
}

const PHASE_ID = PHASE_ID_RAW ? Number(PHASE_ID_RAW) : undefined;
if (PHASE_ID_RAW && !Number.isFinite(PHASE_ID)) {
  console.error("HC_REPORT_PHASE_ID must be a valid number.");
  process.exit(1);
}

const API = "https://hockey-report.eu/api";
const payload = { token: TOKEN, team_id: TEAM_ID };

if (SEASON_ID !== undefined) payload.season_id = SEASON_ID;
if (PHASE_ID !== undefined) payload.phase_id = PHASE_ID;

async function postJson(endpoint) {
  const res = await fetch(`${API}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${endpoint}: ${res.status} ${res.statusText} - ${text}`);
  }
  const data = JSON.parse(text);
  if (data && data.error) {
    throw new Error(`${endpoint}: ${data.error}`);
  }
  return data;
}

(async () => {
  const [table, games, players] = await Promise.all([
    postJson("api_json_table.php"),
    postJson("api_json_games.php"),
    postJson("api_json_top_players.php")
  ]);

  const output = {
    updated_at: new Date().toISOString(),
    team_id: TEAM_ID,
    context: table?.context || games?.context || players?.context || {},
    standings: table?.standings || [],
    games: games?.games || [],
    players: players?.players || []
  };

  const outDir = path.join(process.cwd(), "public");
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, "hcstats.json"), JSON.stringify(output, null, 2) + "\n", "utf8");

  console.log("Wrote public/hcstats.json");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
