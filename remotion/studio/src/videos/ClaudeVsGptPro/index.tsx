import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FilmLook } from "../../lib/world3d";
import { MusicProvider, SFX_RISER_PEAK, Sfx } from "../../lib/music";
import { FRAMES, HIT, SEG } from "./tl";
import { Footer, World } from "./World";
import { Hook } from "./Hook";
import { R1Images } from "./R1Images";
import { R2Research } from "./R2Research";
import { R3Files } from "./R3Files";
import { R4Names } from "./R4Names";
import { MapFinal } from "./MapFinal";
import { End } from "./End";

/**
 * «Claude ولا ChatGPT؟ — أفضل في وش؟» نسخة 2: الشاشة المقسومة (57ث · 1080×1920 · 30fps).
 * يمين عالم Claude (عاجي + طين)، يسار عالم ChatGPT (أسود + أخضر). الخط الفاصل هو البطل.
 * الجولات: الصور ← البحث ← رفع الملفات ← الأسماء تختلف ← خريطة القرار ← الختام.
 * المصادر في lesson.md (support.claude.com · claude.com/product/cowork · help.openai.com عبر البحث).
 */
export const CLAUDE_VS_GPT_PRO_FRAMES = FRAMES;

type K = keyof typeof SEG;
const ROUND_KEYS: K[] = ["r1", "r2", "r3", "r4"];

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const lf = (k: K) => f - SEG[k][0];
  const dur = (k: K) => SEG[k][1] - SEG[k][0];
  const ri = ROUND_KEYS.findIndex((k) => f >= SEG[k][0] && f < SEG[k][1]);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#141413" }}>
      <World f={f} round={ri + 1} roundAt={ri >= 0 ? SEG[ROUND_KEYS[ri]][0] : 0} />
      <Hook f={f} />
      <R1Images f={lf("r1")} dur={dur("r1")} />
      <R2Research f={lf("r2")} dur={dur("r2")} />
      <R3Files f={lf("r3")} dur={dur("r3")} />
      <R4Names f={lf("r4")} dur={dur("r4")} />
      <MapFinal f={lf("map")} dur={dur("map")} />
      <End f={lf("end")} />
      <Footer f={f} />
      <FilmLook f={f} vignette={0.16} />
    </AbsoluteFill>
  );
};

const s = (k: K) => SEG[k][0];

export const ClaudeVsGptPro: React.FC = () => (
  <MusicProvider src="videos/claude-vs-gpt-pro/music.mp3" volume={0.7}>
    <Scene />
    {/* الهوك */}
    <Sfx name="whoosh_soft" at={0} volume={0.2} />
    <Sfx name="pop" at={6} volume={0.18} />
    <Sfx name="pop" at={12} volume={0.18} />
    <Sfx name="error" at={44} volume={0.16} />
    <Sfx name="whoosh_fast" at={60} volume={0.18} />
    <Sfx name="riser" at={HIT - SFX_RISER_PEAK} volume={0.2} />
    {/* كل قطع: سحبة قبل الضربة + ضربة خفيفة عليها */}
    {(["r1", "r2", "r3", "r4", "map", "end"] as K[]).map((k) => (
      <span key={k}>
        <Sfx name="whoosh_fast" at={s(k) - 10} volume={0.22} />
        <Sfx name="impact" at={s(k)} volume={k === "r1" ? 0.32 : 0.22} />
      </span>
    ))}
    {/* الصور */}
    <Sfx name="typing" at={s("r1") + 18} volume={0.1} />
    {[58, 63, 68, 73, 78].map((t) => (
      <Sfx key={t} name="pop" at={s("r1") + t} volume={0.1} />
    ))}
    <Sfx name="click" at={s("r1") + 118} volume={0.2} />
    <Sfx name="pop" at={s("r1") + 120} volume={0.18} />
    <Sfx name="success" at={s("r1") + 104} volume={0.12} />
    <Sfx name="typing" at={s("r1") + 140} volume={0.1} />
    <Sfx name="whoosh_soft" at={s("r1") + 158} volume={0.16} />
    <Sfx name="pop" at={s("r1") + 150} volume={0.16} />
    {/* البحث */}
    <Sfx name="click" at={s("r2") + 44} volume={0.16} />
    <Sfx name="success" at={s("r2") + 68} volume={0.18} />
    <Sfx name="click" at={s("r2") + 52} volume={0.14} />
    <Sfx name="pop" at={s("r2") + 148} volume={0.16} />
    {/* الملفات */}
    {[30, 38, 46, 54, 62].map((t) => (
      <Sfx key={t} name="pop" at={s("r3") + t} volume={0.1} />
    ))}
    <Sfx name="click" at={s("r3") + 92} volume={0.14} />
    <Sfx name="pop" at={s("r3") + 146} volume={0.16} />
    {/* الأسماء */}
    {[0, 1, 2, 3].map((i) => (
      <span key={i}>
        <Sfx name="whoosh_soft" at={s("r4") + 30 + i * 26} volume={0.14} />
        <Sfx name="click" at={s("r4") + 46 + i * 26} volume={0.18} />
      </span>
    ))}
    <Sfx name="pop" at={s("r4") + 172} volume={0.16} />
    {/* الخريطة */}
    {[0, 1, 2, 3, 4].map((i) => (
      <Sfx key={i} name="whoosh_soft" at={s("map") + 36 + i * 22} volume={0.12} />
    ))}
    <Sfx name="success" at={s("map") + 160} volume={0.18} />
    {/* الختام */}
    <Sfx name="success" at={s("end") + 30} volume={0.16} />
  </MusicProvider>
);
