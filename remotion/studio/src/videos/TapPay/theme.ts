import { staticFile } from "remotion";
export { ease, OUT, IN, IN_OUT, BACK } from "../ClaudeVsGptPro/theme";

/** «الدفع باللمس»: بطاقة 3D رقمها الحقيقي يختفي داخل خزنة الجوال، ورقم بديل ورمز لمرة وحدة يروحون لجهاز الدفع */
export const DISPLAY = "Rubik";
export const BODY = "'IBM Plex Sans Arabic', 'Space Grotesk'";
export const EN = "'Space Grotesk'";
export const V = (p: string) => staticFile(`videos/tappay/${p}`);

export const FRAMES = 1755;

/** القطع على بداية المازورة (100 BPM: ضربة كل 18 فريم ومازورة كل 72) */
export const SEG = {
  hook: [0, 144],
  card: [144, 360],
  vault: [360, 648],
  tap: [648, 936],
  thief: [936, 1224],
  verdict: [1224, 1512],
  end: [1512, 1755],
} as const;
export type SegK = keyof typeof SEG;

export const BG: Record<SegK, [string, string]> = {
  hook: ["#1D1726", "#0B0910"],
  card: ["#2A1E33", "#0C0A12"],
  vault: ["#10302A", "#060F0D"],
  tap: ["#12322B", "#06100E"],
  thief: ["#3A1520", "#120609"],
  verdict: ["#1E2A26", "#090D0C"],
  end: ["#1F1A2C", "#0A0912"],
};

export const C = {
  gold: "#F2C14E",
  mint: "#3DDC97",
  red: "#FF4D5E",
  lilac: "#B9A6FF",
  ink: "#120E18",
  grad: "linear-gradient(90deg, #F2C14E 0%, #F7D98B 45%, #3DDC97 100%)",
};

/** الأرقام المعروضة (أمثلة توضيحية، مو أرقام حقيقية) */
export const REAL = "4532 7781 0094 2261";
export const TOKEN_LAST = "7310";
export const CODES = ["7Q2M9", "K4X81", "B9T3Z", "R6P0W"];
