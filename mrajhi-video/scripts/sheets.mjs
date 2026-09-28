import sharp from "sharp"; import fs from "fs";
const rows = JSON.parse(fs.readFileSync("research/assets.json","utf8")).filter(r=>r.file.includes("/projects/"));
rows.forEach((r,i)=>r.idx=i);
fs.writeFileSync("research/projects-index.json", JSON.stringify(rows.map(r=>({idx:r.idx,file:r.file,w:r.w,h:r.h})),null,1));
const W=300,H=200,COLS=6,PER=30;
for(let s=0;s*PER<rows.length;s++){
  const chunk=rows.slice(s*PER,(s+1)*PER);
  const comps=[];
  for(let k=0;k<chunk.length;k++){
    const r=chunk[k]; const x=(k%COLS)*W, y=Math.floor(k/COLS)*H;
    const t=await sharp(r.file).rotate().resize(W-4,H-4,{fit:"cover"}).jpeg({quality:70}).toBuffer();
    comps.push({input:t,left:x+2,top:y+2});
    const svg=`<svg width="${W}" height="${H}"><rect x="6" y="6" width="60" height="26" rx="4" fill="#000a"/><text x="14" y="26" font-size="20" fill="#fff" font-family="DejaVu Sans, sans-serif">${r.idx}</text></svg>`;
    comps.push({input:Buffer.from(svg),left:x,top:y});
  }
  const rowsN=Math.ceil(chunk.length/COLS);
  await sharp({create:{width:W*COLS,height:H*rowsN,channels:3,background:"#111"}}).composite(comps).jpeg({quality:72}).toFile(`research/sheets/sheet${s}.jpg`);
}
console.log(rows.length,"images ->",Math.ceil(rows.length/PER),"sheets");
