import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { MusicProvider, Sfx, SFX_RISER_PEAK, useMusic } from "../../lib/music";
import { Cam, PERSPECTIVE, depth, fade, makePath, smooth, worldTransform } from "./camera";
import { Board, Gears, Growth, IconBuild, IconChat, IconFlow, Orders, Tasks } from "./illus";

/**
 * إعلان «علي التميمي» — لقطة واحدة متواصلة (30ث · 1080×1920 · 30fps).
 * عالم ثلاثي الأبعاد بـ CSS والكاميرا تسافر فيه بلا قطع:
 * الهوك ← اختراق الضوء (الـ drop عند 90) ← علي ← ألواح الجمهور ← شبكة الوكلاء
 * ← نفق المنشورات الحقيقية ← بطاقة الختام ← سواد + خط ذهبي (يرجع لأول إطار = حلقة).
 * الهوية: سواد منتصف الليل · زمردي · ذهب شامبانيا · Aref Ruqaa للاسم · Amiri للنصوص.
 */
export const ALI_AD_FRAMES = 900;
const HIT = 90; // الـ drop: الكاميرا تخترق خط الضوء
const END_HIT = 780; // ضربة الختام (على النبض: 90 + 46×15)

const K = {
  ink: "#040706",
  emerald: "#1FBF8F",
  deep: "#0B3D2E",
  gold: "#E8D5A3",
  gold2: "#C9A55C",
  white: "#F5F1E8",
};
const AREF = "Aref Ruqaa";
const AMIRI = "Amiri";
const LAT = "Space Grotesk";
const A = (p: string) => staticFile(`videos/ali-ad/${p}`);

/* ───────── مواضع المحطات في العالم ───────── */
const Z = {
  hook: 0,
  ali: -1500,
  p1: -3000,
  p2: -3900,
  p3: -4800,
  net: -6200,
  tunnel0: -7000,
  end: -10600,
};

/* ───────── مسار الكاميرا (إطار ← موضع) ───────── */
const path = makePath([
  { f: 0, x: 0, y: 0, z: 1650 },
  { f: 78, z: 1260 }, // دفعة بطيئة للقراءة
  { f: 96, z: 420 }, // اختراق خط الضوء مع الـ drop
  { f: 112, x: 110, y: -40, z: 120, yaw: 3 },
  { f: 215, x: -110, y: -10, z: -110, yaw: -3 }, // مدار هادئ حول علي
  { f: 243, x: -60, y: 0, z: -1250, yaw: 0 }, // عبور النور خلف علي
  { f: 265, x: -60, z: -1820 },
  { f: 315, x: -60, z: -1900 }, // لوح 1
  { f: 335, x: 60, z: -2720 },
  { f: 385, x: 60, z: -2800 }, // لوح 2
  { f: 405, x: -60, z: -3620 },
  { f: 455, x: -60, z: -3700 }, // لوح 3
  { f: 485, x: 0, y: -380, z: -4780, pitch: -10 },
  { f: 510, x: 0, y: -40, z: -4980, pitch: -2 },
  { f: 660, x: 0, y: 0, z: -5110, pitch: 0 }, // الشبكة ثم الدورات
  { f: 690, z: -6000, roll: 0 },
  { f: 725, z: -7600, roll: -4 }, // نفق المنشورات
  { f: 755, z: -9000, roll: 2 },
  { f: 785, x: 0, y: 0, z: -9330, roll: 0 },
  { f: 900, z: -9470 }, // الختام
]);

