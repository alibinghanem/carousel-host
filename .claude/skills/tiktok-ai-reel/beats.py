#!/usr/bin/env python3
"""
تحليل إيقاع موسيقى الفيديو — عشان تقطع المشاهد على الضربات.

    python3 beats.py remotion/studio/public/videos/<name>/music.mp3 [--fps 30]

يطبع:
  • منحنى الشدة كل ثانية (تعرف منه المقدمة الهادئة ولحظة الـ drop والخاتمة)
  • أقوى الضربات (kick) برقم الفريم — ضع القطع والكشف عليها بالضبط
يفك الـ mp3 بـ ffmpeg الخاص بـ Remotion (لا يحتاج ffmpeg بالنظام).
"""
import argparse, pathlib, subprocess, tempfile, wave
import numpy as np

STUDIO = pathlib.Path(__file__).resolve().parents[3] / "remotion" / "studio"


def decode(src):
    out = pathlib.Path(tempfile.mkdtemp()) / "a.wav"
    subprocess.run(["npx", "remotion", "ffmpeg", "-v", "error", "-y", "-i", str(pathlib.Path(src).resolve()),
                    "-ac", "1", "-ar", "22050", str(out)], cwd=STUDIO, check=True)
    w = wave.open(str(out))
    x = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(float) / 32768
    return x, w.getframerate()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src"); ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--top", type=int, default=40)
    a = ap.parse_args()
    x, sr = decode(a.src)
    hop = sr // a.fps
    n = len(x) // hop
    # طاقة كل فريم: كاملة + منخفضة (<150Hz تقريباً) عبر FFT نافذة 2048
    win = np.hanning(2048)
    freqs = np.fft.rfftfreq(2048, 1 / sr)
    lowm = freqs < 150
    full, low = np.zeros(n), np.zeros(n)
    xp = np.pad(x, (0, 2048))
    for i in range(n):
        s = np.abs(np.fft.rfft(xp[i * hop:i * hop + 2048] * win))
        full[i] = np.sqrt(np.mean(s ** 2))
        low[i] = np.sqrt(np.mean(s[lowm] ** 2))
    dur = len(x) / sr
    print(f"المدة: {dur:.2f}ث · {n} فريم @ {a.fps}fps\n")

    print("الشدة كل ثانية (0–9):")
    sec = [full[i * a.fps:(i + 1) * a.fps].mean() for i in range(int(np.ceil(n / a.fps)))]
    mx = max(sec) or 1
    print("".join(str(min(9, int(v / mx * 9.99))) for v in sec))
    print("".join(str(i // 10 % 10) if i % 10 == 0 else "·" for i in range(len(sec))), "\n")

    # الضربة = قفزة الطاقة المنخفضة عن متوسط ما قبلها
    on = np.zeros(n)
    for i in range(3, n):
        base = low[max(0, i - 10):i - 2].mean() + 1e-9
        on[i] = max(0, low[i] / base - 1)
    peaks = [i for i in range(1, n - 1) if on[i] > 0.6 and on[i] >= on[i - 1] and on[i] >= on[i + 1]]
    # تجاهل الضربات المتلاصقة (<6 فريم)
    kept = []
    for p in sorted(peaks, key=lambda i: -on[i] * low[i]):
        if all(abs(p - q) >= 6 for q in kept):
            kept.append(p)
    kept = sorted(kept[:a.top])
    print(f"أقوى {len(kept)} ضربة (فريم · ثانية · قوة):")
    lm = max(low[k] for k in kept) if kept else 1
    for k in kept:
        print(f"  f{k:5d}  {k / a.fps:6.2f}ث  {'█' * max(1, int(low[k] / lm * 20))}")


if __name__ == "__main__":
    main()
