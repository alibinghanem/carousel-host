import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FilmLook, FlashBurst } from "../../lib/world3d";
import { MusicProvider, SFX_RISER_PEAK, Sfx } from "../../lib/music";
import { FRAMES, SEG } from "./theme";
import { AppWindow } from "./AppWindow";
import { End, Footer, Hook, SceneTexts, Studio } from "./Scenes";

/**
 * «Claude Cowork: وكّله شغلك» — فيلم منتج 57ث (1080×1920 · 30fps).
 * استوديو طيني دافئ ونافذة Claude عائمة (رسم توضيحي بالشعار الحقيقي) تبقى نفسها طول الفيلم:
 * الهوك (ملفات مبعثرة تنسحب لـ Cowork) ← وش هو ← كيف تبدأ ← يشتغل ← الجدولة ← الأمان ← الختام.
 * المصدر: support.claude.com/en/articles/13345190 · claude.com/product/cowork
 */
export const COWORK_FILM_FRAMES = FRAMES;

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Studio f={f} />
      <Hook f={f} />
      <SceneTexts f={f} />
      <AppWindow f={f} />
      <End f={f - SEG.end[0]} />
      <Footer f={f} />
      <FlashBurst f={f} at={SEG.what[0]} color="#FFE3CF" max={0.45} />
      <FilmLook f={f} vignette={0.35} />
    </AbsoluteFill>
  );
};

const s = (k: keyof typeof SEG) => SEG[k][0];

export const CoworkFilm: React.FC = () => (
  <MusicProvider src="videos/cowork-film/music.mp3" volume={0.7}>
    <Scene />
    <Sfx name="whoosh_soft" at={0} volume={0.18} />
    {[6, 12, 18, 24, 30, 36].map((t) => (
      <Sfx key={t} name="pop" at={t} volume={0.1} />
    ))}
    <Sfx name="riser" at={s("what") - SFX_RISER_PEAK} volume={0.18} />
    <Sfx name="whoosh_fast" at={92} volume={0.24} />
    <Sfx name="pop" at={100} volume={0.24} />
    {(["what", "how", "does", "sched", "safe", "end"] as const).map((k) => (
      <span key={k}>
        <Sfx name="impact" at={s(k)} volume={k === "what" ? 0.3 : 0.2} />
        {k !== "what" ? <Sfx name="whoosh_soft" at={s(k) - 10} volume={0.2} /> : null}
      </span>
    ))}
    {/* وش هو */}
    <Sfx name="click" at={160} volume={0.24} />
    {[240, 246, 252, 258].map((t) => (
      <Sfx key={t} name="pop" at={t} volume={0.12} />
    ))}
    {/* كيف */}
    <Sfx name="click" at={372} volume={0.2} />
    <Sfx name="typing" at={382} volume={0.14} />
    <Sfx name="pop" at={474} volume={0.18} />
    <Sfx name="click" at={578} volume={0.24} />
    {/* يشتغل */}
    {[54, 88, 122, 156].map((t) => (
      <Sfx key={t} name="success" at={s("does") + t} volume={0.1} />
    ))}
    {[56, 68, 80, 92, 104].map((t) => (
      <Sfx key={t} name="whoosh_soft" at={s("does") + t} volume={0.08} />
    ))}
    {[150, 160, 170].map((t) => (
      <Sfx key={t} name="pop" at={s("does") + t} volume={0.16} />
    ))}
    {/* الجدولة */}
    <Sfx name="typing" at={912} volume={0.12} />
    <Sfx name="click" at={956} volume={0.22} />
    {[0, 1, 2, 3].map((i) => (
      <Sfx key={i} name="pop" at={964 + 30 + i * 26} volume={0.12} />
    ))}
    {/* الأمان */}
    <Sfx name="click" at={1210} volume={0.22} />
    <Sfx name="error" at={1290} volume={0.12} />
    <Sfx name="click" at={1346} volume={0.24} />
    <Sfx name="success" at={1352} volume={0.2} />
    {/* الختام */}
    <Sfx name="success" at={s("end") + 30} volume={0.16} />
  </MusicProvider>
);
