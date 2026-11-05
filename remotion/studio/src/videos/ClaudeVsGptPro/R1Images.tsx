import { BODY, CL, EN, GP, LX, MONO, OUT, BACK, RX, ease } from "./theme";
import { Half, Prompt, Source, Statement, lerpColor } from "./kit";
import { Decision, En, RoundHead } from "./Round";

/** مخطط تفاعلي يبنيه Claude: محاور تنرسم، أعمدة تنمو، مؤشر يمر وتلميح يظهر */
const ChartCard: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const hs = [0.42, 0.6, 0.5, 0.88, 0.7];
  const card = ease(f, at, 18, OUT);
  const axis = ease(f, at + 8, 16, OUT);
  const cur = ease(f, at + 52, 26, OUT);
  const hover = ease(f, at + 76, 8, OUT);
  const tip = ease(f, at + 80, 14, BACK);
  const cx = 320 - 70 * cur;
  const cy = 300 - 150 * cur;
  return (
    <div
      style={{
        position: "relative",
        width: 360,
        height: 300,
        borderRadius: 26,
        background: "#FFFFFF",
        border: `2px solid ${CL.line}`,
        boxShadow: "0 24px 50px rgba(20,20,19,.10), 0 4px 10px rgba(20,20,19,.05)",
        opacity: card,
        transform: `translateY(${(1 - card) * 30}px)`,
      }}
    >
      <div style={{ position: "absolute", top: 18, right: 22, font: `700 24px ${BODY}`, color: CL.ink, direction: "rtl" }}>المبيعات الشهرية</div>
      <div style={{ position: "absolute", top: 16, left: 18, padding: "3px 12px", borderRadius: 10, background: `${CL.acc}1F`, color: CL.acc2, font: `800 20px ${MONO}`, opacity: ease(f, at + 4, 10) }}>{"<svg>"}</div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 270, height: 3, background: CL.ink, transformOrigin: "100% 50%", transform: `scaleX(${axis})`, opacity: 0.8 }} />
      {hs.map((h, i) => {
        const g = ease(f, at + 18 + i * 5, 22, OUT);
        const hot = i === 3 ? hover : 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 40 + i * 60,
              width: 40,
              bottom: 30,
              height: h * 170 * g,
              borderRadius: "10px 10px 3px 3px",
              background: hot > 0 ? lerpColor("#EFC3B1", CL.acc, hot) : "#EFC3B1",
              boxShadow: hot > 0 ? `0 0 ${hot * 24}px ${CL.acc}88` : undefined,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 240 - 80,
          top: 70,
          width: 160,
          textAlign: "center",
          opacity: tip,
          transform: `translateY(${(1 - tip) * 12}px) scale(${0.8 + 0.2 * tip})`,
        }}
      >
        <span style={{ display: "inline-block", padding: "6px 14px 8px", borderRadius: 12, background: CL.ink, color: "#fff", font: `700 22px ${BODY}`, direction: "rtl", whiteSpace: "nowrap" }}>
          أبريل · <span style={{ fontFamily: EN }}>42K</span>
        </span>
      </div>
      <svg width={34} height={40} viewBox="0 0 24 28" style={{ position: "absolute", left: cx, top: cy, opacity: ease(f, at + 48, 6) * (cur > 0 ? 1 : 0), filter: "drop-shadow(0 3px 4px rgba(0,0,0,.3))" }}>
        <path d="M2 2 L2 22 L7.5 17 L11 25 L14.5 23.5 L11 15.8 L18.5 15.8 Z" fill="#141413" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** صورة يولّدها ChatGPT: تنشأ من ضوضاء ثم تتعدّل «خلّها بالليل» */
const ImageGen: React.FC<{ f: number; at: number; nightAt: number }> = ({ f, at, nightAt }) => {
  const frame = ease(f, at - 18, 16, OUT);
  const g = ease(f, at, 50, OUT);
  const n = ease(f, nightAt, 30, OUT);
  const wall = lerpColor("#E9C9A0", "#1B2442", n);
  const wall2 = lerpColor("#D9B07F", "#121933", n);
  const sky = lerpColor("#9FD6F2", "#0B1230", n);
  const table = lerpColor("#8A5A33", "#3A2616", n);
  const brassA = lerpColor("#F1D27A", "#D9B45C", n);
  const brassB = lerpColor("#A97E2C", "#6E5018", n);
  const steam = (k: number) => {
    const t = (f - at) / 18 + k;
    return `M${246 + k * 10} 206 C ${238 + k * 10} ${190 - (t % 1) * 4} ${256 + k * 10} 184 ${248 + k * 10} 166`;
  };
  return (
    <div
      style={{
        position: "relative",
        width: 340,
        height: 300,
        borderRadius: 26,
        overflow: "hidden",
        border: `2px solid ${GP.line}`,
        boxShadow: "0 24px 60px rgba(0,0,0,.6)",
        opacity: frame,
        transform: `translateY(${(1 - frame) * -30}px)`,
        background: "#141416",
      }}
    >
      <svg width={340} height={300} viewBox="0 0 340 300" style={{ position: "absolute", inset: 0, filter: `blur(${(1 - g) * 22}px) saturate(${0.2 + 0.8 * g})`, opacity: 0.35 + 0.65 * g }}>
        <defs>
          <linearGradient id="brass" x1="0" x2="1">
            <stop offset="0" stopColor={brassB} />
            <stop offset="0.45" stopColor={brassA} />
            <stop offset="1" stopColor={brassB} />
          </linearGradient>
          <radialGradient id="glow" cx="0.72" cy="0.72" r="0.5">
            <stop offset="0" stopColor="#FFB45A" stopOpacity={0.55 * n} />
            <stop offset="1" stopColor="#FFB45A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="340" height="300" fill={wall} />
        <rect y="0" width="340" height="60" fill={wall2} opacity="0.6" />
        <rect x="208" y="34" width="96" height="112" rx="10" fill={sky} stroke={wall2} strokeWidth="6" />
        <circle cx={272} cy={74} r={16} fill="#FFE07A" opacity={1 - n} />
        <circle cx={268} cy={70} r={14} fill="#F4EBD0" opacity={n} />
        <circle cx={275} cy={65} r={12} fill={sky} opacity={n} />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={222 + i * 22} cy={104 + (i % 2) * 18} r={1.8} fill="#fff" opacity={n} />
        ))}
        <rect width="340" height="300" fill="url(#glow)" />
        <rect x="0" y="228" width="340" height="72" fill={table} />
        <rect x="0" y="226" width="340" height="6" fill={lerpColor("#A8754A", "#4A321D", n)} />
        <ellipse cx="150" cy="229" rx="46" ry="6" fill="rgba(0,0,0,.25)" />
        <path d="M118 182 C92 176 80 150 62 112 L70 110 C86 142 98 162 124 166 Z" fill="url(#brass)" />
        <path d="M118 222 C100 202 104 172 126 152 C136 144 138 134 138 122 L162 122 C162 134 164 144 174 152 C196 172 200 202 182 222 Z" fill="url(#brass)" />
        <path d="M112 192 C130 196 170 196 188 192" stroke={brassB} strokeWidth="3" fill="none" opacity="0.7" />
        <path d="M128 152 C140 156 160 156 172 152" stroke={brassB} strokeWidth="3" fill="none" opacity="0.7" />
        <path d="M134 122 C134 100 166 100 166 122 Z" fill="url(#brass)" />
        <circle cx="150" cy="96" r="6" fill={brassA} />
        <path d="M150 90 L150 80" stroke={brassA} strokeWidth="3" strokeLinecap="round" />
        <path d="M176 134 C214 134 214 198 184 206" stroke="url(#brass)" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M222 212 L252 212 L247 228 L227 228 Z" fill="#F4EEE2" />
        <path d="M216 229 L258 229" stroke="#E2D8C6" strokeWidth="4" strokeLinecap="round" />
        {[0, 1].map((k) => (
          <path key={k} d={steam(k)} stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity={0.5 * g} />
        ))}
      </svg>
      {/* ضوضاء الانتشار */}
      <svg width={340} height={300} style={{ position: "absolute", inset: 0, opacity: (1 - g) * 0.85, mixBlendMode: "screen" }}>
        <filter id="nz">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(f / 2)} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="340" height="300" filter="url(#nz)" />
      </svg>
      {g < 0.99 && f >= at - 6 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: g * 300 - 40, height: 80, background: "linear-gradient(180deg, transparent, rgba(255,255,255,.22), transparent)" }} />
      ) : null}
    </div>
  );
};

