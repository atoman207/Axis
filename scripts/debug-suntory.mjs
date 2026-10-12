const UA = "Mozilla/5.0 (compatible; AXIS/1.0)";
const r = await fetch("https://www.suntory.co.jp/", { headers: { "User-Agent": UA } });
const html = await r.text();
const og = html.match(/property=["']og:image["'][^>]+content=["']([^"']+)/i);
console.log("og", og?.[1]);
const imgs = [...html.matchAll(/<img[^>]+src=["']([^"']+)/gi)].slice(0, 20).map((m) => m[1]);
console.log("imgs", imgs);
const bg = [...html.matchAll(/background(?:-image)?[^;]*url\(([^)]+)\)/gi)]
  .slice(0, 10)
  .map((m) => m[1]);
console.log("bg", bg);
