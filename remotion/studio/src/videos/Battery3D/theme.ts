import { staticFile } from "remotion";
export { ease, OUT, IN, IN_OUT, BACK } from "../ClaudeVsGptPro/theme";

/** «بطارية جوالك»: استوديو داكن بإضاءة ملوّنة تتغير مع كل عادة */
export const DISPLAY = "Rubik";
export const BODY = "'IBM Plex Sans Arabic', 'Space Grotesk'";
export const EN = "'Space Grotesk'";
export const V = (p: string) => staticFile(`videos/battery3d/${p}`);

export const FRAMES = 1710;

/** القطع على ضربات الموسيقى (أول ضربة 4ث) */
export const SEG = {
  hook: [0, 120],
  heat: [120, 420],
  case: [420, 690],
  zero: [690, 960],
  limit: [960, 1260],
  sum: [1260, 1470],
  end: [1470, 1710],
} as const;
export type SegK = keyof typeof SEG;

/** لون خلفية كل مشهد (وسط · أطراف) */
export const BG: Record<SegK, [string, string]> = {
  hook: ["#3A1A0E", "#0A0605"],
  heat: ["#4A1410", "#09060A"],
  case: ["#4A2410", "#0A0706"],
  zero: ["#3A0E1E", "#08060B"],
  limit: ["#10265A", "#050814"],
  sum: ["#1B2A3E", "#06090F"],
  end: ["#0E3A3A", "#050B0C"],
};

export const C = {
  hot: "#FF4D2E",
  warm: "#FFB347",
  cool: "#4FC3FF",
  ok: "#2BD47D",
  ink: "#0B0F18",
};
