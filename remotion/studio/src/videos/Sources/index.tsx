import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MusicProvider, SFX_RISER_PEAK, Sfx, useMusic } from "../../lib/music";
import { Board, camAt } from "./Board";
import { End, Footer, Shade, Titles } from "./Overlay";
import { FRAMES, P, SEG, SegK, VISIT } from "./theme";

/**
 * «Perplexity: البحث بالمصادر» — 57ث (1080×1920 · 30fps).
 * الاستعارة: لوحة تحقيق من الفلّين. ورقة لاصقة بلا مصدر في الهوك، بعدها ورقة الجواب بأرقامها [1][2][3]،
 * وخيوط حمراء من كل رقم لمصدره (موقع رسمي، جريدة بصورة حقيقية، منتدى)، ومكبّر يزور كل مصدر ويختمه،
 * وبطاقات Search وResearch، وبرومبت على بطاقة فهرسة، وفي الختام ملف القضية بصورة علي.
 */
export const SOURCES_FRAMES = FRAMES;

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { kick } = useMusic();
  const cam = camAt(f);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: P.cork }}>
      <Board f={f} cam={cam} kick={kick} />
      <Shade f={f} />
      <Titles f={f} />
      <End f={f} />
      <Footer f={f} />
    </AbsoluteFill>
  );
};

const st = (k: SegK) => SEG[k][0];

export const Sources: React.FC = () => (
  <MusicProvider src="videos/sources/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={0} volume={0.16} />
    <Sfx name="impact" at={44} volume={0.22} />
    <Sfx name="riser" at={st("ans") - SFX_RISER_PEAK} volume={0.14} />
    <Sfx name="impact" at={st("ans")} volume={0.3} />
    <Sfx name="typing" at={st("ans") + 12} volume={0.1} />
    {[60, 80, 100].map((t) => (
      <Sfx key={`m${t}`} name="pop" at={st("ans") + t} volume={0.15} />
    ))}
    <Sfx name="whoosh_soft" at={st("strings") - 8} volume={0.2} />
    <Sfx name="impact" at={st("strings")} volume={0.16} />
    {[0, 1, 2].map((i) => (
      <Sfx key={`s${i}`} name="whoosh_fast" at={st("strings") + 24 + i * 34} volume={0.12} />
    ))}
    {VISIT.map((v, i) => (
      <span key={v}>
        <Sfx name="whoosh_soft" at={v - 8} volume={0.18} />
        <Sfx name="impact" at={v + 70} volume={i === 0 ? 0.24 : 0.2} />
        {i === 0 ? <Sfx name="success" at={v + 74} volume={0.12} /> : null}
        {i === 2 ? <Sfx name="error" at={v + 74} volume={0.08} /> : null}
      </span>
    ))}
    {(["more", "prompt"] as SegK[]).map((k) => (
      <span key={k}>
        <Sfx name="whoosh_soft" at={st(k) - 8} volume={0.2} />
        <Sfx name="impact" at={st(k)} volume={0.16} />
      </span>
    ))}
    {[20, 60, 100].map((t) => (
      <Sfx key={`c${t}`} name="pop" at={st("more") + t} volume={0.14} />
    ))}
    <Sfx name="typing" at={st("prompt") + 24} volume={0.12} />
    <Sfx name="whoosh_soft" at={st("end") - 8} volume={0.2} />
    <Sfx name="pop" at={st("end") + 16} volume={0.16} />
    <Sfx name="impact" at={st("end") + 40} volume={0.24} />
    <Sfx name="success" at={st("end") + 44} volume={0.18} />
    <Sfx name="pop" at={st("end") + 60} volume={0.16} />
  </MusicProvider>
);