/* ───────── أدوات العالم ───────── */
const Obj: React.FC<{
  cam: Cam;
  x?: number;
  y?: number;
  z: number;
  ry?: number;
  near?: number;
  far?: number;
  farSoft?: number;
  opacity?: number;
  children: React.ReactNode;
}> = ({ cam, x = 0, y = 0, z, ry = 0, near = 380, far = 5200, farSoft = 1600, opacity = 1, children }) => {
  const o = fade(depth(cam, z), near, 260, far, farSoft) * opacity;
  if (o <= 0.002) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${ry}deg) translate(-50%, -50%)`,
        opacity: o,
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
};

/** نص ذهبي متدرّج مع لمعة تمر عليه */
const goldText = (f: number, from: number, speed = 1): React.CSSProperties => ({
  backgroundImage: `linear-gradient(100deg, ${K.gold2} 0%, ${K.gold} 30%, #FFF6DC 42%, ${K.gold} 54%, ${K.gold2} 100%)`,
  backgroundSize: "300% 100%",
  backgroundPosition: `${100 - ((((f - from) * speed) % 160) / 160) * 100}% 0%`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  // الخلفية ترسم داخل الصندوق فقط — الحروف المكدسة فوق السطر (لتـ) كانت تنقص
  padding: "0.35em 0.15em",
  margin: "-0.35em -0.15em",
});

/* ───────── الغبار الضوئي (ثابت عبر العالم، ينبض مع الكيك) ───────── */
const DUST = Array.from({ length: 170 }, (_, i) => {
  const r = (n: number) => {
    const v = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  return {
    x: (r(1) - 0.5) * 2600,
    y: (r(2) - 0.5) * 3600,
    z: 2200 - r(3) * 13500,
    s: 3 + r(4) * 7,
    gold: r(5) > 0.45,
    tw: r(6) * 6.28,
  };
});

const Dust: React.FC<{ cam: Cam; f: number }> = ({ cam, f }) => {
  const { kick, high } = useMusic();
  return (
    <>
      {DUST.map((d, i) => {
        const dd = depth(cam, d.z);
        if (dd < 260 || dd > 4200) return null;
        const o = Math.min(1, (dd - 260) / 300) * Math.min(1, (4200 - dd) / 1200);
        const tw = 0.45 + 0.35 * Math.sin(f / 9 + d.tw) + kick * 0.5 + high * 0.15;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: d.s,
              height: d.s,
              borderRadius: "50%",
              background: d.gold ? K.gold : K.emerald,
              boxShadow: `0 0 ${d.s * 3}px ${d.gold ? K.gold : K.emerald}`,
              transform: `translate3d(${d.x + Math.sin(f / 50 + d.tw) * 30}px, ${d.y - f * 0.4}px, ${d.z}px)`,
              opacity: Math.max(0, Math.min(1, tw)) * o,
            }}
          />
        );
      })}
    </>
  );
};

/* ───────── المحطة 1: الهوك ───────── */
const Hook: React.FC<{ cam: Cam; f: number }> = ({ cam, f }) => {
  const out = 1 - smooth((f - 84) / 10);
  const line = (t: string, at: number, style: React.CSSProperties) => {
    const p = smooth((f - at) / 10);
    return (
      <div
        style={{
          fontFamily: AMIRI,
          fontWeight: 700,
          lineHeight: 1.25,
          whiteSpace: "nowrap",
          opacity: p,
          translate: `0px ${(1 - p) * 30}px`,
          filter: `blur(${(1 - p) * 10}px)`,
          ...style,
        }}
      >
        {t}
      </div>
    );
  };
  return (
    <Obj cam={cam} z={Z.hook} near={600} opacity={out}>
      <div style={{ direction: "rtl", textAlign: "center", width: 1200 }}>
        {line("تبي الذكاء الاصطناعي", -12, { fontSize: 124, color: K.white })}
        {line("يشتغل لك…", 4, { fontSize: 124, color: K.white })}
        <div style={{ height: 26 }} />
        {line("بدل ما تشتغل له؟", 20, { fontSize: 140, ...goldText(f, 20, 2) })}
        <div style={{ marginTop: 90, display: "flex", justifyContent: "center", scale: "1.45", opacity: smooth((f + 6) / 8) }}>
          <Gears f={f} ai={50} />
        </div>
      </div>
    </Obj>
  );
};

