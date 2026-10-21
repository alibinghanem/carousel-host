import React from "react";
import { Img, staticFile } from "remotion";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { Cam, toScreen } from "./Tree";
import { BACK, BODY, DISPLAY, IN, OUT, P, SEG, SegK, V, WEEK, WEEKS, WeekK, ease } from "./theme";

const TAG = "مهارات · تعلّم في 30 يوم";

/* ───── الهوك: نبتة حقيقية، والصورة تنكمش وتصير البذرة ───── */
export const Hook: React.FC<{ f: number }> = ({ f }) => {
  if (f > SEG.hook[1] + 2) return null;
  const k = Math.pow(ease(f, SEG.hook[1] - 26, 26, (x) => x), 1.6);
  const r = 1300 - k * 1270;
  const cx = 540 - k * 40;
  const cy = 960 - k * 240;
  const txt = 1 - ease(f, SEG.hook[1] - 30, 10, OUT);
  const line = (at: number) => ({ p: ease(f, at, 14, OUT) });
  const l1 = line(0);
  const l2 = line(6);
  const l3 = ease(f, 26, 16, BACK);
  return (
    <div style={{ position: "absolute", inset: 0, clipPath: `circle(${r}px at ${cx}px ${cy}px)` }}>
      <Img src={V("sprout.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 50%", transform: `scale(${1.06 + f * 0.0011})` }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.15) 38%, rgba(255,255,255,0) 60%)" }} />
      <div style={{ position: "absolute", top: 196, left: 0, right: 0, textAlign: "center", opacity: txt, font: `600 28px ${BODY}`, color: P.sub }}>{TAG}</div>
      <div style={{ position: "absolute", top: 250, left: 0, right: 0, textAlign: "center", opacity: txt, direction: "rtl" }}>
        <div style={{ font: `700 52px/1.4 ${BODY}`, color: P.ink, opacity: l1.p, transform: `translateY(${(1 - l1.p) * 30}px)` }}>ما تعرف شي عن</div>
        <div style={{ font: `700 80px/1.45 ${DISPLAY}`, color: P.ink, opacity: l2.p, transform: `translateY(${(1 - l2.p) * 30}px)` }}>الذكاء الاصطناعي؟</div>
        <div style={{ font: `700 108px/1.45 ${DISPLAY}`, color: P.ink, transform: `scale(${l3})`, opacity: l3 > 0 ? 1 : 0, whiteSpace: "nowrap" }}>
          عطني <span style={{ color: WEEK.w4.color }}>30</span> يوم
        </div>
      </div>
    </div>
  );
};

/* ───── كتلة العنوان: شارة الأسبوع، العنوان، المهمة ───── */
const Block: React.FC<{ f: number; k: SegK; chip: string; color: string; title: string; task: string }> = ({ f, k, chip, color, title, task }) => {
  const [a, b] = SEG[k];
  if (f < a - 2 || f > b + 2) return null;
  const lf = f - a;
  const out = ease(f, b - 10, 10, IN);
  const pc = ease(lf, 4, 14, BACK);
  const pt = ease(lf, 8, 18, OUT);
  const pk = ease(lf, 22, 16, OUT);
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, direction: "rtl", opacity: 1 - out, transform: `translateY(${-out * 40}px)` }}>
      <div style={{ position: "absolute", top: 192, right: 80, padding: "6px 24px 10px", borderRadius: 999, background: color, color: "#fff", font: `700 30px ${BODY}`, transform: `scale(${pc})`, transformOrigin: "right center" }}>{chip}</div>
      <div style={{ position: "absolute", top: 246, right: 76, left: 60, overflow: "hidden", padding: "0 6px 14px" }}>
        <div style={{ font: `700 ${k === "sum" ? 80 : 98}px/1.45 ${DISPLAY}`, color: P.ink, whiteSpace: "nowrap", transform: `translateY(${(1 - pt) * 110}%)` }}>{title}</div>
      </div>
      <div style={{ position: "absolute", top: 398, right: 80, left: 60, font: `700 38px/1.4 ${BODY}`, color: P.sub, opacity: pk, transform: `translateY(${(1 - pk) * 20}px)` }}>{task}</div>
    </div>
  );
};

