import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { clampOpts, colors, ease, familyFor, stagger } from "../theme";

type Props = {
  text: string;
  size: number;
  start?: number;
  weight?: 400 | 500 | 700 | 800 | 900;
  color?: string;
  goldWords?: number[];
  align?: "right" | "center" | "left";
  maxWidth?: number;
  lineHeight?: number;
  staggerFrames?: number;
  dur?: number;
  /** local frame at which the text leaves (rises out + blur) */
  exitAt?: number;
  shadow?: boolean;
  style?: React.CSSProperties;
};

/** Word-level Arabic reveal: masks + blur-to-sharp. Words are never split into letters (keeps joining/shaping). */
export const KineticText: React.FC<Props> = ({
  text,
  size,
  start = 0,
  weight = 800,
  color = colors.cream,
  goldWords = [],
  align = "right",
  maxWidth,
  lineHeight = 1.2,
  staggerFrames = stagger.word,
  dur = 22,
  exitAt,
  shadow = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  const justify = align === "right" ? "flex-start" : align === "center" ? "center" : "flex-end";
  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: justify,
        columnGap: size * 0.26,
        maxWidth,
        fontFamily: familyFor(weight),
        fontSize: size,
        fontWeight: weight,
        lineHeight,
        color,
        textShadow: shadow ? "0 4px 30px rgba(3,6,15,0.45)" : undefined,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = interpolate(frame - start - i * staggerFrames, [0, dur], [0, 1], {
          ...clampOpts,
          easing: ease.expoOut,
        });
        const out =
          exitAt === undefined
            ? 0
            : interpolate(frame - exitAt - i * 2, [0, 14], [0, 1], { ...clampOpts, easing: ease.inOutQuart });
        return (
          <span
            key={i}
            style={{ display: "inline-block", overflow: "hidden", paddingBlock: "0.28em", marginBlock: "-0.28em" }}
          >
            <span
              style={{
                display: "inline-block",
                color: goldWords.includes(i) ? colors.gold : undefined,
                translate: `0 ${(1 - p) * 0.95 * size - out * 0.7 * size}px`,
                filter: `blur(${(1 - p) * 14 + out * 10}px)`,
                opacity: Math.min(1, p * 2.4) * (1 - out),
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Gold rule that draws right→left (reading direction). */
export const Rule: React.FC<{
  start?: number;
  dur?: number;
  width: number;
  thickness?: number;
  color?: string;
  exitAt?: number;
  style?: React.CSSProperties;
}> = ({ start = 0, dur = 20, width, thickness = 5, color = colors.gold, exitAt, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - start, [0, dur], [0, 1], { ...clampOpts, easing: ease.inOutQuart });
  const out =
    exitAt === undefined ? 0 : interpolate(frame - exitAt, [0, 12], [0, 1], { ...clampOpts, easing: ease.inOutQuart });
  return (
    <div
      style={{
        width,
        height: thickness,
        borderRadius: thickness,
        background: color,
        transformOrigin: "right center",
        scale: `${p * (1 - out)} 1`,
        opacity: 1,
        boxShadow: `0 0 24px ${color}66`,
        ...style,
      }}
    />
  );
};
