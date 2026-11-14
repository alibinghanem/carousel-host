import { staticFile } from "remotion";
export { ease, OUT, IN, IN_OUT, BACK } from "../ClaudeVsGptPro/theme";

/** «القفل الثاني»: خزنة 3D بقفلين، والمفتاح المسروق يفتح الأول بس */
export const DISPLAY = "Tajawal";
export const BODY = "'IBM Plex Sans Arabic', 'Space Grotesk'";
export const MONO = "'JetBrains Mono'";
export const V = (p: string) => staticFile(`videos/twolocks/${p}`);

export const FRAMES = 1754;

/** القطع على بداية المازورة (الـ drop على 4.0ث، 100 BPM: ضربة كل 18 فريم ومازورة كل 72) */
export const SEG = {
  hook: [0, 120],
  one: [120, 408],
  two: [408, 696],
  wa: [696, 984],
  google: [984, 1272],
  rule: [1272, 1488],
  end: [1488, 1754],
} as const;
export type SegK = keyof typeof SEG;

/** خلفية كل مشهد (وسط · أطراف) */
export const BG: Record<SegK, [string, string]> = {
  hook: ["#1B222C", "#07090C"],
  one: ["#3A0F14", "#0A0507"],
  two: ["#0E3A2A", "#050B09"],
  wa: ["#0B3B30", "#04100D"],
  google: ["#0F2A52", "#050913"],
  rule: ["#3A2A0C", "#0B0804"],
  end: ["#0E3A3A", "#050B0C"],
};

export const C = {
  red: "#FF4D4D",
  green: "#25D366",
  ok: "#2BD47D",
  blue: "#4C8DF6",
  gold: "#FFC23D",
  ink: "#07101C",
};
