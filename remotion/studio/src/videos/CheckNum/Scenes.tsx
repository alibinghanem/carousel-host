import React from "react";
import { Img, staticFile } from "remotion";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { BACK, BG, BODY, C, DISPLAY, EN, IN, MONO, OUT, SEG, SegK, V, clamp01, ease, typed } from "./theme";

export const TAG = "أتمتة · دقّق الأرقام";
export const iso = (t: string, s?: React.CSSProperties) => <span style={{ direction: "ltr", unicodeBidi: "isolate", fontFamily: EN, fontWeight: 700, whiteSpace: "nowrap", ...s }}>{t}</span>;
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
const shadow = "0 18px 40px rgba(0,0,0,.45)";

/* ───── الخلفية: صورة لوحة مؤشرات حقيقية في الهوك + شبكة ورق ملّي ───── */
export const Backdrop: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  let c0 = BG.hook[0];
  let c1 = BG.hook[1];
  for (let i = 1; i < KEYS.length; i++) {
    const t = ease(f, SEG[KEYS[i]][0] - 15, 30, OUT);
    if (t <= 0) break;
    c0 = mixHex(BG[KEYS[i - 1]][0], BG[KEYS[i]][0], t);
    c1 = mixHex(BG[KEYS[i - 1]][1], BG[KEYS[i]][1], t);
  }
  const photo = (1 - ease(f, SEG.hook[1] - 50, 40, OUT)) * 0.5;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 50% at 50% 50%, ${c0} 0%, ${c1} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.16 + kick * 0.05, backgroundImage: "linear-gradient(rgba(215,243,74,.5) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(215,243,74,.5) 1.5px, transparent 1.5px)", backgroundSize: "54px 54px" }} />
      {photo > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: photo }}>
          <Img src={V("bg.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "45% 50%", transform: `scale(${1.6 + f * 0.0012})`, filter: "brightness(.55) contrast(1.1) saturate(.9)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,13,7,.92) 0%, rgba(11,13,7,.5) 36%, rgba(11,13,7,.45) 62%, rgba(11,13,7,.92) 100%)" }} />
        </div>
      ) : null}
    </>
  );
};

