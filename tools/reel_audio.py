#!/usr/bin/env python3
"""موسيقى الريلز — تُؤلَّف وتُركَّب من الصفر، فلا حقوق ولا ملفات صوتية.

ليست خلفية سلبية: هناك دورة كوردات، وباص يمشي معها، وأربيجيو جرسي يعطي
حركة، وطبقة عليا تلمع. الهدف صوت مُمتِع يُسمع بذاته لا مجرّد طنين هادئ،
مع بقائه بلا إيقاع صاخب وبلا مؤثرات انتقال — النبض يأتي من تنفّس خفيف في
سعة الطبقة الهارمونية لا من طبل.

كل ريلز يأخذ بذرته من نصوصه: يتغيّر المفتاح ودورة الكوردات والإيقاع بين
منشور وآخر، بينما تعطي إعادة التوليد لنفس المحتوى نفس الموسيقى تماماً.

الاستخدام كوحدة:
    from reel_audio import write_bed
    write_bed("bed.wav", duration=30.2, seed="عنوان الريلز")
"""
import hashlib
import subprocess
import sys
import wave

SR = 44100


def _np():
    try:
        import numpy
    except ImportError:
        subprocess.run([sys.executable, "-m", "pip", "install", "numpy",
                        "--break-system-packages", "-q"], check=False)
        import numpy
    return numpy


# درجات الكورد بنصف الأصوات فوق جذره
VOICING = {
    "maj":   [0, 4, 7],
    "maj7":  [0, 4, 7, 11],
    "maj9":  [0, 4, 7, 14],
    "min":   [0, 3, 7],
    "min7":  [0, 3, 7, 10],
    "min9":  [0, 3, 7, 14],
    "sus":   [0, 5, 7],
    "sus9":  [0, 5, 7, 14],
}

# دورات كوردات مجرَّبة — كل عنصر (إزاحة الجذر بنصف الصوت، نوع الكورد)
PROGRESSIONS = {
    # مشرقة ودافئة: I – V – vi – IV
    "warm":  [(0, "maj9"), (7, "maj"), (9, "min7"), (5, "maj7")],
    # حنين هادئ: i – VI – III – VII
    "calm":  [(0, "min9"), (8, "maj7"), (3, "maj"), (10, "maj")],
    # معلّقة ومتفائلة، بلا حسم: I – IV – Vsus – vi
    "open":  [(0, "maj"), (5, "maj9"), (7, "sus9"), (9, "min7")],
    # حالمة: vi – IV – I – V
    "dream": [(9, "min7"), (5, "maj7"), (0, "maj9"), (7, "sus")],
}

# جذور في أوكتاف الباص
ROOTS = {"F2": 87.31, "G2": 98.00, "A2": 110.00, "Bb2": 116.54,
         "C3": 130.81, "D3": 146.83}
TEMPOS = [76, 82, 88, 94]

# أنماط الأربيجيو: ترتيب درجات الكورد الذي تمشي عليه النغمات
ARPS = [[0, 1, 2, 1], [0, 2, 1, 2], [0, 1, 2, 3], [2, 0, 1, 0]]


def _seeded(seed):
    return list(hashlib.sha256(str(seed).encode()).digest())


