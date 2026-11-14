import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { MusicProvider, SFX_RISER_PEAK, Sfx, useMusic } from "../../lib/music";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { EndFloor, ExplainFloor, FixFloor, Hook, PlanFloor, QuizFloor, StartFloor } from "./Floors";
import { Coin, Player } from "./parts";
import { FLOOR, FRAMES, G, H, IN_OUT, ORDER, OUT, PIXEL, SEG, SegK, W, ease, outline } from "./theme";

/**
 * «تعلّم أي مهارة أسرع بالذكاء الاصطناعي» — 57ث (1080×1920 · 30fps).
 * برج لعبة بكسل: الهوك تلفزيون قديم (تتفرج وتنسى ← GAME OVER)، ثم «اختر مدرّبك»،
 * والكاميرا تطلع طابق طابق على ضربات الموسيقى، وشخصية بكسل (كاب ونظارة) تنط معها:
 * الخطة ← الشرح بمستواك ← الاختبار اليومي (زعيم النسيان) ← التصحيح بتلميح ← LEVEL UP وبطاقة علي.
 */
export const LEVEL_UP_FRAMES = FRAMES;

const LEDGE = 1560; // سطح المنصة في كل طابق
const JUMP = 12; // نصف مدة الانتقال

/** موضع الكاميرا بالطوابق (0 = الأرض، 5 = القمة) */
const camAt = (f: number) => {
  let c = 0;
  for (let i = 1; i < ORDER.length; i++) {
    const cut = SEG[ORDER[i]][0];
    c += ease(f, cut - JUMP, JUMP * 2, IN_OUT);
  }
  return c;
};

