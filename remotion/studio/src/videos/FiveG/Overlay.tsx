import React from "react";
import { Img } from "remotion";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { ANT, GROUND_Y, projectW } from "./Scene3D";
import { BACK, BG, BODY, C, DISPLAY, EN, IN, OUT, SEG, SegK, V, ease } from "./theme";

export const TAG = "تقنية · 5G";
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

/* ───── الخلفية: صورة مدينة حقيقية في الهوك، وتدرّجات بعدها ───── */
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
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 330, opacity: 0.1 + kick * 0.05, backgroundImage: "repeating-linear-gradient(90deg, #B79CFF 0 4px, transparent 4px 60px)", WebkitMaskImage: "linear-gradient(0deg, #000, transparent)", maskImage: "linear-gradient(0deg, #000, transparent)" }} />
      {photo > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: photo }}>
          <Img src={V("bg.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "55% 50%", transform: `scale(${1.3 + f * 0.0012})`, filter: "brightness(.5) contrast(1.1) saturate(.85)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(12,7,19,.92) 0%, rgba(12,7,19,.5) 36%, rgba(12,7,19,.4) 62%, rgba(12,7,19,.9) 100%)" }} />
        </div>
      ) : null}
    </>
  );
};

/* ───── العناوين ───── */
type B = { k: SegK; chip: React.ReactNode; title: React.ReactNode; sub: React.ReactNode; color: string; lines?: number; size?: number };
const BLOCKS: B[] = [
  { k: "hook", chip: TAG, title: <>5G عندك؟<br />تحس بالفرق؟</>, sub: "السرعة على الورق شي… وسرعتك شي ثاني", color: C.mint, lines: 2, size: 108 },
  { k: "speed", chip: "5G مقابل 4G", title: "الأرقام على الورق", sub: "أهداف في ظروف مثالية", color: C.vio, size: 100 },
  { k: "low", chip: "النطاق المنخفض", title: "موجة طويلة", sub: "تغطي أبعد… بسرعة أقل", color: C.amb, size: 112 },
  { k: "mid", chip: "النطاق المتوسط", title: "موجة متوسطة", sub: "توازن بين السرعة والمدى", color: C.mint, size: 112 },
  { k: "high", chip: <>الموجات المليمترية · {iso("mmWave")}</>, title: "موجة قصيرة جداً", sub: "الأسرع… بس المدى قصير", color: C.pink, size: 104 },
  { k: "sum", chip: "الخلاصة", title: "سرعتك تتبع موجتك", sub: "", color: C.vio, size: 90 },
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
      {b.sub ? <div style={{ position: "absolute", top: 256 + size * 1.3 * lines + 18, right: 80, left: 40, font: `700 38px/1.5 ${BODY}`, color: "rgba(255,255,255,.9)", opacity: ps, transform: `translateY(${(1 - ps) * 20}px)`, textShadow: "0 3px 16px rgba(0,0,0,.6)" }}>{b.sub}</div> : null}
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
const Note: React.FC<{ p: number; color: string; top: number; children: React.ReactNode; size?: number }> = ({ p, color, top, children, size = 28 }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", top, left: 56, right: 56, padding: "14px 26px 18px", borderRadius: 20, background: "rgba(12,7,19,.9)", border: `2px solid ${color}aa`, color: "#fff", font: `700 ${size}px/1.45 ${BODY}`, direction: "rtl", opacity: p, transform: `translateY(${(1 - p) * 26}px)` }}>
      {children}
    </div>
  );
const List: React.FC<{ l: number; o: number; items: React.ReactNode[]; step: number; color: string; top?: number; at?: number; gap?: number }> = ({ l, o, items, step, color, top = 1150, at = 24, gap = 50 }) => (
  <div style={{ position: "absolute", top, right: 56, left: 56, display: "flex", flexDirection: "column", gap: 8, direction: "rtl" }}>
    {items.map((t, i) => {
      const p = ease(l, at + i * gap, 14, BACK) * o;
      const on = i === step;
      return (
        <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "8px 18px 12px", borderRadius: 20, background: on ? color : "rgba(255,255,255,.09)", color: on ? C.ink : "#fff", border: `2px solid ${on ? color : "rgba(255,255,255,.2)"}`, font: `700 27px/1.38 ${BODY}`, opacity: Math.min(1, p * 1.5), transform: `scale(${0.9 + 0.1 * p})`, boxShadow: on ? `0 0 34px ${color}66` : "none" }}>
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
    out.push(
      <Note key="n" p={ease(l, 130, 16, OUT) * o} color={C.mint} top={1320}>
        3 أنواع موجات تحدد تجربتك، مو اسم <b style={{ color: C.mint }}>5G</b> بس
      </Note>,
    );
  }
  if (inSeg(f, "speed")) {
    const l = lp(f, "speed");
    const o = outOf(f, "speed");
    const [x1, y1] = projectW(f, [-1.9, GROUND_Y + 0.55, 0.6]);
    const [x2, y2] = projectW(f, [-0.55, GROUND_Y + 3.45, 0.6]);
    out.push(
      <Tag key="a" x={x1} y={y1} p={ease(l, 70, 14, BACK) * o} bg="#9A8FB5" size={30}>{iso("4G · 1 Gbps")}</Tag>,
      <Tag key="b" x={x2} y={y2} p={ease(l, 90, 14, BACK) * o} bg={C.mint} size={32}>{iso("5G · 20 Gbps")}</Tag>,
    );
    const [x3, y3] = projectW(f, [2.0, GROUND_Y + 3.0, 0.6]);
    out.push(
      <Tag key="c" x={x3} y={y3} p={ease(l, 130, 14, BACK) * o} bg={C.amb} size={30}>{iso("4 ms · 1 ms")}</Tag>,
    );
    const step = l < 90 ? 0 : l < 170 ? 1 : 2;
    out.push(
      <List key="l" l={l} o={o} step={step} color={C.vio} top={1180} at={60} gap={46} items={[
        <>أقصى سرعة (هدف): <b>20 {iso("Gbps")}</b> مقابل <b>1 {iso("Gbps")}</b> في 4G</>,
        <>زمن الاستجابة (هدف): <b>4 {iso("ms")}</b> للإنترنت المحمول، و<b>1 {iso("ms")}</b> لتطبيقات خاصة</>,
        <>كلها أهداف في ظروف مثالية… <b>مو سرعتك اليومية</b></>,
      ]} />,
    );
    out.push(
      <Note key="n" p={ease(l, 232, 14, OUT) * o} color={C.vio} top={1408} size={23}>
        المصدر: متطلبات الاتحاد الدولي للاتصالات (ITU) لـ {iso("IMT-2020")}
      </Note>,
    );
  }
  const band = (k: SegK, color: string, items: React.ReactNode[], note: React.ReactNode) => {
    if (!inSeg(f, k)) return;
    const l = lp(f, k);
    const o = outOf(f, k);
    const step = l < 90 ? 0 : l < 170 ? 1 : 2;
    const [x, y] = projectW(f, [ANT[0], ANT[1] + 0.55, 0.4]);
    void x;
    void y;
    out.push(<List key={`l${k}`} l={l} o={o} step={step} color={color} top={1170} at={50} gap={50} items={items} />);
    out.push(
      <Note key={`n${k}`} p={ease(l, 222, 14, OUT) * o} color={color} top={1408} size={23}>
        {note}
      </Note>,
    );
  };
  band("low", C.amb, [
    <>تغطي <b>مساحة أوسع</b> وتدخل المباني أحسن</>,
    <>سرعتها <b>أقرب لـ 4G</b> من باقي النطاقات</>,
    <>الأنسب لما تكون <b>التغطية</b> أهم من السرعة</>,
  ], <>الأرقام تختلف حسب المشغّل والمكان</>);
  band("mid", C.mint, [
    <>النطاق اللي يقدَّم كـ<b>أفضل توازن</b></>,
    <>طيف <b>أعرض</b> من المنخفض، فسعة وسرعة أكبر</>,
    <>مدى <b>معقول</b> يغطي المدن والأحياء</>,
  ], <>المدى الفعلي يعتمد على الأرض والمباني</>);
  band("high", C.pink, [
    <>الأسرع، بس <b>مداها قصير</b>: مثل بلوك سكني</>,
    <>المباني والجدران <b>توقفها</b> بسهولة</>,
    <>داخل المبنى يرجع جوالك غالباً <b>لنطاق أوسع أو 4G</b></>,
  ], <>قواعد عامة من أدلة الشركات، والواقع يختلف</>);
  if (inSeg(f, "sum")) {
    const l = lp(f, "sum");
    const o = outOf(f, "sum");
    const rows: [string, string, string][] = [["منخفض", "تغطية أوسع", C.amb], ["متوسط", "توازن", C.mint], ["مليمتري", "سرعة بمدى قصير", C.pink]];
    out.push(
      <div key="chips" style={{ position: "absolute", top: 1170, left: 56, right: 56, display: "flex", flexDirection: "column", gap: 10, direction: "rtl" }}>
        {rows.map(([a, b, c], i) => {
          const p = ease(l, 14 + i * 16, 14, BACK) * o;
          return (
            <div key={a} style={{ display: "flex", gap: 16, alignItems: "center", padding: "10px 22px 14px", borderRadius: 20, background: "rgba(12,7,19,.9)", border: `2px solid ${c}`, color: "#fff", font: `800 32px ${BODY}`, opacity: Math.min(1, p * 1.5), transform: `scale(${0.9 + 0.1 * p})` }}>
              <span style={{ width: 24, height: 24, borderRadius: 12, background: c }} />
              <span>{a}</span>
              <span style={{ marginRight: "auto", font: `600 28px ${BODY}`, color: C.mute }}>{b}</span>
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
      <div style={{ position: "absolute", top: 210, left: 0, right: 0, font: `900 86px/1.3 ${DISPLAY}`, color: "#fff", opacity: pt, transform: `translateY(${(1 - pt) * 30}px)`, textShadow: "0 6px 30px rgba(0,0,0,.6)" }}>
        قبل ما تحكم على 5G…
        <br />
        <span style={{ color: C.mint }}>شوف أي موجة واصلتك</span>
        <div style={{ font: `700 36px/1.4 ${BODY}`, color: "#E8DFFA" }}>أرسلها لصاحبك اللي يقول 5G ما تفرق</div>
      </div>
      <div style={{ position: "absolute", top: 1290, left: 0, right: 0, font: `700 84px/1.3 ${BODY}`, color: "#fff", opacity: pn, transform: `translateY(${(1 - pn) * 30}px)`, textShadow: "0 6px 30px rgba(0,0,0,.6)" }}>علي التميمي</div>
      <div style={{ position: "absolute", top: 1400, left: 0, right: 0, font: `700 34px/1.4 ${BODY}`, color: "rgba(255,255,255,.88)", opacity: pc }}>كل يوم معلومة تقنية تهمّك</div>
      <div style={{ position: "absolute", top: 1462, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${ph})` }}>
        <div style={{ padding: "10px 32px", borderRadius: 999, background: C.grad }}>
          <HandlesRow size={30} color="#0C0713" />
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
