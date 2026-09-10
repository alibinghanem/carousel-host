#!/usr/bin/env python3
"""
يختار موضوع اليوم من بنك المواضيع ويسجّله — بحيث لا يتكرر موضوع
قبل استهلاك البنك كامل (٦٠ يوماً)، ومع كل دورة جديدة تتغيّر التصاميم.

    python3 pick_topic.py             # موضوع اليوم (نفس النتيجة لو تكرر بنفس اليوم)
    python3 pick_topic.py --peek      # اعرض بدون تسجيل
    python3 pick_topic.py --status    # حالة البنك
"""
import json, sys, pathlib, datetime

HERE = pathlib.Path(__file__).parent
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
    today = datetime.date.today().isoformat()

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
        print(json.dumps(t, ensure_ascii=False, indent=1))
        return

    used = set(st["used"])
    remaining = [(i, t) for i, t in enumerate(topics) if t["id"] not in used]
    if not remaining:                      # انتهى البنك — دورة جديدة بتصاميم جديدة
        st["cycle"] += 1
        st["used"] = []
        used = set()
        remaining = list(enumerate(topics))

    idx, topic = remaining[0]
    topic = dict(topic)
    topic["style"], topic["accent"] = design_for(topic, idx, st["cycle"])
    topic["cycle"] = st["cycle"]
    topic["day"] = len(st["used"]) + 1

    if "--peek" not in sys.argv:
        st["used"].append(topic["id"])
        st["log"].append({"date": today, "id": topic["id"], "cycle": st["cycle"],
                          "style": topic["style"], "accent": topic["accent"]})
        save_state(st)

    print(json.dumps(topic, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
