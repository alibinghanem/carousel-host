#!/usr/bin/env python3
"""
مولّد كاروسيل تيك توك عربي — يحوّل ملف JSON إلى صور عمودية 1080×1920.

    python3 render_carousel.py slides.json ./out

المخرجات: slide_01.jpg … slide_NN.jpg — جاهزة للرفع مباشرة على تيك توك
(وضع الصور / Photo mode) أو إنستقرام كمنشور عمودي.

الفرق عن الفيديو: القارئ يتحكّم بإيقاعه، فكل شريحة تُصوَّر في حالتها
النهائية المكتملة — بلا حركة ولا انتظار.

يشارك نفس المحرّك والخطوط والرسومات مع render_reel.py.
"""
import json, sys, asyncio, pathlib, shutil

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import render_reel as R

MIN_SLIDES, MAX_SLIDES = 3, 10


async def build(spec, outdir):
    from playwright.async_api import async_playwright

    style = spec.get("style", "neon")
    if style not in R.STYLES:
        style = "neon"
    accent = spec.get("accent", "blue")
    a1, a2 = R.ACCENTS.get(accent, R.ACCENTS["blue"])
    vars_ = R.style_vars(style, a1, a2, accent)
    handle = spec.get("handle", "")
    faces = R.all_faces()
    R.AVATAR = "" if spec.get("avatar") is False else R.avatar_uri()

    slides = spec.get("slides") or spec.get("scenes") or []
    if not slides:
        raise SystemExit("لا توجد شرائح في ملف JSON")
    if len(slides) > MAX_SLIDES:
        print(f"⚠ {len(slides)} شريحة — الأفضل {MAX_SLIDES} أو أقل للاحتفاظ بالانتباه")

    outdir = pathlib.Path(outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    for old in outdir.glob("slide_*.jpg"):
        old.unlink()

    total = len(slides)
    print(f"▶ ستايل: {style} · لون: {accent} · شرائح: {total} · 1080×1920")

    async with async_playwright() as pw:
        launch = dict(args=["--force-color-profile=srgb", "--font-render-hinting=none",
                            "--disable-lcd-text", "--hide-scrollbars"])
        exe = R.chromium_path()
        if exe:
            launch["executable_path"] = exe
        browser = await pw.chromium.launch(**launch)
        page = await browser.new_page(viewport={"width": R.W, "height": R.H},
                                      device_scale_factor=1)
        for i, sc in enumerate(slides):
            html = R.page_html(sc, style, vars_, handle, faces,
                               mode="carousel", idx=i, total=total)
            await page.set_content(html, wait_until="load")
            await page.evaluate("document.fonts.ready")
            # حالة نهائية مكتملة: زمن كبير ومدة لا نهائية تمنع حركة الخروج.
            # T مختلف لكل شريحة ليتحرّك موضع الخلفية فتتنوّع الشرائح بصرياً.
            await page.evaluate("([t,d,T,g])=>setT(t,d,T,g)",
                                [999, 10 ** 9, i * 3.7, 0])
            f = outdir / f"slide_{i+1:02d}.jpg"
            await page.screenshot(path=str(f), type="jpeg", quality=94)
            kb = f.stat().st_size / 1024
            print(f"  ✓ {f.name}  ({sc.get('type','?')} · {kb:.0f} KB)")
        await browser.close()

    shutil.copy(outdir / "slide_01.jpg", outdir / "cover.jpg")
    print(f"✓ {total} شريحة في {outdir}")
    return sorted(outdir.glob("slide_*.jpg"))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) < 2:
        print(__doc__)
        sys.exit(1)
    spec = json.loads(pathlib.Path(args[0]).read_text(encoding="utf-8"))
    asyncio.run(build(spec, args[1]))


if __name__ == "__main__":
    main()