/* ───── العناوين ───── */
type B = { k: SegK; chip: React.ReactNode; title: React.ReactNode; sub: React.ReactNode; color: string; lines?: number; size?: number };
const BLOCKS: B[] = [
  { k: "hook", chip: TAG, title: <>رقم طلع لك؟<br />لا تصدّقه بسرعة</>, sub: "ثلاث خطوات تدقّق فيها أي رقم", color: C.lime, lines: 2, size: 104 },
  { k: "src", chip: "السؤال 1 · المصدر", title: "من وين الرقم؟", sub: "الملف والورقة والخانة بالضبط", color: C.cyan, size: 108 },
  { k: "how", chip: "السؤال 2 · طريقة الحساب", title: "كيف انحسب؟", sub: "خطوة بخطوة، مو بس الناتج", color: C.amb, size: 112 },
  { k: "smp", chip: "السؤال 3 · عيّنة صغيرة", title: "جرّب بنفسك", sub: "أعد حساب أسطر قليلة بيدك", color: C.lime, size: 112 },
  { k: "bad", chip: "لو ما طابق", title: "وين الخلل؟", sub: "أسباب شائعة (أمثلة)", color: C.red, size: 112 },
  { k: "sum", chip: "الخلاصة", title: "اعتمد الرقم بعد الفحص", sub: "", color: C.lime, size: 78 },
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
      {b.sub ? <div style={{ position: "absolute", top: 256 + size * 1.3 * lines + 18, right: 80, left: 40, font: `700 38px/1.5 ${BODY}`, color: "rgba(255,255,255,.88)", opacity: ps, transform: `translateY(${(1 - ps) * 20}px)`, textShadow: "0 3px 16px rgba(0,0,0,.6)" }}>{b.sub}</div> : null}
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

/* ───── عناصر مشتركة ───── */
const Note: React.FC<{ p: number; color: string; top: number; children: React.ReactNode; size?: number }> = ({ p, color, top, children, size = 28 }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", top, left: 56, right: 56, padding: "14px 26px 18px", borderRadius: 20, background: "rgba(11,13,7,.9)", border: `2px solid ${color}aa`, color: "#fff", font: `700 ${size}px/1.45 ${BODY}`, direction: "rtl", opacity: p, transform: `translateY(${(1 - p) * 26}px)` }}>{children}</div>
  );
const Badge: React.FC<{ n: number | string; p: number; color: string; style?: React.CSSProperties }> = ({ n, p, color, style }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", width: 56, height: 56, borderRadius: 28, background: color, color: C.ink, display: "grid", placeItems: "center", font: `800 30px ${EN}`, transform: `scale(${p})`, boxShadow: "0 8px 20px rgba(0,0,0,.4)", ...style }}>{n}</div>
  );
const Bubble: React.FC<{ p: number; top: number; color: string; text: string; typedAt?: number; l: number }> = ({ p, top, color, text, typedAt = 0, l }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", top, right: 70, left: 70, padding: "18px 28px 22px", borderRadius: "30px 30px 8px 30px", background: color, color: C.ink, font: `800 36px/1.5 ${BODY}`, direction: "rtl", opacity: p, transform: `translateY(${(1 - p) * 30}px)`, boxShadow: shadow }}>
      {typed(text, l, typedAt, 60)}
    </div>
  );

/** إيصال حراري: يطلع من فوق ويطبع الأسطر. rows: [اسم، مبلغ] */
const Receipt: React.FC<{ w: number; rows: [string, string][]; total: string; shown: number; ring?: number; stamp?: number; slim?: boolean }> = ({ w, rows, total, shown, ring = 0, stamp = 0, slim }) => {
  const tooth = `radial-gradient(circle at 12px 0, transparent 9px, ${C.paper} 10px) 0 100% / 24px 14px repeat-x`;
  return (
    <div style={{ width: w, background: C.paper, color: C.ink, padding: slim ? "20px 22px 34px" : "26px 28px 40px", borderRadius: "6px 6px 0 0", boxShadow: shadow, position: "relative", direction: "rtl" }}>
      <div style={{ textAlign: "center", font: `900 30px ${DISPLAY}`, borderBottom: `3px dashed ${C.ink}`, paddingBottom: 10 }}>تقرير المبيعات</div>
      {rows.map(([a, b], i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, font: `700 ${slim ? 24 : 32}px ${MONO}`, padding: "12px 0 0", opacity: clamp01(shown - i) }}>
          <span style={{ fontFamily: BODY }}>{a}</span>
          <span style={{ direction: "ltr" }}>{b}</span>
        </div>
      ))}
      <div style={{ marginTop: 14, borderTop: `3px solid ${C.ink}`, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: clamp01(shown - rows.length) }}>
        <span style={{ font: `900 32px ${DISPLAY}` }}>الإجمالي</span>
        <span style={{ font: `800 ${slim ? 40 : 62}px ${MONO}`, direction: "ltr", position: "relative", padding: "0 10px" }}>
          {total}
          <svg style={{ position: "absolute", left: -14, top: -14, width: "calc(100% + 28px)", height: "calc(100% + 28px)" }} viewBox="0 0 200 80" preserveAspectRatio="none">
            <ellipse cx="100" cy="40" rx="96" ry="34" fill="none" stroke={C.red} strokeWidth="5" strokeDasharray="560" strokeDashoffset={560 * (1 - ring)} strokeLinecap="round" />
          </svg>
        </span>
      </div>
      {stamp > 0 ? (
        <div style={{ position: "absolute", left: 24, top: 120, border: `5px solid ${C.red}`, color: C.red, padding: "2px 18px 6px", font: `900 38px ${DISPLAY}`, borderRadius: 10, transform: `rotate(-10deg) scale(${1.4 - 0.4 * stamp})`, opacity: stamp }}>غير مراجع</div>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 14, background: tooth }} />
    </div>
  );
};