/* ───────── المحطة 2: علي ───────── */
const Ali: React.FC<{ cam: Cam; f: number }> = ({ cam, f }) => {
  const { kick, bass } = useMusic();
  const reveal = smooth((f - HIT + 2) / 16);
  const nameP = smooth((f - 118) / 22);
  const tagP = smooth((f - 146) / 16);
  return (
    <>
      {/* هالة وأشعة خلفه */}
      <Obj cam={cam} z={Z.ali - 450} y={-160} far={9000} opacity={reveal}>
        <div
          style={{
            width: 2600,
            height: 2600,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${K.emerald}${Math.round((0.32 + kick * 0.25 + bass * 0.1) * 255)
              .toString(16)
              .padStart(2, "0")} 0%, ${K.deep}66 28%, transparent 62%)`,
          }}
        />
      </Obj>
      <Obj cam={cam} z={Z.ali - 300} y={-200} far={9000} opacity={reveal * 0.9}>
        <div
          style={{
            width: 2400,
            height: 2400,
            background: `repeating-conic-gradient(from ${f * 0.25}deg, ${K.gold}14 0deg 4deg, transparent 4deg 16deg)`,
            WebkitMaskImage: "radial-gradient(circle, black 8%, transparent 60%)",
            maskImage: "radial-gradient(circle, black 8%, transparent 60%)",
          }}
        />
      </Obj>
      {/* منصة مضيئة */}
      <Obj cam={cam} z={Z.ali + 40} y={640} far={9000} opacity={reveal}>
        <div
          style={{
            width: 1500,
            height: 220,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${K.gold}55 0%, ${K.emerald}22 40%, transparent 70%)`,
          }}
        />
      </Obj>
      {/* علي */}
      <Obj cam={cam} z={Z.ali} y={-60} near={900} far={9000} opacity={reveal}>
        <Img
          src={A("ali.png")}
          style={{
            width: 1180,
            display: "block",
            filter: `drop-shadow(0 0 60px ${K.emerald}55) contrast(1.04) saturate(1.05)`,
            WebkitMaskImage: "linear-gradient(to bottom, black 52%, rgba(0,0,0,.35) 74%, transparent 94%)",
            maskImage: "linear-gradient(to bottom, black 52%, rgba(0,0,0,.35) 74%, transparent 94%)",
          }}
        />
      </Obj>
      {/* الاسم والوعد أمامه */}
      <Obj cam={cam} z={Z.ali + 380} y={250} near={500} far={9000}>
        <div style={{ direction: "rtl", textAlign: "center", width: 1200 }}>
          <div
            style={{
              fontFamily: AREF,
              fontWeight: 700,
              fontSize: 138,
              lineHeight: 1.25,
              opacity: nameP,
              translate: `0px ${(1 - nameP) * 40}px`,
              filter: `drop-shadow(0 8px 30px rgba(0,0,0,.9))`,
              ...goldText(f, 118, 1.6),
            }}
          >
            علي التميمي
          </div>
          <div
            style={{
              fontFamily: AMIRI,
              fontWeight: 700,
              fontSize: 62,
              color: K.white,
              marginTop: 4,
              opacity: tagP,
              translate: `0px ${(1 - tagP) * 20}px`,
              textShadow: "0 4px 24px rgba(0,0,0,.95)",
            }}
          >
            الذكاء الاصطناعي… <span style={{ color: K.emerald }}>بالخليجي</span>
          </div>
        </div>
      </Obj>
    </>
  );
};

