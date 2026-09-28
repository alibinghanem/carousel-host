import React from "react";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { useVideoConfig } from "remotion";
import { colors } from "./theme";

type Props = { skew?: number };

/**
 * Brand transition: a slanted (spire-angle) wipe that travels right→left (portrait: bottom→top),
 * leading with a gold band. The outgoing scene drifts back and dims underneath.
 */
const GoldWipe: React.FC<TransitionPresentationComponentProps<Props>> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const { width: W, height: H } = useVideoConfig();
  const portrait = H > W;
  const p = presentationProgress;
  if (presentationDirection === "exiting") {
    return (
      <div style={{ position: "absolute", inset: 0, translate: portrait ? `0 ${-p * H * 0.06}px` : `${-p * W * 0.07}px 0`, filter: `brightness(${1 - p * 0.55})` }}>
        {children}
      </div>
    );
  }
  const sk = passedProps.skew ?? (portrait ? W * 0.28 : H * 0.42);
  const bw = 10 + 70 * Math.sin(Math.PI * p);
  let clip: string, band: string;
  if (!portrait) {
    const xBot = W - p * (W + sk);
    const xTop = xBot + sk;
    clip = `polygon(${xTop}px 0px, ${W}px 0px, ${W}px ${H}px, ${xBot}px ${H}px)`;
    band = `polygon(${xTop - bw}px 0px, ${xTop}px 0px, ${xBot}px ${H}px, ${xBot - bw}px ${H}px)`;
  } else {
    const yR = H - p * (H + sk);
    const yL = yR + sk;
    clip = `polygon(0px ${yL}px, ${W}px ${yR}px, ${W}px ${H}px, 0px ${H}px)`;
    band = `polygon(0px ${yL - bw}px, ${W}px ${yR - bw}px, ${W}px ${yR}px, 0px ${yL}px)`;
  }
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, clipPath: clip }}>{children}</div>
      <div style={{ position: "absolute", inset: 0, clipPath: band, background: `linear-gradient(90deg, ${colors.goldSoft}, ${colors.gold})`, filter: "drop-shadow(0 0 30px rgba(220,165,13,0.7))", opacity: p > 0 && p < 1 ? 1 : 0 }} />
    </div>
  );
};

export const goldWipe = (props: Props = {}): TransitionPresentation<Props> => ({ component: GoldWipe, props });
