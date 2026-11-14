import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { MusicProvider, SFX_RISER_PEAK, Sfx, useMusic } from "../../lib/music";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { BACK, IN, IN_OUT, OUT, ease, typed } from "../ClaudeVsGptPro/theme";

/**
 * «حوّل جدولك إلى قرار في ٣ خطوات» — 58.5ث (1080×1920 · 30fps): خط إنتاج بثلاث محطات.
 * جدول مبيعات تجريبي «معفّن» (صف مكرر، تواريخ بصيغ مختلفة، اسم مدينة بثلاث كتابات، خلية فاضية) ← نظّف
 * ← لخّص (مبيعات حسب المدينة والشهر) ← اسأل السؤال الصح (ليش جدة نازلة؟) ثم ٣ فحوصات قبل ما تعتمد على الرد.
 * كل الأرقام تجريبية للتوضيح.
 */
export const SHEETFLOW_FRAMES = 1755;

const V = (p: string) => staticFile(`videos/sheetflow/${p}`);
const DISPLAY = "'El Messiri'";
const BODY = "'IBM Plex Sans Arabic', 'Space Grotesk'";
const EN = "'Space Grotesk'";
const C = { s0: "#FFF4E2", s1: "#FFD9A6", ink: "#2A1A0E", or: "#FF7A1A", teal: "#0E8F8A", red: "#E5484D", yel: "#FFC933", grn: "#1FA971", mute: "#7A6552", paper: "#FFFFFF", blue: "#2D6CDF" };

const SEG = {
  hook: [0, 144],
  intro: [144, 360],
  clean: [360, 648],
  sum: [648, 936],
  ask: [936, 1224],
  check: [1224, 1512],
  end: [1512, 1755],
} as const;
type K = keyof typeof SEG;
const lp = (f: number, k: K) => f - SEG[k][0];
const inSeg = (f: number, k: K) => f >= SEG[k][0] - 2 && f < SEG[k][1] + 2;
const outOf = (f: number, k: K) => 1 - ease(f, SEG[k][1] - 12, 10, OUT);

/* ───── الخلفية: رمل دافئ بشبكة جدول، وصورة لابتوب حقيقية في الهوك ───── */
const Backdrop: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const photo = 1 - ease(f, SEG.hook[1] - 30, 40, OUT);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(85% 50% at 50% 52%, ${C.s0} 0%, ${C.s1} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.08 + kick * 0.03, backgroundImage: `linear-gradient(${C.ink} 2px, transparent 2px), linear-gradient(90deg, ${C.ink} 2px, transparent 2px)`, backgroundSize: "72px 72px", backgroundPosition: `0 ${f * 0.15}px` }} />
      {photo > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: photo }}>
          <Img src={V("dash.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "30% 50%", transform: `scale(${1.25 + f * 0.0012})`, filter: "saturate(1.05)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,244,226,.96) 0%, rgba(255,244,226,.75) 30%, rgba(255,244,226,.25) 58%, rgba(42,26,14,.55) 100%)" }} />
        </div>
      ) : null}
    </>
  );
};

