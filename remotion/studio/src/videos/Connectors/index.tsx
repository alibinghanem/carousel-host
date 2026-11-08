import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { MusicProvider, SFX_RISER_PEAK, Sfx, useMusic } from "../../lib/music";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { BACK, IN, IN_OUT, OUT, ease, typed } from "../ClaudeVsGptPro/theme";

/**
 * «Claude · Connectors» — 58.5ث: لوحة مقابس. Claude في المركز، وتطبيقاتك (Gmail · Drive · التقويم · Slack · GitHub · Microsoft 365)
 * تنسحب بكابلات وتنشبك فيه. خطوات التفعيل بواجهة عامة، مثال سؤال يشغّل ثلاث كابلات، الصلاحيات الموروثة، ولمين متاحة.
 */
const V = (p: string) => staticFile(`videos/connectors/${p}`);
const DISPLAY = "'Baloo Bhaijaan 2'";
const BODY = "'IBM Plex Sans Arabic', 'Space Grotesk'";
const EN = "'Space Grotesk'";
const C = { bg0: "#2B2019", bg1: "#14100D", clay: "#D97757", clay2: "#F0A27E", cream: "#F4EDE4", ink: "#1A1410", mint: "#7FD8B0", mute: "#B9AA9C" };

export const CONNECTORS_FRAMES = 1755;
const SEG = {
  hook: [0, 144],
  plug: [144, 360],
  how: [360, 648],
  ask: [648, 936],
  perm: [936, 1224],
  plans: [1224, 1512],
  end: [1512, 1755],
} as const;
type K = keyof typeof SEG;
const lp = (f: number, k: K) => f - SEG[k][0];
const inSeg = (f: number, k: K) => f >= SEG[k][0] - 2 && f < SEG[k][1] + 2;
const outOf = (f: number, k: K) => 1 - ease(f, SEG[k][1] - 12, 10, OUT);
const iso = (t: string, s?: React.CSSProperties) => <span style={{ direction: "ltr", unicodeBidi: "isolate", fontFamily: EN, fontWeight: 700, whiteSpace: "nowrap", ...s }}>{t}</span>;

const APPS = [
  { id: "gmail", name: "Gmail", file: "gmail.svg" },
  { id: "drive", name: "Google Drive", file: "googledrive.svg" },
  { id: "cal", name: "Google Calendar", file: "googlecalendar.svg" },
  { id: "slack", name: "Slack", file: "slack.svg" },
  { id: "gh", name: "GitHub", file: "github.svg" },
  { id: "ms", name: "Microsoft 365", file: "microsoft.svg" },
];
const ANG = [-150, -90, -30, 30, 90, 150].map((a) => (a * Math.PI) / 180);

