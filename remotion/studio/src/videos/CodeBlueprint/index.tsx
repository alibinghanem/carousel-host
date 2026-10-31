import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { FilmLook } from "../../lib/world3d";
import { MusicProvider, SFX_RISER_PEAK, Sfx, useMusic } from "../../lib/music";
import { Reveal } from "../ClaudeVsGptPro/kit";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { B, BODY, CELL, DISPLAY, FRAMES, IN_OUT, OUT, SEG, SegK, ease } from "./theme";
import { ControlCell, HookCell, HowCell, VerifyCell, WhatCell, WhereCell } from "./Cells";
import { Draw, En } from "./parts";

/**
 * «Claude Code: ابنِ أداتك بدون ما تكون مبرمج» — 57ث (1080×1920 · 30fps).
 * ورقة مخطط هندسي واحدة كبيرة (2×3 خلايا)، والكاميرا تنزلق بينها على ضربات الموسيقى:
 * منديل الفكرة ← وش يسوي ← اشرح ← يجرّب ويصلح ← وين تلقاه ← أنت المتحكم ← الكاميرا ترجع لورا وتكشف الورقة كاملة ← علي.
 * المصدر: code.claude.com/docs/en/overview · /quickstart
 */
export const CODE_BLUEPRINT_FRAMES = FRAMES;

const W = 1080;
const H = 1920;
const ORDER: Exclude<SegK, "end">[] = ["hook", "what", "how", "verify", "where", "control"];

type Cam = { x: number; y: number; s: number };
const camOf = (k: Exclude<SegK, "end">): Cam => ({ x: CELL[k][0] * W, y: CELL[k][1] * H, s: 1 });
const FULL: Cam = { x: -540, y: 0, s: 1 / 3 };

const camAt = (f: number): Cam => {
  let cam = camOf("hook");
  for (let i = 1; i < ORDER.length; i++) {
    const c = SEG[ORDER[i]][0];
    const t = ease(f, c - 10, 20, IN_OUT);
    const a = camOf(ORDER[i - 1]);
    const b = camOf(ORDER[i]);
    if (f >= c - 10) cam = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, s: 1 };
  }
  const e = ease(f, SEG.end[0] - 6, 46, IN_OUT);
  if (e > 0) {
    const a = camOf("control");
    // تكبير/تصغير حول مركز الشاشة: نحسب الإطار المرئي ثم ننتقل له
    cam = { x: a.x + (FULL.x - a.x) * e, y: a.y + (FULL.y - a.y) * e, s: 1 + (FULL.s - 1) * e };
  }
  return cam;
};

const Sheet: React.FC<{ f: number }> = ({ f }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: W * 2,
      height: H * 3,
      background: `radial-gradient(60% 40% at 30% 20%, #13489A 0%, transparent 70%), radial-gradient(60% 40% at 70% 70%, #11428C 0%, transparent 70%), ${B.sheet}`,
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `linear-gradient(rgba(232,242,255,.13) 2px, transparent 2px), linear-gradient(90deg, rgba(232,242,255,.13) 2px, transparent 2px), linear-gradient(rgba(232,242,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(232,242,255,.05) 1px, transparent 1px)`,
        backgroundSize: "120px 120px, 120px 120px, 24px 24px, 24px 24px",
      }}
    />
    {/* حدود الخلايا كحدود ورقة هندسية */}
    {[0, 1].map((cx) =>
      [0, 1, 2].map((cy) => (
        <div key={`${cx}${cy}`} style={{ position: "absolute", left: cx * W + 30, top: cy * H + 30, width: W - 60, height: H - 60, border: "3px solid rgba(232,242,255,.22)", outline: "1px solid rgba(232,242,255,.10)", outlineOffset: 10 }} />
      )),
    )}
    {/* علامات تسجيل في الزوايا */}
    {Array.from({ length: 12 }, (_, i) => (
      <div key={i} style={{ position: "absolute", left: (i % 3) * W - 20, top: Math.floor(i / 3) * H - 20, width: 40, height: 40, borderLeft: "3px solid rgba(255,213,74,.5)", borderTop: "3px solid rgba(255,213,74,.5)", opacity: (f % 60) < 30 ? 1 : 0.8 }} />
    ))}
  </div>
);

const Cell: React.FC<{ k: Exclude<SegK, "end">; children: React.ReactNode }> = ({ k, children }) => (
  <div style={{ position: "absolute", left: CELL[k][0] * W, top: CELL[k][1] * H, width: W, height: H }}>{children}</div>
);

const World: React.FC<{ f: number }> = ({ f }) => {
  const cam = camAt(f);
  const prev = camAt(f - 1);
  const vx = Math.abs(cam.x - prev.x);
  const vy = Math.abs(cam.y - prev.y);
  const bx = Math.min(30, vx * 0.35);
  const by = Math.min(30, vy * 0.35);
  const blur = bx + by > 0.6 && cam.s === 1;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: B.sheet2 }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="camblur" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation={`${bx.toFixed(1)} ${by.toFixed(1)}`} />
        </filter>
      </svg>
      <div style={{ position: "absolute", left: 0, top: 0, width: W * 2, height: H * 3, transformOrigin: "0 0", transform: `scale(${cam.s}) translate(${-cam.x}px, ${-cam.y}px)`, filter: blur ? "url(#camblur)" : undefined }}>
        <Sheet f={f} />
        <Cell k="hook"><HookCell f={f} /></Cell>
        <Cell k="what"><WhatCell f={f} /></Cell>
        <Cell k="how"><HowCell f={f} /></Cell>
        <Cell k="verify"><VerifyCell f={f} /></Cell>
        <Cell k="where"><WhereCell f={f} /></Cell>
        <Cell k="control"><ControlCell f={f} /></Cell>
      </div>
    </AbsoluteFill>
  );
};