/** سماء تغمق كل ما طلعنا، وغيوم بكسل بمنظور أبطأ */
const Sky: React.FC<{ cam: number; f: number }> = ({ cam, f }) => {
  const top = interpolateColors(cam, [0, 5], [G.sky, "#3A5FD6"]);
  const bot = interpolateColors(cam, [0, 5], [G.sky2, "#7FA8F5"]);
  const clouds = Array.from({ length: 16 }, (_, i) => ({ x: ((i * 397) % 1200) - 120, y: 300 + i * 620, s: 0.8 + (i % 3) * 0.3 }));
  const par = cam * H * 0.3;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top}, ${bot})` }}>
      {clouds.map((c, i) => {
        const yy = ((c.y + par) % 9920) - 600;
        return (
          <svg key={i} width={240 * c.s} height={110 * c.s} viewBox="0 0 24 11" shapeRendering="crispEdges" style={{ position: "absolute", left: c.x + Math.sin((f + i * 30) / 90) * 12, top: yy, opacity: 0.85 }}>
            <path d="M6 3h4v-2h6v2h3v2h3v2h2v4h-24v-4h2v-2h4z" fill="#fff" />
            <path d="M0 9h24v2h-24z" fill="#DCEBFF" />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

/** منصة طوب بعشب */
const Ledge: React.FC<{ ground?: boolean }> = ({ ground }) => (
  <div style={{ position: "absolute", left: 0, top: LEDGE, width: W, height: ground ? H - LEDGE : 140 }}>
    <div style={{ height: 30, background: G.grass, borderTop: `6px solid ${G.ink}`, boxShadow: `inset 0 -8px 0 ${G.grass2}` }} />
    <div
      style={{
        position: "absolute",
        top: 30,
        left: 0,
        right: 0,
        bottom: 0,
        background: G.dirt,
        backgroundImage: `linear-gradient(${G.dirt2} 4px, transparent 4px), linear-gradient(90deg, ${G.dirt2} 4px, transparent 4px)`,
        backgroundSize: "90px 44px, 90px 88px",
        borderBottom: ground ? undefined : `6px solid ${G.ink}`,
      }}
    />
  </div>
);

/** تلال بكسل خلف الأرض */
const Hills: React.FC = () => (
  <svg width={W} height={300} viewBox="0 0 108 30" shapeRendering="crispEdges" preserveAspectRatio="none" style={{ position: "absolute", left: 0, top: LEDGE - 290 }}>
    <path d="M0 30v-10h6v-4h4v-4h6v4h4v4h4v10z" fill="#3E9E4C" />
    <path d="M60 30v-14h6v-4h4v-4h8v4h4v4h6v14z" fill="#52B85E" />
    <path d="M86 30v-8h6v-4h8v4h8v8z" fill="#3E9E4C" />
  </svg>
);

const FLOORS: { k: Exclude<SegK, "hook">; C: React.FC<{ f: number }> }[] = [
  { k: "start", C: StartFloor },
  { k: "plan", C: PlanFloor },
  { k: "explain", C: ExplainFloor },
  { k: "quiz", C: QuizFloor },
  { k: "fix", C: FixFloor },
];

const World: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const cam = camAt(f);
  const v = Math.abs(cam - camAt(f - 1)) * H;
  const by = Math.min(28, v * 0.22);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Sky cam={cam} f={f} />
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="lvblur" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={`0 ${by.toFixed(1)}`} />
        </filter>
      </svg>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `translateY(${cam * H}px)`, filter: by > 0.6 ? "url(#lvblur)" : undefined }}>
        {([0, 1, 2, 3, 4, 5] as const).map((k) =>
          Math.abs(cam - k) < 1.05 ? (
            <div key={k} style={{ position: "absolute", left: 0, top: -k * H, width: W, height: H }}>
              {k === 0 ? <Hills /> : null}
              <Ledge ground={k === 0} />
              {k === 5 ? <EndFloor f={f} kick={kick} /> : FLOORS.filter((x) => FLOOR[x.k] === k).map(({ k: kk, C }) => <C key={kk} f={f} />)}
            </div>
          ) : null,
        )}
      </div>
    </AbsoluteFill>
  );
};

/** الشخصية: تنزل في البداية، وتنط مع كل طلعة كاميرا */
const Hero: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const s0 = SEG.start[0];
  if (f < s0) return null;
  const drop = ease(f - s0, 6, 22, OUT);
  let y = -200 + (LEDGE - 160 + 200) * drop;
  let squash = f - s0 >= 26 && f - s0 < 34 ? 1 - (f - s0 - 26) / 8 : 0;
  for (let i = 1; i < ORDER.length; i++) {
    const cut = SEG[ORDER[i]][0];
    if (f >= cut - JUMP - 5 && f < cut - JUMP) squash = Math.max(squash, 0.7); // تجهّز للنطة
    if (f >= cut - JUMP && f <= cut + JUMP) {
      const t = (f - (cut - JUMP)) / (JUMP * 2);
      y = LEDGE - 160 - Math.sin(Math.PI * t) * 300;
    }
    if (f > cut + JUMP && f < cut + JUMP + 8) squash = Math.max(squash, 1 - (f - cut - JUMP) / 8);
  }
  const step = Math.floor(f / 15) % 2;
  return (
    <div style={{ position: "absolute", left: 96, top: y, transform: `scale(${1 + kick * 0.03})`, transformOrigin: "50% 100%" }}>
      <Player px={10} step={step} squash={squash} />
    </div>
  );
};

/** شريط اللعبة: المستوى ونقاط الخبرة والعملات */
const HUD: React.FC<{ f: number }> = ({ f }) => {
  const s0 = SEG.start[0];
  if (f < s0) return null;
  const o = ease(f, s0 + 4, 12) * (1 - ease(f, SEG.end[0] + 20, 12));
  if (o <= 0) return null;
  const cam = camAt(f);
  const lv = Math.min(4, Math.round(cam));
  const xp = (["plan", "explain", "quiz", "fix", "end"] as SegK[]).reduce((a, k) => a + ease(f, SEG[k][0] - 30, 24) * 0.25, 0) - 0.25 * ease(f, SEG.plan[0] - 30, 24);
  const coins = Math.round(xp * 40);
  return (
    <div style={{ position: "absolute", top: 196, left: 60, right: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", direction: "ltr", opacity: o, font: `400 26px ${PIXEL}`, color: G.white, textShadow: outline(G.ink, 3, 4) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        XP
        <div style={{ width: 260, height: 26, border: `5px solid ${G.ink}`, background: "rgba(255,255,255,.5)", borderRadius: 4 }}>
          <div style={{ width: `${Math.max(0, Math.min(1, xp)) * 100}%`, height: "100%", background: G.coin }} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Coin f={f} size={34} />x{String(coins).padStart(2, "0")}
      </div>
      <div>{lv === 0 ? "START" : `LV ${lv}/4`}</div>
    </div>
  );
};

const Footer: React.FC<{ f: number }> = ({ f }) => {
  const o = ease(f, 6, 12) * (1 - ease(f, SEG.end[0] - 10, 10));
  if (o <= 0) return null;
  const dark = f < SEG.hook[1];
  return (
    <div style={{ position: "absolute", top: 1470, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ padding: "8px 24px", borderRadius: 999, background: dark ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.88)", border: dark ? undefined : `4px solid ${G.ink}` }}>
        <HandlesRow size={26} color={dark ? "rgba(255,255,255,.85)" : G.ink} />
      </div>
    </div>
  );
};

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { kick } = useMusic();
  const flash = f >= SEG.hook[1] ? 1 - ease(f, SEG.hook[1], 12) : 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: G.sky }}>
      {f >= SEG.hook[1] - 2 ? <World f={f} kick={kick} /> : null}
      <Hero f={f} kick={kick} />
      <HUD f={f} />
      <Hook f={f} />
      <Footer f={f} />
      {flash > 0 ? <AbsoluteFill style={{ background: `rgba(255,255,255,${flash})` }} /> : null}
    </AbsoluteFill>
  );
};

const s = (k: SegK) => SEG[k][0];

export const LevelUp: React.FC = () => (
  <MusicProvider src="videos/level-up/music.mp3" volume={0.7}>
    <Scene />
    <Sfx name="whoosh_soft" at={0} volume={0.16} />
    <Sfx name="glitch" at={52} volume={0.26} />
    <Sfx name="riser" at={s("start") - SFX_RISER_PEAK} volume={0.18} />
    <Sfx name="impact" at={s("start")} volume={0.32} />
    <Sfx name="whoosh_fast" at={s("start") + 6} volume={0.18} />
    {[34, 42, 50].map((t) => (
      <Sfx key={t} name="pop" at={s("start") + t} volume={0.14} />
    ))}
    {[60, 76, 92].map((t) => (
      <Sfx key={t} name="click" at={s("start") + t} volume={0.16} />
    ))}
    <Sfx name="success" at={s("start") + 108} volume={0.16} />
    {(["plan", "explain", "quiz", "fix", "end"] as SegK[]).map((k) => (
      <span key={k}>
        <Sfx name="whoosh_fast" at={s(k) - JUMP} volume={0.22} />
        <Sfx name="impact" at={s(k)} volume={0.18} />
      </span>
    ))}
    <Sfx name="typing" at={s("plan") + 30} volume={0.12} />
    {[112, 142, 170, 198].map((t) => (
      <Sfx key={t} name="pop" at={s("plan") + t} volume={0.14} />
    ))}
    {[20, 34, 44].map((t) => (
      <Sfx key={t} name="click" at={s("explain") + t} volume={0.16} />
    ))}
    <Sfx name="pop" at={s("explain") + 60} volume={0.14} />
    <Sfx name="pop" at={s("explain") + 100} volume={0.14} />
    <Sfx name="success" at={s("explain") + 160} volume={0.12} />
    <Sfx name="pop" at={s("quiz") + 18} volume={0.14} />
    <Sfx name="click" at={s("quiz") + 112} volume={0.14} />
    <Sfx name="click" at={s("quiz") + 128} volume={0.14} />
    <Sfx name="success" at={s("quiz") + 150} volume={0.2} />
    <Sfx name="impact" at={s("quiz") + 154} volume={0.14} />
    <Sfx name="pop" at={s("fix") + 20} volume={0.14} />
    <Sfx name="error" at={s("fix") + 40} volume={0.14} />
    <Sfx name="pop" at={s("fix") + 70} volume={0.14} />
    <Sfx name="click" at={s("fix") + 122} volume={0.16} />
    <Sfx name="success" at={s("fix") + 140} volume={0.18} />
    <Sfx name="error" at={s("fix") + 166} volume={0.08} />
    <Sfx name="pop" at={s("fix") + 180} volume={0.14} />
    <Sfx name="success" at={s("end") + 6} volume={0.22} />
    <Sfx name="pop" at={s("end") + 22} volume={0.16} />
  </MusicProvider>
);
