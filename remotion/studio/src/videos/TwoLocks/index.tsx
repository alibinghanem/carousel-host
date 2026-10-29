import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MusicProvider, SFX_RISER_PEAK, Sfx, useMusic } from "../../lib/music";
import { Backdrop, End, Footer, Labels, Shade, Titles } from "./Overlay";
import { Scene3D } from "./Scene3D";
import { FRAMES, SEG, SegK } from "./theme";

/**
 * «التحقق بخطوتين: القفل الثاني» — 58.5ث (1080×1920 · 30fps)، خزنة 3D بقفلين.
 * صورة خزنة حقيقية ← نفس الخزنة 3D: مفتاح أحمر (كلمة المرور المسروقة) يفتح القفل الأول والباب ينفتح بإنذار،
 * ثم قفل ثاني أخضر يرفض المفتاح والرمز يطير من جوالك له، وخطوات واتساب و Google على شاشة جوال 3D،
 * والقاعدة الذهبية (الرمز لك أنت بس)، والختام صورة علي على شاشة الجوال.
 */
export const TWOLOCKS_FRAMES = FRAMES;

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { kick } = useMusic();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#050709" }}>
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

export const TwoLocks: React.FC = () => (
  <MusicProvider src="videos/twolocks/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={2} volume={0.14} />
    <Sfx name="riser" at={st("one") - SFX_RISER_PEAK} volume={0.14} />
    <Sfx name="impact" at={st("one")} volume={0.3} />
    {(["two", "wa", "google", "rule", "end"] as SegK[]).map((k) => (
      <span key={k}>
        <Sfx name="whoosh_fast" at={st(k) - 12} volume={0.16} />
        {k !== "end" ? <Sfx name="impact" at={st(k)} volume={0.16} /> : null}
      </span>
    ))}
    {/* المشهد الأول: المفتاح المسروق يفتح القفل والباب */}
    <Sfx name="whoosh_soft" at={st("one") + 30} volume={0.16} />
    <Sfx name="click" at={st("one") + 100} volume={0.24} />
    <Sfx name="error" at={st("one") + 128} volume={0.14} />
    <Sfx name="glitch" at={st("one") + 140} volume={0.12} />
    {/* القفل الثاني يرفض، والرمز يوصل من الجوال */}
    <Sfx name="pop" at={st("two") + 24} volume={0.14} />
    <Sfx name="click" at={st("two") + 112} volume={0.2} />
    <Sfx name="error" at={st("two") + 170} volume={0.16} />
    <Sfx name="whoosh_soft" at={st("two") + 200} volume={0.16} />
    <Sfx name="success" at={st("two") + 240} volume={0.18} />
    {/* خطوات واتساب و Google */}
    {[30, 78, 126, 174].map((t) => (
      <Sfx key={`w${t}`} name="pop" at={st("wa") + t} volume={0.12} />
    ))}
    <Sfx name="success" at={st("wa") + 196} volume={0.14} />
    {[30, 78, 126].map((t) => (
      <Sfx key={`g${t}`} name="pop" at={st("google") + t} volume={0.12} />
    ))}
    <Sfx name="click" at={st("google") + 150} volume={0.18} />
    <Sfx name="success" at={st("google") + 160} volume={0.14} />
    {/* القاعدة: المفتاح يرتد */}
    <Sfx name="error" at={st("rule") + 94} volume={0.14} />
    <Sfx name="success" at={st("end") + 40} volume={0.18} />
    <Sfx name="pop" at={st("end") + 76} volume={0.14} />
  </MusicProvider>
);
