import { BACK, BODY, EN, LX, OUT, RX, ease } from "./theme";
import { Half, Logo, Side, Source, Statement, pal } from "./kit";
import { Decision, En, RoundHead } from "./Round";

/** حلقة زمن من 0 إلى 30 دقيقة: القوس يمتد من «from» إلى «to» بسرعة الأداة */
const Ring: React.FC<{ side: Side; f: number; from: number; to: number; at: number; dur: number; big: string; unit: string; done?: number }> = ({
  side,
  f,
  from,
  to,
  at,
  dur,
  big,
  unit,
  done,
}) => {
  const p = pal(side);
  const R = 128;
  const C = 2 * Math.PI * R;
  const prog = side === "r" ? ease(f, at, dur, OUT) : Math.min(1, Math.max(0, (f - at) / dur));
  const a0 = (from / 30) * 360;
  const a1 = (to / 30) * 360;
  const len = ((a1 - a0) / 360) * C * prog;
  const headA = ((a0 + (a1 - a0) * prog - 90) * Math.PI) / 180;
  const appear = ease(f, at - 24, 20, OUT);
  const ok = done !== undefined ? ease(f, done, 14, BACK) : 0;
  return (
    <div style={{ position: "relative", width: 360, height: 360, opacity: appear, transform: `scale(${0.9 + 0.1 * appear}) rotate(${(1 - appear) * -20}deg)` }}>
      <svg width={360} height={360} viewBox="0 0 360 360" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 30 }, (_, i) => {
          const a = ((i * 12 - 90) * Math.PI) / 180;
          const major = i % 5 === 0;
          const r1 = 150;
          const r2 = major ? 166 : 158;
          return <line key={i} x1={180 + r1 * Math.cos(a)} y1={180 + r1 * Math.sin(a)} x2={180 + r2 * Math.cos(a)} y2={180 + r2 * Math.sin(a)} stroke={p.sub} strokeOpacity={major ? 0.7 : 0.35} strokeWidth={major ? 4 : 2} strokeLinecap="round" />;
        })}
        <circle cx={180} cy={180} r={R} fill="none" stroke={p.line} strokeWidth={22} />
        <circle
          cx={180}
          cy={180}
          r={R}
          fill="none"
          stroke={p.acc}
          strokeWidth={22}
          strokeLinecap="round"
          strokeDasharray={`${Math.max(0.01, len)} ${C}`}
          transform={`rotate(${a0 - 90} 180 180)`}
          style={{ filter: `drop-shadow(0 0 10px ${p.acc}88)` }}
        />
        {prog > 0 && prog < 1 ? <circle cx={180 + R * Math.cos(headA)} cy={180 + R * Math.sin(headA)} r={15} fill="#fff" stroke={p.acc} strokeWidth={5} /> : null}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ font: `700 92px/1 ${EN}`, color: p.ink, direction: "ltr", letterSpacing: -2 }}>{big}</div>
        <div style={{ font: `600 32px/1.4 ${BODY}`, color: p.sub, marginTop: 6 }}>{unit}</div>
      </div>
      {done !== undefined ? (
        <div
          style={{
            position: "absolute",
            left: 180 + 150 * Math.cos(((a1 - 90) * Math.PI) / 180) - 30,
            top: 180 + 150 * Math.sin(((a1 - 90) * Math.PI) / 180) - 30,
            width: 60,
            height: 60,
            borderRadius: 30,
            background: p.acc,
            display: "grid",
            placeItems: "center",
            color: "#fff",
            font: `800 34px ${BODY}`,
            transform: `scale(${ok})`,
            boxShadow: `0 8px 20px ${p.acc}66`,
          }}
        >
          ✓
        </div>
      ) : null}
    </div>
  );
};

const Feature: React.FC<{ side: Side; f: number; at: number; name: string }> = ({ side, f, at, name }) => {
  const p = ease(f, at, 16, OUT);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, direction: "ltr", padding: "10px 24px 12px 18px", borderRadius: 40, background: pal(side).bg2, border: `2px solid ${pal(side).line}`, opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>
      <Logo side={side} size={36} />
      <span style={{ font: `700 38px ${EN}`, color: pal(side).ink, whiteSpace: "nowrap" }}>{name}</span>
    </div>
  );
};

export const R2Research: React.FC<{ f: number; dur: number }> = ({ f, dur }) => {
  if (f < -2 || f > dur + 2) return null;
  return (
    <>
      <RoundHead f={f} dur={dur} n={2} lines={["البحث"]} />
      <Half side="r" f={f} at={5} dur={dur} id="r2r">
        <div style={{ position: "absolute", left: RX - 190, width: 380, top: 630, display: "flex", justifyContent: "center" }}>
          <Feature side="r" f={f} at={12} name="Research" />
        </div>
        <div style={{ position: "absolute", left: RX - 180, top: 712 }}>
          <Ring side="r" f={f} from={1} to={3} at={44} dur={22} big="1–3" unit="دقايق" done={68} />
        </div>
        <div style={{ position: "absolute", left: RX - 190, top: 1090 }}>
          <Statement side="r" f={f} at={92} head="جاهز بدقايق" sub="يجمع من الويب وتطبيقاتك المربوطة" />
        </div>
        <div style={{ position: "absolute", left: RX - 190, width: 380, top: 1262, display: "flex", justifyContent: "center" }}>
          <Source side="r" f={f} at={116} text="support.claude.com" />
        </div>
      </Half>
      <Half side="l" f={f} at={11} dur={dur} id="r2l">
        <div style={{ position: "absolute", left: LX - 190, width: 380, top: 630, display: "flex", justifyContent: "center" }}>
          <Feature side="l" f={f} at={20} name="Deep Research" />
        </div>
        <div style={{ position: "absolute", left: LX - 180, top: 712 }}>
          <Ring side="l" f={f} from={5} to={30} at={52} dur={176} big="5–30" unit="دقيقة" />
        </div>
        <div style={{ position: "absolute", left: LX - 190, top: 1090 }}>
          <Statement side="l" f={f} at={100} head="ياخذ وقته" sub="من 5 إلى 30 دقيقة حسب عمق السؤال" />
        </div>
        <div style={{ position: "absolute", left: LX - 190, width: 380, top: 1262, display: "flex", justifyContent: "center" }}>
          <Source side="l" f={f} at={124} text="OpenAI · 2025 launch" />
        </div>
      </Half>
      <Decision
        f={f}
        dur={dur}
        at={148}
        right={
          <>
            جواب سريع ← <En c="var(--acc)">Research</En>
          </>
        }
        left={
          <>
            تقدر تنتظر؟ ← <En c="var(--acc)">Deep Research</En>
          </>
        }
      />
    </>
  );
};