/* ───── المشاهد ───── */
const Hook: React.FC<{ f: number }> = ({ f }) => {
  const l = f;
  const o = outOf(f, "hook");
  const print = ease(l, 6, 90, OUT);
  const rows: [string, string][] = [["طلبات الأسبوع", "3,420"], ["طلبات الشهر", "5,180"], ["مرتجعات", "−640"], ["خصومات", "−1,210"]];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", top: 690, left: 540 - 320, height: 600 * print + 40, overflow: "hidden", width: 640 }}>
        <Receipt w={640} rows={rows} total="12,480" shown={ease(l, 8, 80, OUT) * 6} ring={ease(l, 110, 24, OUT)} />
      </div>
      <div style={{ position: "absolute", top: 1215, left: 90, border: `6px solid ${C.red}`, color: C.red, padding: "2px 22px 8px", font: `900 46px ${DISPLAY}`, borderRadius: 12, transform: `rotate(-8deg) scale(${1.5 - 0.5 * ease(l, 140, 14, BACK)})`, opacity: ease(l, 140, 14, BACK), background: "rgba(11,13,7,.7)" }}>غير مراجع</div>
      <div style={{ position: "absolute", top: 630, left: 70, padding: "10px 24px 14px", borderRadius: 18, background: C.red, color: "#fff", font: `800 36px ${BODY}`, opacity: ease(l, 120, 14, BACK), transform: `scale(${ease(l, 120, 14, BACK)}) rotate(4deg)`, boxShadow: shadow }}>من وين طلع؟ 🤔</div>
      <Note p={ease(l, 150, 16, OUT) * o} color={C.lime} top={1330}>
        الرقم يطلع من أداة أو لوحة أو ذكاء اصطناعي… و<b style={{ color: C.lime }}>شكله صحيح دايماً</b>
      </Note>
    </div>
  );
};

