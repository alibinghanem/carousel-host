import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { Audio } from "@remotion/media";
import { ease } from "./theme";
import { portalDive } from "./dive/PortalDive";
import { Spine } from "./dive/Spine";
import { LogoBadge } from "./dive/LogoBadge";
import { GrainOverlay } from "./components/GrainOverlay";
import { DiveHook, DiveProject, DiveProof, DivePromise } from "./dive/DiveScenes";
import { EndCard } from "./scenes/EndCard";
import { LightLeakBurst } from "./dive/LightLeakBurst";

// 9:16 «الغوص»: 7 chapters, 6 portal-dive transitions of 24 f. Cuts land on 3 / 6 / 9 / 12 / 17 / 21 s (120 BPM).
export const DIVE_T = 24;
export const DIVE = { hook: 114, p1: 114, p2: 114, p3: 114, proof: 174, promise: 144, end: 255 } as const;
export const DIVE_FRAMES = Object.values(DIVE).reduce((a, b) => a + b, 0) - 6 * DIVE_T;
const MARKS = [0, 90, 180, 270, 360, 510, 630];

const PROJECTS = [
  { name: "مشروع الندى", district: "الرياض · حي العليا", ext: 6, int: 88, focal: [0.55, 0.5] as [number, number], portal: [0.5, 0.4] as [number, number] },
  { name: "مشروع الأندلس", district: "الرياض · حي العليا", ext: 13, int: 104, focal: [0.5, 0.5] as [number, number], portal: [0.45, 0.5] as [number, number] },
  { name: "عمارة ماما نورة", district: "الرياض · حي العليا", ext: 29, int: 184, focal: [0.5, 0.5] as [number, number], portal: [0.5, 0.45] as [number, number] },
];

const dive = (fx: number, fy: number) => (
  <TransitionSeries.Transition presentation={portalDive({ fx, fy })} timing={linearTiming({ durationInFrames: DIVE_T, easing: ease.inOutQuart })} />
);

export const PromoDive: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#070F26" }}>
    <TransitionSeries>
      <TransitionSeries.Sequence name="01 Hook" durationInFrames={DIVE.hook}><DiveHook /></TransitionSeries.Sequence>
      {dive(0.62, 0.4)}
      <TransitionSeries.Sequence name="02 Nada" durationInFrames={DIVE.p1}><DiveProject project={PROJECTS[0]} index={0} total={3} /></TransitionSeries.Sequence>
      {dive(0.5, 0.4)}
      <TransitionSeries.Sequence name="03 Andalus" durationInFrames={DIVE.p2}><DiveProject project={PROJECTS[1]} index={1} total={3} /></TransitionSeries.Sequence>
      {dive(0.5, 0.42)}
      <TransitionSeries.Sequence name="04 MamaNora" durationInFrames={DIVE.p3}><DiveProject project={PROJECTS[2]} index={2} total={3} /></TransitionSeries.Sequence>
      {dive(0.5, 0.36)}
      <TransitionSeries.Sequence name="05 Proof" durationInFrames={DIVE.proof}><DiveProof /></TransitionSeries.Sequence>
      {dive(0.5, 0.5)}
      <TransitionSeries.Sequence name="06 Promise" durationInFrames={DIVE.promise}><DivePromise /></TransitionSeries.Sequence>
      {dive(0.5, 0.22)}
      <TransitionSeries.Sequence name="07 End" durationInFrames={DIVE.end}><EndCard /></TransitionSeries.Sequence>
    </TransitionSeries>
    <LightLeakBurst at={618} dur={44} />
    <Spine marks={MARKS} total={DIVE_FRAMES} />
    <GrainOverlay opacity={0.1} />
    <LogoBadge hideFrom={626} />
    <Audio src={staticFile("audio/music-portrait-A.mp3")} volume={(f) => Math.min(1, f / 15) * Math.min(1, Math.max(0, (DIVE_FRAMES - f) / 30)) * 0.9} />
  </AbsoluteFill>
);
