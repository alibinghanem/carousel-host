import { Cam } from "../../lib/camera3d";

/** لقطة واحدة متواصلة فوق مضمار سباق: الكاميرا تتقدم ولا تتوقف (أقل سرعة 1 وحدة/إطار). */
export const FRAMES = 1710; // 57ث
export const HIT = 120; // الـ drop على ثانية 4

/** منتصف «التحليق البطيء» عند كل محطة */
const MIDS = [50, 330, 600, 870, 1110, 1310, 1510];
const V_MIN = 1.0;
const V_MAX = 13;
const slow = (f: number) => {
  let w = 0;
  for (const m of MIDS) {
    const d = Math.abs(f - m);
    const v = d < 40 ? 1 : d < 110 ? Math.cos((Math.PI / 2) * ((d - 40) / 70)) ** 2 : 0;
    w = Math.max(w, v);
  }
  return w;
};
const ZC: number[] = [1700];
for (let i = 1; i <= FRAMES; i++) ZC[i] = ZC[i - 1] - (V_MAX - (V_MAX - V_MIN) * slow(i));
export const zAt = (f: number) => {
  const c = Math.min(FRAMES, Math.max(0, f));
  const i = Math.floor(c);
  return ZC[i] + (ZC[Math.min(FRAMES, i + 1)] - ZC[i]) * (c - i);
};

/** بداية أنيميشن كل مشهد (= منتصفه − 110) */
export const S = { hook: 0, g1: 220, g2: 490, g3: 760, test: 1000, verdict: 1200, end: 1400 };
const D = 1250;
export const Z = {
  hook: zAt(50) - D,
  g1: zAt(330) - D,
  g2: zAt(600) - D,
  g3: zAt(870) - D,
  test: zAt(1110) - D,
  verdict: zAt(1310) - D,
  end: zAt(1510) - D,
};

export const camAt = (f: number): Cam => {
  const x = 40 * Math.sin(f / 90 + 0.6);
  return { x, y: -200 + 26 * Math.sin(f / 95), z: zAt(f), yaw: x / 40, pitch: 8, roll: 1.2 * Math.sin(f / 110 + 1) };
};