/* ───── الخلفية ───── */
const Backdrop: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const photo = 1 - ease(f, SEG.hook[1] - 30, 40, OUT);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 50% at 50% 52%, ${C.bg0} 0%, ${C.bg1} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: "radial-gradient(rgba(244,237,228,.8) 1.5px, transparent 1.6px)", backgroundSize: "40px 40px" }} />
      <div style={{ position: "absolute", left: -240, right: -240, top: 700, height: 620, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(217,119,87,${0.1 + kick * 0.06}), rgba(217,119,87,0))` }} />
      {photo > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: photo }}>
          <Img src={V("desk.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "30% 50%", transform: `scale(${1.15 + f * 0.0014})`, filter: "brightness(.55) saturate(.9)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,16,13,.92) 0%, rgba(20,16,13,.5) 38%, rgba(20,16,13,.3) 60%, rgba(20,16,13,.8) 100%)" }} />
        </div>
      ) : null}
    </>
  );
};

/* ───── العناوين ───── */
type B = { k: K; chip: React.ReactNode; title: React.ReactNode; sub?: React.ReactNode; lines?: number; size?: number };
const TAG = "Claude · Connectors";
const BLOCKS: B[] = [
  { k: "hook", chip: TAG, title: <>Claude ذكي…<br />بس ما يشوف إيميلك</>, sub: "لين توصّله بتطبيقاتك", lines: 2, size: 96 },
  { k: "plug", chip: TAG, title: "مقابس لتطبيقاتك", sub: "يوصل لبياناتك، يجيب منها، وينفّذ فيها", size: 100 },
  { k: "how", chip: "كيف تشغّله؟", title: "ثلاث نقرات", sub: "من الويب أو التطبيق", size: 100 },
  { k: "ask", chip: "جرّبها كذا", title: "سؤال واحد… ثلاث تطبيقات", size: 84 },
  { k: "perm", chip: "الأمان", title: "يشوف اللي تشوفه بس", sub: "يورث صلاحياتك من كل خدمة", size: 92 },
  { k: "plans", chip: "لمين متاحة؟", title: "لكل المستخدمين", sub: "مع فروق بسيطة حسب الباقة", size: 100 },
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
  return (
    <div style={{ position: "absolute", inset: 0, direction: "rtl", opacity: 1 - out, transform: `translateY(${-out * 40}px)` }}>
      <div style={{ position: "absolute", top: 196, right: 80, padding: "6px 22px 10px", borderRadius: 999, background: C.clay, color: C.ink, font: `700 30px ${BODY}`, transform: `scale(${pc})`, transformOrigin: "right center", whiteSpace: "nowrap" }}>{b.chip}</div>
      <div style={{ position: "absolute", top: 256, right: 74, left: 20, overflow: "hidden", padding: "0 6px 12px" }}>
        <div style={{ font: `800 ${size}px/1.3 ${DISPLAY}`, color: C.cream, whiteSpace: "nowrap", transform: `translateY(${(1 - pt) * 110}%)`, textShadow: "0 6px 30px rgba(0,0,0,.55)" }}>{b.title}</div>
      </div>
      {b.sub ? <div style={{ position: "absolute", top: 256 + size * 1.3 * (b.lines ?? 1) + 22, right: 80, left: 40, font: `700 38px/1.5 ${BODY}`, color: "rgba(244,237,228,.88)", opacity: ps, transform: `translateY(${(1 - ps) * 20}px)` }}>{b.sub}</div> : null}
    </div>
  );
};

/* ───── لوحة المقابس ───── */
type HubState = { cx: number; cy: number; r: number; s: number; o: number };
const hubAt = (f: number): HubState => {
  const plugIn = ease(f, SEG.plug[0] - 20, 40, OUT);
  const plugOut = ease(f, SEG.how[0] - 14, 20, IN_OUT);
  const askIn = ease(f, SEG.ask[0] - 10, 30, OUT);
  const askOut = ease(f, SEG.perm[0] - 14, 20, IN_OUT);
  const a: HubState = { cx: 540, cy: 1010, r: 340, s: 1, o: plugIn * (1 - plugOut) };
  const b: HubState = { cx: 540, cy: 1185, r: 232, s: 0.72, o: askIn * (1 - askOut) };
  return f < SEG.how[1] ? a : b;
};
const Hub: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const h = hubAt(f);
  if (h.o <= 0.001) return null;
  const isAsk = f >= SEG.ask[0] - 12;
  const lAsk = lp(f, "ask");
  const active = (id: string) => !isAsk || ["gmail", "drive", "cal"].includes(id);
  const tile = 150 * h.s;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: h.o }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {APPS.map((a, i) => {
          const plugAt = SEG.plug[0] + 30 + i * 18;
          const p = isAsk ? 1 : ease(f, plugAt, 22, OUT);
          const x = h.cx + Math.cos(ANG[i]) * h.r;
          const y = h.cy + Math.sin(ANG[i]) * h.r;
          const mx = h.cx + Math.cos(ANG[i]) * h.r * 0.5 + Math.sin(ANG[i]) * 60;
          const my = h.cy + Math.sin(ANG[i]) * h.r * 0.5 - Math.cos(ANG[i]) * 60;
          const d = `M ${x} ${y} Q ${mx} ${my} ${h.cx} ${h.cy}`;
          const on = active(a.id);
          const live = isAsk ? on && lAsk > 120 : p >= 1;
          return (
            <g key={a.id} opacity={on ? 1 : 0.18}>
              <path d={d} stroke={C.clay} strokeOpacity={0.35} strokeWidth={14 * h.s} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
              <path d={d} stroke={live ? C.clay2 : C.clay} strokeWidth={5 * h.s} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
              {live ? <path d={d} stroke="#FFF4E8" strokeWidth={9 * h.s} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="0.08 0.92" strokeDashoffset={-((f / 40 + i * 0.2) % 1)} /> : null}
            </g>
          );
        })}
      </svg>
      {APPS.map((a, i) => {
        const plugAt = SEG.plug[0] + 30 + i * 18;
        const p = isAsk ? 1 : ease(f, plugAt - 14, 18, BACK);
        const x = h.cx + Math.cos(ANG[i]) * h.r;
        const y = h.cy + Math.sin(ANG[i]) * h.r;
        const on = active(a.id);
        const glow = isAsk && on && lAsk > 120;
        return (
          <div key={a.id} style={{ position: "absolute", left: x - tile / 2, top: y - tile / 2, width: tile, height: tile, opacity: Math.min(1, p) * (on ? 1 : 0.25), transform: `scale(${0.6 + 0.4 * p})` }}>
            <div style={{ width: "100%", height: "100%", borderRadius: 34 * h.s, background: "#fff", display: "grid", placeItems: "center", boxShadow: glow ? `0 0 0 6px ${C.clay2}, 0 0 50px ${C.clay}` : "0 14px 30px rgba(0,0,0,.45)" }}>
              <Img src={V(a.file)} style={{ width: tile * 0.56, height: tile * 0.56, objectFit: "contain" }} />
            </div>
            <div style={{ position: "absolute", top: tile + 8, left: -60, right: -60, textAlign: "center", font: `700 ${24 * h.s + 2}px ${EN}`, color: C.cream, whiteSpace: "nowrap" }}>{a.name}</div>
          </div>
        );
      })}
      {/* Claude في المركز */}
      <div style={{ position: "absolute", left: h.cx - 120 * h.s, top: h.cy - 120 * h.s, width: 240 * h.s, height: 240 * h.s, borderRadius: "50%", background: C.cream, display: "grid", placeItems: "center", boxShadow: `0 0 0 ${10 + kick * 8}px rgba(217,119,87,.35), 0 0 80px rgba(217,119,87,.5)` }}>
        <Img src={V("claude.svg")} style={{ width: 140 * h.s, height: 140 * h.s }} />
      </div>
    </div>
  );
};

/* ───── واجهة عامة لخطوات التفعيل ───── */
const How: React.FC<{ f: number }> = ({ f }) => {
  if (!inSeg(f, "how")) return null;
  const l = lp(f, "how");
  const o = outOf(f, "how") * ease(l, 6, 20, OUT);
  const step = l < 100 ? 0 : l < 190 ? 1 : 2;
  const card: React.CSSProperties = { position: "absolute", left: 70, right: 70, top: 560, height: 560, borderRadius: 34, background: C.cream, boxShadow: "0 30px 70px rgba(0,0,0,.5)", overflow: "hidden", direction: "rtl" };
  const steps = [
    <>في المحادثة: {iso("+")} ← {iso("Connectors")} ← {iso("Manage connectors")}</>,
    <>اختر الموصل ← {iso("Connect")} ← سجّل دخولك</>,
    <>في أي محادثة: {iso("+")} ← {iso("Connectors")} ← فعّله</>,
  ];
  // مؤشر الماوس
  const cur: [number, number][] = [
    [140, 470],
    [230, 300],
    [700, 330],
  ];
  const lc = Math.max(0, l);
  const ci = Math.min(2, Math.floor(lc / 90));
  const ct = ease(lc % 90, 10, 30, IN_OUT);
  const from = cur[Math.max(0, ci - 1)];
  const to = cur[ci];
  const mx = ci === 0 ? to[0] : from[0] + (to[0] - from[0]) * ct;
  const my = ci === 0 ? to[1] : from[1] + (to[1] - from[1]) * ct;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={card}>
        <div style={{ height: 70, background: "#EDE4D8", display: "flex", alignItems: "center", gap: 14, padding: "0 26px" }}>
          <Img src={V("claude.svg")} style={{ height: 34 }} />
          <span style={{ font: `700 26px ${EN}`, color: C.ink }}>Claude</span>
          <span style={{ marginInlineStart: "auto", font: `600 22px ${BODY}`, color: "#8A7B6E" }}>واجهة توضيحية</span>
        </div>
        {/* قائمة + */}
        {step === 0 ? (
          <div style={{ position: "absolute", right: 70, bottom: 120, width: 420, borderRadius: 20, background: "#fff", boxShadow: "0 16px 40px rgba(0,0,0,.18)", padding: 10, opacity: ease(l, 40, 14, OUT) }}>
            {["إضافة ملفات", "Connectors", "Manage connectors"].map((t, i) => (
              <div key={t} style={{ padding: "12px 18px 14px", borderRadius: 12, background: i > 0 && l > 60 + i * 10 ? "#F6E3DA" : "transparent", font: `700 28px ${i ? EN : BODY}`, color: C.ink, direction: i ? "ltr" : "rtl", textAlign: i ? "left" : "right", marginInlineStart: i === 2 ? 30 : 0 }}>{t}</div>
            ))}
          </div>
        ) : null}
        {/* الدليل */}
        {step === 1 ? (
          <div style={{ position: "absolute", left: 30, right: 30, top: 100, display: "flex", flexDirection: "column", gap: 12 }}>
            {APPS.slice(0, 3).map((a, i) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 20px", borderRadius: 18, background: "#fff", direction: "ltr", opacity: ease(l, 100 + i * 8, 12, OUT) }}>
                <Img src={V(a.file)} style={{ width: 54, height: 54 }} />
                <span style={{ font: `700 30px ${EN}`, color: C.ink }}>{a.name}</span>
                <span style={{ marginLeft: "auto", padding: "8px 22px 10px", borderRadius: 12, background: i === 0 && l > 150 ? C.mint : C.ink, color: i === 0 && l > 150 ? C.ink : "#fff", font: `700 24px ${EN}` }}>{i === 0 && l > 150 ? "Connected ✓" : "Connect"}</span>
              </div>
            ))}
          </div>
        ) : null}
        {/* تفعيل في المحادثة */}
        {step === 2 ? (
          <div style={{ position: "absolute", left: 30, right: 30, top: 110, display: "flex", flexDirection: "column", gap: 12 }}>
            {APPS.slice(0, 3).map((a, i) => {
              const on = l > 210 + i * 12;
              return (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 20px", borderRadius: 18, background: "#fff", direction: "ltr" }}>
                  <Img src={V(a.file)} style={{ width: 50, height: 50 }} />
                  <span style={{ font: `700 30px ${EN}`, color: C.ink }}>{a.name}</span>
                  <span style={{ marginLeft: "auto", width: 86, height: 46, borderRadius: 23, background: on ? C.clay : "#D9D0C4", position: "relative" }}>
                    <span style={{ position: "absolute", top: 5, left: on ? 45 : 5, width: 36, height: 36, borderRadius: 18, background: "#fff" }} />
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
        {/* شريط الكتابة */}
        <div style={{ position: "absolute", left: 30, right: 30, bottom: 28, height: 76, borderRadius: 22, background: "#fff", border: "2px solid #E3D8CA", display: "flex", alignItems: "center", padding: "0 18px", gap: 14 }}>
          <span style={{ width: 50, height: 50, borderRadius: 14, background: step === 0 && l < 60 ? C.clay : "#F1E9DF", display: "grid", placeItems: "center", font: `700 34px ${EN}`, color: C.ink }}>+</span>
          <span style={{ font: `600 26px ${BODY}`, color: "#9C8E80" }}>اكتب رسالتك…</span>
        </div>
        {/* المؤشر */}
        <svg width={40} height={50} viewBox="0 0 40 50" style={{ position: "absolute", left: mx, top: my, filter: "drop-shadow(0 4px 6px rgba(0,0,0,.3))" }}>
          <path d="M2 2 L2 40 L12 30 L19 46 L26 43 L19 28 L33 28 Z" fill={C.ink} stroke="#fff" strokeWidth={3} />
        </svg>
      </div>
      <div style={{ position: "absolute", top: 1150, left: 56, right: 56, display: "flex", flexDirection: "column", gap: 12, direction: "rtl" }}>
        {steps.map((t, i) => {
          const p = ease(l, 20 + i * 90, 14, BACK);
          const on = i === step;
          return (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", padding: "10px 20px 14px", borderRadius: 18, background: on ? C.clay : "rgba(244,237,228,.08)", border: `2px solid ${on ? C.clay : "rgba(244,237,228,.2)"}`, color: on ? C.ink : C.cream, font: `700 29px/1.4 ${BODY}`, opacity: Math.min(1, p * 1.5), transform: `scale(${0.9 + 0.1 * p})` }}>
              <span style={{ flex: "none", width: 44, height: 44, borderRadius: 22, display: "grid", placeItems: "center", background: on ? C.ink : "rgba(244,237,228,.15)", color: on ? C.clay : C.cream, font: `700 24px ${EN}` }}>{i + 1}</span>
              <span>{t}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ───── مثال السؤال ───── */
const Ask: React.FC<{ f: number }> = ({ f }) => {
  if (!inSeg(f, "ask")) return null;
  const l = lp(f, "ask");
  const o = outOf(f, "ask");
  const q = "وش اجتماعاتي بكرة؟ وجيب آخر إيميل من العميل عن العقد، وملف عرض السعر من Drive";
  const shown = typed(q, l, 24, 80);
  const chips: [string, string, number][] = [
    ["googlecalendar.svg", "من التقويم: اجتماعات بكرة", 140],
    ["gmail.svg", "من Gmail: آخر إيميل عن العقد", 162],
    ["googledrive.svg", "من Drive: ملف عرض السعر", 184],
  ];
  return (
    <div style={{ position: "absolute", inset: 0, direction: "rtl", opacity: o }}>
      <div style={{ position: "absolute", top: 420, right: 70, left: 120, padding: "20px 28px 24px", borderRadius: "30px 30px 6px 30px", background: C.cream, color: C.ink, font: `700 33px/1.5 ${BODY}`, opacity: ease(l, 14, 14, OUT), minHeight: 150 }}>
        {shown}
        <span style={{ opacity: l < 104 && Math.floor(l / 8) % 2 ? 1 : 0 }}>|</span>
      </div>
      <div style={{ position: "absolute", top: 640, right: 70, left: 70, display: "flex", flexDirection: "column", gap: 10 }}>
        {chips.map(([img, t, at]) => {
          const p = ease(l, at, 14, BACK);
          return (
            <div key={img} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 20px 12px", borderRadius: 18, background: "rgba(26,20,16,.85)", border: `2px solid ${C.clay}`, color: C.cream, font: `700 29px ${BODY}`, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * -40}px)` }}>
              <span style={{ width: 52, height: 52, borderRadius: 12, background: "#fff", display: "grid", placeItems: "center" }}>
                <Img src={V(img)} style={{ width: 34, height: 34 }} />
              </span>
              {t}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 1530, left: 0, right: 0, textAlign: "center", font: `600 24px ${BODY}`, color: C.mute, opacity: ease(l, 200, 14, OUT) }}>مثال توضيحي · يحتاج الموصلات الثلاثة مفعّلة</div>
    </div>
  );
};

