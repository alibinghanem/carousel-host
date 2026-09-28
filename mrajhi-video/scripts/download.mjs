import fs from "fs"; import path from "path"; import { execFileSync } from "child_process";
const s = JSON.parse(fs.readFileSync("research/crawl-summary.json", "utf8"));
const urls = new Set();
for (const i of s.images) {
  let u = i.url;
  if (/google|gstatic/.test(u)) continue;
  if (u.includes("/_next/image")) { const raw = new URL(u).searchParams.get("url"); u = raw.startsWith("http") ? raw : "https://mrajhi.com.sa" + raw; } // strip resize wrapper
  if (/\/(800|600|1200|630)$/.test(u) || /mrajhi\.com\.sa\/[^/]*%/.test(u)) continue; // og meta artefacts / page slugs
  urls.add(u.split("?")[0] === u ? u : u); 
}
const list = [...urls];
console.log(list.length, "unique urls");
const dest = (u) => {
  const x = new URL(u); const base = decodeURIComponent(path.basename(x.pathname));
  if (x.host.includes("supabase")) { const seg = x.pathname.split("/"); const id = seg[seg.indexOf("units") + 1].slice(0, 8); return `public/assets/projects/${id}_${base}`; }
  if (/logo|icon|favicon/.test(x.pathname)) return `public/assets/logo/${base}`;
  if (/why-us/.test(x.pathname)) return `public/assets/services/${base}`;
  return `public/assets/misc/${base}`;
};
const rows = [];
for (const u of list) {
  const d = dest(u); fs.mkdirSync(path.dirname(d), { recursive: true });
  try { execFileSync("curl", ["-sSfL", "--retry", "3", "-A", "Mozilla/5.0", "-o", d, u]); rows.push({ url: u, file: d }); } catch (e) { rows.push({ url: u, file: null, err: String(e.message).slice(0, 80) }); }
}
fs.writeFileSync("research/downloads.json", JSON.stringify(rows, null, 1));
console.log("ok", rows.filter(r => r.file).length, "failed", rows.filter(r => !r.file).length);
