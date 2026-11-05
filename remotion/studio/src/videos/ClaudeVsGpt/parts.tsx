import { Img, staticFile } from "remotion";
export { KUFI, BODY, MONO, LAT, SIG, clamp, ramp, Handles, ClaudeMark } from "../ClaudeTrio/parts";
import { LAT } from "../ClaudeTrio/parts";

/** هوية «مضمار الغروب»: سماء غروب بنفسجية + مسار برتقالي لـ Claude ومسار أخضر لـ ChatGPT */
export const P = {
  bg: "#150A33",
  ink: "#FFFFFF",
  mute: "#D7C9F0",
  cl: "#FF9461",
  gp: "#2FD5A0",
  gold: "#FFD98A",
  road: "#1A0F3D",
  bad: "#FF6B7A",
};
export const VV = (p: string) => staticFile(`videos/claude-vs-gpt/${p}`);

export const GptMark: React.FC<{ size?: number; glow?: string }> = ({ size = 80, glow }) => (
  <Img src={VV("openai.svg")} style={{ width: size, height: size, filter: `brightness(0) invert(1)${glow ? ` drop-shadow(0 0 ${size * 0.25}px ${glow})` : ""}` }} />
);

/** اسم لاتيني داخل سطر عربي */
export const En: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color }) => (
  <span style={{ fontFamily: LAT, direction: "ltr", unicodeBidi: "isolate", display: "inline-block", color }}>{children}</span>
);
