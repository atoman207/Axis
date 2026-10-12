import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const broken = new Set([
  "https://shindanfp.com/",
  "https://www.fandr.jp/",
  "https://www.fleep-webshop.com/",
  "https://www.creocontact.jp/",
  "https://art-art.co.jp/",
  "https://adjust-gunma.com/",
  "https://balnce3.com/",
  "https://www.pref.saga.lg.jp/airport/bsidesaga/",
  "https://www.felissimo.co.jp/ranma/ranma_cha.html",
  "https://www.daie-industry.co.jp/",
  "https://lemansholidays.com/",
  "https://shop.flowershop-ayaka.com/",
  "https://usedbrand-ok.com/",
  "https://www.kigyou-cafe-salon.fants.jp/",
  "https://www.watarukensetsu.net/",
  "https://www.visca.co.jp/",
  "https://www.ad-cast.co.jp/",
  "https://asla.jp/",
  "https://pland-labo.co.jp/",
  "https://shin-ortho.com/lp/",
  "https://www.itagaki-dc.jp/lp/",
  "https://clear-dental.jp/lp/invisalign/",
  "https://araishikaclinic.com/lp/",
  "https://www.kimura-shika-ujina.com/lp/",
  "https://www.ligstyle.com/spec-lp/",
  "https://www.biz.ne.jp/seller/lp02/",
  "https://www.bunmeido.co.jp/",
  "https://www.dms-net.org/",
  "https://shotenkenchiku.com/",
  "https://www.spacemoo.jp/",
  "https://quickbuild.co.jp/ja",
  "https://leverages.jp/",
  "https://developers.figma.com/docs/figma-mcp-server/structure-figma-file/",
  "https://www.s-b-c-biyougeka.net/lp/msd4/",
  "https://www.careermart.co.jp/lp/outsourcing/",
  "https://www.hyalmoist.jp/air/offer3/",
  "https://shinryo-healthcare.com/html/page12.html",
  "https://shashoku-love.jp/",
  "https://www.vegekul.com/lp/cut-yasai/",
  "https://www.tgn.co.jp/cp/lp/yokohama-wedding/",
  "https://cp.glico.com/papico-2024aw/",
  "https://www.dhsaiyo.com/",
]);

const source = readFileSync(join(__dirname, "../data/portfolio.ts"), "utf8");
const categoryBlocks = [
  ...source.matchAll(
    /\{\s*id:\s*"([^"]+)",\s*label:\s*"([^"]+)",\s*stacks:\s*\[([\s\S]*?)\],\s*sites:\s*\[([\s\S]*?)\],\s*\}/g
  ),
];

const categories = categoryBlocks
  .map((match) => {
    const id = match[1];
    const label = match[2];
    const stacks = [...match[3].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    const sites = [...match[4].matchAll(/"(https:\/\/[^"]+)"/g)]
      .map((m) => m[1])
      .filter((site) => !broken.has(site));
    return { id, label, stacks, sites };
  })
  .filter((category) => category.id !== "hugo" && category.sites.length > 0);

const formatCategory = (category) => `  {
    id: "${category.id}",
    label: "${category.label}",
    stacks: [${category.stacks.map((stack) => `"${stack}"`).join(", ")}],
    sites: [
${category.sites.map((site) => `      "${site}",`).join("\n")}
    ],
  }`;

const header = source.split("const rawPortfolioCategories")[0];
const footer = source.split("];\n\nexport function getSiteName")[1];

const updated =
  header +
  "const rawPortfolioCategories: PortfolioCategory[] = [\n" +
  categories.map(formatCategory).join(",\n") +
  "\n];\n\nexport function getSiteName" +
  footer
    .replace(
      /export const OTHER_CATEGORY_IDS = new Set\(\[[\s\S]*?\]\);/,
      `export const OTHER_CATEGORY_IDS = new Set([\n  "ai-lp",\n  "woman",\n  "cloth",\n  "mobile",\n  "teeth",\n  "real-estate",\n  "it-sites",\n  "lp",\n]);`
    )
    .replace(
      /export const SKILL_CATEGORY_IDS = new Set\(\[[\s\S]*?\]\);/,
      () => {
        const skillIds = categories
          .map((c) => c.id)
          .filter((id) =>
            [
              "ai",
              "base",
              "ec-cube",
              "laravel",
              "makeshop",
              "next",
              "php",
              "shopify",
              "studio",
              "threejs",
              "wix",
              "wordpress",
            ].includes(id)
          );
        return `export const SKILL_CATEGORY_IDS = new Set([\n${skillIds.map((id) => `  "${id}",`).join("\n")}\n]);`;
      }
    );

writeFileSync(join(__dirname, "../data/portfolio.ts"), updated);
console.log("Categories:", categories.length);
console.log("Total sites:", categories.reduce((n, c) => n + c.sites.length, 0));
console.log(
  categories.map((c) => `${c.label}: ${c.sites.length}`).join("\n")
);
