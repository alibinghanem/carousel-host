import fs from "fs"; import path from "path";
const idx = JSON.parse(fs.readFileSync("research/projects-index.json","utf8"));
const byFile = new Map(idx.map(r=>[path.basename(r.file), r]));
const dl = JSON.parse(fs.readFileSync("research/downloads.json","utf8"));
const urlToFile = new Map(dl.filter(d=>d.file).map(d=>[d.url,d.file]));
const projects = {};
for (const f of fs.readdirSync("research/pages").filter(f=>/^_units_.+\.json$/.test(f))) {
  const j = JSON.parse(fs.readFileSync("research/pages/"+f,"utf8"));
  const lines = j.text.split("\n").map(s=>s.trim()).filter(Boolean);
  const title = j.title.split("|")[0].trim();
  const projName = (title.match(/[-–] (.+)$/)||[])[1] || "";
  // find "المشروع" style lines
  const i = lines.findIndex(l=>/^مشروع$|المشروع/.test(l));
  const imgFiles = new Set();
  for (const im of j.imgs) { const u=im.src; const f2 = urlToFile.get(u); if (f2 && f2.includes("/projects/")) { const r = byFile.get(path.basename(f2)); if (r) imgFiles.add(r.idx); } }
  projects[f] = { title, projName, sample: lines.slice(8,30).join(" | ").slice(0,300), imgs:[...imgFiles].sort((a,b)=>a-b) };
}
fs.writeFileSync("research/unit-image-map.json", JSON.stringify(projects,null,1));
for (const [k,v] of Object.entries(projects)) console.log(k.slice(7,15), "|", v.title.slice(0,60), "|", v.imgs.join(","));
