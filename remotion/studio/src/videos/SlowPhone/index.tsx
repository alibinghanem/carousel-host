import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MusicProvider, SFX_RISER_PEAK, Sfx, useMusic } from "../../lib/music";
import { Backdrop, End, Footer, Labels, Shade, Titles } from "./Overlay";
import { Scene3D } from "./Scene3D";
import { FRAMES, SEG, SegK } from "./theme";

/**
 * «عدّاد الجوال» — 58.5ث (1080×1920 · 30fps): جوال يعلّق وعدّاد سرعة عالق بالأحمر، ثم أربع خطوات:
 * خزّان تخزين مكدّس يتفضّى، سهم إعادة تشغيل، سهم تحديث، وميزان حرارة وبطارية، والعدّاد يرجع للأخضر. الختام صورة علي على الجوال.
 */
export const SLOWPHONE_FRAMES = FRAMES;

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { kick } = useMusic();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#061214" }}>
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

export const SlowPhone: React.FC = () => (
  <MusicProvider src="videos/slowphone/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={2} volume={0.16} />
    <Sfx name="glitch" at={34} volume={0.12} />
    <Sfx name="error" at={40} volume={0.14} />
    <Sfx name="riser" at={st("storage") - SFX_RISER_PEAK} volume={0.12} />
    <Sfx name="impact" at={st("storage")} volume={0.24} />
    {(["restart", "update", "heat", "sum", "end"] as SegK[]).map((k) => (
      <span key={k}>
        <Sfx name="whoosh_fast" at={st(k) - 12} volume={0.16} />
        {k !== "end" ? <Sfx name="impact" at={st(k)} volume={0.14} /> : null}
      </span>
    ))}
    {[24, 76, 128].map((d) => (
      <span key={d}>
        <Sfx name="pop" at={st("storage") + d} volume={0.1} />
        <Sfx name="pop" at={st("restart") + d} volume={0.1} />
        <Sfx name="pop" at={st("update") + d} volume={0.1} />
        <Sfx name="pop" at={st("heat") + d} volume={0.1} />
      </span>
    ))}
    <Sfx name="whoosh_soft" at={st("storage") + 150} volume={0.14} />
    <Sfx name="success" at={st("storage") + 230} volume={0.14} />
    <Sfx name="click" at={st("restart") + 10} volume={0.16} />
    <Sfx name="click" at={st("restart") + 120} volume={0.14} />
    <Sfx name="success" at={st("restart") + 190} volume={0.14} />
    <Sfx name="success" at={st("update") + 170} volume={0.14} />
    <Sfx name="success" at={st("heat") + 220} volume={0.14} />
    {[20, 38, 56, 74].map((d) => (
      <Sfx key={d} name="pop" at={st("sum") + d} volume={0.1} />
    ))}
    <Sfx name="success" at={st("sum") + 60} volume={0.2} />
    <Sfx name="success" at={st("end") + 40} volume={0.18} />
    <Sfx name="pop" at={st("end") + 76} volume={0.14} />
  </MusicProvider>
);
