import {
  findSiteHeroImages,
  getWordpressScreenshotUrl,
  resolveMicrolinkScreenshot,
} from "../lib/site-hero.ts";

const pageUrl = "https://www.suntory.co.jp/";

console.log("microlink start");
const microlink = await resolveMicrolinkScreenshot(pageUrl);
console.log("microlink done", !!microlink);

console.log("html fetch start");
const response = await fetch(pageUrl, {
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; AXIS/1.0)",
    Accept: "text/html,application/xhtml+xml",
  },
  signal: AbortSignal.timeout(12000),
  next: { revalidate: 86400 },
});
console.log("html status", response.status, response.ok);
const html = await response.text();
console.log("html length", html.length);

const all = await findSiteHeroImages(pageUrl);
console.log("all candidates", all.length, all.slice(0, 5));
