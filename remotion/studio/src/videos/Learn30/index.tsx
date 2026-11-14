import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MusicProvider, SFX_RISER_PEAK, Sfx, useMusic } from "../../lib/music";
import { Days, End, Footer, Hook, Sun, SumMap, Tag, Titles } from "./Overlay";
import { FLOWERS, FRUITS, LEAVES, ROOT_TIPS, World, camAt } from "./Tree";
import { FRAMES, P, SEG, SegK } from "./theme";

/**
 * «تعلّم الذكاء الاصطناعي من الصفر في 30 يوم» — 57ث (1080×1920 · 30fps).
 * الاستعارة: بذرة تصير شجرة في مقطع عرضي (تربة وسما). الهوك صورة نبتة حقيقية تنكمش وتصير البذرة،
 * وكل أسبوع جزء من النبتة: جذور (الأساسيات) · ساق وأوراق (خانات البرومبت) · أغصان بأزهار الشعارات (الأدوات)
 * · ثمار (أفكار مشروع). الكاميرا تطلع مع النبتة، وفي الخلاصة تبتعد، وفي الختام الشمس تصير صورة علي.
 */
export const LEARN30_FRAMES = FRAMES;

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { kick } = useMusic();
  const cam = camAt(f);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: P.sky0 }}>
      <World f={f} cam={cam} kick={kick} />
      <Sun f={f} kick={kick} />
      <Tag f={f} />
      <Titles f={f} />
      <Days f={f} kick={kick} />
      <SumMap f={f} cam={cam} />
      <End f={f} />
      <Footer f={f} />
      <Hook f={f} />
    </AbsoluteFill>
  );
};

const st = (k: SegK) => SEG[k][0];

export const Learn30: React.FC = () => (
  <MusicProvider src="videos/learn-30/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={0} volume={0.16} />
    <Sfx name="pop" at={26} volume={0.18} />
    <Sfx name="whoosh_fast" at={98} volume={0.18} />
    <Sfx name="riser" at={st("w1") - SFX_RISER_PEAK} volume={0.14} />
    <Sfx name="impact" at={st("w1")} volume={0.3} />
    {ROOT_TIPS.map((t) => (
      <Sfx key={`r${t.at}`} name="pop" at={st("w1") + t.at} volume={0.14} />
    ))}
    {(["w2", "w3", "w4", "sum", "end"] as SegK[]).map((k) => (
      <span key={k}>
        <Sfx name="whoosh_soft" at={st(k) - 8} volume={0.2} />
        {k !== "end" ? <Sfx name="impact" at={st(k)} volume={0.16} /> : null}
      </span>
    ))}
    {LEAVES.map((l) => (
      <Sfx key={`l${l.at}`} name="pop" at={st("w2") + l.at} volume={0.14} />
    ))}
    {FLOWERS.map((b) => (
      <Sfx key={`b${b.at}`} name="pop" at={st("w3") + b.at} volume={0.14} />
    ))}
    {FRUITS.map((b) => (
      <Sfx key={`f${b.at}`} name="pop" at={st("w4") + b.at} volume={0.14} />
    ))}
    <Sfx name="success" at={st("w4") + 112} volume={0.14} />
    {[40, 50, 60, 70].map((t) => (
      <Sfx key={`m${t}`} name="click" at={st("sum") + t} volume={0.14} />
    ))}
    <Sfx name="success" at={st("end") + 10} volume={0.22} />
    <Sfx name="pop" at={st("end") + 66} volume={0.16} />
  </MusicProvider>
);
