import { BODY, CL, DISPLAY, EN, GP, LX, OUT, BACK, RX, ease } from "./theme";
import { Half, Side, Source, pal } from "./kit";
import { Decision, En, RoundHead } from "./Round";

/** رقم كبير + وصفه تحته */
const BigNum: React.FC<{ side: Side; f: number; at: number; n: number; label: React.ReactNode }> = ({ side, f, at, n, label }) => {
  const p = ease(f, at, 28, OUT);
  const v = Math.round(n * p);
  return (
    <div style={{ width: 380, textAlign: "center", direction: "rtl", opacity: ease(f, at, 8) }}>
      <div style={{ font: `700 112px/1 ${EN}`, color: pal(side).acc, letterSpacing: -4, direction: "ltr" }}>{v}</div>
      <div style={{ font: `700 34px/1.4 ${DISPLAY}`, color: pal(side).ink, whiteSpace: "nowrap", marginTop: 4 }}>{label}</div>
    </div>
  );
};

/** 20 ملف تطير وتصطف */
const FileGrid: React.FC<{ f: number; at: number }> = ({ f, at }) => (
  <div style={{ position: "relative", width: 300, height: 222, direction: "rtl" }}>
    {Array.from({ length: 20 }, (_, i) => {
      const col = i % 5;
      const row = Math.floor(i / 5);
      const p = ease(f, at + i * 1.6, 16, BACK);
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            right: col * 62,
            top: row * 56,
            width: 44,
            height: 50,
            borderRadius: 9,
            background: "#fff",
            border: "2px solid #D9D3C4",
            boxShadow: "0 6px 12px rgba(20,20,19,.10)",
            opacity: Math.min(1, p * 1.4),
            transform: `translateY(${(1 - p) * 60}px) rotate(${(1 - p) * (col - 2) * 8}deg)`,
          }}
        >
          <div style={{ position: "absolute", top: -2, left: -2, width: 16, height: 16, borderRadius: "9px 0 6px 0", background: CL.acc }} />
          {[14, 23, 32].map((y) => (
            <div key={y} style={{ position: "absolute", right: 8, left: y === 32 ? 16 : 8, top: y, height: 4, borderRadius: 2, background: "#D9D3C4" }} />
          ))}
        </div>
      );
    })}
  </div>
);

/** مسطرة صفحات PDF: أول 100 صفحة قراءة كاملة، والباقي نص فقط (تبدأ من اليمين) */
const PageRuler: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const a = ease(f, at, 20, OUT);
  const rich = ease(f, at + 14, 18, OUT);
  return (
    <div style={{ width: 360, direction: "rtl", opacity: a }}>
      <div style={{ font: `700 26px ${BODY}`, color: CL.sub, marginBottom: 12, textAlign: "center" }}>
        <span style={{ fontFamily: EN }}>PDF</span> · حتى <span style={{ fontFamily: EN }}>1000</span> صفحة
      </div>
      <div style={{ position: "relative", height: 30, borderRadius: 15, overflow: "hidden", background: `repeating-linear-gradient(135deg, ${CL.line} 0 8px, #EFEBE1 8px 16px)`, transform: `scaleX(${a})`, transformOrigin: "100% 50%" }}>
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 36 * rich, background: CL.acc, borderRadius: 15 }} />
      </div>
      <div style={{ position: "relative", height: 30 }}>
        <div style={{ position: "absolute", right: 22, top: 4, font: `700 24px ${EN}`, color: CL.acc2, opacity: rich }}>▲ 100</div>
      </div>
      <div style={{ font: `600 24px/1.5 ${BODY}`, color: CL.ink, opacity: ease(f, at + 24, 14) }}>
        <div>
          <span style={{ display: "inline-block", width: 18, height: 18, borderRadius: 4, background: CL.acc, marginLeft: 10, verticalAlign: -2 }} />
          أول <span style={{ fontFamily: EN }}>100</span> صفحة: نص ورسوم
        </div>
        <div style={{ color: CL.sub }}>
          <span style={{ display: "inline-block", width: 18, height: 18, borderRadius: 4, background: `repeating-linear-gradient(135deg, #CFC9BA 0 4px, #EFEBE1 4px 8px)`, marginLeft: 10, verticalAlign: -2 }} />
          <span style={{ fontFamily: EN }}>101–1000</span>: نص فقط
        </div>
      </div>
    </div>
  );
};

