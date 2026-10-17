import { Img } from "remotion";
import { Cam, smooth } from "../../lib/camera3d";
import { useMusic } from "../../lib/music";
import { Obj } from "../ClaudeTrio/art";
import { Person } from "../ClaudeTrio/art";
import { BODY, Chip, ClaudeMark, Gauge, HEAD, MONO, P, V, clamp, ramp } from "./parts";
import { HIT, S, X } from "./tl";

type Pr = { cam: Cam; f: number };

/** عنوان المقياس فوق العدّاد (بدون خلفية) */
const Title: React.FC<{ cam: Cam; x: number; lf: number; n: string; title: string; sub: string; color: string }> = ({ cam, x, lf, n, title, sub, color }) => {
  const p = ramp(lf, 4, 16);
  return (
    <Obj cam={cam} x={x} y={-600} z={0} opacity={p}>
      <div style={{ direction: "rtl", textAlign: "center", whiteSpace: "nowrap", translate: `0px ${(1 - p) * 30}px` }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 22 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: color, color: P.bg, display: "grid", placeItems: "center", font: `900 52px ${HEAD}`, boxShadow: `0 0 40px ${color}88` }}>{n}</div>
          <div style={{ font: `900 100px/1.2 ${HEAD}`, color: P.ink }}>{title}</div>
        </div>
        <div style={{ marginTop: 2, font: `700 46px/1.4 ${BODY}`, color }}>{sub}</div>
      </div>
    </Obj>
  );
};
const Cap: React.FC<{ cam: Cam; x: number; y: number; p: number; size?: number; color?: string; children: React.ReactNode; w?: number }> = ({ cam, x, y, p, size = 44, color = P.ink, children, w = 960 }) => (
  <Obj cam={cam} x={x} y={y} z={20} opacity={p}>
    <div style={{ direction: "rtl", width: w, textAlign: "center", font: `700 ${size}px/1.45 ${BODY}`, color, translate: `0px ${(1 - p) * 20}px` }}>{children}</div>
  </Obj>
);
const Pod: React.FC<{ cam: Cam; x: number; lf: number; v: number; zones: [number, number, string][]; value: string; unit: string; f: number; tag?: string }> = ({ cam, x, lf, v, zones, value, unit, f, tag }) => {
  const p = ramp(lf, 0, 14);
  return (
    <Obj cam={cam} x={x} y={-150} z={30} opacity={p}>
      <div style={{ scale: `${0.85 + 0.15 * p}` }}>
        <Gauge size={600} v={v} zones={zones} value={value} unit={unit} f={f} tag={tag} />
      </div>
    </Obj>
  );
};
const ease = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
const over = (t: number) => {
  const c = clamp(t);
  return c < 1 ? ease(c) * 1.0 + Math.sin(c * Math.PI * 3) * 0.04 * (1 - c) : 1;
};

/* ═══ الهوك: تشغيل اللوحة (sweep) ═══ */
export const Hook: React.FC<Pr> = ({ cam, f }) => {
  const { kick } = useMusic();
  const out = 1 - smooth((f - 112) / 8);
  const sweep = f < HIT ? 0 : f < HIT + 24 ? smooth((f - HIT) / 24) : f < HIT + 52 ? 1 - smooth((f - HIT - 24) / 28) : 0;
  const lit = ramp(f, 40, 30);
  const x0 = X.hook;
  return (
    <>
      <Obj cam={cam} x={x0} y={-430} z={30} opacity={ramp(f, 2, 14) * out}>
        <div style={{ direction: "rtl", textAlign: "center", whiteSpace: "nowrap" }}>
          <div style={{ font: `900 96px/1.2 ${HEAD}`, color: P.ink }}>وكيلك شغّال…</div>
          <div style={{ font: `900 96px/1.2 ${HEAD}`, color: P.amber }}>بس هل هو شاطر؟</div>
        </div>
      </Obj>
      {[-1, 0, 1].map((i) => (
        <Obj key={i} cam={cam} x={x0 + i * 330} y={i === 0 ? 40 : 100} z={30} opacity={lit}>
          <Gauge size={i === 0 ? 400 : 330} v={sweep} zones={[[0, 0.5, P.red], [0.5, 0.8, P.amber], [0.8, 1, P.em]]} value="" f={f} />
        </Obj>
      ))}
      <Obj cam={cam} x={x0} y={40} z={60} opacity={ramp(f, 56, 14) * out}>
        <div style={{ scale: `${1 + kick * 0.05}` }}>
          <ClaudeMark size={120} glow={P.em} />
        </div>
      </Obj>
      <Obj cam={cam} x={x0} y={300} z={20} opacity={ramp(f, 76, 14) * out}>
        <div style={{ direction: "rtl", font: `700 54px/1.4 ${BODY}`, color: P.mute, whiteSpace: "nowrap" }}>أربع أرقام تقول لك الحقيقة</div>
      </Obj>
    </>
  );
};

