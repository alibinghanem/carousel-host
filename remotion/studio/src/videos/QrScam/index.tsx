import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MusicProvider, SFX_RISER_PEAK, Sfx, useMusic } from "../../lib/music";
import { Backdrop, End, Footer, Labels, Shade, Titles } from "./Overlay";
import { Scene3D } from "./Scene3D";
import { FRAMES, SEG, SegK } from "./theme";

/**
 * «ملصق فوق ملصق» — 58.5ث (1080×1920 · 30fps): لوح QR رسمي على عمود مواقف، ملصق مزيّف يطير ويغطّيه (تحذير FTC ديسمبر 2023)،
 * جوال يصوّره فتظهر صفحة دفع مزيّفة وخطّاف أحمر يلتقط بطاقتك، ثم ثلاث فحوصات (الملصق، الرابط، التطبيق الرسمي)،
 * وخطوات لو وقعت، والختام صورة علي على الجوال.
 */
export const QRSCAM_FRAMES = FRAMES;

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { kick } = useMusic();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#0C0B07" }}>
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

export const QrScam: React.FC = () => (
  <MusicProvider src="videos/qrscam/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={2} volume={0.16} />
    <Sfx name="whoosh_fast" at={st("hook") + 70} volume={0.14} />
    <Sfx name="riser" at={st("real") - SFX_RISER_PEAK} volume={0.12} />
    <Sfx name="impact" at={st("real")} volume={0.24} />
    {(["sticker", "scan", "check", "act", "end"] as SegK[]).map((k) => (
      <span key={k}>
        <Sfx name="whoosh_fast" at={st(k) - 12} volume={0.16} />
        {k !== "end" ? <Sfx name="impact" at={st(k)} volume={0.14} /> : null}
      </span>
    ))}
    <Sfx name="pop" at={st("real") + 40} volume={0.14} />
    <Sfx name="whoosh_fast" at={st("sticker") + 44} volume={0.16} />
    <Sfx name="impact" at={st("sticker") + 96} volume={0.2} />
    <Sfx name="glitch" at={st("sticker") + 100} volume={0.12} />
    <Sfx name="error" at={st("sticker") + 106} volume={0.14} />
    <Sfx name="pop" at={st("sticker") + 130} volume={0.12} />
    <Sfx name="pop" at={st("sticker") + 190} volume={0.12} />
    <Sfx name="whoosh_soft" at={st("scan") + 20} volume={0.14} />
    <Sfx name="typing" at={st("scan") + 30} volume={0.1} />
    <Sfx name="click" at={st("scan") + 110} volume={0.18} />
    <Sfx name="glitch" at={st("scan") + 114} volume={0.14} />
    <Sfx name="whoosh_fast" at={st("scan") + 150} volume={0.14} />
    <Sfx name="error" at={st("scan") + 200} volume={0.16} />
    <Sfx name="whoosh_soft" at={st("check") + 20} volume={0.14} />
    <Sfx name="click" at={st("check") + 70} volume={0.16} />
    <Sfx name="success" at={st("check") + 120} volume={0.16} />
    {[24, 74, 124].map((d) => (
      <Sfx key={d} name="pop" at={st("check") + d} volume={0.1} />
    ))}
    {[24, 74, 124].map((d) => (
      <Sfx key={`a${d}`} name="pop" at={st("act") + d} volume={0.1} />
    ))}
    <Sfx name="success" at={st("act") + 30} volume={0.16} />
    <Sfx name="success" at={st("end") + 40} volume={0.18} />
    <Sfx name="pop" at={st("end") + 76} volume={0.14} />
  </MusicProvider>
);
