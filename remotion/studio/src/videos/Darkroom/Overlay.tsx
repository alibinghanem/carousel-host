import React from "react";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { BACK, BODY, DISPLAY, IN, OUT, P, SEG, ease } from "./theme";

export const TAG = "ChatGPT · تحليل Excel";

type B = { a: number; b: number; chip: string; title: string; sub: React.ReactNode; color?: string; size?: number };
const iso = (t: string) => <span style={{ direction: "ltr", unicodeBidi: "isolate", fontFamily: "Space Grotesk" }}>{t}</span>;
const BLOCKS: B[] = [
  { a: 0, b: SEG.hook[1], chip: TAG, title: "وش اللي يبيع أكثر؟", sub: <>الجواب مدفون في ملف {iso("Excel")} عندك</>, color: P.red },
  { a: SEG.upload[0], b: SEG.upload[1], chip: "الخطوة 1", title: "ارفع الملف", sub: <>{iso("xlsx")} أو {iso("csv")}… ويفتح لك جدول تفاعلي</> },
  { a: SEG.prompt[0], b: SEG.prompt[1], chip: "الخطوة 2", title: "اطلب بالكلام العادي", sub: <>وشوف الرسم يتحمّض قدامك</>, size: 84 },
  { a: SEG.charts[0], b: SEG.charts[1], chip: "الرسوم", title: "4 رسوم تفاعلية", sub: <>مرّر عليها، غيّر ألوانها، ونزّلها</> },
  { a: SEG.sum[0], b: SEG.sum[1], chip: "الخطوة 3", title: "واطلب الملخص", sub: <>«لخّص أهم 3 أرقام في جمل قصيرة»</> },
  { a: SEG.tips[0], b: SEG.tips[1], chip: "قبل ما تبدأ", title: "4 أشياء تعرفها", sub: <>من صفحات المساعدة الرسمية</> },
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
      <div style={{ position: "absolute", top: 190, right: 80, padding: "6px 24px 10px", borderRadius: 999, background: k.color ?? P.green, color: "#fff", font: `700 30px ${BODY}`, transform: `scale(${pc})`, transformOrigin: "right center", whiteSpace: "nowrap" }}>{k.chip}</div>
      <div style={{ position: "absolute", top: 248, right: 74, left: 50, overflow: "hidden", padding: "0 6px 18px" }}>
        <div style={{ font: `900 ${k.size ?? 96}px/1.45 ${DISPLAY}`, color: "#fff", whiteSpace: "nowrap", transform: `translateY(${(1 - pt) * 110}%)` }}>{k.title}</div>
      </div>
      <div style={{ position: "absolute", top: 410, right: 80, left: 50, font: `700 38px/1.4 ${BODY}`, color: "#F2DCD6", opacity: ps, transform: `translateY(${(1 - ps) * 20}px)` }}>{k.sub}</div>
    </div>
  );
};

export const Shade: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 560, background: "linear-gradient(180deg, rgba(14,7,8,.85) 0%, rgba(14,7,8,.6) 60%, rgba(14,7,8,0) 100%)" }} />
);

export const Titles: React.FC<{ f: number }> = ({ f }) => (
  <>
    {BLOCKS.map((k) => (
      <Block key={k.a} f={f} k={k} />
    ))}
  </>
);

export const End: React.FC<{ f: number }> = ({ f }) => {
  const [a] = SEG.end;
  if (f < a + 10) return null;
  const pn = ease(f, a + 50, 18, OUT);
  const pc = ease(f, a + 66, 18, OUT);
  const ph = ease(f, a + 80, 18, BACK);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, direction: "rtl", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 1180, left: 0, right: 0, font: `900 88px/1.45 ${DISPLAY}`, color: "#fff", opacity: pn, transform: `translateY(${(1 - pn) * 30}px)` }}>علي التميمي</div>
      <div style={{ position: "absolute", top: 1318, left: 0, right: 0, font: `700 38px/1.4 ${BODY}`, color: "#F2DCD6", opacity: pc }}>تابعني… كل يوم نحمّض لك فكرة جديدة</div>
      <div style={{ position: "absolute", top: 1396, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${ph})` }}>
        <div style={{ padding: "12px 34px", borderRadius: 999, background: P.red }}>
          <HandlesRow size={32} color="#fff" />
        </div>
      </div>
    </div>
  );
};

export const Footer: React.FC<{ f: number }> = ({ f }) => {
  const o = ease(f, 8, 12) * (1 - ease(f, SEG.end[0], 10));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 1474, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ padding: "8px 24px", borderRadius: 999, background: "rgba(10,5,5,.8)", boxShadow: "0 0 0 2px rgba(224,49,43,.4)" }}>
        <HandlesRow size={26} color="#fff" />
      </div>
    </div>
  );
};
