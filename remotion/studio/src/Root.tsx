import "./index.css";
import { Composition, Folder, continueRender, delayRender } from "remotion";
import { AgentArchery } from "./videos/AgentArchery";
import { Hook } from "./videos/AgentArchery/scenes/Hook";
import { Problem } from "./videos/AgentArchery/scenes/Problem";
import { Reason1 } from "./videos/AgentArchery/scenes/Reason1";
import { Reason2 } from "./videos/AgentArchery/scenes/Reason2";
import { Reason3 } from "./videos/AgentArchery/scenes/Reason3";
import { Summary } from "./videos/AgentArchery/scenes/Summary";
import { Outro } from "./videos/AgentArchery/scenes/Outro";
import { fontsReady } from "./lib/theme";
import { MusicMeter } from "./tools/MusicMeter";
import { AliAd, ALI_AD_FRAMES } from "./videos/AliAd";
import { ClaudeTrio, CLAUDE_TRIO_FRAMES } from "./videos/ClaudeTrio";
import { AgentTeam, AGENT_TEAM_FRAMES } from "./videos/AgentTeam";
import { Souq, SOUQ_FRAMES } from "./videos/Souq";
import { AgentGauges, AGENT_GAUGES_FRAMES } from "./videos/AgentGauges";
import { HumanLoop, HUMAN_LOOP_FRAMES } from "./videos/HumanLoop";
import { Hook as HLHook } from "./videos/HumanLoop/scenes/Hook";
import { Concept as HLConcept } from "./videos/HumanLoop/scenes/Concept";
import { GateMoney, GateContract, GateExternal } from "./videos/HumanLoop/scenes/Gates";
import { Test as HLTest } from "./videos/HumanLoop/scenes/Test";
import { Outro as HLOutro } from "./videos/HumanLoop/scenes/Outro";

const h = delayRender("fonts");
fontsReady.then(() => continueRender(h));

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="AgentArchery" component={AgentArchery} width={1080} height={1920} fps={30} durationInFrames={1800} />
    <Folder name="AgentArchery-Scenes">
      <Composition id="Hook" component={Hook} width={1080} height={1920} fps={30} durationInFrames={252} />
      <Composition id="Problem" component={Problem} width={1080} height={1920} fps={30} durationInFrames={252} />
      <Composition id="Reason1" component={Reason1} width={1080} height={1920} fps={30} durationInFrames={312} />
      <Composition id="Reason2" component={Reason2} width={1080} height={1920} fps={30} durationInFrames={312} />
      <Composition id="Reason3" component={Reason3} width={1080} height={1920} fps={30} durationInFrames={252} />
      <Composition id="Summary" component={Summary} width={1080} height={1920} fps={30} durationInFrames={252} />
      <Composition id="Outro" component={Outro} width={1080} height={1920} fps={30} durationInFrames={240} />
    </Folder>
    <Composition id="Souq" component={Souq} width={1080} height={1920} fps={30} durationInFrames={SOUQ_FRAMES} />
    <Composition id="AgentGauges" component={AgentGauges} width={1080} height={1920} fps={30} durationInFrames={AGENT_GAUGES_FRAMES} />
    <Composition id="AgentTeam" component={AgentTeam} width={1080} height={1920} fps={30} durationInFrames={AGENT_TEAM_FRAMES} />
    <Composition id="ClaudeTrio" component={ClaudeTrio} width={1080} height={1920} fps={30} durationInFrames={CLAUDE_TRIO_FRAMES} />
    <Composition id="AliAd" component={AliAd} width={1080} height={1920} fps={30} durationInFrames={ALI_AD_FRAMES} />
    <Composition id="HumanLoop" component={HumanLoop} width={1080} height={1920} fps={30} durationInFrames={HUMAN_LOOP_FRAMES} />
    <Folder name="HumanLoop-Scenes">
      <Composition id="HL-Hook" component={HLHook} width={1080} height={1920} fps={30} durationInFrames={222} />
      <Composition id="HL-Concept" component={HLConcept} width={1080} height={1920} fps={30} durationInFrames={312} />
      <Composition id="HL-Money" component={GateMoney} width={1080} height={1920} fps={30} durationInFrames={282} />
      <Composition id="HL-Contract" component={GateContract} width={1080} height={1920} fps={30} durationInFrames={282} />
      <Composition id="HL-External" component={GateExternal} width={1080} height={1920} fps={30} durationInFrames={282} />
      <Composition id="HL-Test" component={HLTest} width={1080} height={1920} fps={30} durationInFrames={252} />
      <Composition id="HL-Outro" component={HLOutro} width={1080} height={1920} fps={30} durationInFrames={240} />
    </Folder>
    <Folder name="Tools">
      {/* npx remotion render MusicMeter --props='{"src":"videos/<name>/music.mp3"}' */}
      <Composition id="MusicMeter" component={MusicMeter} width={1080} height={1920} fps={30} durationInFrames={1800} defaultProps={{ src: "videos/agent-archery/music.mp3" }} />
    </Folder>
  </>
);
