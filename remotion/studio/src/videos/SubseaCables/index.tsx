import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MusicProvider, SFX_RISER_PEAK, Sfx, useMusic } from "../../lib/music";
import { Backdrop, End, Footer, Labels, Shade, Titles } from "./Overlay";
import { HIT_AT, Scene3D } from "./Scene3D";
import { FRAMES, SEG, SegK } from "./theme";

/**
 * «الإنترنت تحت البحر» — 58.5ث (1080×1920 · 30fps): كرة أرضية 3D بكابلات مضيئة (خريطة NASA Blue Marble)،
 * رحلة رسالة من جدة لأوروبا، مقطع كابل (غلاف، فولاذ، نحاس، ألياف)، مرساة تقطعه،
 * وقطوعات البحر الأحمر قرب جدة (6 سبتمبر 2025) وتحويل الحركة، والختام صورة علي على الجوال.
 */
export const SUBSEA_FRAMES = FRAMES;

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { kick } = useMusic();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#02101A" }}>
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

export const SubseaCables: React.FC = () => (
  <MusicProvider src="videos/subsea/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={2} volume={0.16} />
    <Sfx name="riser" at={st("intro") - SFX_RISER_PEAK} volume={0.12} />
    <Sfx name="impact" at={st("intro")} volume={0.26} />
    {[0, 14, 28, 42, 56, 70, 84, 98, 112].map((d) => (
      <Sfx key={`c${d}`} name="pop" at={st("intro") + 12 + d + 20} volume={0.09} />
    ))}
    {(["trip", "cable", "hit", "reroute", "end"] as SegK[]).map((k) => (
      <span key={k}>
        <Sfx name="whoosh_fast" at={st(k) - 12} volume={0.16} />
        {k !== "end" ? <Sfx name="impact" at={st(k)} volume={0.14} /> : null}
      </span>
    ))}
    <Sfx name="click" at={st("trip") + 40} volume={0.2} />
    <Sfx name="success" at={st("trip") + 235} volume={0.16} />
    <Sfx name="whoosh_soft" at={st("cable") + 8} volume={0.16} />
    <Sfx name="pop" at={st("cable") + 64} volume={0.12} />
    <Sfx name="pop" at={st("cable") + 144} volume={0.12} />
    <Sfx name="whoosh_soft" at={st("hit") + 30} volume={0.14} />
    <Sfx name="impact" at={st("hit") + HIT_AT} volume={0.3} />
    <Sfx name="glitch" at={st("hit") + HIT_AT + 4} volume={0.14} />
    <Sfx name="error" at={st("hit") + HIT_AT + 12} volume={0.14} />
    <Sfx name="error" at={st("reroute") + 40} volume={0.16} />
    <Sfx name="whoosh_soft" at={st("reroute") + 120} volume={0.14} />
    <Sfx name="success" at={st("reroute") + 235} volume={0.14} />
    <Sfx name="success" at={st("end") + 40} volume={0.18} />
    <Sfx name="pop" at={st("end") + 76} volume={0.14} />
  </MusicProvider>
);
