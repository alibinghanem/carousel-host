#!/usr/bin/env python3
"""مولّد الموسيقى الخلفية للريلز — يبنيها من الصفر، فلا حقوق ولا ملفات.

النبرة هادئة عمداً: طبقة هارمونية دافئة ونغمات متباعدة على سلّم خماسي،
بلا إيقاع وبلا مؤثرات انتقال — المحتوى التعليمي يحتاج خلفية لا تنافس
الصوت الداخلي للقارئ. صدى ستيريو خفيف يعطي اتساعاً دون ازدحام.

كل ريلز يأخذ بذرة من نصوصه، فيتغيّر المفتاح والسلّم والإيقاع بين منشور
وآخر، بينما تعطي إعادة التوليد لنفس المحتوى نفس الموسيقى.

الاستخدام كوحدة:
    from reel_audio import write_bed
    write_bed("bed.wav", duration=30.2, seed="عنوان الريلز")
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
    "sus_pent":   [0, 2, 5, 7, 10],
}
# جذور منخفضة تناسب النبرة الهادئة
ROOTS = {"G2": 98.00, "A2": 110.00, "C3": 130.81, "D3": 146.83, "E3": 164.81}
TEMPOS = [58, 64, 70, 76]


def _seeded(seed):
    return list(hashlib.sha256(str(seed).encode()).digest())


def write_bed(path, duration, seed="reel"):
    h = _seeded(seed)
    rname = list(ROOTS)[h[0] % len(ROOTS)]
    root = ROOTS[rname]
    sname = list(SCALES)[h[1] % len(SCALES)]
    scale = SCALES[sname]
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

    # ── الطبقة الهارمونية: جذر وخامس وأوكتاف، بانحراف طفيف يمنع الجمود ──
    for mult, gain, det in ((1.0, 0.20, 0.0), (1.5, 0.12, 0.5),
                            (2.0, 0.08, -0.7), (3.0, 0.04, 0.9)):
        f = root * mult
        for ch, sign in ((left, 1), (right, -1)):
            buf = []
            for i in range(n):
                t = i / SR
                # تموّج بطيء جداً في النغمة والسعة — تنفّس لا اهتزاز
                vib = 1 + 0.0025 * math.sin(2 * math.pi * 0.055 * t + mult)
                amp = 0.85 + 0.15 * math.sin(2 * math.pi * 0.031 * t + mult * 1.7)
                buf.append(math.sin(2 * math.pi * (f + det * sign) * vib * t) * amp)
            add(ch, 0, buf, gain)

    # ── نغمات متباعدة: واحدة كل نبضة ونصف، هجوم ناعم وذيل طويل ──
    step = beat * 1.5
    k = 0
    t = 0.0
    while t < duration - 0.8:
        deg = scale[(h[3 + (k % 24)] + k) % len(scale)]
        octv = 4 if (h[4 + (k % 18)] % 3) else 8      # أوكتافان فوق الجذر
        f = root * octv * (2 ** (deg / 12))
        m = int(min(2.6, step * 2.2) * SR)
        tone = []
        for i in range(m):
            x = i / SR
            env = (1 - math.exp(-x / 0.045)) * math.exp(-x / 0.95)
            tone.append((math.sin(2 * math.pi * f * x)
                         + 0.14 * math.sin(4 * math.pi * f * x)) * env)
        pan = 0.5 + 0.30 * math.sin(k * 0.9)
        add(left, t, tone, 0.075 * (1 - pan))
        add(right, t, tone, 0.075 * pan)
        k += 1
        t += step

    # ── صدى ستيريو خفيف: اتساع بلا ازدحام ──
    d_l = int(0.34 * SR)
    d_r = int(0.47 * SR)
    fb, mix = 0.26, 0.30
    for i in range(n):
        if i >= d_l:
            left[i] += left[i - d_l] * fb * mix
        if i >= d_r:
            right[i] += right[i - d_r] * fb * mix

    # ── ترشيح تمرير منخفض بسيط: يزيل الحدّة ويقرّب النبرة من الدفء ──
    a = 0.34
    pl = pr = 0.0
    for i in range(n):
        pl = pl + a * (left[i] - pl)
        pr = pr + a * (right[i] - pr)
        left[i], right[i] = pl, pr

    # ── التلاشي والتليين ──
    fi = int(1.4 * SR)
    fo = int(2.2 * SR)
    frames = bytearray()
    for i in range(n):
        g = 1.0
        if i < fi:
            g = (i / fi) ** 1.5
        elif i > n - fo:
            g = max(0.0, (n - i) / fo) ** 1.5
        for buf in (left, right):
            v = math.tanh(buf[i] * 1.6) * 0.42 * g
            frames += struct.pack("<h", int(max(-1, min(1, v)) * 32767))

    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(frames))
    return {"root": rname, "bpm": bpm, "scale": sname}


if __name__ == "__main__":
    import sys
    print(write_bed(sys.argv[1], float(sys.argv[2]),
                    seed=sys.argv[3] if len(sys.argv) > 3 else "reel"))
