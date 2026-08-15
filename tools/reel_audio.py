#!/usr/bin/env python3
"""مولّد الموسيقى الخلفية للريلز — يبنيها من الصفر، فلا حقوق ولا ملفات.

الصوت مركّب برمجياً: طبقة هارمونية هادئة، أربيجيو على سلّم خماسي، نبضة
إيقاع خفيفة، وضربات مزامنة عند لحظات الانتقال بالضبط. كل ريلز يأخذ بذرة
مختلفة فيتغيّر المفتاح والإيقاع والنمط — لا تتكرر الموسيقى.

الاستخدام كوحدة:
    from reel_audio import write_bed
    write_bed("bed.wav", duration=30.2, cuts=[3.8, 9.2, 15.4], seed="2026-08-15")
"""
import hashlib
import math
import struct
import wave

SR = 44100

# سلالم خماسية — نصف أصوات فوق الجذر
SCALES = {
    "major_pent": [0, 2, 4, 7, 9],
    "minor_pent": [0, 3, 5, 7, 10],
    "lydian_pent": [0, 2, 6, 7, 11],
}
ROOTS = {"A": 220.0, "C": 261.63, "D": 293.66, "E": 329.63, "G": 392.00}
TEMPOS = [82, 88, 94, 100]


def _seeded(seed):
    """قيم ثابتة لنفس البذرة — نفس المحتوى يعطي نفس الموسيقى."""
    h = hashlib.sha256(str(seed).encode()).digest()
    return [b for b in h]


def _env(n, attack, release, sr=SR):
    """مغلّف بسيط: صعود ثم هبوط أسّي."""
    out = []
    a = max(1, int(attack * sr))
    for i in range(n):
        if i < a:
            e = i / a
        else:
            e = math.exp(-(i - a) / (release * sr))
        out.append(e)
    return out


def write_bed(path, duration, cuts=(), seed="reel"):
    h = _seeded(seed)
    root = ROOTS[list(ROOTS)[h[0] % len(ROOTS)]]
    scale = SCALES[list(SCALES)[h[1] % len(SCALES)]]
    bpm = TEMPOS[h[2] % len(TEMPOS)]
    beat = 60.0 / bpm

    n = int(duration * SR)
    left = [0.0] * n
    right = [0.0] * n

    def add(buf, start, samples, gain=1.0):
        i0 = int(start * SR)
        for k, v in enumerate(samples):
            j = i0 + k
            if 0 <= j < n:
                buf[j] += v * gain

    # ── طبقة هارمونية: جذر + خامس + أوكتاف، مع انحراف طفيف يعطي حياة ──
    for mult, gain, det in ((1.0, 0.16, 0.0), (1.5, 0.10, 0.6), (2.0, 0.07, -0.9)):
        f = root * mult
        for ch, sign in ((left, 1), (right, -1)):
            buf = []
            for i in range(n):
                t = i / SR
                lfo = 1 + 0.004 * math.sin(2 * math.pi * 0.07 * t + mult)
                buf.append(math.sin(2 * math.pi * (f + det * sign) * lfo * t))
            add(ch, 0, buf, gain)

    # ── أربيجيو: نغمة كل نصف نبضة، تتحرك في السلّم ──
    step = beat / 2
    k = 0
    t = 0.0
    while t < duration - 0.4:
        deg = scale[(h[3 + (k % 20)] + k) % len(scale)]
        octv = 2 if (h[4 + (k % 15)] % 4) else 4
        f = root * octv * (2 ** (deg / 12))
        dur = step * 1.7
        m = int(dur * SR)
        env = _env(m, 0.004, 0.16)
        tone = [(math.sin(2 * math.pi * f * (i / SR))
                 + 0.28 * math.sin(4 * math.pi * f * (i / SR))) * env[i]
                for i in range(m)]
        pan = 0.5 + 0.35 * math.sin(k * 1.1)
        add(left, t, tone, 0.085 * (1 - pan))
        add(right, t, tone, 0.085 * pan)
        k += 1
        t += step

    # ── نبضة إيقاع: كيك ناعم على النبضة الأولى والثالثة ──
    t = 0.0
    b = 0
    while t < duration - 0.3:
        if b % 4 in (0, 2):
            m = int(0.22 * SR)
            env = _env(m, 0.001, 0.055)
            kick = [math.sin(2 * math.pi * (95 * math.exp(-(i / SR) * 12) + 42)
                             * (i / SR)) * env[i] for i in range(m)]
            add(left, t, kick, 0.30)
            add(right, t, kick, 0.30)
        b += 1
        t += beat

    # ── ضربات مزامنة عند الانتقالات: ضجيج مرشّح يصعد ثم ينكسر ──
    rng = h[5]
    for c in cuts:
        m = int(0.55 * SR)
        prev = 0.0
        sw = []
        for i in range(m):
            rng = (rng * 1103515245 + 12345) % 2147483648
            white = (rng / 2147483648) * 2 - 1
            prev = prev * 0.86 + white * 0.14          # ترشيح تمرير منخفض
            p = i / m
            sw.append(prev * (p ** 2) * (1 - p) * 4)
        add(left, max(0, c - 0.5), sw, 0.55)
        add(right, max(0, c - 0.5), sw, 0.55)

    # ── المعالجة النهائية: تليين، ثم تلاشٍ عند الطرفين ──
    fade_in = int(0.6 * SR)
    fade_out = int(1.4 * SR)
    frames = bytearray()
    for i in range(n):
        g = 1.0
        if i < fade_in:
            g = i / fade_in
        elif i > n - fade_out:
            g = max(0.0, (n - i) / fade_out)
        for buf in (left, right):
            v = math.tanh(buf[i] * 0.9) * 0.62 * g
            frames += struct.pack("<h", int(max(-1, min(1, v)) * 32767))

    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(frames))
    return {"root": root, "bpm": bpm,
            "scale": [k for k, v in SCALES.items() if v == scale][0]}


if __name__ == "__main__":
    import sys
    info = write_bed(sys.argv[1], float(sys.argv[2]),
                     cuts=[float(x) for x in (sys.argv[3].split(",") if len(sys.argv) > 3 and sys.argv[3] else [])],
                     seed=sys.argv[4] if len(sys.argv) > 4 else "reel")
    print(info)
