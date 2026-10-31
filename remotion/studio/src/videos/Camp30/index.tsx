import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MusicProvider, SFX_RISER_PEAK, Sfx, useMusic } from "../../lib/music";
import { Backdrop, End, Footer, Labels, Shade, Titles } from "./Overlay";
import { PASS_AT, Scene3D } from "./Scene3D";
import { FRAMES, SEG, SegK } from "./theme";

/**
 * «تدريب موظفيك: خطة 30 يوم» — 58ث (1080×1920 · 30fps)، معسكر إعداد على ملعب تدريب 3D ليلي.
 * صورة حقيقية لتدريب من فوق ← نفس الزاوية في الملعب 3D، وكل أسبوع منطقة: سلالوم بين الأقماع (أساسيات)،
 * دائرة تمرير وكل تمريرة برومبت (تطبيق)، أسهم خطة ثابتة يمشي عليها اللاعبين لحالهم والكابتن يراجع (أتمتة)،
 * تسديدة في المرمى ولوحة النتائج تعرض الوقت الموفّر (مشروع حقيقي)، والختام صورة علي على شاشة الملعب.
 */
export const CAMP30_FRAMES = FRAMES;

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { kick } = useMusic();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#07101C" }}>
      <Backdrop f={f} kick={kick} />
      <Scene3D f={f} kick={kick} />
      <Shade />
      <Titles f={f} />
      <Labels f={f} />
      <End f={f} />
      <Footer f={f} />
    </AbsoluteFill>
  );
};

const st = (k: SegK) => SEG[k][0];

export const Camp30: React.FC = () => (
  <MusicProvider src="videos/camp30/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={2} volume={0.14} />
    <Sfx name="riser" at={st("plan") - SFX_RISER_PEAK} volume={0.14} />
    <Sfx name="impact" at={st("plan")} volume={0.3} />
    {[0, 1, 2, 3].map((i) => (
      <Sfx key={`z${i}`} name="pop" at={st("plan") + 52 + i * 16} volume={0.14} />
    ))}
    {(["w1", "w2", "w3", "w4", "tip", "end"] as SegK[]).map((k) => (
      <span key={k}>
        <Sfx name="whoosh_fast" at={st(k) - 12} volume={0.16} />
        {k !== "end" ? <Sfx name="impact" at={st(k)} volume={0.16} /> : null}
      </span>
    ))}
    {[60, 94, 128].map((t) => (
      <Sfx key={`c${t}`} name="pop" at={st("w1") + t} volume={0.12} />
    ))}
    {[0, 1, 2, 3, 4, 5].map((k) => (
      <Sfx key={`p${k}`} name="click" at={PASS_AT(k)} volume={0.2} />
    ))}
    {[0, 1, 2].map((i) => (
      <Sfx key={`t${i}`} name="pop" at={PASS_AT(i) + 18} volume={0.12} />
    ))}
    <Sfx name="success" at={PASS_AT(4)} volume={0.14} />
    <Sfx name="whoosh_soft" at={st("w3") + 34} volume={0.16} />
    <Sfx name="pop" at={st("w3") + 60} volume={0.12} />
    <Sfx name="whoosh_soft" at={st("w3") + 104} volume={0.16} />
    <Sfx name="success" at={st("w3") + 176} volume={0.16} />
    <Sfx name="impact" at={st("w4") + 60} volume={0.2} />
    <Sfx name="success" at={st("w4") + 76} volume={0.22} />
    <Sfx name="glitch" at={st("w4") + 84} volume={0.1} />
    <Sfx name="error" at={st("tip") + 8} volume={0.1} />
    <Sfx name="pop" at={st("tip") + 36} volume={0.14} />
    <Sfx name="success" at={st("end") + 40} volume={0.18} />
    <Sfx name="pop" at={st("end") + 76} volume={0.14} />
  </MusicProvider>
);
