import React from "react";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { useVideoConfig } from "remotion";
import { colors } from "../theme";

type Props = { fx?: number; fy?: number };

/**
 * «الغوص» — the film's continuous camera move.
 * Exiting scene: the camera pushes toward the focal point (scale + radial-style blur + bloom).
 * Entering scene: opens as a window AT that focal point and grows to full frame, its content
 * settling from a deeper zoom, so the next scene is what you were flying into.
 */
const PortalDiveComponent: React.FC<TransitionPresentationComponentProps<Props>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  const { width: W, height: H } = useVideoConfig();
  const fx = (passedProps.fx ?? 0.5) * W;
  const fy = (passedProps.fy ?? 0.4) * H;

  if (presentationDirection === "exiting") {
    const s = 1 + 0.85 * p;
    const origin = `${fx}px ${fy}px`;
    return (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, transformOrigin: origin, scale: String(s), filter: `blur(${p * 16}px) brightness(${1 + 0.3 * p})` }}>{children}</div>
        {p > 0.02 && (
          <div style={{ position: "absolute", inset: 0, transformOrigin: origin, scale: String(s * 1.09), filter: `blur(${p * 26}px)`, opacity: 0.55 * p }}>{children}</div>
        )}
      </div>
    );
  }

  const w = W * p, h = H * p;
  const cx = fx + (W / 2 - fx) * p, cy = fy + (H / 2 - fy) * p;
  const left = cx - w / 2, top = cy - h / 2, r = 90 * (1 - p);
  const inner = 1 + 0.75 * (1 - p);
  const rimOpacity = p < 0.04 ? p / 0.04 : Math.max(0, 1 - (p - 0.55) / 0.4);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left, top, width: w, height: h, borderRadius: r, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: -left, top: -top, width: W, height: H, transformOrigin: `${fx}px ${fy}px`, scale: String(inner) }}>{children}</div>
      </div>
      <div
        style={{
          position: "absolute", left, top, width: w, height: h, borderRadius: r,
          border: `3px solid ${colors.gold}`, boxShadow: `0 0 40px rgba(220,165,13,0.75), inset 0 0 30px rgba(220,165,13,0.35)`,
          opacity: rimOpacity,
        }}
      />
    </div>
  );
};

export const portalDive = (props: Props = {}): TransitionPresentation<Props> => ({ component: PortalDiveComponent, props });
