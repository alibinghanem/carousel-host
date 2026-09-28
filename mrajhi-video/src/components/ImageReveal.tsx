import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clampOpts, colors, ease } from "../theme";
import type { Photo } from "../generated/photos";

export type RevealDir = "none" | "right" | "left" | "up" | "down" | "center-x";

type Props = {
  photo: Photo;
  /** absolute box of the frame (left/top/width/height/right/bottom) */
  box: React.CSSProperties;
  focal?: [number, number]; // object-position, 0..1
  start?: number;
  revealDur?: number;
  reveal?: RevealDir;
  /** Ken Burns: scale from→to over dur frames, plus drift in % of box */
  kb?: { from: number; to: number; dur: number; dx?: number; dy?: number };
  /** 0 = colour, 1 = navy→gold duotone */
  duotone?: number;
  scrim?: "bottom" | "left" | "right" | "full" | "none";
  scrimOpacity?: number;
  radius?: number;
  shadow?: boolean;
  border?: boolean;
  /** local frame at which frame closes again (clip out in same direction) */
  exitAt?: number;
  exitDur?: number;
  brightness?: number;
  blur?: number;
};

const clip = (dir: RevealDir, p: number) => {
  const r = (1 - p) * 100;
  switch (dir) {
    case "right": return `inset(0% 0% 0% ${r}%)`;
    case "left": return `inset(0% ${r}% 0% 0%)`;
    case "up": return `inset(${r}% 0% 0% 0%)`;
    case "down": return `inset(0% 0% ${r}% 0%)`;
    case "center-x": return `inset(0% ${r / 2}% 0% ${r / 2}%)`;
    default: return undefined;
  }
};

/** Photo in a frame: masked reveal + inner parallax + slow Ken Burns + optional duotone + scrim. Never static. */
export const ImageReveal: React.FC<Props> = ({
  photo,
  box,
  focal = [0.5, 0.5],
  start = 0,
  revealDur = 26,
  reveal = "right",
  kb = { from: 1.0, to: 1.1, dur: 150 },
  duotone = 0,
  scrim = "none",
  scrimOpacity = 0.6,
  radius = 0,
  shadow = false,
  border = false,
  exitAt,
  exitDur = 16,
  brightness = 1,
  blur = 0,
}) => {
  const frame = useCurrentFrame();
  const pIn = reveal === "none" ? 1 : interpolate(frame - start, [0, revealDur], [0, 1], { ...clampOpts, easing: ease.inOutQuart });
  const pOut = exitAt === undefined ? 0 : interpolate(frame - exitAt, [0, exitDur], [0, 1], { ...clampOpts, easing: ease.inOutQuart });
  const p = pIn * (1 - pOut);
  const t = interpolate(frame, [0, kb.dur], [0, 1], { ...clampOpts, easing: ease.linear });
  const scale = interpolate(t, [0, 1], [kb.from, kb.to]) * (1 + (1 - pIn) * 0.14);
  const dx = (kb.dx ?? 0) * (t - 0.5);
  const dy = (kb.dy ?? 0) * (t - 0.5);
  const imgStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: `${focal[0] * 100}% ${focal[1] * 100}%`,
    scale: String(scale),
    translate: `${dx}% ${dy}%`,
    filter: blur || brightness !== 1 ? `blur(${blur}px) brightness(${brightness})` : undefined,
  };
  const scrimBg =
    scrim === "bottom" ? `linear-gradient(to top, rgba(7,15,38,${scrimOpacity}) 0%, rgba(7,15,38,0) 62%)`
    : scrim === "left" ? `linear-gradient(to right, rgba(7,15,38,${scrimOpacity}) 0%, rgba(7,15,38,0) 65%)`
    : scrim === "right" ? `linear-gradient(to left, rgba(7,15,38,${scrimOpacity}) 0%, rgba(7,15,38,0) 65%)`
    : scrim === "full" ? `rgba(7,15,38,${scrimOpacity})` : undefined;
  return (
    <div
      style={{
        position: "absolute",
        overflow: "hidden",
        borderRadius: radius,
        clipPath: reveal === "none" && exitAt === undefined ? undefined : clip(reveal === "none" ? "center-x" : reveal, p),
        boxShadow: shadow ? "0 40px 90px rgba(3,6,15,0.55), 0 8px 24px rgba(3,6,15,0.4)" : undefined,
        outline: border ? `1.5px solid rgba(220,165,13,0.55)` : undefined,
        outlineOffset: border ? -1.5 : undefined,
        background: colors.navyDeep,
        ...box,
      }}
    >
      <Img src={staticFile(photo.src)} style={imgStyle} />
      {duotone > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: duotone, isolation: "isolate" }}>
          <Img src={staticFile(photo.src)} style={{ ...imgStyle, filter: `grayscale(1) contrast(1.15) brightness(1.05)` }} />
          <div style={{ position: "absolute", inset: 0, background: colors.gold, mixBlendMode: "multiply" }} />
          <div style={{ position: "absolute", inset: 0, background: colors.navy, mixBlendMode: "lighten" }} />
        </div>
      )}
      {scrimBg && <div style={{ position: "absolute", inset: 0, background: scrimBg }} />}
    </div>
  );
};
