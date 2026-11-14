import { staticFile } from "remotion";
export { ease, OUT, IN, IN_OUT, BACK } from "../ClaudeVsGptPro/theme";

/** «عدّاد الجوال»: خزّان تخزين مكدّس، سهم إعادة تشغيل، وعدّاد سرعة يرجع للأخضر */
export const DISPLAY = "Mada";
export const BODY = "'IBM Plex Sans Arabic', 'Space Grotesk'";
export const EN = "'Space Grotesk'";
export const V = (p: string) => staticFile(`videos/slowphone/${p}`);

export const FRAMES = 1755;

/** القطع على بداية المازورة (100 BPM: ضربة كل 18 فريم ومازورة كل 72) */
export const SEG = {
  hook: [0, 216],
  storage: [216, 504],
  restart: [504, 792],
  update: [792, 1080],
  heat: [1080, 1368],
  sum: [1368, 1512],
  end: [1512, 1755],
} as const;
export type SegK = keyof typeof SEG;

export const BG: Record<SegK, [string, string]> = {
  hook: ["#1D3A3D", "#061214"],
  storage: ["#1B3340", "#07131A"],
  restart: ["#1E3A33", "#07140F"],
  update: ["#1B2F45", "#070F1A"],
  heat: ["#40281A", "#140A06"],
  sum: ["#23401F", "#08140A"],
  end: ["#1D3A3D", "#061214"],
};

export const C = {
  lime: "#B6F24A",
  red: "#FF4B3E",
  org: "#FF9F1C",
  cyan: "#3DD6F5",
  pink: "#FF5C8A",
  ink: "#0A1416",
  mute: "#AFC3C4",
  grad: "linear-gradient(90deg, #B6F24A 0%, #3DD6F5 100%)",
};
