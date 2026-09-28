import fs from "fs";
const rows = JSON.parse(fs.readFileSync("research/assets.json","utf8"));
const seen = new Set();
let md = `# Assets log\n\nAll files downloaded from https://mrajhi.com.sa (authorized by the client). Project photos come from the site's Supabase public bucket (original uploads, no resize wrapper). \`/_next/image?url=…\` wrappers were stripped to fetch originals.\n\nProject photo index → \`research/projects-index.json\` (idx → file). Unit→photos → \`research/unit-image-map.json\`. Contact sheets → \`research/sheets/\`.\n\n| File | Resolution | Format | Size | Source URL |\n|---|---|---|---|---|\n`;
for (const r of rows) { if (seen.has(r.file)) continue; seen.add(r.file); md += `| ${r.file.replace("public/","")} | ${r.w}×${r.h} | ${r.fmt} | ${r.kb} KB | ${r.url} |\n`; }
md += `\n## Derived\n- \`public/assets/logo/logo-traced.svg\` and \`src/generated/logo-paths.ts\`: vector trace of \`logo.jpg\` (no SVG logo exists on the site). Colors sampled from the raster: gold #DCA50D, charcoal #38393D. Not recolored.\n`;
fs.writeFileSync("research/assets.md", md); console.log(seen.size, "rows");
