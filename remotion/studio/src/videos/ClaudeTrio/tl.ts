import { Cam } from "../../lib/camera3d";

/** الجدول الزمني (30fps) — لقطة واحدة متواصلة: الكاميرا تطير فوق عالم واحد ولا تتوقف أبداً (أقل سرعة 1 وحدة/إطار). */
export const FRAMES = 1560; // 52ث
export const HIT = 120; // الـ drop على ثانية 4

/** منتصف «التحليق البطيء» عند كل جزيرة */
const MIDS = [50, 270, 510, 750, 990, 1200, 1440];
const V_MIN = 1.0;
const V_MAX = 14;
/** وزن البطء: 1 قرب المنتصف (±40)، ينزل بنعومة حتى ±110 */
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
export const S = { hook: 0, chat: 160, cowork: 400, code: 640, routine: 880, compare: 1090, end: 1330 };
/** موضع كل جزيرة: على بعد 1250 أمام الكاميرا عند منتصفها */
export const Z = {
  hook: zAt(50) - 1250,
  chat: zAt(270) - 1250,
  cowork: zAt(510) - 1250,
  code: zAt(750) - 1250,
  routine: zAt(990) - 1250,
  compare: zAt(1200) - 1250,
  end: zAt(1440) - 1250,
};

/** كاميرا طيران: تقدم مستمر + انحراف جانبي ناعم + ميل خفيف (gimbal) */
export const camAt = (f: number): Cam => {
  const x = 55 * Math.sin(f / 78 + 0.6);
  return {
    x,
    y: -200 + 30 * Math.sin(f / 95),
    z: zAt(f),
    yaw: x / 30,
    pitch: 8,
    roll: 1.4 * Math.sin(f / 110 + 1),
  };
};
