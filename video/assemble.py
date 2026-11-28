#!/usr/bin/env python3
"""Assemble Flow AI clips into one continuous vertical ad (no audio).
Usage: python3 assemble.py <clips_dir> <imgs_dir> <fonts_dir> <out.mp4> [preview]
"""
import sys, os, math, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

CLIPS, IMGS, FONTS, OUT = sys.argv[1:5]
PREVIEW = len(sys.argv) > 5 and sys.argv[5] == "preview"
W, H = 1080, 1920
FPS = 24
DS = 3 if PREVIEW else 1          # preview downscale
OW, OH = W // DS, H // DS
TT = 0.30                          # half transition (s)
SUB = 6
GOLD = (214, 178, 110)
WHITE = (255, 255, 255)

# foreground band: 4:3 crop of the 16:9 clip, 1080 wide
FW, FH = 1080, 810
FY = 520                           # top of band

def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)

# ------------------------------------------------------------ load clips
def read_clip(path):
    w, h = 1280, 720
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)

clips = [read_clip(os.path.join(CLIPS, f"{i}.mp4")) for i in range(1, 6)]
# end still: night exterior photo with slow push
still = Image.open(os.path.join(IMGS, "16.jpg")).convert("RGB")

SEGS = []
t = 0.0
for i, c in enumerate(clips):
    d = len(c) / FPS
    SEGS.append(dict(kind="clip", idx=i, start=t, dur=d))
    t += d
SEGS.append(dict(kind="still", start=t, dur=5.0))
TOTAL = t + 5.0
NF = int(round(TOTAL * FPS))

def ease_io(x):
    x = min(max(x, 0.0), 1.0)
    return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2

# ------------------------------------------------------------ compose one segment frame
def src_image(seg, local):
    """returns PIL image 16:9-ish source for this segment at local time."""
    if seg["kind"] == "clip":
        c = clips[seg["idx"]]
        fi = int(min(max(local * FPS, 0), len(c) - 1))
        return Image.fromarray(c[fi])
    # still: slow push-in + drift right, crop 16:9 window
    u = min(max(local / seg["dur"], 0), 1)
    iw, ih = still.size
    z = 1.0 + 0.10 * u
    cw, ch = iw / z, ih / z
    cx = iw * (0.48 + 0.04 * u)
    cy = ih * 0.52
    box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
    box = (max(0, box[0]), max(0, box[1]), min(iw, box[2]), min(ih, box[3]))
    return still.crop(tuple(int(v) for v in box)).resize((1280, 720), Image.LANCZOS)

