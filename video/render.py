#!/usr/bin/env python3
"""Continuous 'one-take' camera-move real-estate ad renderer.
Usage: python3 render.py <imgs_dir> <fonts_dir> <out.mp4> [vertical|horizontal] [preview]
"""
import sys, math, subprocess, os, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

IMGS, FONTS, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
MODE = sys.argv[4] if len(sys.argv) > 4 else "vertical"
PREVIEW = len(sys.argv) > 5 and sys.argv[5] == "preview"
W, H = (1080, 1920) if MODE == "vertical" else (1920, 1080)
if PREVIEW:
    W, H = W // 3, H // 3
FPS = 30
S = W / 1080 if MODE == "vertical" else H / 1080   # ui scale
TT = 0.55          # transition half-length (s)
SUB = 7            # motion-blur subframes during transitions

GOLD = (214, 178, 110)
WHITE = (255, 255, 255)

def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), max(8, int(size * S)))

# ---------------------------------------------------------------- shots
# keyframes: (t 0..1, cx, cy, zoom, roll_deg, yaw)   - linear interpolation => constant camera speed
# trans: transition type INTO the next shot: 'whipR','whipL','push','tiltD'
V = MODE == "vertical"
SHOTS = [
    dict(img="02.jpg", dur=4.2, kf=[(0, .22 if V else .45, .55, 1.05, -1.5, .06), (1, .62 if V else .55, .45, 1.18, 0.5, -.02)], trans="whipR"),
    dict(img="01.jpg", dur=3.0, kf=[(0, .30 if V else .45, .50, 1.10, 0, .04), (1, .52, .55, 1.30, 0.8, -.03)], trans="push"),
    dict(img="07.jpg", dur=3.4, kf=[(0, .38 if V else .48, .52, 1.08, 0, -.04), (1, .62 if V else .55, .52, 1.32, 0, .03)], trans="whipR"),
    dict(img="09.jpg", dur=2.6, kf=[(0, .20 if V else .42, .50, 1.10, 0, .05), (1, .55 if V else .52, .48, 1.18, 0, -.02)], trans="push"),
    dict(img="10.jpg", dur=3.0, kf=[(0, .45 if V else .50, .50, 1.06, 0, -.03), (1, .62 if V else .54, .50, 1.28, 0, .02)], trans="whipL"),
    dict(img="14.jpg", dur=2.6, kf=[(0, .70 if V else .55, .50, 1.10, 0, -.05), (1, .40 if V else .46, .50, 1.18, 0, .03)], trans="whipL"),
    dict(img="11.jpg", dur=3.0, kf=[(0, .78 if V else .56, .50, 1.08, 0, -.04), (1, .42 if V else .47, .50, 1.20, 0, .03)], trans="push"),
    dict(img="12.jpg", dur=2.6, kf=[(0, .45 if V else .48, .52, 1.06, 0, .03), (1, .62 if V else .54, .50, 1.22, 0, -.02)], trans="whipR"),
    dict(img="13.jpg", dur=2.6, kf=[(0, .35 if V else .46, .50, 1.08, 0, .04), (1, .65 if V else .56, .50, 1.18, 0, -.03)], trans="tiltD"),
    dict(img="17.jpg", dur=3.4, kf=[(0, .50, .32, 1.15, 0, 0), (1, .50, .70, 1.12, 0, 0)], trans="push"),
    dict(img="18.jpg", dur=3.0, kf=[(0, .40 if V else .48, .55, 1.06, 0, .04), (1, .62 if V else .54, .58, 1.26, 0, -.02)], trans="whipR"),
    dict(img="21.jpg", dur=2.6, kf=[(0, .30 if V else .45, .55, 1.08, 0, .04), (1, .55 if V else .53, .55, 1.20, 0, -.02)], trans="push"),
    dict(img="16.jpg", dur=6.2, kf=[(0, .55 if V else .52, .55, 1.35, 0, -.02), (.55, .45 if V else .50, .52, 1.06, 0, .01), (1, .44 if V else .50, .52, 1.02, 0, .01)], trans=None),
]

