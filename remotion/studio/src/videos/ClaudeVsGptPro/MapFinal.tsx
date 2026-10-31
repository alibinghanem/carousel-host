import { BODY, CL, DISPLAY, GP, MID, OUT, BACK, W, ease } from "./theme";
import { Logo, Reveal, Side, SplitLayer, exitOf } from "./kit";
import { RoundHead } from "./Round";

type Item = { task: string; to: Side[] };
const ITEMS: Item[] = [
  { task: "صورة أو تصميم إعلان", to: ["l"] },
  { task: "مخطط أو رسم تفاعلي", to: ["r"] },
  { task: "جواب بحثي سريع", to: ["r"] },
  { task: "بحث مطوّل تقدر تنتظره", to: ["l"] },
  { task: "وكيل يشتغل أو يبرمج بدالك", to: ["r", "l"] },
];
const TX = { r: 902, l: 178 };

/** شارة الأداة: تخرج من الخط الفاصل وتنزلق لجهة الأداة المناسبة */
const Token: React.FC<{ side: Side; f: number; at: number; y: number; q: number }> = ({ side, f, at, y, q }) => {
  const p = ease(f, at, 20, OUT);
  const pop = ease(f, at, 12, BACK);
  if (p <= 0) return null;
  const x = MID + (TX[side] - MID) * p;
  const c = side === "r" ? CL : GP;
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: y + 37,
          height: 4,
          left: side === "r" ? MID + 250 : x + 38,
          width: side === "r" ? Math.max(0, x - 38 - (MID + 250)) : Math.max(0, MID - 250 - (x + 38)),
          background: `linear-gradient(${side === "r" ? 90 : 270}deg, transparent, ${c.acc})`,
          opacity: 0.8 * (1 - q),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x - 38,
          top: y,
          width: 76,
          height: 76,
          borderRadius: 38,
          background: c.bg,
          border: `3px solid ${c.acc}`,
          display: "grid",
          placeItems: "center",
          transform: `scale(${pop * (1 - q)})`,
          boxShadow: `0 0 24px ${c.acc}66`,
        }}
      >
        <Logo side={side} size={40} />
      </div>
    </>
  );
};

const Line: React.FC<{ y: number; h: number; f: number; at: number; dur: number; children: React.ReactNode; d?: number }> = ({ y, h, f, at, dur, children, d = 18 }) => (
  <SplitLayer y={y} h={h}>
    <div style={{ width: W, display: "flex", justifyContent: "center" }}>
      <Reveal f={f} at={at} d={d} out={dur - 12}>
        {children}
      </Reveal>
    </div>
  </SplitLayer>
);

export const MapFinal: React.FC<{ f: number; dur: number }> = ({ f, dur }) => {
  if (f < -2 || f > dur + 2) return null;
  const q = exitOf(f, dur);
  return (
    <>
      <RoundHead f={f} dur={dur} n={5} lines={["خريطة القرار"]} />
      {ITEMS.map((it, i) => {
        const at = 24 + i * 22;
        const y = 640 + i * 110;
        return (
          <div key={i}>
            <Line y={y + 10} h={80} f={f} at={at} dur={dur}>
              <div style={{ font: `700 42px/1.3 ${BODY}`, color: "var(--ink)", whiteSpace: "nowrap" }}>{it.task}</div>
            </Line>
            {it.to.map((s) => (
              <Token key={s} side={s} f={f} at={at + 12} y={y + 4} q={q} />
            ))}
          </div>
        );
      })}
      <Line y={1196} h={60} f={f} at={150} dur={dur}>
        <div style={{ font: `700 32px ${BODY}`, color: "var(--sub)", whiteSpace: "nowrap" }}>وإذا احترت؟</div>
      </Line>
      <Line y={1250} h={90} f={f} at={158} dur={dur} d={22}>
        <div style={{ font: `700 56px/1.35 ${DISPLAY}`, color: "var(--ink)", whiteSpace: "nowrap" }}>نفس المهمة في الاثنين</div>
      </Line>
      <Line y={1334} h={110} f={f} at={170} dur={dur} d={22}>
        <div style={{ font: `700 72px/1.3 ${DISPLAY}`, color: "var(--acc)", whiteSpace: "nowrap" }}>والنتيجة تحكم</div>
      </Line>
    </>
  );
};
