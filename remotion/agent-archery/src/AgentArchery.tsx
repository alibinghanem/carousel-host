import { AbsoluteFill, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { Hook } from "./scenes/Hook";
import { Problem } from "./scenes/Problem";
import { Reason1 } from "./scenes/Reason1";
import { Reason2 } from "./scenes/Reason2";
import { Reason3 } from "./scenes/Reason3";
import { Summary } from "./scenes/Summary";
import { Outro } from "./scenes/Outro";
import { Hud } from "./components/Hud";

/**
 * «ليش وكيلك يطيش؟» — 40ث · 1080×1920 · 30fps
 * القطع على إيقاع موسيقى ElevenLabs: ضربة ث4 (السهم يطيش)، drop ث12 (السبب ١)،
 * ثم كل ~6.7ث سبب، وضربة الهدف ث34، والخاتمة ث36.
 * كل تسلسل = (المدة حتى القطع التالي) + 12 إطار انتقال.
 */
const T = 12;

export const AgentArchery: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#07090F" }}>
    <TransitionSeries>
      <TransitionSeries.Sequence name="Hook" durationInFrames={252}>
        <Hook />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="Problem" durationInFrames={132}>
        <Problem />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom" })} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="Reason1" durationInFrames={212}>
        <Reason1 />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="Reason2" durationInFrames={212}>
        <Reason2 />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={clockWipe({ width: 1080, height: 1920 })} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="Reason3" durationInFrames={212}>
        <Reason3 />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="Summary" durationInFrames={132}>
        <Summary />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence name="Outro" durationInFrames={120}>
        <Outro />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    <Hud hideFrom={1080} />
    <Audio src={staticFile("music.mp3")} volume={0.85} />
  </AbsoluteFill>
);