export const R1Images: React.FC<{ f: number; dur: number }> = ({ f, dur }) => {
  if (f < -2 || f > dur + 2) return null;
  return (
    <>
      <RoundHead f={f} dur={dur} n={1} lines={["الصور"]} />
      <Half side="r" f={f} at={5} dur={dur} id="r1r">
        <div style={{ position: "absolute", left: RX - 180, top: 636 }}>
          <Prompt side="r" f={f} at={14} text="سوّ مخطط مبيعات تفاعلي" dur={22} />
        </div>
        <div style={{ position: "absolute", left: RX - 180, top: 728 }}>
          <ChartCard f={f} at={40} />
        </div>
        <div style={{ position: "absolute", left: RX - 190, top: 1068 }}>
          <Statement side="r" f={f} at={96} head="ما يولّد صور" sub="لكنه يبني مخططات ورسوم تفاعلية، ويحلّل صورك" />
        </div>
        <div style={{ position: "absolute", left: RX - 190, width: 380, top: 1258, display: "flex", justifyContent: "center" }}>
          <Source side="r" f={f} at={120} text="support.claude.com" />
        </div>
      </Half>
      <Half side="l" f={f} at={11} dur={dur} id="r1l">
        <div style={{ position: "absolute", left: LX - 180, top: 636 }}>
          <Prompt side="l" f={f} at={22} text="ارسم دلّة قهوة على طاولة" dur={22} />
        </div>
        <div style={{ position: "absolute", left: LX - 170, top: 728 }}>
          <ImageGen f={f} at={58} nightAt={160} />
          <div style={{ position: "absolute", left: 10, top: 222, width: 320, display: "flex", justifyContent: "flex-end" }}>
            {f >= 136 ? <Prompt side="l" f={f} at={136} text="خلّها بالليل" dur={14} width={300} /> : null}
          </div>
        </div>
        <div style={{ position: "absolute", left: LX - 190, top: 1068 }}>
          <Statement side="l" f={f} at={104} head="يولّد صور" sub="ويعدّلها بالكلام في نفس المحادثة" />
        </div>
        <div style={{ position: "absolute", left: LX - 190, width: 380, top: 1258, display: "flex", justifyContent: "center" }}>
          <Source side="l" f={f} at={128} text="help.openai.com" />
        </div>
      </Half>
      <Decision
        f={f}
        dur={dur}
        at={150}
        right={
          <>
            مخطط تفاعلي ← <En c="var(--acc)">Claude</En>
          </>
        }
        left={
          <>
            صورة إعلان ← <En c="var(--acc)">ChatGPT</En>
          </>
        }
      />
    </>
  );
};
