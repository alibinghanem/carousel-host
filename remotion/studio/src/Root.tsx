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
    <Folder name="Tools">
      {/* npx remotion render MusicMeter --props='{"src":"videos/<name>/music.mp3"}' */}
      <Composition id="MusicMeter" component={MusicMeter} width={1080} height={1920} fps={30} durationInFrames={1800} defaultProps={{ src: "videos/agent-archery/music.mp3" }} />
    </Folder>
  </>
);