# captions: (shot index, line1, line2)
CAPS = {
    0: ("شقق فاخرة للإيجار", "مشروع الندى  ·  حي العليا، الرياض"),
    2: ("٣ غرف نوم", "منها غرفتان ماستر  ·  صالة وسفرة طعام"),
    4: ("مطبخ راكب", "نظام أمريكي بتشطيبات فاخرة"),
    6: ("مساحة ١٣٠ م²", "تقريباً  ·  مكيفات سبليت"),
    7: ("٢ دورات مياه", "تشطيب رخامي راقٍ"),
    8: ("غرف نوم واسعة", "موقف خاص  ·  عداد كهرباء مستقل"),
    9: ("مسبح مشترك", "إطلالة مباشرة على المسبح"),
    11: ("نادي رياضي", "كوفي شوب  ·  صالة ألعاب  ·  استقبال"),
}

# timeline
t0 = 0.0
for s in SHOTS:
    s["start"] = t0
    t0 += s["dur"]
TOTAL = t0
NF = int(round(TOTAL * FPS))

# ---------------------------------------------------------------- images
_cache = {}
def load(name):
    if name not in _cache:
        im = Image.open(os.path.join(IMGS, name)).convert("RGB")
        # pre-upscale + gentle sharpening for better detail when cropping
        im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=2.2, percent=70, threshold=2))
        im = ImageEnhance.Contrast(im).enhance(1.06)
        im = ImageEnhance.Color(im).enhance(1.08)
        _cache[name] = im
    return _cache[name]

def ease_in(x):  return x ** 3
def ease_out(x): return 1 - (1 - x) ** 3

def cam_at(shot, local):
    """base camera for shot at local time (may be <0 or >dur => extrapolate linearly)."""
    kf = shot["kf"]
    u = local / shot["dur"]
    if u <= kf[0][0]:
        a, b = kf[0], kf[1]
    elif u >= kf[-1][0]:
        a, b = kf[-2], kf[-1]
    else:
        for i in range(len(kf) - 1):
            if kf[i][0] <= u <= kf[i + 1][0]:
                a, b = kf[i], kf[i + 1]
                break
    f = (u - a[0]) / (b[0] - a[0])
    if shot["trans"] is None and len(kf) > 2:   # final shot: smooth settle
        f = f if a is not kf[-2] else 1 - (1 - min(max(f, 0), 1)) ** 2
    return [a[i] + (b[i] - a[i]) * f for i in range(1, 6)]

def quad_for(img, cx, cy, z, roll, yaw, dx=0.0, dy=0.0, zx=1.0):
    iw, ih = img.size
    ch = min(ih, iw * H / W) / (z * zx)
    cw = ch * W / H
    # rotation/keystone need margin: grow bbox estimate and fit
    c, s_ = math.cos(math.radians(roll)), math.sin(math.radians(roll))
    hw, hh = cw / 2, ch / 2
    corners = [(-hw, -hh * (1 + yaw)), (-hw, hh * (1 + yaw)), (hw, hh * (1 - yaw)), (hw, -hh * (1 - yaw))]
    pts = [(x * c - y * s_, x * s_ + y * c) for x, y in corners]
    bw = max(p[0] for p in pts) - min(p[0] for p in pts)
    bh = max(p[1] for p in pts) - min(p[1] for p in pts)
    k = min(1.0, iw / bw, ih / bh)
    pts = [(x * k, y * k) for x, y in pts]
    bw, bh = bw * k, bh * k
    X = cx * iw + dx * (cw * k) / W
    Y = cy * ih + dy * (ch * k) / H
    X = min(max(X, bw / 2), iw - bw / 2)
    Y = min(max(Y, bh / 2), ih - bh / 2)
    q = []
    for x, y in pts:
        q += [X + x, Y + y]
    return tuple(q)

def render_shot(shot, local, extra):
    img = load(shot["img"])
    cx, cy, z, roll, yaw = cam_at(shot, local)
    q = quad_for(img, cx, cy, z, roll, yaw, **extra)
    return np.asarray(img.transform((W, H), Image.QUAD, q, resample=Image.BICUBIC), dtype=np.float32)

def ease_io(x):
    x = min(max(x, 0.0), 1.0)
    return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2

def shift(img, ox, oy):
    """translate image by (ox,oy) output pixels, filling with black."""
    out = np.zeros_like(img)
    ox, oy = int(round(ox)), int(round(oy))
    if abs(ox) >= W or abs(oy) >= H:
        return out
    ys, yd = (slice(0, H - oy), slice(oy, H)) if oy >= 0 else (slice(-oy, H), slice(0, H + oy))
    xs, xd = (slice(0, W - ox), slice(ox, W)) if ox >= 0 else (slice(-ox, W), slice(0, W + ox))
    out[yd, xd] = img[ys, xs]
    return out

