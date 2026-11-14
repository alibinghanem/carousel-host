import { Img, staticFile } from "remotion";
import { smooth } from "../../lib/camera3d";

/** هوية «السوق»: نهار دافئ — رمل، خشب، مظلات ملوّنة، وخط El Messiri */
export const P = {
  ink: "#2B1A12",
  sky: "#FFE3C4",
  sand: "#EBCB9B",
  wood: "#8A5A34",
  wood2: "#A9713F",
  wood3: "#5E3B20",
  cream: "#FFF6E8",
  terra: "#D9532E",
  teal: "#1F9C8A",
  gold: "#E7A93B",
  plum: "#7A3E8E",
  blue: "#3A86D1",
  green: "#25A55F",
  mute: "#7A5C46",
};
export const HEAD = "El Messiri";
export const BODY = "IBM Plex Sans Arabic";
export const MONO = "JetBrains Mono";
export const V = (p: string) => staticFile(`videos/souq/${p}`);
export const clamp = (v: number) => Math.min(1, Math.max(0, v));
export const ramp = (f: number, a: number, d = 10) => smooth((f - a) / d);
export const ease = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const typed = (text: string, lf: number, at: number, dur: number) => text.slice(0, Math.round(clamp((lf - at) / dur) * text.length));
export { Img };
