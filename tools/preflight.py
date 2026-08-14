#!/usr/bin/env python3
"""فحص وتهيئة البيئة قبل توليد شرائح الكاروسيل.

الحاوية تُبنى من جديد في كل جلسة مجدولة، ومهارة arabic-instagram-carousel
تُزامَن من مصدر خارجي — أي تعديل يدوي على ملفاتها يضيع. لذلك يعيش هذا
السكربت في المستودع (الذي يبقى) ويعيد تطبيق الإصلاحات اللازمة في كل تشغيل.

الاستخدام:
    python3 tools/preflight.py

آمن للتكرار: يفحص أولاً ولا يعدّل شيئاً إن كان سليماً.
"""
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

    print("\nPREFLIGHT_OK")


if __name__ == "__main__":
    main()
