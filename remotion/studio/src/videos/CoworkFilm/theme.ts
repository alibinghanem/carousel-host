import { staticFile } from "remotion";
export { ease, OUT, IN, IN_OUT, BACK, clamp01 } from "../ClaudeVsGptPro/theme";

/** «فيلم منتج»: استوديو طيني دافئ وواجهة Claude عائمة بلون العاج */
export const K = {
  clay: "#D97757",
  clay2: "#B9572F",
  deep: "#7E3519",
  ivory: "#FAF9F5",
  ivory2: "#F0EEE6",
  ink: "#141413",
  sub: "#6B6A64",
  line: "#E3DFD3",
  ok: "#3E9D6B",
  warn: "#E5484D",
  gold: "#F6C453",
};
export const DISPLAY = "Noto Kufi Arabic";
export const BODY = "IBM Plex Sans Arabic";
export const EN = "Space Grotesk";
export const MONO = "JetBrains Mono";
export const V = (p: string) => staticFile(`videos/cowork-film/${p}`);

/** الجدول (30fps · قطع على المازورات) */
export const FRAMES = 1710;
export const SEG = {
  hook: [0, 120],
  what: [120, 360],
  how: [360, 660],
  does: [660, 900],
  sched: [900, 1140],
  safe: [1140, 1440],
  end: [1440, 1710],
} as const;
export type SegK = keyof typeof SEG;
export const inSeg = (f: number, k: SegK) => f >= SEG[k][0] && f < SEG[k][1];
