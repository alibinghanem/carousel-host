import { Easing, interpolate } from "remotion";
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const C = {
  bg: "#07090F",
  bg2: "#0E1320",
  y: "#FFD23F",
  r: "#FF3B47",
  b: "#2E86DE",
  cyan: "#3EE0FF",
  ok: "#2BD67B",
  ink: "#0B0E14",
  paper: "#F4F1EA",
  mute: "#8A94A0",
};

export const F = {
  head: "Changa",
  body: "IBM Plex Sans Arabic",
  en: "Space Grotesk",
  mono: "JetBrains Mono",
};

export const fontsReady = Promise.all([
  loadFont({ family: "Changa", url: staticFile("changa-arabic-800-normal.woff2"), weight: "800" }),
  loadFont({ family: "Changa", url: staticFile("changa-latin-800-normal.woff2"), weight: "800" }),
  loadFont({ family: "IBM Plex Sans Arabic", url: staticFile("ibm-plex-sans-arabic-arabic-700-normal.woff2"), weight: "700" }),
  loadFont({ family: "IBM Plex Sans Arabic", url: staticFile("ibm-plex-sans-arabic-arabic-600-normal.woff2"), weight: "600" }),
  loadFont({ family: "Space Grotesk", url: staticFile("space-grotesk-latin-700-normal.woff2"), weight: "700" }),
  loadFont({ family: "Alexandria", url: staticFile("alexandria-arabic-800-normal.woff2"), weight: "800" }),
  loadFont({ family: "Alexandria", url: staticFile("alexandria-latin-800-normal.woff2"), weight: "800" }),
  loadFont({ family: "Alexandria", url: staticFile("alexandria-arabic-500-normal.woff2"), weight: "500" }),
  loadFont({ family: "JetBrains Mono", url: staticFile("jetbrains-mono-latin-800-normal.woff2"), weight: "800" }),
]);

export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

/** interpolate مع clamp وتسهيل افتراضي */
export const lerp = (
  f: number,
  input: [number, number],
  output: [number, number],
  easing: (t: number) => number = OUT,
) =>
  interpolate(f, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** اهتزاز يتلاشى بعد لحظة الضربة */
export const shake = (f: number, at: number, dur = 18, amp = 18) => {
  if (f < at || f > at + dur) return 0;
  const k = 1 - (f - at) / dur;
  return Math.sin((f - at) * 2.7) * amp * k * k;
};