const ZONES_GOOD: [number, number, string][] = [[0, 0.5, P.red], [0.5, 0.75, P.amber], [0.75, 1, P.em]];
const ZONES_LOW: [number, number, string][] = [[0, 0.3, P.em], [0.3, 0.6, P.amber], [0.6, 1, P.red]];

/* ═══ ١ · نسبة الإنجاز ═══ */
export const G1: React.FC<Pr> = ({ cam, f }) => {
  const lf = f - S.g1;
  const x = X.g1;
  const v = over((lf - 22) / 70) * 0.82;
  const n = Math.round(clamp((lf - 22) / 70) * 82);
  const states: (0 | 1 | 2)[] = [1, 1, 1, 1, 2, 1, 1, 1, 2, 1];
  return (
    <>
      <Title cam={cam} x={x} lf={lf} n="1" title="نسبة الإنجاز" sub="كم طلب خلّصه بنفسه؟" color={P.em} />
      <Pod cam={cam} x={x} lf={lf} v={v} zones={ZONES_GOOD} value={`${n}%`} unit="خلّص بنفسه" f={f} tag="مثال" />
      <Obj cam={cam} x={x} y={255} z={30}>
        <div style={{ display: "flex", gap: 10, direction: "ltr" }}>
          {states.map((s, i) => {
            const t = 30 + i * 6;
            return (
              <div key={i} style={{ opacity: ramp(lf, 10 + i * 2, 8) }}>
                <Chip s={78} state={lf >= t ? s : 0} p={ramp(lf, t, 6)} />
              </div>
            );
          })}
        </div>
      </Obj>
      <Cap cam={cam} x={x} y={360} p={ramp(lf, 100, 14)} size={44}>
        <span style={{ color: P.em }}>8</span> من <span style={{ color: P.ink }}>10</span> طلبات خلّصها صح بدون مساعدة
      </Cap>
      <Cap cam={cam} x={x} y={430} p={ramp(lf, 124, 14)} size={36} color={P.mute}>
        الخلاصة: الطلبات اللي انحلّت صح ÷ كل الطلبات
      </Cap>
    </>
  );
};