/* ───── الصلاحيات ───── */
const Perm: React.FC<{ f: number }> = ({ f }) => {
  if (!inSeg(f, "perm")) return null;
  const l = lp(f, "perm");
  const o = outOf(f, "perm");
  const files = Array.from({ length: 12 }, (_, i) => ({ locked: [1, 4, 6, 9, 11].includes(i) }));
  const scan = ease(l, 50, 70, IN_OUT);
  return (
    <div style={{ position: "absolute", inset: 0, direction: "rtl", opacity: o }}>
      <div style={{ position: "absolute", top: 560, left: 110, right: 110, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22 }}>
        {files.map((x, i) => {
          const p = ease(l, 10 + i * 4, 14, BACK);
          const seen = !x.locked && scan * 12 > i;
          return (
            <div key={i} style={{ height: 150, borderRadius: 18, position: "relative", background: x.locked ? "rgba(244,237,228,.08)" : seen ? C.cream : "rgba(244,237,228,.55)", border: x.locked ? "2px dashed rgba(244,237,228,.35)" : `2px solid ${seen ? C.clay : "transparent"}`, opacity: Math.min(1, p * 1.5), transform: `scale(${0.8 + 0.2 * p})`, display: "grid", placeItems: "center", boxShadow: seen ? `0 0 30px rgba(217,119,87,.45)` : "none" }}>
              {x.locked ? (
                <svg width={56} height={64} viewBox="0 0 56 64">
                  <rect x={6} y={28} width={44} height={32} rx={8} fill="rgba(244,237,228,.55)" />
                  <path d="M16 28 V20 a12 12 0 0 1 24 0 V28" stroke="rgba(244,237,228,.55)" strokeWidth={6} fill="none" />
                </svg>
              ) : (
                <div style={{ width: 70, display: "flex", flexDirection: "column", gap: 8 }}>
                  {[1, 0.7, 0.85].map((w, j) => (
                    <div key={j} style={{ height: 8, width: `${w * 100}%`, borderRadius: 4, background: seen ? C.clay : "rgba(26,20,16,.35)" }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 1100, right: 70, left: 70, display: "flex", gap: 18, opacity: ease(l, 120, 14, OUT) }}>
        <div style={{ flex: 1, padding: "12px 18px 16px", borderRadius: 18, background: C.cream, color: C.ink, font: `700 28px/1.4 ${BODY}`, textAlign: "center" }}>ملفات تقدر تفتحها<br /><b style={{ color: "#B9572F" }}>Claude يقدر</b></div>
        <div style={{ flex: 1, padding: "12px 18px 16px", borderRadius: 18, border: "2px dashed rgba(244,237,228,.45)", color: C.cream, font: `700 28px/1.4 ${BODY}`, textAlign: "center" }}>ملفات مقفولة عليك<br /><b style={{ color: C.clay2 }}>مقفولة عليه بعد</b></div>
      </div>
      <div style={{ position: "absolute", top: 1272, right: 56, left: 56, padding: "14px 24px 18px", borderRadius: 20, background: "rgba(26,20,16,.85)", border: `2px solid ${C.clay}99`, color: C.cream, font: `700 29px/1.45 ${BODY}`, opacity: ease(l, 190, 16, OUT) }}>
        وصّل بس الخدمات اللي تثق فيها، وراجع الصلاحيات قبل ما تعطي الإذن
      </div>
    </div>
  );
};

/* ───── الباقات ───── */
const Plans: React.FC<{ f: number }> = ({ f }) => {
  if (!inSeg(f, "plans")) return null;
  const l = lp(f, "plans");
  const o = outOf(f, "plans");
  const rows: [React.ReactNode, React.ReactNode, number][] = [
    [<>الموصلات الجاهزة</>, <>متاحة لكل المستخدمين: الويب وسطح المكتب والجوال</>, 30],
    [<>{iso("Team")} و {iso("Enterprise")}</>, <>المالك يضيف الموصل للمنظمة أول ({iso("Add to your team")})، وبعدها كل شخص يسجّل دخوله بنفسه</>, 90],
    [<>الموصلات المخصّصة</>, <>متاحة في كل الباقات، والمجانية موصل مخصّص واحد بس</>, 150],
  ];
  return (
    <div style={{ position: "absolute", inset: 0, direction: "rtl", opacity: o }}>
      <div style={{ position: "absolute", top: 600, right: 60, left: 60, display: "flex", flexDirection: "column", gap: 20 }}>
        {rows.map(([h, t, at], i) => {
          const p = ease(l, at, 14, BACK);
          return (
            <div key={i} style={{ padding: "18px 26px 22px", borderRadius: 24, background: i === 0 ? C.cream : "rgba(244,237,228,.08)", border: `2px solid ${i === 0 ? C.cream : "rgba(244,237,228,.22)"}`, color: i === 0 ? C.ink : C.cream, opacity: Math.min(1, p * 1.5), transform: `scale(${0.9 + 0.1 * p})` }}>
              <div style={{ font: `800 42px/1.3 ${DISPLAY}`, color: i === 0 ? "#B9572F" : C.clay2 }}>{h}</div>
              <div style={{ font: `700 30px/1.45 ${BODY}`, marginTop: 4 }}>{t}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 1330, left: 56, right: 56, textAlign: "center", font: `700 28px/1.4 ${BODY}`, color: C.mute, opacity: ease(l, 210, 16, OUT) }}>
        عندك {iso("10")} موصلات أو أكثر؟ خلّ {iso("Tool access")} على {iso("On demand")}
      </div>
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
      <div style={{ position: "absolute", top: 230, left: 0, right: 0, font: `800 84px/1.3 ${DISPLAY}`, color: C.cream, opacity: pt, transform: `translateY(${(1 - pt) * 30}px)` }}>
        وصّل أول تطبيق
        <br />
        <span style={{ color: C.clay }}>وخلّه يشتغل على بياناتك</span>
        <div style={{ font: `700 38px/1.5 ${BODY}`, color: "rgba(244,237,228,.88)" }}>احفظها وجرّبها اليوم</div>
      </div>
      <div style={{ position: "absolute", top: 700, left: 540 - 230, width: 460, height: 460, borderRadius: "50%", padding: 16, background: `conic-gradient(${C.clay}, ${C.cream}, ${C.clay})`, transform: `scale(${pa})`, boxShadow: `0 0 ${60 + kick * 30}px rgba(217,119,87,.45)` }}>
        <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: C.bg0 }}>
          <Img src={staticFile("avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%" }} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 1200, left: 0, right: 0, font: `700 84px/1.3 ${BODY}`, color: C.cream, opacity: pn, transform: `translateY(${(1 - pn) * 30}px)` }}>علي التميمي</div>
      <div style={{ position: "absolute", top: 1318, left: 0, right: 0, font: `700 34px/1.4 ${BODY}`, color: C.mute, opacity: pc }}>كل يوم ميزة ذكاء اصطناعي تختصر شغلك</div>
      <div style={{ position: "absolute", top: 1392, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${ph})` }}>
        <div style={{ padding: "10px 32px", borderRadius: 999, background: C.clay }}>
          <HandlesRow size={30} color={C.ink} />
        </div>
      </div>
    </div>
  );
};
const Footer: React.FC<{ f: number }> = ({ f }) => {
  const o = ease(f, 8, 12) * (1 - ease(f, SEG.end[0], 10)) * (1 - ease(f, SEG.ask[0] - 10, 10) * (1 - ease(f, SEG.perm[0] - 4, 10)));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 1490, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ padding: "8px 24px", borderRadius: 999, background: "rgba(0,0,0,.55)", border: "1px solid rgba(255,255,255,.15)" }}>
        <HandlesRow size={26} color="#fff" />
      </div>
    </div>
  );
};

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { kick } = useMusic();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: C.bg1 }}>
      <Backdrop f={f} kick={kick} />
      {/* الهوك: Claude وحيد بمقابس فاضية */}
      {f < SEG.hook[1] + 4 ? (
        <div style={{ position: "absolute", left: 540 - 130, top: 900, width: 260, height: 260, borderRadius: "50%", background: C.cream, display: "grid", placeItems: "center", opacity: ease(f, 40, 16, OUT) * (1 - ease(f, SEG.hook[1] - 20, 16, OUT)), transform: `scale(${0.8 + 0.2 * ease(f, 40, 20, BACK)})`, boxShadow: "0 0 0 10px rgba(217,119,87,.3), 0 0 70px rgba(217,119,87,.4)" }}>
          <Img src={V("claude.svg")} style={{ width: 150, height: 150 }} />
          {ANG.map((ag, i) => (
            <div key={i} style={{ position: "absolute", left: 130 + Math.cos(ag) * 200 - 22, top: 130 + Math.sin(ag) * 200 - 22, width: 44, height: 44, borderRadius: 22, border: "3px dashed rgba(244,237,228,.6)", opacity: ease(f, 70 + i * 4, 10, OUT) }} />
          ))}
        </div>
      ) : null}
      <Hub f={f} kick={kick} />
      <How f={f} />
      <Ask f={f} />
      <Perm f={f} />
      <Plans f={f} />
      {BLOCKS.map((b) => (
        <Block key={b.k} f={f} b={b} />
      ))}
      <End f={f} kick={kick} />
      <Footer f={f} />
    </AbsoluteFill>
  );
};
const st = (k: K) => SEG[k][0];

export const Connectors: React.FC = () => (
  <MusicProvider src="videos/connectors/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={2} volume={0.16} />
    <Sfx name="pop" at={42} volume={0.14} />
    <Sfx name="riser" at={st("plug") - SFX_RISER_PEAK} volume={0.12} />
    <Sfx name="impact" at={st("plug")} volume={0.24} />
    {APPS.map((_, i) => (
      <Sfx key={i} name="click" at={st("plug") + 30 + i * 18 + 18} volume={0.16} />
    ))}
    {(["how", "ask", "perm", "plans", "end"] as K[]).map((k) => (
      <span key={k}>
        <Sfx name="whoosh_fast" at={st(k) - 12} volume={0.16} />
        {k !== "end" ? <Sfx name="impact" at={st(k)} volume={0.14} /> : null}
      </span>
    ))}
    <Sfx name="click" at={st("how") + 40} volume={0.18} />
    <Sfx name="click" at={st("how") + 130} volume={0.18} />
    <Sfx name="success" at={st("how") + 152} volume={0.14} />
    {[210, 222, 234].map((d) => (
      <Sfx key={d} name="click" at={st("how") + d} volume={0.14} />
    ))}
    <Sfx name="typing" at={st("ask") + 24} volume={0.12} />
    {[140, 162, 184].map((d) => (
      <Sfx key={d} name="pop" at={st("ask") + d} volume={0.13} />
    ))}
    <Sfx name="whoosh_soft" at={st("perm") + 50} volume={0.14} />
    <Sfx name="success" at={st("perm") + 120} volume={0.12} />
    {[30, 90, 150].map((d) => (
      <Sfx key={d} name="pop" at={st("plans") + d} volume={0.12} />
    ))}
    <Sfx name="success" at={st("end") + 30} volume={0.18} />
    <Sfx name="pop" at={st("end") + 76} volume={0.14} />
  </MusicProvider>
);
