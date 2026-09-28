// usage: node scripts/stills.mjs "L-01-Hook:10,30,60" "L-02-Aspiration:40,120"  (frames are local to the composition)
import { bundle } from "@remotion/bundler"; import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path";
const jobs = process.argv.slice(2).map(a => { const [id, fr] = a.split(":"); return { id, frames: fr.split(",").map(Number) }; });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
for (const { id, frames } of jobs) {
  const comp = await selectComposition({ serveUrl, id, chromiumOptions: { gl: "angle" } });
  for (const frame of frames) {
    const output = `out/stills/${id}_${String(frame).padStart(4, "0")}.jpg`;
    await renderStill({ composition: comp, serveUrl, frame, output, imageFormat: "jpeg", jpegQuality: 88, chromiumOptions: { gl: "angle" }, timeoutInMilliseconds: 120000 });
    console.log("still", output);
  }
}
