import { staticFile } from "remotion";
export { ease, OUT, IN, IN_OUT, BACK, typed, clamp01 } from "../ClaudeVsGptPro/theme";

/** «الإيصال والحاسبة»: رقم يطلع على إيصال طويل، وتدقّقه بثلاث أسئلة */
export const DISPLAY = "Cairo";
export const BODY = "'IBM Plex Sans Arabic', 'Space Grotesk'";
export const EN = "'Space Grotesk'";
export const MONO = "'JetBrains Mono', monospace";
export const V = (p: string) => staticFile(`videos/checknum/${p}`);

export const FRAMES = 1755;

/** القطع على بداية المازورة (100 BPM: ضربة كل 18 فريم ومازورة كل 72) */
export const SEG = {
  hook: [0, 216],
  src: [216, 504],
  how: [504, 792],
  smp: [792, 1080],
  bad: [1080, 1368],
  sum: [1368, 1512],
  end: [1512, 1755],
} as const;
export type SegK = keyof typeof SEG;

export const BG: Record<SegK, [string, string]> = {
  hook: ["#222816", "#0B0D07"],
  src: ["#1B2A33", "#080E12"],
  how: ["#2C2A14", "#0E0D05"],
  smp: ["#17302A", "#07120F"],
  bad: ["#34201A", "#120A07"],
  sum: ["#222816", "#0B0D07"],
  end: ["#222816", "#0B0D07"],
};

export const C = {
  lime: "#D7F34A",
  red: "#FF5547",
  amb: "#FFB84D",
  cyan: "#5CD6F2",
  paper: "#F7F4EA",
  ink: "#12140E",
  sub: "#A9AE9A",
  grad: "linear-gradient(90deg, #D7F34A 0%, #5CD6F2 100%)",
};
