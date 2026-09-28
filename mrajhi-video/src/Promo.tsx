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
// Portrait cutdown uses slower 24-frame (0.8 s) wipes; durations chosen so cuts land on 30-frame marks: 3.0 / 11.0 / 17.0 / 21.0 s.
export const PORTRAIT_TRANSITION = 24;
export const PORTRAIT_SCENES = { hook: 114, projects: 264, proof: 204, promise: 144, end: 255 } as const;
const total = (d: Record<string, number>, t: number) => Object.values(d).reduce((a, b) => a + b, 0) - (Object.values(d).length - 1) * t;
export const LANDSCAPE_FRAMES = total(LANDSCAPE_SCENES, TRANSITION);
export const PORTRAIT_FRAMES = total(PORTRAIT_SCENES, PORTRAIT_TRANSITION);

const wipe = (frames = TRANSITION) => (
  <TransitionSeries.Transition presentation={goldWipe()} timing={linearTiming({ durationInFrames: frames, easing: ease.inOutQuart })} />
);

const Music: React.FC<{ frames: number; src?: string }> = ({ frames, src = "audio/music-placeholder.wav" }) => (
  <Audio
    src={staticFile(src)}
    volume={(f) => Math.min(1, f / 15) * Math.min(1, Math.max(0, (frames - f) / 30)) * 0.9}
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
      {wipe(PORTRAIT_TRANSITION)}
      <TransitionSeries.Sequence name="03 Projects" durationInFrames={PORTRAIT_SCENES.projects}><Projects short /></TransitionSeries.Sequence>
      {wipe(PORTRAIT_TRANSITION)}
      <TransitionSeries.Sequence name="05 Proof" durationInFrames={PORTRAIT_SCENES.proof}><Proof short /></TransitionSeries.Sequence>
      {wipe(PORTRAIT_TRANSITION)}
      <TransitionSeries.Sequence name="06 Promise" durationInFrames={PORTRAIT_SCENES.promise}><PromiseScene short /></TransitionSeries.Sequence>
      {wipe(PORTRAIT_TRANSITION)}
      <TransitionSeries.Sequence name="07 End" durationInFrames={PORTRAIT_SCENES.end}><EndCard /></TransitionSeries.Sequence>
    </TransitionSeries>
    <GrainOverlay />
    <Music frames={PORTRAIT_FRAMES} src="audio/music-portrait-A.mp3" />
  </AbsoluteFill>
);
