#!/usr/bin/env python3
"""فراش موسيقي حقيقي للريلز، مع تصميم صوتي عند القطعات.

الفرق عن `reel_audio3.py`: هذه الوحدة لا تؤلّف الموسيقى بل تستعمل مقطعاً
حقيقياً من `music/` بترخيص CC0-1.0 (ملك عام: تجاري ومجاني بلا نسبة). لكنها
لا تكتفي بوضعه تحت الفيديو — تستخرج **إيقاعه وطَوره**، فيبني المونتاج
توقيته على نبض المقطع نفسه، وتقع كل قطعة على ضربة حقيقية في الموسيقى.

الترتيب المقصود:
    bpm, beat, start = analyse(track, seed)   # قبل حساب المشاهد
    ... يحسب المحرّك مدد المشاهد ومواضع القطع ...
    build_bed(track, out, duration, cuts, start)

`start` يتغيّر بين منشور وآخر حسب البذرة، فيسمع المتابع مقطعاً مختلفاً من
الأغنية نفسها كل مرة — هوية صوتية واحدة بلا تكرار حرفيّ.
"""
import hashlib
import pathlib
import subprocess
import sys
import wave

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

SR = 44100
AR = 22050          # معدّل التحليل: يكفي لكشف النبض وأسرع أربع مرات


def _np():
    try:
        import numpy
    except ImportError:
        subprocess.run([sys.executable, "-m", "pip", "install", "numpy",
                        "--break-system-packages", "-q"], check=False)
        import numpy
    return numpy


def _ff():
    from render_reel2 import _ffmpeg
    return _ffmpeg()


def _decode(path, sr, ss=None, t=None, mono=True):
    np = _np()
    cmd = [_ff(), "-v", "quiet"]
    if ss is not None:
        cmd += ["-ss", f"{ss:.4f}"]
    cmd += ["-i", str(path)]
    if t is not None:
        cmd += ["-t", f"{t:.4f}"]
    cmd += ["-ac", "1" if mono else "2", "-ar", str(sr), "-f", "f32le", "-"]
    out = subprocess.run(cmd, capture_output=True).stdout
    x = np.frombuffer(out, dtype=np.float32).astype(np.float64)
    return x if mono else x.reshape(-1, 2).T


def _onsets(x, hop=256):
    """مغلّف بداية النغمات عبر الفيض الطيفي — أدقّ من مغلّف الطاقة للنبض."""
    np = _np()
    win = 1024
    n = (len(x) - win) // hop
    if n < 8:
        return np.zeros(1), hop
    idx = np.arange(n)[:, None] * hop + np.arange(win)[None, :]
    frames = x[idx] * np.hanning(win)
    S = np.abs(np.fft.rfft(frames, axis=1))
    d = np.diff(S, axis=0)
    flux = np.maximum(d, 0).sum(axis=1)         # الزيادات فقط: بدايات لا نهايات
    flux -= flux.mean()
    return flux, hop


