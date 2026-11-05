import React, { useMemo } from "react";
import { Img } from "remotion";
import { BACK, BODY, EN, GROUND, IN_OUT, OUT, P, SEED, SEG, V, WEEK, WeekK, ease } from "./theme";

/* ───── الكاميرا: تطلع مع النبتة من تحت الأرض لين القمة، وبعدها تبتعد ───── */
export type Cam = { cy: number; s: number; sy: number };
const clampN = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const mix = (a: Cam, b: Cam, t: number): Cam => ({
  cy: a.cy + (b.cy - a.cy) * t,
  sy: a.sy + (b.sy - a.sy) * t,
  s: Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * t),
});
const drift = (base: Cam, f: number, a: number, len: number): Cam => ({ ...base, cy: base.cy - 0.12 * clampN(f - a, 0, len) });

export const camAt = (f: number): Cam => {
  const W1: Cam = { cy: 3040, s: 1, sy: 1060 };
  const W2: Cam = { cy: 2330, s: 1, sy: 1060 };
  const W3: Cam = { cy: 1480, s: 1, sy: 1060 };
  const W4: Cam = { cy: 930, s: 1, sy: 1060 };
  const SUM: Cam = { cy: 2025, s: 0.36, sy: 1060 };
  const END: Cam = { cy: 2025, s: 0.3, sy: 1400 };
  let c = drift(W1, f, SEG.w1[0], 270);
  c = mix(c, drift(W2, f, SEG.w2[0], 270), ease(f, SEG.w2[0] - 6, 36, IN_OUT));
  c = mix(c, drift(W3, f, SEG.w3[0], 270), ease(f, SEG.w3[0] - 6, 36, IN_OUT));
  c = mix(c, drift(W4, f, SEG.w4[0], 270), ease(f, SEG.w4[0] - 6, 36, IN_OUT));
  c = mix(c, SUM, ease(f, SEG.sum[0] - 6, 44, IN_OUT));
  c = mix(c, END, ease(f, SEG.end[0] - 6, 40, IN_OUT));
  return c;
};
/** إحداثيات الشاشة لنقطة في العالم */
export const toScreen = (c: Cam, x: number, y: number) => ({ x: 540 + (x - 540) * c.s, y: c.sy + (y - c.cy) * c.s });

/* ───── مولّد ثابت ───── */
const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

/* ───── أشكال النبتة (إحداثيات العالم) ───── */
const STEM_D = "M500 2700 C 500 2400, 525 2200, 510 1900 S 485 1500, 500 1200 S 515 900, 500 690";
const STEM_LEN_Y = 2700 - 690;
/** ارتفاع قمة الساق مع الوقت */
const stemTop = (f: number) => {
  const a = ease(f, SEG.w2[0] + 6, 230, OUT) * (2700 - 1900);
  const b = ease(f, SEG.w3[0] + 20, 210, OUT) * (1900 - 1060);
  const c = ease(f, SEG.w4[0] + 16, 110, OUT) * (1060 - 690);
  return 2700 - a - b - c;
};

const ROOTS = [
  { d: "M500 2700 C 505 2850, 485 3000, 500 3170", w: 15, at: 4, dur: 150 },
  { d: "M500 2730 C 430 2790, 300 2830, 230 2990", w: 11, at: 24, dur: 120 },
  { d: "M500 2750 C 580 2820, 720 2870, 790 3070", w: 11, at: 44, dur: 120 },
  { d: "M502 2930 C 450 2980, 400 3040, 370 3150", w: 6, at: 70, dur: 90 },
  { d: "M498 3050 C 560 3100, 620 3150, 640 3240", w: 6, at: 90, dur: 90 },
  { d: "M360 2850 C 340 2880, 300 2900, 250 2890", w: 5, at: 80, dur: 70 },
  { d: "M680 2880 C 700 2920, 740 2930, 770 2920", w: 5, at: 96, dur: 70 },
  { d: "M300 2940 C 290 2980, 270 3020, 280 3070", w: 4, at: 110, dur: 60 },
  { d: "M740 2990 C 720 3030, 700 3060, 700 3110", w: 4, at: 120, dur: 60 },
  { d: "M500 3120 C 470 3150, 440 3180, 420 3230", w: 4, at: 130, dur: 60 },
];

