import { staticFile } from "remotion";
export { ease, OUT, IN, IN_OUT, BACK } from "../ClaudeVsGptPro/theme";

/** «٤ بوابات»: مصفاة اختيار الأداة، بالترتيب: التكامل ← الأمان ← السعر ← منحنى التعلّم */
export const DISPLAY = "Noto Kufi Arabic";
export const BODY = "'IBM Plex Sans Arabic', 'Space Grotesk'";
export const EN = "'Space Grotesk'";
export const V = (p: string) => staticFile(`videos/toolpicker/${p}`);

export const FRAMES = 1755;

/** القطع على بداية المازورة (100 BPM: ضربة كل 18 فريم ومازورة كل 72) */
export const SEG = {
  hook: [0, 216],
  g1: [216, 504],
  g2: [504, 792],
  g3: [792, 1080],
  g4: [1080, 1368],
  verdict: [1368, 1512],
  end: [1512, 1755],
} as const;
export type SegK = keyof typeof SEG;

export const C = {
  bg: "#F6F2EA",
  bg2: "#EAE3D4",
  ink: "#14121F",
  mu: "#5C566B",
  line: "#D6CEBB",
  violet: "#6C4CF5",
  mint: "#12B886",
  red: "#E5484D",
  amber: "#F5A524",
};

/** المرشحون (أمثلة توضيحية، مو أدوات حقيقية) */
export const CANDS = [
  { k: "A", color: "#6C4CF5" },
  { k: "B", color: "#2E86DE" },
  { k: "C", color: "#F5A524" },
  { k: "D", color: "#12A5A5" },
  { k: "E", color: "#E5589B" },
] as const;

/** الإقصاء: البوابة + الفريم داخل مشهدها */
export const ELIM: Record<string, [number, number]> = { C: [1, 168], E: [1, 192], D: [2, 190], B: [3, 190] };
export const WIN_AT = 180;
