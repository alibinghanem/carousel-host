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

SKILL_ROOT = pathlib.Path("/root/.claude/skills")


def find_skill():
    """المهارة تُزامَن أحياناً مباشرة تحت synced/ وأحياناً داخل مجلد بمعرّف UUID."""
    for depth in ("synced/arabic-instagram-carousel",
                  "synced/*/arabic-instagram-carousel",
                  "*/arabic-instagram-carousel",
                  "**/arabic-instagram-carousel"):
        for cand in sorted(SKILL_ROOT.glob(depth)):
            if ".trash" in cand.parts:
                continue
            if (cand / "render.py").exists():
                return cand
    return SKILL_ROOT / "synced" / "arabic-instagram-carousel"


SKILL = find_skill()
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

    # خطوط الريلز تعيش في المستودع لا في المهارة، لأن المهارة تُعاد مزامنتها
    # مع كل حاوية جديدة فيضيع ما يُضاف إليها.
    rf = pathlib.Path(__file__).resolve().parent.parent / "fonts"
    reel_fonts = list(rf.glob("readex-pro-*.woff2")) + \
        list(rf.glob("ibm-plex-sans-arabic-*.woff2"))
    print(f"{'✓' if len(reel_fonts) >= 10 else '⚠'} خطوط الريلز "
          f"(Readex Pro · IBM Plex Sans Arabic): {len(reel_fonts)} ملف")

    design_brief()
    print("\nPREFLIGHT_OK")


ALL_LAYOUTS = ["numeral", "manchette", "stencil", "band", "ledger"]
ALL_THEMES = ["indigo", "emerald", "crimson", "amber", "violet", "steel", "paper"]
ALL_STYLES = ["flight", "column", "tilt"]


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
        print("  المولّد: python3 tools/render_reel3.py reel.json out.mp4")
        print("  ⚠ render_reel.py و render_reel2.py متروكان للرجوع فقط.")
        print("    الثاني كان كاميرا تنزلق فوق نصّ ثلاثين ثانية: بلا قطع ولا")
        print("    حركة داخل الكادر ولا إيقاع — لا تستعمله.")
        print("  اضبط باللقطات أولاً: --stills 0,5,11,15,19 (الترميز ~٤ دقائق).")
        print("  بنية المشاهد: cover ← demo ← value ← prompt ← cta — نحو ٢٠ث.")
        print("  ▸ المدة والمشاهد تُحسب من إيقاع الموسيقى تلقائياً.")
        print("    لا تكتب مدداً بالثواني: reel_music يستخرج نبض المقطع،")
        print("    وplan_beats يوزّع النبضات، فتقع كل قطعة على ضربة حقيقية.")
        print("  ▸ demo هو المحرّك — يُري التحوّل يحدث لا يصفه:")
        print("    chat محادثة تُكتب · table جدول يُبنى · bars أعمدة تنمو.")
        print("  ▸ value يقول الفائدة صريحةً في ثلاثة أسطر، لكلٍّ icon.")
        print("    أسماء الأيقونات في tools/reel_art.py.")
        print("  ▸ prompt إلزامي. أمر بلا عربية ⇒ نافذة طرفية تلقائياً.")
        print("    لا تكتب عربية في out — الخط الأحادي لا يشكّلها.")
        print("  ▸ cta: صورة الحساب في قرص، ثم name، ثم العنوان، ثم الكلمة.")
        print("  ▸ الجمهور تقني غير متخصص: اذكر الأدوات بالاسم والأمر")
        print("    الحقيقي، وابدأ من الألم لا من التقنية، واذكر أي شرط صادق.")
        print("  ▸ \"keyword\": \"أداة\" في جذر الملف — ثابتة لا تتغيّر.")
        print("    ونصّها يَعِد برد تحت التعليق لا برسالة خاصة: لا نملك")
        print("    قدرة الرسائل الخاصة. اكتب «أرد عليك… تحت تعليقك».")
        print("  ▸ ضع \"tool\" (name · brand · url) و\"reply\" (نص الرد العلني")
        print("    كاملاً)، ثم انقلهما إلى posts.json بعد النشر. brand يُظهر")
        print("    شعار الأداة على الغلاف. بلا reply مكتفٍ بذاته لا تنشر.")
        print("  ▸ الغلاف: الإطار صفر مكتمل عمداً — إنستقرام يلتقط الغلاف من")
        print("    الفيديو. وانشر عبر Graph API بـ thumb_offset=0 لا عبر")
        print("    أداة Zapier الجاهزة، فهي بلا حقل غلاف (تفاصيلها في")
        print("    DAILY_TASK.md). هذا سبب الأغلفة الفارغة في الشبكة.")
        music = pathlib.Path(__file__).resolve().parent.parent / "music"
        n_tracks = len(list(music.glob("*.mp3"))) if music.exists() else 0
        if n_tracks:
            print(f"  الموسيقى: {n_tracks} مقطع CC0 في music/ — يُختار بالبذرة،")
            print("    ويختلف مقطع الأغنية بين منشور وآخر. لا إعداد لها.")
        else:
            print("  ⚠ music/ فارغ — سيرجع المولّد إلى الموسيقى المركّبة.")
        print("  الخطوط: Readex Pro للعناوين وIBM Plex Sans Arabic للمتن،")
        print("    وهما في fonts/ ولا يستعملهما الكاروسيل.")
        print("  ⚠ النشر قد يرجع «Video is still processing» — هذا ليس رفضاً.")
        print("    تحقّق من /media أنه لم يُنشر، ثم أعد المحاولة.")
        used_themes_r = [p.get("theme") for p in recent if p.get("format") == "reel"]
        free_t = [x for x in ALL_THEMES if x not in used_themes_r]
        print(f"\n  ثيمات لم يستخدمها ريلز مؤخراً: {' · '.join(free_t) or 'دوّر يدوياً'}")
        print("  الزخرفة تُختار من بذرة المحتوى تلقائياً (٥ أنماط).")
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