export const Titles: React.FC<{ f: number }> = ({ f }) => (
  <>
    {WEEKS.map((k, i) => (
      <Block key={k} f={f} k={k} chip={`الأسبوع ${i + 1} · ${WEEK[k].part}`} color={WEEK[k].color} title={WEEK[k].title} task={WEEK[k].task} />
    ))}
    <Block f={f} k="sum" chip="الخلاصة" color={P.ink} title="15 دقيقة × 30 يوم" task="أفضل من 20 دورة ما تطبّقها" />
  </>
);

/* ───── وسم الموضوع فوق يسار ───── */
export const Tag: React.FC<{ f: number }> = ({ f }) => {
  const o = ease(f, SEG.w1[0], 14) * (1 - ease(f, SEG.end[0] - 6, 10));
  if (o <= 0) return null;
  return <div style={{ position: "absolute", top: 200, left: 80, font: `600 26px ${BODY}`, color: P.sub, opacity: o * 0.9, direction: "rtl" }}>{TAG}</div>;
};

/* ───── 30 نقطة = 30 يوم، تتعبّى من اليمين بلون كل أسبوع ───── */
const daysAt = (f: number) => {
  let d = 0;
  for (const k of WEEKS) {
    const [a] = SEG[k];
    const [d0, d1] = WEEK[k].days;
    const t = ease(f, a + 20, 220, (x) => x);
    if (f >= a) d = d0 + (d1 - d0) * t;
  }
  return d;
};
const weekOf = (i: number): WeekK => (i < 7 ? "w1" : i < 14 ? "w2" : i < 21 ? "w3" : "w4");

export const Days: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const o = ease(f, SEG.w1[0] + 10, 14) * (1 - ease(f, SEG.end[0] - 6, 10));
  if (o <= 0) return null;
  const d = daysAt(f);
  return (
    <div style={{ position: "absolute", top: 478, left: 0, right: 0, height: 30, opacity: o }}>
      {Array.from({ length: 30 }, (_, i) => {
        const fill = Math.min(1, Math.max(0, d - i));
        const c = WEEK[weekOf(i)].color;
        const x = 930 - i * 29.6 - (i >= 7 ? 6 : 0) - (i >= 14 ? 6 : 0) - (i >= 21 ? 6 : 0);
        const last = fill > 0 && d - i < 1.4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 11,
              top: 4,
              width: 22,
              height: 22,
              borderRadius: 11,
              background: fill > 0 ? c : "rgba(43,31,71,.14)",
              transform: `scale(${0.7 + fill * 0.3 + (last ? kick * 0.25 : 0)})`,
            }}
          />
        );
      })}
    </div>
  );
};

/* ───── الخلاصة: خريطة الأسابيع على الشجرة ───── */
const MAP: { k: WeekK; x: number; y: number; t: string }[] = [
  { k: "w4", x: 560, y: 690, t: "مشروع صغير" },
  { k: "w3", x: 650, y: 1450, t: "الأدوات" },
  { k: "w2", x: 600, y: 2250, t: "البرومبت" },
  { k: "w1", x: 640, y: 3000, t: "الأساسيات" },
];
export const SumMap: React.FC<{ f: number; cam: Cam }> = ({ f, cam }) => {
  const [a, b] = SEG.sum;
  if (f < a + 30 || f > b + 4) return null;
  const out = ease(f, b - 10, 12, IN);
  return (
    <>
      {MAP.map((m, i) => {
        const p = ease(f, a + 40 + i * 10, 16, BACK);
        const s = toScreen(cam, m.x, m.y);
        const bx = 700;
        return (
          <div key={m.k} style={{ position: "absolute", left: 0, top: 0, opacity: 1 - out }}>
            <div style={{ position: "absolute", left: s.x, top: s.y - 2, width: Math.max(0, (bx - s.x) * p), height: 4, background: WEEK[m.k].color, borderRadius: 2 }} />
            <div style={{ position: "absolute", left: s.x - 9, top: s.y - 9, width: 18, height: 18, borderRadius: 9, background: WEEK[m.k].color, transform: `scale(${p})` }} />
            <div
              style={{
                position: "absolute",
                left: bx,
                top: s.y - 30,
                padding: "6px 22px 10px",
                borderRadius: 999,
                background: WEEK[m.k].color,
                color: "#fff",
                font: `700 32px ${BODY}`,
                whiteSpace: "nowrap",
                direction: "rtl",
                transform: `scale(${p})`,
                transformOrigin: "left center",
              }}
            >
              {4 - i} · {m.t}
            </div>
          </div>
        );
      })}
    </>
  );
};

