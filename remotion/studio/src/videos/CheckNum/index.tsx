import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MusicProvider, SFX_RISER_PEAK, Sfx, useMusic } from "../../lib/music";
import { Backdrop, End, Footer, Labels, Titles } from "./Scenes";
import { FRAMES, SEG, SegK } from "./theme";

/**
 * «الإيصال والحاسبة» — 58.5ث (1080×1920 · 30fps، 2D): إيصال يطبع رقماً مريباً «غير مراجع»،
 * ثم ثلاث أسئلة تدقّق بها أي رقم (المصدر · طريقة الحساب · عيّنة صغيرة)، وأسباب الخلل الشائعة، وختم «مراجع».
 */
export const CHECKNUM_FRAMES = FRAMES;

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { kick } = useMusic();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#0B0D07" }}>
      <Backdrop f={f} kick={kick} />
      <Titles f={f} />
      <Labels f={f} />
      <End f={f} />
      <Footer f={f} />
    </AbsoluteFill>
  );
};
const st = (k: SegK) => SEG[k][0];

export const CheckNum: React.FC = () => (
  <MusicProvider src="videos/checknum/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={2} volume={0.16} />
    <Sfx name="typing" at={10} volume={0.12} />
    <Sfx name="pop" at={110} volume={0.14} />
    <Sfx name="error" at={140} volume={0.14} />
    <Sfx name="riser" at={st("src") - SFX_RISER_PEAK} volume={0.12} />
    <Sfx name="impact" at={st("src")} volume={0.24} />
    {(["how", "smp", "bad", "sum", "end"] as SegK[]).map((k) => (
      <span key={k}>
        <Sfx name="whoosh_fast" at={st(k) - 12} volume={0.16} />
        {k !== "end" ? <Sfx name="impact" at={st(k)} volume={0.14} /> : null}
      </span>
    ))}
    {[14, 70, 96].map((d) => <Sfx key={d} name="pop" at={st("src") + d} volume={0.1} />)}
    <Sfx name="typing" at={st("src") + 140} volume={0.1} />
    {[12, 40, 70].map((d) => <Sfx key={d} name="pop" at={st("how") + d} volume={0.1} />)}
    <Sfx name="typing" at={st("how") + 150} volume={0.1} />
    {[30, 46, 62, 78, 94].map((d) => <Sfx key={d} name="click" at={st("smp") + d} volume={0.14} />)}
    <Sfx name="success" at={st("smp") + 150} volume={0.16} />
    {[8, 34, 60, 86].map((d) => <Sfx key={d} name="pop" at={st("bad") + d} volume={0.1} />)}
    <Sfx name="error" at={st("bad") + 140} volume={0.12} />
    {[8, 24, 40].map((d) => <Sfx key={d} name="pop" at={st("sum") + d} volume={0.1} />)}
    <Sfx name="success" at={st("sum") + 66} volume={0.2} />
    <Sfx name="success" at={st("end") + 40} volume={0.18} />
    <Sfx name="pop" at={st("end") + 80} volume={0.14} />
  </MusicProvider>
);
