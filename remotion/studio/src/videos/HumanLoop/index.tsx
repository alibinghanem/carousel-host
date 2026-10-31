import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { Hud } from "../../lib/Hud";
import { MusicProvider } from "../../lib/music";
import { H, hazard } from "./parts";
import { Hook } from "./scenes/Hook";
import { Concept } from "./scenes/Concept";
import { GateMoney, GateContract, GateExternal } from "./scenes/Gates";
import { Test } from "./scenes/Test";
import { Outro } from "./scenes/Outro";

/**
 * «الإنسان في الحلقة» — 60ث · 1080×1920 · 30fps · استعارة «خط الإنتاج والختم».
 * الموسيقى (ElevenLabs، معاد ترتيبها على النبض 120BPM): drop عند 120 (كشف «مزوّرة»)،
 * ذروة 1500، خاتمة هادئة من 1560. كل القطع على النبض؛ الانتقال «سير» من اليمين.
 * بداية المشاهد: 0 · 210 · 510 · 780 · 1050 · 1320 · 1560 — التسلسل = حتى القطع + T.
 */
export const HUMAN_LOOP_FRAMES = 1800;
const T = 12;
const conveyor = () => slide({ direction: "from-right" });
const t = linearTiming({ durationInFrames: T });

export const HumanLoop: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: H.paper }}>
    <MusicProvider src="videos/human-loop/music.mp3" volume={0.72}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Hook" durationInFrames={210 + T}>
          <Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={conveyor()} timing={t} />
        <TransitionSeries.Sequence name="Concept" durationInFrames={300 + T}>
          <Concept />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={conveyor()} timing={t} />
        <TransitionSeries.Sequence name="GateMoney" durationInFrames={270 + T}>
          <GateMoney />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={conveyor()} timing={t} />
        <TransitionSeries.Sequence name="GateContract" durationInFrames={270 + T}>
          <GateContract />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={conveyor()} timing={t} />
        <TransitionSeries.Sequence name="GateExternal" durationInFrames={270 + T}>
          <GateExternal />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-top" })} timing={t} />
        <TransitionSeries.Sequence name="Test" durationInFrames={240 + T}>
          <Test />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={t} />
        <TransitionSeries.Sequence name="Outro" durationInFrames={240}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Hud
        hideFrom={1560}
        kicker="أتمتة · الإنسان في الحلقة"
        bar={[H.y, H.r]}
        icon={<span style={{ width: 30, height: 30, borderRadius: 8, background: hazard(6), border: "2px solid #fff" }} />}
      />
    </MusicProvider>
  </AbsoluteFill>
);