/* ═══ ٢ · معدّل التصعيد ═══ */
export const G2: React.FC<Pr> = ({ cam, f }) => {
  const lf = f - S.g2;
  const x = X.g2;
  const v = over((lf - 22) / 70) * 0.18;
  const n = Math.round(clamp((lf - 22) / 70) * 15);
  const flight = (t0: number, toHuman: boolean) => {
    const p = clamp((lf - t0) / 26);
    const sx = -250;
    const ex = toHuman ? 275 : -250;
    const ey = toHuman ? 232 : 190;
    return { x: sx + (ex - sx) * smooth(p), y: 270 + (ey - 270) * smooth(p) - Math.sin(p * Math.PI) * (toHuman ? 110 : 60), p };
  };
  const tk = [flight(40, false), flight(70, false), flight(100, true)];
  return (
    <>
      <Title cam={cam} x={x} lf={lf} n="2" title="معدّل التصعيد" sub="كم مرة سلّمها لإنسان؟" color={P.amber} />
      <Pod cam={cam} x={x} lf={lf} v={v} zones={ZONES_LOW} value={`${n}%`} unit="سلّمها لإنسان" f={f} tag="مثال" />
      <Obj cam={cam} x={x - 250} y={270} z={40} opacity={ramp(lf, 6, 12)}>
        <div style={{ scale: "1" }}>
          <div style={{ width: 150, height: 150, borderRadius: "50%", background: P.panel2, border: `5px solid ${P.em}`, display: "grid", placeItems: "center", boxShadow: `0 0 40px ${P.em}55` }}>
            <ClaudeMark size={84} />
          </div>
        </div>
      </Obj>
      <Obj cam={cam} x={x + 190} y={262} z={40} opacity={ramp(lf, 10, 12)}>
        <Person f={lf} arm="type" w={240} />
      </Obj>
      {tk.map((t, i) => (
        <Obj key={i} cam={cam} x={x + t.x} y={t.y} z={60} opacity={t.p > 0 ? 1 : 0}>
          <Chip s={64} state={t.p >= 1 ? (i === 2 ? 2 : 1) : 0} p={1} />
        </Obj>
      ))}
      <Cap cam={cam} x={x} y={410} p={ramp(lf, 114, 14)} size={38}>
        التصعيد الصح: <span style={{ color: P.amber }}>يسلّم الصعب للإنسان</span> ويخلّص البسيط
      </Cap>
    </>
  );
};

/* ═══ ٣ · الوقت الموفّر ═══ */
export const G3: React.FC<Pr> = ({ cam, f }) => {
  const lf = f - S.g3;
  const x = X.g3;
  const v = over((lf - 22) / 70) * 0.75;
  const n = Math.round(clamp((lf - 22) / 70) * 9);
  const bar = (label: string, w: number, color: string, t0: number, val: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 18, direction: "rtl" }}>
      <div style={{ width: 90, font: `900 40px ${HEAD}`, color: P.ink, textAlign: "right" }}>{label}</div>
      <div style={{ width: 640, height: 44, borderRadius: 22, background: P.panel2, overflow: "hidden", direction: "ltr" }}>
        <div style={{ width: 640 * w * ease((lf - t0) / 34), height: 44, borderRadius: 22, background: color, boxShadow: `0 0 24px ${color}88` }} />
      </div>
      <div style={{ width: 120, font: `800 38px ${MONO}`, color, direction: "ltr", opacity: ramp(lf, t0 + 30, 8) }}>{val}</div>
    </div>
  );
  return (
    <>
      <Title cam={cam} x={x} lf={lf} n="3" title="الوقت الموفّر" sub="كم دقيقة وفّر عليك؟" color={P.cyan} />
      <Pod cam={cam} x={x} lf={lf} v={v} zones={ZONES_GOOD} value={`${n}`} unit="دقائق وفّرها" f={f} tag="مثال" />
      <Obj cam={cam} x={x} y={265} z={30} opacity={ramp(lf, 20, 12)}>
        <div style={{ display: "grid", gap: 18 }}>
          {bar("قبل", 1, P.red, 36, "12 د")}
          {bar("بعد", 0.25, P.em, 70, "3 د")}
        </div>
      </Obj>
      <Cap cam={cam} x={x} y={400} p={ramp(lf, 112, 14)} size={42}>
        قارن وقت <span style={{ color: P.cyan }}>نفس المهمة</span> قبل الوكيل وبعده
      </Cap>
    </>
  );
};

