import { createRequire } from "module";
const require = createRequire("/opt/node22/lib/node_modules/");
const { chromium } = require("playwright");
import fs from "fs";

const ORIGIN = "https://mrajhi.com.sa";
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ["--no-sandbox", "--ignore-certificate-errors-spki-list=" + fs.readFileSync("/tmp/claude-0/spki.txt","utf8").trim()], proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "ar-SA" });
const seen = new Set();
const queue = [ORIGIN + "/"];
const pages = {};
const imgs = new Map(); // url -> {pages:Set, kinds:Set}
const addImg = (u, page, kind) => {
  if (!u || u.startsWith("data:")) return;
  try { u = new URL(u, ORIGIN).href; } catch { return; }
  if (!imgs.has(u)) imgs.set(u, { pages: new Set(), kinds: new Set() });
  imgs.get(u).pages.add(page); imgs.get(u).kinds.add(kind);
};
fs.mkdirSync("research/pages", { recursive: true });
while (queue.length && seen.size < 60) {
  const url = queue.shift().split("#")[0];
  if (seen.has(url)) continue;
  seen.add(url);
  const page = await ctx.newPage();
  page.on("response", (r) => { const ct = r.headers()["content-type"] || ""; if (ct.startsWith("image/")) addImg(r.url(), url, "network"); });
  try {
    const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    // scroll to trigger lazy loading
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); } window.scrollTo(0,0); });
    await page.waitForTimeout(1200);
    const data = await page.evaluate(() => {
      const out = { title: document.title, links: [], imgs: [], text: document.body.innerText, meta: {}, svgs: 0 };
      document.querySelectorAll("a[href]").forEach(a => out.links.push({ href: a.href, text: a.innerText.trim().slice(0, 80) }));
      document.querySelectorAll("img").forEach(i => out.imgs.push({ src: i.currentSrc || i.src, srcset: i.srcset, dsrc: i.dataset.src, alt: i.alt, w: i.naturalWidth, h: i.naturalHeight }));
      document.querySelectorAll("*").forEach(e => { const bg = getComputedStyle(e).backgroundImage; if (bg && bg.includes("url(")) [...bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)].forEach(m => out.imgs.push({ src: m[1], alt: "bg", w: 0, h: 0 })); });
      out.svgs = document.querySelectorAll("svg").length;
      document.querySelectorAll("meta").forEach(m => { const k = m.getAttribute("property") || m.getAttribute("name"); if (k) out.meta[k] = m.content; });
      out.icons = [...document.querySelectorAll("link[rel*=icon]")].map(l => l.href);
      return out;
    });
    const slug = new URL(url).pathname.replace(/\W+/g, "_") || "home";
    fs.writeFileSync(`research/pages/${slug}.json`, JSON.stringify({ url, status: resp?.status(), ...data }, null, 2));
    fs.writeFileSync(`research/pages/${slug}.html`, await page.content());
    await page.screenshot({ path: `research/pages/${slug}.png`, fullPage: false });
    pages[url] = { status: resp?.status(), title: data.title, links: data.links.length, imgs: data.imgs.length };
    data.imgs.forEach(i => { addImg(i.src, url, "img"); (i.srcset || "").split(",").forEach(s => addImg(s.trim().split(" ")[0], url, "srcset")); addImg(i.dsrc, url, "data-src"); });
    data.icons.forEach(i => addImg(i, url, "icon"));
    Object.entries(data.meta).forEach(([k, v]) => { if (/image/.test(k)) addImg(v, url, "meta"); });
    for (const l of data.links) {
      try { const u = new URL(l.href); if (u.origin === ORIGIN && !/\.(png|jpe?g|pdf|svg|webp)$/i.test(u.pathname)) { u.hash = ""; const s = u.href; if (!seen.has(s) && !queue.includes(s)) queue.push(s); } } catch {}
    }
  } catch (e) { pages[url] = { error: String(e).slice(0, 200) }; }
  await page.close();
}
fs.writeFileSync("research/crawl-summary.json", JSON.stringify({ pages, images: [...imgs].map(([u, v]) => ({ url: u, pages: [...v.pages], kinds: [...v.kinds] })) }, null, 2));
console.log(Object.keys(pages).length, "pages;", imgs.size, "images");
await browser.close();
