import { staticFile } from "remotion";
export { ease, OUT, IN, IN_OUT, BACK } from "../ClaudeVsGptPro/theme";

/** «مكتب البريد الذكي»: ظروف 3D تنسحب لشرارة Gemini وتطلع زبدة، وبعدها جوال ولابتوب */
export const DISPLAY = "El Messiri";
export const BODY = "'IBM Plex Sans Arabic', 'Space Grotesk'";
export const EN = "'Space Grotesk'";
export const V = (p: string) => staticFile(`videos/geminimail/${p}`);

export const FRAMES = 1755;

/** القطع على بداية المازورة (100 BPM من أول ثانية: ضربة كل 18 فريم ومازورة كل 72) */
export const SEG = {
  hook: [0, 144],
  intro: [144, 360],
  sum: [360, 648],
  ask: [648, 936],
  write: [936, 1224],
  docs: [1224, 1512],
  end: [1512, 1755],
} as const;
export type SegK = keyof typeof SEG;

/** خلفية كل مشهد (وسط · أطراف) */
export const BG: Record<SegK, [string, string]> = {
  hook: ["#2A1F5C", "#0B0820"],
  intro: ["#2E2368", "#0B0820"],
  sum: ["#1B2E66", "#060B1E"],
  ask: ["#33205E", "#0B0719"],
  write: ["#4A1E3C", "#120611"],
  docs: ["#123477", "#050C1E"],
  end: ["#271C57", "#08061A"],
};

export const C = {
  blue: "#4C8DF6",
  violet: "#9B7BF0",
  pink: "#E77A93",
  red: "#EA4335",
  green: "#34A853",
  gold: "#FBBC04",
  ink: "#0B0820",
  grad: "linear-gradient(90deg, #4796E3 0%, #9177C7 55%, #D96570 100%)",
};
