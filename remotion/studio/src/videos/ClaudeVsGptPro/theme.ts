import { Easing, interpolate, staticFile } from "remotion";

/** «الشاشة المقسومة»: يمين عالم Claude (عاجي + طين)، يسار عالم ChatGPT (أسود + أبيض + أخضر) */
export const CL = { bg: "#FAF9F5", bg2: "#F0EEE6", ink: "#141413", sub: "#5E5D59", line: "#E3DFD3", acc: "#D97757", acc2: "#B9572F" };
export const GP = { bg: "#0B0B0C", bg2: "#1C1C1E", ink: "#FFFFFF", sub: "#A6A6A6", line: "#2C2C2E", acc: "#10A37F", acc2: "#3DDC97" };
export const STAGE = "#141413";
export const RED = "#E5484D";

export const DISPLAY = "Noto Kufi Arabic"; // Readex Pro وAlexandria يرسمان الياء الأخيرة بلا نقاط («على» بدل «علي»)
export const BODY = "IBM Plex Sans Arabic";
export const EN = "Space Grotesk";
export const MONO = "JetBrains Mono";

export const W = 1080;
export const H = 1920;
export const MID = 540;
/** مراكز الأعمدة (داخل كل نصف) — عرض العمود 380 */
export const COL = 380;
export const RX = 215; // مركز عمود Claude داخل النصف الأيمن (مطلق 755)
export const LX = 325; // مركز عمود ChatGPT داخل النصف الأيسر (مطلق 325)

export const V = (p: string) => staticFile(`videos/claude-vs-gpt-pro/${p}`);

export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const IN = Easing.bezier(0.7, 0, 0.84, 0);
export const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const BACK = Easing.bezier(0.34, 1.56, 0.64, 1);

/** تقدّم 0→1 من الفريم a خلال d فريم */
export const ease = (f: number, a: number, d: number, e: (t: number) => number = OUT) =>
  interpolate(f, [a, a + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const typed = (text: string, f: number, at: number, dur: number) =>
  text.slice(0, Math.round(clamp01((f - at) / dur) * text.length));
