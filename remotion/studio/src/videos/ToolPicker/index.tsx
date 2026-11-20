import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MusicProvider, SFX_RISER_PEAK, Sfx, useMusic } from "../../lib/music";
import { Backdrop, Content, End, Footer, Titles } from "./Scene";
import { ELIM, FRAMES, SEG, SegK, WIN_AT } from "./theme";

/**
 * «٤ بوابات» — 58.5ث (1080×1920 · 30fps): مصفاة اختيار الأداة بالترتيب (التكامل ← الأمان ← السعر ← منحنى التعلّم).
 * خمس بطاقات مرشّحة (أمثلة توضيحية) تتساقط عند كل بوابة، ثم تجربة صغيرة قبل الشراء، والختام صورة علي.
 */
export const TOOLPICKER_FRAMES = FRAMES;

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { kick } = useMusic();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#F6F2EA" }}>
      <Backdrop f={f} kick={kick} />
      <Titles f={f} />
      <Content f={f} />
      <End f={f} />
      <Footer f={f} />
    </AbsoluteFill>
  );
};
const st = (k: SegK) => SEG[k][0];

export const ToolPicker: React.FC = () => (
  <MusicProvider src="videos/toolpicker/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={2} volume={0.16} />
    <Sfx name="pop" at={78} volume={0.1} />
    <Sfx name="pop" at={100} volume={0.1} />
    <Sfx name="error" at={122} volume={0.12} />
    <Sfx name="error" at={142} volume={0.12} />
    <Sfx name="riser" at={st("g1") - SFX_RISER_PEAK} volume={0.12} />
    <Sfx name="impact" at={st("g1")} volume={0.26} />
    {(["g2", "g3", "g4", "verdict", "end"] as SegK[]).map((k) => (
      <span key={k}>
        <Sfx name="whoosh_fast" at={st(k) - 12} volume={0.16} />
        {k !== "end" ? <Sfx name="impact" at={st(k)} volume={0.16} /> : null}
      </span>
    ))}
    {/* إقصاء المرشحين */}
    {Object.entries(ELIM).map(([c, [g, at]]) => (
      <Sfx key={c} name="error" at={st(`g${g}` as SegK) + at} volume={0.14} />
    ))}
    {[0, 1, 2, 3].map((g) => (
      <Sfx key={`gp${g}`} name="pop" at={st(`g${g + 1}` as SegK) + 40} volume={0.1} />
    ))}
    <Sfx name="click" at={st("g1") + 60} volume={0.18} />
    <Sfx name="click" at={st("g2") + 96} volume={0.18} />
    <Sfx name="click" at={st("g2") + 130} volume={0.18} />
    <Sfx name="click" at={st("g2") + 164} volume={0.18} />
    <Sfx name="success" at={st("g4") + WIN_AT} volume={0.2} />
    {[0, 1, 2, 3].map((i) => (
      <Sfx key={`v${i}`} name="pop" at={st("verdict") + 24 + i * 12} volume={0.12} />
    ))}
    <Sfx name="success" at={st("end") + 40} volume={0.18} />
    <Sfx name="pop" at={st("end") + 80} volume={0.14} />
  </MusicProvider>
);