export const ROOT_TIPS: { x: number; y: number; t1: string; t2: string; at: number }[] = [
  { x: 230, y: 2990, t1: "يتوقّع الكلمة الجاية", t2: "ما يعرف مثل الإنسان", at: 70 },
  { x: 790, y: 3070, t1: "يغلط بثقة", t2: "تأكد من أي رقم مهم", at: 100 },
  { x: 500, y: 3170, t1: "لا تعطيه بياناتك الحساسة", t2: "كلمات سر، هويات، عملاء", at: 130 },
];

type LeafSpec = { y: number; side: 1 | -1; at: number; key: string; ex: string };
export const LEAVES: LeafSpec[] = [
  { y: 2430, side: -1, at: 36, key: "الدور", ex: "«أنت معلّم فيزياء»" },
  { y: 2340, side: 1, at: 66, key: "السياق", ex: "«عندي اختبار بكرة»" },
  { y: 2190, side: -1, at: 96, key: "المهمة", ex: "«اشرح قانون نيوتن الثاني»" },
  { y: 2090, side: 1, at: 126, key: "شكل الجواب", ex: "«بمثال وثلاثة أسئلة»" },
];

type FlowerSpec = { d: string; x: number; y: number; logo: string; name: string; use: string; at: number };
export const FLOWERS: FlowerSpec[] = [
  { d: "M508 1800 C 440 1770, 360 1720, 300 1650", x: 290, y: 1610, logo: "openai.svg", name: "ChatGPT", use: "كتابة وأفكار", at: 36 },
  { d: "M512 1700 C 590 1660, 690 1600, 750 1530", x: 760, y: 1490, logo: "claude-color.svg", name: "Claude", use: "شرح ونصوص طويلة", at: 66 },
  { d: "M505 1480 C 440 1440, 380 1380, 330 1330", x: 320, y: 1290, logo: "gemini-color.svg", name: "Gemini", use: "مع أدوات قوقل", at: 96 },
  { d: "M502 1360 C 570 1320, 660 1260, 720 1210", x: 730, y: 1170, logo: "perplexity-color.svg", name: "Perplexity", use: "بحث بمصادر", at: 126 },
];

type FruitSpec = { d: string; x: number; y: number; t: string; at: number };
export const FRUITS: FruitSpec[] = [
  { d: "M503 960 C 440 930, 340 880, 282 800", x: 272, y: 830, t: "ملخصات لمادتك", at: 70 },
  { d: "M500 1010 C 570 980, 680 930, 742 850", x: 752, y: 880, t: "بنك أسئلة للاختبار", at: 100 },
  { d: "M502 1120 C 430 1090, 330 1040, 270 990", x: 262, y: 1020, t: "خطة مذاكرة أسبوعية", at: 130 },
];

/** ورقة تشير لليمين، طولها ~180 */
const LEAF_D = "M0 0 C 50 -66, 140 -66, 182 0 C 140 44, 50 44, 0 0 Z";

const Grow: React.FC<{ d: string; w: number; color: string; p: number; o?: number }> = ({ d, w, color, p, o = 1 }) =>
  p <= 0 ? null : (
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} opacity={o} />
  );