def analyse(path, seed="reel", beats_needed=32):
    """يعيد (bpm, beat, start) — الإيقاع وطول النبضة وبداية المقطع المختار."""
    np = _np()
    x = _decode(path, AR)
    if x.size < AR * 4:
        raise RuntimeError(f"مقطع قصير جداً أو تعذّر فكّه: {path}")
    dur = x.size / AR

    flux, hop = _onsets(x)
    fps = AR / hop

    # ── الإيقاع: ارتباط ذاتي على المغلّف، مقيّد بمدى بشري معقول ──
    ac = np.correlate(flux, flux, "full")[len(flux) - 1:]
    lo, hi = int(fps * 60 / 175), int(fps * 60 / 65)
    hi = min(hi, len(ac) - 1)
    if hi <= lo:
        raise RuntimeError("تعذّر تقدير الإيقاع")
    lag = lo + int(np.argmax(ac[lo:hi]))
    bpm = 60.0 * fps / lag
    # تصحيح أخطاء الأوكتاف: الارتباط الذاتي يلتقط الضِّعف أو النصف كثيراً.
    # المدى المريح لمحتوى قصير هو ٧٥–١٤٠.
    while bpm > 145:
        bpm /= 2
    while bpm < 70:
        bpm *= 2
    beat = 60.0 / bpm

    # ── الطور: أين تقع الضربة؟ نطابق مشطاً من النبضات على المغلّف ──
    per = beat * fps
    ncomb = max(4, int(len(flux) / per) - 1)
    best, bestv = 0.0, -1e18
    for off in np.linspace(0, per, 48, endpoint=False):
        pos = (off + np.arange(ncomb) * per).astype(int)
        pos = pos[pos < len(flux)]
        v = float(flux[pos].sum())
        if v > bestv:
            bestv, best = v, off
    phase = best / fps

    # ── اختيار مقطع: بعد المقدّمة، على ضربة، وأعلى طاقةً من المتوسط ──
    need = beats_needed * beat + 1.0
    h = hashlib.sha256(str(seed).encode()).digest()
    win = int(AR * need)
    cands = []
    lead = max(phase, 4.0)
    k0 = int(np.ceil((lead - phase) / beat))
    while True:
        s = phase + k0 * beat
        if s + need > dur:
            break
        i0 = int(s * AR)
        seg = x[i0:i0 + win]
        if seg.size:
            cands.append((s, float(np.sqrt((seg ** 2).mean()))))
        k0 += 4                                  # كل مازورة (٤ نبضات)
    if not cands:
        start = 0.0
    else:
        loud = sorted(cands, key=lambda c: -c[1])
        # النصف الأعلى طاقةً، ثم اختيار منه بالبذرة فيتغيّر بين منشور وآخر
        pool = loud[:max(1, len(loud) // 2)]
        start = pool[h[6] % len(pool)][0]

    return round(bpm, 3), beat, round(start, 4)


def build_bed(path, out_path, duration, cuts=(), start=0.0, seed="reel"):
    """يبني ملف الصوت: المقطع الموسيقي + تصميم القطعات، مسوَّى ومُنهىً."""
    np = _np()
    y = _decode(path, SR, ss=start, t=duration + 0.5, mono=False)
    n = int(duration * SR)
    if y.shape[1] < n:
        # تكرار المقطع إن قصر — على مضاعف النبضة فلا تُسمع الخياطة
        reps = int(np.ceil(n / max(1, y.shape[1])))
        y = np.tile(y, reps)
    left, right = y[0, :n].copy(), y[1, :n].copy()

    rng = np.random.default_rng(int.from_bytes(
        hashlib.sha256(str(seed).encode()).digest()[:4], "big"))

    # ── تسوية الجهارة إلى مستوى نشر مريح قبل إضافة أي شيء ──
    rms = float(np.sqrt((left ** 2 + right ** 2).mean() / 2)) + 1e-9
    g = 10 ** ((-17.0 - 20 * np.log10(rms)) / 20)
    left *= g
    right *= g

    # ── تصميم القطعات: صعود يمهّد، نقرة تحدّد، ضربة تُثقل ──
    hits = np.zeros(n)

    def add(buf, at, sig, gain):
        i0 = int(at * SR)
        if i0 < 0 or i0 >= n:
            return
        m = min(len(sig), n - i0)
        if m > 0:
            buf[i0:i0 + m] += sig[:m] * gain

    duck = np.ones(n)
    for ct in cuts:
        if ct <= 0 or ct >= duration:
            continue
        rl = 0.38
        m = int(rl * SR)
        if int((ct - rl) * SR) > 0 and m > 0:
            xr = np.arange(m) / SR
            env = (xr / rl) ** 2.6
            nz = rng.standard_normal(m)
            nz = np.concatenate([[0.0], np.diff(nz)])
            sweep = np.sin(2 * np.pi * (800 + 2400 * (xr / rl)) * xr)
            add(hits, ct - rl, (0.6 * nz + 0.4 * sweep) * env, 0.048)

        m = int(0.013 * SR)
        click = rng.standard_normal(m) * np.exp(-np.arange(m) / (m * 0.28))
        click = np.concatenate([[0.0], np.diff(click)])
        add(hits, ct, click, 0.075)

        m = int(0.17 * SR)
        xt = np.arange(m) / SR
        ph = 2 * np.pi * np.cumsum(38 + 76 * np.exp(-xt * 30)) / SR
        add(hits, ct, np.sin(ph) * np.exp(-xt * 13), 0.24)

        # كبح خفيف للموسيقى لحظة القطع: يفسح للضربة مكاناً فتُسمع
        i0 = int(ct * SR)
        m = min(int(0.30 * SR), n - i0)
        if m > 0:
            left[i0:i0 + m] *= 1 - 0.28 * np.exp(-np.arange(m) / (0.07 * SR))
            right[i0:i0 + m] *= 1 - 0.28 * np.exp(-np.arange(m) / (0.07 * SR))

    left += hits
    right += hits
    left *= duck
    right *= duck

    # ── تلاشٍ قصير: الريلز يُعاد تلقائياً والطويل يفضح نقطة الحلقة ──
    fi, fo = int(0.16 * SR), int(0.40 * SR)
    env = np.ones(n)
    env[:fi] = np.linspace(0, 1, fi)
    env[n - fo:] = np.linspace(1, 0, fo) ** 1.2
    left *= env
    right *= env

    peak = max(float(np.max(np.abs(left))), float(np.max(np.abs(right))), 1e-9)
    if peak > 0.89:
        left *= 0.89 / peak
        right *= 0.89 / peak

    inter = np.empty(n * 2)
    inter[0::2] = left
    inter[1::2] = right
    pcm = np.clip(inter, -1, 1) * 32767
    with wave.open(str(out_path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.astype("<i2").tobytes())

    r = float(np.sqrt(np.mean(inter ** 2)))
    return {"track": pathlib.Path(path).stem, "start": round(start, 2),
            "cuts": len(cuts),
            "peak_db": round(20 * float(np.log10(
                max(float(np.max(np.abs(inter))), 1e-9))), 1),
            "rms_db": round(20 * float(np.log10(r + 1e-12)), 1)}


def pick_track(music_dir, seed="reel"):
    """يختار مقطعاً من مجلد الموسيقى بالبذرة — واحد الآن، وأكثر لاحقاً."""
    d = pathlib.Path(music_dir)
    tracks = sorted(p for p in d.glob("*.mp3")) if d.exists() else []
    if not tracks:
        return None
    h = hashlib.sha256(str(seed).encode()).digest()
    return tracks[h[7] % len(tracks)]


if __name__ == "__main__":
    p = sys.argv[1]
    bpm, beat, start = analyse(p, sys.argv[2] if len(sys.argv) > 2 else "x")
    print(f"bpm={bpm}  beat={beat:.4f}s  start={start}s  32beats={32*beat:.2f}s")
