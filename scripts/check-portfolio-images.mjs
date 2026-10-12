import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const USER_AGENT = "Mozilla/5.0 (compatible; AXIS/1.0)";

function resolveUrl(imageUrl, pageUrl) {
  try {
    return new URL(imageUrl.trim(), pageUrl).href;
  } catch {
    return null;
  }
}

function extractMetaContent(html, key) {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

async function findHero(pageUrl) {
  try {
    const response = await fetch(pageUrl, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return null;
    const html = await response.text();
    for (const key of [
      "og:image",
      "og:image:url",
      "twitter:image",
      "twitter:image:src",
    ]) {
      const content = extractMetaContent(html, key);
      const imageUrl = content ? resolveUrl(content, pageUrl) : null;
      if (imageUrl) return imageUrl;
    }
    return null;
  } catch {
    return null;
  }
}

async function canProxyImage(imageUrl, pageUrl) {
  try {
    const parsed = new URL(imageUrl);
    const response = await fetch(parsed.href, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "image/*,*/*",
        Referer: `${new URL(pageUrl).protocol}//${new URL(pageUrl).host}/`,
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return false;
    const ct = response.headers.get("content-type") || "";
    const buf = await response.arrayBuffer();
    return buf.byteLength > 1000 && ct.includes("image");
  } catch {
    return false;
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const portfolioSource = readFileSync(
  join(__dirname, "../data/portfolio.ts"),
  "utf8"
);
const sites = [...new Set(portfolioSource.match(/https:\/\/[^"\s]+/g) ?? [])];

const working = [];
const broken = [];

for (const site of sites) {
  const imageUrl = await findHero(site);
  const ok = imageUrl ? await canProxyImage(imageUrl, site) : false;
  (ok ? working : broken).push(site);
  console.log(`${ok ? "OK" : "FAIL"} ${site}`);
}

console.log("\nWORKING:", working.length);
console.log("BROKEN:", broken.length);
console.log("\nBROKEN_JSON_START");
console.log(JSON.stringify(broken, null, 2));
console.log("BROKEN_JSON_END");