/* ───── الخلفية: سما وغيوم وأرض بطبقات وحصى ───── */
const Ground: React.FC<{ f: number }> = ({ f }) => {
  const pebbles = useMemo(() => {
    const r = rng(11);
    return Array.from({ length: 70 }, () => ({ x: r() * 1080, y: GROUND + 60 + r() * 1500, rx: 8 + r() * 18, ry: 5 + r() * 10, c: r() < 0.5 ? "#8A6446" : "#4A3222", a: r() * 180 }));
  }, []);
  const tufts = useMemo(() => {
    const r = rng(5);
    return Array.from({ length: 46 }, (_, i) => ({ x: i * 24 + r() * 10, h: 16 + r() * 22, l: r() < 0.5 }));
  }, []);
  const cloud = (cx: number, cy: number, k: number, sp: number) => {
    const x = cx + ((f * sp) % 1400);
    const xx = x > 1240 ? x - 1400 : x;
    return (
      <g transform={`translate(${xx} ${cy}) scale(${k})`} opacity={0.75}>
        <ellipse cx={0} cy={0} rx={90} ry={36} fill="#fff" />
        <ellipse cx={-50} cy={-22} rx={50} ry={36} fill="#fff" />
        <ellipse cx={34} cy={-34} rx={56} ry={44} fill="#fff" />
      </g>
    );
  };
  return (
    <>
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2={GROUND} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={P.sky0} />
          <stop offset="0.55" stopColor={P.sky1} />
          <stop offset="1" stopColor={P.sky2} />
        </linearGradient>
        <linearGradient id="soil" x1="0" x2="0" y1={GROUND} y2={GROUND + 1700} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={P.soil0} />
          <stop offset="0.4" stopColor={P.soil1} />
          <stop offset="1" stopColor={P.soil2} />
        </linearGradient>
      </defs>
      <rect x={-2000} y={-3000} width={5080} height={GROUND + 3000} fill="url(#sky)" />
      {cloud(120, 520, 1.2, 0.25)}
      {cloud(760, 1060, 0.9, 0.18)}
      {cloud(260, 1720, 1.05, 0.22)}
      {cloud(840, 2230, 0.8, 0.3)}
      {cloud(80, 2420, 0.7, 0.2)}
      <rect x={-2000} y={GROUND} width={5080} height={5000} fill="url(#soil)" />
      {[2900, 3260, 3720].map((y, i) => (
        <path key={y} d={`M-40 ${y} C 200 ${y - 30}, 420 ${y + 26}, 640 ${y - 8} S 980 ${y + 20}, 1120 ${y}`} stroke={i % 2 ? "#6A4630" : "#4E3423"} strokeWidth={22} fill="none" opacity={0.45} />
      ))}
      {pebbles.map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} fill={p.c} opacity={0.55} transform={`rotate(${p.a} ${p.x} ${p.y})`} />
      ))}
      {/* العشب */}
      <path d={`M-40 ${GROUND + 10} ${Array.from({ length: 24 }, (_, i) => `Q ${i * 48 + 24} ${GROUND - 12} ${i * 48 + 48} ${GROUND + 6}`).join(" ")} L 1120 ${GROUND + 26} L -40 ${GROUND + 26} Z`} fill={P.grass} />
      {tufts.map((t, i) => (
        <path key={i} d={`M${t.x} ${GROUND + 4} l ${t.l ? -6 : 6} ${-t.h} l ${t.l ? 14 : -2} ${t.h}`} fill={i % 3 ? P.grass : P.grass2} />
      ))}
      <rect x={-2000} y={GROUND + 22} width={5080} height={10} fill={P.grass2} opacity={0.6} />
    </>
  );
};

