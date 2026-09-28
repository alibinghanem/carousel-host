import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { DISPLAY, FONT, clampOpts, colors, ease } from "../theme";
import { ImageReveal } from "./ImageReveal";
import { ICONS } from "./icons";
import { P } from "../generated/photos";

type Props = {
  iconKey: string;
  title: string;
  text: string;
  photo: number;
  start: number;
  exitAt?: number;
  box: { left: number; top: number; width: number; height: number };
  titleSize: number;
  textSize: number;
  kbDir?: 1 | -1;
};

export const ServiceCard: React.FC<Props> = ({ iconKey, title, text, photo, start, exitAt, box, titleSize, textSize, kbDir = 1 }) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  const inP = interpolate(local, [0, 26], [0, 1], { ...clampOpts, easing: ease.expoOut });
  const outP = exitAt === undefined ? 0 : interpolate(frame - exitAt, [0, 16], [0, 1], { ...clampOpts, easing: ease.inOutQuart });
  const iconP = interpolate(local, [14, 46], [0, 1], { ...clampOpts, easing: ease.inOutQuart });
  const badge = Math.min(box.width * 0.24, 132);
  const photoH = box.height * 0.5;
  return (
    <div
      style={{
        position: "absolute",
        ...box,
        translate: `${outP * -90}px ${(1 - inP) * 90}px`,
        opacity: inP * (1 - outP),
        clipPath: `inset(${(1 - inP) * 40}% 0% 0% 0% round 30px)`,
        borderRadius: 30,
        background: `linear-gradient(160deg, ${colors.navySurface}, ${colors.navy})`,
        boxShadow: "0 40px 80px rgba(3,6,15,0.5)",
        outline: `1.5px solid rgba(220,165,13,0.38)`,
        outlineOffset: -1.5,
        overflow: "hidden",
      }}
    >
      <ImageReveal
        photo={P[photo]}
        reveal="none"
        box={{ left: 0, top: 0, width: box.width, height: photoH }}
        duotone={interpolate(local, [30, 70], [0.7, 0.2], clampOpts)}
        scrim="bottom"
        scrimOpacity={0.75}
        kb={{ from: 1.02, to: 1.16, dur: 200, dx: 4 * kbDir }}
      />
      <div
        style={{
          position: "absolute",
          right: box.width * 0.08,
          top: photoH - badge / 2,
          width: badge,
          height: badge,
          borderRadius: "50%",
          background: colors.navy,
          outline: `2px solid ${colors.gold}`,
          outlineOffset: -2,
          boxShadow: "0 12px 30px rgba(3,6,15,0.5)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <svg viewBox="0 0 64 64" width={badge * 0.56} height={badge * 0.56} fill="none" stroke={colors.gold} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          {ICONS[iconKey].map((d, i) => (
            <path key={i} d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - iconP} />
          ))}
        </svg>
      </div>
      <div dir="rtl" style={{ position: "absolute", right: box.width * 0.08, left: box.width * 0.08, top: photoH + badge / 2 + 18, fontFamily: FONT }}>
        <div style={{ fontFamily: DISPLAY, fontSize: titleSize, fontWeight: 800, color: colors.cream, lineHeight: 1.15, opacity: interpolate(local, [24, 44], [0, 1], clampOpts), translate: `0 ${interpolate(local, [24, 44], [24, 0], { ...clampOpts, easing: ease.expoOut })}px` }}>{title}</div>
        <div style={{ fontSize: textSize, fontWeight: 500, color: colors.muted, lineHeight: 1.35, marginTop: 10, opacity: interpolate(local, [32, 54], [0, 1], clampOpts), translate: `0 ${interpolate(local, [32, 54], [24, 0], { ...clampOpts, easing: ease.expoOut })}px` }}>{text}</div>
      </div>
    </div>
  );
};
