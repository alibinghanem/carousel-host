#!/usr/bin/env python3
"""
موسيقى خلفية أصلية تُولَّد برمجياً (بدون حقوق) للموشن قرافيك — بدون تعليق صوتي.

    python3 music_bed.py out.wav 36 --bpm 120 --drop 4.0

البنية: مقدمة هادئة (باد + أربيجيو مكتوم) ← «drop» عند لحظة الكشف
(كيك + كلاب + هاي هات + باص مع sidechain) ← خاتمة تهدأ وتتلاشى.
التقدّم: Am – F – C – G (دافئ وعصري). خلّ مدد المشاهد تنتهي على النبض
(مع OV=0.35 في render_video_html: مدة المشهد = n×(60/bpm) + 0.35).
"""
import sys, wave, argparse
import numpy as np

SR = 44100
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]   # Am F C G (MIDI)
ROOTS = [45, 41, 36, 43]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t * d)


def kick():
    n = int(.35 * SR); t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 1.0


def clap(rng):
    n = int(.22 * SR); t = np.arange(n) / SR
    x = rng.uniform(-1, 1, n)
    x = x - np.concatenate([[0], x[:-1]]) * .6
    e = np.exp(-t * 22) * (1 + .6 * (np.sin(t * 2 * np.pi * 90) > 0) * (t < .03))
    return x * e * .35 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * .15


def hat(rng, open_=False):
    n = int((.18 if open_ else .05) * SR); t = np.arange(n) / SR
    x = rng.uniform(-1, 1, n); x = np.diff(np.concatenate([[0], x]))
    return x * np.exp(-t * (18 if open_ else 90)) * .16


def pluck(m, dur=.28):
    n = int(dur * SR); t = np.arange(n) / SR
    f = hz(m)
    x = np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t) + .12 * np.sin(6 * np.pi * f * t)
    return x * env(n, .003, 11) * .13


def pad(ms, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    for m in ms:
        for dt in (-.08, 0, .08):
            f = hz(m + 12) * 2 ** (dt / 12)
            x += np.sin(2 * np.pi * f * t + dt * 7)
    a = np.minimum(1, t / .5) * np.minimum(1, (dur - t) / .4)
    return x * a * .035


def bass_note(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    f = hz(m)
    x = sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, 6))
    return x * env(n, .005, 6) * .22


def add(buf, x, at, g=1.0):
    o = int(at * SR)
    if o >= len(buf):
        return
    x = x[:len(buf) - o]
    buf[o:o + len(x)] += x * g


def make(path, total, bpm=120, drop=4.0, outro=None, seed=7):
    rng = np.random.default_rng(seed)
    beat = 60 / bpm
    bar = 4 * beat
    n = int((total + .5) * SR)
    drums, music = np.zeros(n), np.zeros(n)
    duck = np.ones(n)
    outro = outro if outro is not None else max(drop + 4, total - 5.0)
    K, C = kick(), clap(rng)
    nb = int(total / bar) + 1
    for b in range(nb):
        t0 = b * bar
        ci = b % 4
        ch, rt = CHORDS[ci], ROOTS[ci]
        add(music, pad(ch, bar + .3), t0, 1.0)
        full = drop <= t0 < outro
        pre = t0 < drop
        # أربيجيو ١/١٦ (أخف قبل الـ drop)
        seq = [ch[0], ch[1], ch[2], ch[1] + 12, ch[2], ch[1], ch[0] + 12, ch[2]]
        for k in range(16):
            tt = t0 + k * beat / 4
            if tt >= total:
                break
            if pre and k % 2:
                continue
            add(music, pluck(seq[k % 8] + (12 if k % 4 == 3 else 0)), tt, .55 if pre else .8)
        if t0 + bar > drop and t0 < outro:
            for q in range(4):
                tq = t0 + q * beat
                if tq < drop - 1e-6 or tq >= outro:
                    continue
                add(drums, K, tq, .9)
                d0 = int(tq * SR)
                w = np.minimum(1, np.arange(int(.22 * SR)) / (.22 * SR)) * .55 + .45
                duck[d0:d0 + len(w)] = np.minimum(duck[d0:d0 + len(w)], w[:max(0, n - d0)])
                if q in (1, 3):
                    add(drums, C, tq, .8)
                add(drums, hat(rng), tq + beat / 2, .9)
                add(drums, hat(rng), tq + beat / 4 * 3, .45)
                add(music, bass_note(rt, beat / 2 * .9), tq + beat / 2, 1.0)
                add(music, bass_note(rt, beat / 2 * .9), tq, .7)
            if full:
                add(drums, hat(rng, True), t0 + bar - beat / 2, .7)
        if t0 >= outro:
            add(music, bass_note(rt, bar * .9), t0, .6)
    # فلتر مكتوم للمقدمة: تنعيم بسيط قبل الـ drop
    d = int(drop * SR)
    if d > 0:
        k = 18
        sm = np.convolve(music[:d], np.ones(k) / k, mode="same")
        music[:d] = sm * 1.5
    mix = music * duck + drums
    # تلاشي الخاتمة
    fo = int(max(0, total - 2.2) * SR)
    mix[fo:] *= np.linspace(1, 0, n - fo) ** 1.5
    mix[int(total * SR):] = 0
    mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.4) * .8
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mix * 32767).astype("<i2").tobytes())
    return path


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("out"); ap.add_argument("total", type=float)
    ap.add_argument("--bpm", type=float, default=120); ap.add_argument("--drop", type=float, default=4.0)
    ap.add_argument("--outro", type=float, default=None)
    a = ap.parse_args()
    make(a.out, a.total, a.bpm, a.drop, a.outro)
    print("✓", a.out)