/* ───── العالم كاملاً ───── */
export const World: React.FC<{ f: number; cam: Cam; kick: number }> = ({ f, cam, kick }) => {
  const w1 = f - SEG.w1[0];
  const w2 = f - SEG.w2[0];
  const w3 = f - SEG.w3[0];
  const w4 = f - SEG.w4[0];
  const top = stemTop(f);
  const stemP = (2700 - top) / STEM_LEN_Y;
  const seedIn = ease(f, SEG.hook[1] - 6, 10, OUT);
  const sway = (i: number) => Math.sin(f / 22 + i * 1.7) * 3;
  /** تعليقات الأسبوع تختفي لما يبدأ اللي بعده */
  const labelsO = (k: WeekK) => {
    const nxt = { w1: SEG.w2[0], w2: SEG.w3[0], w3: SEG.w4[0], w4: SEG.sum[0] }[k];
    return 1 - ease(f, nxt - 8, 14, OUT);
  };
  const tx = 540 - 540 * cam.s;
  const ty = cam.sy - cam.cy * cam.s;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 5000, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${cam.s})` }}>
      <svg width={1080} height={5000} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <Ground f={f} />
        {/* الجذور */}
        {ROOTS.map((r, i) => (
          <Grow key={i} d={r.d} w={r.w} color={P.root} p={ease(w1, r.at, r.dur, OUT)} o={0.95} />
        ))}
        {ROOT_TIPS.map((t, i) => {
          const p = ease(w1, t.at, 12, BACK);
          return p > 0 ? <circle key={i} cx={t.x} cy={t.y} r={9 + kick * 4} fill={WEEK.w1.color} stroke={P.cream} strokeWidth={4} opacity={labelsO("w1") * p} /> : null;
        })}
        {/* البذرة */}
        <g opacity={seedIn} transform={`translate(${SEED.x} ${SEED.y - (1 - seedIn) * 160})`}>
          <ellipse rx={30} ry={20} fill="#8B5E34" />
          <ellipse rx={12} ry={6} cx={-8} cy={-7} fill="#B07C4A" />
        </g>
        {/* الساق */}
        <Grow d={STEM_D} w={30} color={P.stem} p={stemP} />
        <Grow d={STEM_D} w={8} color="#7CC07F" p={stemP * 0.995} o={0.55} />
        {/* أغصان الأسبوع 3 والثمار */}
        {FLOWERS.map((b, i) => (
          <Grow key={i} d={b.d} w={14} color={P.stem} p={ease(w3, b.at - 26, 30, OUT)} />
        ))}
        {FRUITS.map((b, i) => (
          <Grow key={i} d={b.d} w={11} color={P.stem} p={ease(w4, b.at - 26, 28, OUT)} />
        ))}
        {/* الأوراق */}
        {LEAVES.map((l, i) => {
          const p = ease(w2, l.at, 16, BACK);
          if (p <= 0) return null;
          return (
            <g key={i} transform={`translate(${505} ${l.y}) scale(${l.side * p} ${p}) rotate(${-28 + sway(i)})`}>
              <path d={LEAF_D} fill={i % 2 ? P.leaf : P.leaf2} />
              <path d="M4 0 Q 90 -10 176 0" stroke={P.stem} strokeWidth={4} fill="none" opacity={0.6} />
            </g>
          );
        })}
        {/* أوراق صغيرة إضافية على الساق العالي */}
        {[1600, 1250, 980].map((y, i) => {
          const p = ease(f, SEG.w3[0] + 60 + i * 50, 16, BACK);
          return p > 0 ? (
            <g key={y} transform={`translate(502 ${y}) scale(${(i % 2 ? 1 : -1) * p * 0.6} ${p * 0.6}) rotate(${-30 + sway(i + 4)})`}>
              <path d={LEAF_D} fill={P.leaf2} />
            </g>
          ) : null;
        })}
      </svg>

      {/* تعليقات الجذور */}
      {ROOT_TIPS.map((t, i) => {
        const p = ease(w1, t.at + 4, 18, OUT);
        if (p <= 0) return null;
        const wd = i === 2 ? 460 : 340;
        const left = Math.min(Math.max(t.x - wd / 2, 50), 1080 - 140 - wd);
        return (
          <div key={i} style={{ position: "absolute", left, top: t.y + 22, width: wd, textAlign: "center", direction: "rtl", textShadow: "0 2px 10px rgba(40,24,12,.85)", opacity: p * labelsO("w1"), transform: `translateY(${(1 - p) * 24}px)` }}>
            <div style={{ font: `700 36px/1.35 ${BODY}`, color: P.cream }}>{t.t1}</div>
            <div style={{ font: `600 28px/1.4 ${BODY}`, color: "#E6CFA8" }}>{t.t2}</div>
          </div>
        );
      })}

      {/* تعليقات الأوراق: خانات البرومبت */}
      {LEAVES.map((l, i) => {
        const p = ease(w2, l.at + 8, 18, OUT);
        if (p <= 0) return null;
        const right = l.side === 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: l.y - 150,
              left: right ? 690 : 40,
              width: right ? 250 : 300,
              textAlign: right ? "left" : "right",
              direction: "rtl",
              opacity: p * labelsO("w2"),
              transform: `translateX(${(1 - p) * (right ? 30 : -30)}px)`,
            }}
          >
            <div style={{ font: `700 38px/1.3 ${BODY}`, color: WEEK.w2.color }}>{l.key}</div>
            <div style={{ font: `600 29px/1.4 ${BODY}`, color: P.ink }}>{l.ex}</div>
          </div>
        );
      })}

      {/* أزهار الأدوات */}
      {FLOWERS.map((b, i) => {
        const p = ease(w3, b.at, 18, BACK);
        if (p <= 0) return null;
        const lp = ease(w3, b.at + 10, 16, OUT) * labelsO("w3");
        const pulse = 1 + kick * 0.04;
        return (
          <div key={i} style={{ position: "absolute", left: b.x - 110, top: b.y - 110, width: 220, height: 220 }}>
            <svg width={220} height={220} style={{ position: "absolute", inset: 0, transform: `scale(${p * pulse}) rotate(${f * 0.3 + i * 20}deg)` }}>
              {Array.from({ length: 8 }, (_, k) => (
                <ellipse key={k} cx={110} cy={38} rx={30} ry={46} fill={k % 2 ? "#DCE5FF" : "#C9D7FF"} transform={`rotate(${k * 45} 110 110)`} />
              ))}
            </svg>
            <div style={{ position: "absolute", left: 44, top: 44, width: 132, height: 132, borderRadius: 66, background: "#fff", display: "grid", placeItems: "center", transform: `scale(${p})`, boxShadow: "0 8px 20px rgba(43,31,71,.18)" }}>
              <Img src={V(b.logo)} style={{ width: 78, height: 78 }} />
            </div>
            <div style={{ position: "absolute", top: 222, left: -40, width: 300, textAlign: "center", direction: "rtl", opacity: lp }}>
              <div style={{ font: `700 34px/1.2 ${EN}`, color: P.ink, direction: "ltr" }}>{b.name}</div>
              <div style={{ font: `600 29px/1.4 ${BODY}`, color: WEEK.w3.color }}>{b.use}</div>
            </div>
          </div>
        );
      })}

      {/* زهرة القمة */}
      {(() => {
        const p = ease(w4, 112, 20, BACK);
        if (p <= 0) return null;
        return (
          <svg width={300} height={300} style={{ position: "absolute", left: 500 - 150, top: 690 - 150, transform: `scale(${p * (1 + kick * 0.03)}) rotate(${-f * 0.2}deg)` }}>
            {Array.from({ length: 10 }, (_, k) => (
              <ellipse key={k} cx={150} cy={58} rx={40} ry={62} fill={k % 2 ? P.petal : "#F7A6BF"} transform={`rotate(${k * 36} 150 150)`} />
            ))}
            <circle cx={150} cy={150} r={46} fill={P.core} />
            <circle cx={136} cy={138} r={14} fill="#FFE7A0" />
          </svg>
        );
      })()}

      {/* الثمار: أفكار المشروع */}
      {FRUITS.map((b, i) => {
        const p = ease(w4, b.at, 18, BACK);
        if (p <= 0) return null;
        const lp = ease(w4, b.at + 10, 16, OUT) * labelsO("w4");
        return (
          <div key={i} style={{ position: "absolute", left: b.x - 160, top: b.y - 50, width: 320 }}>
            <svg width={320} height={110} style={{ display: "block", transform: `scale(${p})`, transformOrigin: "160px 20px" }}>
              <circle cx={160} cy={58} r={48} fill={P.fruit} />
              <circle cx={144} cy={42} r={14} fill="#FFC27A" />
              <path d="M160 12 C 176 0, 196 4, 204 14 C 190 22, 172 22, 160 12 Z" fill={P.leaf2} />
            </svg>
            <div style={{ textAlign: "center", direction: "rtl", font: `700 32px/1.35 ${BODY}`, color: P.ink, opacity: lp, marginTop: 2 }}>{b.t}</div>
          </div>
        );
      })}
    </div>
  );
};
