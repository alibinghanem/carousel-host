import React from "react";
import { Composition, Folder } from "remotion";
import { FPS } from "./theme";
import { LANDSCAPE_FRAMES, LANDSCAPE_SCENES, PORTRAIT_FRAMES, PORTRAIT_SCENES, PromoLandscape, PromoPortrait } from "./Promo";
import { Hook } from "./scenes/Hook";
import { Aspiration } from "./scenes/Aspiration";
import { Projects } from "./scenes/Projects";
import { Services } from "./scenes/Services";
import { Proof } from "./scenes/Proof";
import { PromiseScene } from "./scenes/Promise";
import { EndCard } from "./scenes/EndCard";

const L = { width: 1920, height: 1080, fps: FPS } as const;
const V = { width: 1080, height: 1920, fps: FPS } as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Promo-16x9" component={PromoLandscape} durationInFrames={LANDSCAPE_FRAMES} {...L} />
    <Composition id="Promo-9x16" component={PromoPortrait} durationInFrames={PORTRAIT_FRAMES} {...V} />
    <Folder name="Scenes-16x9">
      <Composition id="L-01-Hook" component={Hook} durationInFrames={LANDSCAPE_SCENES.hook} {...L} />
      <Composition id="L-02-Aspiration" component={Aspiration} durationInFrames={LANDSCAPE_SCENES.aspiration} {...L} />
      <Composition id="L-03-Projects" component={Projects} durationInFrames={LANDSCAPE_SCENES.projects} {...L} />
      <Composition id="L-04-Services" component={Services} durationInFrames={LANDSCAPE_SCENES.services} {...L} />
      <Composition id="L-05-Proof" component={Proof} durationInFrames={LANDSCAPE_SCENES.proof} {...L} />
      <Composition id="L-06-Promise" component={PromiseScene} durationInFrames={LANDSCAPE_SCENES.promise} {...L} />
      <Composition id="L-07-End" component={EndCard} durationInFrames={LANDSCAPE_SCENES.end} {...L} />
    </Folder>
    <Folder name="Scenes-9x16">
      <Composition id="V-01-Hook" component={Hook} durationInFrames={PORTRAIT_SCENES.hook} {...V} />
      <Composition id="V-03-Projects" component={Projects} durationInFrames={PORTRAIT_SCENES.projects} {...V} defaultProps={{ short: true }} />
      <Composition id="V-05-Proof" component={Proof} durationInFrames={PORTRAIT_SCENES.proof} {...V} defaultProps={{ short: true }} />
      <Composition id="V-06-Promise" component={PromiseScene} durationInFrames={PORTRAIT_SCENES.promise} {...V} defaultProps={{ short: true }} />
      <Composition id="V-07-End" component={EndCard} durationInFrames={PORTRAIT_SCENES.end} {...V} />
    </Folder>
  </>
);
