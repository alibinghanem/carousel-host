import { BACK, BODY, DISPLAY, EN, MID, OUT, W, ease } from "./theme";
import { Logo, Reveal, SplitLayer, exitOf } from "./kit";
import { Decision, RoundHead } from "./Round";

type Row = { r: React.ReactNode; l: React.ReactNode; what: string; rAr?: boolean };
const ROWS: Row[] = [
  { r: "Cowork", l: "ChatGPT Work", what: "وكيل يخلّص الشغل على ملفاتك وتطبيقاتك" },
  { r: "Claude Code", l: "Codex", what: "وكيل برمجة: الطرفية والمحرر والسحابة" },
  { r: "مهام مجدولة", l: "Scheduled Tasks", what: "شغل يتكرر لحاله على موعده", rAr: true },
  { r: "Projects", l: "Projects", what: "مساحة لكل مشروع بملفاته وذاكرته" },
];

/** صف: اسمان يدخلان من الطرفين ويتلاقيان عند «=» على الخط الفاصل */
const PairRow: React.FC<{ f: number; at: number; y: number; row: Row; dur: number }> = ({ f, at, y, row, dur }) => {
  const pr = ease(f, at, 22, OUT);
  const pl = ease(f, at + 4, 22, OUT);
  const node = ease(f, at + 16, 14, BACK);
  const link = ease(f, at + 18, 16, OUT);
  const q = exitOf(f, dur);
  const label = (side: "r" | "l", p: number, content: React.ReactNode, ar?: boolean) => (
    <div
      style={{
        position: "absolute",
        top: 0,
        height: 88,
        display: "flex",
        alignItems: "center",
        gap: 14,
        direction: "ltr",
        ...(side === "r" ? { left: MID + 64, transform: `translateX(${(1 - p) * 520 + q * 300}px)` } : { right: W - MID + 64, transform: `translateX(${-(1 - p) * 520 - q * 300}px)` }),
        opacity: Math.min(1, p * 1.5) * (1 - q),
      }}
    >
      {side === "r" ? <Logo side="r" size={40} /> : null}
      <span style={{ font: ar ? `700 44px ${DISPLAY}` : `700 44px ${EN}`, color: "var(--ink)", whiteSpace: "nowrap", letterSpacing: ar ? 0 : -1, direction: ar ? "rtl" : "ltr" }}>{content}</span>
      {side === "l" ? <Logo side="l" size={40} /> : null}
    </div>
  );
  return (
    <>
      <SplitLayer y={y} h={150}>
        <div style={{ position: "absolute", top: 43, left: MID - 60, width: 120, height: 3, background: "var(--sub)", opacity: 0.6 * (1 - q), transform: `scaleX(${link})` }} />
        {label("r", pr, row.r, row.rAr)}
        {label("l", pl, row.l)}
        <div
          style={{
            position: "absolute",
            left: MID - 30,
            top: 14,
            width: 60,
            height: 60,
            borderRadius: 30,
            background: "var(--bg)",
            border: "3px solid var(--acc)",
            display: "grid",
            placeItems: "center",
            font: `700 40px/1 ${EN}`,
            color: "var(--acc)",
            transform: `scale(${node * (1 - q)})`,
          }}
        >
          =
        </div>
        <div style={{ position: "absolute", top: 96, left: 0, width: W, display: "flex", justifyContent: "center" }}>
          <Reveal f={f} at={at + 22} d={18} out={dur - 12}>
            <div style={{ font: `600 30px ${BODY}`, color: "var(--sub)", whiteSpace: "nowrap" }}>{row.what}</div>
          </Reveal>
        </div>
      </SplitLayer>
    </>
  );
};

export const R4Names: React.FC<{ f: number; dur: number }> = ({ f, dur }) => {
  if (f < -2 || f > dur + 2) return null;
  return (
    <>
      <RoundHead f={f} dur={dur} n={4} lines={["الأسماء تختلف"]} />
      <SplitLayer y={588} h={90}>
        <div style={{ width: W, display: "flex", justifyContent: "center" }}>
          <Reveal f={f} at={14} out={dur - 12}>
            <div style={{ font: `700 54px ${DISPLAY}`, color: "var(--acc)", whiteSpace: "nowrap" }}>والفكرة وحدة</div>
          </Reveal>
        </div>
      </SplitLayer>
      {ROWS.map((row, i) => (
        <PairRow key={i} f={f} at={30 + i * 26} y={700 + i * 150} row={row} dur={dur} />
      ))}
      <Decision
        f={f}
        dur={dur}
        at={172}
        single={<>هنا تعادل: اختر اللي ملفاتك وأدواتك مربوطة فيه</>}
      />
    </>
  );
};
