import { Easing, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Type system: Noto Kufi Arabic (display: headlines, numerals) + IBM Plex Sans Arabic (text). Both OFL, bundled in
// public/fonts so renders never need the network. (Site UI itself uses Tajawal; the film upgrades to a more premium pairing.)
export const DISPLAY = "Noto Kufi Arabic";
export const FONT = "IBM Plex Sans Arabic";
loadFont({ family: DISPLAY, url: staticFile("fonts/NotoKufiArabic-VF.ttf"), weight: "100 900", format: "truetype" });
([["Regular", "400"], ["Medium", "500"], ["SemiBold", "600"], ["Bold", "700"]] as const).forEach(([file, weight]) => {
  loadFont({ family: FONT, url: staticFile(`fonts/IBMPlexSansArabic-${file}.ttf`), weight, format: "truetype" });
});
/** headline weights (>=700) use the display face, everything lighter uses the text face */
export const familyFor = (weight: number) => (weight >= 700 ? DISPLAY : FONT);

export const colors = {
  navy: "#0D1B3E",
  navyDeep: "#070F26",
  navySurface: "#16294F",
  navyMid: "#223A6B",
  gold: "#DCA50D", // sampled from the real logo
  goldSoft: "#C9A84C", // site UI accent
  cream: "#F7F3E8",
  muted: "#B9C2D6",
  charcoal: "#38393D", // sampled from the real logo
  white: "#FFFFFF",
} as const;

// ---- Motion system (see research/creative.md §4) ----
export const ease = {
  expoOut: Easing.bezier(0.16, 1, 0.3, 1),
  inOutQuart: Easing.bezier(0.76, 0, 0.24, 1),
  softOut: Easing.bezier(0.22, 1, 0.36, 1),
  linear: Easing.linear,
};
export const springs = {
  smooth: { damping: 200 },
  pop: { damping: 16, stiffness: 140, mass: 0.7 },
};
export const stagger = { word: 4, item: 6, card: 8 };
export const FPS = 30;
export const TRANSITION = 15; // frames of overlap between scenes
export const BEAT = 15; // 120 BPM @ 30 fps

export const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const size = portrait
    ? { hero: 150, headline: 108, sub: 60, body: 44, caption: 32 }
    : { hero: 168, headline: 120, sub: 64, body: 44, caption: 30 };
  const margin = portrait
    ? { x: 72, top: 150, bottom: 180 }
    : { x: 120, top: 96, bottom: 96 };
  return { width, height, portrait, size, margin };
};

// Arabic-Indic digits (the site prints prices/stats this way)
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
export const toArabicDigits = (s: string | number) =>
  String(s).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);
// Stats on the site's About page are printed with Latin digits (1,000 / 6,000 / 40) — we match that.
export const formatNum = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
