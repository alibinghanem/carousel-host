#!/usr/bin/env python3
"""موسيقى الريلز القصير مع تصميم صوتي عند القطعات.

الفرق عن reel_audio.py: هذه الوحدة تُخرج **شبكة إيقاعية** يبني عليها المونتاج
توقيتَه، ثم تستقبل مواضع القطع فتضع عندها نقرة وضربة باص، وقبلها صعوداً
قصيراً. القطع الواقع على النبضة مع صوت يسنده هو ما يجعل المونتاج يبدو
محترفاً؛ القطع العشوائي الصامت هو ما يجعله يبدو قالباً.

    from reel_audio3 import grid, write_bed
    bpm, beat = grid("عنوان الريلز")      # قبل حساب المشاهد
    write_bed("bed.wav", 13.8, seed="عنوان الريلز", cuts=[1.9, 7.5, 11.2])
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


VOICING = {
    "maj": [0, 4, 7], "maj7": [0, 4, 7, 11], "maj9": [0, 4, 7, 14],
    "min": [0, 3, 7], "min7": [0, 3, 7, 10], "min9": [0, 3, 7, 14],
    "sus": [0, 5, 7], "sus9": [0, 5, 7, 14],
}

PROGRESSIONS = {
    "warm":  [(0, "maj9"), (7, "maj"), (9, "min7"), (5, "maj7")],
    "calm":  [(0, "min9"), (8, "maj7"), (3, "maj"), (10, "maj")],
    "open":  [(0, "maj"), (5, "maj9"), (7, "sus9"), (9, "min7")],
    "dream": [(9, "min7"), (5, "maj7"), (0, "maj9"), (7, "sus")],
}

ROOTS = {"F2": 87.31, "G2": 98.00, "A2": 110.00, "Bb2": 116.54,
         "C3": 130.81, "D3": 146.83}

# أسرع من نسخة الثلاثين ثانية: الريلز صار ١٢–١٤ ثانية، والنبضة الأقصر
# تعطي مشاهد أكثر في نفس المدة فيبدو التقطيع حيّاً لا بطيئاً.
TEMPOS = [92, 96, 100, 104]
ARPS = [[0, 1, 2, 1], [0, 2, 1, 2], [0, 1, 2, 3], [2, 0, 1, 0]]


def _seeded(seed):
    return list(hashlib.sha256(str(seed).encode()).digest())


def grid(seed="reel"):
    """الشبكة الإيقاعية وحدها — يستدعيها المونتاج قبل توليد الصوت."""
    h = _seeded(seed)
    bpm = TEMPOS[h[2] % len(TEMPOS)]
    return bpm, 60.0 / bpm


def write_bed(path, duration, seed="reel", cuts=()):
    np = _np()
    h = _seeded(seed)

    rname = list(ROOTS)[h[0] % len(ROOTS)]
    root = ROOTS[rname]
    pname = list(PROGRESSIONS)[h[1] % len(PROGRESSIONS)]
    prog = PROGRESSIONS[pname]
    bpm = TEMPOS[h[2] % len(TEMPOS)]
    arp = ARPS[h[3] % len(ARPS)]

    beat = 60.0 / bpm
    bar = beat * 4
    n = int(duration * SR)
    left = np.zeros(n, dtype=np.float64)
    right = np.zeros(n, dtype=np.float64)
    rng = np.random.default_rng(h[4] * 256 + h[5])

    def semis(x):
        return 2.0 ** (x / 12.0)

    def note(f, dur, atk, dec, sus, rel, parts, vib=0.0):
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
        if i0 >= n or i0 < 0:
            return
        m = min(len(sig), n - i0)
        if m > 0:
            buf[i0:i0 + m] += sig[:m] * gain

    def stereo(start, sig, gain, pan):
        add(left, start, sig, gain * (1 - pan))
        add(right, start, sig, gain * pan)

    # ══ بناء الطاقة ══
    # المقطع لا يبدأ كامل الطبقات: كل قسم يضيف طبقة، فيُحسّ المستمع أن
    # الشيء «يكبر» ويبقى إلى النهاية. البداية بالوسادة والباص فقط، ثم
    # الأربيجيو، ثم الطبلة، ثم الهاي هات، ثم اللمعة العليا.
    bounds = [0.0] + sorted(float(c) for c in cuts if 0 < c < duration)

    def section(t):
        s = 0
        for i, b0 in enumerate(bounds):
            if t >= b0 - 1e-6:
                s = i
        return s

    # الطبلة تُجمَّع في مخزن منفصل: لو دخلت المزيج قبل الكبح الجانبي لخفضت
    # نفسها بنفسها وضاع أثرها. تُضاف بعد الكبح.
    kick_times = []
    kbuf = np.zeros(n, dtype=np.float64)

    # ══ الطبقة الموسيقية ══
    nbars = int(duration / bar) + 2
    for b in range(nbars):
        t0 = b * bar
        if t0 > duration:
            break
        croot, quality = prog[b % len(prog)]
        tones = VOICING[quality]
        sec = section(t0)

        # ── الوسادة الهارمونية: حاضرة من أول لحظة ──
        for j, deg in enumerate(tones):
            f = root * 2 * semis(croot + deg)
            sig = note(f, bar * 0.98, 0.55, 1.8, 0.82, 0.9,
                       [(1, 1.0), (2, 0.30), (3, 0.12)], vib=0.02)
            stereo(t0, sig, 0.115, 0.5 + (0.22 if j % 2 else -0.22))

        # ── الباص: نغمة واحدة في القسم الأول، ثم يمشي بأثمان ──
        fb = root * semis(croot) / 2
        if sec == 0:
            bass = note(fb, bar * 0.92, 0.03, 0.55, 0.55, 0.5,
                        [(1, 1.0), (2, 0.22)])
            add(left, t0, bass, 0.26)
            add(right, t0, bass, 0.26)
        else:
            walk = [0, 0, 7, 0, 0, 12, 7, 0]      # جذر · خامسة · أوكتاف
            for s in range(8):
                ts = t0 + s * (beat / 2)
                if ts > duration:
                    break
                sig = note(fb * semis(walk[s]), beat * 0.42, 0.012, 0.20,
                           0.30, 0.20, [(1, 1.0), (2, 0.26), (3, 0.08)])
                g = 0.24 * (1.0 if s % 2 == 0 else 0.62)
                add(left, ts, sig, g)
                add(right, ts, sig, g)

        # ── الطبلة: من القسم الأول فصاعداً، على النبضة الأولى والثالثة ──
        if sec >= 1:
            for kb in (0, 2):
                ts = t0 + kb * beat
                if ts > duration:
                    break
                m = int(0.13 * SR)
                x = np.arange(m) / SR
                # هبوط في النبرة من ٥٦ إلى ٣٨ هرتز: هذا ما يعطي «الضربة» جسداً
                fk = 38 + 78 * np.exp(-x * 34)
                ph = 2 * np.pi * np.cumsum(fk) / SR
                kick = np.sin(ph) * np.exp(-x * 15)
                add(kbuf, ts, kick, 0.34)
                kick_times.append(ts)

        # ── الهاي هات: من القسم الثاني، على الأثمان الضعيفة ──
        if sec >= 2:
            for s in range(8):
                if s % 2 == 0:
                    continue
                ts = t0 + s * (beat / 2)
                if ts > duration:
                    break
                m = int(0.035 * SR)
                nz = rng.standard_normal(m)
                nz = np.concatenate([[0.0], np.diff(nz)])   # تمرير عالٍ
                hat = nz * np.exp(-np.arange(m) / (m * 0.20))
                pan = 0.5 + (0.16 if s % 4 == 1 else -0.16)
                stereo(ts, hat, 0.055, pan)

        # ── الأربيجيو الجرسي: من القسم الأول ──
        if sec >= 1:
            for s in range(8):
                ts = t0 + s * (beat / 2)
                if ts > duration:
                    break
                deg = tones[arp[s % len(arp)] % len(tones)]
                f = root * (8 if s % 4 == 0 else 4) * semis(croot + deg)
                sig = note(f, 0.30, 0.006, 0.14, 0.0, 0.45,
                           [(1, 1.0), (2, 0.28), (3, 0.10)])
                pan = 0.5 + 0.34 * float(np.sin((b * 8 + s) * 0.7))
                stereo(ts, sig, 0.10 * (1.0 if s % 4 == 0 else 0.64), pan)

        # ── اللمعة العليا: في الأقسام الأخيرة فقط، فتُحسّ النهاية أوسع ──
        if sec >= 3 and b % 2 == 0:
            f = root * 16 * semis(croot + tones[-1])
            stereo(t0, note(f, bar * 1.2, 0.9, 2.2, 0.5, 1.4, [(1, 1.0)]),
                   0.030, 0.5)

    # ══ التصميم الصوتي عند القطعات ══
    # ثلاث طبقات لكل قطعة: صعود يمهّد، نقرة تحدّد اللحظة، ضربة تعطيها وزناً.
    for ct in cuts:
        if ct <= 0 or ct >= duration:
            continue

        # صعود: ضجيج يرتفع مستواه ونبرته خلال ٤٠٠ جزء من الثانية قبل القطع
        rl = 0.40
        m = int(rl * SR)
        i0 = int((ct - rl) * SR)
        if i0 > 0 and m > 0:
            x = np.arange(m) / SR
            env = (x / rl) ** 2.4
            sweep = np.sin(2 * np.pi * (900 + 2600 * (x / rl)) * x)
            nz = rng.standard_normal(m)
            # تمرير عالٍ بسيط على الضجيج ليصير «هسيساً» لا هديراً
            nz = np.concatenate([[0.0], np.diff(nz)])
            riser = (0.55 * nz + 0.45 * sweep) * env
            add(left, ct - rl, riser, 0.055)
            add(right, ct - rl, riser, 0.055)

        # نقرة: دفقة ضجيج قصيرة جداً، هي ما يجعل القطع «يُسمع»
        m = int(0.014 * SR)
        click = rng.standard_normal(m) * np.exp(-np.arange(m) / (m * 0.28))
        click = np.concatenate([[0.0], np.diff(click)])
        add(left, ct, click, 0.085)
        add(right, ct, click, 0.085)

        # ضربة: جيب منخفض ينزل من ٩٥ إلى ٥٠ هرتز، يعطي القطع ثقلاً في الهاتف
        m = int(0.16 * SR)
        x = np.arange(m) / SR
        thump = np.sin(2 * np.pi * (95 - 45 * (x / 0.16)) * x) * np.exp(-x * 22)
        add(left, ct, thump, 0.20)
        add(right, ct, thump, 0.20)

    # ══ المعالجة ══
    # كبح جانبي: كل ضربة طبلة تخفض بقية المزيج لحظياً ثم تعود. هذا «النبض»
    # هو ما يميّز مزيجاً منتَجاً عن طبقات مركومة فوق بعضها.
    x = np.arange(n) / SR
    duck = np.ones(n)
    for kt in kick_times:
        i0 = int(kt * SR)
        m = int(0.26 * SR)
        if i0 >= n:
            continue
        m = min(m, n - i0)
        env = 1.0 - 0.34 * np.exp(-np.arange(m) / (0.055 * SR))
        duck[i0:i0 + m] = np.minimum(duck[i0:i0 + m], env)
    if not kick_times:
        duck = 0.90 + 0.10 * (0.5 + 0.5 * np.cos(2 * np.pi * x / beat))
    left *= duck
    right *= duck
    left += kbuf
    right += kbuf

    for delay, fb_g in ((0.22, 0.26), (0.35, 0.16)):
        d = int(delay * SR)
        if d < n:
            left[d:] += right[:n - d] * fb_g * 0.5
            right[d:] += left[:n - d] * fb_g * 0.45

    a = 0.62          # مفتوح أكثر: الهاي هات والنقرات تحتاج مدى عالياً
    for buf in (left, right):
        acc = 0.0
        out = np.empty_like(buf)
        for i in range(n):
            acc += a * (buf[i] - acc)
            out[i] = acc
        buf[:] = out

    # قطع ما تحت ~٣٠ هرتز فقط: القطع عند ٤٥ كان يبتلع ذيل الطبلة (٣٨ هرتز)
    for buf in (left, right):
        prev = 0.0
        out = np.empty_like(buf)
        for i in range(n):
            prev += 0.0043 * (buf[i] - prev)
            out[i] = buf[i] - prev
        buf[:] = out

    # تلاشٍ قصير: الريلز يُعاد تلقائياً، والتلاشي الطويل يفضح نقطة الحلقة
    fi, fo = int(0.25 * SR), int(0.45 * SR)
    g = np.ones(n)
    g[:fi] = np.linspace(0, 1, fi) ** 1.2
    g[n - fo:] = np.linspace(1, 0, fo) ** 1.2
    left *= g
    right *= g

    peak = max(float(np.max(np.abs(left))), float(np.max(np.abs(right))), 1e-9)
    left = np.tanh(left / peak * 1.35) * 0.66
    right = np.tanh(right / peak * 1.35) * 0.66

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
    return {"root": rname, "bpm": bpm, "scale": pname, "cuts": len(cuts),
            "rms_db": round(20 * float(np.log10(rms + 1e-12)), 1)}


if __name__ == "__main__":
    print(write_bed(sys.argv[1], float(sys.argv[2]),
                    seed=sys.argv[3] if len(sys.argv) > 3 else "reel",
                    cuts=[2.0, 7.0, 11.0]))
