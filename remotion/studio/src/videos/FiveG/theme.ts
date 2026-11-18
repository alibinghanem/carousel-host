import { staticFile } from "remotion";
export { ease, OUT, IN, IN_OUT, BACK } from "../ClaudeVsGptPro/theme";

/** «ثلاثة أبراج بثلاث موجات»: برج اتصالات 3D وموجات تختلف بالطول والمدى */
export const DISPLAY = "Noto Kufi Arabic";
export const BODY = "'IBM Plex Sans Arabic', 'Space Grotesk'";
export const EN = "'Space Grotesk'";
export const V = (p: string) => staticFile(`videos/fiveg/${p}`);

export const FRAMES = 1755;

/** القطع على بداية المازورة (100 BPM: ضربة كل 18 فريم ومازورة كل 72) */
export const SEG = {
  hook: [0, 216],
  speed: [216, 504],
  low: [504, 792],
  mid: [792, 1080],
  high: [1080, 1368],
  sum: [1368, 1512],
  end: [1512, 1755],
} as const;
export type SegK = keyof typeof SEG;

export const BG: Record<SegK, [string, string]> = {
  hook: ["#2A1A3D", "#0C0713"],
  speed: ["#2A2147", "#0B0818"],
  low: ["#40290F", "#150B04"],
  mid: ["#0F3A33", "#041411"],
  high: ["#42142F", "#150510"],
  sum: ["#2A1A3D", "#0C0713"],
  end: ["#2A1A3D", "#0C0713"],
};

export const C = {
  amb: "#FFB020",
  mint: "#2BD9A4",
  pink: "#FF4DA6",
  vio: "#B79CFF",
  ink: "#0C0713",
  mute: "#C9BEDA",
  grad: "linear-gradient(90deg, #FFB020 0%, #2BD9A4 50%, #FF4DA6 100%)",
};