/* ───────── المحطة 3: ألواح الجمهور ───────── */
const ICONS: Record<string, React.ReactNode> = {
  job: (
    <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke={K.gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M8 7V5.5A1.5 1.5 0 019.5 4h5A1.5 1.5 0 0116 5.5V7M3 12.5h18" />
    </svg>
  ),
  biz: (
    <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke={K.gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10l8-6 8 6v10M9 20v-6h6v6" />
      <circle cx="18.5" cy="5.5" r="2.2" fill={K.emerald} stroke="none" />
    </svg>
  ),
  edu: (
    <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke={K.gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9l10-5 10 5-10 5z" />
      <path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v6" />
    </svg>
  ),
};

const Panel: React.FC<{ cam: Cam; f: number; z: number; x: number; n: string; who: string; line: string; icon: string; at: number; art: (lf: number) => React.ReactNode }> = ({
  cam,
  f,
  z,
  x,
  n,
  who,
  line,
  icon,
  at,
  art,
}) => {
  const sweep = ((f - at) / 26) * 160 - 30;
  return (
    <Obj cam={cam} z={z} x={x} ry={x > 0 ? -6 : 6} near={420} far={1250} farSoft={650}>
      <div
        style={{
          position: "relative",
          width: 860,
          padding: "56px 64px 62px",
          borderRadius: 44,
          direction: "rtl",
          overflow: "hidden",
          background: `linear-gradient(160deg, rgba(255,255,255,.13), rgba(255,255,255,.03) 55%), radial-gradient(120% 90% at 100% 0%, ${K.emerald}33, transparent 60%), rgba(6,14,12,.82)`,
          border: `2px solid ${K.gold}55`,
          boxShadow: `0 40px 120px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.25), 0 0 80px ${K.emerald}22`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(105deg, transparent ${sweep - 12}%, rgba(255,246,220,.22) ${sweep}%, transparent ${sweep + 12}%)`,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 26 }}>
          {ICONS[icon]}
          <div style={{ fontFamily: AMIRI, fontWeight: 700, fontSize: 52, color: K.gold }}>{who}</div>
          <div style={{ marginRight: "auto", fontFamily: LAT, fontWeight: 700, fontSize: 40, color: `${K.gold}88`, direction: "ltr" }}>{n}</div>
        </div>
        <div style={{ fontFamily: AMIRI, fontWeight: 700, fontSize: 88, lineHeight: 1.3, color: K.white }}>{line}</div>
        <div style={{ marginTop: 26, display: "flex", justifyContent: "center", direction: "ltr" }}>{art(f - at)}</div>
      </div>
    </Obj>
  );
};

/* ───────── المحطة 4: شبكة الوكلاء ───────── */
const NODES = (() => {
  const out: { x: number; y: number; r: number; at: number }[] = [{ x: 0, y: 0, r: 26, at: 0 }];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    out.push({ x: Math.cos(a) * 300, y: Math.sin(a) * 300, r: 14, at: 6 + i * 3 });
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.26;
    out.push({ x: Math.cos(a) * 560, y: Math.sin(a) * 560, r: 9, at: 30 + i * 2 });
  }
  return out;
})();
const EDGES: [number, number][] = [
  ...Array.from({ length: 8 }, (_, i) => [0, i + 1] as [number, number]),
  ...Array.from({ length: 8 }, (_, i) => [i + 1, ((i + 1) % 8) + 1] as [number, number]),
  ...Array.from({ length: 12 }, (_, i) => [9 + i, 1 + Math.floor((i * 8) / 12)] as [number, number]),
];

const Network: React.FC<{ cam: Cam; f: number }> = ({ cam, f }) => {
  const { kick } = useMusic();
  const t0 = 480;
  const lt = f - t0;
  const swap = 555; // من «بنيت» إلى «دورات قادمة» (على النبض)
  const p1 = smooth((f - 488) / 14) * (1 - smooth((f - swap) / 10));
  const p2 = smooth((f - swap - 4) / 12);
  const netO = 1 - 0.75 * smooth((f - swap) / 16);
  const blf = f - swap;
  return (
    <>
      <Obj cam={cam} z={Z.net - 700} y={-80} far={6000} opacity={netO}>
        <svg width="1400" height="1400" viewBox="-700 -700 1400 1400" style={{ overflow: "visible" }}>
          <defs>
            <radialGradient id="ng">
              <stop offset="0%" stopColor={K.emerald} stopOpacity="0.35" />
              <stop offset="100%" stopColor={K.emerald} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle r="680" fill="url(#ng)" opacity={0.6 + kick * 0.4} />
          {EDGES.map(([a, b], i) => {
            const na = NODES[a];
            const nb = NODES[b];
            const p = Math.min(1, Math.max(0, (lt - Math.max(na.at, nb.at) + 4) / 10));
            return (
              <line
                key={i}
                x1={na.x}
                y1={na.y}
                x2={na.x + (nb.x - na.x) * p}
                y2={na.y + (nb.y - na.y) * p}
                stroke={i < 8 ? K.gold : K.emerald}
                strokeOpacity={0.55}
                strokeWidth={i < 8 ? 3 : 2}
              />
            );
          })}
          {lt > 22
            ? EDGES.slice(0, 16).map(([a, b], i) => {
                const na = NODES[a];
                const nb = NODES[b];
                const t = (((lt - 22) * 0.045 + i * 0.137) % 1 + 1) % 1;
                return <circle key={`d${i}`} cx={na.x + (nb.x - na.x) * t} cy={na.y + (nb.y - na.y) * t} r={7} fill="#FFF8E6" opacity={0.9 * Math.sin(t * Math.PI)} />;
              })
            : null}
          {NODES.map((n, i) => {
            const p = Math.min(1, Math.max(0, (lt - n.at) / 6));
            const glow = i === 0 ? 1 : 0.6 + kick * 0.6;
            return (
              <g key={i} opacity={p}>
                <circle cx={n.x} cy={n.y} r={n.r * (2.6 + kick * 1.2)} fill={i === 0 ? K.gold : K.emerald} opacity={0.18 * glow} />
                <circle cx={n.x} cy={n.y} r={n.r * p} fill={i === 0 ? K.gold : "#BFF5E1"} />
              </g>
            );
          })}
        </svg>
      </Obj>
      <Obj cam={cam} z={Z.net} y={40} near={300} far={3000}>
        <div style={{ direction: "rtl", textAlign: "center", width: 1000, position: "relative", height: 560 }}>
          <div style={{ position: "absolute", inset: 0, opacity: p1, translate: `0px ${(1 - smooth((f - 488) / 14)) * 30}px` }}>
            <div style={{ fontFamily: AMIRI, fontWeight: 700, fontSize: 50, color: K.emerald }}>بنيتها لشركات</div>
            <div style={{ fontFamily: AMIRI, fontWeight: 700, fontSize: 104, lineHeight: 1.25, color: K.white, textShadow: "0 6px 40px #000" }}>
              أنظمة وكلاء
              <br />
              <span style={goldText(f, 488, 2)}>ذكاء اصطناعي</span>
            </div>
            <div style={{ fontFamily: AMIRI, fontWeight: 700, fontSize: 50, color: `${K.white}CC`, marginTop: 16, textShadow: "0 4px 24px #000" }}>
              تلامس احتياجها… وأثبتت كفاءتها في الواقع
            </div>
          </div>
          <div style={{ position: "absolute", left: 50, top: -40, width: 900, height: 690, opacity: p2 }}>
            {f >= swap ? <Board lf={blf} capAt={15} w={900} h={690} /> : null}
            <div style={{ position: "relative", paddingTop: 50, textAlign: "center" }}>
              <div
                style={{
                  display: "inline-block",
                  fontFamily: AMIRI,
                  fontWeight: 700,
                  fontSize: 44,
                  color: K.ink,
                  background: K.emerald,
                  padding: "2px 34px 10px",
                  borderRadius: 999,
                  scale: `${1 + kick * 0.06}`,
                }}
              >
                قريباً
              </div>
              <div style={{ fontFamily: AMIRI, fontWeight: 700, fontSize: 108, lineHeight: 1.25, marginTop: 8, ...goldText(f, swap, 2) }}>
                دورات تدريبية
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 30 }}>
                {[
                  { t: "التعامل مع الذكاء الاصطناعي", I: IconChat },
                  { t: "بناء الوكلاء", I: IconBuild },
                  { t: "أتمتة الشركات والمؤسسات", I: IconFlow },
                ].map(({ t, I }, i) => {
                  const at = 22 + i * 12;
                  const cp = smooth((blf - at) / 10);
                  const sweep = ((blf - 70) / 20) * 180 - 40;
                  return (
                    <div
                      key={t}
                      style={{
                        position: "relative",
                        overflow: "hidden",
                        width: 262,
                        height: 300,
                        borderRadius: 28,
                        border: `2px solid ${K.gold}66`,
                        background: `linear-gradient(160deg, rgba(255,255,255,.10), rgba(255,255,255,.02)), rgba(6,14,12,.9)`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        opacity: cp,
                        translate: `0px ${(1 - cp) * 60}px`,
                      }}
                    >
                      <I lf={blf - at} />
                      <div style={{ fontFamily: AMIRI, fontWeight: 700, fontSize: 36, lineHeight: 1.3, color: K.white, padding: "0 14px" }}>{t}</div>
                      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent ${sweep - 14}%, rgba(255,246,220,.18) ${sweep}%, transparent ${sweep + 14}%)` }} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Obj>
    </>
  );
};

/* ───────── المحطة 5: نفق المنشورات الحقيقية ───────── */
const COVERS = ["c1", "c3", "c5", "c2", "c4", "c6"];
const Tunnel: React.FC<{ cam: Cam }> = ({ cam }) => (
  <>
    {COVERS.map((c, i) => {
      const side = i % 2 === 0 ? 1 : -1;
      const z = Z.tunnel0 - i * 420;
      return (
        <Obj key={c} cam={cam} z={z} x={side * 470} y={(i % 3) * 60 - 60} ry={-side * 34} near={260} far={3600}>
          <div
            style={{
              width: 400,
              height: 711,
              borderRadius: 26,
              overflow: "hidden",
              border: `2px solid ${K.gold}77`,
              boxShadow: `0 0 70px ${K.emerald}44, 0 30px 80px rgba(0,0,0,.8)`,
              position: "relative",
            }}
          >
            <Img src={A(`${c}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,.22), transparent 35%)" }} />
          </div>
        </Obj>
      );
    })}
  </>
);

/* ───────── المحطة 6: الختام ───────── */
const IG = (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);
const TT = (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.8 5.8 0 1 0 4.9 5.7V9a7.4 7.4 0 0 0 4.3 1.4V7.3a4.3 4.3 0 0 1-3.2-1.5z" />
  </svg>
);
const Handles: React.FC<{ size: number; color?: string }> = ({ size, color = K.gold }) => (
  <div style={{ display: "inline-flex", gap: size * 1.1, alignItems: "center", fontFamily: LAT, fontWeight: 700, fontSize: size, color, direction: "ltr", whiteSpace: "nowrap" }}>
    <span style={{ display: "inline-flex", gap: size * 0.3, alignItems: "center" }}>{IG}@al_t506</span>
    <span style={{ display: "inline-flex", gap: size * 0.3, alignItems: "center" }}>{TT}@ali_altamimy_tech</span>
  </div>
);

const End: React.FC<{ cam: Cam; f: number }> = ({ cam, f }) => {
  const { kick } = useMusic();
  const p = (a: number, d = 16) => smooth((f - a) / d);
  return (
    <>
      <Obj cam={cam} z={Z.end - 500} y={-320} far={9000}>
        <div style={{ width: 2200, height: 2200, borderRadius: "50%", background: `radial-gradient(circle, ${K.emerald}44 0%, ${K.deep}55 30%, transparent 62%)`, scale: `${1 + kick * 0.05}` }} />
      </Obj>
      <Obj cam={cam} z={Z.end} y={-560} far={9000} opacity={p(770, 20)}>
        <div
          style={{
            width: 560,
            height: 560,
            borderRadius: "50%",
            overflow: "hidden",
            border: `4px solid ${K.gold}`,
            boxShadow: `0 0 0 14px ${K.gold}22, 0 0 120px ${K.emerald}66`,
            background: `radial-gradient(circle at 50% 35%, ${K.deep}, ${K.ink})`,
          }}
        >
          <Img src={A("ali.png")} style={{ width: "112%", marginLeft: "-6%", marginTop: "-2%", display: "block" }} />
        </div>
      </Obj>
      <Obj cam={cam} z={Z.end + 120} y={150} far={9000}>
        <div style={{ direction: "rtl", textAlign: "center", width: 1100 }}>
          <div style={{ fontFamily: AREF, fontWeight: 700, fontSize: 150, lineHeight: 1.15, opacity: p(784), ...goldText(f, 784, 1.6) }}>علي التميمي</div>
          <div style={{ fontFamily: AMIRI, fontWeight: 700, fontSize: 56, color: K.white, opacity: p(796), marginTop: 4 }}>
            تابعني… وخلّ الذكاء الاصطناعي <span style={{ color: K.emerald }}>يشتغل لك</span>
          </div>
          <div style={{ marginTop: 34, opacity: p(804) }}>
            <Handles size={42} />
          </div>
          <div
            style={{
              margin: "44px auto 0",
              width: 900,
              padding: "22px 30px 28px",
              borderTop: `2px solid ${K.gold}55`,
              borderBottom: `2px solid ${K.gold}55`,
              fontFamily: AMIRI,
              fontWeight: 700,
              fontSize: 46,
              lineHeight: 1.45,
              color: `${K.white}DD`,
              opacity: p(816),
            }}
          >
            <span style={{ color: K.gold }}>للشركات والمؤسسات:</span>
            <br />
            أنظمة وكلاء ذكية… تُصمَّم على مقاس أعمالكم
          </div>
        </div>
      </Obj>
    </>
  );
};

/* ───────── طبقات الشاشة (ثنائية الأبعاد) ───────── */
const LightLine: React.FC<{ f: number }> = ({ f }) => {
  const { kick } = useMusic();
  // البداية: خط رفيع يكبر · عند الـ drop ينفجر · النهاية: يرجع (حلقة)
  const intro = f < HIT ? 0.25 + 0.75 * smooth(f / 80) : 0;
  const burst = f >= HIT - 4 && f < HIT + 18 ? 1 - Math.abs(f - HIT) / 18 : 0;
  const outro = smooth((f - 872) / 20);
  const w = Math.max(intro * 820, burst * 2400, outro * 820);
  const o = Math.max(intro * 0.9, burst, outro);
  if (o <= 0.01) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - w / 2,
        top: f < HIT + 20 ? 1290 : 960,
        width: w,
        height: 3 + burst * 10,
        borderRadius: 4,
        background: `linear-gradient(90deg, transparent, ${K.gold} 30%, #FFF8E6 50%, ${K.gold} 70%, transparent)`,
        boxShadow: `0 0 ${30 + burst * 120 + kick * 20}px ${K.gold}, 0 0 ${80 + burst * 300}px ${K.emerald}88`,
        opacity: o,
      }}
    />
  );
};

const Flash: React.FC<{ f: number; at: number; max?: number; dur?: number }> = ({ f, at, max = 0.85, dur = 14 }) => {
  const o = f < at - 2 ? 0 : f < at ? ((f - at + 2) / 2) * max : Math.max(0, max * (1 - (f - at) / dur));
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, #FFF7E0, ${K.gold}AA 30%, ${K.emerald}55 60%, transparent 85%)`, opacity: o }} />;
};

const FilmLook: React.FC<{ f: number }> = ({ f }) => (
  <>
    <AbsoluteFill style={{ background: "radial-gradient(130% 90% at 50% 50%, transparent 45%, rgba(0,0,0,.78) 100%)" }} />
    <AbsoluteFill
      style={{
        // حبيبات فيلم متكررة (بلاطة 256px) — Img ما يكرر البلاطة، فهنا الخلفية مقصودة
        // eslint-disable-next-line @remotion/no-background-image
        backgroundImage: `url(${A("grain.png")})`,
        backgroundPosition: `${(f * 37) % 256}px ${(f * 91) % 256}px`,
        opacity: 0.06,
        mixBlendMode: "overlay",
      }}
    />
  </>
);

/** الحسابان ثابتان أسفل الشاشة (يختفيان في بطاقة الختام) */
const Footer: React.FC<{ f: number }> = ({ f }) => {
  const o = smooth(f / 12) * (1 - smooth((f - 760) / 14));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 1462, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o * 0.8 }}>
      <Handles size={28} />
    </div>
  );
};

/** نص «محتوى يومي» أثناء النفق — ثابت على الشاشة للقراءة */
const TunnelLabel: React.FC<{ f: number }> = ({ f }) => {
  const o = smooth((f - 686) / 12) * (1 - smooth((f - 760) / 12));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 820, left: 0, right: 0, textAlign: "center", direction: "rtl", opacity: o }}>
      <div style={{ fontFamily: AMIRI, fontWeight: 700, fontSize: 92, color: K.white, textShadow: "0 8px 50px #000, 0 0 30px #000" }}>محتوى يومي</div>
      <div style={{ fontFamily: AMIRI, fontWeight: 700, fontSize: 60, textShadow: "0 6px 40px #000", ...goldText(f, 686, 2) }}>يبسّط لك الذكاء الاصطناعي</div>
    </div>
  );
};

/** سواد في آخر إطارات (يلتقي مع أول إطار) */
const LoopFade: React.FC<{ f: number }> = ({ f }) => {
  const o = smooth((f - 860) / 26);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: K.ink, opacity: o }} />;
};

