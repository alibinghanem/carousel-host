import "./index.css";
import { Composition, Folder, continueRender, delayRender } from "remotion";
import { AgentArchery } from "./AgentArchery";
import { Hook } from "./scenes/Hook";
import { Problem } from "./scenes/Problem";
import { Reason1 } from "./scenes/Reason1";
import { Reason2 } from "./scenes/Reason2";
import { Reason3 } from "./scenes/Reason3";
import { Summary } from "./scenes/Summary";
import { Outro } from "./scenes/Outro";
import { fontsReady } from "./theme";

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
  </>
);
