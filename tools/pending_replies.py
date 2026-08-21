#!/usr/bin/env python3
"""يحدّد أي التعليقات تستحق رداً — منطق خالص بلا نداءات شبكة.

نداءات Graph API تمرّ عبر أدوات Zapier في الجلسة، لا من هذا السكربت. لذلك
يأخذ السكربت التعليقات جاهزة من المدخل القياسي ويخرج قائمة بما يحتاج رداً،
فيبقى قرار «من نردّ عليه» مكتوباً في مكان واحد قابل للمراجعة.

الاستخدام:
    python3 tools/pending_replies.py <media_id> < comments.json

المدخل: مصفوفة تعليقات كما ترجعها Graph API (id, text, username).
المخرج: JSON فيه `actions` — لكل عنصر معرّف التعليق ونص الرد.

يعتمد على:
  posts.json  → keyword و reply لكل منشور
  state/replied.json → التعليقات التي رُدّ عليها سابقاً
"""
import json
import pathlib
import sys
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parent.parent
STATE = ROOT / "state" / "replied.json"

# محارف التشكيل والتطويل تُكتب أحياناً ولا تُكتب، فنسقطها قبل المقارنة
_STRIP = set("ًٌٍَُِّْـ")


def norm(text):
    """توحيد الكتابة العربية: الهمزات والتاء المربوطة والألف المقصورة."""
    t = unicodedata.normalize("NFKC", str(text))
    t = "".join(c for c in t if c not in _STRIP)
    for a, b in (("أإآٱ", "ا"), ("ة", "ه"), ("ى", "ي"), ("ؤ", "و"), ("ئ", "ي")):
        for ch in a:
            t = t.replace(ch, b)
    return t.strip().lower()


def load_state():
    if STATE.exists():
        try:
            return json.loads(STATE.read_text(encoding="utf-8"))
        except ValueError:
            pass
    return {"handled": []}


def main():
    if len(sys.argv) < 2:
        raise SystemExit("الاستخدام: pending_replies.py <media_id> < comments.json")
    media_id = sys.argv[1]

    posts = json.loads((ROOT / "posts.json").read_text(encoding="utf-8"))["posts"]
    post = next((p for p in posts if p.get("media_id") == media_id), None)
    if not post:
        raise SystemExit(f"✗ لا منشور بهذا المعرّف في posts.json: {media_id}")

    keyword, reply = post.get("keyword"), post.get("reply")
    if not keyword or not reply:
        print(json.dumps({"actions": [], "reason": "المنشور بلا keyword أو reply"},
                         ensure_ascii=False))
        return

    comments = json.loads(sys.stdin.read())
    if isinstance(comments, dict):
        comments = comments.get("data", [])

    state = load_state()
    handled = set(state.get("handled", []))
    key = norm(keyword)

    actions, skipped = [], {"سبق الرد": 0, "لا تطابق": 0, "صاحب الحساب": 0}
    for c in comments:
        cid = c.get("id")
        if not cid:
            continue
        if cid in handled:
            skipped["سبق الرد"] += 1
            continue
        if (c.get("username") or "").lower() == "al_t506":
            skipped["صاحب الحساب"] += 1
            continue
        if key not in norm(c.get("text", "")):
            skipped["لا تطابق"] += 1
            continue
        user = c.get("username", "")
        actions.append({
            "comment_id": cid,
            "username": user,
            "message": (f"@{user} " if user else "") + reply,
        })

    print(json.dumps({"media_id": media_id, "keyword": keyword,
                      "actions": actions, "skipped": skipped},
                     ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
