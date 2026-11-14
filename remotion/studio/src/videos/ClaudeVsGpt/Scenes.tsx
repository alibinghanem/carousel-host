import { Img } from "remotion";
import { Cam } from "../../lib/camera3d";
import { Obj, Say } from "../ClaudeTrio/art";
import { useMusic } from "../../lib/music";
import { S, Z } from "./tl";
import { BODY, ClaudeMark, En, GptMark, KUFI, LAT, P, VV, clamp, ramp } from "./parts";

const LX = 245; // مسار Claude (يمين) · ChatGPT (يسار)
type Side = "cl" | "gp";
const sx = (s: Side) => (s === "cl" ? LX : -LX);
const col = (s: Side) => (s === "cl" ? P.cl : P.gp);

/** شارة الأداة: دائرة داكنة بشعارها وتوهج بلون مسارها */
const Badge: React.FC<{ side: Side; f: number; size?: number }> = ({ side, f, size = 170 }) => {
  const { kick } = useMusic();
  const c = col(side);
  return (
    <div style={{ position: "relative", width: size, height: size, translate: `0px ${Math.sin(f / 14 + (side === "cl" ? 0 : 2)) * 10}px` }}>
      <div style={{ position: "absolute", inset: -size * 0.4, borderRadius: "50%", background: `radial-gradient(circle, ${c}${kick > 0.4 ? "66" : "44"} 0%, transparent 65%)` }} />
      <div style={{ position: "absolute", inset: -size * 0.1, borderRadius: "50%", border: `3px dashed ${c}88`, rotate: `${f * (side === "cl" ? 1.1 : -1.1)}deg` }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, #3A2370, ${P.bg})`, border: `4px solid ${c}`, boxShadow: `0 0 ${46 + kick * 36}px ${c}88`, display: "grid", placeItems: "center" }}>
        {side === "cl" ? <ClaudeMark size={size * 0.56} glow={c} /> : <GptMark size={size * 0.54} glow={c} />}
      </div>
    </div>
  );
};

/** بوابة المحطة: إطار علوي بعنوان المهمة */
const Gantry: React.FC<{ cam: Cam; z: number; lf: number; title: React.ReactNode; color?: string }> = ({ cam, z, lf, title, color = P.gold }) => {
  const p = ramp(lf, 2, 16);
  return (
    <>
      {[-1, 1].map((k) => (
        <Obj key={k} cam={cam} x={k * 500} y={-110} z={z + 40} opacity={p}>
          <div style={{ width: 26, height: 1020, borderRadius: 12, background: `linear-gradient(180deg, ${color}, #3A2370)`, boxShadow: `0 0 36px ${color}66` }} />
        </Obj>
      ))}
      <Obj cam={cam} y={-620} z={z + 40} opacity={p}>
        <div
          style={{
            direction: "rtl",
            width: 1050,
            padding: "20px 0 26px",
            textAlign: "center",
            borderRadius: 36,
            background: `linear-gradient(180deg, #2A1760, ${P.bg})`,
            border: `4px solid ${color}`,
            boxShadow: `0 0 70px ${color}66`,
            font: `900 86px/1.2 ${KUFI}`,
            color: P.ink,
            whiteSpace: "nowrap",
            translate: `0px ${(1 - p) * -40}px`,
          }}
        >
          {title}
        </div>
      </Obj>
    </>
  );
};

/** عمود محتوى داخل مسار: شارة + عنوان + شرح + رسم */
const Lane: React.FC<{
  cam: Cam;
  z: number;
  f: number;
  lf: number;
  side: Side;
  at: number;
  head: React.ReactNode;
  sub: React.ReactNode;
  headSize?: number;
  visual?: React.ReactNode;
  visualY?: number;
}> = ({ cam, z, f, lf, side, at, head, sub, headSize = 60, visual, visualY = 250 }) => {
  const c = col(side);
  const pB = ramp(lf, at, 14);
  const pH = ramp(lf, at + 14, 14);
  const pS = ramp(lf, at + 32, 14);
  const pV = ramp(lf, at + 52, 16);
  return (
    <>
      <Obj cam={cam} x={sx(side)} y={-330} z={z} opacity={pB}>
        <div style={{ scale: `${0.5 + 0.5 * pB}` }}>
          <Badge side={side} f={f} />
        </div>
      </Obj>
      <Obj cam={cam} x={sx(side)} y={-160} z={z} opacity={pH}>
        <div style={{ width: 440, textAlign: "center", direction: "rtl", font: `900 ${headSize}px/1.2 ${KUFI}`, color: c, whiteSpace: "nowrap", textShadow: `0 4px 28px ${P.bg}, 0 0 18px ${P.bg}`, translate: `0px ${(1 - pH) * 26}px` }}>
          {head}
        </div>
      </Obj>
      <Obj cam={cam} x={sx(side)} y={-40} z={z} opacity={pS}>
        <Say text={sub} size={38} width={430} color={P.ink} p={pS} />
      </Obj>
      {visual ? (
        <Obj cam={cam} x={sx(side)} y={visualY} z={z} opacity={pV}>
          <div style={{ scale: `${0.85 + 0.15 * pV}` }}>{visual}</div>
        </Obj>
      ) : null}
    </>
  );
};

/* ───── رسومات المحطات ───── */
const PicFrame: React.FC<{ lf: number; at: number }> = ({ lf, at }) => {
  const p = clamp((lf - at) / 40);
  return (
    <div style={{ position: "relative", width: 340, height: 240, borderRadius: 22, border: "6px solid #fff", overflow: "hidden", background: "linear-gradient(180deg,#46B8FF,#FFD7A0)", boxShadow: `0 0 50px ${P.gp}66` }}>
      <svg width="340" height="240" viewBox="0 0 340 240" style={{ position: "absolute", inset: 0 }}>
        <circle cx="250" cy="70" r={34 * p} fill="#FFE27A" />
        <path d={`M-10 ${240 - 90 * p} L90 ${110 + 60 * (1 - p)} L170 ${180 - 50 * p} L250 ${100 + 70 * (1 - p)} L350 ${190 - 40 * p} V240 H-10Z`} fill="#2F7D6B" />
        <path d={`M-10 ${240 - 40 * p} L120 ${170 + 40 * (1 - p)} L230 ${215 - 20 * p} L350 ${200 + 20 * (1 - p)} V240 H-10Z`} fill="#1E5A4D" />
      </svg>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: 40 + i * 110, top: 24 + (i % 2) * 40, width: 16, height: 16, borderRadius: "50%", background: "#fff", opacity: Math.max(0, Math.sin((lf - at) / 8 + i * 2)) * p, boxShadow: "0 0 16px #fff" }} />
      ))}
    </div>
  );
};

