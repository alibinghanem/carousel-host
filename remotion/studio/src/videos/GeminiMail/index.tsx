import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MusicProvider, SFX_RISER_PEAK, Sfx, useMusic } from "../../lib/music";
import { Backdrop, End, Footer, Labels, Shade, Titles } from "./Overlay";
import { ABSORB_AT, Scene3D } from "./Scene3D";
import { FRAMES, SEG, SegK } from "./theme";

/**
 * «Gemini في Gmail و Docs» — 58.5ث (1080×1920 · 30fps)، مكتب بريد ذكي 3D.
 * صورة ظروف حقيقية تنطلق منها ظروف 3D (عدّاد رسايل) ← شرارة تبلع الظروف وتطلع كرت «الزبدة»،
 * ثم جوال 3D: ملخّص السلسلة، اسأل بريدك، Help me write (والظرف يطير لما ترسل أنت)،
 * ثم لابتوب 3D ينفتح على Docs، والختام صورة علي على الجوال.
 */
export const GEMINIMAIL_FRAMES = FRAMES;

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { kick } = useMusic();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#0B0820" }}>
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

export const GeminiMail: React.FC = () => (
  <MusicProvider src="videos/geminimail/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={2} volume={0.16} />
    {[0, 4, 8, 12, 16].map((i) => (
      <Sfx key={`h${i}`} name="pop" at={6 + i * 3} volume={0.08} />
    ))}
    <Sfx name="riser" at={st("intro") - SFX_RISER_PEAK} volume={0.12} />
    <Sfx name="impact" at={st("intro")} volume={0.26} />
    {(["sum", "ask", "write", "docs", "end"] as SegK[]).map((k) => (
      <span key={k}>
        <Sfx name="whoosh_fast" at={st(k) - 12} volume={0.16} />
        {k !== "end" ? <Sfx name="impact" at={st(k)} volume={0.14} /> : null}
      </span>
    ))}
    {/* الشرارة تبلع الظروف وتطلع الكرت */}
    {[0, 4, 8, 12, 17].map((i) => (
      <Sfx key={`a${i}`} name="pop" at={ABSORB_AT(i)} volume={0.1} />
    ))}
    <Sfx name="success" at={st("intro") + 152} volume={0.18} />
    {/* الملخّص */}
    <Sfx name="click" at={st("sum") + 98} volume={0.22} />
    <Sfx name="success" at={st("sum") + 150} volume={0.16} />
    {/* اسأل بريدك */}
    <Sfx name="click" at={st("ask") + 98} volume={0.22} />
    <Sfx name="typing" at={st("ask") + 112} volume={0.14} />
    <Sfx name="success" at={st("ask") + 170} volume={0.16} />
    {/* Help me write */}
    <Sfx name="click" at={st("write") + 98} volume={0.22} />
    <Sfx name="typing" at={st("write") + 104} volume={0.14} />
    <Sfx name="click" at={st("write") + 140} volume={0.2} />
    <Sfx name="typing" at={st("write") + 152} volume={0.12} />
    <Sfx name="click" at={st("write") + 218} volume={0.2} />
    <Sfx name="whoosh_soft" at={st("write") + 246} volume={0.2} />
    {/* Docs */}
    <Sfx name="whoosh_soft" at={st("docs") + 20} volume={0.14} />
    <Sfx name="click" at={st("docs") + 98} volume={0.2} />
    <Sfx name="success" at={st("docs") + 116} volume={0.14} />
    <Sfx name="pop" at={st("docs") + 182} volume={0.14} />
    <Sfx name="success" at={st("end") + 40} volume={0.18} />
    <Sfx name="pop" at={st("end") + 76} volume={0.14} />
  </MusicProvider>
);
