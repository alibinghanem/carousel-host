import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MusicProvider, SFX_RISER_PEAK, Sfx, useMusic } from "../../lib/music";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { End, Hook, Know, Offer, Plan, Ship, StepTitle, Write } from "./Steps";
import { Timer } from "./Timer";
import { FRAMES, IN_OUT, K, SEG, STEPS, SegK, ease } from "./theme";

/**
 * «حملة تسويق كاملة في ساعة: مشروعك الصغير» — 56.8ث (1080×1920 · 30fps).
 * الاستعارة: مؤقت مطبخ على بلاط نعناعي. الهوك كيك حقيقي، وبعدها المؤقت يطلع فوق،
 * وكل خطوة تصرف دقايقها على المؤقت بلونها (10 · 10 · 15 · 20 · 5)، وتحتها «طبق» الخطوة:
 * زبائن ← عرض وجمل ← جدول أسبوعين ← منشورات ← مراجعة. وفي الختام صورة علي داخل المؤقت.
 */
export const CAMPAIGN_HOUR_FRAMES = FRAMES;

/** بلاط مترو بفواصل (نمط SVG) */
const Tiles: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <pattern id="tiles" width={160} height={160} patternUnits="userSpaceOnUse">
        <rect width={160} height={160} fill={K.tile} />
        <path d="M0 0H160M0 80H160M0 160H160M0 0V80M160 0V80M80 80V160" stroke={K.grout} strokeWidth={4} />
        <rect x={6} y={6} width={60} height={14} rx={7} fill="#fff" opacity={0.25} />
        <rect x={86} y={86} width={60} height={14} rx={7} fill="#fff" opacity={0.25} />
      </pattern>
      <radialGradient id="glow" cx="50%" cy="35%" r="70%">
        <stop offset="0%" stopColor="#fff" stopOpacity={0.55} />
        <stop offset="100%" stopColor="#fff" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#tiles)" />
    <rect width={1080} height={1920} fill="url(#glow)" />
    {/* الكاونتر الخشبي */}
    <rect y={1560} width={1080} height={360} fill={K.wood} />
    <rect y={1560} width={1080} height={22} fill="#B07A44" />
    {[1640, 1730, 1830].map((y) => (
      <path key={y} d={`M0 ${y} C 300 ${y - 10}, 700 ${y + 12}, 1080 ${y}`} stroke="#B07A44" strokeWidth={3} fill="none" opacity={0.6} />
    ))}
  </svg>
);

/** مكان المؤقت: في الهوك تحت وصغير، بعدها فوق، وفي الختام أكبر */
const timerPos = (f: number) => {
  const a = { x: 540, y: 1150, s: 0.62 };
  const b = { x: 540, y: 610, s: 0.86 };
  const c = { x: 540, y: 690, s: 1.12 };
  const t1 = ease(f, SEG.hook[1] - 6, 24, IN_OUT);
  const t2 = ease(f, SEG.end[0] - 6, 26, IN_OUT);
  const lerp = (p: number, q: number, t: number) => p + (q - p) * t;
  const ab = { x: lerp(a.x, b.x, t1), y: lerp(a.y, b.y, t1), s: lerp(a.s, b.s, t1) };
  return { x: lerp(ab.x, c.x, t2), y: lerp(ab.y, c.y, t2), s: lerp(ab.s, c.s, t2) };
};

const Footer: React.FC<{ f: number }> = ({ f }) => {
  const o = ease(f, 6, 12) * (1 - ease(f, SEG.end[0], 10));
  if (o <= 0) return null;
  const dark = f < SEG.hook[1];
  return (
    <div style={{ position: "absolute", top: 1478, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ padding: "8px 24px", borderRadius: 999, background: dark ? "rgba(255,255,255,.16)" : K.ink }}>
        <HandlesRow size={26} color="#fff" />
      </div>
    </div>
  );
};

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { kick } = useMusic();
  const tp = timerPos(f);
  const timerIn = ease(f, 26, 18, (x) => 1 - Math.pow(1 - x, 3));
  const faceP = ease(f, SEG.end[0] + 20, 14);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Tiles />
      <Know f={f} />
      <Offer f={f} />
      <Plan f={f} />
      <Write f={f} />
      <Ship f={f} />
      {STEPS.map((k, i) => (
        <StepTitle key={k} f={f} k={k} n={i + 1} />
      ))}
      <Hook f={f} />
      <div style={{ position: "absolute", left: tp.x - 200, top: tp.y - 210, width: 400, height: 420, transform: `scale(${tp.s * timerIn})`, opacity: timerIn > 0 ? 1 : 0 }}>
        <Timer f={f} kick={kick} faceP={faceP} />
      </div>
      <End f={f} kick={kick} />
      <Footer f={f} />
    </AbsoluteFill>
  );
};

const st = (k: SegK) => SEG[k][0];

export const CampaignHour: React.FC = () => (
  <MusicProvider src="videos/campaign-hour/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={0} volume={0.16} />
    <Sfx name="pop" at={28} volume={0.16} />
    {[46, 61, 76, 91, 106].map((t) => (
      <Sfx key={t} name="click" at={t} volume={0.12} />
    ))}
    <Sfx name="riser" at={st("know") - SFX_RISER_PEAK} volume={0.16} />
    <Sfx name="impact" at={st("know")} volume={0.3} />
    {(["know", "offer", "plan", "write", "ship"] as SegK[]).map((k) => (
      <span key={k}>
        {k !== "know" ? <Sfx name="whoosh_fast" at={st(k) - 8} volume={0.2} /> : null}
        {k !== "know" ? <Sfx name="impact" at={st(k)} volume={0.16} /> : null}
        <Sfx name="pop" at={st(k) + 10} volume={0.14} />
        {k !== "ship" ? <Sfx name="typing" at={st(k) + 14} volume={0.1} /> : null}
      </span>
    ))}
    {[80, 94, 108].map((t) => (
      <Sfx key={`k${t}`} name="pop" at={st("know") + t} volume={0.14} />
    ))}
    <Sfx name="success" at={st("offer") + 80} volume={0.14} />
    {[120, 136, 152].map((t) => (
      <Sfx key={`o${t}`} name="pop" at={st("offer") + t} volume={0.12} />
    ))}
    <Sfx name="whoosh_soft" at={st("plan") + 86} volume={0.14} />
    <Sfx name="pop" at={st("write") + 80} volume={0.16} />
    <Sfx name="typing" at={st("write") + 96} volume={0.1} />
    <Sfx name="whoosh_soft" at={st("write") + 150} volume={0.14} />
    {[24, 40, 56, 72].map((t) => (
      <Sfx key={`s${t}`} name="click" at={st("ship") + t} volume={0.16} />
    ))}
    <Sfx name="error" at={st("ship") + 100} volume={0.08} />
    <Sfx name="success" at={st("ship") + 116} volume={0.18} />
    <Sfx name="success" at={st("end") + 4} volume={0.22} />
    <Sfx name="pop" at={st("end") + 24} volume={0.16} />
  </MusicProvider>
);
