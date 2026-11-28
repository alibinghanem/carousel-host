"""Full-screen end card (1080x1920) built as separate RGBA layers for animation.
build(style, fonts_dir) -> dict of layers: 'top','card','contact' (RGBA PIL images, full size)
bg_frame(img, u) -> full-screen background RGB (PIL) of the photo with slow push.
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

W, H = 1080, 1920
GOLD = (214, 178, 110)
GOLD_L = (236, 210, 160)
WHITE = (255, 255, 255)
SOFT = (226, 220, 208)

STYLES = {
    "A": dict(title=("almarai-800.ttf", 96), tag=("almarai-700.ttf", 34), num=("almarai-800.ttf", 170),
              cur=("almarai-700.ttf", 64), body=("almarai-400.ttf", 38), small=("almarai-300.ttf", 28),
              phone=("almarai-700.ttf", 54), label=("almarai-700.ttf", 32)),
    "B": dict(title=("ibm-plex-sans-arabic-700.ttf", 92), tag=("ibm-plex-sans-arabic-500.ttf", 34),
              num=("ibm-plex-sans-arabic-700.ttf", 168), cur=("ibm-plex-sans-arabic-500.ttf", 62),
              body=("ibm-plex-sans-arabic-300.ttf", 38), small=("ibm-plex-sans-arabic-300.ttf", 28),
              phone=("ibm-plex-sans-arabic-500.ttf", 54), label=("ibm-plex-sans-arabic-500.ttf", 32)),
    "C": dict(title=("alexandria-800.ttf", 88), tag=("alexandria-500.ttf", 32), num=("alexandria-800.ttf", 150),
              cur=("alexandria-500.ttf", 58), body=("alexandria-300.ttf", 34), small=("alexandria-300.ttf", 26),
              phone=("alexandria-500.ttf", 50), label=("alexandria-500.ttf", 30)),
}

def _f(fd, spec):
    return ImageFont.truetype(os.path.join(fd, spec[0]), spec[1])

def _text(d, xy_center, txt, f, fill, anchor_y="top"):
    bb = d.textbbox((0, 0), txt, font=f, direction="rtl", language="ar")
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    x = xy_center[0] - tw / 2 - bb[0]
    y = xy_center[1] - bb[1]
    d.text((x, y), txt, font=f, fill=fill, direction="rtl", language="ar")
    return tw, th

def _shadowed(layer, draw_fn, blur=10, alpha=150):
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw_fn(ImageDraw.Draw(sh), (0, 0, 0, alpha))
    layer = Image.alpha_composite(layer, sh.filter(ImageFilter.GaussianBlur(blur)))
    draw_fn(ImageDraw.Draw(layer), None)
    return layer

def build(style, fd):
    s = {k: _f(fd, v) for k, v in STYLES[style].items()}
    out = {}

    # ---- top: project name
    top = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    def dtop(d, sh):
        c = lambda col: sh or col
        tw, th = _text(d, (W / 2, 300), "مشروع الندى", s["title"], c(WHITE + (255,)))
        _text(d, (W / 2, 300 + th + 34), "حي العليا  ·  الرياض", s["tag"], c(GOLD + (255,)))
    top = _shadowed(top, dtop)
    d = ImageDraw.Draw(top)
    d.rectangle((W / 2 - 60, 250, W / 2 + 60, 253), fill=GOLD + (255,))
    out["top"] = top

    # ---- card: price
    card = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cx0, cy0, cx1, cy1 = 110, 700, W - 110, 1150
    panel = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    pd = ImageDraw.Draw(panel)
    pd.rounded_rectangle((cx0, cy0, cx1, cy1), radius=36, fill=(12, 12, 14, 150), outline=GOLD + (200,), width=2)
    card = Image.alpha_composite(card, panel)
    d = ImageDraw.Draw(card)
    _text(d, (W / 2, cy0 + 55), "الإيجار السنوي", s["body"], SOFT + (255,))
    # number + currency, RTL: number on the right, currency on the left
    num, cur = "110,000", "ريال"
    nb = d.textbbox((0, 0), num, font=s["num"])
    cb = d.textbbox((0, 0), cur, font=s["cur"], direction="rtl", language="ar")
    nw, cw = nb[2] - nb[0], cb[2] - cb[0]
    gap = 28
    total = nw + gap + cw
    x_left = W / 2 - total / 2
    base_y = cy0 + 135
    # align bottoms
    nh = nb[3] - nb[1]
    d.text((x_left + cw + gap - nb[0], base_y - nb[1]), num, font=s["num"], fill=GOLD_L + (255,))
    ch = cb[3] - cb[1]
    d.text((x_left - cb[0], base_y + nh - ch - cb[1] - 6), cur, font=s["cur"], fill=GOLD + (255,),
           direction="rtl", language="ar")
    # divider
    dy = base_y + nh + 55
    d.line((W / 2 - 200, dy, W / 2 + 200, dy), fill=GOLD + (120,), width=2)
    _text(d, (W / 2, dy + 30), "خصم 5,000 ريال عند السداد دفعة واحدة", s["body"], WHITE + (255,))
    out["card"] = card

    # ---- contact
    con = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(con)
    _text(d, (W / 2, 1270), "للتواصل", s["label"], GOLD + (255,))
    py = 1350
    for i, ph in enumerate(("920033876", "0558297700")):
        y = py + i * 120
        d.rounded_rectangle((W / 2 - 300, y, W / 2 + 300, y + 96), radius=48, fill=(255, 255, 255, 22),
                            outline=GOLD + (170,), width=2)
        bb = d.textbbox((0, 0), ph, font=s["phone"])
        d.text((W / 2 - (bb[2] - bb[0]) / 2 - bb[0], y + 48 - (bb[3] - bb[1]) / 2 - bb[1]), ph,
               font=s["phone"], fill=WHITE + (255,))
    _text(d, (W / 2, 1625), "شارع عبدالله بن سليمان الحمدان، حي العليا، الرياض", s["small"], SOFT + (255,))
    _text(d, (W / 2, 1680), "رقم رخصة الإعلان 7201005761", s["small"], (170, 165, 155, 255))
    out["contact"] = con
    return out

def bg_frame(img, u):
    """img: PIL photo. u: 0..1 progress. Full-screen 9:16 crop, slow push, darkened gradient."""
    iw, ih = img.size
    ch = ih / (1.0 + 0.08 * u)
    cw = ch * W / H
    cx = iw * (0.47 + 0.04 * u)
    x0 = min(max(cx - cw / 2, 0), iw - cw)
    y0 = (ih - ch) / 2
    fr = img.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, H), Image.BICUBIC)
    fr = fr.filter(ImageFilter.GaussianBlur(2.5))
    fr = ImageEnhance.Brightness(fr).enhance(0.55)
    grad = Image.new("L", (1, H))
    for y in range(H):
        t = y / H
        a = 170 if t < 0.08 else int(170 * max(0, (0.30 - t) / 0.22)) if t < 0.30 else \
            int(200 * max(0, (t - 0.62) / 0.38))
        grad.putpixel((0, y), max(0, min(255, a)))
    grad = grad.resize((W, H))
    black = Image.new("RGB", (W, H), (8, 8, 10))
    return Image.composite(black, fr, grad)

if __name__ == "__main__":
    import sys
    fd, img_path, outdir = sys.argv[1:4]
    photo = Image.open(img_path).convert("RGB")
    bg = bg_frame(photo, 0.6).convert("RGBA")
    for st in STYLES:
        L = build(st, fd)
        im = bg
        for k in ("top", "card", "contact"):
            im = Image.alpha_composite(im, L[k])
        im.convert("RGB").save(os.path.join(outdir, f"end_{st}.png"))
    print("ok")
