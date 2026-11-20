import { staticFile } from "remotion";
export { ease, OUT, IN, IN_OUT, BACK } from "../ClaudeVsGptPro/theme";

/** «لوحة التحقيق»: فلّين، ورق مطبوع، لاصق أصفر، وخيوط حمراء */
export const P = {
  cork: "#C69560",
  cork2: "#A87443",
  paper: "#FBF7EE",
  sticky: "#FFE27A",
  ink: "#1F1B16",
  sub: "#5A5146",
  string: "#D62839",
  teal: "#20808D",
  ok: "#1E8E4E",
  amber: "#E0962B",
  bad: "#C62828",
  manila: "#E8C98E",
};

export const DISPLAY = "'Noto Kufi Arabic'";
export const BODY = "'IBM Plex Sans Arabic', 'Space Grotesk'";
export const HAND = "'Aref Ruqaa'";
export const EN = "'Space Grotesk'";
export const MONO = "'JetBrains Mono'";
export const V = (p: string) => staticFile(`videos/sources/${p}`);

export const W = 1080;
export const H = 1920;
export const FRAMES = 1710;

/** القطع على ضربات الموسيقى (أول ضربة 4ث، وكل مازورة 60 فريم) */
export const SEG = {
  hook: [0, 120],
  ans: [120, 360],
  strings: [360, 600],
  check: [600, 1005],
  more: [1005, 1245],
  prompt: [1245, 1485],
  end: [1485, 1710],
} as const;
export type SegK = keyof typeof SEG;
/** زيارات المكبّر الثلاث داخل مقطع التحقق */
export const VISIT = [600, 735, 870];

/** أماكن العناصر على اللوحة (إحداثيات العالم) */
export const L = {
  note: { x: 1100, y: 700, w: 680, h: 560 },
  doc: { x: 1100, y: 1500, w: 780, h: 840 },
  src: [
    { x: 560, y: 2420, w: 500, h: 440 },
    { x: 1100, y: 2640, w: 440, h: 560 },
    { x: 1640, y: 2420, w: 500, h: 440 },
  ],
  marks: [
    { x: 790, y: 1442 },
    { x: 1060, y: 1580 },
    { x: 1250, y: 1718 },
  ],
  follow: { x: 820, y: 3720, w: 430, h: 380 },
  search: { x: 1400, y: 3540, w: 430, h: 250 },
  research: { x: 1400, y: 3900, w: 430, h: 400 },
  prompt: { x: 1100, y: 4560, w: 860, h: 560 },
  folder: { x: 1100, y: 5250, w: 860, h: 700 },
};