/* ═══ ٤ · رضا المستخدم ═══ */
export const G4: React.FC<Pr> = ({ cam, f }) => {
  const lf = f - S.g4;
  const x = X.g4;
  const k = clamp((lf - 22) / 70);
  const v = over((lf - 22) / 70) * 0.88;
  const val = (Math.round(k * 44) / 10).toFixed(1);
  return (
    <>
      <Title cam={cam} x={x} lf={lf} n="4" title="رضا المستخدم" sub="هل طلع مرتاح؟" color={P.red} />
      <Pod cam={cam} x={x} lf={lf} v={v} zones={ZONES_GOOD} value={val} unit="من 5 نجوم" f={f} tag="مثال" />
      <Obj cam={cam} x={x - 235} y={270} z={30} opacity={ramp(lf, 14, 14)}>
        <div style={{ position: "relative", width: 400, height: 200, borderRadius: 105, overflow: "hidden", border: `10px solid ${P.line}`, boxShadow: "0 18px 40px rgba(0,0,0,.6)" }}>
          <Img src={V("cashier.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 40%", filter: "saturate(.9) brightness(.92)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, rgba(255,255,255,.22), transparent 40%)" }} />
        </div>
      </Obj>
      <Obj cam={cam} x={x + 215} y={270} z={30} opacity={ramp(lf, 20, 12)}>
        <div style={{ display: "flex", gap: 8, direction: "ltr" }}>
          {[0, 1, 2, 3, 4].map((i) => {
            const fill = clamp(k * 5 - i) * (i === 4 ? 0.4 : 1);
            return (
              <svg key={i} width={58} height={58} viewBox="0 0 24 24">
                <path d="M12 2.5l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17l-5.7 3 1.2-6.4-4.7-4.4 6.4-.8z" fill={P.line} />
                <clipPath id={`st${i}`}><rect x="0" y="0" width={24 * fill} height="24" /></clipPath>
                <path d="M12 2.5l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17l-5.7 3 1.2-6.4-4.7-4.4 6.4-.8z" fill={P.amber} clipPath={`url(#st${i})`} />
              </svg>
            );
          })}
        </div>
      </Obj>
      <Cap cam={cam} x={x} y={400} p={ramp(lf, 112, 14)} size={42}>
        اسأله بعد كل محادثة: <span style={{ color: P.red }}>كيف كانت؟</span>
      </Cap>
    </>
  );
};

/* ═══ ٥ · من وين تبدأ؟ حالات حقيقية ═══ */
export const Tip: React.FC<Pr> = ({ cam, f }) => {
  const lf = f - S.tip;
  const x = X.tip;
  const N = 24;
  const bad = new Set([5, 13, 19]);
  const done = Math.floor(clamp((lf - 22) / 90) * N);
  return (
    <>
      <Title cam={cam} x={x} lf={lf} n="★" title="ابدأ بحالات حقيقية" sub="مو بتخمين… بأمثلة فشلت" color={P.em} />
      <Obj cam={cam} x={x} y={-110} z={30} opacity={ramp(lf, 6, 12)}>
        <div style={{ width: 920, borderRadius: 40, background: P.panel, border: `4px solid ${P.line}`, padding: "30px 34px 36px", boxShadow: "0 26px 60px rgba(0,0,0,.55)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", direction: "ltr", marginBottom: 22 }}>
            <div style={{ font: `800 70px ${MONO}`, color: P.ink }}>
              {Math.min(N, done) - Array.from(bad).filter((b) => b < done).length}
              <span style={{ color: P.mute }}>/{N}</span>
            </div>
            <div style={{ font: `900 40px ${HEAD}`, color: P.amber, direction: "rtl" }}>حالات نجحت</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 14, direction: "ltr" }}>
            {Array.from({ length: N }, (_, i) => (
              <Chip key={i} s={90} state={i < done ? (bad.has(i) ? 2 : 1) : 0} p={ramp(lf, 22 + (i * 90) / N, 6)} />
            ))}
          </div>
        </div>
      </Obj>
      <Cap cam={cam} x={x} y={290} p={ramp(lf, 20, 14)} size={44}>
        اجمع <span style={{ color: P.amber, fontFamily: MONO, fontWeight: 800 }}>20–50</span> حالة فشل فيها وكيلك أو كاد
      </Cap>
      <Cap cam={cam} x={x} y={375} p={ramp(lf, 116, 14)} size={40}>
        وكل ما عدّلت الوكيل <span style={{ color: P.em }}>شغّلها من جديد</span>
      </Cap>
    </>
  );
};
