#!/usr/bin/env python3
"""
«وضع المصمم»: يصيّر تصميماً حرّاً مكتوباً بـ HTML/CSS إلى شرائح كاروسيل.

    python3 render_html.py design.html ./out

- كل شريحة عنصر <section class="slide"> بمقاس 1080×1920، مرصوصة تحت بعض.
- الخطوط تُحقن تلقائياً (Cairo · Tajawal · Lalezar · IBM Plex Sans Arabic ·
  Readex Pro · JetBrains Mono · Space Grotesk) — تعمل بدون إنترنت.
- {{AVATAR}} داخل الـ HTML يُستبدل بصورة علي المقصوصة.
- المنطقة الآمنة لتيك توك: اترك أعلى 240px وأسفل 450px بلا نص مهم.
"""
import asyncio, base64, pathlib, re, sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))
import render_reel as R

W, H = 1080, 1920
FAMILIES = {"lalezar": "Lalezar", "ibm-plex-sans-arabic": "IBM Plex Sans Arabic",
            "jetbrains-mono": "JetBrains Mono", "readex-pro": "Readex Pro",
            "space-grotesk": "Space Grotesk"}
RANGES = {"arabic": "U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0898-08E1,U+08E3-08FF,"
                    "U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC",
          "latin": "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,"
                   "U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"}


def extra_faces():
    out = []
    for f in sorted((HERE / "fonts" / "extra").glob("*.woff2")):
        m = re.match(r"(.+)-(arabic|latin)-(\d+)-normal", f.stem)
        if not m:
            continue
        fam = FAMILIES.get(m.group(1), m.group(1))
        b64 = base64.b64encode(f.read_bytes()).decode()
        out.append(f"@font-face{{font-family:'{fam}';font-weight:{m.group(3)};font-display:block;"
                   f"src:url(data:font/woff2;base64,{b64}) format('woff2');unicode-range:{RANGES[m.group(2)]}}}")
    return "\n".join(out)


async def main(src, outdir):
    from playwright.async_api import async_playwright
    html = pathlib.Path(src).read_text(encoding="utf-8")
    html = html.replace("{{AVATAR}}", R.avatar_uri() or "")
    faces = f"<style>{R.all_faces()}\n{extra_faces()}</style>"
    html = html.replace("</head>", faces + "</head>", 1)
    outdir = pathlib.Path(outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    for old in outdir.glob("slide_*.jpg"):
        old.unlink()
    launch = dict(args=["--force-color-profile=srgb", "--font-render-hinting=none", "--hide-scrollbars"])
    if R.chromium_path():
        launch["executable_path"] = R.chromium_path()
    async with async_playwright() as pw:
        b = await pw.chromium.launch(**launch)
        page = await b.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        await page.set_content(html, wait_until="load")
        await page.evaluate("document.fonts.ready")
        n = await page.evaluate("document.querySelectorAll('section.slide').length")
        for i in range(n):
            el = page.locator("section.slide").nth(i)
            p = outdir / f"slide_{i+1:02d}.jpg"
            await el.screenshot(path=str(p), type="jpeg", quality=90)
            print(f"  ✓ {p.name}  ({p.stat().st_size // 1024} KB)")
        await b.close()
    if n:
        (outdir / "cover.jpg").write_bytes((outdir / "slide_01.jpg").read_bytes())
    print(f"✓ {n} شريحة في {outdir}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    asyncio.run(main(sys.argv[1], sys.argv[2]))