/* ───── العناوين ───── */
type B = { k: K; chip: React.ReactNode; title: React.ReactNode; sub?: React.ReactNode; col: string; lines?: number; size?: number };
const TAG = "أتمتة · من الجدول للقرار";
const BLOCKS: B[] = [
  { k: "hook", chip: TAG, title: <>جدولك مليان أرقام…<br />وين القرار؟</>, sub: "ثلاث خطوات تحوّله لقرار", col: C.or, lines: 2, size: 100 },
  { k: "intro", chip: "خط الإنتاج", title: "ثلاث محطات", sub: "نظّف ← لخّص ← اسأل السؤال الصح", col: C.teal, size: 106 },
  { k: "clean", chip: "المحطة 1", title: "نظّف أول", sub: "الذكاء الاصطناعي يحلل اللي تعطيه… والمعفّن يطلع معفّن", col: C.red, size: 108 },
  { k: "sum", chip: "المحطة 2", title: "لخّص", sub: "من ٥٠٠ صف إلى جدول تفهمه بنظرة", col: C.or, size: 112 },
  { k: "ask", chip: "المحطة 3", title: "اسأل السؤال الصح", sub: "السؤال الدقيق يجيب جواب تقدر تتصرف عليه", col: C.teal, size: 92 },
  { k: "check", chip: "قبل لا تعتمد", title: "ثلاث فحوصات", sub: "الأرقام قرارك أنت، مو قرار الأداة", col: C.red, size: 108 },
];
const Block: React.FC<{ f: number; b: B }> = ({ f, b }) => {
  const [a, e] = SEG[b.k];
  if (f < a - 2 || f > e + 2) return null;
  const lf = f - a;
  const first = a === 0;
  const out = ease(f, e - 10, 10, IN);
  const pc = first ? 1 : ease(lf, 4, 14, BACK);
  const pt = first ? ease(lf, 0, 14, OUT) : ease(lf, 8, 18, OUT);
  const ps = ease(lf, first ? 12 : 20, 16, OUT);
  const size = b.size ?? 100;
  const lines = b.lines ?? 1;
  return (
    <div style={{ position: "absolute", inset: 0, direction: "rtl", opacity: 1 - out, transform: `translateY(${-out * 40}px)` }}>
      <div style={{ position: "absolute", top: 196, right: 80, padding: "6px 22px 10px", borderRadius: 999, background: b.col, color: "#fff", font: `700 30px ${BODY}`, transform: `scale(${pc})`, transformOrigin: "right center", whiteSpace: "nowrap", boxShadow: `0 8px 24px ${b.col}66` }}>{b.chip}</div>
      <div style={{ position: "absolute", top: 256, right: 74, left: 20, overflow: "hidden", padding: "0 6px 12px" }}>
        <div style={{ font: `700 ${size}px/1.32 ${DISPLAY}`, color: C.ink, whiteSpace: "nowrap", transform: `translateY(${(1 - pt) * 110}%)` }}>{b.title}</div>
      </div>
      {b.sub ? <div style={{ position: "absolute", top: 256 + size * 1.32 * lines + 20, right: 80, left: 60, font: `700 34px/1.5 ${BODY}`, color: C.mute, opacity: ps, transform: `translateY(${(1 - ps) * 20}px)` }}>{b.sub}</div> : null}
    </div>
  );
};

/* ───── مكونات مشتركة ───── */
const Chip: React.FC<{ p: number; top: number; color: string; icon?: string; children: React.ReactNode; bg?: string; strike?: boolean }> = ({ p, top, color, icon, children, bg = "#fff", strike }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", top, right: 70, left: 70, display: "flex", alignItems: "center", gap: 16, padding: "14px 22px 18px", borderRadius: 26, background: bg, border: `3px solid ${color}`, boxShadow: "0 14px 30px rgba(42,26,14,.15)", direction: "rtl", opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 30}px)` }}>
      {icon ? <span style={{ flex: "none", width: 46, height: 46, borderRadius: 23, display: "grid", placeItems: "center", background: color, color: "#fff", font: `700 28px ${EN}` }}>{icon}</span> : null}
      <span style={{ font: `700 30px/1.45 ${BODY}`, color: C.ink, textDecoration: strike ? "line-through" : "none", textDecorationColor: C.red }}>{children}</span>
    </div>
  );
const Note: React.FC<{ p: number; top: number; children: React.ReactNode; color?: string }> = ({ p, top, children, color = C.teal }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", top, right: 70, left: 70, padding: "14px 24px 18px", borderRadius: 22, background: `${color}1A`, border: `2px solid ${color}`, color: C.ink, font: `700 29px/1.5 ${BODY}`, direction: "rtl", opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>
      {children}
    </div>
  );

