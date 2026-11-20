import { staticFile } from "remotion";
export { ease, OUT, IN, IN_OUT, BACK } from "../ClaudeVsGptPro/theme";

/** «الإنترنت تحت البحر»: كرة أرضية 3D بكابلات مضيئة، ومقطع كابل، ومرساة تقطعه */
export const DISPLAY = "Changa";
export const BODY = "'IBM Plex Sans Arabic', 'Space Grotesk'";
export const EN = "'Space Grotesk'";
export const V = (p: string) => staticFile(`videos/subsea/${p}`);

export const FRAMES = 1755;

/** القطع على بداية المازورة (100 BPM: ضربة كل 18 فريم ومازورة كل 72) */
export const SEG = {
  hook: [0, 144],
  intro: [144, 360],
  trip: [360, 648],
  cable: [648, 936],
  hit: [936, 1224],
  reroute: [1224, 1512],
  end: [1512, 1755],
} as const;
export type SegK = keyof typeof SEG;

export const BG: Record<SegK, [string, string]> = {
  hook: ["#073647", "#02101A"],
  intro: ["#07455A", "#02121C"],
  trip: ["#0A4A63", "#031621"],
  cable: ["#0A3552", "#02111B"],
  hit: ["#0A3B44", "#02161C"],
  reroute: ["#3A1F2E", "#12060F"],
  end: ["#073B4D", "#031219"],
};

export const C = {
  cyan: "#37E6FF",
  foam: "#BFF3FF",
  amber: "#FFB020",
  red: "#FF5252",
  ink: "#031A24",
  grad: "linear-gradient(90deg, #1FB6D6 0%, #37E6FF 60%, #7FF0C8 100%)",
};
