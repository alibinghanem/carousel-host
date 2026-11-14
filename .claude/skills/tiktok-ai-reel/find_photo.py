#!/usr/bin/env python3
"""
ابحث عن صورة فوتوغرافية مجانية (Pexels) ونزّلها لتصميم اليوم.

    python3 find_photo.py "airport night" $D/assets/cover.jpg [portrait|landscape|square]

يحتاج مفتاح Pexels: إما مضاف في إعدادات البيئة كـ API credential لـ api.pexels.com
(يُحقن تلقائياً ولا يظهر هنا)، أو متغير البيئة PEXELS_API_KEY.
يطبع اسم المصوّر ورابط الصورة — أضف الإسناد في design-brief.md.

بدون مفتاح (أو لو ما لقى نتيجة) يرجع تلقائياً لمكتبة الصور المُتحقَّق منها
references/photos.json (صور Unsplash شافها المصمم بعينه) ويختار الأقرب للكلمات.
للمكتبة مباشرة:  python3 find_photo.py --lib "security lock" $D/assets/x.jpg
للاستعراض:       python3 find_photo.py --list
"""
import pathlib
import json, os, sys, urllib.parse, urllib.request


LIB = pathlib.Path(__file__).parent / "references" / "photos.json"


def from_library(query, out):
    lib = json.loads(LIB.read_text(encoding="utf-8"))
    words = query.lower().split()
    scored = sorted(lib, key=lambda p: -sum(w in p["tags"] for w in words))
    best = scored[0]
    if not any(w in best["tags"] for w in words):
        sys.exit(f"✗ ما في المكتبة صورة لـ «{query}» — شوف --list أو صمّم بدون صورة")
    url = f"https://images.unsplash.com/photo-{best['id']}?w=1400&q=80"
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    with open(out, "wb") as f:
        f.write(urllib.request.urlopen(url, timeout=30).read())
    print(f"✓ {out}  ·  من المكتبة: {best['desc']} ({best['tone']})  ·  unsplash.com/photos/{best['id']}")
    for alt in scored[1:3]:
        if any(w in alt["tags"] for w in words):
            print(f"  بديل: --lib بكلمات «{alt['tags'].split()[0]}» ← {alt['desc']}")


def main():
    if "--list" in sys.argv:
        for p in json.loads(LIB.read_text(encoding="utf-8")):
            print(f"{p['tone']:5} · {p['desc']}  ·  [{p['tags']}]")
        return
    if "--lib" in sys.argv:
        a = [x for x in sys.argv[1:] if x != "--lib"]
        return from_library(a[0], a[1])
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    query, out = sys.argv[1], sys.argv[2]
    orient = sys.argv[3] if len(sys.argv) > 3 else "portrait"
    url = "https://api.pexels.com/v1/search?" + urllib.parse.urlencode(
        {"query": query, "orientation": orient, "per_page": 5})
    req = urllib.request.Request(url, headers={"User-Agent": "carousel-host/1.0"})
    if os.environ.get("PEXELS_API_KEY"):
        req.add_header("Authorization", os.environ["PEXELS_API_KEY"])
    try:
        data = json.load(urllib.request.urlopen(req, timeout=20))
    except urllib.error.HTTPError as e:
        print(f"… Pexels رد {e.code} ({'بدون مفتاح' if e.code == 401 else e.reason}) — أرجع لمكتبة الصور")
        return from_library(query, out)
    photos = data.get("photos") or []
    if not photos:
        print(f"… Pexels ما لقى «{query}» — أرجع لمكتبة الصور")
        return from_library(query, out)
    p = photos[0]
    src = p["src"].get("portrait" if orient == "portrait" else "large2x") or p["src"]["original"]
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    img = urllib.request.urlopen(urllib.request.Request(src, headers={"User-Agent": "carousel-host/1.0"}), timeout=30)
    with open(out, "wb") as f:
        f.write(img.read())
    print(f"✓ {out}  ·  تصوير: {p['photographer']}  ·  {p['url']}")
    for alt in photos[1:]:
        print(f"  بديل: {alt['src']['portrait']}  ({alt['photographer']})")


if __name__ == "__main__":
    main()