def frame_at(t):
    # transition windows centered on cuts
    for i, s in enumerate(SHOTS[:-1]):
        c = s["start"] + s["dur"]
        if c - TT <= t <= c + TT:
            nxt = SHOTS[i + 1]
            u = (t - (c - TT)) / (2 * TT)
            kind = s["trans"]
            if kind in ("whipR", "whipL", "tiltD"):
                e = ease_io(u)
                A = render_shot(s, t - s["start"], {})
                B = render_shot(nxt, t - nxt["start"], {})
                if kind == "whipR":
                    return shift(A, -e * W, 0) + shift(B, W - e * W, 0)
                if kind == "whipL":
                    return shift(A, e * W, 0) + shift(B, -W + e * W, 0)
                return shift(A, 0, -e * H) + shift(B, 0, H - e * H)
            # push: fly into A, dissolve into B
            za = 1 + 1.6 * ease_in(min(1.0, u / 0.62))
            m = ease_io((u - 0.38) / 0.4)
            out = None
            if m < 1:
                out = render_shot(s, t - s["start"], dict(zx=za)) * (1 - m)
            if m > 0:
                b = render_shot(nxt, t - nxt["start"], {}) * m
                out = b if out is None else out + b
            # exposure bloom at the crossing
            return out * (1 + 0.35 * math.sin(math.pi * min(1, max(0, (u - .3) / .5))))
    idx = 0
    for i, s in enumerate(SHOTS):
        if t >= s["start"]:
            idx = i
    s = SHOTS[idx]
    return render_shot(s, t - s["start"], {})

def in_transition(t):
    for i, s in enumerate(SHOTS[:-1]):
        e = s["start"] + s["dur"]
        if e - TT - 0.05 <= t <= e + TT + 0.05 and s["trans"]:
            return True
    return False

# ---------------------------------------------------------------- overlays
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
VIGNETTE = (1 - 0.28 * np.clip(r - 0.55, 0, 1) ** 1.6)[..., None]
grad_bot = np.clip((yy - H * 0.55) / (H * 0.45), 0, 1) ** 1.3
grad_top = np.clip((H * 0.22 - yy) / (H * 0.22), 0, 1) ** 1.5
SHADE = (1 - 0.62 * grad_bot - 0.35 * grad_top)[..., None]

