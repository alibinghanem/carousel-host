import { useMusic } from "../../lib/music";
import { smooth } from "./camera";
import { C } from "./illus";

/**
 * شخصيات خطية متحركة لألواح الجمهور (720×340): المشاهد يعرف نفسه قبل ما يقرأ.
 * خطوط ذهبية + تعبئة داكنة تحجب ما خلفها، ولمسة خليجية (ثوب، شماغ، عقال).
 * lf = الإطار المحلي من لحظة وصول اللوح.
 */
const S = { stroke: C.gold, strokeWidth: 4.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const FILL = "#0C1A16";
const FILL2 = "#132721";
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const draw = (p: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - clamp(p) });

/** رأس بشماغ وعقال (الصورة الخليجية الأيقونية): الشماغ ينسدل على جانبي الوجه للكتفين،
 *  والعقال حلقتين سوداء فوق الرأس. الشماغ عنابي مثل صورة علي. */
const SHEMAGH = "#7A1E2B";
const HeadShemagh: React.FC<{ x: number; y: number; r?: number; side?: 0 | 1 }> = ({ x, y, r = 34 }) => (
  <g transform={`translate(${x} ${y})`}>
    {/* القماش: قوس فوق الرأس ينسدل للكتفين */}
    <path
      d={`M${-r * 1.3} ${r * 2.05} C ${-r * 1.35} ${r * 1.0}, ${-r * 1.3} ${-r * 0.3}, ${-r * 1.0} ${-r * 0.8} C ${-r * 0.6} ${-r * 1.35}, ${r * 0.6} ${-r * 1.35}, ${r * 1.0} ${-r * 0.8} C ${r * 1.3} ${-r * 0.3}, ${r * 1.35} ${r * 1.0}, ${r * 1.3} ${r * 2.05} L ${r * 0.7} ${r * 1.85} C ${r * 0.85} ${r * 1.1}, ${r * 0.85} ${r * 0.3}, ${r * 0.7} ${-r * 0.2} L ${-r * 0.7} ${-r * 0.2} C ${-r * 0.85} ${r * 0.3}, ${-r * 0.85} ${r * 1.1}, ${-r * 0.7} ${r * 1.85} Z`}
      fill={SHEMAGH}
      {...S}
    />
    {/* نقشة خفيفة على الشماغ */}
    {[-1, 1].map((sd) =>
      [0.3, 0.8, 1.3].map((k) => <line key={`${sd}${k}`} x1={sd * r * 0.82} y1={r * k} x2={sd * r * 1.18} y2={r * (k + 0.12)} stroke={`${C.gold}55`} strokeWidth={2} />),
    )}
    {/* الوجه */}
    <ellipse rx={r * 0.66} ry={r * 0.78} cy={r * 0.32} fill={FILL} {...S} />
    {/* اللحية */}
    <path d={`M${-r * 0.5} ${r * 0.6} C ${-r * 0.35} ${r * 1.15}, ${r * 0.35} ${r * 1.15}, ${r * 0.5} ${r * 0.6}`} fill="none" stroke={`${C.gold}AA`} strokeWidth={3.5} strokeLinecap="round" />
    {/* العقال: حلقتين سوداء على الرأس */}
    {[-0.5, -0.72].map((k) => (
      <g key={k}>
        <path d={`M${-r * 0.98} ${r * k} Q 0 ${r * (k - 0.32)}, ${r * 0.98} ${r * k}`} fill="none" stroke="#020403" strokeWidth={8} strokeLinecap="round" />
        <path d={`M${-r * 0.98} ${r * k} Q 0 ${r * (k - 0.32)}, ${r * 0.98} ${r * k}`} fill="none" stroke={`${C.gold}AA`} strokeWidth={1.5} strokeLinecap="round" />
      </g>
    ))}
  </g>
);