const Src: React.FC<{ f: number }> = ({ f }) => {
  const l = lp(f, "src");
  const o = outOf(f, "src");
  const grid = ease(l, 6, 24, BACK);
  const cell = ease(l, 70, 14, BACK);
  const hdr = ["", "أ", "ب", "ج", "د"];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", top: 650, right: 80, width: 330, padding: "18px 22px 24px", borderRadius: 26, background: C.paper, color: C.ink, boxShadow: shadow, direction: "rtl", opacity: ease(l, 4, 14), transform: `scale(${0.9 + 0.1 * ease(l, 4, 16, BACK)})` }}>
        <div style={{ font: `800 24px ${BODY}`, color: "#666" }}>الإجمالي</div>
        <div style={{ font: `800 54px ${MONO}`, direction: "ltr" }}>12,480</div>
      </div>
      <Badge n={1} p={ease(l, 14, 14, BACK)} color={C.cyan} style={{ top: 628, right: 56 }} />
      <div style={{ position: "absolute", top: 660, left: 70, width: 560, background: "#fff", borderRadius: 18, boxShadow: shadow, overflow: "hidden", direction: "ltr", transform: `scale(${0.85 + 0.15 * grid})`, opacity: grid, transformOrigin: "left top" }}>
        <div style={{ background: "#1E7A4D", color: "#fff", font: `700 24px ${EN}`, padding: "8px 14px" }}>مبيعات_اكتوبر.xlsx · Sheet2</div>
        {Array.from({ length: 6 }, (_, r) => (
          <div key={r} style={{ display: "flex" }}>
            {hdr.map((h, c) => {
              const target = r === 4 && c === 4;
              const head = r === 0 || c === 0;
              return (
                <div key={c} style={{ flex: c === 0 ? "0 0 54px" : 1, height: 58, borderRight: "1px solid #D5D9D2", borderBottom: "1px solid #D5D9D2", background: target && cell > 0.5 ? C.lime : head ? "#EEF1EC" : "#fff", display: "grid", placeItems: "center", font: `700 24px ${MONO}`, color: "#222", boxShadow: target && cell > 0.5 ? `inset 0 0 0 4px ${C.red}` : "none" }}>
                  {head ? (r === 0 ? h : r) : target ? "12,480" : ["", "410", "980", "1,210", "2,340"][((r + c) % 4) + 1] ?? ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 1085, right: 80, left: 80, display: "flex", gap: 12, justifyContent: "center", direction: "rtl", opacity: ease(l, 96, 16) }}>
        {["الملف", "الورقة", "الخانة"].map((t, i) => (
          <div key={t} style={{ padding: "8px 24px 12px", borderRadius: 16, background: C.cyan, color: C.ink, font: `800 32px ${BODY}`, transform: `scale(${ease(l, 96 + i * 12, 14, BACK)})` }}>{t}</div>
        ))}
      </div>
      <Bubble p={ease(l, 130, 16, OUT) * o} top={1180} color={C.paper} text="وش مصدر هذا الرقم؟ حدد لي الملف والورقة والعمود" typedAt={140} l={l} />
      <Note p={ease(l, 232, 14, OUT) * o} color={C.cyan} top={1330} size={26}>
        مع الذكاء الاصطناعي: اطلب منه يذكر <b style={{ color: C.cyan }}>مكان الرقم في ملفك</b>، وافتحه بنفسك
      </Note>
    </div>
  );
};

const How: React.FC<{ f: number }> = ({ f }) => {
  const l = lp(f, "how");
  const o = outOf(f, "how");
  const steps = ["جمّع كل الصفوف", "استبعد المرتجعات", "اجمع الباقي"];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", top: 650, right: 80, left: 80, padding: "14px 24px", borderRadius: 18, background: "#fff", boxShadow: shadow, direction: "ltr", display: "flex", gap: 14, alignItems: "center", opacity: ease(l, 4, 14), transform: `translateY(${(1 - ease(l, 4, 16, OUT)) * 30}px)` }}>
        <span style={{ font: `800 30px ${MONO}`, color: C.amb }}>fx</span>
        <span style={{ font: `800 38px ${MONO}`, color: C.ink }}>=SUM(D2:D41)−E2</span>
      </div>
      <Badge n={1} p={ease(l, 12, 14, BACK)} color={C.amb} style={{ top: 628, right: 40 }} />
      <div style={{ position: "absolute", top: 760, right: 80, left: 80, display: "flex", flexDirection: "column", gap: 14, direction: "rtl" }}>
        {steps.map((s, i) => {
          const p = ease(l, 40 + i * 30, 16, BACK);
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 20, padding: "12px 24px 16px", borderRadius: 22, background: C.paper, color: C.ink, font: `800 34px ${BODY}`, opacity: Math.min(1, p * 1.5), transform: `scale(${0.9 + 0.1 * p})`, boxShadow: shadow }}>
              <span style={{ width: 52, height: 52, borderRadius: 26, background: C.amb, display: "grid", placeItems: "center", font: `800 30px ${EN}` }}>{i + 1}</span>
              <span>{s}</span>
              <span style={{ marginRight: "auto", font: `800 36px ${MONO}`, direction: "ltr", color: i === 1 ? C.red : "#2A7A4A" }}>{["15,000", "−2,520", "12,480"][i]}</span>
            </div>
          );
        })}
      </div>
      <Bubble p={ease(l, 140, 16, OUT) * o} top={1150} color={C.amb} text="اشرح لي خطوة بخطوة كيف حسبت هذا الرقم" typedAt={150} l={l} />
      <Note p={ease(l, 232, 14, OUT) * o} color={C.amb} top={1330} size={26}>
        الأرقام مثال توضيحي · الجواب اللي ما يشرح طريقته <b style={{ color: C.amb }}>يستاهل الشك</b>
      </Note>
    </div>
  );
};

const Smp: React.FC<{ f: number }> = ({ f }) => {
  const l = lp(f, "smp");
  const o = outOf(f, "smp");
  const picks = [1, 3, 6, 8, 11];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", top: 650, right: 80, width: 470, background: "#fff", borderRadius: 18, boxShadow: shadow, overflow: "hidden", direction: "ltr", opacity: ease(l, 4, 14) }}>
        {Array.from({ length: 12 }, (_, r) => {
          const hit = picks.indexOf(r);
          const on = hit >= 0 && ease(l, 30 + hit * 16, 12) > 0.5;
          return (
            <div key={r} style={{ display: "flex", height: 40, alignItems: "center", background: on ? C.lime : r % 2 ? "#F4F6F2" : "#fff", borderBottom: "1px solid #E1E4DD", font: `700 22px ${MONO}`, color: "#333", padding: "0 10px", gap: 10 }}>
              <span style={{ width: 28, color: "#999" }}>{r + 2}</span>
              <span style={{ flex: 1 }}>{["North", "East", "West", "South"][r % 4]}</span>
              <span>{(1000 + ((r * 137) % 900)).toLocaleString("en-US")}</span>
            </div>
          );
        })}
      </div>
      <Badge n={1} p={ease(l, 14, 14, BACK)} color={C.lime} style={{ top: 628, right: 56 }} />
      <div style={{ position: "absolute", top: 650, left: 70, width: 400, padding: "20px 22px 26px", borderRadius: 28, background: "#2B2F26", boxShadow: shadow, direction: "ltr", opacity: ease(l, 70, 16), transform: `scale(${0.9 + 0.1 * ease(l, 70, 18, BACK)})` }}>
        <div style={{ background: "#B8D17A", color: C.ink, borderRadius: 12, padding: "10px 16px", font: `800 48px ${MONO}`, textAlign: "right" }}>{Math.round(ease(l, 80, 70) * 5)}/5 ✓</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 14 }}>
          {["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ".", "=", "+"].map((k, i) => (
            <div key={i} style={{ height: 52, borderRadius: 12, background: "#43483A", color: "#fff", display: "grid", placeItems: "center", font: `700 26px ${MONO}`, ...(k === "=" ? { background: C.lime, color: C.ink } : {}) }}>{k}</div>
          ))}
        </div>
      </div>
      <Badge n={2} p={ease(l, 74, 14, BACK)} color={C.lime} style={{ top: 628, left: 44 }} />
      <Bubble p={ease(l, 150, 16, OUT) * o} top={1180} color={C.lime} text="خذ 5 أسطر عشوائية وأعد حسابها بنفسك" typedAt={160} l={l} />
      <Note p={ease(l, 232, 14, OUT) * o} color={C.lime} top={1340} size={26}>
        عيّنة صغيرة تكشف الغلط بسرعة… ولو ما طابقت، <b style={{ color: C.lime }}>لا تعتمد الرقم</b>
      </Note>
    </div>
  );
};