def text_layer(lines, anchor_y, align="center"):
    """lines: list of (text, font, color). returns RGBA Image and its height."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    y = anchor_y
    boxes = []
    for txt, f, col in lines:
        bb = d.textbbox((0, 0), txt, font=f, direction="rtl", language="ar")
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
        x = (W - tw) / 2 - bb[0] if align == "center" else W - 70 * S - tw - bb[0]
        # soft shadow
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(sh).text((x, y - bb[1]), txt, font=f, fill=(0, 0, 0, 170), direction="rtl", language="ar")
        sh = sh.filter(ImageFilter.GaussianBlur(10 * S))
        layer = Image.alpha_composite(layer, sh)
        d = ImageDraw.Draw(layer)
        d.text((x, y - bb[1]), txt, font=f, fill=col + (255,), direction="rtl", language="ar")
        boxes.append((x, y, tw, th))
        y += th + 26 * S
    return layer, boxes

F_BIG = font("cairo900.ttf", 92 if V else 84)
F_MED = font("taj500.ttf", 44 if V else 40)
F_SM = font("taj500.ttf", 32 if V else 30)
F_TAG = font("taj800.ttf", 30 if V else 28)

CAP_LAYERS = {}
for i, (l1, l2) in CAPS.items():
    y = H * (0.70 if V else 0.68)
    lay, boxes = text_layer([(l1, F_BIG, WHITE), (l2, F_MED, (235, 228, 214))], y)
    # gold rule under heading
    CAP_LAYERS[i] = (np.asarray(lay, dtype=np.float32), boxes)

def premult(layer_np, alpha_mul, dy):
    a = layer_np[..., 3:4] / 255.0 * alpha_mul
    rgb = layer_np[..., :3]
    if dy:
        a = np.roll(a, int(dy), axis=0)
        rgb = np.roll(rgb, int(dy), axis=0)
    return rgb, a

def comp(frame, layer_np, alpha_mul, dy=0):
    if alpha_mul <= 0.003:
        return frame
    rgb, a = premult(layer_np, alpha_mul, dy)
    return frame * (1 - a) + rgb * a

def gold_rule(frame, cx, y, w_full, prog, alpha):
    if alpha <= 0 or prog <= 0:
        return frame
    w = int(w_full * prog)
    hgt = max(2, int(5 * S))
    x0 = int(cx - w / 2)
    y = int(y)
    frame[y:y + hgt, max(0, x0):min(W, x0 + w)] = (
        frame[y:y + hgt, max(0, x0):min(W, x0 + w)] * (1 - alpha) + np.array(GOLD, np.float32) * alpha)
    return frame

# end card
END_START = SHOTS[-1]["start"] + 1.4
end_lines = [
    ("للإيجار السنوي", F_MED, (235, 228, 214)),
    ("110,000 ريال", font("cairo900.ttf", 120 if V else 110), GOLD),
    ("خصم 5,000 ريال عند السداد دفعة واحدة", F_SM, WHITE),
]
END_L1, END_B1 = text_layer(end_lines, H * (0.36 if V else 0.22))
END_L1 = np.asarray(END_L1, dtype=np.float32)
contact = [
    ("للحجز والمعاينة", F_TAG, GOLD),
    ("920033876  ·  0558297700", font("cairo700.ttf", 54 if V else 50), WHITE),
    ("مشروع الندى  ·  شارع عبدالله بن سليمان الحمدان، العليا", F_SM, (225, 220, 210)),
    ("رقم رخصة الإعلان 7201005761", font("taj500.ttf", 24 if V else 22), (190, 185, 175)),
]
END_L2, END_B2 = text_layer(contact, H * (0.62 if V else 0.60))
END_L2 = np.asarray(END_L2, dtype=np.float32)

TOP_TAG, _ = text_layer([("حي العليا  ·  الرياض", F_TAG, GOLD)], 110 * S)
TOP_TAG = np.asarray(TOP_TAG, dtype=np.float32)

def overlays(frame, t):
    frame = frame * SHADE
    # captions
    for i, layer in CAP_LAYERS.items():
        s = SHOTS[i]
        a0 = s["start"] + (0.35 if i else 0.6)
        a1 = s["start"] + s["dur"] - 0.25
        if i in (0,):
            a1 = s["start"] + s["dur"] - 0.35
        if a0 - 0.1 <= t <= a1 + 0.4:
            fin = min(1, max(0, (t - a0) / 0.45))
            fout = min(1, max(0, (a1 + 0.35 - t) / 0.35))
            al = ease_out(fin) * fout
            dy = (1 - ease_out(fin)) * 40 * S
            lay, boxes = layer
            frame = comp(frame, lay, al, dy)
            bx = boxes[0]
            frame = gold_rule(frame, W / 2, bx[1] - 34 * S + dy, 150 * S, ease_out(min(1, max(0, (t - a0 - 0.1) / 0.6))), al)
    # small location tag on opening
    if t < SHOTS[0]["dur"]:
        al = min(1, t / 0.8) * min(1, max(0, (SHOTS[0]["dur"] - 0.3 - t) / 0.4))
        frame = comp(frame, TOP_TAG, al)
    # end card
    if t >= END_START - 0.2:
        k = min(1, (t - END_START + 0.2) / 1.0)
        frame = frame * (1 - 0.5 * ease_out(k))
        f1 = min(1, max(0, (t - END_START) / 0.6))
        frame = comp(frame, END_L1, ease_out(f1), (1 - ease_out(f1)) * 50 * S)
        frame = gold_rule(frame, W / 2, END_B1[0][1] - 40 * S, 220 * S, ease_out(min(1, max(0, (t - END_START - 0.2) / 0.8))), ease_out(f1))
        f2 = min(1, max(0, (t - END_START - 0.7) / 0.6))
        frame = comp(frame, END_L2, ease_out(f2), (1 - ease_out(f2)) * 50 * S)
    # global fade in/out
    if t < 0.5:
        frame = frame * (t / 0.5)
    if t > TOTAL - 0.6:
        frame = frame * max(0, (TOTAL - t) / 0.6)
    return frame

# ---------------------------------------------------------------- audio
def make_audio(path, dur, sr=44100):
    n = int(dur * sr)
    t = np.arange(n) / sr
    out = np.zeros(n, np.float64)
    def note(f):
        return 440 * 2 ** ((f - 69) / 12)
    chords = [[57, 64, 69, 72, 76], [53, 60, 65, 69, 72], [48, 55, 64, 67, 72], [55, 62, 67, 71, 74]]
    clen = 4.0
    for ci in range(int(dur / clen) + 2):
        ch = chords[ci % 4]
        st = ci * clen
        i0, i1 = int(max(0, st - 0.5) * sr), int(min(dur, st + clen + 1.5) * sr)
        if i0 >= n:
            break
        tt = t[i0:i1] - st
        env = np.clip((tt + 0.5) / 1.4, 0, 1) * np.clip((clen + 1.5 - tt) / 1.8, 0, 1)
        for m in ch:
            fr = note(m)
            for det in (-0.25, 0.25):
                out[i0:i1] += env * 0.045 * np.sin(2 * np.pi * (fr + det) * tt + m)
            out[i0:i1] += env * 0.012 * np.sin(2 * np.pi * fr * 2 * tt)
        # bass
        fr = note(ch[0] - 12)
        out[i0:i1] += env * 0.09 * np.sin(2 * np.pi * fr * tt)
    # soft pulse (heartbeat-ish kick) every beat at 96bpm
    beat = 60 / 96
    for k in range(int(dur / beat)):
        bt = k * beat
        if bt < 1.5 or bt > dur - 3:
            continue
        i0 = int(bt * sr); L = int(0.35 * sr)
        tt = np.arange(min(L, n - i0)) / sr
        out[i0:i0 + len(tt)] += 0.22 * np.sin(2 * np.pi * (48 + 60 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9)
        # shaker
        if k % 2 == 1:
            Ls = int(0.08 * sr)
            nz = np.random.default_rng(k).standard_normal(min(Ls, n - i0))
            nz = np.diff(np.concatenate([[0], nz]))
            out[i0:i0 + len(nz)] += 0.025 * nz * np.exp(-np.arange(len(nz)) / sr * 40)
    # whooshes at transitions
    rng = np.random.default_rng(1)
    for s in SHOTS[:-1]:
        c = s["start"] + s["dur"]
        L = int(1.1 * sr); i0 = int((c - 0.6) * sr)
        if i0 < 0 or i0 + L > n:
            continue
        nz = rng.standard_normal(L)
        # moving lowpass via cumulative smoothing with varying coefficient
        y = np.zeros(L); a = 0.0; prev = 0.0
        for j in range(L):
            u = j / L
            a = 0.02 + 0.35 * math.sin(math.pi * u) ** 2
            prev = prev + a * (nz[j] - prev); y[j] = prev
        env = np.sin(np.pi * np.linspace(0, 1, L)) ** 2
        out[i0:i0 + L] += 0.33 * y * env
    # simple reverb
    rev = out.copy()
    for d, g in ((0.071, .35), (0.113, .28), (0.167, .22), (0.239, .16), (0.331, .1)):
        k = int(d * sr)
        rev[k:] += g * out[:-k]
    out = rev
    fade = np.clip(t / 1.0, 0, 1) * np.clip((dur - t) / 2.0, 0, 1)
    out *= fade
    out = np.tanh(out * 1.6) / 1.6
    out /= max(1e-6, np.abs(out).max()) / 0.85
    st = np.stack([out, np.roll(out, 300)], 1)
    pcm = (st * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())

# ---------------------------------------------------------------- main
def main():
    wav = OUT + ".wav"
    make_audio(wav, TOTAL)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
           "-i", "-", "-i", wav, "-c:v", "libx264", "-preset", "veryfast" if PREVIEW else "slow", "-crf", "28" if PREVIEW else "17",
           "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", OUT]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    shutter = 0.75 / FPS
    for fi in range(NF):
        t = fi / FPS
        if in_transition(t):
            acc = np.zeros((H, W, 3), np.float32)
            for k in range(SUB):
                acc += frame_at(min(TOTAL - 1e-3, t + shutter * (k / (SUB - 1) - 0.5)))
            fr = acc / SUB
        else:
            fr = frame_at(t)
        fr = fr * VIGNETTE
        fr = overlays(fr, t)
        p.stdin.write(np.clip(fr, 0, 255).astype(np.uint8).tobytes())
        if fi % 150 == 0:
            print(f"{fi}/{NF}", flush=True)
    p.stdin.close(); p.wait()
    os.remove(wav)
    print("done", OUT, f"{TOTAL:.1f}s")

if __name__ == "__main__":
    main()
