import { staticFile } from "remotion";
export { ease, OUT, IN, IN_OUT, BACK } from "../ClaudeVsGptPro/theme";

/** «العنوان»: خريطة مدينة نهارية، ومسار توصيل أزرق، ودبوس أحمر، وبوليصة طلب */
export const A = {
  land: "#EFEAE0",
  block: "#E3DCCF",
  bld: "#D3C9B8",
  bld2: "#C7BCA9",
  park: "#CFE6C3",
  road: "#FFFFFF",
  casing: "#D6CDBE",
  major: "#FFD36B",
  majorC: "#E2B44C",
  route: "#2D6BFF",
  pin: "#E8453C",
  ink: "#13161C",
  sub: "#5B6170",
  card: "#FFFFFF",
  role: "#2D6BFF",
  task: "#FF7A1A",
  ctx: "#16A06A",
  fmt: "#8B4DFF",
};

export const DISPLAY = "Cairo";
export const BODY = "'IBM Plex Sans Arabic', 'Space Grotesk'";
export const EN = "Space Grotesk";
export const MONO = "JetBrains Mono";
export const V = (p: string) => staticFile(`videos/address/${p}`);

export const W = 1080;
export const H = 1920;
export const FRAMES = 1704;

/** القطع على مازورات الموسيقى (كل 2ث)، والـ drop عند 4ث */
export const SEG = {
  hook: [0, 120],
  idea: [120, 360],
  role: [360, 600],
  task: [600, 840],
  ctx: [840, 1140],
  fmt: [1140, 1440],
  end: [1440, 1704],
} as const;
export type SegK = keyof typeof SEG;

/** الهدف: باب البيت في الخريطة (إحداثيات الخريطة) */
export const T = { x: 2160, y: 1652 };
/** مكان الهدف على الشاشة */
export const PIN = { x: 540, y: 690 };
/** تكبير كل مستوى (بكسل شاشة لكل وحدة خريطة): المدينة ← الحي ← الشارع ← المبنى ← الباب */
export const ZOOM = { city: 0.27, role: 0.65, task: 1.7, ctx: 5, fmt: 14, end: 15.5 };
