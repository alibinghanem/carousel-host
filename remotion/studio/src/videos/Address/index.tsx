import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MusicProvider, SFX_RISER_PEAK, Sfx, useMusic } from "../../lib/music";
import { CityMap } from "./CityMap";
import { End, Footer, Hook, Idea, LevelTitles, Pin, Result, Waybill } from "./Scenes";
import { A, FRAMES, IN_OUT, SEG, SegK, ZOOM, ease } from "./theme";

/**
 * «أكبر خطأ: تسأله كأنه قوقل» — 56.8ث (1080×1920 · 30fps).
 * الاستعارة: العنوان. سؤال البحث مثل «وصّل للرياض»، وطلب الشغل عنوان كامل لين الباب.
 * صورة الرياض الحقيقية ← خريطة المدينة، والكاميرا تقرّب مستوى مع كل معلومة تنضاف للطلب:
 * الدور (الحي) ← المهمة (الشارع) ← السياق (المبنى) ← الشكل (الباب) ← الطلب وصل، وعلي داخل الدبوس.
 */
export const ADDRESS_FRAMES = FRAMES;

const STEPS: { k: SegK; z: number }[] = [
  { k: "role", z: ZOOM.role },
  { k: "task", z: ZOOM.task },
  { k: "ctx", z: ZOOM.ctx },
  { k: "fmt", z: ZOOM.fmt },
  { k: "end", z: ZOOM.end },
];

/** تكبير لوغاريتمي بين المستويات: يحسّه المشاهد سرعة ثابتة */
const zoomAt = (f: number) => {
  let lz = Math.log(ZOOM.city);
  let prev = ZOOM.city;
  for (const st of STEPS) {
    const t = ease(f, SEG[st.k][0] - 14, 34, IN_OUT);
    lz = lz + (Math.log(st.z) - Math.log(prev)) * t;
    prev = st.z;
  }
  return Math.exp(lz);
};

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { kick } = useMusic();
  const s = zoomAt(f);
  const route = ease(f, SEG.idea[1] - 10, 50);
  const box = ease(f, SEG.fmt[0] + 100, 14);
  const door = ease(f, SEG.fmt[0] + 94, 10);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: A.land }}>
      {f >= SEG.hook[1] - 8 ? <CityMap s={s} route={route} routeO={1 - ease(f, SEG.ctx[0] - 14, 20)} door={door} box={box} /> : null}
      <Idea f={f} />
      <Pin f={f} kick={kick} />
      <Result f={f} />
      <Waybill f={f} />
      <LevelTitles f={f} />
      <Hook f={f} />
      <End f={f} kick={kick} />
      <Footer f={f} />
    </AbsoluteFill>
  );
};

const st = (k: SegK) => SEG[k][0];

export const Address: React.FC = () => (
  <MusicProvider src="videos/address/music.mp3" volume={0.7}>
    <Scene />
    <Sfx name="whoosh_soft" at={0} volume={0.16} />
    <Sfx name="pop" at={40} volume={0.16} />
    <Sfx name="riser" at={st("idea") - SFX_RISER_PEAK} volume={0.18} />
    <Sfx name="impact" at={st("idea")} volume={0.3} />
    <Sfx name="typing" at={st("idea") + 34} volume={0.12} />
    <Sfx name="pop" at={st("idea") + 96} volume={0.14} />
    <Sfx name="whoosh_soft" at={st("idea") + 210} volume={0.16} />
    {(["role", "task", "ctx", "fmt"] as SegK[]).map((k) => (
      <span key={k}>
        <Sfx name="whoosh_fast" at={st(k) - 14} volume={0.22} />
        <Sfx name="impact" at={st(k)} volume={0.18} />
        <Sfx name="pop" at={st(k) + 10} volume={0.14} />
        <Sfx name="typing" at={st(k) + 24} volume={0.1} />
      </span>
    ))}
    <Sfx name="error" at={st("role") + 40} volume={0.08} />
    <Sfx name="click" at={st("fmt") + 94} volume={0.16} />
    <Sfx name="success" at={st("fmt") + 120} volume={0.2} />
    <Sfx name="pop" at={st("fmt") + 150} volume={0.16} />
    <Sfx name="whoosh_soft" at={st("end") + 16} volume={0.18} />
    <Sfx name="success" at={st("end") + 30} volume={0.16} />
  </MusicProvider>
);
