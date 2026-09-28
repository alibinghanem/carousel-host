import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";
import { ease, TRANSITION } from "./theme";
import { goldWipe } from "./goldWipe";
import { GrainOverlay } from "./components/GrainOverlay";
import { Hook } from "./scenes/Hook";
import { Aspiration } from "./scenes/Aspiration";
import { Projects } from "./scenes/Projects";
import { Services } from "./scenes/Services";
import { Proof } from "./scenes/Proof";
import { PromiseScene } from "./scenes/Promise";
import { EndCard } from "./scenes/EndCard";

// Scene durations (frames). start_n+1 = start_n + dur_n − TRANSITION → cuts land on 30-frame (2-beat) marks @120 BPM.
export const LANDSCAPE_SCENES = { hook: 105, aspiration: 195, projects: 435, services: 255, proof: 285, promise: 255, end: 225 } as const;
export const PORTRAIT_SCENES = { hook: 105, projects: 255, proof: 210, promise: 135, end: 225 } as const;
const total = (d: Record<string, number>) => Object.values(d).reduce((a, b) => a + b, 0) - (Object.values(d).length - 1) * TRANSITION;
export const LANDSCAPE_FRAMES = total(LANDSCAPE_SCENES);
export const PORTRAIT_FRAMES = total(PORTRAIT_SCENES);

const wipe = () => (
  <TransitionSeries.Transition presentation={goldWipe()} timing={linearTiming({ durationInFrames: TRANSITION, easing: ease.inOutQuart })} />
);

const Music: React.FC<{ frames: number }> = ({ frames }) => (
  <Audio
    src={staticFile("audio/music-placeholder.wav")}
    volume={(f) => Math.min(1, f / 30) * Math.min(1, Math.max(0, (frames - f) / 45)) * 0.8}
  />
);

export const PromoLandscape: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#070F26" }}>
    <TransitionSeries>
      <TransitionSeries.Sequence name="01 Hook" durationInFrames={LANDSCAPE_SCENES.hook}><Hook /></TransitionSeries.Sequence>
      {wipe()}
      <TransitionSeries.Sequence name="02 Aspiration" durationInFrames={LANDSCAPE_SCENES.aspiration}><Aspiration /></TransitionSeries.Sequence>
      {wipe()}
      <TransitionSeries.Sequence name="03 Projects" durationInFrames={LANDSCAPE_SCENES.projects}><Projects /></TransitionSeries.Sequence>
      {wipe()}
      <TransitionSeries.Sequence name="04 Services" durationInFrames={LANDSCAPE_SCENES.services}><Services /></TransitionSeries.Sequence>
      {wipe()}
      <TransitionSeries.Sequence name="05 Proof" durationInFrames={LANDSCAPE_SCENES.proof}><Proof /></TransitionSeries.Sequence>
      {wipe()}
      <TransitionSeries.Sequence name="06 Promise" durationInFrames={LANDSCAPE_SCENES.promise}><PromiseScene /></TransitionSeries.Sequence>
      {wipe()}
      <TransitionSeries.Sequence name="07 End" durationInFrames={LANDSCAPE_SCENES.end}><EndCard /></TransitionSeries.Sequence>
    </TransitionSeries>
    <GrainOverlay />
    <Music frames={LANDSCAPE_FRAMES} />
  </AbsoluteFill>
);

export const PromoPortrait: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#070F26" }}>
    <TransitionSeries>
      <TransitionSeries.Sequence name="01 Hook" durationInFrames={PORTRAIT_SCENES.hook}><Hook /></TransitionSeries.Sequence>
      {wipe()}
      <TransitionSeries.Sequence name="03 Projects" durationInFrames={PORTRAIT_SCENES.projects}><Projects short /></TransitionSeries.Sequence>
      {wipe()}
      <TransitionSeries.Sequence name="05 Proof" durationInFrames={PORTRAIT_SCENES.proof}><Proof short /></TransitionSeries.Sequence>
      {wipe()}
      <TransitionSeries.Sequence name="06 Promise" durationInFrames={PORTRAIT_SCENES.promise}><PromiseScene short /></TransitionSeries.Sequence>
      {wipe()}
      <TransitionSeries.Sequence name="07 End" durationInFrames={PORTRAIT_SCENES.end}><EndCard /></TransitionSeries.Sequence>
    </TransitionSeries>
    <GrainOverlay />
    <Music frames={PORTRAIT_FRAMES} />
  </AbsoluteFill>
);
