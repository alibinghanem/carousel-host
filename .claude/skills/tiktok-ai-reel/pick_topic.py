#!/usr/bin/env python3
"""
يختار موضوع اليوم من بنك المواضيع ويسجّله — بحيث لا يتكرر موضوع
قبل استهلاك البنك كامل (٦٠ يوماً)، ومع كل دورة جديدة تتغيّر التصاميم.

    python3 pick_topic.py             # موضوع اليوم (نفس النتيجة لو تكرر بنفس اليوم)
    python3 pick_topic.py --peek      # اعرض بدون تسجيل
    python3 pick_topic.py --status    # حالة البنك
    python3 pick_topic.py --schedule  # جدول الأسبوعين القادمين (صيغة + بنك)

المخرجات فيها "format": "video" (موشن قرافيك Remotion — references/video.md)
أو "carousel" (التصميم المعتاد — references/design.md)، و"bank": tools/classic.
"""
import json, sys, pathlib, datetime

HERE = pathlib.Path(__file__).parent
# الجدول (طلب المستخدم) — محسوب من التاريخ، فتشغيل المهمة مرتين بنفس اليوم يرجّع نفس النتيجة:
#  • الصيغة (format): يوم «فيديو» موشن قرافيك احترافي (Remotion + موسيقى/مؤثرات ElevenLabs)
#    ويوم «كاروسيل» (التصميم اليومي المعتاد) — تناوب صارم يبدأ بفيديو يوم 2026-10-01.
#  • البنك (bank): يوم «أدوات» (topics_tools.json) ويوم «أتمتة» (topics.json).
#    لو تناوب البنك يومياً أيضاً لصار كل فيديو «أتمتة» للأبد؛ فنقلب الاقتران كل أسبوع:
#    البنك = (d + d//7) زوجي → أتمتة، حيث d = الأيام منذ 2026-10-01
#    (يتكرر البنك مرة بالأسبوع عند الانتقال، والصيغة ما تتكرر أبداً).
# للإجبار: --tools / --classic · --video / --carousel · --date=YYYY-MM-DD (للتجربة)
_START = datetime.date(2026, 10, 1)


def schedule(day):
    """(bank, format) لتاريخ معيّن."""
    d = (day - _START).days
    if d < 0:  # قبل الجدول الجديد: تناوب البنك اليومي القديم، والكل كاروسيل
        bank = "tools" if day.toordinal() % 2 == datetime.date(2026, 9, 26).toordinal() % 2 else "classic"
        return bank, "carousel"
    bank = "classic" if (d + d // 7) % 2 == 0 else "tools"
    return bank, ("video" if d % 2 == 0 else "carousel")


_TODAY = datetime.date.today()
for _a in sys.argv:
    if _a.startswith("--date="):
        _TODAY = datetime.date.fromisoformat(_a[7:])
KIND, FORMAT = schedule(_TODAY)
if "--classic" in sys.argv:
    KIND = "classic"
elif "--tools" in sys.argv:
    KIND = "tools"
if "--video" in sys.argv:
    FORMAT = "video"
elif "--carousel" in sys.argv:
    FORMAT = "carousel"
if KIND == "tools" and (HERE / "topics_tools.json").exists():
    BANK = HERE / "topics_tools.json"
    STATE = HERE / "state" / "used_tools.json"
else:
    KIND = "classic"
    BANK = HERE / "topics.json"
    STATE = HERE / "state" / "used.json"

STYLES = ["neon", "mesh", "editorial", "terminal", "blocks", "aurora"]
ACCENTS = ["blue", "cyan", "emerald", "amber", "violet", "rose", "orange", "lime"]


def load_state():
    if STATE.exists():
        return json.loads(STATE.read_text(encoding="utf-8"))
    return {"cycle": 0, "used": [], "log": []}


def save_state(st):
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(st, ensure_ascii=False, indent=1), encoding="utf-8")


def design_for(topic, idx, cycle):
    """في كل دورة جديدة يأخذ الموضوع تركيبة تصميم مختلفة عن الدورة السابقة."""
    if cycle == 0:
        return topic["style"], topic["accent"]
    return (STYLES[(idx + cycle * 5) % len(STYLES)],
            ACCENTS[(idx + cycle * 3) % len(ACCENTS)])


def main():
    topics = json.loads(BANK.read_text(encoding="utf-8"))["topics"]
    st = load_state()
    today = _TODAY.isoformat()

    if "--schedule" in sys.argv:
        names = {"video": "🎬 فيديو", "carousel": "🖼 كاروسيل", "tools": "أدوات", "classic": "أتمتة"}
        for i in range(14):
            day = _TODAY + datetime.timedelta(days=i)
            b, f = schedule(day)
            print(day.isoformat(), names[f], "·", names[b])
        return

    if "--status" in sys.argv:
        print(f"الدورة: {st['cycle']+1} · مستهلك: {len(st['used'])}/{len(topics)} "
              f"· متبقٍ: {len(topics)-len(st['used'])} يوم")
        return

    # لو اشتغلت المهمة مرتين بنفس اليوم — نفس الموضوع
    same = [e for e in st["log"] if e["date"] == today]
    if same and "--peek" not in sys.argv:
        tid = same[-1]["id"]
        t = next(x for x in topics if x["id"] == tid)
        idx = topics.index(t)
        t = dict(t)
        t["style"], t["accent"] = design_for(t, idx, same[-1].get("cycle", 0))
        t["repeat"] = True
        t["bank"] = KIND
        t["format"] = FORMAT
        print(json.dumps(t, ensure_ascii=False, indent=1))
        return

    used = set(st["used"])
    remaining = [(i, t) for i, t in enumerate(topics) if t["id"] not in used]
    # الأهم أولاً (طلب المستخدم: مواضيع تجذب الاهتمام): الأولوية 4 ثم 3 ثم 2 ثم 1، وداخل كل أولوية بترتيب البنك
    remaining.sort(key=lambda it: (-it[1].get("priority", 2), it[0]))
    if not remaining:                      # انتهى البنك — دورة جديدة بتصاميم جديدة
        st["cycle"] += 1
        st["used"] = []
        used = set()
        remaining = list(enumerate(topics))
        remaining.sort(key=lambda it: (-it[1].get("priority", 2), it[0]))

    idx, topic = remaining[0]
    topic = dict(topic)
    topic["style"], topic["accent"] = design_for(topic, idx, st["cycle"])
    topic["cycle"] = st["cycle"]
    topic["bank"] = KIND   # لا ترقيم يوم في التصميم (طلب المستخدم)
    topic["format"] = FORMAT

    if "--peek" not in sys.argv:
        st["used"].append(topic["id"])
        st["log"].append({"date": today, "id": topic["id"], "cycle": st["cycle"], "format": FORMAT,
                          "style": topic["style"], "accent": topic["accent"]})
        save_state(st)

    print(json.dumps(topic, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
