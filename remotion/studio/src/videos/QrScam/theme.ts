import { staticFile } from "remotion";
export { ease, OUT, IN, IN_OUT, BACK } from "../ClaudeVsGptPro/theme";

/** «ملصق فوق ملصق»: لوح QR على عمود مواقف، وملصق مزيّف يتقشّر، وخطّاف أحمر يصطاد بطاقتك */
export const DISPLAY = "Tajawal";
export const BODY = "'IBM Plex Sans Arabic', 'Space Grotesk'";
export const EN = "'Space Grotesk'";
export const V = (p: string) => staticFile(`videos/qrscam/${p}`);

export const FRAMES = 1755;

/** القطع على بداية المازورة (100 BPM: ضربة كل 18 فريم ومازورة كل 72) */
export const SEG = {
  hook: [0, 144],
  real: [144, 360],
  sticker: [360, 648],
  scan: [648, 936],
  check: [936, 1224],
  act: [1224, 1512],
  end: [1512, 1755],
} as const;
export type SegK = keyof typeof SEG;

export const BG: Record<SegK, [string, string]> = {
  hook: ["#2A2512", "#0C0B07"],
  real: ["#22282F", "#0B0D10"],
  sticker: ["#2D2A17", "#0E0D07"],
  scan: ["#3A1A1A", "#120808"],
  check: ["#1D2A33", "#0A0E12"],
  act: ["#14301F", "#07100B"],
  end: ["#262116", "#0C0A06"],
};

export const C = {
  yel: "#FFC400",
  red: "#FF4136",
  grn: "#19C37D",
  navy: "#12315E",
  paper: "#F5F1E6",
  ink: "#14161A",
  mute: "#B7B2A3",
  grad: "linear-gradient(90deg, #FFC400 0%, #FFE07A 50%, #19C37D 100%)",
};