def compose(seg, local):
    im = src_image(seg, local)
    # background: fill, blurred, darkened
    bg = im.resize((160, 90), Image.BILINEAR)
    bw = int(90 * W / H)
    bg = bg.crop(((160 - bw) // 2, 0, (160 - bw) // 2 + bw, 90)).filter(ImageFilter.GaussianBlur(4))
    bg = bg.resize((OW, OH), Image.BICUBIC)
    frame = np.asarray(bg, np.float32) * 0.42
    # foreground: center 4:3 crop of 1280x720 => 960x720
    fg = im.crop((160, 0, 1120, 720)).resize((FW // DS, FH // DS), Image.LANCZOS)
    fy = FY // DS
    frame[fy:fy + FH // DS, :] = np.asarray(fg, np.float32)
    return frame

def shift(img, ox):
    out = np.zeros_like(img)
    ox = int(round(ox))
    if abs(ox) >= OW:
        return out
    if ox >= 0:
        out[:, ox:] = img[:, :OW - ox]
    else:
        out[:, :OW + ox] = img[:, -ox:]
    return out

def frame_at(t):
    for i in range(len(SEGS) - 1):
        a, b = SEGS[i], SEGS[i + 1]
        c = b["start"]
        if c - TT <= t <= c + TT:
            u = (t - (c - TT)) / (2 * TT)
            e = ease_io(u)
            A = compose(a, min(t - a["start"], a["dur"] - 1e-3))
            B = compose(b, max(t - b["start"], 0))
            return shift(A, -e * OW) + shift(B, OW - e * OW)
    seg = [s for s in SEGS if t >= s["start"]][-1]
    return compose(seg, t - seg["start"])

def in_trans(t):
    return any(abs(t - s["start"]) <= TT + 0.03 for s in SEGS[1:])

# ------------------------------------------------------------ overlays (rendered at full res, then scaled)
def text_layer(lines, y, gap=22):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    boxes = []
    for txt, f, col in lines:
        bb = d.textbbox((0, 0), txt, font=f, direction="rtl", language="ar")
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
        x = (W - tw) / 2 - bb[0]
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(sh).text((x, y - bb[1]), txt, font=f, fill=(0, 0, 0, 160), direction="rtl", language="ar")
        layer = Image.alpha_composite(layer, sh.filter(ImageFilter.GaussianBlur(9)))
        d = ImageDraw.Draw(layer)
        d.text((x, y - bb[1]), txt, font=f, fill=col + (255,), direction="rtl", language="ar")
        boxes.append((x, y, tw, th))
        y += th + gap
    if DS > 1:
        layer = layer.resize((OW, OH), Image.LANCZOS)
    return np.asarray(layer, np.float32), boxes

F_BIG = font("cairo900.ttf", 84)
F_MED = font("taj500.ttf", 42)
F_SM = font("taj500.ttf", 32)
F_TAG = font("taj800.ttf", 30)

HEADER, HB = text_layer([("مشروع الندى", font("cairo900.ttf", 72), WHITE),
                         ("للإيجار  ·  حي العليا، الرياض", F_TAG, GOLD)], 250)

CAPS = [
    ("شقق فاخرة للإيجار", "تصميم عصري  ·  موقع مميز وسط الرياض"),
    ("٣ غرف نوم", "منها غرفتان ماستر  ·  مساحة ١٣٠ م² تقريباً"),
    ("مطبخ راكب", "نظام أمريكي  ·  تشطيبات فاخرة"),
    ("مسبح مشترك", "إطلالة مباشرة على المسبح"),
    ("نادي رياضي", "كوفي شوب  ·  صالة ألعاب  ·  استقبال"),
]
CAP_L = [text_layer([(a, F_BIG, WHITE), (b, F_MED, (235, 228, 214))], 1420) for a, b in CAPS]

END1, EB1 = text_layer([("للإيجار السنوي", F_MED, (235, 228, 214)),
                        ("110,000 ريال", font("cairo900.ttf", 120), GOLD),
                        ("خصم 5,000 ريال عند السداد دفعة واحدة", F_SM, WHITE)], 640)
END2, EB2 = text_layer([("للحجز والمعاينة", F_TAG, GOLD),
                        ("920033876  ·  0558297700", font("cairo700.ttf", 56), WHITE),
                        ("شارع عبدالله بن سليمان الحمدان، حي العليا", F_SM, (225, 220, 210)),
                        ("رقم رخصة الإعلان 7201005761", font("taj500.ttf", 24), (190, 185, 175))], 1150)

def comp(frame, layer, al, dy=0):
    if al <= 0.003:
        return frame
    a = layer[..., 3:4] / 255.0 * al
    rgb = layer[..., :3]
    if dy:
        a = np.roll(a, int(dy), 0); rgb = np.roll(rgb, int(dy), 0)
    return frame * (1 - a) + rgb * a

def rule(frame, y, w, prog, al):
    if al <= 0 or prog <= 0:
        return frame
    w = int(w * prog / DS); y = int(y / DS); h = max(1, 4 // DS)
    x0 = (OW - w) // 2
    frame[y:y + h, x0:x0 + w] = frame[y:y + h, x0:x0 + w] * (1 - al) + np.array(GOLD, np.float32) * al
    return frame

def eo(x):
    x = min(max(x, 0), 1)
    return 1 - (1 - x) ** 3

END_T = SEGS[-1]["start"] + 0.5

def overlays(fr, t):
    # thin gold frame lines around the band
    fy, fh = FY // DS, FH // DS
    for y in (fy - max(1, 3 // DS), fy + fh):
        fr[y:y + max(1, 3 // DS), :] = np.array(GOLD, np.float32) * 0.9
    # header (persistent until end card)
    hal = min(1, t / 0.6) * (1 - eo((t - END_T + 0.3) / 0.5))
    fr = comp(fr, HEADER, hal)
    # captions
    for i, s in enumerate(SEGS[:5]):
        a0 = s["start"] + (0.5 if i == 0 else 0.35)
        a1 = s["start"] + s["dur"] - 0.35
        if a0 - 0.05 <= t <= a1 + 0.35:
            fin = eo((t - a0) / 0.45)
            fout = min(1, max(0, (a1 + 0.3 - t) / 0.3))
            al = fin * fout
            dy = (1 - fin) * 36 / DS
            lay, boxes = CAP_L[i]
            fr = comp(fr, lay, al, dy)
            fr = rule(fr, 1392 + dy * DS, 140, eo((t - a0 - 0.1) / 0.6), al)
    # end card
    if t >= END_T - 0.3:
        k = eo((t - END_T + 0.3) / 0.8)
        fr = fr * (1 - 0.55 * k)
        f1 = eo((t - END_T) / 0.6)
        fr = comp(fr, END1, f1, (1 - f1) * 50 / DS)
        fr = rule(fr, 600, 220, eo((t - END_T - 0.2) / 0.7), f1)
        f2 = eo((t - END_T - 0.6) / 0.6)
        fr = comp(fr, END2, f2, (1 - f2) * 50 / DS)
    if t < 0.4:
        fr = fr * (t / 0.4)
    if t > TOTAL - 0.5:
        fr = fr * max(0, (TOTAL - t) / 0.5)
    return fr

def main():
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{OW}x{OH}", "-r", str(FPS),
           "-i", "-", "-an", "-c:v", "libx264", "-preset", "veryfast" if PREVIEW else "slow",
           "-crf", "26" if PREVIEW else "16", "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    sh = 0.8 / FPS
    for fi in range(NF):
        t = fi / FPS
        if in_trans(t):
            acc = np.zeros((OH, OW, 3), np.float32)
            for k in range(SUB):
                acc += frame_at(min(TOTAL - 1e-3, max(0, t + sh * (k / (SUB - 1) - 0.5))))
            fr = acc / SUB
        else:
            fr = frame_at(t)
        fr = overlays(fr, t)
        p.stdin.write(np.clip(fr, 0, 255).astype(np.uint8).tobytes())
        if fi % 120 == 0:
            print(f"{fi}/{NF}", flush=True)
    p.stdin.close(); p.wait()
    print("done", OUT, f"{TOTAL:.1f}s")

main()
