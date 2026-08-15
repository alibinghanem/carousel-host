#!/usr/bin/env python3
"""فحص وتهيئة البيئة قبل توليد شرائح الكاروسيل.

الحاوية تُبنى من جديد في كل جلسة مجدولة، ومهارة arabic-instagram-carousel
تُزامَن من مصدر خارجي — أي تعديل يدوي على ملفاتها يضيع. لذلك يعيش هذا
السكربت في المستودع (الذي يبقى) ويعيد تطبيق الإصلاحات اللازمة في كل تشغيل.

الاستخدام:
    python3 tools/preflight.py

آمن للتكرار: يفحص أولاً ولا يعدّل شيئاً إن كان سليماً.
"""
import json
import pathlib
import subprocess
import sys

SKILL = pathlib.Path("/root/.claude/skills/synced/arabic-instagram-carousel")
RENDER = SKILL / "render.py"

OLD_LAUNCH = (
    'browser = await p.chromium.launch('
    'args=["--force-color-profile=srgb", "--font-render-hinting=none"])'
)

NEW_LAUNCH = '''launch_args = ["--force-color-profile=srgb", "--font-render-hinting=none"]
        try:
            browser = await p.chromium.launch(args=launch_args)
        except Exception:
            # نسخة playwright المثبّتة قد تطلب بناء Chromium غير الموجود مسبقاً.
            # ابحث عن أي chromium مثبّت في البيئة واستخدمه صراحةً.
            exe = None
            for pat in ("chromium-*/chrome-linux/chrome",
                        "chromium_headless_shell-*/chrome-linux/headless_shell",
                        "chromium/chrome"):
                found = sorted(pathlib.Path("/opt/pw-browsers").glob(pat))
                if found:
                    exe = str(found[-1])
                    break
            if not exe:
                raise
            browser = await p.chromium.launch(executable_path=exe, args=launch_args)'''


def fail(msg):
    print(f"✗ {msg}")
    sys.exit(1)


def main():
    if not RENDER.exists():
        fail(f"مهارة الكاروسيل غير موجودة في {SKILL} — لا يمكن المتابعة.")

    src = RENDER.read_text(encoding="utf-8")

    # ١. إصلاح تشغيل Chromium
    if "executable_path=exe" in src:
        print("✓ إصلاح Chromium مطبَّق مسبقاً")
    elif OLD_LAUNCH in src:
        RENDER.write_text(src.replace(OLD_LAUNCH, NEW_LAUNCH), encoding="utf-8")
        print("✓ طُبّق إصلاح Chromium على render.py")
    else:
        print("⚠ لم يُعثر على سطر تشغيل Chromium المتوقّع — ربما تغيّرت المهارة.")
        print("  تابع بحذر: إن فشل render.py بخطأ \"Executable doesn't exist\"")
        print("  فمرّر executable_path لأحدث chromium داخل /opt/pw-browsers.")

    # ٢. التأكد من وجود متصفح تنفيذي فعلاً
    browsers = [
        b for pat in ("chromium-*/chrome-linux/chrome",
                      "chromium_headless_shell-*/chrome-linux/headless_shell",
                      "chromium/chrome")
        for b in sorted(pathlib.Path("/opt/pw-browsers").glob(pat))
    ]
    if browsers:
        print(f"✓ متصفح تنفيذي متاح: {browsers[-1]}")
    else:
        print("⚠ لم يُعثر على chromium تنفيذي في /opt/pw-browsers")

    # ٣. التأكد من الحزم المطلوبة
    for mod, pkg in (("playwright", "playwright"), ("PIL", "pillow")):
        try:
            __import__(mod)
            print(f"✓ {pkg} متوفّرة")
        except ImportError:
            print(f"… تثبيت {pkg}")
            subprocess.run(
                [sys.executable, "-m", "pip", "install", pkg,
                 "--break-system-packages", "-q"],
                check=False,
            )

    # ٤. التأكد من الخطوط والصورة الشخصية
    fonts = list((SKILL / "fonts").glob("*")) if (SKILL / "fonts").exists() else []
    print(f"{'✓' if fonts else '⚠'} خطوط عربية: {len(fonts)} ملف")
    avatar = SKILL / "assets" / "avatar.png"
    print(f"{'✓' if avatar.exists() else '⚠'} الصورة الشخصية لشريحة cta")

    design_brief()
    print("\nPREFLIGHT_OK")


ALL_LAYOUTS = ["numeral", "manchette", "stencil", "band", "ledger"]
ALL_THEMES = ["indigo", "emerald", "crimson", "amber", "violet", "steel", "paper"]
ALL_STYLES = ["spine", "panel", "poster", "frame"]


