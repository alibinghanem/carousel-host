import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MusicProvider, SFX_RISER_PEAK, Sfx, useMusic } from "../../lib/music";
import { End, Footer, Shade, Titles } from "./Overlay";
import { World } from "./Stations";
import { FRAMES, ORDER, P, SEG, SegK } from "./theme";

/**
 * «ChatGPT: تحليل Excel» — 57ث (1080×1920 · 30fps).
 * الاستعارة: غرفة تحميض تحت ضوء أحمر. صورة محل حقيقية في الحوض (الهوك)، بعدها ملف المبيعات يطلع لجهاز
 * التكبير (ChatGPT) ويتحول لجدول تفاعلي، والبرومبت ينكتب والرسم يتحمّض، و4 رسوم تفاعلية على حبل التجفيف،
 * وورقة تلميحات بالملخص، و4 بطاقات حدود، وفي الختام صورة علي تتحمّض.
 */
export const DARKROOM_FRAMES = FRAMES;

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { kick } = useMusic();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: P.wall }}>
      <World f={f} kick={kick} />
      <Shade />
      <Titles f={f} />
      <End f={f} />
      <Footer f={f} />
    </AbsoluteFill>
  );
};

const st = (k: SegK) => SEG[k][0];

export const Darkroom: React.FC = () => (
  <MusicProvider src="videos/darkroom/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={0} volume={0.16} />
    <Sfx name="riser" at={st("upload") - SFX_RISER_PEAK} volume={0.14} />
    {ORDER.slice(1).map((k) => (
      <span key={k}>
        <Sfx name="whoosh_soft" at={st(k) - 8} volume={0.2} />
        {k !== "end" ? <Sfx name="impact" at={st(k)} volume={k === "upload" ? 0.3 : 0.16} /> : null}
      </span>
    ))}
    <Sfx name="whoosh_fast" at={st("upload") + 8} volume={0.14} />
    <Sfx name="click" at={st("upload") + 34} volume={0.18} />
    <Sfx name="pop" at={st("upload") + 46} volume={0.14} />
    <Sfx name="typing" at={st("prompt") + 10} volume={0.12} />
    <Sfx name="typing" at={st("prompt") + 64} volume={0.1} />
    <Sfx name="success" at={st("prompt") + 200} volume={0.14} />
    {[20, 38, 56, 74].map((t) => (
      <Sfx key={`c${t}`} name="pop" at={st("charts") + t} volume={0.14} />
    ))}
    <Sfx name="click" at={st("charts") + 110} volume={0.18} />
    <Sfx name="pop" at={st("charts") + 160} volume={0.14} />
    {[24, 58, 92].map((t) => (
      <Sfx key={`s${t}`} name="whoosh_soft" at={st("sum") + t} volume={0.12} />
    ))}
    {[16, 38, 60, 82].map((t) => (
      <Sfx key={`t${t}`} name="pop" at={st("tips") + t} volume={0.14} />
    ))}
    <Sfx name="success" at={st("end") + 60} volume={0.2} />
    <Sfx name="pop" at={st("end") + 80} volume={0.16} />
  </MusicProvider>
);
