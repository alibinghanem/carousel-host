import { staticFile } from "remotion";
export { ease, OUT, IN, IN_OUT, BACK } from "../ClaudeVsGptPro/theme";

/** «ارتقِ المستويات»: سماء لعبة نهارية، منصات عشب وطوب، عملات ذهبية، وحروف بكسل */
export const G = {
  sky: "#5C94FC",
  sky2: "#A9D2FF",
  ink: "#0D1B3D",
  white: "#FFFFFF",
  cream: "#FFF8E7",
  grass: "#43B047",
  grass2: "#2E8B3A",
  dirt: "#C8742F",
  dirt2: "#8E4A1C",
  coin: "#FFD23F",
  coin2: "#E39B12",
  red: "#E53935",
  boss: "#7B3FE4",
  ok: "#22B35E",
  tv: "#15111F",
};

export const DISPLAY = "'Baloo Bhaijaan 2'";
/** Plex العربي ما فيه حروف لاتينية، فـ Space Grotesk يكمّلها داخل نفس الجملة */
export const BODY = "'IBM Plex Sans Arabic', 'Space Grotesk'";
export const PIXEL = "'Press Start 2P'";
export const EN = "Space Grotesk";
export const MONO = "JetBrains Mono";
export const V = (p: string) => staticFile(`videos/level-up/${p}`);

export const W = 1080;
export const H = 1920;
export const FRAMES = 1710;

/** القطع على مازورات الموسيقى (كل 2ث)، والـ drop عند 4ث */
export const SEG = {
  hook: [0, 120],
  start: [120, 300],
  plan: [300, 600],
  explain: [600, 900],
  quiz: [900, 1200],
  fix: [1200, 1500],
  end: [1500, 1710],
} as const;
export type SegK = keyof typeof SEG;

/** كل مشهد «طابق» في برج اللعبة، والكاميرا تطلع طابق طابق */
export const FLOOR: Record<Exclude<SegK, "hook">, number> = { start: 0, plan: 1, explain: 2, quiz: 3, fix: 4, end: 5 };
export const ORDER: Exclude<SegK, "hook">[] = ["start", "plan", "explain", "quiz", "fix", "end"];

/** حد خارجي للنص (بدل -webkit-text-stroke) */
export const outline = (c: string, w: number, drop = 0) => {
  const s: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    s.push(`${(Math.cos(a) * w).toFixed(1)}px ${(Math.sin(a) * w).toFixed(1)}px 0 ${c}`);
  }
  if (drop) s.push(`0 ${drop}px 0 ${c}`);
  return s.join(",");
};