/* ───── الشمس: تنبض طول الفيديو، وفي الختام تكبر وتصير صورة علي ───── */
export const Sun: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const inP = ease(f, SEG.w1[0] + 6, 20, OUT);
  if (inP <= 0) return null;
  const e = ease(f, SEG.end[0] + 4, 34, OUT);
  const x = 110 + (540 - 110) * e;
  const y = 112 + (470 - 112) * e;
  const r = 44 + (160 - 44) * e;
  const face = ease(f, SEG.end[0] + 22, 18, OUT);
  return (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, opacity: inP }}>
      <svg width={r * 4} height={r * 4} style={{ position: "absolute", left: -r, top: -r, transform: `rotate(${f * 0.4}deg) scale(${1 + kick * 0.05})` }}>
        {Array.from({ length: 16 }, (_, k) => (
          <rect key={k} x={r * 2 - 5} y={r * 0.35} width={10} height={r * 0.42} rx={5} fill="#FFC94D" opacity={0.85} transform={`rotate(${k * 22.5} ${r * 2} ${r * 2})`} />
        ))}
      </svg>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%, #FFE79A, #FFC23D)", boxShadow: `0 0 ${40 + kick * 30}px rgba(255,196,61,.65)` }} />
      <div style={{ position: "absolute", inset: 8 * e, borderRadius: "50%", overflow: "hidden", opacity: face, background: "#F3E6D2" }}>
        <Img src={staticFile("avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%" }} />
      </div>
    </div>
  );
};

/* ───── الختام ───── */
export const End: React.FC<{ f: number }> = ({ f }) => {
  const [a] = SEG.end;
  if (f < a + 20) return null;
  const pn = ease(f, a + 36, 18, OUT);
  const pc = ease(f, a + 52, 18, OUT);
  const ph = ease(f, a + 66, 18, BACK);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, direction: "rtl", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 660, left: 0, right: 0, font: `700 88px/1.45 ${DISPLAY}`, color: P.ink, opacity: pn, transform: `translateY(${(1 - pn) * 30}px)` }}>علي التميمي</div>
      <div style={{ position: "absolute", top: 806, left: 0, right: 0, font: `700 42px/1.4 ${BODY}`, color: P.sub, opacity: pc, transform: `translateY(${(1 - pc) * 20}px)` }}>
        تابعني… وكل يوم أسقيك معلومة
      </div>
      <div style={{ position: "absolute", top: 892, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${ph})` }}>
        <div style={{ padding: "12px 34px", borderRadius: 999, background: P.ink }}>
          <HandlesRow size={34} color="#fff" />
        </div>
      </div>
    </div>
  );
};

/* ───── الحسابان تحت طول الأسابيع ───── */
export const Footer: React.FC<{ f: number }> = ({ f }) => {
  const o = ease(f, 8, 12) * (1 - ease(f, SEG.end[0], 10));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 1474, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ padding: "8px 24px", borderRadius: 999, background: "rgba(43,31,71,.72)" }}>
        <HandlesRow size={26} color="#fff" />
      </div>
    </div>
  );
};
