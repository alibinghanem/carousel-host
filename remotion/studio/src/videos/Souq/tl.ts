import { Cam } from "../../lib/camera3d";

/** «خمس خدمات تبيعها بالذكاء الاصطناعي» — لقطة واحدة: الكاميرا تنزلق أفقياً على سوق طويل (٥ بسطات). 56ث @30fps. */
export const FRAMES = 1680;
export const HIT = 120;

const MIDS = [50, 275, 500, 725, 950, 1175, 1400, 1620];
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

export const S = { hook: 0, s1: 165, s2: 390, s3: 615, s4: 840, s5: 1065, how: 1290, end: 1510 };
export const X = {
  hook: xAt(50),
  s1: xAt(275),
  s2: xAt(500),
  s3: xAt(725),
  s4: xAt(950),
  s5: xAt(1175),
  how: xAt(1400),
  end: xAt(1620),
};
export const CAM_Z = 1150;

export const camAt = (f: number): Cam => ({
  x: xAt(f),
  y: -140 + 12 * Math.sin(f / 70),
  z: CAM_Z,
  yaw: 0.6 * Math.sin(f / 90 + 0.5),
  pitch: 0,
  roll: 0.4 * Math.sin(f / 120 + 1),
});
