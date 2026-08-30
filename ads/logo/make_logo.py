# -*- coding: utf-8 -*-
"""يبني حزمة لوقو «طِراز» بصيغ ومقاسات متعددة."""
import os
from PIL import Image, ImageDraw, ImageFont

FD  = "/tmp/claude-0/-home-user-carousel-host/0f30c0df-61f3-5d1b-b0a3-b7874603e2bd/scratchpad/fonts"
OUT = os.path.dirname(os.path.abspath(__file__))

EMERALD = (14, 59, 52)
GOLD    = (201, 162, 39)
GOLD_D  = (184, 137, 59)
IVORY   = (244, 239, 230)

def F(n, s):
    return ImageFont.truetype(os.path.join(FD, n), s, layout_engine=ImageFont.Layout.RAQM)

def ar(d, xy, t, f, fill, anchor="mm"):
    d.text(xy, t, font=f, fill=fill, anchor=anchor, direction="rtl", language="ar")

def stitch(d, cx, y, width, color, dash=26, gap=18, w=4):
    x = cx - width // 2
    while x < cx + width // 2:
        d.line([(x, y), (min(x + dash, cx + width // 2), y)], fill=color, width=w)
        x += dash + gap

def square(bg, word_color, latin_color, rule_color, tagline=False, S=2000):
    im = Image.new("RGBA", (S, S), bg if bg else (0, 0, 0, 0))
    d  = ImageDraw.Draw(im)
    if bg:                                    # إطار ذهبي مزدوج رفيع
        d.rectangle([120, 120, S - 120, S - 120], outline=rule_color, width=4)
        d.rectangle([146, 146, S - 146, S - 146], outline=rule_color + (110,)
                    if len(rule_color) == 4 else rule_color, width=2)
    cy = S // 2 + (10 if tagline else 55)
    ar(d, (S // 2, cy - 40), "طِراز", F("ArefRuqaa-700.ttf", 560), word_color)
    d.text((S // 2, cy + 300), "T   I   R   A   Z", font=F("Tajawal-500.ttf", 86),
           fill=latin_color, anchor="mm")
    stitch(d, S // 2, cy + 400, 420, rule_color)
    if tagline:
        ar(d, (S // 2, cy + 530), "يُفصَّل على طِرازكِ", F("ReemKufi-600.ttf", 84), word_color)
    return im

def horizontal(W=2400, H=900):
    im = Image.new("RGBA", (W, H), EMERALD + (255,))
    d  = ImageDraw.Draw(im)
    ar(d, (W // 2 + 300, H // 2 - 30), "طِراز", F("ArefRuqaa-700.ttf", 400), IVORY)
    d.line([(W // 2 - 30, 210), (W // 2 - 30, H - 210)], fill=GOLD, width=3)
    d.text((W // 2 - 420, H // 2 - 60), "T  I  R  A  Z", font=F("Tajawal-500.ttf", 76),
           fill=GOLD, anchor="mm")
    ar(d, (W // 2 - 420, H // 2 + 60), "مخاور • أرواب • جلابيات",
       F("Tajawal-400.ttf", 52), (206, 214, 210))
    return im

def avatar(S=1000):
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d  = ImageDraw.Draw(im)
    d.ellipse([0, 0, S, S], fill=EMERALD + (255,))
    d.ellipse([46, 46, S - 46, S - 46], outline=GOLD, width=5)
    ar(d, (S // 2, S // 2 - 30), "طِراز", F("ArefRuqaa-700.ttf", 300), IVORY)
    d.text((S // 2, S // 2 + 175), "T I R A Z", font=F("Tajawal-500.ttf", 40),
           fill=GOLD, anchor="mm")
    return im

files = {
    "tiraz-logo-emerald.png":       square(EMERALD + (255,), IVORY, GOLD, GOLD),
    "tiraz-logo-ivory.png":         square(IVORY + (255,), EMERALD, GOLD_D, GOLD_D),
    "tiraz-logo-emerald-tagline.png": square(EMERALD + (255,), IVORY, GOLD, GOLD, tagline=True),
    "tiraz-logo-gold-transparent.png":    square(None, GOLD, GOLD_D, GOLD_D),
    "tiraz-logo-emerald-transparent.png": square(None, EMERALD, GOLD_D, GOLD_D),
    "tiraz-logo-ivory-transparent.png":   square(None, IVORY, GOLD, GOLD),
    "tiraz-logo-horizontal.png":    horizontal(),
    "tiraz-avatar.png":             avatar(),
}
for n, im in files.items():
    im.save(os.path.join(OUT, n))
    print(n, im.size)
