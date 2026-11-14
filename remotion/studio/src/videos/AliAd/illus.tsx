import { useMusic } from "../../lib/music";
import { smooth } from "./camera";

/**
 * رسوم توضيحية متحركة: كل جملة في الإعلان معها رسم يشرحها بدون كلام.
 * خطوط ذهبية/زمردية رفيعة بنفس هوية الإعلان. كل رسم يأخذ lf = الإطار المحلي من لحظة ظهوره.
 */
export const C = { gold: "#E8D5A3", gold2: "#C9A55C", em: "#1FBF8F", emL: "#BFF5E1", white: "#F5F1E8", ink: "#040706" };

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const draw = (p: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - clamp(p) });

/* ── ترس ── */
const gearPath = (r: number, teeth = 10) => {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a0 = (i / (teeth * 2)) * Math.PI * 2;
    const a1 = ((i + 1) / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.8;
    pts.push(`${Math.cos(a0) * rr},${Math.sin(a0) * rr}`, `${Math.cos(a1) * rr},${Math.sin(a1) * rr}`);
  }
  return `M${pts.join("L")}Z`;
};

/** الهوك: تروس «يدوية» تتحرك بتقطّع… ثم يضيء قلب الذكاء الاصطناعي وتدور لحالها بسلاسة */
export const Gears: React.FC<{ f: number; ai: number }> = ({ f, ai }) => {
  const { kick } = useMusic();
  // قبل ai: دوران متقطع (كأن أحد يدفعه بيده) — بعده: دوران ناعم متسارع
  const manual = Math.floor(f / 10) * 6 + smooth((f % 10) / 4) * 6;
  const auto = f > ai ? (f - ai) * (2 + Math.min(6, (f - ai) * 0.25)) : 0;
  const rot = (f < ai ? manual : Math.floor(ai / 10) * 6 + 6 + auto) * 1;
  const on = smooth((f - ai) / 8);
  const G = (x: number, r: number, dir: number, ratio: number, main = false) => (
    <g transform={`translate(${x} 0) rotate(${rot * dir * ratio})`}>
      <path d={gearPath(r, main ? 12 : 9)} fill="none" stroke={main ? C.gold : `${C.gold}AA`} strokeWidth={main ? 4 : 3} />
      <circle r={r * 0.32} fill="none" stroke={`${C.gold}88`} strokeWidth="3" />
    </g>
  );
  return (
    <svg width="760" height="260" viewBox="-380 -130 760 260" style={{ overflow: "visible" }}>
      <circle r={150} fill={C.em} opacity={on * (0.18 + kick * 0.2)} />
      {G(-235, 78, -1, 1.38)}
      {G(0, 110, 1, 1, true)}
      {G(235, 78, -1, 1.38)}
      {/* قلب الذكاء الاصطناعي */}
      <g opacity={0.25 + 0.75 * on}>
        <rect x={-34} y={-34} width={68} height={68} rx={12} fill={on > 0.5 ? C.em : "none"} stroke={C.em} strokeWidth="3" />
        {[-20, 0, 20].map((v) => (
          <g key={v}>
            <line x1={v} y1={-34} x2={v} y2={-46} stroke={C.em} strokeWidth="3" />
            <line x1={v} y1={34} x2={v} y2={46} stroke={C.em} strokeWidth="3" />
            <line x1={-34} y1={v} x2={-46} y2={v} stroke={C.em} strokeWidth="3" />
            <line x1={34} y1={v} x2={46} y2={v} stroke={C.em} strokeWidth="3" />
          </g>
        ))}
        <text y={10} textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700} fontSize={28} fill={on > 0.5 ? C.ink : C.em}>
          AI
        </text>
      </g>
    </svg>
  );
};