def design_brief():
    """يطبع توجيه التصميم وما استُخدم مؤخراً حتى لا تتكرر التصاميم.

    التشغيل المجدول يقرأ هذه المخرجات، فهي القناة التي تصل بها قواعد
    التنويع إليه حتى لو لم يُحدَّث نص المهمة نفسه.
    """
    root = pathlib.Path(__file__).resolve().parent.parent
    used_layouts, used_themes, recent = [], [], []
    pj = root / "posts.json"
    if pj.exists():
        try:
            posts = json.loads(pj.read_text(encoding="utf-8")).get("posts", [])
            recent = posts[-3:]
            used_layouts = [p.get("layout") for p in recent if p.get("layout")]
            used_themes = [p.get("theme") for p in recent if p.get("theme")]
        except (ValueError, OSError):
            pass

    free_l = [x for x in ALL_LAYOUTS if x not in used_layouts]
    free_t = [x for x in ALL_THEMES if x not in used_themes]

    last_kind = recent[-1].get("kind", "news") if recent else "guide"
    kind = "guide" if last_kind == "news" else "news"

    print("\n" + "═" * 62)
    print("نوع منشور اليوم — إلزامي")
    print("═" * 62)
    if kind == "news":
        print("  ▸ خبر → كاروسيل صور  (آخر منشور كان تعليمياً)")
        print("  ابحث عن أهم خبر تقنية أو ذكاء اصطناعي خلال ٢٤–٤٨ ساعة.")
        print("  المولّد: python3 tools/render_v2.py slides.json ./out")
        print("  بنية الشرائح: cover ← point ← stat ← point ← cta")
    else:
        print("  ▸ تعليمي → ريلز فيديو  (آخر منشور كان خبراً)")
        print("  اشرح كيف يستفيد شخص أو مؤسسة من أدوات الذكاء الاصطناعي عملياً.")
        print("  المولّد: python3 tools/render_reel.py reel.json out.mp4")
        print("  اضبط التصميم أولاً بـ --stills 2,8,14,20 قبل الترميز الكامل.")
        print("  بنية المشاهد: hook ← step 1 ← prompt ← step 2 ← step 3 ← cta")
        print("  مشهد prompt إلزامي — موجّه جاهز للنسخ، وهو أكثر ما يُحفظ ويُشارَك.")
        print("  خطوات ملموسة لا نظريات، واذكر الأدوات بالاسم.")
        used_styles = [p.get("style") for p in recent if p.get("style")]
        free_s = [x for x in ALL_STYLES if x not in used_styles]
        print(f"\n  أساليب حركة متاحة: {' · '.join(free_s) or 'دوّر يدوياً'}")
        print("    spine  عمود جانبي · انتقال بلوح يمسح الكادر")
        print("    panel  عدّاد علوي وشبكة نقطية · انتقال بدفع أفقي")
        print("    poster كتل لونية تتناوب · قطع خاطف")
        print("    frame  إطار بزوايا وأقواس · انتقال بدائرة تتّسع")
    print("\n  سجّل \"kind\": \"" + kind + "\" في posts.json بعد النشر"
          + (" مع \"style\"." if kind == "guide" else "."))
    print("  تفاصيل النوعين في DAILY_TASK.md.")

    print("\n" + "═" * 62)
    print("توجيه التصميم — إلزامي")
    print("═" * 62)
    print("استخدم المولّد متعدد التخطيطات، لا render.py الخاص بالمهارة:")
    print("    python3 tools/render_v2.py slides.json ./out")
    print("المولّد الأصلي يمرّر كل غلاف عبر قالب واحد، فتبدو المنشورات")
    print("متطابقة في شبكة الحساب. التفاصيل الكاملة في DAILY_TASK.md.")
    print()
    if recent:
        print("آخر المنشورات استخدمت:")
        for p in recent:
            print(f"  · {p.get('date','?')} — تخطيط {p.get('layout','?')}"
                  f" / ثيم {p.get('theme','?')}")
    print(f"\nتخطيطات متاحة لم تُستخدم مؤخراً: {' · '.join(free_l) or 'لا شيء — دوّر يدوياً'}")
    print(f"ثيمات متاحة لم تُستخدم مؤخراً: {' · '.join(free_t) or 'لا شيء — دوّر يدوياً'}")
    if "paper" in free_t:
        print("اقتراح: paper أرضية فاتحة — أقوى كاسر للرتابة وسط منشورات داكنة.")
    print("═" * 62)


if __name__ == "__main__":
    main()
