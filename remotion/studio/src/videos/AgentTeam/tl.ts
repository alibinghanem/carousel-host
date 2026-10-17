import { Cam } from "../../lib/camera3d";

/** «وكيل ولا فريق» — لقطة واحدة متواصلة فوق طاولة عمل طويلة (منظر علوي مائل). 54ث @30fps. */
export const FRAMES = 1605; // 53.5ث (الموسيقى 53.5ث)
export const HIT = 120; // الـ drop عند ثانية 4

const MIDS = [50, 260, 500, 740, 980, 1220, 1460];
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
const zAt = (f: number) => {
  const c = Math.min(FRAMES, Math.max(0, f));
  const i = Math.floor(c);
  return ZC[i] + (ZC[Math.min(FRAMES, i + 1)] - ZC[i]) * (c - i);
};

/** بداية أنيميشن كل مشهد (= منتصفه − 110) */
export const S = { hook: 0, single: 150, team: 390, brief: 630, cost: 870, avoid: 1110, end: 1350 };
/** عمق «سطح الطاولة» لكل مشهد: على بعد 1250 أمام الكاميرا عند منتصفه */
export const Z = {
  hook: zAt(50) - 1100,
  single: zAt(260) - 1100,
  team: zAt(500) - 1100,
  brief: zAt(740) - 1100,
  cost: zAt(980) - 1100,
  avoid: zAt(1220) - 1100,
  end: zAt(1460) - 1100,
};
export const TABLE_Y = 400;
export const PITCH = 30;

export const camAt = (f: number): Cam => {
  const x = 45 * Math.sin(f / 80 + 0.6);
  return {
    x,
    y: -470 + 30 * Math.sin(f / 95),
    z: zAt(f),
    yaw: x / 40,
    pitch: PITCH,
    roll: 1.0 * Math.sin(f / 110 + 1),
  };
};
