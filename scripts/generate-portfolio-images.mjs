// Lists the work-list screenshots in public/ so the server can pick one without touching the
// filesystem at runtime. A runtime `existsSync(process.cwd() + "/public/...")` makes Next copy all
// of public/ (300MB+) into the server function, which breaks Vercel/Netlify function size limits.
// Runs before every build (npm "prebuild"); run it by hand after adding screenshots:
//   node scripts/generate-portfolio-images.mjs
import { existsSync, readdirSync, writeFileSync } from "node:fs";

const OUT = "lib/portfolio/local-images.json";

const pngs = (dir) => {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".png"))
    .map((entry) => entry.name)
    .sort();
};

const manifest = { sites: pngs("public/sites"), root: pngs("public") };
writeFileSync(OUT, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`${OUT}: ${manifest.sites.length} in public/sites, ${manifest.root.length} in public/`);
