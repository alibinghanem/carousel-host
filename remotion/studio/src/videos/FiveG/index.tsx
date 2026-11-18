import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MusicProvider, SFX_RISER_PEAK, Sfx, useMusic } from "../../lib/music";
import { Backdrop, End, Footer, Labels, Shade, Titles } from "./Overlay";
import { Scene3D } from "./Scene3D";
import { FRAMES, SEG, SegK } from "./theme";

/**
 * «ثلاثة أبراج بثلاث موجات» — 58.5ث (1080×1920 · 30fps): جوال بـ 5G يحمّل، أرقام 4G مقابل 5G على الورق (أهداف ITU)،
 * ثم برج اتصالات 3D وموجات تتغيّر بالطول والمدى (منخفض · متوسط · مليمتري) وجوال بإشارة مختلفة، والختام صورة علي على الجوال.
 */
export const FIVEG_FRAMES = FRAMES;

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { kick } = useMusic();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#0C0713" }}>
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

export const FiveG: React.FC = () => (
  <MusicProvider src="videos/fiveg/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={2} volume={0.16} />
    <Sfx name="glitch" at={40} volume={0.12} />
    <Sfx name="riser" at={st("speed") - SFX_RISER_PEAK} volume={0.12} />
    <Sfx name="impact" at={st("speed")} volume={0.24} />
    {(["low", "mid", "high", "sum", "end"] as SegK[]).map((k) => (
      <span key={k}>
        <Sfx name="whoosh_fast" at={st(k) - 12} volume={0.16} />
        {k !== "end" ? <Sfx name="impact" at={st(k)} volume={0.14} /> : null}
      </span>
    ))}
    {[70, 90, 130].map((d) => <Sfx key={d} name="pop" at={st("speed") + d} volume={0.1} />)}
    <Sfx name="success" at={st("speed") + 120} volume={0.12} />
    {(["low", "mid", "high"] as SegK[]).map((k) => (
      <span key={`s${k}`}>
        <Sfx name="whoosh_soft" at={st(k) + 20} volume={0.12} />
        {[24, 74, 124].map((d) => <Sfx key={d} name="pop" at={st(k) + d} volume={0.1} />)}
      </span>
    ))}
    <Sfx name="error" at={st("high") + 120} volume={0.12} />
    <Sfx name="success" at={st("mid") + 150} volume={0.14} />
    {[30, 46, 62].map((d) => <Sfx key={d} name="pop" at={st("sum") + d} volume={0.1} />)}
    <Sfx name="success" at={st("sum") + 70} volume={0.2} />
    <Sfx name="success" at={st("end") + 40} volume={0.18} />
    <Sfx name="pop" at={st("end") + 76} volume={0.14} />
  </MusicProvider>
);