/* ───── الهوك: جدول يلف ويطلع علامة استفهام ───── */
const HookArt: React.FC<{ f: number }> = ({ f }) => {
  if (f > SEG.hook[1] + 4) return null;
  const p = ease(f, 40, 24, BACK);
  const out = 1 - ease(f, SEG.hook[1] - 12, 10, OUT);
  const rows = Array.from({ length: 6 }, (_, i) => i);
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 840, height: 380, opacity: Math.min(1, p) * out, transform: `scale(${0.85 + 0.15 * p})` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 28, background: "#fff", boxShadow: "0 24px 50px rgba(42,26,14,.28)", overflow: "hidden", direction: "ltr" }}>
        {rows.map((r) => (
          <div key={r} style={{ display: "flex", gap: 0, height: 62, borderBottom: "2px solid #F0E6D8", background: r === 0 ? C.ink : r % 2 ? "#FFFAF2" : "#fff" }}>
            {[0, 1, 2, 3].map((c) => {
              const n = Math.floor(((Math.sin((r + 1) * 12.9 + c * 78.2 + Math.floor(f / 6) * 0.5) * 43758) % 1 + 1) * 4000) % 9000;
              return (
                <div key={c} style={{ flex: 1, display: "grid", placeItems: "center", font: `700 30px ${EN}`, color: r === 0 ? "#fff" : C.ink, borderLeft: "2px solid #F0E6D8" }}>
                  {r === 0 ? ["A", "B", "C", "D"][c] : n}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 190, height: 190, marginLeft: -95, marginTop: -95, borderRadius: "50%", background: C.or, color: "#fff", display: "grid", placeItems: "center", font: `700 150px ${DISPLAY}`, boxShadow: "0 0 0 14px rgba(255,122,26,.25)", transform: `scale(${ease(f, 70, 18, BACK)})` }}>؟</div>
    </div>
  );
};

/* ───── مقدمة: ثلاث محطات وورقة تمشي بينها ───── */
const Intro: React.FC<{ f: number }> = ({ f }) => {
  if (!inSeg(f, "intro")) return null;
  const l = lp(f, "intro");
  const o = outOf(f, "intro");
  const st = [
    { x: 880, n: "1", t: "نظّف", c: C.red, ic: "✦" },
    { x: 540, n: "2", t: "لخّص", c: C.or, ic: "Σ" },
    { x: 200, n: "3", t: "اسأل", c: C.teal, ic: "؟" },
  ];
  const t = ease(l, 40, 140, IN_OUT);
  const sx = 960 - t * 880;
  const stage = t < 0.2 ? 0 : t < 0.6 ? 1 : 2;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o * ease(l, 4, 16, OUT) }}>
      <svg width={1080} height={400} style={{ position: "absolute", top: 640, left: 0 }}>
        <line x1={60} y1={210} x2={1020} y2={210} stroke={C.ink} strokeWidth={8} strokeDasharray="4 22" strokeLinecap="round" opacity={0.35} />
      </svg>
      {st.map((s, i) => {
        const p = ease(l, 12 + i * 14, 18, BACK);
        const active = stage === i && l > 36;
        return (
          <div key={s.n} style={{ position: "absolute", left: s.x - 110, top: 760, width: 220, textAlign: "center", opacity: Math.min(1, p * 1.5), transform: `scale(${0.7 + 0.3 * p})` }}>
            <div style={{ width: 190, height: 190, margin: "0 auto", borderRadius: "50%", background: active ? s.c : "#fff", color: active ? "#fff" : s.c, border: `8px solid ${s.c}`, display: "grid", placeItems: "center", font: `700 110px ${DISPLAY}`, boxShadow: active ? `0 0 0 14px ${s.c}33, 0 18px 40px ${s.c}66` : "0 14px 30px rgba(42,26,14,.15)" }}>{s.ic}</div>
            <div style={{ marginTop: 14, font: `700 44px ${DISPLAY}`, color: C.ink }}>{s.t}</div>
            <div style={{ font: `700 26px ${EN}`, color: C.mute }}>{s.n}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: sx - 70, top: 630, width: 140, height: 110, borderRadius: 18, background: stage === 0 ? "#fff" : stage === 1 ? "#E6F7EF" : "#E3F5F4", border: `4px solid ${stage === 0 ? C.red : stage === 1 ? C.grn : C.teal}`, boxShadow: "0 12px 26px rgba(42,26,14,.25)", opacity: ease(l, 30, 10, OUT) * (1 - ease(l, 190, 14, OUT)), overflow: "hidden", direction: "ltr" }}>
        {[0, 1, 2, 3].map((r) => (
          <div key={r} style={{ height: 26, borderBottom: "2px solid #eee", display: "flex" }}>
            {[0, 1, 2].map((c) => (
              <div key={c} style={{ flex: 1, borderLeft: "2px solid #eee", background: stage === 0 && (r + c) % 3 === 1 ? "#FFD6D6" : stage === 2 && r === 2 ? "#C9F0EE" : "transparent" }} />
            ))}
          </div>
        ))}
      </div>
      <Note p={ease(l, 150, 16, OUT) * o} top={1210} color={C.or}>
        الأداة تسرّع الشغل… <b style={{ color: C.or }}>بس إنت</b> اللي تقود الخطوات
      </Note>
    </div>
  );
};

/* ───── المحطة 1: جدول معفّن يتنظّف ───── */
type R = { d: string; c: string; p: string; a: string };
const DIRTY: R[] = [
  { d: "2026-11-01", c: "الرياض", p: "قهوة", a: "1,200" },
  { d: "1/11", c: "Riyadh", p: "قهوة", a: "1,200" },
  { d: "2026-11-02", c: "جدة", p: "شاي", a: "" },
  { d: "2 نوفمبر", c: "جده", p: "شاي", a: "800" },
  { d: "2026-11-03", c: "الدمام", p: "قهوة", a: "950" },
];
const CLEAN: R[] = [
  { d: "2026-11-01", c: "الرياض", p: "قهوة", a: "1,200" },
  { d: "", c: "", p: "", a: "" },
  { d: "2026-11-02", c: "جدة", p: "شاي", a: "" },
  { d: "2026-11-02", c: "جدة", p: "شاي", a: "800" },
  { d: "2026-11-03", c: "الدمام", p: "قهوة", a: "950" },
];
const Clean: React.FC<{ f: number }> = ({ f }) => {
  if (!inSeg(f, "clean")) return null;
  const l = lp(f, "clean");
  const o = outOf(f, "clean") * ease(l, 4, 16, OUT);
  const done = ease(l, 232, 20, OUT);
  const rowH = 72;
  const cols = [250, 230, 210, 210];
  const dateFlag = ease(l, 115, 12, OUT);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, direction: "rtl" }}>
      <div style={{ position: "absolute", top: 620, left: 50, right: 50, borderRadius: 28, background: "#fff", boxShadow: "0 24px 50px rgba(42,26,14,.2)", overflow: "hidden" }}>
        <div style={{ display: "flex", height: 66, background: C.ink, color: "#fff", font: `700 28px ${BODY}` }}>
          {["التاريخ", "المدينة", "المنتج", "المبلغ"].map((h, i) => (
            <div key={h} style={{ width: cols[i], display: "grid", placeItems: "center" }}>{h}</div>
          ))}
        </div>
        {DIRTY.map((r, i) => {
          const removed = i === 1 ? done : 0;
          const cleaned = done > 0.5;
          const cr = CLEAN[i];
          const dup = i === 1 && l > 40 && !cleaned;
          const flash = cleaned && i !== 1 && (i === 3) ? 1 - ease(l, 252, 40, OUT) : 0;
          return (
            <div key={i} style={{ display: "flex", height: rowH * (1 - removed), opacity: 1 - removed, overflow: "hidden", borderBottom: "2px solid #F4EADC", background: dup ? "#FFE3E3" : flash > 0 ? `rgba(31,169,113,${0.25 * flash})` : i % 2 ? "#FFFAF2" : "#fff", position: "relative", font: `700 28px ${EN}`, color: C.ink }}>
              {[0, 1, 2, 3].map((c) => {
                const key = (["d", "c", "p", "a"] as const)[c];
                const v = cleaned ? cr[key] : r[key];
                const badD = !cleaned && c === 0 && (i === 1 || i === 3) && dateFlag > 0;
                const badC = !cleaned && c === 1 && (i === 1 || i === 3) && l > 90;
                const blank = c === 3 && i === 2 && !v;
                return (
                  <div key={c} style={{ width: cols[c], display: "grid", placeItems: "center", direction: c === 1 || c === 2 ? "rtl" : "ltr", background: badD ? "#FFF1C2" : badC ? "#FFE1C8" : blank && l > 140 ? "#DCE8FF" : "transparent", font: c === 1 || c === 2 ? `700 28px ${BODY}` : `700 28px ${EN}` }}>
                    {blank ? <span style={{ color: C.blue, fontSize: 24 }}>{l > 140 ? "؟" : ""}</span> : v}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {/* شارات المشاكل */}
      {!(done > 0.5) ? (
        <div style={{ position: "absolute", top: 1050, left: 50, right: 50, display: "flex", gap: 10, flexWrap: "wrap", direction: "rtl" }}>
          {[
            ["صف مكرر", C.red, 40],
            ["صيغ تواريخ مختلفة", "#C99A00", 80],
            ["مدينة بثلاث كتابات", C.or, 115],
            ["خلية فاضية", C.blue, 150],
          ].map(([t, col, at]) => {
            const p = ease(l, at as number, 12, BACK);
            return p > 0 ? (
              <span key={t as string} style={{ padding: "6px 18px 10px", borderRadius: 999, background: col as string, color: "#fff", font: `700 26px ${BODY}`, transform: `scale(${p})` }}>{t as string}</span>
            ) : null;
          })}
        </div>
      ) : (
        <div style={{ position: "absolute", top: 1050, left: 50, right: 50, display: "flex", gap: 10, direction: "rtl", opacity: done }}>
          <span style={{ padding: "6px 18px 10px", borderRadius: 999, background: C.grn, color: "#fff", font: `700 26px ${BODY}` }}>✓ المكرر انحذف · التواريخ والمدن توحّدت</span>
          <span style={{ padding: "6px 18px 10px", borderRadius: 999, background: C.blue, color: "#fff", font: `700 26px ${BODY}` }}>الخلية الفاضية: يسألك</span>
        </div>
      )}
      <Chip p={ease(l, 175, 16, OUT)} top={1130} color={C.teal} icon="↑" bg="#fff">
        {typed("وحّد التواريخ وأسماء المدن، واحذف الصفوف المكررة، وقل لي وش غيّرت", l, 180, 40)}
      </Chip>
      <Note p={ease(l, 244, 16, OUT) * outOf(f, "clean")} top={1290} color={C.red}>
        اطلب منه يذكر <b style={{ color: C.red }}>كل تعديل</b> سوّاه، وراجعه. ولا يخمّن الخلية الفاضية
      </Note>
    </div>
  );
};

/* ───── المحطة 2: ملخص بأعمدة (بيانات تجريبية) ───── */
const SALES: { c: string; v: number[]; col: string }[] = [
  { c: "الرياض", v: [42, 45, 48], col: C.teal },
  { c: "جدة", v: [40, 31, 24], col: C.or },
  { c: "الدمام", v: [20, 21, 23], col: "#5BB6B1" },
];
const Sum: React.FC<{ f: number }> = ({ f }) => {
  if (!inSeg(f, "sum")) return null;
  const l = lp(f, "sum");
  const o = outOf(f, "sum") * ease(l, 4, 16, OUT);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, direction: "rtl" }}>
      <div style={{ position: "absolute", top: 620, left: 50, right: 50, height: 520, borderRadius: 28, background: "#fff", boxShadow: "0 24px 50px rgba(42,26,14,.2)", padding: "22px 26px" }}>
        <div style={{ font: `700 30px ${DISPLAY}`, color: C.ink }}>المبيعات حسب المدينة والشهر <span style={{ font: `600 24px ${BODY}`, color: C.mute }}>(ألف ريال · بيانات تجريبية)</span></div>
        <div style={{ position: "absolute", left: 30, right: 30, bottom: 60, height: 300, display: "flex", justifyContent: "space-around", alignItems: "flex-end", direction: "ltr" }}>
          {SALES.map((s, ci) => (
            <div key={s.c} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              {s.v.map((v, mi) => {
                const g = ease(l, 24 + ci * 20 + mi * 10, 30, OUT);
                const h = (v / 50) * 280 * g;
                const bad = s.c === "جدة" && mi === 2 && l > 150;
                return (
                  <div key={mi} style={{ width: 64, textAlign: "center" }}>
                    <div style={{ font: `700 24px ${EN}`, color: C.ink, opacity: g }}>{v}</div>
                    <div style={{ height: h, borderRadius: "10px 10px 0 0", background: bad ? C.red : s.col, boxShadow: bad ? `0 0 0 6px ${C.red}44` : "none" }} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 30, right: 30, bottom: 16, display: "flex", justifyContent: "space-around", font: `700 30px ${DISPLAY}`, color: C.ink }}>
          {SALES.map((s) => (
            <span key={s.c} style={{ width: 230, textAlign: "center" }}>{s.c}</span>
          ))}
        </div>
      </div>
      <Chip p={ease(l, 150, 16, OUT)} top={1190} color={C.or} icon="Σ">
        {typed("لخّص المبيعات حسب المدينة والشهر في جدول صغير", l, 156, 36)}
      </Chip>
      <Note p={ease(l, 215, 16, OUT) * outOf(f, "sum")} top={1330} color={C.or}>
        شف؟ الصورة الكبيرة ظهرت: <b style={{ color: C.or }}>جدة</b> بدأت تنزل
      </Note>
    </div>
  );
};

/* ───── المحطة 3: السؤال الصح ───── */
const Ask: React.FC<{ f: number }> = ({ f }) => {
  if (!inSeg(f, "ask")) return null;
  const l = lp(f, "ask");
  const o = outOf(f, "ask") * ease(l, 4, 16, OUT);
  const draw = ease(l, 120, 60, IN_OUT);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, direction: "rtl" }}>
      <Chip p={ease(l, 14, 16, OUT)} top={610} color={C.red} icon="✕" bg="#FFF">
        <span style={{ color: C.mute }}>«وش رأيك بالبيانات؟»</span>
        <span style={{ marginRight: 10, font: `600 24px ${BODY}`, color: C.red }}>(غامض… جواب غامض)</span>
      </Chip>
      <Chip p={ease(l, 60, 16, OUT)} top={742} color={C.grn} icon="✓" bg="#F0FBF5">
        «ليش مبيعات جدة نازلة آخر ٣ أشهر؟ وش المنتج المتأثر؟»
      </Chip>
      <div style={{ position: "absolute", top: 900, left: 50, right: 50, height: 400, borderRadius: 28, background: "#fff", boxShadow: "0 24px 50px rgba(42,26,14,.2)", opacity: ease(l, 100, 16, OUT) }}>
        <svg width={980} height={400} viewBox="0 0 980 400" style={{ position: "absolute", inset: 0 }}>
          {[0, 1, 2].map((i) => (
            <line key={i} x1={60} x2={920} y1={100 + i * 100} y2={100 + i * 100} stroke="#F0E6D8" strokeWidth={2} />
          ))}
          {SALES.map((s) => {
            const bad = s.c === "جدة";
            const pathPts = s.v.map((x, i) => `${160 + i * 330},${360 - (x / 50) * 300}`).join(" ");
            return (
              <polyline key={s.c} points={pathPts} fill="none" stroke={bad ? C.red : s.col} strokeWidth={bad ? 10 : 6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} opacity={bad ? 1 : 0.7} />
            );
          })}
          {l > 170 ? <circle cx={160 + 660} cy={360 - (24 / 50) * 300} r={18} fill={C.red} stroke="#fff" strokeWidth={6} /> : null}
        </svg>
        <div style={{ position: "absolute", top: 18, right: 28, font: `700 26px ${BODY}`, color: C.red, opacity: ease(l, 170, 12, OUT) }}>جدة ↓ ثلاثة أشهر متتالية</div>
        <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 130px", direction: "ltr", font: `600 22px ${BODY}`, color: C.mute }}><span>الشهر 1</span><span>الشهر 2</span><span>الشهر 3</span></div>
      </div>
      <Note p={ease(l, 200, 16, OUT) * outOf(f, "ask")} top={1330} color={C.teal}>
        الرد <b style={{ color: C.teal }}>فرضية تتحقق منها</b> (عرض منافس؟ منتج الشاي؟)، وبعدها تقرر
      </Note>
    </div>
  );
};

/* ───── ٣ فحوصات ───── */
const Check: React.FC<{ f: number }> = ({ f }) => {
  if (!inSeg(f, "check")) return null;
  const l = lp(f, "check");
  const o = outOf(f, "check");
  const items: [string, React.ReactNode, string][] = [
    ["1", <>لا ترفع <b style={{ color: C.red }}>بيانات عملاء حساسة</b>: أسماء وجوالات وأرقام هوية. شيّل هالأعمدة أول</>, C.red],
    ["2", <><b style={{ color: C.or }}>تحقق من رقمين</b> بنفسك: اجمعهم يدوي وقارن بالرد</>, C.or],
    ["3", <>اطلب منه <b style={{ color: C.teal }}>الخطوات أو الصيغة</b>، عشان تعيدها بنفسك بدون أداة</>, C.teal],
  ];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, direction: "rtl" }}>
      {items.map(([n, t, col], i) => {
        const p = ease(l, 24 + i * 56, 16, BACK);
        return (
          <div key={n} style={{ position: "absolute", top: 620 + i * 230, right: 60, left: 60, display: "flex", gap: 20, alignItems: "center", padding: "22px 26px 26px", borderRadius: 30, background: "#fff", border: `4px solid ${col}`, boxShadow: `0 16px 34px ${col}33`, opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 40}px) scale(${0.94 + 0.06 * p})` }}>
            <span style={{ flex: "none", width: 82, height: 82, borderRadius: 41, display: "grid", placeItems: "center", background: col, color: "#fff", font: `700 54px ${DISPLAY}` }}>{n}</span>
            <span style={{ font: `700 32px/1.5 ${BODY}`, color: C.ink }}>{t}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ───── الختام ───── */
const End: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const [a] = SEG.end;
  if (f < a - 4) return null;
  const pt = ease(f, a + 6, 18, OUT);
  const pa = ease(f, a + 20, 24, BACK);
  const pn = ease(f, a + 46, 18, OUT);
  const pc = ease(f, a + 62, 18, OUT);
  const ph = ease(f, a + 76, 18, BACK);
  return (
    <div style={{ position: "absolute", inset: 0, direction: "rtl", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 220, left: 0, right: 0, font: `700 88px/1.35 ${DISPLAY}`, color: C.ink, opacity: pt, transform: `translateY(${(1 - pt) * 30}px)` }}>
        نظّف ← لخّص ← اسأل
        <br />
        <span style={{ color: C.or }}>وإنت القرار</span>
        <div style={{ font: `700 38px/1.5 ${BODY}`, color: C.mute }}>احفظها وجرّبها على أول جدول عندك</div>
      </div>
      <div style={{ position: "absolute", top: 720, left: 540 - 220, width: 440, height: 440, borderRadius: "50%", padding: 16, background: `conic-gradient(${C.or}, ${C.yel}, ${C.teal}, ${C.or})`, transform: `scale(${pa})`, boxShadow: `0 0 ${50 + kick * 30}px rgba(255,122,26,.45)` }}>
        <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: C.s0 }}>
          <Img src={staticFile("avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%" }} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 1200, left: 0, right: 0, font: `700 84px/1.3 ${BODY}`, color: C.ink, opacity: pn, transform: `translateY(${(1 - pn) * 30}px)` }}>علي التميمي</div>
      <div style={{ position: "absolute", top: 1318, left: 0, right: 0, font: `700 34px/1.4 ${BODY}`, color: C.mute, opacity: pc }}>أتمتة وذكاء اصطناعي للشغل اليومي</div>
      <div style={{ position: "absolute", top: 1392, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${ph})` }}>
        <div style={{ padding: "10px 32px", borderRadius: 999, background: C.ink }}>
          <HandlesRow size={30} color="#FFF4E2" />
        </div>
      </div>
    </div>
  );
};
const Footer: React.FC<{ f: number }> = ({ f }) => {
  const o = ease(f, 8, 12) * (1 - ease(f, SEG.end[0], 10));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 1490, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ padding: "8px 24px", borderRadius: 999, background: "rgba(42,26,14,.82)", border: "1px solid rgba(255,255,255,.2)" }}>
        <HandlesRow size={26} color="#FFF4E2" />
      </div>
    </div>
  );
};

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { kick } = useMusic();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: C.s0 }}>
      <Backdrop f={f} kick={kick} />
      <HookArt f={f} />
      <Intro f={f} />
      <Clean f={f} />
      <Sum f={f} />
      <Ask f={f} />
      <Check f={f} />
      {BLOCKS.map((b) => (
        <Block key={b.k} f={f} b={b} />
      ))}
      <End f={f} kick={kick} />
      <Footer f={f} />
    </AbsoluteFill>
  );
};
const st = (k: K) => SEG[k][0];

