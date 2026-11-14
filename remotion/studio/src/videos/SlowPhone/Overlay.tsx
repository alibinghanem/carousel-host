import React from "react";
import { Img } from "remotion";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { DIAL_P, projectW } from "./Scene3D";
import { BACK, BG, BODY, C, DISPLAY, EN, IN, OUT, SEG, SegK, V, ease } from "./theme";

export const TAG = "تقنية · جوال بطيء";
const iso = (t: string, s?: React.CSSProperties) => <span style={{ direction: "ltr", unicodeBidi: "isolate", fontFamily: EN, fontWeight: 700, whiteSpace: "nowrap", ...s }}>{t}</span>;
const KEYS = Object.keys(SEG) as SegK[];
const lp = (f: number, k: SegK) => f - SEG[k][0];
const inSeg = (f: number, k: SegK) => f >= SEG[k][0] - 2 && f < SEG[k][1] + 2;
const outOf = (f: number, k: SegK) => 1 - ease(f, SEG[k][1] - 12, 10, OUT);
const mixHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) + (((pb >> s) & 255) - ((pa >> s) & 255)) * t);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};

/* ───── الخلفية: صورة جوال حقيقية بتطبيقات كثيرة في الهوك، وتدرّجات بعدها ───── */
export const Backdrop: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  let c0 = BG.hook[0];
  let c1 = BG.hook[1];
  for (let i = 1; i < KEYS.length; i++) {
    const t = ease(f, SEG[KEYS[i]][0] - 15, 30, OUT);
    if (t <= 0) break;
    c0 = mixHex(BG[KEYS[i - 1]][0], BG[KEYS[i]][0], t);
    c1 = mixHex(BG[KEYS[i - 1]][1], BG[KEYS[i]][1], t);
  }
  const photo = 1 - ease(f, SEG.hook[1] - 40, 40, OUT);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 45% at 50% 55%, ${c0} 0%, ${c1} 100%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 330, opacity: 0.09 + kick * 0.04, backgroundImage: "repeating-linear-gradient(90deg, #B6F24A 0 6px, transparent 6px 54px)", WebkitMaskImage: "linear-gradient(0deg, #000, transparent)", maskImage: "linear-gradient(0deg, #000, transparent)" }} />
      {photo > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: photo }}>
          <Img src={V("bg.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "55% 45%", transform: `scale(${1.25 + f * 0.0012})`, filter: "brightness(.5) contrast(1.1) saturate(.9) blur(2px)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,18,20,.92) 0%, rgba(6,18,20,.5) 36%, rgba(6,18,20,.4) 62%, rgba(6,18,20,.9) 100%)" }} />
        </div>
      ) : null}
    </>
  );
};

/* ───── العناوين ───── */
type B = { k: SegK; chip: React.ReactNode; title: React.ReactNode; sub: React.ReactNode; color: string; lines?: number; size?: number };
const BLOCKS: B[] = [
  { k: "hook", chip: TAG, title: <>جوالك يعلّق؟<br />مو لازم تغيّره</>, sub: "جرّب هذي الحلول قبل لا تشتري جديد", color: C.lime, lines: 2, size: 108 },
  { k: "storage", chip: "الخطوة 1 · التخزين", title: "فضّي مساحة", sub: "التخزين الممتلئ يبطّئ الجوال", color: C.pink, size: 112 },
  { k: "restart", chip: "الخطوة 2 · إعادة التشغيل", title: "أعد تشغيله", sub: "يفرّغ الذاكرة ويقفل اللي علّق", color: C.lime, size: 112 },
  { k: "update", chip: "الخطوة 3 · التحديث", title: "حدّث النظام", sub: "تأكد إنه على آخر إصدار", color: C.cyan, size: 112 },
  { k: "heat", chip: "الخطوة 4 · الحرارة والبطارية", title: "حرارة وبطارية", sub: "تبطّئ الجوال لو زادت أو ضعفت", color: C.org, size: 108 },
  { k: "sum", chip: "الخلاصة", title: "4 خطوات بالترتيب", sub: "", color: C.lime, size: 104 },
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
  const lines = b.lines ?? 1;
  const size = b.size ?? 100;
  return (
    <div style={{ position: "absolute", inset: 0, direction: "rtl", opacity: 1 - out, transform: `translateY(${-out * 40}px)` }}>
      <div style={{ position: "absolute", top: 196, right: 80, padding: "6px 22px 10px", borderRadius: 999, background: b.color, color: C.ink, font: `700 30px ${BODY}`, transform: `scale(${pc})`, transformOrigin: "right center", whiteSpace: "nowrap", boxShadow: `0 0 30px ${b.color}55` }}>{b.chip}</div>
      <div style={{ position: "absolute", top: 256, right: 74, left: 20, overflow: "hidden", padding: "0 6px 12px" }}>
        <div style={{ font: `900 ${size}px/1.3 ${DISPLAY}`, color: "#fff", whiteSpace: "nowrap", transform: `translateY(${(1 - pt) * 110}%)`, textShadow: "0 6px 30px rgba(0,0,0,.55)" }}>{b.title}</div>
      </div>
      {b.sub ? (
        <div style={{ position: "absolute", top: 256 + size * 1.3 * lines + 20, right: 80, left: 40, font: `700 38px/1.5 ${BODY}`, color: "rgba(255,255,255,.9)", opacity: ps, transform: `translateY(${(1 - ps) * 20}px)`, textShadow: "0 3px 16px rgba(0,0,0,.6)" }}>{b.sub}</div>
      ) : null}
    </div>
  );
};
export const Titles: React.FC<{ f: number }> = ({ f }) => (
  <>
    {BLOCKS.map((b) => (
      <Block key={b.k} f={f} b={b} />
    ))}
  </>
);

