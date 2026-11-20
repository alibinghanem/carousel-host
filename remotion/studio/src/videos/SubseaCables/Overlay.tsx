import React from "react";
import { Img } from "remotion";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { CUT_AT, HIT_AT, JEDDAH, SEA_Y, TRIP, gProject, projectW, satPos, secPoint } from "./Scene3D";
import { BACK, BG, BODY, C, DISPLAY, EN, IN, OUT, SEG, SegK, V, ease } from "./theme";

export const TAG = "تقنية · كابلات البحر";
const iso = (t: string) => <span style={{ direction: "ltr", unicodeBidi: "isolate", fontFamily: EN, fontWeight: 700, whiteSpace: "nowrap" }}>{t}</span>;
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

/* ───── الخلفية: صورة بحر حقيقية في الهوك، وبعدها تدرّج يتغير مع المشهد ───── */
export const Backdrop: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  let c0 = BG.hook[0];
  let c1 = BG.hook[1];
  for (let i = 1; i < KEYS.length; i++) {
    const t = ease(f, SEG[KEYS[i]][0] - 15, 30, OUT);
    if (t <= 0) break;
    c0 = mixHex(BG[KEYS[i - 1]][0], BG[KEYS[i]][0], t);
    c1 = mixHex(BG[KEYS[i - 1]][1], BG[KEYS[i]][1], t);
  }
  const photo = 1 - ease(f, SEG.hook[1] - 30, 40, OUT);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 45% at 50% 52%, ${c0} 0%, ${c1} 100%)` }} />
      <div style={{ position: "absolute", left: -200, right: -200, top: 660, height: 640, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(55,230,255,${0.07 + kick * 0.04}), rgba(55,230,255,0))` }} />
      {photo > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: photo }}>
          <Img src={V("sea.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 50%", transform: `scale(${1.2 + f * 0.0014})`, filter: "brightness(.75) contrast(1.1) saturate(1.1)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(2,16,26,.85) 0%, rgba(2,16,26,.4) 36%, rgba(2,16,26,.25) 62%, rgba(2,16,26,.75) 100%)" }} />
        </div>
      ) : null}
    </>
  );
};