/* ───────── المشهد ───────── */
const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const cam = path(f);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 70% at 50% 40%, #0A1714 0%, ${K.ink} 70%)`, overflow: "hidden" }}>
      <AbsoluteFill style={{ perspective: `${PERSPECTIVE}px`, perspectiveOrigin: "50% 50%" }}>
        <div style={{ position: "absolute", left: 540, top: 960, width: 0, height: 0, transformStyle: "preserve-3d", transform: worldTransform(cam) }}>
          <Dust cam={cam} f={f} />
          <Hook cam={cam} f={f} />
          <Ali cam={cam} f={f} />
          <Panel cam={cam} f={f} z={Z.p1} x={-60} n="01" who="للموظف" line="خلّص شغلك أسرع… وأذكى" icon="job" at={262} art={(lf) => <Tasks lf={lf} />} />
          <Panel cam={cam} f={f} z={Z.p2} x={60} n="02" who="لصاحب المشروع" line="شغّل مشروعك بوكيل ذكي" icon="biz" at={332} art={(lf) => <Orders lf={lf} />} />
          <Panel cam={cam} f={f} z={Z.p3} x={-60} n="03" who="للطالب" line="ابدأ مهارة المستقبل من بدري" icon="edu" at={402} art={(lf) => <Growth lf={lf} />} />
          <Network cam={cam} f={f} />
          <Tunnel cam={cam} />
          <End cam={cam} f={f} />
        </div>
      </AbsoluteFill>
      <TunnelLabel f={f} />
      <LightLine f={f} />
      <Flash f={f} at={HIT} />
      <Flash f={f} at={END_HIT} max={0.45} dur={18} />
      <FilmLook f={f} />
      <Footer f={f} />
      <LoopFade f={f} />
    </AbsoluteFill>
  );
};