/* ───── ملصقات وبطاقات ───── */
const Tag: React.FC<{ x: number; y: number; p: number; bg: string; fg?: string; children: React.ReactNode; size?: number }> = ({ x, y, p, bg, fg = C.ink, children, size = 30 }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${p})`, padding: "7px 20px 11px", borderRadius: 16, background: bg, color: fg, font: `700 ${size}px ${BODY}`, whiteSpace: "nowrap", direction: "rtl", boxShadow: "0 10px 30px rgba(0,0,0,.4)" }}>
      {children}
    </div>
  );
const Note: React.FC<{ p: number; color: string; top: number; children: React.ReactNode; left?: number; right?: number; size?: number }> = ({ p, color, top, children, left = 56, right = 56, size = 30 }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", top, left, right, padding: "16px 26px 20px", borderRadius: 20, background: "rgba(6,18,20,.9)", border: `2px solid ${color}aa`, color: "#fff", font: `700 ${size}px/1.45 ${BODY}`, direction: "rtl", opacity: p, transform: `translateY(${(1 - p) * 26}px)` }}>
      {children}
    </div>
  );
const List: React.FC<{ l: number; o: number; items: React.ReactNode[]; step: number; color: string; top?: number; right?: number; width?: number; at?: number; gap?: number }> = ({ l, o, items, step, color, top = 640, right = 40, width = 480, at = 24, gap = 52 }) => (
  <div style={{ position: "absolute", top, right, width, display: "flex", flexDirection: "column", gap: 12, direction: "rtl" }}>
    {items.map((t, i) => {
      const p = ease(l, at + i * gap, 14, BACK) * o;
      const on = i === step;
      return (
        <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 18px 16px", borderRadius: 20, background: on ? color : "rgba(255,255,255,.09)", color: on ? C.ink : "#fff", border: `2px solid ${on ? color : "rgba(255,255,255,.2)"}`, font: `700 27px/1.42 ${BODY}`, opacity: Math.min(1, p * 1.5), transform: `scale(${0.88 + 0.12 * p})`, boxShadow: on ? `0 0 34px ${color}66` : "none" }}>
          <span style={{ flex: "none", width: 42, height: 42, borderRadius: 21, display: "grid", placeItems: "center", background: on ? C.ink : "rgba(255,255,255,.16)", color: on ? color : "#fff", font: `700 24px ${EN}` }}>{i + 1}</span>
          <span>{t}</span>
        </div>
      );
    })}
  </div>
);

export const Labels: React.FC<{ f: number }> = ({ f }) => {
  const out: React.ReactNode[] = [];
  if (inSeg(f, "hook")) {
    const l = lp(f, "hook");
    const o = outOf(f, "hook");
    const [x, y] = projectW(f, [DIAL_P.hook[0], DIAL_P.hook[1] - 1.72, 0.4]);
    out.push(
      <Tag key="slow" x={x} y={y} p={ease(l, 36, 14, BACK) * o} bg={C.red} fg="#fff" size={32}>
        بطيء!
      </Tag>,
    );
    out.push(
      <Note key="n" p={ease(l, 130, 16, OUT) * o} color={C.lime} top={1330}>
        4 خطوات جرّبها <b style={{ color: C.lime }}>بالترتيب</b>، ومعها المسارات اللي تحتاجها
      </Note>,
    );
  }
  if (inSeg(f, "storage")) {
    const l = lp(f, "storage");
    const o = outOf(f, "storage");
    const step = l < 100 ? 0 : l < 170 ? 1 : 2;
    out.push(
      <List
        key="l"
        l={l}
        o={o}
        step={step}
        color={C.pink}
        width={490}
        items={[
          <><b>اترك مساحة فاضية:</b> {iso("Apple")} تنصح بـ{iso("1GB")} على الأقل، و{iso("Google")} تنبّه لمشاكل لو بقي أقل من {iso("10%")}</>,
          <><b>شوف وش ياكلها:</b> آيفون: الإعدادات ← عام ← تخزين {iso("iPhone")}. أندرويد: الإعدادات ← التخزين</>,
          <><b>احذف أو أفرّغ التطبيق</b> ({iso("Offload")}): يحذف التطبيق ويحتفظ بمستنداته وبياناته</>,
        ]}
      />,
    );
    out.push(
      <Note key="n" p={ease(l, 220, 16, OUT) * o} color={C.pink} top={1300} size={28}>
        المسميات والمسارات تختلف حسب الشركة وإصدار النظام
      </Note>,
    );
  }
  if (inSeg(f, "restart")) {
    const l = lp(f, "restart");
    const o = outOf(f, "restart");
    const step = l < 90 ? 0 : l < 170 ? 1 : 2;
    out.push(
      <List
        key="l"
        l={l}
        o={o}
        step={step}
        color={C.lime}
        width={490}
        items={[
          <><b>أطفئه ثم شغّله</b> من القائمة، وانتظر لين يكمل الإقلاع</>,
          <>{iso("Samsung")}: إعادة التشغيل تنظّف الذاكرة <b>أكثر من</b> إغلاق التطبيقات</>,
          <>{iso("Google")}: أعد التشغيل <b>بعد كل خطوة</b> تجرّبها وشوف هل تحسّن</>,
        ]}
      />,
    );
    out.push(
      <Note key="n" p={ease(l, 220, 16, OUT) * o} color={C.lime} top={1300} size={28}>
        لا تقفل التطبيقات كل شوي… اقفل التطبيق بس <b style={{ color: C.lime }}>لو علّق</b>
      </Note>,
    );
  }
  if (inSeg(f, "update")) {
    const l = lp(f, "update");
    const o = outOf(f, "update");
    const step = l < 90 ? 0 : l < 170 ? 1 : 2;
    out.push(
      <List
        key="l"
        l={l}
        o={o}
        step={step}
        color={C.cyan}
        width={490}
        items={[
          <><b>آيفون:</b> الإعدادات ← عام ← تحديث البرنامج</>,
          <><b>{iso("Pixel")}:</b> الإعدادات ← النظام ← {iso("Software updates")} ← {iso("System update")}</>,
          <><b>{iso("Samsung")}:</b> تأكد من آخر إصدار <b>قبل أي حل ثاني</b></>,
        ]}
      />,
    );
    out.push(
      <Note key="n" p={ease(l, 220, 16, OUT) * o} color={C.cyan} top={1300} size={27}>
        بعد تحديث كبير قد تزيد الحرارة وصرف البطارية كم يوم: {iso("Apple")} تنصح تنتظر وترجع تشيّك
      </Note>,
    );
  }
  if (inSeg(f, "heat")) {
    const l = lp(f, "heat");
    const o = outOf(f, "heat");
    const step = l < 90 ? 0 : l < 170 ? 1 : 2;
    out.push(
      <List
        key="l"
        l={l}
        o={o}
        step={step}
        color={C.org}
        width={490}
        items={[
          <><b>الحرارة تبطّئه:</b> شيل الكفر وانقله لمكان أبرد</>,
          <><b>آيفون:</b> الإعدادات ← البطارية ← صحة البطارية</>,
          <><b>بطارية مهترئة؟</b> غيّرها عند مركز صيانة معتمد</>,
        ]}
      />,
    );
    out.push(
      <Note key="n" p={ease(l, 220, 16, OUT) * o} color={C.org} top={1300} size={28}>
        {iso("Apple")} تذكر الحرارة وتآكل البطارية من أسباب بطء الجوال
      </Note>,
    );
  }
  if (inSeg(f, "sum")) {
    const l = lp(f, "sum");
    const o = outOf(f, "sum");
    const rows: [string, string][] = [
      ["مساحة فاضية", C.pink],
      ["إعادة تشغيل", C.lime],
      ["تحديث النظام", C.cyan],
      ["حرارة وبطارية", C.org],
    ];
    out.push(
      <div key="chips" style={{ position: "absolute", top: 1245, left: 60, right: 60, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, direction: "rtl" }}>
        {rows.map(([t, c], i) => {
          const p = ease(l, 20 + i * 18, 14, BACK) * o;
          return (
            <div key={i} style={{ padding: "14px 18px 18px", borderRadius: 20, background: "rgba(6,18,20,.9)", border: `2px solid ${c}`, color: "#fff", font: `800 34px ${BODY}`, display: "flex", gap: 12, alignItems: "center", opacity: Math.min(1, p * 1.5), transform: `scale(${0.85 + 0.15 * p})` }}>
              <span style={{ flex: "none", width: 40, height: 40, borderRadius: 20, background: c, color: C.ink, display: "grid", placeItems: "center", font: `800 26px ${BODY}` }}>✓</span>
              {t}
            </div>
          );
        })}
      </div>,
    );
  }
  return <>{out}</>;
};

/* ───── الختام ───── */
export const End: React.FC<{ f: number }> = ({ f }) => {
  const [a] = SEG.end;
  if (f < a + 10) return null;
  const pt = ease(f, a + 20, 18, OUT);
  const pn = ease(f, a + 46, 18, OUT);
  const pc = ease(f, a + 62, 18, OUT);
  const ph = ease(f, a + 76, 18, BACK);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, direction: "rtl", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 210, left: 0, right: 0, font: `900 90px/1.3 ${DISPLAY}`, color: "#fff", opacity: pt, transform: `translateY(${(1 - pt) * 30}px)`, textShadow: "0 6px 30px rgba(0,0,0,.6)" }}>
        قبل ما تغيّر جوالك…
        <br />
        <span style={{ color: C.lime }}>جرّب هذي الأربع</span>
        <div style={{ font: `700 38px/1.4 ${BODY}`, color: "#E1F7C2" }}>أرسلها لصاحبك اللي جواله يعلّق</div>
      </div>
      <div style={{ position: "absolute", top: 1290, left: 0, right: 0, font: `700 84px/1.3 ${BODY}`, color: "#fff", opacity: pn, transform: `translateY(${(1 - pn) * 30}px)`, textShadow: "0 6px 30px rgba(0,0,0,.6)" }}>علي التميمي</div>
      <div style={{ position: "absolute", top: 1400, left: 0, right: 0, font: `700 34px/1.4 ${BODY}`, color: "rgba(255,255,255,.88)", opacity: pc }}>كل يوم معلومة تقنية تهمّك</div>
      <div style={{ position: "absolute", top: 1462, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${ph})` }}>
        <div style={{ padding: "10px 32px", borderRadius: 999, background: C.grad }}>
          <HandlesRow size={30} color="#0A1416" />
        </div>
      </div>
    </div>
  );
};
export const Footer: React.FC<{ f: number }> = ({ f }) => {
  const o = ease(f, 8, 12) * (1 - ease(f, SEG.end[0], 10));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 1490, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ padding: "8px 24px", borderRadius: 999, background: "rgba(0,0,0,.55)", border: "1px solid rgba(255,255,255,.15)" }}>
        <HandlesRow size={26} color="#fff" />
      </div>
    </div>
  );
};
export const Shade: React.FC = () => <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 620, background: "linear-gradient(180deg, rgba(0,0,0,.5), rgba(0,0,0,0))" }} />;
