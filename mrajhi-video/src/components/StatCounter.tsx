import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { DISPLAY, FONT, clampOpts, colors, ease, formatNum, springs } from "../theme";
import { Rule } from "./KineticText";

type Props = {
  value: number;
  suffix?: string;
  label: string;
  start?: number;
  size: number;
  labelSize: number;
  countDur?: number;
  align?: "right" | "center";
};

export const StatCounter: React.FC<Props> = ({ value, suffix = "", label, start = 0, size, labelSize, countDur = 48, align = "right" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - start;
  const count = interpolate(local, [0, countDur], [0, value], { ...clampOpts, easing: ease.expoOut });
  const pop = spring({ frame: local, fps, config: springs.pop });
  const inP = interpolate(local, [0, 16], [0, 1], { ...clampOpts, easing: ease.expoOut });
  const final = formatNum(value) + suffix;
  const alignItems = align === "center" ? "center" : "flex-start";
  return (
    <div dir="rtl" style={{ display: "flex", flexDirection: "column", alignItems, gap: labelSize * 0.35, fontFamily: FONT, opacity: inP, translate: `0 ${(1 - inP) * 30}px` }}>
      <div style={{ position: "relative", fontFamily: DISPLAY, fontSize: size, fontWeight: 800, lineHeight: 1.05, color: colors.gold, scale: String(interpolate(pop, [0, 1], [0.92, 1])), transformOrigin: align === "center" ? "center" : "right center" }}>
        <span dir="ltr" style={{ opacity: 0, whiteSpace: "nowrap", display: "block" }}>{final}</span>
        <span dir="ltr" style={{ position: "absolute", inset: 0, whiteSpace: "nowrap", textAlign: align === "center" ? "center" : "right", fontVariantNumeric: "tabular-nums" }}>
          {formatNum(count)}{suffix}
        </span>
      </div>
      <Rule start={start + 8} dur={22} width={size * 0.9} thickness={4} />
      <div style={{ fontSize: labelSize, fontWeight: 500, color: colors.muted, lineHeight: 1.25 }}>{label}</div>
    </div>
  );
};
