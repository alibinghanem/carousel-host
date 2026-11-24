import { staticFile } from "remotion";
export { ease, OUT, IN, IN_OUT, BACK } from "../ClaudeVsGptPro/theme";

/** «غرفة التحميض»: جدار داكن، ضوء أمان أحمر، ورق تحميض */
export const P = {
  wall: "#140B0C",
  wall2: "#1E1112",
  red: "#E0312B",
  paper: "#F4EFE6",
  ink: "#1A1414",
  sub: "#6B5E5A",
  green: "#10A37F",
  amber: "#FFB347",
  blue: "#5AA9E6",
  bench: "#2A1D1A",
  tray: "#3A2B2A",
};

export const DISPLAY = "Vazirmatn";
export const BODY = "'IBM Plex Sans Arabic', 'Space Grotesk'";
export const EN = "'Space Grotesk'";
export const MONO = "'JetBrains Mono'";
export const V = (p: string) => staticFile(`videos/darkroom/${p}`);

export const FRAMES = 1710;

/** المحطات على طاولة التحميض (القطع على المازورات بعد أول ضربة 4ث) */
export const SEG = {
  hook: [0, 120],
  upload: [120, 390],
  prompt: [390, 660],
  charts: [660, 930],
  sum: [930, 1200],
  tips: [1200, 1470],
  end: [1470, 1710],
} as const;
export type SegK = keyof typeof SEG;
export const ORDER: SegK[] = ["hook", "upload", "prompt", "charts", "sum", "tips", "end"];
/** كل محطة عرضها 1200 في العالم، والكاميرا تمشي يسار */
export const STEP = 1200;
export const SX = (k: SegK) => -STEP * ORDER.indexOf(k);
