#!/usr/bin/env python3
"""
«وضع المصمم»: يصيّر تصميماً حرّاً مكتوباً بـ HTML/CSS إلى شرائح كاروسيل.

    python3 render_html.py design.html ./out

- كل شريحة عنصر <section class="slide"> بمقاس 1080×1920، مرصوصة تحت بعض.
- الخطوط تُحقن تلقائياً (Cairo · Tajawal · Lalezar · IBM Plex Sans Arabic ·
  Readex Pro · JetBrains Mono · Space Grotesk) — تعمل بدون إنترنت.
- {{AVATAR}} ← صورة علي المقصوصة (data URI يوضع في src).
- {{HANDLES}} ← حسابي تيك توك وانستقرام بأيقوناتهما (تنسّقهما أنت بحاوية).
- الحسابان في **كل شريحة**: أي شريحة ما فيها {{HANDLES}} يُضاف لها شريط صغير تلقائياً
  عند y=1412 (آخر المنطقة الآمنة). خلّ محتوى الشرائح ينتهي قبل 1400.
  data-hpos="1300" على الـ section يغيّر مكانه · data-handles="light" شريط فاتح للخلفيات الداكنة جداً
  · data-handles="off" يلغيه. المولّد يحذّر لو الشريط غطّى أي نص.
- صور محلية: <img src="assets/x.jpg"> أو url('assets/x.jpg') بمسار نسبي لملف
  الـ HTML — تُضمَّن تلقائياً. نزّل الصور أولاً إلى $D/assets/ (Unsplash/Pexels).
- المنطقة الآمنة لتيك توك: لا نص في أعلى 240px ولا أسفل آخر 450px.
  المولّد يفحص كل نص ويطبع تحذيراً لأي نص يتجاوزها أو يطلع خارج الإطار.
  عنصر زخرفي مقصود خارجها؟ أضف له data-safe="ignore".
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


SAFE_TOP, SAFE_BOTTOM = 240, H - 450

CHECK_JS = """([top, bottom]) => {
  const out = [];
  document.querySelectorAll('section.slide').forEach((sl, i) => {
    const r0 = sl.getBoundingClientRect();
    const w = document.createTreeWalker(sl, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      const t = n.textContent.trim();
      if (!t || n.parentElement.closest('[data-safe="ignore"]')) continue;
      const st = getComputedStyle(n.parentElement);
      if (st.visibility === 'hidden' || +st.opacity === 0) continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      for (const b of rg.getClientRects()) {
        const y0 = b.top - r0.top, y1 = b.bottom - r0.top, x0 = b.left - r0.left, x1 = b.right - r0.left;
        let why = '';
        if (x0 < -1 || x1 > 1081) why = 'خارج الإطار أفقياً';
        else if (y0 < top) why = 'داخل أعلى ' + top + 'px';
        else if (y1 > bottom) why = 'تحت ' + bottom + 'px (واجهة تيك توك)';
        if (why) { out.push({slide: i + 1, text: t.slice(0, 40), why}); break; }
      }
    }
  });
  return out;
}"""


MIME = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
        ".webp": "image/webp", ".svg": "image/svg+xml", ".gif": "image/gif"}


def inline_local(html, base):
    """يحوّل مسارات الصور النسبية إلى data URI (الصفحة تُحمَّل بدون مسار ملف)."""
    def sub(m):
        ref = m.group(2)
        f = (base / ref).resolve()
        if ref.startswith(("data:", "http:", "https:", "{{")) or not f.is_file():
            return m.group(0)
        uri = f"data:{MIME.get(f.suffix.lower(), 'application/octet-stream')};base64," \
              + base64.b64encode(f.read_bytes()).decode()
        return m.group(1) + uri + m.group(3)
    html = re.sub(r'(src=")([^"]+)(")', sub, html)
    return re.sub(r"""(url\(['"]?)([^'")]+)(['"]?\))""", sub, html)


AUTO_JS = """([hh]) => {
  const out = [];
  document.querySelectorAll('section.slide').forEach((sl, i) => {
    if (sl.querySelector('.hf-so') || sl.dataset.handles === 'off') return;
    const d = document.createElement('div');
    d.className = 'hf-auto' + (sl.dataset.handles === 'light' ? ' hf-light' : '');
    d.style.top = (sl.dataset.hpos || 1412) + 'px';
    d.setAttribute('data-safe', 'ignore');
    d.innerHTML = hh; sl.appendChild(d);
    const r = d.getBoundingClientRect();
    const w = document.createTreeWalker(sl, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) {
      if (!n.textContent.trim() || d.contains(n)) continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      for (const b of rg.getClientRects()) {
        if (b.right > r.left && b.left < r.right && b.bottom > r.top && b.top < r.bottom) {
          out.push({slide: i + 1, text: n.textContent.trim().slice(0, 40)}); break; }
      }
    }
  });
  return out;
}"""


def handles_html():
    return "".join(f'<span class="hf-so">{ic}<b>{h}</b></span>'
                   for ic, h in ((R.TT_ICON, "@ali_altamimy_tech"), (R.IG_ICON, R.INSTA)))


async def main(src, outdir):
    from playwright.async_api import async_playwright
    html = pathlib.Path(src).read_text(encoding="utf-8")
    html = inline_local(html, pathlib.Path(src).parent)
    html = html.replace("{{AVATAR}}", R.avatar_uri() or "").replace("{{HANDLES}}", handles_html())
    base = (".hf-so{display:inline-flex;align-items:center;gap:.4em;direction:ltr;unicode-bidi:isolate;"
            "white-space:nowrap}.hf-so svg{width:1em;height:1em;flex:none}.hf-so b{font-weight:inherit}"
            ".hf-auto{position:absolute;left:50%;transform:translateX(-50%);display:flex;gap:22px;align-items:center;"
            "padding:10px 24px;border-radius:999px;background:rgba(18,19,22,.8);color:#fff;z-index:50;"
            "font:700 24px 'IBM Plex Sans Arabic',sans-serif;white-space:nowrap}"
            ".hf-auto.hf-light{background:rgba(255,255,255,.92);color:#121316}")
    faces = f"<style>{R.all_faces()}\n{extra_faces()}\n{base}</style>"
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
        cover = await page.evaluate(AUTO_JS, [handles_html()])
        warns = await page.evaluate(CHECK_JS, [SAFE_TOP, SAFE_BOTTOM])
        warns += [dict(slide=c["slide"], text=c["text"], why="شريط الحسابات يغطيه — حرّك النص أو data-hpos")
                  for c in cover]
        for i in range(n):
            el = page.locator("section.slide").nth(i)
            p = outdir / f"slide_{i+1:02d}.jpg"
            await el.screenshot(path=str(p), type="jpeg", quality=90)
            print(f"  ✓ {p.name}  ({p.stat().st_size // 1024} KB)")
        await b.close()
    if n:
        (outdir / "cover.jpg").write_bytes((outdir / "slide_01.jpg").read_bytes())
    print(f"✓ {n} شريحة في {outdir}")
    for w in warns:
        print(f"  ⚠ شريحة {w['slide']}: «{w['text']}» — {w['why']}")
    if not warns:
        print("  ✓ فحص المنطقة الآمنة: سليم")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    asyncio.run(main(sys.argv[1], sys.argv[2]))
