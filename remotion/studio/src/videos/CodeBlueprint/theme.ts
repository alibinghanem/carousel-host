import { staticFile } from "remotion";
export { ease, OUT, IN, IN_OUT, BACK, clamp01 } from "../ClaudeVsGptPro/theme";

/** «المخطط الهندسي»: ورقة بلوبرنت زرقاء، خطوط طباشير بيضاء، وClaude بلون الطين */
export const B = {
  sheet: "#0E3A7A",
  sheet2: "#0A2C60",
  deep: "#061A3A",
  line: "#E8F2FF",
  soft: "#A9C8F0",
  dim: "rgba(232,242,255,.16)",
  clay: "#FF8A5B",
  yel: "#FFD54A",
  ok: "#4ADE80",
  bad: "#FF6B6B",
  napkin: "#FBF6EA",
  pencil: "#3B3A36",
};
export const DISPLAY = "Vazirmatn";
export const BODY = "IBM Plex Sans Arabic";
export const EN = "Space Grotesk";
export const MONO = "JetBrains Mono";
export const HAND = "Aref Ruqaa";
export const V = (p: string) => staticFile(`videos/code-blueprint/${p}`);

export const FRAMES = 1710;
export const SEG = {
  hook: [0, 120],
  what: [120, 360],
  how: [360, 660],
  verify: [660, 900],
  where: [900, 1140],
  control: [1140, 1440],
  end: [1440, 1710],
} as const;
export type SegK = keyof typeof SEG;

/** كل مشهد خلية في ورقة كبيرة (2 × 3)، والكاميرا تنزلق بينها */
export const CELL: Record<Exclude<SegK, "end">, [number, number]> = {
  hook: [0, 0],
  what: [1, 0],
  how: [1, 1],
  verify: [0, 1],
  where: [0, 2],
  control: [1, 2],
};