/* ───── العناوين ───── */
type B = { k: SegK; chip: React.ReactNode; title: React.ReactNode; sub: React.ReactNode; color: string; lines?: number; size?: number };
const BLOCKS: B[] = [
  { k: "hook", chip: TAG, title: <>رسالتك لأوروبا<br />ما تطير… تغوص</>, sub: "الإنترنت بين القارات يمشي تحت البحر", color: "#9FF3FF", lines: 2, size: 104 },
  { k: "intro", chip: TAG, title: "كابلات تحت الموج", sub: "مو أقمار صناعية… أغلب الإنترنت يعدّي من هنا", color: "#9FF3FF", size: 96 },
  { k: "trip", chip: "رحلة رسالتك", title: "من جدة لأوروبا", sub: "مسار مبسّط للتوضيح", color: "#FFD166", size: 100 },
  { k: "cable", chip: "داخل الكابل", title: "قد خرطوم الحديقة", sub: "وبداخله ألياف زجاجية يمشي فيها الضوء", color: "#9FF3FF", size: 100 },
  { k: "hit", chip: "وش يقطعها؟", title: "مرساة وشبكة صيد", sub: "أغلب الأعطال بسبب أنشطة بحرية عادية", color: "#FFB020", size: 100 },
  { k: "reroute", chip: "6 سبتمبر 2025", title: "قطع قرب جدة", sub: "الحركة تتحوّل… بس تصير أبطأ", color: "#FF8A8A", size: 100 },
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
      <div style={{ position: "absolute", top: 258, right: 74, left: 20, overflow: "hidden", padding: "0 6px 10px" }}>
        <div style={{ font: `800 ${size}px/1.38 ${DISPLAY}`, color: "#fff", whiteSpace: "nowrap", transform: `translateY(${(1 - pt) * 110}%)`, textShadow: "0 6px 30px rgba(0,0,0,.55)" }}>{b.title}</div>
      </div>
      <div style={{ position: "absolute", top: 258 + size * 1.38 * lines + 18, right: 80, left: 40, font: `700 38px/1.5 ${BODY}`, color: "rgba(255,255,255,.9)", opacity: ps, transform: `translateY(${(1 - ps) * 20}px)`, textShadow: "0 3px 16px rgba(0,0,0,.6)" }}>{b.sub}</div>
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
/** ملصق بخط يوصله بنقطة على العنصر */
const Leader: React.FC<{ from: [number, number]; dx: number; dy: number; p: number; bg: string; fg?: string; children: React.ReactNode; size?: number }> = ({ from, dx, dy, p, bg, fg, children, size }) => {
  if (p <= 0) return null;
  const [x, y] = from;
  return (
    <>
      <div style={{ position: "absolute", left: x, top: Math.min(y, y + dy), width: 3, height: Math.abs(dy), background: "rgba(255,255,255,.75)", transformOrigin: dy < 0 ? "bottom" : "top", transform: `scaleY(${p})` }} />
      <div style={{ position: "absolute", left: x - 7, top: y - 7, width: 14, height: 14, borderRadius: 7, background: "#fff", transform: `scale(${p})` }} />
      <Tag x={x + dx} y={y + dy} p={p} bg={bg} fg={fg} size={size}>
        {children}
      </Tag>
    </>
  );
};
const Steps: React.FC<{ f: number; k: SegK; items: React.ReactNode[]; step: number; color: string; note: React.ReactNode; noteAt: number; top?: number; noteTop?: number }> = ({ f, k, items, step, color, note, noteAt, top = 650, noteTop = 1262 }) => {
  const l = lp(f, k);
  const o = outOf(f, k);
  return (
    <>
      <div style={{ position: "absolute", top, right: 40, width: 410, display: "flex", flexDirection: "column", alignItems: "stretch", direction: "rtl" }}>
        {items.map((t, i) => {
          const p = ease(l, 30 + i * 56, 14, BACK) * o;
          const on = i === step;
          return (
            <div key={i} style={{ opacity: Math.min(1, p * 1.5), transform: `scale(${0.85 + 0.15 * p})` }}>
              {i > 0 ? <div style={{ textAlign: "center", font: `700 34px ${BODY}`, color: "rgba(255,255,255,.6)", lineHeight: "40px" }}>↓</div> : null}
              <div style={{ padding: "12px 20px 16px", borderRadius: 18, background: on ? color : "rgba(255,255,255,.1)", color: on ? C.ink : "#fff", border: `2px solid ${on ? color : "rgba(255,255,255,.18)"}`, font: `700 31px/1.4 ${BODY}`, boxShadow: on ? `0 0 34px ${color}66` : "none" }}>{t}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: noteTop, left: 56, right: 56, padding: "16px 26px 20px", borderRadius: 20, background: "rgba(2,16,26,.84)", border: `2px solid ${color}88`, color: "#fff", font: `700 31px/1.45 ${BODY}`, direction: "rtl", opacity: ease(l, noteAt, 16, OUT) * o, transform: `translateY(${(1 - ease(l, noteAt, 16, OUT)) * 30}px)` }}>
        {note}
      </div>
    </>
  );
};
const Card: React.FC<{ p: number; color: string; big: React.ReactNode; small: React.ReactNode }> = ({ p, color, big, small }) => (
  <div style={{ flex: 1, padding: "12px 18px 16px", borderRadius: 20, background: "rgba(2,16,26,.84)", border: `2px solid ${color}99`, opacity: Math.min(1, p * 1.5), transform: `scale(${0.88 + 0.12 * p})`, textAlign: "center" }}>
    <div style={{ font: `800 50px/1.2 ${EN}`, color, direction: "ltr" }}>{big}</div>
    <div style={{ font: `700 28px/1.4 ${BODY}`, color: "#fff" }}>{small}</div>
  </div>
);

export const Labels: React.FC<{ f: number }> = ({ f }) => {
  const out: React.ReactNode[] = [];
  if (f < SEG.hook[1] + 2) {
    const p = ease(f, 70, 16, BACK) * (1 - ease(f, SEG.hook[1] - 10, 8, OUT));
    out.push(
      <Tag key="h" x={540} y={690} p={p} bg="#fff" size={40}>
        {iso("99%+")} من البيانات الدولية بالكابلات
      </Tag>,
    );
  }
  if (inSeg(f, "intro")) {
    const l = lp(f, "intro");
    const o = outOf(f, "intro");
    const n = Math.round(ease(l, 10, 70, OUT) * 99);
    out.push(
      <div key="cnt" style={{ position: "absolute", left: 0, right: 0, top: 520, display: "flex", justifyContent: "center", opacity: ease(l, 6, 14, OUT) * o }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "8px 32px 12px", borderRadius: 999, background: "rgba(2,16,26,.82)", border: "2px solid #37E6FF", direction: "rtl", boxShadow: "0 0 40px rgba(55,230,255,.35)" }}>
          <span style={{ font: `800 78px ${EN}`, color: "#37E6FF", direction: "ltr" }}>{n}%+</span>
          <span style={{ font: `700 32px/1.3 ${BODY}`, color: "#fff" }}>
            من حركة البيانات الدولية
            <br />
            تعدّي بالكابلات البحرية
          </span>
        </div>
      </div>,
    );
    const [sx, sy] = (() => {
      const p = satPos(f);
      return projectW(f, p);
    })();
    out.push(
      <Tag key="sat" x={Math.max(230, Math.min(850, sx))} y={Math.max(700, sy + 56)} p={ease(l, 70, 14, BACK) * (1 - ease(l, 196, 10, OUT)) * o} bg="#fff" size={26}>
        الأقمار الصناعية: أقل من {iso("1%")}
      </Tag>,
    );
  }
  if (inSeg(f, "trip")) {
    const l = lp(f, "trip");
    const o = outOf(f, "trip");
    const j = gProject(f, JEDDAH[0], JEDDAH[1], 1.01);
    const m = gProject(f, TRIP[TRIP.length - 1][0], TRIP[TRIP.length - 1][1], 1.01);
    if (j) out.push(<Tag key="j" x={j[0] + 10} y={j[1] + 56} p={ease(l, 36, 14, BACK) * o} bg="#FFD166" size={28}>محطة إنزال · جدة</Tag>);
    if (m) out.push(<Tag key="m" x={m[0]} y={m[1] - 54} p={ease(l, 215, 14, BACK) * o} bg="#9FF3FF" size={28}>أوروبا</Tag>);
    out.push(
      <Steps
        key="s"
        f={f}
        k="trip"
        step={l < 100 ? 0 : l < 200 ? 1 : 2}
        color="#FFD166"
        items={["جوالك يوصل لأقرب محطة إنزال", "يغوص كضوء داخل ألياف زجاجية", "يطلع في أوروبا ويكمل لموقعه"]}
        noteAt={150}
        noteTop={1336}
        note={<>الرسالة <b style={{ color: "#FFD166" }}>ما تطير</b> للقمر… ترحل تحت البحر والمسار هنا مبسّط للتوضيح، مو الخريطة الرسمية</>}
      />,
    );
  }
  if (inSeg(f, "cable")) {
    const l = lp(f, "cable");
    const o = outOf(f, "cable");
    const pts: [V3Local, string, number, number, number][] = [
      [[-1.05, 0.85, 0.2], "غلاف بولي إيثيلين", -150, 70, 60],
      [[-0.1, -0.66, 0.4], "حماية فولاذية*", 120, 150, 100],
      [[0.78, 0.45, 0.3], "نحاس: كهرباء للمكرّرات", -150, 230, 140],
      [[1.7, -0.1, 0.35], "ألياف زجاجية: الضوء", 150, 310, 180],
    ];
    pts.forEach(([p, t, dy, dx, at], i) => {
      const w = secPoint(p);
      const [x, y] = projectW(f, w);
      out.push(
        <Leader key={i} from={[x, y]} dx={[-60, -10, 40, -90][i]} dy={dy} p={ease(l, at, 14, BACK) * o} bg={i === 3 ? "#9FF3FF" : "#fff"} size={28}>
          {t}
        </Leader>,
      );
    });
    out.push(
      <div key="note" style={{ position: "absolute", top: 1330, left: 56, right: 56, padding: "16px 26px 20px", borderRadius: 20, background: "rgba(2,16,26,.84)", border: "2px solid #9FF3FF88", color: "#fff", font: `700 31px/1.45 ${BODY}`, direction: "rtl", opacity: ease(l, 190, 16, OUT) * o }}>
        قطر الكابلات العميقة بلا تدريع: <b style={{ color: "#9FF3FF" }}>{iso("17–21")} ملم</b>. *بعض المسارات فيها تدريع فولاذي أكثر حسب القاع
      </div>,
    );
  }
  if (inSeg(f, "hit")) {
    const l = lp(f, "hit");
    const o = outOf(f, "hit");
    const [ax, ay] = projectW(f, [0, SEA_Y + 2.2, 0]);
    out.push(
      <Tag key="a" x={ax + 210} y={ay - 30} p={ease(l, 34, 14, BACK) * (1 - ease(l, HIT_AT + 10, 8, OUT)) * o} bg="#FFB020" size={30}>
        مرساة سفينة تنزل في المكان الغلط
      </Tag>,
    );
    const [cx, cy] = projectW(f, [0, SEA_Y - 0.1, 0.4]);
    out.push(
      <Tag key="c" x={cx} y={cy + 70} p={ease(l, HIT_AT + 14, 12, BACK) * o} bg="#FF5252" fg="#fff" size={36}>
        انقطع!
      </Tag>,
    );
    out.push(
      <div key="cards" style={{ position: "absolute", top: 1226, left: 56, right: 56, display: "flex", gap: 16, direction: "rtl" }}>
        <Card p={ease(l, 130, 14, BACK) * o} color="#FFB020" big={iso("150–200")} small="عطل بالسنة" />
        <Card p={ease(l, 160, 14, BACK) * o} color="#FFB020" big={iso("70–80%+")} small="سببها صيد ومراسي" />
      </div>,
    );
    out.push(
      <div key="rep" style={{ position: "absolute", top: 1378, left: 56, right: 56, textAlign: "center", font: `700 30px ${BODY}`, color: "#BFF3FF", opacity: ease(l, 210, 16, OUT) * o, direction: "rtl" }}>
        التصليح؟ سفن متخصصة… وأحياناً أسابيع
      </div>,
    );
  }
  if (inSeg(f, "reroute")) {
    const l = lp(f, "reroute");
    const o = outOf(f, "reroute");
    const c = gProject(f, CUT_AT[0], CUT_AT[1], 1.01);
    if (c) out.push(<Tag key="x" x={c[0] + 120} y={c[1] + 10} p={ease(l, 46, 12, BACK) * o} bg="#FF5252" fg="#fff" size={28}>✕ قطع</Tag>);
    out.push(
      <div key="rows" style={{ position: "absolute", top: 650, right: 40, width: 430, display: "flex", flexDirection: "column", gap: 12, direction: "rtl" }}>
        {[
          [`قطوعات قرب جدة في كابلات ${"SMW4"} و ${"IMEWE"}`, 60, "#FF8A8A"],
          ["Microsoft: تأخّر أعلى على Azure بالشرق الأوسط، وحوّلت الحركة لمسارات بديلة", 130, "#FFB020"],
          ["بطء في الهند وباكستان والإمارات والخليج", 200, "#FFD166"],
        ].map(([t, at, col], i) => {
          const p = ease(l, at as number, 14, BACK) * o;
          return (
            <div key={i} style={{ padding: "12px 18px 15px", borderRadius: 18, background: "rgba(2,16,26,.84)", border: `2px solid ${col}99`, color: "#fff", font: `700 29px/1.4 ${BODY}`, opacity: Math.min(1, p * 1.5), transform: `scale(${0.88 + 0.12 * p})` }}>
              {t as string}
            </div>
          );
        })}
      </div>,
    );
    out.push(
      <Tag key="alt" x={310} y={1170} p={ease(l, 150, 14, BACK) * o} bg="#FFB020" size={28}>
        مسار بديل أطول (توضيحي)
      </Tag>,
    );
    out.push(
      <div key="n" style={{ position: "absolute", top: 1262, left: 56, right: 56, padding: "16px 26px 20px", borderRadius: 20, background: "rgba(2,16,26,.84)", border: "2px solid #FF8A8A88", color: "#fff", font: `700 31px/1.45 ${BODY}`, direction: "rtl", opacity: ease(l, 230, 16, OUT) * o }}>
        الخدمة ما وقفت… بس <b style={{ color: "#FFB020" }}>الطريق صار أطول</b> فصار الرد أبطأ، لين تنصلح الكابلات
      </div>,
    );
  }
  return <>{out}</>;
};
type V3Local = [number, number, number];

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
      <div style={{ position: "absolute", top: 220, left: 0, right: 0, font: `800 92px/1.35 ${DISPLAY}`, color: "#fff", opacity: pt, transform: `translateY(${(1 - pt) * 30}px)`, textShadow: "0 6px 30px rgba(0,0,0,.6)" }}>
        النت ما يطير… يغوص
        <div style={{ font: `700 40px/1.4 ${BODY}`, color: "#9FF3FF" }}>أرسلها لمن يقول «النت بالأقمار»</div>
      </div>
      <div style={{ position: "absolute", top: 1250, left: 0, right: 0, font: `700 84px/1.3 ${BODY}`, color: "#fff", opacity: pn, transform: `translateY(${(1 - pn) * 30}px)`, textShadow: "0 6px 30px rgba(0,0,0,.6)" }}>علي التميمي</div>
      <div style={{ position: "absolute", top: 1364, left: 0, right: 0, font: `700 34px/1.4 ${BODY}`, color: "rgba(255,255,255,.88)", opacity: pc }}>كل يوم معلومة تقنية تهمّك</div>
      <div style={{ position: "absolute", top: 1425, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${ph})` }}>
        <div style={{ padding: "10px 32px", borderRadius: 999, background: C.grad }}>
          <HandlesRow size={30} color="#031A24" />
        </div>
      </div>
    </div>
  );
};
export const Footer: React.FC<{ f: number }> = ({ f }) => {
  const o = ease(f, 8, 12) * (1 - ease(f, SEG.end[0], 10));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 1480, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ padding: "8px 24px", borderRadius: 999, background: "rgba(0,0,0,.55)", border: "1px solid rgba(255,255,255,.15)" }}>
        <HandlesRow size={26} color="#fff" />
      </div>
    </div>
  );
};
export const Shade: React.FC = () => <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 620, background: "linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,0))" }} />;