export const AliAd: React.FC = () => (
  <MusicProvider src="videos/ali-ad/music.mp3" volume={0.78}>
    <Scene />
    <Sfx name="whoosh_soft" at={0} volume={0.25} />
    <Sfx name="riser" at={HIT - SFX_RISER_PEAK} volume={0.35} />
    <Sfx name="impact" at={HIT} volume={0.42} />
    <Sfx name="whoosh_fast" at={HIT - 4} volume={0.4} />
    <Sfx name="success" at={122} volume={0.18} />
    <Sfx name="click" at={50} volume={0.25} />
    <Sfx name="whoosh_soft" at={220} volume={0.35} />
    {[255, 325, 395].map((t) => (
      <Sfx key={t} name="whoosh_fast" at={t} volume={0.28} />
    ))}
    {[270, 278, 286, 347, 356, 365, 374].map((t) => (
      <Sfx key={`c${t}`} name="click" at={t} volume={0.18} />
    ))}
    <Sfx name="success" at={432} volume={0.18} />
    <Sfx name="whoosh_soft" at={462} volume={0.35} />
    {[486, 494, 502, 510].map((t) => (
      <Sfx key={`p${t}`} name="pop" at={t} volume={0.14} />
    ))}
    <Sfx name="whoosh_soft" at={552} volume={0.3} />
    <Sfx name="impact" at={570} volume={0.3} />
    {[577, 589, 601].map((t) => (
      <Sfx key={`q${t}`} name="pop" at={t} volume={0.22} />
    ))}
    <Sfx name="typing" at={583} volume={0.12} />
    <Sfx name="whoosh_fast" at={664} volume={0.4} />
    <Sfx name="whoosh_soft" at={720} volume={0.3} />
    <Sfx name="impact" at={END_HIT} volume={0.4} />
    <Sfx name="success" at={END_HIT + 4} volume={0.22} />
  </MusicProvider>
);