/* ═════════ الموظف: جالس قدام لابتوب، يكتب، وشاشة هولوغرام تنشطب فيها المهام ═════════ */
export const EmployeeScene: React.FC<{ lf: number }> = ({ lf }) => {
  const { kick } = useMusic();
  const type1 = Math.sin(lf * 1.3) * 3;
  const type2 = Math.sin(lf * 1.3 + 2) * 3;
  const holo = smooth((lf + 6) / 10);
  const hand = lf * (4 + Math.max(0, lf) * 0.3);
  return (
    <svg width="720" height="340" viewBox="0 0 720 340" style={{ overflow: "visible" }}>
      {/* شعاع من الشاشة للهولوغرام */}
      <path d="M402 178 L330 60 L330 250 L404 246 Z" fill={C.em} opacity={0.1 * holo + kick * 0.05} />
      {/* الهولوغرام */}
      <g opacity={holo}>
        <rect x={40} y={46} width={290} height={210} rx={18} fill="rgba(31,191,143,.06)" stroke={C.em} strokeWidth={3} strokeDasharray="10 6" />
        {[0, 1, 2].map((i) => {
          const t = clamp((lf - 4 - i * 9) / 6);
          const y = 106 + i * 50;
          return (
            <g key={i}>
              <rect x={70} y={y - 7} width={170} height={14} rx={7} fill={`${C.white}22`} />
              <line x1={70} y1={y} x2={70 + 170 * t} y2={y} stroke={C.gold} strokeWidth={4} strokeLinecap="round" />
              <circle cx={280} cy={y} r={17} fill={t >= 1 ? C.em : "none"} stroke={t > 0 ? C.em : `${C.white}55`} strokeWidth={3} />
              <path d={`M271 ${y} l6 7 l12 -13`} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" style={draw((lf - 9 - i * 9) / 4)} />
            </g>
          );
        })}
        {/* ساعة صغيرة تتسارع */}
        <g transform="translate(86 70)">
          <circle r={14} fill="none" stroke={C.gold} strokeWidth={2.5} />
          <line x1={0} y1={0} x2={0} y2={-10} stroke={C.em} strokeWidth={3} strokeLinecap="round" transform={`rotate(${hand})`} />
        </g>
        <text x={300} y={78} textAnchor="end" fontFamily="Space Grotesk" fontWeight={700} fontSize={20} fill={`${C.em}CC`}>
          TASKS
        </text>
      </g>
      {/* المكتب */}
      <line x1={340} y1={262} x2={700} y2={262} {...S} />
      <line x1={370} y1={262} x2={370} y2={330} {...S} />
      {/* اللابتوب (منظر جانبي) */}
      <rect x={408} y={252} width={110} height={10} rx={3} fill={FILL} {...S} />
      <line x1={412} y1={254} x2={392} y2={168} {...S} strokeWidth={7} />
      <circle cx={400} cy={210} r={26 + kick * 8} fill={C.em} opacity={0.18} />
      {/* الكرسي */}
      <line x1={556} y1={270} x2={662} y2={270} {...S} />
      <line x1={662} y1={270} x2={672} y2={168} {...S} />
      <line x1={612} y1={270} x2={612} y2={326} {...S} />
      <line x1={584} y1={326} x2={640} y2={326} {...S} />
      {/* الجسم بالثوب (جالس، يواجه اليسار) */}
      <path d="M592 150 C 636 156, 652 196, 650 266 L 556 266 C 544 266, 540 274, 541 284 L 544 324 L 520 326 C 514 326, 514 318, 520 316 L 528 316 L 526 286 C 524 262, 540 250, 560 248 C 566 220, 570 180, 592 150 Z" fill={FILL} {...S} />
      {/* الذراع: كتف ← كوع ← يد على الكيبورد */}
      <path d={`M606 176 L 584 230 L ${520 + type1} ${244 + type2}`} fill="none" {...S} strokeWidth={9} stroke={FILL} />
      <path d={`M606 176 L 584 230 L ${520 + type1} ${244 + type2}`} fill="none" {...S} />
      <circle cx={520 + type1} cy={244 + type2} r={6} fill={C.gold} />
      <HeadShemagh x={598} y={112} r={34} side={1} />
    </svg>
  );
};

