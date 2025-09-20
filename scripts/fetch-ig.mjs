// Node 20+ — Fetch latest Instagram media and write /public/ig-latest.json + /public/ig-latest.html

import fs from "node:fs/promises";
import path from "node:path";

const IG_USER_ID = process.env.IG_USER_ID;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;

if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
  console.error("Missing IG_USER_ID or IG_ACCESS_TOKEN env.");
  process.exit(1);
}

const API = "https://graph.instagram.com";

async function jget(url) {
  const res = await fetch(url, { headers: { "Accept": "application/json" }});
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`);
  return res.json();
}

async function getLatest() {
  const url = `${API}/${IG_USER_ID}/media?fields=id,media_type,media_url,thumbnail_url,permalink,timestamp,caption&limit=1&access_token=${IG_ACCESS_TOKEN}`;
  const data = await jget(url);
  if (!data?.data?.length) throw new Error("No media found.");
  let item = data.data[0];

  if (item.media_type === "CAROUSEL_ALBUM") {
    const kids = await jget(`${API}/${item.id}/children?fields=id,media_type,media_url,thumbnail_url&access_token=${IG_ACCESS_TOKEN}`);
    const first = kids?.data?.[0];
    if (first) {
      item = { ...item, media_url: first.media_url ?? item.media_url, thumbnail_url: first.thumbnail_url ?? item.thumbnail_url, _child_media_type: first.media_type };
    }
  }

  return {
    id: item.id,
    permalink: item.permalink,
    media_type: item.media_type,       // IMAGE | VIDEO | CAROUSEL_ALBUM
    media_url: item.media_url || null, // mp4 for VIDEO
    thumbnail_url: item.thumbnail_url || null,
    timestamp: item.timestamp,
    caption: item.caption || ""
  };
}

function htmlEmbed(permalink) {
  return `<!-- generated: do not edit -->
<blockquote class="instagram-media" data-instgrm-permalink="${permalink}" data-instgrm-version="14" style="width:100%;max-width:540px;margin:0 auto;">
  <a href="${permalink}" rel="noopener nofollow" target="_blank">View on Instagram</a>
</blockquote>
<script async src="//www.instagram.com/embed.js"></script>`;
}

(async () => {
  const latest = await getLatest();
  const outDir = path.join(process.cwd(), "public");
  await fs.mkdir(outDir, { recursive: true });

  await fs.writeFile(path.join(outDir, "ig-latest.json"), JSON.stringify(latest, null, 2) + "\n", "utf8");
  await fs.writeFile(path.join(outDir, "ig-latest.html"), htmlEmbed(latest.permalink), "utf8");

  console.log("Wrote public/ig-latest.json and public/ig-latest.html");
})().catch(e => { console.error(e); process.exit(1); });