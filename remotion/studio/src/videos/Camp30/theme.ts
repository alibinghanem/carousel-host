import { staticFile } from "remotion";
export { ease, OUT, IN, IN_OUT, BACK } from "../ClaudeVsGptPro/theme";

/** «معسكر 30 يوم»: ملعب تدريب 3D ليلي تحت الكشافات، وكل أسبوع منطقة على الملعب */
export const DISPLAY = "Kufam";
export const BODY = "'IBM Plex Sans Arabic', 'Space Grotesk'";
export const BOARD = "Handjet";
export const V = (p: string) => staticFile(`videos/camp30/${p}`);

export const FRAMES = 1740;

/** القطع على ضربات الموسيقى (الـ drop على 4.0ث، والضربة كل ~17.3 فريم) */
export const SEG = {
  hook: [0, 120],
  plan: [120, 293],
  w1: [293, 570],
  w2: [570, 847],
  w3: [847, 1106],
  w4: [1106, 1383],
  tip: [1383, 1539],
  end: [1539, 1740],
} as const;
export type SegK = keyof typeof SEG;

/** مراكز مناطق الأسابيع على طول الملعب (z) — الأسبوع الأول الأقرب للكاميرا */
export const ZONE = { w1: 18, w2: 6, w3: -6, w4: -18 } as const;

export const C = {
  w1: "#4FC3FF",
  w2: "#B6F23A",
  w3: "#FFB020",
  w4: "#FF4D6D",
  team: "#2F6BFF",
  gold: "#FFC23D",
  ok: "#2BD47D",
  night: "#07101C",
};
