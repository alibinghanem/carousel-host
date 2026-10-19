import { staticFile } from "remotion";
export { ease, OUT, IN, IN_OUT, BACK } from "../ClaudeVsGptPro/theme";

/** «ساعة المطبخ»: بلاط نعناعي، مؤقت طماطم، وكيك منزلي حقيقي */
export const K = {
  tile: "#D6EFE7",
  grout: "#BBDDD2",
  ink: "#1D2B2A",
  sub: "#4E5F5C",
  tomato: "#E8443A",
  tomato2: "#C8322A",
  mustard: "#F4B23A",
  cream: "#FFF9F0",
  choc: "#5A3A26",
  mint: "#2E9E8A",
  ok: "#2E9E6A",
  wood: "#C9935A",
};

export const DISPLAY = "El Messiri";
export const BODY = "'IBM Plex Sans Arabic', 'Space Grotesk'";
export const EN = "Space Grotesk";
export const MONO = "JetBrains Mono";
export const V = (p: string) => staticFile(`videos/campaign-hour/${p}`);

export const W = 1080;
export const H = 1920;
export const FRAMES = 1705;

/** القطع على مازورات الموسيقى (كل 2ث)، والضربة الأولى عند 4ث */
export const SEG = {
  hook: [0, 120],
  know: [120, 360],
  offer: [360, 660],
  plan: [660, 900],
  write: [900, 1200],
  ship: [1200, 1440],
  end: [1440, 1705],
} as const;
export type SegK = keyof typeof SEG;
export type StepK = "know" | "offer" | "plan" | "write" | "ship";
export const STEPS: StepK[] = ["know", "offer", "plan", "write", "ship"];
/** حدود الدقائق لكل خطوة (من 60) */
export const MIN: Record<StepK, [number, number]> = { know: [0, 10], offer: [10, 20], plan: [20, 35], write: [35, 55], ship: [55, 60] };
export const COLOR: Record<StepK, string> = { know: K.mustard, offer: K.tomato, plan: K.mint, write: K.choc, ship: K.ok };
