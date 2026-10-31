import { Cam } from "../../lib/camera3d";

/** «كيف تقيس أداء وكيلك؟» — لقطة واحدة متواصلة: الكاميرا تنزلق أفقياً على لوحة قيادة سيارة طويلة. 53ث @30fps. */
export const FRAMES = 1590;
export const HIT = 120; // الـ drop عند ثانية 4: تشغيل اللوحة (sweep)

const MIDS = [50, 270, 520, 770, 1020, 1270, 1500];
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
const XC: number[] = [0];
for (let i = 1; i <= FRAMES; i++) XC[i] = XC[i - 1] + (V_MAX - (V_MAX - V_MIN) * slow(i));
export const xAt = (f: number) => {
  const c = Math.min(FRAMES, Math.max(0, f));
  const i = Math.floor(c);
  return XC[i] + (XC[Math.min(FRAMES, i + 1)] - XC[i]) * (c - i);
};

/** بداية أنيميشن كل مشهد (= منتصفه − 110) */
export const S = { hook: 0, g1: 160, g2: 410, g3: 660, g4: 910, tip: 1160, end: 1390 };
/** موضع كل مشهد على اللوحة (x العالم) = موضع الكاميرا عند منتصفه */
export const X = {
  hook: xAt(50),
  g1: xAt(270),
  g2: xAt(520),
  g3: xAt(770),
  g4: xAt(1020),
  tip: xAt(1270),
  end: xAt(1500),
};
export const CAM_Z = 1150;

export const camAt = (f: number): Cam => ({
  x: xAt(f),
  y: -40 + 14 * Math.sin(f / 70),
  z: CAM_Z,
  yaw: 0.7 * Math.sin(f / 90 + 0.5),
  pitch: 0,
  roll: 0.5 * Math.sin(f / 120 + 1),
});
