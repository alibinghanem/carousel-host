import { staticFile } from "remotion";
export { ease, OUT, IN, IN_OUT, BACK, typed, clamp01 } from "../ClaudeVsGptPro/theme";

/** «من ورقة لاصقة إلى عرض كامل»: ملاحظة صفراء تتحول لمروحة شرائح */
export const DISPLAY = "Vazirmatn";
export const HAND = "'Aref Ruqaa'";
export const BODY = "'IBM Plex Sans Arabic', 'Space Grotesk'";
export const EN = "'Space Grotesk'";
export const V = (p: string) => staticFile(`videos/gammadeck/${p}`);

export const FRAMES = 1755;

/** القطع على بداية المازورة (100 BPM: ضربة كل 18 فريم ومازورة كل 72) */
export const SEG = {
  hook: [0, 216],
  gen: [216, 504],
  paste: [504, 792],
  imp: [792, 1080],
  exp: [1080, 1368],
  sum: [1368, 1512],
  end: [1512, 1755],
} as const;
export type SegK = keyof typeof SEG;

export const BG: Record<SegK, [string, string]> = {
  hook: ["#FFF6B8", "#FFD93D"],
  gen: ["#F1ECFF", "#D5C9FF"],
  paste: ["#E6FAF2", "#B7EBD6"],
  imp: ["#FFEDE8", "#FFC4B8"],
  exp: ["#E9F2FF", "#BFD6FF"],
  sum: ["#FFF6B8", "#FFD93D"],
  end: ["#FFF6B8", "#FFD93D"],
};

export const C = {
  yel: "#FFE15A",
  ink: "#16131F",
  vio: "#6B3DF4",
  cor: "#FF5A4E",
  mint: "#1FB98A",
  sub: "#5A5468",
  paper: "#FFFFFF",
};
