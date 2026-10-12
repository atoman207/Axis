import { findSiteHeroImages } from "../lib/site-hero.ts";

const pageUrl = "https://www.suntory.co.jp/";
const r = await fetch(pageUrl, {
  headers: { "User-Agent": "Mozilla/5.0 (compatible; AXIS/1.0)" },
});
const html = await r.text();

const imgs = [
  ...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi),
].map((m) => {
  try {
    return new URL(m[1], pageUrl).href;
  } catch {
    return null;
  }
}).filter(Boolean);

console.log("manual extract", imgs.length);
console.log("hero imgs", imgs.filter((u) => u.includes("hero")).slice(0, 5));
console.log("findSiteHeroImages", await findSiteHeroImages(pageUrl));