/* ═════════ صاحب المشروع: يمشي بشنطته، وروبوت جنبه يستلم الطلبات ويرتبها ═════════ */
export const OwnerScene: React.FC<{ lf: number }> = ({ lf }) => {
  const { kick } = useMusic();
  const ph = lf * 0.36;
  const sw = Math.sin(ph);
  const bob = -Math.abs(Math.cos(ph)) * 5;
  const X = 470;
  return (
    <svg width="720" height="340" viewBox="0 0 720 340" style={{ overflow: "visible" }}>
      {/* أرضية تتحرك (إحساس المشي للأمام) */}
      <line x1={20} y1={322} x2={700} y2={322} stroke={`${C.gold}55`} strokeWidth={3} strokeDasharray="18 16" strokeDashoffset={-lf * 7} />
      {/* الطلبات تطير للروبوت، وتطلع منه ✓ */}
      {[0, 1, 2, 3].map((i) => {
        const t = (lf - i * 9) / 18;
        if (t <= 0 || t > 1) return null;
        const x = 700 - t * 400;
        const y = 40 + t * 150 + Math.sin(t * Math.PI) * -30;
        return (
          <g key={`m${i}`} transform={`translate(${x} ${y}) scale(${1 - t * 0.3})`} opacity={Math.min(1, t * 5) * Math.min(1, (1 - t) * 6)}>
            <rect x={-24} y={-17} width={48} height={34} rx={6} fill={FILL} stroke={C.gold} strokeWidth={3} />
            <path d="M-24 -17 l24 18 l24 -18" fill="none" stroke={C.gold} strokeWidth={3} />
          </g>
        );
      })}
      {[0, 1, 2, 3].map((i) => {
        const t0 = 20 + i * 9;
        const p = smooth((lf - t0) / 6);
        if (p <= 0) return null;
        return (
          <g key={`k${i}`} transform={`translate(${60 + i * 50} ${292 - p * 10})`} opacity={p}>
            <rect x={-20} y={-18} width={40} height={36} rx={9} fill={C.em} />
            <path d="M-9 0 l6 7 l12 -13" fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
      {/* الروبوت المرافق */}
      <g transform={`translate(300 ${214 + Math.sin(lf / 5) * 6})`}>
        <circle r={58 + kick * 8} fill={C.em} opacity={0.14} />
        <line x1={0} y1={-34} x2={0} y2={-52} stroke={C.gold} strokeWidth={4} />
        <circle cy={-56} r={6} fill={C.gold} />
        <rect x={-38} y={-34} width={76} height={60} rx={18} fill={FILL} stroke={C.gold} strokeWidth={4} />
        <circle cx={-14} cy={-4} r={8} fill={C.em} />
        <circle cx={14} cy={-4} r={8} fill={C.em} />
        <path d="M-20 44 L20 44" stroke={`${C.em}88`} strokeWidth={4} strokeLinecap="round" />
      </g>
      {/* الشخص يمشي (يواجه اليسار) */}
      <g transform={`translate(0 ${bob})`}>
        {/* اليد الخلفية مع الشنطة */}
        <g transform={`rotate(${-sw * 16} ${X + 20} 150)`}>
          <line x1={X + 20} y1={150} x2={X + 24} y2={232} {...S} />
          <rect x={X - 4} y={238} width={60} height={44} rx={7} fill={FILL2} {...S} />
          <path d={`M${X + 14} 238 v-10 h20 v10`} fill="none" {...S} />
          <line x1={X - 4} y1={256} x2={X + 56} y2={256} stroke={`${C.gold}88`} strokeWidth={3} />
        </g>
        {/* القدمان */}
        <ellipse cx={X - 4 - sw * 26} cy={316} rx={18} ry={7} fill={C.gold} />
        <ellipse cx={X + 6 + sw * 26} cy={316} rx={18} ry={7} fill={`${C.gold}AA`} />
        {/* الثوب */}
        <path d={`M${X - 22} 136 C ${X - 44} 160, ${X - 50} 250, ${X - 46 - sw * 8} 310 L ${X + 52 - sw * 8} 310 C ${X + 52} 250, ${X + 44} 160, ${X + 24} 136 Z`} fill={FILL} {...S} />
        <line x1={X - 6} y1={150} x2={X - 6} y2={220} stroke={`${C.gold}66`} strokeWidth={3} />
        {/* اليد الأمامية */}
        <line x1={X - 18} y1={150} x2={X - 18 - sw * 30} y2={228} {...S} />
        <circle cx={X - 18 - sw * 30} cy={230} r={6} fill={C.gold} />
        <HeadShemagh x={X} y={96} r={33} side={1} />
      </g>
    </svg>
  );
};

/* ═════════ الطالب: يكتب في دفتره ← تضيء الفكرة ← تنزل قبعة التخرج والمنحنى يصعد ═════════ */
export const StudentScene: React.FC<{ lf: number }> = ({ lf }) => {
  const { kick } = useMusic();
  const grow = smooth((lf - 2) / 34);
  const pts = Array.from({ length: 41 }, (_, i) => {
    const t = i / 40;
    return [40 + t * 340, 300 - Math.pow(t, 2.1) * 250] as const;
  });
  const d = `M${pts.map(([x, y]) => `${x} ${y}`).join(" L")}`;
  const [tx, ty] = pts[Math.min(40, Math.round(grow * 40))];
  const write = lf < 22 ? Math.sin(lf * 1.1) * 7 : 0;
  const bulb = smooth((lf - 20) / 6);
  const cap = smooth((lf - 30) / 9);
  const X = 540;
  return (
    <svg width="720" height="340" viewBox="0 0 720 340" style={{ overflow: "visible" }}>
      {/* منحنى المهارة خلفه */}
      {[1, 2, 3, 4].map((i) => (
        <line key={i} x1={40} y1={300 - i * 60} x2={400} y2={300 - i * 60} stroke={`${C.white}12`} strokeWidth={2} />
      ))}
      <path d={`${d} L380 300 L40 300 Z`} fill={C.em} opacity={0.12 * grow} />
      <path d={d} fill="none" stroke={C.gold} strokeWidth={5} strokeLinecap="round" style={draw(grow)} />
      <circle cx={tx} cy={ty} r={14 + kick * 8} fill={C.em} opacity={0.35 * Math.min(1, grow * 3)} />
      <circle cx={tx} cy={ty} r={7} fill="#FFF8E6" opacity={Math.min(1, grow * 3)} />
      <line x1={20} y1={322} x2={700} y2={322} stroke={`${C.gold}44`} strokeWidth={3} />
      {/* الشنطة خلف الظهر */}
      <rect x={X + 30} y={150} width={44} height={86} rx={14} fill={FILL2} {...S} />
      {/* الجسم بالثوب (أمامي) */}
      <path d={`M${X - 34} 140 C ${X - 52} 170, ${X - 56} 260, ${X - 52} 318 L ${X + 52} 318 C ${X + 56} 260, ${X + 52} 170, ${X + 34} 140 Z`} fill={FILL} {...S} />
      {/* حمّالات الشنطة */}
      <line x1={X - 22} y1={144} x2={X - 26} y2={214} stroke={`${C.gold}AA`} strokeWidth={4} />
      <line x1={X + 22} y1={144} x2={X + 26} y2={214} stroke={`${C.gold}AA`} strokeWidth={4} />
      {/* الدفتر مفتوح + اليدين */}
      <path d={`M${X - 52} 206 L ${X} 218 L ${X + 52} 206 L ${X + 52} 244 L ${X} 254 L ${X - 52} 244 Z`} fill="#F5F1E8" stroke={C.gold} strokeWidth={3} />
      <line x1={X} y1={218} x2={X} y2={254} stroke={C.gold2} strokeWidth={2} />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={X - 44} y1={222 + i * 9} x2={X - 44 + 34 * clamp((lf - i * 6) / 6)} y2={224 + i * 9} stroke="#1D4ED8" strokeWidth={2.5} strokeLinecap="round" />
      ))}
      <path d={`M${X - 36} 150 L ${X - 56} 200 L ${X - 48} 226`} fill="none" {...S} />
      <path d={`M${X + 36} 150 L ${X + 40} 196 L ${X + 6 + write} 222`} fill="none" {...S} />
      <line x1={X + 6 + write} y1={222} x2={X + 18 + write} y2={206} stroke={C.em} strokeWidth={4} strokeLinecap="round" />
      {/* الرأس: طالب بشعر قصير */}
      <g transform={`translate(${X} 100)`}>
        <circle r={32} cy={4} fill={FILL} {...S} />
        <path d="M-32 0 C -32 -36, 32 -36, 32 0 C 22 -14, -22 -14, -32 0 Z" fill={C.gold} opacity={0.85} />
      </g>
      {/* لمبة الفكرة */}
      <g transform={`translate(${X + 70} ${46 - bulb * 6}) scale(${bulb})`} opacity={bulb * (1 - cap * 0.6)}>
        <circle r={34 + kick * 10} fill={C.em} opacity={0.2} />
        <circle r={16} cy={-4} fill="#FFF8E6" stroke={C.gold} strokeWidth={3} />
        <rect x={-7} y={12} width={14} height={8} rx={2} fill={C.gold} />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={0} y1={-26} x2={0} y2={-34} stroke={C.gold} strokeWidth={3} strokeLinecap="round" transform={`rotate(${-60 + i * 30} 0 -4)`} />
        ))}
      </g>
      {/* قبعة التخرج تنزل على رأسه */}
      <g transform={`translate(${X} ${74 - (1 - cap) * 160}) rotate(${(1 - cap) * -25})`} opacity={cap}>
        <path d="M-50 0 L0 -22 L50 0 L0 22 Z" fill={C.gold} />
        <path d="M-30 10 v14 c0 12 60 12 60 0 v-14" fill="#B8954C" />
        <line x1={40} y1={4} x2={40} y2={36} stroke={C.gold} strokeWidth={3} />
        <circle cx={40} cy={39} r={5} fill={C.gold} />
      </g>
    </svg>
  );
};
