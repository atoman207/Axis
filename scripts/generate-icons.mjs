// Rebuilds the favicon / app icons from the logo: node scripts/generate-icons.mjs
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const SOURCE = "public/propile_avatar.png";
// the logo's own ground colour, used to square it off
const GROUND = { r: 0, g: 4, b: 14, alpha: 1 };
// the mark without the wordmark under it — small icons can't carry the lettering
const MARK = { left: 30, top: 8, width: 370, height: 276 };

const square = (size, region) => {
  const image = region ? sharp(SOURCE).extract(region) : sharp(SOURCE);
  // PNGs inside an .ico must stay RGBA, so the alpha channel is kept after flattening
  return image.resize(size, size, { fit: "contain", background: GROUND }).flatten({ background: GROUND }).ensureAlpha().png();
};

// An .ico is a small directory followed by the images; PNG payloads are valid in it.
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

await square(512).toFile("app/icon.png");
await square(180).toFile("app/apple-icon.png");
await square(512).toFile("public/favicon.png");
await square(180).toFile("public/apple-touch-icon.png");

const icoImages = await Promise.all(
  [16, 32, 48].map(async (size) => ({ size, data: await square(size, MARK).toBuffer() }))
);
writeFileSync("app/favicon.ico", buildIco(icoImages));

console.log("icons written");