/** للموظف: قائمة مهام تنشطب لحالها + ساعة عقربها يتسارع */
export const Tasks: React.FC<{ lf: number }> = ({ lf }) => {
  const rows = [0, 1, 2];
  const hand = lf * (4 + lf * 0.35);
  return (
    <svg width="720" height="210" viewBox="0 0 720 210">
      {rows.map((i) => {
        const t = clamp((lf - 8 - i * 9) / 6);
        const y = 30 + i * 70;
        return (
          <g key={i}>
            <rect x={150} y={y - 10} width={[420, 360, 400][i]} height={20} rx={10} fill={`${C.white}22`} />
            <line x1={150} y1={y} x2={150 + [420, 360, 400][i] * t} y2={y} stroke={C.gold} strokeWidth={4} strokeLinecap="round" />
            <circle cx={620} cy={y} r={24} fill={t >= 1 ? C.em : "none"} stroke={t > 0 ? C.em : `${C.white}55`} strokeWidth={3} />
            <path d={`M${608} ${y} l8 9 l16 -18`} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" style={draw((lf - 14 - i * 9) / 5)} />
          </g>
        );
      })}
      {/* ساعة */}
      <g transform="translate(62 100)">
        <circle r={52} fill="none" stroke={C.gold} strokeWidth={3} />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={0} y1={-44} x2={0} y2={-38} stroke={`${C.gold}99`} strokeWidth={3} transform={`rotate(${i * 30})`} />
        ))}
        <line x1={0} y1={0} x2={0} y2={-38} stroke={C.em} strokeWidth={4} strokeLinecap="round" transform={`rotate(${hand})`} />
        <line x1={0} y1={0} x2={0} y2={-24} stroke={C.white} strokeWidth={4} strokeLinecap="round" transform={`rotate(${hand / 12})`} />
        <circle r={5} fill={C.gold} />
      </g>
    </svg>
  );
};