/** 80 نقطة تمتلئ = 80 ملف كل 3 ساعات */
const DotGrid: React.FC<{ f: number; at: number }> = ({ f, at }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 20px)", gap: 11, direction: "rtl", justifyContent: "center", width: 340 }}>
    {Array.from({ length: 80 }, (_, i) => {
      const p = ease(f, at + i * 0.55, 8, OUT);
      return <div key={i} style={{ width: 20, height: 20, borderRadius: 10, background: p > 0.5 ? GP.ink : GP.line, transform: `scale(${0.6 + 0.4 * p})`, boxShadow: p > 0.5 ? "0 0 8px rgba(255,255,255,.35)" : undefined }} />;
    })}
  </div>
);

const FreeRow: React.FC<{ f: number; at: number }> = ({ f, at }) => (
  <div style={{ width: 360, direction: "rtl", textAlign: "center", opacity: ease(f, at, 14) }}>
    <div style={{ font: `700 26px ${BODY}`, color: GP.sub, marginBottom: 14 }}>الباقة المجانية</div>
    <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 14 }}>
      {[0, 1, 2].map((i) => {
        const p = ease(f, at + 8 + i * 5, 14, BACK);
        return <div key={i} style={{ width: 40, height: 40, borderRadius: 20, background: GP.acc, transform: `scale(${p})`, boxShadow: `0 0 18px ${GP.acc}88` }} />;
      })}
    </div>
    <div style={{ font: `700 34px ${DISPLAY}`, color: GP.ink }}>
      <span style={{ fontFamily: EN }}>3</span> ملفات باليوم
    </div>
  </div>
);

export const R3Files: React.FC<{ f: number; dur: number }> = ({ f, dur }) => {
  if (f < -2 || f > dur + 2) return null;
  return (
    <>
      <RoundHead f={f} dur={dur} n={3} lines={["رفع الملفات"]} />
      <Half side="r" f={f} at={5} dur={dur} id="r3r">
        <div style={{ position: "absolute", left: RX - 190, top: 628 }}>
          <BigNum side="r" f={f} at={14} n={20} label="ملف بالمحادثة" />
        </div>
        <div style={{ position: "absolute", left: RX - 150, top: 812 }}>
          <FileGrid f={f} at={30} />
        </div>
        <div style={{ position: "absolute", left: RX - 180, top: 1058 }}>
          <PageRuler f={f} at={78} />
        </div>
        <div style={{ position: "absolute", left: RX - 190, width: 380, top: 1262, display: "flex", justifyContent: "center" }}>
          <Source side="r" f={f} at={116} text="support.claude.com" />
        </div>
      </Half>
      <Half side="l" f={f} at={11} dur={dur} id="r3l">
        <div style={{ position: "absolute", left: LX - 190, top: 628 }}>
          <BigNum side="l" f={f} at={22} n={80} label={<>ملف كل <span style={{ fontFamily: EN }}>3</span> ساعات</>} />
        </div>
        <div style={{ position: "absolute", left: LX - 170, top: 806 }}>
          <DotGrid f={f} at={38} />
        </div>
        <div style={{ position: "absolute", left: LX - 180, top: 1092 }}>
          <FreeRow f={f} at={92} />
        </div>
        <div style={{ position: "absolute", left: LX - 190, width: 380, top: 1262, display: "flex", justifyContent: "center" }}>
          <Source side="l" f={f} at={120} text="help.openai.com" />
        </div>
      </Half>
      <Decision
        f={f}
        dur={dur}
        at={146}
        single={
          <>
            ملفك فوق <En>100</En> صفحة؟ قسّمه إذا تبي <En c="var(--acc)">Claude</En> يقرأ رسومه
          </>
        }
      />
    </>
  );
};
