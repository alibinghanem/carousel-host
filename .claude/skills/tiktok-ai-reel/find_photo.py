#!/usr/bin/env python3
"""
ابحث عن صورة فوتوغرافية مجانية (Pexels) ونزّلها لتصميم اليوم.

    python3 find_photo.py "airport night" $D/assets/cover.jpg [portrait|landscape|square]

يحتاج مفتاح Pexels: إما مضاف في إعدادات البيئة كـ API credential لـ api.pexels.com
(يُحقن تلقائياً ولا يظهر هنا)، أو متغير البيئة PEXELS_API_KEY.
يطبع اسم المصوّر ورابط الصورة — أضف الإسناد في design-brief.md.
"""
import json, os, sys, urllib.parse, urllib.request


def main():
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
        sys.exit(f"✗ Pexels رد {e.code} — {'المفتاح ناقص أو غير صحيح' if e.code == 401 else e.reason}")
    photos = data.get("photos") or []
    if not photos:
        sys.exit(f"✗ ما لقيت صور لـ «{query}» — جرّب كلمات إنجليزية أبسط")
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