const Bad: React.FC<{ f: number }> = ({ f }) => {
  const l = lp(f, "bad");
  const o = outOf(f, "bad");
  const rows: [string, string, string][] = [["صفوف مكررة", "نفس الطلب انحسب مرتين", "⧉"], ["خانات فاضية", "تنحسب صفر أو تنتجاهل", "▢"], ["وحدات مختلفة", "ريال في سطر وألف ريال في سطر", "≠"], ["تواريخ بصيغ مختلفة", "10/11 يومين ولا شهرين؟", "📅"]];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", top: 650, right: 80, left: 80, display: "flex", flexDirection: "column", gap: 14, direction: "rtl" }}>
        {rows.map(([a, b, ic], i) => {
          const p = ease(l, 8 + i * 26, 16, BACK);
          return (
            <div key={a} style={{ display: "flex", alignItems: "center", gap: 22, padding: "14px 24px 18px", borderRadius: 24, background: C.paper, color: C.ink, boxShadow: shadow, opacity: Math.min(1, p * 1.5), transform: `scale(${0.9 + 0.1 * p})`, borderRight: `14px solid ${C.red}` }}>
              <span style={{ width: 64, height: 64, borderRadius: 18, background: C.ink, color: C.red, display: "grid", placeItems: "center", font: `800 38px ${MONO}` }}>{ic}</span>
              <div>
                <div style={{ font: `900 36px ${DISPLAY}` }}>{a}</div>
                <div style={{ font: `600 28px ${BODY}`, color: "#555" }}>{b}</div>
              </div>
            </div>
          );
        })}
      </div>
      <Note p={ease(l, 140, 16, OUT) * o} color={C.red} top={1300} size={30}>
        أغلب الفروقات تبدأ من <b style={{ color: C.red }}>البيانات نفسها</b>، مو من الحساب
      </Note>
    </div>
  );
};