def write_bed(path, duration, seed="reel"):
    np = _np()
    h = _seeded(seed)

    rname = list(ROOTS)[h[0] % len(ROOTS)]
    root = ROOTS[rname]
    pname = list(PROGRESSIONS)[h[1] % len(PROGRESSIONS)]
    prog = PROGRESSIONS[pname]
    bpm = TEMPOS[h[2] % len(TEMPOS)]
    arp = ARPS[h[3] % len(ARPS)]

    beat = 60.0 / bpm
    bar = beat * 4                     # كورد واحد لكل مازورة
    n = int(duration * SR)
    left = np.zeros(n, dtype=np.float64)
    right = np.zeros(n, dtype=np.float64)

    def semis(x):
        return 2.0 ** (x / 12.0)

    def note(f, dur, atk, dec, sus, rel, parts, vib=0.0):
        """نغمة واحدة بمظروف ADSR ومكوّنات توافقية اختيارية."""
        m = int((dur + rel) * SR)
        if m <= 0:
            return None
        x = np.arange(m) / SR
        env = np.empty(m)
        ia = max(1, int(atk * SR))
        idc = max(1, int(dec * SR))
        ie = min(m, int(dur * SR))
        env[:min(ia, m)] = np.linspace(0, 1, min(ia, m))
        if ie > ia:
            d = np.exp(-np.arange(ie - ia) / (idc + 1e-9))
            env[ia:ie] = sus + (1 - sus) * d
        if m > ie:
            tail = env[ie - 1] if ie > 0 else 1.0
            env[ie:] = tail * np.exp(-np.arange(m - ie) / (rel * SR + 1e-9) * 3)
        ph = 2 * np.pi * f * x
        if vib:
            ph = ph + vib * np.sin(2 * np.pi * 0.06 * x)
        sig = np.zeros(m)
        for k, g in parts:
            sig += g * np.sin(ph * k)
        return sig * env

    def add(buf, start, sig, gain):
        if sig is None:
            return
        i0 = int(start * SR)
        if i0 >= n:
            return
        m = min(len(sig), n - i0)
        if m > 0:
            buf[i0:i0 + m] += sig[:m] * gain

    def stereo(start, sig, gain, pan):
        add(left, start, sig, gain * (1 - pan))
        add(right, start, sig, gain * pan)

    nbars = int(duration / bar) + 2
    for b in range(nbars):
        t0 = b * bar
        if t0 > duration:
            break
        croot, quality = prog[b % len(prog)]
        tones = VOICING[quality]

        # ── الباص: نغمة واحدة في المازورة، جيب نقي بذيل طويل ──
        fb = root * semis(croot) / 2
        add(left, t0, note(fb, bar * 0.92, 0.03, 0.55, 0.55, 0.5,
                           [(1, 1.0), (2, 0.22)]), 0.25)
        add(right, t0, note(fb, bar * 0.92, 0.03, 0.55, 0.55, 0.5,
                            [(1, 1.0), (2, 0.22)]), 0.25)

        # ── الطبقة الهارمونية: كل درجات الكورد، دخول ناعم وتبادل يسار/يمين ──
        for j, deg in enumerate(tones):
            f = root * 2 * semis(croot + deg)
            sig = note(f, bar * 0.98, 0.55, 1.8, 0.82, 0.9,
                       [(1, 1.0), (2, 0.30), (3, 0.12)], vib=0.02)
            pan = 0.5 + (0.22 if j % 2 else -0.22)
            stereo(t0, sig, 0.115, pan)

        # ── الأربيجيو: ثماني نغمات في المازورة، جرسية قصيرة الذيل ──
        for s in range(8):
            ts = t0 + s * (beat / 2)
            if ts > duration:
                break
            deg = tones[arp[s % len(arp)] % len(tones)]
            octv = 8 if (s % 4 == 0) else 4
            f = root * octv * semis(croot + deg)
            sig = note(f, 0.30, 0.006, 0.14, 0.0, 0.45,
                       [(1, 1.0), (2, 0.28), (3, 0.10)])
            # حركة بانورامية بطيئة تجعل النغمات تتنقّل بين الأذنين
            pan = 0.5 + 0.34 * float(np.sin((b * 8 + s) * 0.7))
            gain = 0.10 * (1.0 if s % 4 == 0 else 0.64)
            stereo(ts, sig, gain, pan)

        # ── لمعة عالية: نغمة واحدة كل مازورتين، خافتة وطويلة ──
        if b % 2 == 0:
            f = root * 16 * semis(croot + tones[-1])
            sig = note(f, bar * 1.2, 0.9, 2.2, 0.5, 1.4, [(1, 1.0)])
            stereo(t0, sig, 0.022, 0.5)

    # ── تنفّس خفيف على النبضة: نبض بلا طبل ──
    x = np.arange(n) / SR
    pulse = 0.90 + 0.10 * (0.5 + 0.5 * np.cos(2 * np.pi * x / beat))
    left *= pulse
    right *= pulse

    # ── صدى ستيريو بثلاث نقرات: اتساع وعمق ──
    for delay, fb_g in ((0.28, 0.30), (0.41, 0.20), (0.63, 0.11)):
        d = int(delay * SR)
        if d < n:
            left[d:] += right[:n - d] * fb_g * 0.5
            right[d:] += left[:n - d] * fb_g * 0.45

    # ── ترشيح تمرير منخفض من الدرجة الأولى: يزيل الحدّة ويدفّئ النبرة ──
    a = 0.42
    for buf in (left, right):
        # مرشّح IIR بسيط عبر lfilter اليدوي — الحلقة على الإشارة مرة واحدة
        acc = 0.0
        out = np.empty_like(buf)
        for i in range(n):
            acc += a * (buf[i] - acc)
            out[i] = acc
        buf[:] = out

    # ── قطع ما تحت ~45 هرتز: هدير لا يُسمع على الهاتف ويأكل من مدى الترميز
    for buf in (left, right):
        prev = 0.0
        out = np.empty_like(buf)
        for i in range(n):
            prev += 0.0064 * (buf[i] - prev)
            out[i] = buf[i] - prev
        buf[:] = out

    # ── التلاشي، التليين، والتطبيع إلى مستوى نشر مريح ──
    fi, fo = int(1.1 * SR), int(2.4 * SR)
    g = np.ones(n)
    g[:fi] = np.linspace(0, 1, fi) ** 1.4
    g[n - fo:] = np.linspace(1, 0, fo) ** 1.4
    left *= g
    right *= g

    peak = max(float(np.max(np.abs(left))), float(np.max(np.abs(right))), 1e-9)
    left = np.tanh(left / peak * 1.25) * 0.62
    right = np.tanh(right / peak * 1.25) * 0.62

    inter = np.empty(n * 2, dtype=np.float64)
    inter[0::2] = left
    inter[1::2] = right
    pcm = np.clip(inter, -1, 1) * 32767

    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.astype("<i2").tobytes())

    rms = float(np.sqrt(np.mean(inter ** 2)))
    return {"root": rname, "bpm": bpm, "scale": pname,
            "rms_db": round(20 * float(np.log10(rms + 1e-12)), 1)}


if __name__ == "__main__":
    print(write_bed(sys.argv[1], float(sys.argv[2]),
                    seed=sys.argv[3] if len(sys.argv) > 3 else "reel"))
