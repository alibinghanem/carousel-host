import { Fragment } from "react";
import { Img } from "remotion";
import { Cam, smooth } from "../../lib/camera3d";
import { Obj } from "../ClaudeTrio/art";
import { BODY, KUFI, LAT, clamp, ramp } from "../ClaudeTrio/parts";
import { Ico, P, Pawn, Tile, V } from "./parts";
import { PITCH, S, TABLE_Y, Z } from "./tl";

type Pr = { cam: Cam; f: number };
const W = 1100;
const H = 1000;
const CX = 550;
const CY = 500;

/** مسرح مسطّح على الطاولة: إحداثياته بالبكسل (x يمين، y نحو المشاهد) */
const Stage: React.FC<{ cam: Cam; z: number; children: React.ReactNode }> = ({ cam, z, children }) => (
  <Obj cam={cam} y={TABLE_Y} z={z} rx={90} far={2300} farSoft={500}>
    <div style={{ position: "relative", width: W, height: H, scale: "1.3" }}>{children}</div>
  </Obj>
);
const At: React.FC<{ x: number; y: number; children: React.ReactNode; o?: number; sc?: number; rot?: number }> = ({ x, y, children, o = 1, sc = 1, rot = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", opacity: o, scale: `${sc}`, rotate: `${rot}deg` }}>{children}</div>
);
/** نص قائم يواجه الكاميرا (عنوان/جملة) */
const Bill: React.FC<{ cam: Cam; z: number; y: number; children: React.ReactNode; o?: number; near?: number }> = ({ cam, z, y, children, o = 1, near = 1300 }) => (
  <Obj cam={cam} y={y} z={z} rx={PITCH} opacity={o} near={near}>
    <div style={{ direction: "rtl", textAlign: "center", whiteSpace: "nowrap", translate: `0px ${(1 - clamp(o)) * 24}px` }}>{children}</div>
  </Obj>
);
const Head: React.FC<{ cam: Cam; z: number; lf: number; n: string; title: string; sub: string; color: string }> = ({ cam, z, lf, n, title, sub, color }) => {
  const p = ramp(lf, 4, 18);
  return (
    <Bill cam={cam} z={z - 420} y={-60} o={p}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 22 }}>
        <div style={{ width: 84, height: 84, borderRadius: "50%", background: color, color: "#fff", display: "grid", placeItems: "center", font: `900 52px ${KUFI}`, boxShadow: `0 8px 0 ${color}55` }}>{n}</div>
        <div style={{ font: `900 108px/1.2 ${KUFI}`, color: P.ink }}>{title}</div>
      </div>
      <div style={{ marginTop: 4, font: `700 48px/1.4 ${BODY}`, color }}>{sub}</div>
    </Bill>
  );
};
const Verdict: React.FC<{ cam: Cam; z: number; o: number; color: string; children: React.ReactNode }> = ({ cam, z, o, color, children }) => (
  <Bill cam={cam} z={z + 400} y={330} o={o} near={400}>
    <div style={{ display: "inline-block", padding: "14px 40px 20px", borderRadius: 999, background: color, color: "#fff", font: `900 40px/1.3 ${KUFI}`, boxShadow: `0 8px 0 ${color}66` }}>{children}</div>
  </Bill>
);
const Timer: React.FC<{ p: number; color: string; label: string }> = ({ p, color, label }) => (
  <div style={{ display: "grid", justifyItems: "center", gap: 6 }}>
    <svg width={150} height={150} viewBox="-60 -60 120 120" style={{ rotate: "-90deg", overflow: "visible" }}>
      <circle r={50} fill={P.white} stroke={`${color}33`} strokeWidth={10} />
      <circle r={50} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${clamp(p) * 314} 400`} />
    </svg>
    <div style={{ font: `900 40px ${KUFI}`, color: P.ink, direction: "rtl" }}>{label}</div>
  </div>
);

/* ═══ الهوك: وكيل واحد وطلبات تتكدس عليه ═══ */
export const Hook: React.FC<Pr> = ({ cam, f }) => {
  const out = 1 - smooth((f - 114) / 10);
  const n = 9;
  return (
    <>
      <Stage cam={cam} z={Z.hook}>
        <At x={CX} y={CY} sc={0.9 + ramp(f, 0, 14) * 0.1}>
          <Pawn s={230} color={P.single} f={f} pulse />
        </At>
        {Array.from({ length: n }, (_, i) => {
          const a = (-90 + i * (360 / n)) * (Math.PI / 180);
          const tx = CX + Math.cos(a) * 400;
          const ty = CY + Math.sin(a) * 330;
          const t0 = 30 + i * 7;
          const p = ramp(f, t0, 12);
          const lift = (1 - p) * 420;
          const kinds: ("search" | "chart" | "pen")[] = ["search", "chart", "pen"];
          return (
            <At key={i} x={tx} y={ty - lift * 0.4} o={p} sc={0.8 + 0.2 * p} rot={(i % 3) * 6 - 6}>
              <Tile s={150} color={P.single} icon={kinds[i % 3]} />
            </At>
          );
        })}
      </Stage>
      <Bill cam={cam} z={Z.hook - 350} y={-80} o={ramp(f, 4, 14) * out}>
        <div style={{ font: `900 130px/1.2 ${KUFI}`, color: P.ink }}>وكيل واحد</div>
        <div style={{ font: `900 130px/1.2 ${KUFI}`, color: P.single }}>ولا فريق وكلاء؟</div>
      </Bill>
    </>
  );
};

/* ═══ ١ · وكيل واحد: يمرّ على المهام وحدة وحدة ═══ */
const RING = [
  { icon: "search", label: "بحث ١" },
  { icon: "search", label: "بحث ٢" },
  { icon: "search", label: "بحث ٣" },
  { icon: "chart", label: "تحليل" },
  { icon: "pen", label: "كتابة" },
  { icon: "check", label: "مراجعة" },
] as const;
const ringPos = (i: number, r = 1) => {
  const a = (-90 + i * 60) * (Math.PI / 180);
  return { x: CX + Math.cos(a) * 400 * r, y: CY + Math.sin(a) * 330 * r };
};
export const SingleScene: React.FC<Pr> = ({ cam, f }) => {
  const lf = f - S.single;
  const z = Z.single;
  // مسار القطعة: من الوسط ثم على المهام بالترتيب
  const stops = [{ x: CX, y: CY }, ...RING.map((_, i) => ringPos(i, 0.58))];
  const T0 = 22;
  const STEP = 20;
  const seg = Math.min(RING.length - 1, Math.max(0, Math.floor((lf - T0) / STEP)));
  const u = smooth(((lf - T0) % STEP) / 12);
  const a = lf < T0 ? stops[0] : stops[seg];
  const b = lf < T0 ? stops[0] : stops[seg + 1];
  const done = lf >= T0 + RING.length * STEP;
  const pos = done ? stops[RING.length] : { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
  const visited = lf < T0 ? 0 : Math.min(RING.length, Math.floor((lf - T0) / STEP) + (((lf - T0) % STEP) / 12 >= 1 ? 1 : 0));
  const pts = [stops[0], ...stops.slice(1, visited + 1)];
  const timerP = clamp((lf - T0) / (RING.length * STEP + 4));
  return (
    <>
      <Stage cam={cam} z={z}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={P.single} strokeWidth={6} strokeDasharray="4 14" strokeLinecap="round" />
        </svg>
        {RING.map((r, i) => {
          const p = ringPos(i);
          return (
            <At key={i} x={p.x} y={p.y} o={ramp(lf, 4 + i * 3, 10)}>
              <Tile s={190} color={P.single} icon={r.icon} label={r.label} done={ramp(lf, T0 + i * STEP + 12, 8)} />
            </At>
          );
        })}
        <At x={pos.x} y={pos.y}>
          <Pawn s={210} color={P.single} f={f} progress={undefined} pulse />
        </At>
        <At x={940} y={880} o={ramp(lf, 10, 12)}>
          <Timer p={timerP} color={P.single} label="الوقت" />
        </At>
      </Stage>
      <Head cam={cam} z={z} lf={lf} n="1" title="وكيل واحد" sub="يمرّ على المهام وحدة وحدة" color={P.single} />
      <Verdict cam={cam} z={z} o={ramp(lf, 128, 12)} color={P.single}>
        يكفي للمهمة البسيطة
      </Verdict>
    </>
  );
};

/* ═══ ٢ · فريق وكلاء: منسّق يوزّع والكل يشتغل بالتوازي ═══ */
const WORKERS = [
  { x: CX - 340, y: CY + 150, c: P.team, icon: "search" as const },
  { x: CX + 340, y: CY + 150, c: P.violet, icon: "chart" as const },
  { x: CX, y: CY - 270, c: P.single, icon: "pen" as const },
];
export const TeamScene: React.FC<Pr> = ({ cam, f }) => {
  const lf = f - S.team;
  const z = Z.team;
  const split = ramp(lf, 30, 26);
  const busy = clamp((lf - 56) / 54);
  const back = ramp(lf, 112, 26);
  const report = ramp(lf, 140, 10);
  return (
    <>
      <Stage cam={cam} z={z}>
        {/* صورة حقيقية لفريق حول الطاولة: سجادة تحت القطع */}
        <At x={CX} y={CY} o={ramp(lf, 0, 20) * 0.85}>
          <div style={{ width: 980, height: 980, borderRadius: "50%", overflow: "hidden", border: `8px solid ${P.team}`, boxShadow: "0 24px 60px rgba(40,30,10,.3)" }}>
            <Img src={V("team.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(.85)" }} />
            <div style={{ position: "absolute", inset: 0, background: `${P.paper}66` }} />
          </div>
        </At>
        {/* خطوط التوزيع */}
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {WORKERS.map((w, i) => (
            <line key={i} x1={CX} y1={CY} x2={CX + (w.x - CX) * split} y2={CY + (w.y - CY) * split} stroke={w.c} strokeWidth={7} strokeDasharray="4 14" strokeLinecap="round" />
          ))}
        </svg>
        {/* المهمة الكبيرة عند المنسّق ثم تنقسم */}
        <At x={CX} y={CY} o={ramp(lf, 8, 8) * (1 - split)} sc={1.2}>
          <Tile s={190} color={P.gold} icon="target" label="مهمة كبيرة" />
        </At>
        {WORKERS.map((w, i) => {
          const px = CX + (w.x - CX) * split;
          const py = CY + (w.y - CY) * split - Math.sin(split * Math.PI) * 60;
          const landed = split >= 1;
          const bx = landed ? w.x : px;
          const by = landed ? w.y + (w.y > CY ? 150 : -150) : py;
          return (
            <Fragment key={i}>
              <At x={w.x} y={w.y} o={ramp(lf, 14 + i * 4, 12)}>
                <Pawn s={190} color={w.c} f={f} progress={lf > 56 ? busy * (1 - back * 0.0) : 0} />
              </At>
              <At x={bx} y={by} o={split > 0.02 ? 1 - back : 0} sc={0.7}>
                <Tile s={120} color={w.c} icon={w.icon} done={busy >= 1 ? ramp(lf, 112, 6) : 0} />
              </At>
              {/* نتيجة ترجع للمنسّق */}
              {back > 0 && back < 1 ? (
                <At x={w.x + (CX - w.x) * back} y={w.y + (CY - w.y) * back} sc={0.6} o={1 - report}>
                  <Ico k="doc" s={90} c={w.c} />
                </At>
              ) : null}
            </Fragment>
          );
        })}
        <At x={CX} y={CY}>
          <Pawn s={240} color={P.gold} crown f={f} pulse />
        </At>
        <At x={CX} y={CY - 8} o={report} sc={0.6 + 0.4 * report}>
          <div style={{ width: 130, height: 130, borderRadius: 26, background: P.ok, display: "grid", placeItems: "center", boxShadow: `0 10px 0 ${P.ok}77` }}>
            <Ico k="doc" s={78} c="#fff" />
          </div>
        </At>
        <At x={940} y={880} o={ramp(lf, 10, 12)}>
          <Timer p={clamp((lf - 22) / 118)} color={P.team} label="الوقت" />
        </At>
      </Stage>
      <Head cam={cam} z={z} lf={lf} n="2" title="فريق وكلاء" sub="منسّق يوزّع… والكل يشتغل بالتوازي" color={P.team} />
      <Verdict cam={cam} z={z} o={ramp(lf, 146, 12)} color={P.team}>
        للمهمة الكبيرة المتشعّبة
      </Verdict>
    </>
  );
};

/* ═══ ٣ · وش تعطي كل متخصص؟ أربع أشياء ═══ */
const BRIEF = [
  { label: "الهدف", icon: "target" as const, x: CX + 430, y: CY - 250, c: P.single },
  { label: "شكل الناتج", icon: "doc" as const, x: CX - 430, y: CY - 250, c: P.violet },
  { label: "الأدوات", icon: "tool" as const, x: CX + 430, y: CY + 270, c: P.team },
  { label: "الحدود", icon: "stop" as const, x: CX - 430, y: CY + 270, c: P.gold },
];
export const BriefScene: React.FC<Pr> = ({ cam, f }) => {
  const lf = f - S.brief;
  const z = Z.brief;
  const ready = ramp(lf, 112, 10);
  return (
    <>
      <Stage cam={cam} z={z}>
        <At x={CX} y={CY} o={ramp(lf, 0, 12)}>
          <Pawn s={290} color={P.team} f={f} pulse={ready > 0.5} progress={ready} />
        </At>
        {BRIEF.map((b, i) => {
          const t0 = 12 + i * 22;
          const p = smooth((lf - t0) / 18);
          const sx = CX + (b.x - CX) * 1.9;
          const sy = CY + (b.y - CY) * 1.9;
          const dx = CX + (b.x - CX) * 0.62;
          const dy = CY + (b.y - CY) * 0.62;
          const x = sx + (dx - sx) * p;
          const y = sy + (dy - sy) * p;
          return (
            <Fragment key={i}>
              {p >= 1 ? (
                <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                  <line x1={CX} y1={CY} x2={dx} y2={dy} stroke={b.c} strokeWidth={7} strokeDasharray="4 14" strokeLinecap="round" />
                </svg>
              ) : null}
              <At x={x} y={y} o={clamp(p * 2)}>
                <div style={{ display: "grid", justifyItems: "center", gap: 10 }}>
                  <div style={{ width: 190, height: 190, borderRadius: "50%", background: P.white, border: `6px solid ${b.c}`, display: "grid", placeItems: "center", boxShadow: `0 8px 0 ${b.c}55, 0 14px 30px rgba(40,30,10,.25)` }}>
                    <Ico k={b.icon} s={100} c={b.c} />
                  </div>
                  <div style={{ font: `900 58px ${KUFI}`, color: P.ink, direction: "rtl" }}>{b.label}</div>
                </div>
              </At>
            </Fragment>
          );
        })}
      </Stage>
      <Head cam={cam} z={z} lf={lf} n="3" title="وش تعطيه؟" sub="أربع أشياء لكل متخصص… بدونها يضيع" color={P.team} />
      <Verdict cam={cam} z={z} o={ramp(lf, 122, 12)} color={P.team}>
        يشتغل صح من أول مرة
      </Verdict>
    </>
  );
};

/* ═══ ٤ · الكلفة: أبراج عملات ═══ */
const TOWERS = [
  { n: 1, label: "محادثة", mult: "×١", x: CX - 340, c: P.mute },
  { n: 4, label: "وكيل", mult: "×٤", x: CX, c: P.single },
  { n: 15, label: "فريق", mult: "×١٥", x: CX + 340, c: P.team },
];
const Coin: React.FC<{ c: string; y: number; o: number }> = ({ c, y, o }) => (
  <div style={{ position: "absolute", left: 0, bottom: y, width: 170, height: 64, opacity: o }}>
    <div style={{ position: "absolute", inset: 0, top: 12, borderRadius: "50%", background: c, filter: "brightness(.72)" }} />
    <div style={{ position: "absolute", inset: 0, bottom: 12, borderRadius: "50%", background: c, border: `3px solid ${P.white}88` }} />
  </div>
);
export const CostScene: React.FC<Pr> = ({ cam, f }) => {
  const lf = f - S.cost;
  const z = Z.cost;
  const COIN_H = 18;
  return (
    <>
      <Stage cam={cam} z={z}>
        {TOWERS.map((t) => (
          <At key={t.label} x={t.x} y={CY + 150} o={ramp(lf, 6, 10)}>
            <div style={{ display: "grid", justifyItems: "center", gap: 2, direction: "rtl" }}>
              <div style={{ font: `900 70px ${KUFI}`, color: t.c }}>{t.mult}</div>
              <div style={{ font: `900 52px ${KUFI}`, color: P.ink }}>{t.label}</div>
            </div>
          </At>
        ))}
      </Stage>
      {TOWERS.map((t, ti) => (
        <Obj key={t.label} cam={cam} x={t.x - CX} y={TABLE_Y - 20 - 200} z={z - 40 + (ti === 1 ? 0 : 0)} rx={PITCH * 0.6}>
          <div style={{ position: "relative", width: 170, height: 400 }}>
            {Array.from({ length: t.n }, (_, k) => {
              const at = 14 + ti * 10 + k * (ti === 2 ? 3.2 : 8);
              const p = ramp(lf, at, 6);
              return <Coin key={k} c={t.c === P.mute ? P.gold : t.c} y={k * COIN_H + (1 - p) * 120} o={p} />;
            })}
          </div>
        </Obj>
      ))}
      <Head cam={cam} z={z} lf={lf} n="4" title="بس الفريق يكلّف" sub="استهلاك التوكنات أعلى بكثير" color={P.single} />
      <Bill cam={cam} z={z + 470} y={400} o={ramp(lf, 100, 14)} near={300}>
        <div style={{ font: `900 36px/1.35 ${KUFI}`, color: P.ink }}>
          لكن في بحث معقّد: الفريق تفوّق بـ <span style={{ color: P.team, fontFamily: LAT, direction: "ltr", display: "inline-block" }}>90.2%</span>
        </div>
        <div style={{ font: `600 26px/1.5 ${BODY}`, color: P.mute }}>
          على وكيل واحد (تقييم <bdi>Anthropic</bdi> الداخلي)
        </div>
      </Bill>
    </>
  );
};

/* ═══ ٥ · متى لا تحتاج فريق؟ لما الشغل مترابط ═══ */
export const AvoidScene: React.FC<Pr> = ({ cam, f }) => {
  const lf = f - S.avoid;
  const z = Z.avoid;
  const cut = ramp(lf, 100, 14);
  const calm = ramp(lf, 104, 12);
  const conflicts = [36, 52, 68, 84];
  return (
    <>
      <Stage cam={cam} z={z}>
        <At x={CX} y={CY} o={ramp(lf, 0, 12)}>
          <div style={{ width: 230, height: 290, borderRadius: 22, background: P.white, border: `5px solid ${P.ink}`, boxShadow: `0 10px 0 ${P.ink}33, 0 18px 40px rgba(40,30,10,.25)`, padding: "36px 28px", display: "grid", gap: 20, alignContent: "start" }}>
            {[170, 120, 150, 90].map((w, i) => (
              <div key={i} style={{ height: 14, width: w, borderRadius: 7, background: i === 2 ? P.bad : P.ink, opacity: i === 2 ? 1 : 0.5 }} />
            ))}
            <div style={{ position: "absolute", bottom: 18, left: 0, right: 0, textAlign: "center", font: `900 34px ${KUFI}`, color: P.ink, direction: "rtl" }}>كود المشروع</div>
          </div>
        </At>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {WORKERS.map((w, i) => {
            const kept = i === 0;
            const hot = lf > 30 && lf < 100 && Math.sin(lf / 2 + i) > 0;
            const o = kept ? 1 : 1 - cut;
            return <line key={i} x1={w.x} y1={w.y} x2={CX} y2={CY} stroke={hot ? P.bad : P.mute} strokeWidth={7} strokeDasharray="4 14" strokeLinecap="round" opacity={0.2 + o * 0.8} />;
          })}
        </svg>
        {WORKERS.map((w, i) => (
          <At key={i} x={w.x} y={w.y} o={i === 0 ? ramp(lf, 4, 10) : ramp(lf, 4 + i * 4, 10) * (1 - cut)} sc={i === 0 ? 1 + calm * 0.15 : 1}>
            <Pawn s={210} color={i === 0 && calm > 0.5 ? P.ok : P.team} f={f} />
          </At>
        ))}
        {conflicts.map((t, i) => {
          const p = ramp(lf, t, 6) * (1 - ramp(lf, t + 14, 8));
          const wp = WORKERS[1 + (i % 2)];
          return (
            <At key={t} x={(wp.x + CX) / 2} y={(wp.y + CY) / 2} o={p} sc={0.6 + p * 0.7}>
              <div style={{ width: 96, height: 96, borderRadius: "50%", background: P.bad, display: "grid", placeItems: "center", boxShadow: `0 8px 0 ${P.bad}77` }}>
                <svg width={52} height={52} viewBox="0 0 24 24" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" fill="none"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </div>
            </At>
          );
        })}
        <At x={WORKERS[0].x + 150} y={WORKERS[0].y} o={calm} sc={0.6 + 0.4 * calm}>
          <div style={{ width: 120, height: 120, borderRadius: "50%", background: P.ok, display: "grid", placeItems: "center", boxShadow: `0 8px 0 ${P.ok}77` }}>
            <Ico k="check" s={72} c="#fff" />
          </div>
        </At>
      </Stage>
      <Head cam={cam} z={z} lf={lf} n="5" title="ومتى لا تحتاجه؟" sub="لما الشغل مترابط ويحتاج سياق واحد" color={P.bad} />
      <Verdict cam={cam} z={z} o={ramp(lf, 116, 12)} color={P.ink}>
        مثل أغلب البرمجة: وكيل واحد
      </Verdict>
    </>
  );
};