const Sum: React.FC<{ f: number }> = ({ f }) => {
  const l = lp(f, "sum");
  const o = outOf(f, "sum");
  const rows: [string, string][] = [["من وين الرقم؟", C.cyan], ["كيف انحسب؟", C.amb], ["عيّنة تطابقت؟", C.lime]];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", top: 650, right: 80, left: 80, display: "flex", flexDirection: "column", gap: 16, direction: "rtl" }}>
        {rows.map(([t, c], i) => {
          const p = ease(l, 8 + i * 16, 14, BACK);
          return (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 22, padding: "14px 26px 18px", borderRadius: 26, background: "rgba(11,13,7,.9)", border: `3px solid ${c}`, color: "#fff", font: `800 40px ${BODY}`, opacity: Math.min(1, p * 1.5), transform: `scale(${0.88 + 0.12 * p})` }}>
              <span style={{ width: 58, height: 58, borderRadius: 29, background: c, color: C.ink, display: "grid", placeItems: "center", font: `800 34px ${BODY}` }}>✓</span>
              {t}
            </div>
          );
        })}
        <div style={{ alignSelf: "center", marginTop: 14, border: `7px solid ${C.lime}`, color: C.lime, padding: "6px 36px 12px", font: `900 62px ${DISPLAY}`, borderRadius: 16, transform: `rotate(-6deg) scale(${1.5 - 0.5 * ease(l, 66, 14, BACK)})`, opacity: ease(l, 66, 14, BACK) }}>مراجع ✓</div>
      </div>
    </div>
  );
};

export const Labels: React.FC<{ f: number }> = ({ f }) => (
  <>
    {inSeg(f, "hook") ? <Hook f={f} /> : null}
    {inSeg(f, "src") ? <Src f={f} /> : null}
    {inSeg(f, "how") ? <How f={f} /> : null}
    {inSeg(f, "smp") ? <Smp f={f} /> : null}
    {inSeg(f, "bad") ? <Bad f={f} /> : null}
    {inSeg(f, "sum") ? <Sum f={f} /> : null}
  </>
);

/* ───── الختام ───── */
export const End: React.FC<{ f: number }> = ({ f }) => {
  const [a] = SEG.end;
  if (f < a + 6) return null;
  const pt = ease(f, a + 12, 18, OUT);
  const pa = ease(f, a + 28, 22, BACK);
  const pn = ease(f, a + 50, 18, OUT);
  const pc = ease(f, a + 64, 18, OUT);
  const ph = ease(f, a + 78, 18, BACK);
  return (
    <div style={{ position: "absolute", inset: 0, direction: "rtl", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 200, left: 0, right: 0, font: `900 84px/1.3 ${DISPLAY}`, color: "#fff", opacity: pt, transform: `translateY(${(1 - pt) * 30}px)` }}>
        قبل ما تعتمد أي رقم…
        <br />
        <span style={{ color: C.lime }}>اسأل ثلاث أسئلة</span>
        <div style={{ font: `700 36px/1.4 ${BODY}`, color: C.sub, marginTop: 10 }}>أرسلها لزميلك اللي يصدّق كل رقم</div>
      </div>
      <div style={{ position: "absolute", top: 720, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${pa}) rotate(${(1 - pa) * -10}deg)` }}>
        <div style={{ width: 420, height: 420, borderRadius: "50%", border: `12px solid ${C.lime}`, boxShadow: `0 0 0 10px #12140E, 0 0 0 16px ${C.lime}`, overflow: "hidden", background: C.ink }}>
          <Img src={staticFile("avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%" }} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 1290, left: 0, right: 0, font: `900 84px/1.3 ${DISPLAY}`, color: "#fff", opacity: pn, transform: `translateY(${(1 - pn) * 30}px)` }}>علي التميمي</div>
      <div style={{ position: "absolute", top: 1400, left: 0, right: 0, font: `700 34px/1.4 ${BODY}`, color: C.sub, opacity: pc }}>كل يوم معلومة تقنية تهمّك</div>
      <div style={{ position: "absolute", top: 1462, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${ph})` }}>
        <div style={{ padding: "10px 32px", borderRadius: 999, background: C.grad }}>
          <HandlesRow size={30} color="#12140E" />
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
      <div style={{ padding: "8px 24px", borderRadius: 999, background: "rgba(0,0,0,.6)", border: "1px solid rgba(255,255,255,.15)" }}>
        <HandlesRow size={26} color="#fff" />
      </div>
    </div>
  );
};