const ChartViz: React.FC<{ lf: number; at: number }> = ({ lf, at }) => {
  const hs = [90, 150, 120, 190];
  return (
    <div style={{ position: "relative", width: 340, height: 240, borderRadius: 22, border: `6px solid ${P.cl}`, background: "#2A1760", boxShadow: `0 0 50px ${P.cl}55`, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 22, padding: "0 0 26px" }}>
      {hs.map((h, i) => (
        <div key={i} style={{ width: 46, height: h * clamp((lf - at - i * 6) / 22), borderRadius: "10px 10px 4px 4px", background: i === 3 ? P.gold : P.cl }} />
      ))}
      <div style={{ position: "absolute", top: 12, right: 18, font: `700 24px ${LAT}`, color: P.gold, direction: "ltr" }}>SVG · HTML</div>
    </div>
  );
};

/** محور الزمن: 0 → 30 دقيقة، والمقطع يمتلئ بسرعة الأداة */
const TimeBar: React.FC<{ lf: number; at: number; from: number; to: number; color: string; fillFrames: number }> = ({ lf, at, from, to, color, fillFrames }) => {
  const W = 360;
  const g = clamp((lf - at) / fillFrames);
  return (
    <div style={{ width: W + 40, direction: "ltr" }}>
      <div style={{ position: "relative", width: W, height: 34, borderRadius: 17, background: "rgba(255,255,255,.14)", margin: "0 20px" }}>
        <div style={{ position: "absolute", left: (from / 30) * W, width: ((to - from) / 30) * W * g, top: 0, bottom: 0, borderRadius: 17, background: color, boxShadow: `0 0 30px ${color}` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", margin: "10px 20px 0", font: `700 28px ${LAT}`, color: P.mute }}>
        <span>0</span>
        <span>15</span>
        <span>30 min</span>
      </div>
    </div>
  );
};

const DocPhoto: React.FC<{ lf: number; at: number }> = ({ lf, at }) => {
  const sc = ((lf - at) * 5) % 300;
  return (
    <div style={{ position: "relative", width: 380, height: 270, borderRadius: 22, border: `6px solid ${P.cl}`, overflow: "hidden", boxShadow: `0 0 50px ${P.cl}55` }}>
      <Img src={VV("docs.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: sc - 20, height: 6, background: P.gold, boxShadow: `0 0 24px 8px ${P.gold}` }} />
      {["جدول", "رسم", "نص"].map((t, i) => (
        <div key={t} style={{ position: "absolute", right: 14, top: 18 + i * 56, padding: "2px 16px 6px", borderRadius: 999, background: P.gold, color: P.bg, font: `800 28px ${BODY}`, opacity: clamp((lf - at - 20 - i * 10) / 10) }}>
          {t}
        </div>
      ))}
    </div>
  );
};

const QDoc: React.FC<{ lf: number; at: number }> = ({ lf, at }) => (
  <div style={{ width: 300, height: 270, borderRadius: 22, border: `6px dashed ${P.gp}`, display: "grid", placeItems: "center", font: `900 190px ${KUFI}`, color: P.gp, textShadow: `0 0 40px ${P.gp}`, scale: `${1 + Math.sin((lf - at) / 10) * 0.04}` }}>؟</div>
);

/* ───── المشاهد ───── */
type SP = { cam: Cam; f: number };

export const Hook: React.FC<SP> = ({ cam, f }) => {
  const { kick } = useMusic();
  const line = (t: React.ReactNode, at: number, st: React.CSSProperties) => {
    const p = ramp(f, at, 12);
    return <div style={{ opacity: p, translate: `0px ${(1 - p) * 34}px`, filter: `blur(${(1 - p) * 10}px)`, whiteSpace: "nowrap", textShadow: `0 6px 40px ${P.bg}, 0 0 24px ${P.bg}`, ...st }}>{t}</div>;
  };
  return (
    <>
      {(["cl", "gp"] as Side[]).map((s) => (
        <Obj key={s} cam={cam} x={sx(s) * 1.25} y={-420} z={Z.hook} near={700} opacity={ramp(f, 0, 10)}>
          <div style={{ scale: `${1 + kick * 0.05}` }}>
            <Badge side={s} f={f} size={230} />
          </div>
        </Obj>
      ))}
      <Obj cam={cam} y={-420} z={Z.hook} near={700} opacity={ramp(f, 14, 10)}>
        <div style={{ font: `900 76px ${LAT}`, color: "#3A1668", textShadow: "0 0 20px #FFE9B0", scale: `${1 + kick * 0.1}` }}>VS</div>
      </Obj>
      <Obj cam={cam} y={20} z={Z.hook} near={700}>
        <div style={{ direction: "rtl", textAlign: "center", width: 1100 }}>
          {line(<><En color={P.cl}>Claude</En> أو <En color={P.gp}>ChatGPT</En>؟</>, 6, { font: `900 104px/1.25 ${KUFI}`, color: P.ink })}
          {line("السؤال غلط!", 26, { font: `900 128px/1.25 ${KUFI}`, color: P.gold })}
          <div style={{ height: 30 }} />
          {line("الصح: أيهما يناسب مهمتك؟", 56, { font: `700 58px/1.4 ${BODY}`, color: P.mute })}
        </div>
      </Obj>
    </>
  );
};

export const G1: React.FC<SP> = ({ cam, f }) => {
  const lf = f - S.g1;
  return (
    <>
      <Gantry cam={cam} z={Z.g1} lf={lf} title="تبي صورة؟" />
      <Lane cam={cam} z={Z.g1} f={f} lf={lf} side="cl" at={14} head="ما يولّد صور" sub="لكن يحلّل صورك ويرسم مخططات تفاعلية" headSize={56} visual={<ChartViz lf={lf} at={78} />} />
      <Lane cam={cam} z={Z.g1} f={f} lf={lf} side="gp" at={30} head="يولّد صور" sub="ويعدّلها بالكلام" visual={<PicFrame lf={lf} at={94} />} />
    </>
  );
};

export const G2: React.FC<SP> = ({ cam, f }) => {
  const lf = f - S.g2;
  return (
    <>
      <Gantry cam={cam} z={Z.g2} lf={lf} title="تبي بحث؟" />
      <Lane cam={cam} z={Z.g2} f={f} lf={lf} side="cl" at={14} head={<En>Research</En>} sub="تقرير خلال 1–3 دقايق" visual={<TimeBar lf={lf} at={78} from={1} to={3} color={P.cl} fillFrames={14} />} visualY={150} />
      <Lane cam={cam} z={Z.g2} f={f} lf={lf} side="gp" at={30} head={<En>Deep Research</En>} headSize={50} sub="من 5 إلى 30 دقيقة" visual={<TimeBar lf={lf} at={94} from={5} to={30} color={P.gp} fillFrames={90} />} visualY={150} />
      <Obj cam={cam} y={420} z={Z.g2} opacity={ramp(lf, 150, 14)}>
        <Say text={<>سريع وتبي رأس السالفة؟ أو وقتك واسع؟</>} size={46} color={P.gold} width={900} p={ramp(lf, 150, 14)} />
      </Obj>
    </>
  );
};

export const G3: React.FC<SP> = ({ cam, f }) => {
  const lf = f - S.g3;
  return (
    <>
      <Gantry cam={cam} z={Z.g3} lf={lf} title="تبي تحلّل ملفات؟" />
      <Lane cam={cam} z={Z.g3} f={f} lf={lf} side="cl" at={14} head="20 ملف بالمحادثة" headSize={50} sub="وPDF حتى 100 صفحة بجداولها ورسومها" visual={<DocPhoto lf={lf} at={80} />} visualY={270} />
      <Lane cam={cam} z={Z.g3} f={f} lf={lf} side="gp" at={30} head="جرّب نفس الملف" headSize={50} sub="وقارن الجواب بنفسك" visual={<QDoc lf={lf} at={96} />} visualY={270} />
    </>
  );
};

export const Test: React.FC<SP> = ({ cam, f }) => {
  const lf = f - S.test;
  const items: [string, React.ReactNode][] = [
    ["١", "نفس الطلب في الاثنين"],
    ["٢", "نفس الملف أو السؤال"],
    ["٣", <>قارن الدقة<br /><b style={{ color: P.gold }}>والنبرة والتعديلات</b></>],
  ];
  return (
    <>
      <Gantry cam={cam} z={Z.test} lf={lf} title="الاختبار الحقيقي" />
      {items.map(([n, t], i) => {
        const p = ramp(lf, 20 + i * 28, 14);
        return (
          <Obj key={i} cam={cam} y={-250 + i * 190} z={Z.test} opacity={p}>
            <div style={{ display: "flex", alignItems: "center", gap: 28, direction: "rtl", translate: `${(1 - p) * 60}px 0px` }}>
              <div style={{ width: 96, height: 96, borderRadius: "50%", background: i === 2 ? P.gold : P.cl, color: P.bg, display: "grid", placeItems: "center", font: `900 58px ${KUFI}`, boxShadow: `0 0 40px ${i === 2 ? P.gold : P.cl}88` }}>{n}</div>
              <div style={{ font: `900 58px/1.25 ${KUFI}`, color: P.ink, whiteSpace: "nowrap", textShadow: `0 4px 28px ${P.bg}, 0 0 18px ${P.bg}` }}>{t}</div>
            </div>
          </Obj>
        );
      })}
      {(["cl", "gp"] as Side[]).map((s, i) => (
        <Obj key={s} cam={cam} x={sx(s) * 1.5} y={420} z={Z.test} opacity={ramp(lf, 110 + i * 10, 14)}>
          <Badge side={s} f={f} size={150} />
        </Obj>
      ))}
    </>
  );
};

export const Verdict: React.FC<SP> = ({ cam, f }) => {
  const lf = f - S.verdict;
  const { kick } = useMusic();
  return (
    <>
      {(["cl", "gp"] as Side[]).map((s, i) => (
        <Obj key={s} cam={cam} x={sx(s) * 0.9} y={-380} z={Z.verdict} opacity={ramp(lf, 4 + i * 8, 14)}>
          <div style={{ scale: `${1 + kick * 0.04}` }}>
            <Badge side={s} f={f} size={200} />
          </div>
        </Obj>
      ))}
      <Obj cam={cam} y={-380} z={Z.verdict} opacity={ramp(lf, 14, 12)}>
        <div style={{ font: `900 90px ${KUFI}`, color: P.gold, textShadow: `0 0 36px ${P.gold}` }}>+</div>
      </Obj>
      <Obj cam={cam} y={-10} z={Z.verdict}>
        <div style={{ direction: "rtl", textAlign: "center", width: 1100 }}>
          <Say text="اختر حسب المهمة" size={112} font={KUFI} weight={900} color={P.ink} p={ramp(lf, 24, 14)} width={1100} />
          <Say text="مو حسب الاسم" size={112} font={KUFI} weight={900} color={P.gold} p={ramp(lf, 44, 14)} width={1100} />
          <div style={{ height: 24 }} />
          <Say text="والاثنين عندك؟ استخدم الأنسب لكل مهمة" size={48} color={P.mute} p={ramp(lf, 80, 14)} width={1000} />
        </div>
      </Obj>
    </>
  );
};
