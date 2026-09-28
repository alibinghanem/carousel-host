import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";

/** Film grain: 4 pre-rendered noise frames cycled every 2 frames, blended as overlay. All <Img> so render waits for load. */
export const GrainOverlay: React.FC<{ opacity?: number }> = ({ opacity = 0.13 }) => {
  const frame = useCurrentFrame();
  const active = Math.floor(frame / 2) % 4;
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", pointerEvents: "none" }}>
      {[0, 1, 2, 3].map((i) => (
        <Img
          key={i}
          src={staticFile(`fx/grain${i}.png`)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: i === active ? opacity : 0,
            scale: i % 2 ? "1.02" : "1",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
