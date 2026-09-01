#!/usr/bin/env python3
"""يحدّد المنشورات التي تستحق فحص تعليقاتها في هذه الجولة.

الريلز يظل يجمع تعليقات لأسابيع بعد نشره، لا لأيام. لو فُحص آخر منشورين أو
ثلاثة فقط، لخرج الريلز من نافذة المتابعة بعد أقل من أسبوع وبقي من يعلّق
عليه بعد ذلك بلا رد — وهو تحديداً من فعل ما طلبه الفيديو منه.

المعيار هنا: كل منشور يحمل `keyword` و `reply` ونُشر خلال آخر `--days` يوماً،
بحد أقصى `--limit` منشوراً، الأحدث أولاً. المنشورات الخبرية (بلا `keyword`)
تُستبعد لأنها لا تطلب تعليقاً بكلمة.

النافذة الافتراضية ١٤ يوماً لا ٣٠: كل منشور هنا يكلّف نداء Zapier واحداً
في كل تشغيل متابعة، وحساب Zapier نفد فعلياً من المهام في ٢٠٢٦-٠٩-٠١ بسبب
تراكم منشورات قديمة في نافذة واسعة مع تشغيلين يومياً. بمعدّل نشر كل يومين
تغطّي ١٤ يوماً آخر سبعة منشورات تقريباً — أكثر مما يحتاجه التفاعل الفعلي
عادة.

الاستخدام:
    python3 tools/watch_targets.py               # آخر 14 يوماً، 6 منشورات
    python3 tools/watch_targets.py --days 30 --limit 10
"""
import argparse
import datetime
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


def post_date(value):
    """حقل التاريخ قد يحمل لاحقة مثل «2026-08-21-reel» — نأخذ العشرة الأولى."""
    try:
        return datetime.date.fromisoformat(str(value)[:10])
    except ValueError:
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=14)
    ap.add_argument("--limit", type=int, default=6)
    args = ap.parse_args()

    posts = json.loads((ROOT / "posts.json").read_text(encoding="utf-8"))["posts"]
    cutoff = datetime.date.today() - datetime.timedelta(days=args.days)

    targets, stale, no_reply = [], 0, 0
    for p in reversed(posts):
        if not (p.get("keyword") and p.get("reply") and p.get("media_id")):
            if p.get("keyword"):
                no_reply += 1
            continue
        d = post_date(p.get("date"))
        if d and d < cutoff:
            stale += 1
            continue
        targets.append({"media_id": p["media_id"], "date": p.get("date"),
                        "keyword": p["keyword"], "topic": p.get("topic", "")})
        if len(targets) >= args.limit:
            break

    print(json.dumps({"targets": targets,
                      "skipped": {"أقدم من النافذة": stale,
                                  "بكلمة بلا reply": no_reply}},
                     ensure_ascii=False, indent=2))
    if no_reply:
        print(f"⚠ {no_reply} منشور يحمل keyword بلا reply — من يعلّق عليه لن "
              f"يصله شيء. أصلح posts.json.", file=sys.stderr)


if __name__ == "__main__":
    main()
