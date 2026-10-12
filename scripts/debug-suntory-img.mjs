const UA = "Mozilla/5.0 (compatible; AXIS/1.0)";
const r = await fetch("https://www.suntory.co.jp/", { headers: { "User-Agent": UA } });
const html = await r.text();
const samples = [...html.matchAll(/<img[^>]{0,200}>/gi)].slice(0, 5);
for (const s of samples) console.log(s[0]);
