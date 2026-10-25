import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MusicProvider, SFX_RISER_PEAK, Sfx, useMusic } from "../../lib/music";
import { Backdrop, End, Footer, Labels, Shade, Titles } from "./Overlay";
import { Scene3D } from "./Scene3D";
import { FRAMES, SEG, SegK } from "./theme";

/**
 * «4 عادات تخرّب بطارية جوالك» — 57ث (1080×1920 · 30fps)، أول فيديو تقني بعناصر 3D حقيقية (@remotion/three).
 * جوال 3D بإطار معدني وزجاج وشاشة حيّة، يطلع من صورة سيارة حقيقية بالحر، وبعدها: أشعة X تبين خلية البطارية
 * وميزان حرارة يرتفع، كفر ينسحب وقت الشحن، بطارية تفضى للصفر ودورة 75%+25%، حد 80% ودرع، خلاصة بأربعة عناصر،
 * وفي الختام صورة علي على شاشة الجوال.
 */
export const BATTERY3D_FRAMES = FRAMES;

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { kick } = useMusic();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#050505" }}>
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

export const Battery3D: React.FC = () => (
  <MusicProvider src="videos/battery3d/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={0} volume={0.16} />
    <Sfx name="riser" at={st("heat") - SFX_RISER_PEAK} volume={0.16} />
    <Sfx name="impact" at={st("heat")} volume={0.32} />
    {(["case", "zero", "limit", "sum", "end"] as SegK[]).map((k) => (
      <span key={k}>
        <Sfx name="whoosh_fast" at={st(k) - 10} volume={0.18} />
        {k !== "end" ? <Sfx name="impact" at={st(k)} volume={0.18} /> : null}
      </span>
    ))}
    <Sfx name="glitch" at={st("heat") + 150} volume={0.12} />
    <Sfx name="pop" at={st("heat") + 190} volume={0.14} />
    <Sfx name="whoosh_soft" at={st("case") + 140} volume={0.18} />
    <Sfx name="success" at={st("case") + 170} volume={0.14} />
    <Sfx name="error" at={st("zero") + 70} volume={0.1} />
    <Sfx name="pop" at={st("zero") + 140} volume={0.14} />
    <Sfx name="pop" at={st("zero") + 150} volume={0.14} />
    <Sfx name="success" at={st("zero") + 200} volume={0.16} />
    <Sfx name="click" at={st("limit") + 50} volume={0.18} />
    <Sfx name="pop" at={st("limit") + 90} volume={0.14} />
    <Sfx name="pop" at={st("limit") + 102} volume={0.14} />
    {[24, 38, 52, 66].map((t) => (
      <Sfx key={t} name="pop" at={st("sum") + t} volume={0.14} />
    ))}
    <Sfx name="success" at={st("end") + 40} volume={0.2} />
    <Sfx name="pop" at={st("end") + 70} volume={0.16} />
  </MusicProvider>
);
