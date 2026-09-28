import sharp from "sharp"; import fs from "fs";
const rows = JSON.parse(fs.readFileSync("research/downloads.json", "utf8")).filter(r => r.file);
const out = [];
for (const r of rows) {
  try { const m = await sharp(r.file, { animated: false }).metadata(); out.push({ ...r, w: m.width, h: m.height, fmt: m.format, kb: Math.round(fs.statSync(r.file).size / 1024) }); }
  catch (e) { out.push({ ...r, w: 0, h: 0, fmt: "?" }); }
}
fs.writeFileSync("research/assets.json", JSON.stringify(out, null, 1));
const big = out.filter(o => o.w >= 1600).length, mid = out.filter(o => o.w >= 1000 && o.w < 1600).length, small = out.filter(o => o.w < 1000).length;
console.log({ total: out.length, ">=1600": big, "1000-1599": mid, "<1000": small });
console.log(out.filter(o => !o.file.includes("projects")).map(o => `${o.file} ${o.w}x${o.h} ${o.fmt} ${o.kb}KB`).join("\n"));
