# -*- coding: utf-8 -*-
"""يبني إطارات الإعلان: الخلفية + الصور المقصوصة + طبقات النص العربية."""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1080, 1920
IMG_H = 1240                      # ارتفاع منطقة الصورة (تنزف من الأعلى)
UP = "/root/.claude/uploads/0f30c0df-61f3-5d1b-b0a3-b7874603e2bd"
FD = "/tmp/claude-0/-home-user-carousel-host/0f30c0df-61f3-5d1b-b0a3-b7874603e2bd/scratchpad/fonts"
OUT = os.path.dirname(os.path.abspath(__file__))

EMERALD = (14, 59, 52)
GOLD    = (201, 162, 39)
GOLD_D  = (184, 137, 59)
IVORY   = (244, 239, 230)
CHAR    = (26, 26, 26)

F = lambda n, s: ImageFont.truetype(os.path.join(FD, n), s,
            layout_engine=ImageFont.Layout.RAQM)

def draw_ar(d, xy, text, font, fill, anchor="mm"):
    """تشكيل عربي صحيح عبر HarfBuzz/Raqm مع اتجاه من اليمين لليسار."""
    d.text(xy, text, font=font, fill=fill, anchor=anchor,
           direction="rtl", language="ar")

def stitch_line(d, cx, y, width=150, color=GOLD, dash=13, gap=9, w=2):
    x = cx - width // 2
    while x < cx + width // 2:
        d.line([(x, y), (min(x + dash, cx + width // 2), y)], fill=color, width=w)
        x += dash + gap

SHOTS = [
    dict(img="cf3f97a4-image.jpg", fx=0.50, dur=3.2, zoom="in",
         lines=["كل قطعة تبدأ بخيط"]),
    dict(img="3c033459-image.jpg", fx=0.56, dur=3.2, zoom="out",
         lines=["مقاسكِ أنتِ", "لا مقاس جاهز"]),
    dict(img="7ee8afd6-image.jpg", fx=0.24, dur=3.2, zoom="in",
         lines=["تختارين القماش واللون"]),
    dict(img="98f1553e-image.jpg", fx=0.60, dur=3.2, zoom="out",
         lines=["وتُفصَّل على يدٍ خبيرة"]),
    dict(img="cac3cdf6-image.jpg", fx=0.50, dur=3.4, zoom="in",
         lines=["تطريز بخيوط الذهب"]),
    dict(img="25575d4f-image.jpg", fx=0.48, dur=3.2, zoom="out",
         lines=["مخاور • أرواب • جلابيات"]),
    dict(img="7ef6cddb-image.jpg", fx=0.50, dur=3.2, zoom="in",
         lines=["تفاصيل لا تُرى إلا عن قرب"]),
    dict(img="f5231a7f-image.jpg", fx=0.50, dur=4.0, zoom="out",
         lines=["تخرجين… فتسأل كل نظرة:", "من فصّلها؟"]),
]
CLOSING = dict(img="0b2ccb17-image.jpg", fx=0.42, dur=5.0)

# ---------- الخلفية الثابتة ----------
def ground():
    g = Image.new("RGB", (W, H), EMERALD)
    d = ImageDraw.Draw(g)
    for y in range(H):                       # تدرّج رأسي خفيف
        k = y / H
        d.line([(0, y), (W, y)], fill=(int(14 + 6 * k), int(59 - 10 * k), int(52 - 8 * k)))
    for y in range(IMG_H + 40, H, 26):       # نسيج غرز خافت
        for x in range((y // 26 % 2) * 26, W, 52):
            d.line([(x, y), (x + 9, y)], fill=(20, 68, 60))
    g.save(f"{OUT}/ground.png")

# ---------- قص الصور مع نزيف علوي ----------
def crop_image(name, fx, idx):
    im = Image.open(os.path.join(UP, name)).convert("RGB")
    iw, ih = im.size
    target = W / IMG_H
    cw = int(ih * target)
    cx = int(iw * fx)
    left = max(0, min(iw - cw, cx - cw // 2))
    im = im.crop((left, 0, left + cw, ih))
    im = im.resize((int(W * 1.5), int(IMG_H * 1.5)), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=2.4, percent=115, threshold=3))
    im.save(f"{OUT}/base{idx}.jpg", quality=96)

# ---------- طبقة الثبات: الشعار + تدرّج الحافة ----------
def chrome():
    c = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(c)
    for i in range(230):                     # مزج حافة الصورة مع الأرضية
        a = int(255 * (i / 230) ** 1.5)
        d.line([(0, IMG_H - 230 + i), (W, IMG_H - 230 + i)], fill=EMERALD + (a,))
    d.rectangle([0, IMG_H, W, H], fill=EMERALD + (255,))
    # الشعار في الكتلة السفلية حتى لا يتعارض مع الصورة
    draw_ar(d, (W // 2, 1786), "طِراز", F("ArefRuqaa-700.ttf", 50), GOLD)
    d.text((W // 2, 1840), "T  I  R  A  Z", font=F("Tajawal-400.ttf", 19),
           fill=(201, 162, 39, 165), anchor="mm")
    c.save(f"{OUT}/chrome.png")

# ---------- طبقة النص لكل لقطة ----------
def text_layer(lines, idx):
    t = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(t)
    f = F("ReemKufi-600.ttf", 66 if len(lines) == 1 else 60)
    stitch_line(d, W // 2, 1388, 150, GOLD)
    y = 1520 if len(lines) == 1 else 1478
    for ln in lines:
        draw_ar(d, (W // 2, y), ln, f, IVORY)
        y += 92
    t.save(f"{OUT}/text{idx}.png")

# ---------- اللقطة الختامية ----------
def closing():
    im = Image.open(os.path.join(UP, CLOSING["img"])).convert("RGB")
    iw, ih = im.size
    cw = int(ih * W / H)
    left = max(0, min(iw - cw, int(iw * CLOSING["fx"]) - cw // 2))
    im = im.crop((left, 0, left + cw, ih)).resize((int(W * 1.35), int(H * 1.35)), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=2, percent=90, threshold=3))
    im.save(f"{OUT}/base_end.jpg", quality=96)

    o = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(o)
    d.rectangle([0, 0, W, H], fill=(246, 242, 234, 178))          # حجاب عاجي
    draw_ar(d, (W // 2, 620), "طِراز", F("ArefRuqaa-700.ttf", 172), EMERALD)
    d.text((W // 2, 762), "T  I  R  A  Z", font=F("Tajawal-500.ttf", 30), fill=GOLD_D, anchor="mm")
    stitch_line(d, W // 2, 850, 190, GOLD_D)
    draw_ar(d, (W // 2, 950), "يُفصَّل على طِرازكِ", F("ReemKufi-600.ttf", 58), CHAR)
    draw_ar(d, (W // 2, 1085), "مخاور • أرواب • جلابيات", F("Tajawal-500.ttf", 40), (74, 74, 74))
    draw_ar(d, (W // 2, 1290), "اطلبي أونلاين — تواصلي على", F("Tajawal-500.ttf", 42), CHAR)
    d.rounded_rectangle([190, 1350, 890, 1490], radius=70, fill=EMERALD + (255,))
    d.text((W // 2, 1421), "772 237 815", font=F("Tajawal-700.ttf", 68), fill=IVORY, anchor="mm")
    draw_ar(d, (W // 2, 1570), "واتساب • تفصيل حسب المقاس", F("Tajawal-400.ttf", 34), (90, 90, 90))
    o.save(f"{OUT}/overlay_end.png")

ground(); chrome(); closing()
for i, s in enumerate(SHOTS):
    crop_image(s["img"], s["fx"], i)
    text_layer(s["lines"], i)
print("slides ready:", len(SHOTS))
