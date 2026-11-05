import { staticFile } from "remotion";
export { ease, OUT, IN, IN_OUT, BACK } from "../ClaudeVsGptPro/theme";

/** «البذرة»: سما بنفسجي يذوب في خوخي عند الأفق، وتربة بنية بطبقات */
export const P = {
  sky0: "#BBA8F0",
  sky1: "#E3D3F5",
  sky2: "#FFE2C6",
  grass: "#5DAA5F",
  grass2: "#3F8A4A",
  soil0: "#7A5236",
  soil1: "#5B3C27",
  soil2: "#3E291B",
  root: "#F6E6C8",
  stem: "#3E8A4C",
  leaf: "#62BE66",
  leaf2: "#4FA556",
  petal: "#F58FAE",
  core: "#FFD45A",
  fruit: "#F39A3B",
  ink: "#2B1F47",
  sub: "#5B4E78",
  cream: "#FFF3DC",
};

export const DISPLAY = "Lemonada";
export const BODY = "'IBM Plex Sans Arabic', 'Space Grotesk'";
export const EN = "Space Grotesk";
export const V = (p: string) => staticFile(`videos/learn-30/${p}`);

export const W = 1080;
export const H = 1920;
export const FRAMES = 1710;

/** القطع على مازورات الموسيقى (الضربة الأولى 4ث، وكل ضربة 15 فريم) */
export const SEG = {
  hook: [0, 120],
  w1: [120, 390],
  w2: [390, 660],
  w3: [660, 930],
  w4: [930, 1200],
  sum: [1200, 1410],
  end: [1410, 1710],
} as const;
export type SegK = keyof typeof SEG;
export type WeekK = "w1" | "w2" | "w3" | "w4";
export const WEEKS: WeekK[] = ["w1", "w2", "w3", "w4"];

export const WEEK: Record<WeekK, { color: string; part: string; title: string; task: string; days: [number, number] }> = {
  w1: { color: "#C98A3A", part: "الجذور", title: "الأساسيات", task: "15 دقيقة باليوم: سولف معه عن مادتك", days: [0, 7] },
  w2: { color: "#3E8A4C", part: "الساق", title: "البرومبت", task: "اكتب نفس الطلب 3 مرات، وقارن الرد", days: [7, 14] },
  w3: { color: "#3F6FD8", part: "الأغصان", title: "الأدوات", task: "جرّب أداة كل يومين، وثبّت وحدة", days: [14, 21] },
  w4: { color: "#E0527A", part: "الثمرة", title: "مشروع صغير", task: "حل مشكلة حقيقية عندك، وشاركه", days: [21, 30] },
};

/** الأرض في إحداثيات العالم */
export const GROUND = 2600;
export const SEED = { x: 500, y: 2700 };
export const STEM_X = 500;
