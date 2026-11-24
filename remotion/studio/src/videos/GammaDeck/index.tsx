import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MusicProvider, SFX_RISER_PEAK, Sfx, useMusic } from "../../lib/music";
import { Backdrop, End, Footer, Labels, Titles } from "./Scenes";
import { FRAMES, SEG, SegK } from "./theme";

/**
 * «من ورقة لاصقة إلى عرض كامل» — 58.5ث (1080×1920 · 30fps، 2D): Gamma · العروض التقديمية.
 * هوك: ملاحظة لاصقة «عندي فكرة وما عندي عرض» ← مروحة شرائح، ثم ثلاث طرق (Generate · Paste in text · Import) والتصدير.
 */
export const GAMMADECK_FRAMES = FRAMES;

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { kick } = useMusic();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#FFE15A" }}>
      <Backdrop f={f} kick={kick} />
      <Titles f={f} />
      <Labels f={f} />
      <End f={f} />
      <Footer f={f} />
    </AbsoluteFill>
  );
};
const st = (k: SegK) => SEG[k][0];

export const GammaDeck: React.FC = () => (
  <MusicProvider src="videos/gammadeck/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={2} volume={0.16} />
    <Sfx name="pop" at={14} volume={0.14} />
    <Sfx name="typing" at={20} volume={0.1} />
    <Sfx name="whoosh_fast" at={100} volume={0.16} />
    <Sfx name="success" at={150} volume={0.14} />
    <Sfx name="riser" at={st("gen") - SFX_RISER_PEAK} volume={0.12} />
    <Sfx name="impact" at={st("gen")} volume={0.24} />
    {(["paste", "imp", "exp", "sum", "end"] as SegK[]).map((k) => (
      <span key={k}>
        <Sfx name="whoosh_fast" at={st(k) - 12} volume={0.16} />
        {k !== "end" ? <Sfx name="impact" at={st(k)} volume={0.14} /> : null}
      </span>
    ))}
    {[18, 100, 124].map((d) => <Sfx key={d} name="pop" at={st("gen") + d} volume={0.1} />)}
    <Sfx name="typing" at={st("gen") + 20} volume={0.1} />
    <Sfx name="click" at={st("gen") + 150} volume={0.18} />
    <Sfx name="success" at={st("gen") + 176} volume={0.14} />
    {[14, 90].map((d) => <Sfx key={d} name="pop" at={st("paste") + d} volume={0.1} />)}
    <Sfx name="click" at={st("paste") + 160} volume={0.16} />
    <Sfx name="success" at={st("paste") + 176} volume={0.14} />
    {[8, 22, 36].map((d) => <Sfx key={d} name="pop" at={st("imp") + d} volume={0.1} />)}
    <Sfx name="click" at={st("imp") + 120} volume={0.18} />
    <Sfx name="whoosh_soft" at={st("imp") + 124} volume={0.12} />
    <Sfx name="success" at={st("imp") + 160} volume={0.14} />
    {[52, 66, 80, 94].map((d) => <Sfx key={d} name="pop" at={st("exp") + d} volume={0.1} />)}
    <Sfx name="success" at={st("exp") + 150} volume={0.14} />
    {[8, 24, 40].map((d) => <Sfx key={d} name="pop" at={st("sum") + d} volume={0.1} />)}
    <Sfx name="success" at={st("sum") + 78} volume={0.2} />
    <Sfx name="success" at={st("end") + 40} volume={0.18} />
    <Sfx name="pop" at={st("end") + 80} volume={0.14} />
  </MusicProvider>
);
