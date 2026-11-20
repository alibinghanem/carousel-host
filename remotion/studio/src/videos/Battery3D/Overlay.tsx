import React from "react";
import { Img } from "remotion";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { BACK, BG, BODY, C, DISPLAY, IN, OUT, SEG, SegK, V, ease } from "./theme";

export const TAG = "تقنية · بطارية الجوال";
const iso = (t: string) => <span style={{ direction: "ltr", unicodeBidi: "isolate", fontFamily: "Space Grotesk", fontWeight: 700 }}>{t}</span>;
const KEYS = Object.keys(SEG) as SegK[];

/* ───── الخلفية: تدرّج يتغير مع المشهد، وصورة السيارة في الهوك ───── */
const mixHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) + (((pb >> s) & 255) - ((pa >> s) & 255)) * t);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};
export const Backdrop: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  let c0 = BG.hook[0];
  let c1 = BG.hook[1];
  for (let i = 1; i < KEYS.length; i++) {
    const t = ease(f, SEG[KEYS[i]][0] - 15, 30, OUT);
    if (t <= 0) break;
    c0 = mixHex(BG[KEYS[i - 1]][0], BG[KEYS[i]][0], t);
    c1 = mixHex(BG[KEYS[i - 1]][1], BG[KEYS[i]][1], t);
  }
  const car = 1 - ease(f, SEG.hook[1] - 18, 30, OUT);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 45% at 50% 52%, ${c0} 0%, ${c1} 100%)` }} />
      {/* أرضية لامعة خفيفة */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, height: 680, background: "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,.04) 30%, rgba(0,0,0,.5))" }} />
      {car > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: car }}>
          <Img src={V("car.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "78% 50%", filter: "blur(7px) saturate(1.2) brightness(.75)", transform: `scale(${1.12 + f * 0.0012})` }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(40,12,4,.75) 0%, rgba(40,12,4,.25) 45%, rgba(10,4,2,.6) 100%)" }} />
          <div style={{ position: "absolute", right: -180, top: 520, width: 760, height: 760, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(255,190,110,${0.55 + kick * 0.1}), rgba(255,120,40,0))` }} />
        </div>
      ) : null}
    </>
  );
};

/* ───── العناوين ───── */
type B = { a: number; b: number; chip: string; title: React.ReactNode; sub: React.ReactNode; color?: string };
const BLOCKS: B[] = [
  { a: 0, b: SEG.hook[1], chip: TAG, title: "جوالك بالسيارة بالصيف؟", sub: <>تراك تخرّب بطاريته… بدون ما تدري</>, color: C.hot },
  { a: SEG.heat[0], b: SEG.heat[1], chip: "العادة 1", title: "تتركه في الحر", sub: <>فوق {iso("35°")} تضرّ البطارية نهائياً · والمثالي {iso("16–22°")}</>, color: C.hot },
  { a: SEG.case[0], b: SEG.case[1], chip: "العادة 2", title: "تشحنه وهو بالكفر", sub: <>لو سخن وقت الشحن… شيل الكفر</>, color: C.warm },
  { a: SEG.zero[0], b: SEG.zero[1], chip: "العادة 3", title: "تفضّيه لين الصفر", sub: <>ما يحتاج… اشحنه متى ما بغيت</>, color: "#FF4F7B" },
  { a: SEG.limit[0], b: SEG.limit[1], chip: "العادة 4", title: <>{iso("100%")} كل ليلة</>, sub: <>فعّل حد الشحن: يوقف عند {iso("80%")}</>, color: C.cool },
  { a: SEG.sum[0], b: SEG.sum[1], chip: "الخلاصة", title: "احفظها وطبّقها", sub: <>وأرسلها لأحد يخلّي جواله بالسيارة</>, color: C.ok },
];
const Block: React.FC<{ f: number; k: B }> = ({ f, k }) => {
  if (f < k.a - 2 || f > k.b + 2) return null;
  const lf = f - k.a;
  const first = k.a === 0;
  const out = ease(f, k.b - 10, 10, IN);
  const pc = first ? 1 : ease(lf, 4, 14, BACK);
  const pt = first ? ease(lf, 0, 14, OUT) : ease(lf, 8, 18, OUT);
  const ps = ease(lf, first ? 10 : 20, 16, OUT);
  return (
    <div style={{ position: "absolute", inset: 0, direction: "rtl", opacity: 1 - out, transform: `translateY(${-out * 40}px)` }}>
      <div style={{ position: "absolute", top: 190, right: 80, padding: "6px 24px 10px", borderRadius: 999, background: k.color ?? C.cool, color: "#fff", font: `700 30px ${BODY}`, transform: `scale(${pc})`, transformOrigin: "right center", whiteSpace: "nowrap", boxShadow: `0 0 30px ${k.color ?? C.cool}66` }}>{k.chip}</div>
      <div style={{ position: "absolute", top: 248, right: 74, left: 40, overflow: "hidden", padding: "0 6px 18px" }}>
        <div style={{ font: `800 92px/1.35 ${DISPLAY}`, color: "#fff", whiteSpace: "nowrap", transform: `translateY(${(1 - pt) * 110}%)`, textShadow: "0 6px 30px rgba(0,0,0,.5)" }}>{k.title}</div>
      </div>
      <div style={{ position: "absolute", top: 392, right: 80, left: 40, font: `700 38px/1.45 ${BODY}`, color: "rgba(255,255,255,.86)", opacity: ps, transform: `translateY(${(1 - ps) * 20}px)` }}>{k.sub}</div>
    </div>
  );
};
export const Titles: React.FC<{ f: number }> = ({ f }) => (
  <>
    {BLOCKS.map((k) => (
      <Block key={k.a} f={f} k={k} />
    ))}
  </>
);