/** الختام: الورقة كاملة خلف، وفوقها علي داخل دائرة فرجار */
const End: React.FC<{ f: number }> = ({ f }) => {
  const { kick } = useMusic();
  const lf = f - SEG.end[0];
  if (lf < 30) return null;
  const dim = ease(lf, 34, 20);
  const ring = ease(lf, 40, 30, OUT);
  const av = ease(lf, 52, 24, OUT);
  const center = (y: number, node: React.ReactNode) => <div style={{ position: "absolute", top: y, left: 0, width: W, display: "flex", justifyContent: "center", direction: "rtl" }}>{node}</div>;
  return (
    <>
      <AbsoluteFill style={{ background: `radial-gradient(60% 45% at 50% 45%, rgba(6,26,58,${0.9 * dim}) 0%, rgba(6,26,58,${0.55 * dim}) 100%)` }} />
      <svg width={520} height={520} viewBox="0 0 520 520" style={{ position: "absolute", left: W / 2 - 260, top: 360 }}>
        <Draw d="M260 20 A240 240 0 1 1 259.9 20" p={ring} w={6} c={B.yel} />
        <Draw d="M260 0 V 40 M260 480 V 520 M0 260 H 40 M480 260 H 520" p={ring} w={4} c={B.yel} />
      </svg>
      <div style={{ position: "absolute", left: W / 2 - 210, top: 410, width: 420, height: 420, borderRadius: "50%", overflow: "hidden", border: `6px solid ${B.line}`, clipPath: `circle(${av * 52}% at 50% 50%)`, boxShadow: `0 0 ${40 + kick * 30}px rgba(255,213,74,.3)` }}>
        <Img src={staticFile("avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%", transform: `scale(${1.15 - 0.15 * av})` }} />
      </div>
      {center(
        900,
        <Reveal f={lf} at={64} d={22}>
          <div style={{ font: `900 96px/1.3 ${DISPLAY}`, color: B.line, whiteSpace: "nowrap" }}>علي التميمي</div>
        </Reveal>,
      )}
      {center(
        1040,
        <Reveal f={lf} at={80} d={22}>
          <div style={{ font: `900 56px/1.4 ${DISPLAY}`, color: B.yel, whiteSpace: "nowrap" }}>وش الأداة اللي تبي تبنيها؟</div>
        </Reveal>,
      )}
      {center(
        1135,
        <Reveal f={lf} at={92} d={18}>
          <div style={{ font: `600 38px ${BODY}`, color: B.soft, whiteSpace: "nowrap" }}>
            اكتب فكرتك بالتعليقات… وأرسم لك خطة <En>Claude Code</En>
          </div>
        </Reveal>,
      )}
      {center(
        1250,
        <div style={{ opacity: ease(lf, 104, 16), padding: "14px 30px", borderRadius: 999, background: B.line }}>
          <HandlesRow size={34} color={B.deep} />
        </div>,
      )}
    </>
  );
};

const Footer: React.FC<{ f: number }> = ({ f }) => {
  const o = ease(f, 8, 14) * (1 - ease(f, SEG.end[0] - 10, 10));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 1478, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o * 0.85 }}>
      <HandlesRow size={26} color="rgba(232,242,255,.85)" />
    </div>
  );
};

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <World f={f} />
      <End f={f} />
      <Footer f={f} />
      <FilmLook f={f} vignette={0.3} />
    </AbsoluteFill>
  );
};

const s = (k: SegK) => SEG[k][0];

export const CodeBlueprint: React.FC = () => (
  <MusicProvider src="videos/code-blueprint/music.mp3" volume={0.7}>
    <Scene />
    <Sfx name="whoosh_soft" at={0} volume={0.16} />
    {[8, 20, 32, 44, 56, 68].map((t) => (
      <Sfx key={t} name="click" at={t} volume={0.08} />
    ))}
    <Sfx name="riser" at={s("what") - SFX_RISER_PEAK} volume={0.18} />
    {(["what", "how", "verify", "where", "control", "end"] as SegK[]).map((k) => (
      <span key={k}>
        <Sfx name="whoosh_fast" at={s(k) - 10} volume={0.24} />
        <Sfx name="impact" at={s(k)} volume={k === "what" ? 0.3 : 0.18} />
      </span>
    ))}
    {[34, 56, 78].map((t) => (
      <Sfx key={t} name="pop" at={s("what") + t} volume={0.16} />
    ))}
    <Sfx name="typing" at={s("how") + 16} volume={0.12} />
    {[104, 118, 132].map((t) => (
      <Sfx key={t} name="pop" at={s("how") + t} volume={0.14} />
    ))}
    {[170, 180, 190, 200].map((t) => (
      <Sfx key={t} name="click" at={s("how") + t} volume={0.14} />
    ))}
    <Sfx name="typing" at={s("verify") + 14} volume={0.1} />
    <Sfx name="error" at={s("verify") + 36} volume={0.16} />
    <Sfx name="click" at={s("verify") + 86} volume={0.14} />
    <Sfx name="click" at={s("verify") + 98} volume={0.14} />
    <Sfx name="success" at={s("verify") + 142} volume={0.2} />
    {[20, 32, 44, 56].map((t) => (
      <Sfx key={t} name="pop" at={s("where") + t} volume={0.14} />
    ))}
    <Sfx name="click" at={s("control") + 70} volume={0.22} />
    <Sfx name="error" at={s("control") + 132} volume={0.1} />
    <Sfx name="success" at={s("control") + 148} volume={0.16} />
    <Sfx name="whoosh_soft" at={s("end") + 4} volume={0.2} />
    <Sfx name="success" at={s("end") + 66} volume={0.16} />
  </MusicProvider>
);
