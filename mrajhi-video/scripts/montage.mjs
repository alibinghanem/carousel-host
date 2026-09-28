// usage: node scripts/montage.mjs out/sheet.jpg cols file1 file2 ...
import sharp from "sharp";
const [out, cols, ...files] = process.argv.slice(2);
const C = Number(cols); const meta = await sharp(files[0]).metadata();
const portrait = meta.height > meta.width;
const W = portrait ? 540 : 960, H = portrait ? 960 : 540;
const comps = [];
for (let i = 0; i < files.length; i++) {
  comps.push({ input: await sharp(files[i]).resize(W, H).jpeg({ quality: 82 }).toBuffer(), left: (i % C) * W, top: Math.floor(i / C) * H });
  const label = files[i].split("/").pop().replace(".jpg", "");
  comps.push({ input: Buffer.from(`<svg width="${W}" height="40"><rect width="${W}" height="40" fill="#000c"/><text x="10" y="27" font-size="20" fill="#fff" font-family="DejaVu Sans">${label}</text></svg>`), left: (i % C) * W, top: Math.floor(i / C) * H });
}
await sharp({ create: { width: W * C, height: H * Math.ceil(files.length / C), channels: 3, background: "#000" } }).composite(comps).jpeg({ quality: 84 }).toFile(out);
