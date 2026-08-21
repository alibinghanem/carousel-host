#!/usr/bin/env python3
"""يولّد رسالة ManyChat التي تصل لمن يعلّق بالكلمة المفتاحية.

ManyChat هو من يرصد التعليق ويرسل الرسالة — لا هذه الجلسة. لكنه يستطيع جلب
محتوى الرسالة من رابط خارجي عند كل إرسال («External Request»). فنكتب هنا
محتوى اليوم في `manychat/latest.json`، ويقرأه ManyChat لحظة الإرسال.

هكذا تُضبط الأتمتة في ManyChat **مرة واحدة** بكلمة ثابتة، بينما تتغيّر الأداة
المُرسَلة كل يوم تلقائياً.

الاستخدام:
    python3 tools/manychat_payload.py \
        --tool "Remini" \
        --url "https://remini.ai" \
        --what "يرمّم الصور القديمة والممزقة" \
        --steps "افتح الموقع" "ارفع الصورة" "نزّل النتيجة" \
        --note "النسخة المجانية تكفي لثلاث صور يومياً"

الناتج: manychat/latest.json بصيغة Dynamic Block v2.
"""
import argparse
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "manychat" / "latest.json"


def build(tool, url, what, steps, note="", handle="@al_t506"):
    lines = [f"وصلك الطلب 👋", "", f"الأداة: {tool}", f"وظيفتها: {what}", ""]
    lines += [f"{i}. {s}" for i, s in enumerate(steps, 1)]
    if note:
        lines += ["", f"ملاحظة: {note}"]
    lines += ["", f"لو احتجت شرحاً أوسع اسألني هنا مباشرة — {handle}"]

    return {
        "version": "v2",
        "content": {
            "messages": [
                {
                    "type": "text",
                    "text": "\n".join(lines),
                    "buttons": [
                        {"type": "url", "caption": f"افتح {tool}"[:20], "url": url}
                    ],
                }
            ],
            "actions": [],
            "quick_replies": [],
        },
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tool", required=True, help="اسم الأداة")
    ap.add_argument("--url", required=True, help="رابط الأداة")
    ap.add_argument("--what", required=True, help="ماذا تفعل بجملة واحدة")
    ap.add_argument("--steps", nargs="+", required=True, help="خطوات الاستخدام")
    ap.add_argument("--note", default="", help="تنبيه صادق: حدود الأداة أو الخصوصية")
    ap.add_argument("--handle", default="@al_t506")
    a = ap.parse_args()

    if not a.url.startswith("https://"):
        raise SystemExit("✗ الرابط يجب أن يبدأ بـ https://")
    if len(a.steps) > 4:
        raise SystemExit("✗ أربع خطوات كحد أقصى — الرسالة تُقرأ على الهاتف")

    payload = build(a.tool, a.url, a.what, a.steps, a.note, a.handle)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
                   encoding="utf-8")

    text = payload["content"]["messages"][0]["text"]
    print(f"✓ {OUT.relative_to(ROOT)} — {len(text)} حرفاً")
    print("─" * 50)
    print(text)
    print("─" * 50)
    if len(text) > 900:
        print("⚠ الرسالة طويلة — اختصر الخطوات")


if __name__ == "__main__":
    main()