/** لصاحب المشروع: طلبات ورسائل تدخل للوكيل من اليمين… وتطلع منجزة ✓ لليسار */
export const Orders: React.FC<{ lf: number }> = ({ lf }) => {
  const { kick } = useMusic();
  const items = [0, 1, 2, 3];
  return (
    <svg width="720" height="210" viewBox="0 0 720 210" style={{ overflow: "visible" }}>
      <line x1={40} y1={105} x2={680} y2={105} stroke={`${C.gold}33`} strokeWidth={2} strokeDasharray="6 10" />
      {items.map((i) => {
        const t = (lf - 4 - i * 9) / 22; // 0..1 رحلة كاملة
        if (t <= 0 || t >= 1.05) return null;
        const x = 680 - t * 640;
        const done = t > 0.5;
        const y = 105 + Math.sin(t * Math.PI) * -18 * (i % 2 ? 1 : -1);
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(1.45)`} opacity={Math.min(1, t * 6) * Math.min(1, (1.05 - t) * 6)}>
            {done ? (
              <>
                <rect x={-26} y={-22} width={52} height={44} rx={10} fill={C.em} />
                <path d="M-11 0 l7 8 l15 -16" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
              </>
            ) : (
              <>
                <rect x={-30} y={-21} width={60} height={42} rx={7} fill="none" stroke={C.gold} strokeWidth={3} />
                <path d="M-30 -21 l30 22 l30 -22" fill="none" stroke={C.gold} strokeWidth={3} />
              </>
            )}
          </g>
        );
      })}
      {/* الوكيل في المنتصف */}
      <g transform="translate(360 105) scale(1.3)">
        <circle r={74 + kick * 6} fill={C.em} opacity={0.16} />
        <circle r={58} fill="#06110E" stroke={C.em} strokeWidth={3} />
        <rect x={-30} y={-22} width={60} height={46} rx={14} fill="none" stroke={C.gold} strokeWidth={3} />
        <circle cx={-12} cy={0} r={6} fill={C.em} />
        <circle cx={12} cy={0} r={6} fill={C.em} />
        <line x1={0} y1={-22} x2={0} y2={-36} stroke={C.gold} strokeWidth={3} />
        <circle cx={0} cy={-40} r={5} fill={C.gold} />
      </g>
    </svg>
  );
};

/** للطالب: منحنى مهارة يصعد بقوة وشرارة في رأسه */
export const Growth: React.FC<{ lf: number }> = ({ lf }) => {
  const { kick } = useMusic();
  const p = smooth((lf - 4) / 30);
  const pts = Array.from({ length: 41 }, (_, i) => {
    const t = i / 40;
    return [40 + t * 620, 190 - Math.pow(t, 2.2) * 160] as const;
  });
  const d = `M${pts.map(([x, y]) => `${x} ${y}`).join(" L")}`;
  const k = Math.min(40, Math.round(p * 40));
  const [tx, ty] = pts[k];
  return (
    <svg width="720" height="220" viewBox="0 0 720 220" style={{ overflow: "visible" }}>
      <line x1={40} y1={196} x2={680} y2={196} stroke={`${C.white}44`} strokeWidth={2} />
      {[1, 2, 3].map((i) => (
        <line key={i} x1={40} y1={196 - i * 50} x2={680} y2={196 - i * 50} stroke={`${C.white}14`} strokeWidth={2} />
      ))}
      <path d={`${d} L660 196 L40 196 Z`} fill={C.em} opacity={0.12 * p} />
      <path d={d} fill="none" stroke={C.gold} strokeWidth={5} strokeLinecap="round" style={draw(p)} />
      <circle cx={tx} cy={ty} r={14 + kick * 8} fill={C.em} opacity={0.35 * Math.min(1, p * 3)} />
      <circle cx={tx} cy={ty} r={7} fill="#FFF8E6" opacity={Math.min(1, p * 3)} />
      {/* قبعة التخرج عند القمة */}
      <g transform={`translate(${tx} ${ty - 54}) scale(${smooth((lf - 30) / 8)})`}>
        <path d="M-30 0 L0 -14 L30 0 L0 14 Z" fill={C.gold} />
        <path d="M-18 6 v12 c0 6 36 6 36 0 v-12" fill="none" stroke={C.gold} strokeWidth={3} />
      </g>
    </svg>
  );
};

/* ── أيقونات الدورات المتحركة ── */
/** التعامل مع الذكاء الاصطناعي: فقاعة تنكتب فيها نقاط… ثم يطلع رد مرتب */
export const IconChat: React.FC<{ lf: number }> = ({ lf }) => {
  const typed = lf > 16;
  return (
    <svg width="130" height="110" viewBox="0 0 130 110">
      <path d="M15 15 h100 a10 10 0 0 1 10 10 v44 a10 10 0 0 1 -10 10 h-58 l-20 18 v-18 h-22 a10 10 0 0 1 -10 -10 v-44 a10 10 0 0 1 10 -10z" fill="none" stroke={C.gold} strokeWidth={3} style={draw(lf / 10)} />
      {!typed
        ? [0, 1, 2].map((i) => <circle key={i} cx={45 + i * 20} cy={47 - Math.max(0, Math.sin((lf - i * 3) / 2)) * 7} r={6} fill={C.em} opacity={lf > 6 ? 1 : 0} />)
        : [0, 1].map((i) => (
            <line key={i} x1={100} y1={38 + i * 18} x2={100 - (i ? 46 : 66) * clamp((lf - 16 - i * 4) / 6)} y2={38 + i * 18} stroke={C.em} strokeWidth={6} strokeLinecap="round" />
          ))}
    </svg>
  );
};

/** بناء الوكلاء: قطع تتركب وتصير روبوت، وعيونه تضيء */
export const IconBuild: React.FC<{ lf: number }> = ({ lf }) => {
  const a = smooth(lf / 8);
  const b = smooth((lf - 6) / 8);
  const c = smooth((lf - 12) / 8);
  const eyes = lf > 20;
  return (
    <svg width="130" height="110" viewBox="0 0 130 110">
      <rect x={30} y={34 - (1 - a) * 40} width={70} height={54} rx={14} fill="none" stroke={C.gold} strokeWidth={3} opacity={a} />
      <line x1={65} y1={34} x2={65} y2={34 - 16 * b} stroke={C.gold} strokeWidth={3} />
      <circle cx={65} cy={16} r={5 * b} fill={C.gold} />
      <rect x={14 - (1 - c) * 20} y={52} width={12} height={20} rx={4} fill={C.gold} opacity={c} />
      <rect x={104 + (1 - c) * 20} y={52} width={12} height={20} rx={4} fill={C.gold} opacity={c} />
      <circle cx={52} cy={60} r={7} fill={eyes ? C.em : "none"} stroke={C.em} strokeWidth={2} opacity={c} />
      <circle cx={78} cy={60} r={7} fill={eyes ? C.em : "none"} stroke={C.em} strokeWidth={2} opacity={c} />
      {eyes ? <circle cx={65} cy={60} r={38} fill={C.em} opacity={0.12} /> : null}
    </svg>
  );
};

/** أتمتة الشركات: سهم يمر بين ٣ مربعات وكل مربع يصير ✓ */
export const IconFlow: React.FC<{ lf: number }> = ({ lf }) => {
  const xs = [105, 65, 25]; // من اليمين لليسار
  const dot = clamp((lf - 4) / 20);
  const dx = 105 - dot * 80;
  return (
    <svg width="130" height="110" viewBox="0 0 130 110">
      <line x1={105} y1={55} x2={25} y2={55} stroke={`${C.gold}66`} strokeWidth={3} />
      {xs.map((x, i) => {
        const ok = lf > 6 + i * 8;
        return (
          <g key={i}>
            <rect x={x - 15} y={40} width={30} height={30} rx={7} fill={ok ? C.em : "#06110E"} stroke={ok ? C.em : C.gold} strokeWidth={3} />
            {ok ? <path d={`M${x - 7} 55 l5 6 l10 -12`} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" /> : null}
          </g>
        );
      })}
      {dot < 1 ? <circle cx={dx} cy={55} r={6} fill="#FFF8E6" /> : null}
    </svg>
  );
};

/** لوح العرض: إطار ذهبي يرتسم + قبعة تخرج تنزل على النبض */
export const Board: React.FC<{ lf: number; capAt: number; w: number; h: number }> = ({ lf, capAt, w, h }) => {
  const cap = lf < capAt - 8 ? 0 : smooth((lf - capAt + 8) / 8);
  const bounce = lf >= capAt ? Math.max(0, 1 - (lf - capAt) / 8) * Math.sin((lf - capAt) * 1.6) * 8 : 0;
  return (
    <svg width={w + 120} height={h + 200} viewBox={`-60 -120 ${w + 120} ${h + 200}`} style={{ position: "absolute", left: -60, top: -120, overflow: "visible", pointerEvents: "none" }}>
      <rect x={0} y={0} width={w} height={h} rx={34} fill="rgba(6,14,12,.78)" stroke={C.gold} strokeWidth={3} style={draw(lf / 18)} />
      <rect x={14} y={14} width={w - 28} height={h - 28} rx={24} fill="none" stroke={`${C.gold}44`} strokeWidth={2} style={draw((lf - 6) / 18)} />
      <line x1={w * 0.3} y1={h} x2={w * 0.24} y2={h + 70} stroke={C.gold} strokeWidth={4} style={draw((lf - 12) / 8)} />
      <line x1={w * 0.7} y1={h} x2={w * 0.76} y2={h + 70} stroke={C.gold} strokeWidth={4} style={draw((lf - 12) / 8)} />
      {/* قبعة التخرج على الزاوية اليمنى */}
      <g transform={`translate(${w - 40} ${-10 - (1 - cap) * 260 + bounce}) rotate(${-12 + (1 - cap) * 30})`} opacity={cap}>
        <path d="M-70 0 L0 -32 L70 0 L0 32 Z" fill={C.gold} />
        <path d="M-42 14 v26 c0 16 84 16 84 0 v-26" fill="#B8954C" />
        <line x1={58} y1={4} x2={58} y2={48} stroke={C.gold} strokeWidth={4} />
        <circle cx={58} cy={52} r={7} fill={C.gold} />
      </g>
    </svg>
  );
};