/* ───── تعليقات مكانها على العناصر ───── */
const Tag: React.FC<{ x: number; y: number; p: number; bg: string; children: React.ReactNode; size?: number }> = ({ x, y, p, bg, children, size = 34 }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${p})`, padding: "8px 22px 12px", borderRadius: 16, background: bg, color: "#fff", font: `700 ${size}px ${BODY}`, whiteSpace: "nowrap", direction: "rtl", boxShadow: "0 10px 30px rgba(0,0,0,.35)" }}>
      {children}
    </div>
  );
export const Labels: React.FC<{ f: number }> = ({ f }) => {
  const l = (k: SegK) => f - SEG[k][0];
  const outOf = (k: SegK) => 1 - ease(f, SEG[k][1] - 12, 10, OUT);
  const heat = l("heat");
  const zero = l("zero");
  const lim = l("limit");
  const sum = l("sum");
  return (
    <>
      {f >= SEG.heat[0] && f < SEG.heat[1] ? (
        <>
          <Tag x={812} y={668} p={ease(heat, 150, 14, BACK) * outOf("heat")} bg={C.hot}>{iso("35°+")}</Tag>
          <Tag x={360} y={1400} p={ease(heat, 190, 14, BACK) * outOf("heat")} bg="rgba(255,255,255,.14)" size={32}>السعة تنقص… وما ترجع</Tag>
        </>
      ) : null}
      {f >= SEG.zero[0] && f < SEG.zero[1] ? (
        <>
          <Tag x={540} y={1250} p={ease(zero, 70, 12, BACK) * (1 - ease(zero, 112, 10, OUT))} bg={C.hot}>{iso("0%")} ما يفيدها</Tag>
          <Tag x={790} y={1180} p={ease(zero, 140, 12, BACK) * (1 - ease(zero, 172, 10, OUT))} bg="rgba(255,255,255,.16)">{iso("75%")} اليوم</Tag>
          <Tag x={290} y={1180} p={ease(zero, 150, 12, BACK) * (1 - ease(zero, 172, 10, OUT))} bg="rgba(255,255,255,.16)">{iso("25%")} بكرة</Tag>
          <Tag x={540} y={1250} p={ease(zero, 200, 14, BACK) * outOf("zero")} bg={C.ok}>= دورة شحن وحدة</Tag>
        </>
      ) : null}
      {f >= SEG.limit[0] && f < SEG.limit[1] ? (
        <div style={{ position: "absolute", left: 70, right: 70, top: 1300, display: "flex", flexDirection: "column", gap: 12, direction: "rtl", opacity: ease(lim, 90, 16, OUT) * outOf("limit") }}>
          {[
            ["آيفون 15 وأحدث", <>«حد {iso("80%")}» أو «تحسين شحن البطارية»</>],
            ["سامسونج", <>«حماية البطارية» ← الحد الأقصى ({iso("80%")})</>],
          ].map(([a, b], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 24px 14px", borderRadius: 18, background: "rgba(10,20,50,.72)", border: "2px solid rgba(79,195,255,.35)", font: `700 30px ${BODY}`, color: "#fff", transform: `translateX(${(1 - ease(lim, 90 + i * 12, 16, OUT)) * 60}px)` }}>
              <span style={{ color: C.cool, whiteSpace: "nowrap" }}>{a}:</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      ) : null}
      {f >= SEG.sum[0] && f < SEG.sum[1] ? (
        <>
          {[
            [837, 965, "برّده"],
            [243, 965, "شيل الكفر"],
            [837, 1418, "اشحن متى ما بغيت"],
            [243, 1418, <>حد {iso("80%")}</>],
          ].map(([x, y, t], i) => (
            <Tag key={i} x={x as number} y={y as number} p={ease(sum, 24 + i * 14, 14, BACK) * outOf("sum")} bg="rgba(255,255,255,.14)" size={32}>
              {t}
            </Tag>
          ))}
        </>
      ) : null}
    </>
  );
};

/* ───── الختام ───── */
export const End: React.FC<{ f: number }> = ({ f }) => {
  const [a] = SEG.end;
  if (f < a + 10) return null;
  const pn = ease(f, a + 40, 18, OUT);
  const pc = ease(f, a + 56, 18, OUT);
  const ph = ease(f, a + 70, 18, BACK);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, direction: "rtl", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 1236, left: 0, right: 0, font: `800 84px/1.3 ${DISPLAY}`, color: "#fff", opacity: pn, transform: `translateY(${(1 - pn) * 30}px)` }}>علي التميمي</div>
      <div style={{ position: "absolute", top: 1352, left: 0, right: 0, font: `700 36px/1.4 ${BODY}`, color: "rgba(255,255,255,.85)", opacity: pc }}>تابعني… كل يوم معلومة تقنية تفرق معك</div>
      <div style={{ position: "absolute", top: 1420, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${ph})` }}>
        <div style={{ padding: "10px 32px", borderRadius: 999, background: "#0E8C82" }}>
          <HandlesRow size={30} color="#fff" />
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

export const Shade: React.FC = () => <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 560, background: "linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,0))" }} />;
