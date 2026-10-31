import React from "react";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { BACK, BODY, DISPLAY, IN, OUT, P, SEG, VISIT, ease } from "./theme";

export const TAG = "Perplexity · البحث بالمصادر";

type B = { a: number; b: number; chip: string; title: string; sub: string; size?: number; color?: string };
const BLOCKS: B[] = [
  { a: 0, b: SEG.hook[1], chip: TAG, title: "من وين جاب الكلام؟", sub: "الذكاء الاصطناعي يجاوب بثقة… حتى لو غلط", color: P.bad },
  { a: SEG.ans[0], b: SEG.ans[1], chip: "الفكرة", title: "جواب… ومعه أرقام", sub: "كل رقم صغير يوديك للمصدر الأصلي" },
  { a: SEG.strings[0], b: SEG.strings[1], chip: "اضغط الرقم", title: "وروح للمصدر بنفسك", sub: "جهة رسمية؟ جريدة؟ ولا منتدى؟" },
  { a: VISIT[0], b: VISIT[1], chip: "قبل ما تصدّق · 1", title: "مين الكاتب؟", sub: "جهة رسمية أوثق من منتدى مجهول", color: P.ok },
  { a: VISIT[1], b: VISIT[2], chip: "قبل ما تصدّق · 2", title: "متى انكتب؟", sub: "القديم يضلّل، خصوصاً في الأنظمة", color: P.amber },
  { a: VISIT[2], b: SEG.check[1], chip: "قبل ما تصدّق · 3", title: "الكلام موجود فعلاً؟", sub: "افتح المصدر وتأكد إن الجملة مكتوبة فيه", color: P.bad },
  { a: SEG.more[0], b: SEG.more[1], chip: "كمّل التحقيق", title: "اسأل سؤال متابعة", sub: "وللتقرير الطويل: وضع Research" },
  { a: SEG.prompt[0], b: SEG.prompt[1], chip: "جرّبه الحين", title: "حط المصدر في سؤالك", sub: "", size: 78 },
];

const Block: React.FC<{ f: number; k: B }> = ({ f, k }) => {
  if (f < k.a - 2 || f > k.b + 2) return null;
  const lf = f - k.a;
  const first = k.a === 0;
  const out = ease(f, k.b - 10, 10, IN);
  const pc = first ? 1 : ease(lf, 4, 14, BACK);
  const pt = first ? ease(lf, 0, 16, OUT) : ease(lf, 8, 18, OUT);
  const ps = ease(lf, first ? 12 : 20, 16, OUT);
  return (
    <div style={{ position: "absolute", inset: 0, direction: "rtl", opacity: 1 - out, transform: `translateY(${-out * 40}px)` }}>
      <div style={{ position: "absolute", top: 190, right: 80, padding: "6px 24px 10px", borderRadius: 999, background: k.color ?? P.teal, color: "#fff", font: `700 30px ${BODY}`, transform: `scale(${pc})`, transformOrigin: "right center", whiteSpace: "nowrap" }}>{k.chip}</div>
      <div style={{ position: "absolute", top: 248, right: 74, left: 50, overflow: "hidden", padding: "0 6px 18px" }}>
        <div style={{ font: `900 ${k.size ?? 92}px/1.5 ${DISPLAY}`, color: "#fff", whiteSpace: "nowrap", transform: `translateY(${(1 - pt) * 110}%)`, textShadow: "0 4px 18px rgba(0,0,0,.45)" }}>{k.title}</div>
      </div>
      {k.sub ? (
        <div style={{ position: "absolute", top: 410, right: 80, left: 50, font: `700 38px/1.4 ${BODY}`, color: "#F6EBDD", opacity: ps, transform: `translateY(${(1 - ps) * 20}px)`, textShadow: "0 2px 10px rgba(0,0,0,.5)" }}>{k.sub}</div>
      ) : null}
    </div>
  );
};

/** تعتيم فوق عشان العناوين تنقرأ على الفلّين */
export const Shade: React.FC<{ f: number }> = ({ f }) => {
  const o = 1 - ease(f, SEG.end[0] - 6, 20, OUT) * 0.6;
  return <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 640, opacity: o, background: "linear-gradient(180deg, rgba(36,22,10,.92) 0%, rgba(36,22,10,.78) 55%, rgba(36,22,10,0) 100%)" }} />;
};

export const Titles: React.FC<{ f: number }> = ({ f }) => (
  <>
    {BLOCKS.map((k) => (
      <Block key={k.a} f={f} k={k} />
    ))}
  </>
);

/* ───── الختام ───── */
export const End: React.FC<{ f: number }> = ({ f }) => {
  const [a] = SEG.end;
  if (f < a + 10) return null;
  const pn = ease(f, a + 30, 18, OUT);
  const pc = ease(f, a + 46, 18, OUT);
  const ph = ease(f, a + 60, 18, BACK);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, direction: "rtl", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 1050, left: 0, right: 0, height: 470, background: "linear-gradient(180deg, rgba(36,22,10,0), rgba(36,22,10,.82) 22%, rgba(36,22,10,.88))", opacity: pn }} />
      <div style={{ position: "absolute", top: 1110, left: 0, right: 0, font: `900 88px/1.5 ${DISPLAY}`, color: "#fff", opacity: pn, transform: `translateY(${(1 - pn) * 30}px)` }}>علي التميمي</div>
      <div style={{ position: "absolute", top: 1262, left: 0, right: 0, font: `700 40px/1.4 ${BODY}`, color: "#F6EBDD", opacity: pc, transform: `translateY(${(1 - pc) * 20}px)` }}>
        تابعني… وكل يوم ملف جديد
      </div>
      <div style={{ position: "absolute", top: 1350, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${ph})` }}>
        <div style={{ padding: "12px 34px", borderRadius: 999, background: P.teal }}>
          <HandlesRow size={32} color="#fff" />
        </div>
      </div>
    </div>
  );
};

/* ───── الحسابان تحت ───── */
export const Footer: React.FC<{ f: number }> = ({ f }) => {
  const o = ease(f, 8, 12) * (1 - ease(f, SEG.end[0], 10));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 1474, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ padding: "8px 24px", borderRadius: 999, background: "rgba(31,27,22,.82)" }}>
        <HandlesRow size={26} color="#fff" />
      </div>
    </div>
  );
};
