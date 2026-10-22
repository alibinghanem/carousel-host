import { AbsoluteFill } from "remotion";
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
import { Hud } from "../../lib/Hud";
import { MusicProvider } from "../../lib/music";

/**
 * «ليش وكيلك يطيش؟» — 60ث · 1080×1920 · 30fps (نسخة أبطأ للقراءة)
 * القطع على إيقاع موسيقى ElevenLabs (ممدودة لـ60ث بقص على النبض): ضربة ث4 (السهم يطيش)،
 * drop ث16 (السبب ١)، السبب ٢ ث26، السبب ٣ ث36، الخلاصة ث44 وإصابة الهدف ث48، الختام ث52.
 * كل تسلسل = (المدة حتى القطع التالي) + 12 إطار انتقال.
 */
const T = 12;

export const AgentArchery: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#07090F" }}>
    <MusicProvider src="videos/agent-archery/music.mp3" volume={0.85}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Hook" durationInFrames={252}>
          <Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence name="Problem" durationInFrames={252}>
          <Problem />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence name="Reason1" durationInFrames={312}>
          <Reason1 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence name="Reason2" durationInFrames={312}>
          <Reason2 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={clockWipe({ width: 1080, height: 1920 })}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence name="Reason3" durationInFrames={252}>
          <Reason3 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence name="Summary" durationInFrames={252}>
          <Summary />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence name="Outro" durationInFrames={240}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Hud hideFrom={1560} kicker="أتمتة · الوكلاء" />
    </MusicProvider>
  </AbsoluteFill>
);