export const SheetFlow: React.FC = () => (
  <MusicProvider src="videos/sheetflow/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={2} volume={0.16} />
    <Sfx name="pop" at={70} volume={0.16} />
    <Sfx name="riser" at={st("intro") - SFX_RISER_PEAK} volume={0.12} />
    <Sfx name="impact" at={st("intro")} volume={0.22} />
    {(["clean", "sum", "ask", "check", "end"] as K[]).map((k) => (
      <span key={k}>
        <Sfx name="whoosh_fast" at={st(k) - 12} volume={0.16} />
        {k !== "end" ? <Sfx name="impact" at={st(k)} volume={0.14} /> : null}
      </span>
    ))}
    {[12, 26, 40].map((d) => (
      <Sfx key={d} name="pop" at={st("intro") + d} volume={0.12} />
    ))}
    <Sfx name="whoosh_soft" at={st("intro") + 40} volume={0.14} />
    <Sfx name="click" at={st("intro") + 100} volume={0.14} />
    {[40, 80, 115, 150].map((d) => (
      <Sfx key={d} name="pop" at={st("clean") + d} volume={0.13} />
    ))}
    <Sfx name="error" at={st("clean") + 44} volume={0.1} />
    <Sfx name="typing" at={st("clean") + 180} volume={0.1} />
    <Sfx name="success" at={st("clean") + 232} volume={0.18} />
    {[24, 44, 64].map((d) => (
      <Sfx key={d} name="pop" at={st("sum") + d} volume={0.12} />
    ))}
    <Sfx name="typing" at={st("sum") + 156} volume={0.1} />
    <Sfx name="success" at={st("sum") + 215} volume={0.14} />
    <Sfx name="error" at={st("ask") + 14} volume={0.1} />
    <Sfx name="success" at={st("ask") + 62} volume={0.14} />
    <Sfx name="whoosh_soft" at={st("ask") + 120} volume={0.14} />
    <Sfx name="pop" at={st("ask") + 170} volume={0.14} />
    {[24, 80, 136].map((d) => (
      <Sfx key={d} name="pop" at={st("check") + d} volume={0.13} />
    ))}
    <Sfx name="success" at={st("end") + 40} volume={0.18} />
    <Sfx name="pop" at={st("end") + 76} volume={0.14} />
  </MusicProvider>
);
