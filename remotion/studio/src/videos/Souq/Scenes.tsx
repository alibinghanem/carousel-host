import { Fragment } from "react";
import { Cam, smooth } from "../../lib/camera3d";
import { useMusic } from "../../lib/music";
import { Obj } from "../ClaudeTrio/art";
import { BODY, HEAD, Img, MONO, P, V, ease, ramp } from "./parts";
import { HIT, S, X } from "./tl";

type Pr = { cam: Cam; f: number };

/** بسطة: مظلة مخططة + لوحة خشبية بعنوان الخدمة (رقم · عنوان · من يشتريها) + أعمدة */
const Stall: React.FC<{ cam: Cam; x: number; lf: number; color: string; n: string; title: string; sub: string }> = ({ cam, x, lf, color, n, title, sub }) => {
  const p = ramp(lf, 2, 16);
  return (
    <>
      <Obj cam={cam} x={x - 480} y={-130} z={10}>
        <div style={{ width: 16, height: 700, background: P.wood3, borderRadius: 8 }} />
      </Obj>
      <Obj cam={cam} x={x + 480} y={-130} z={10}>
        <div style={{ width: 16, height: 700, background: P.wood3, borderRadius: 8 }} />
      </Obj>
      <Obj cam={cam} x={x} y={-585} z={30} opacity={p}>
        <div style={{ position: "relative", width: 1040, height: 150, translate: `0px ${(1 - p) * -40}px` }}>
          <div style={{ position: "absolute", inset: 0, bottom: 28, borderRadius: "18px 18px 0 0", background: `repeating-linear-gradient(90deg, ${color} 0 70px, ${P.cream} 70px 140px)`, boxShadow: "0 18px 28px rgba(60,30,10,.28)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 56, background: `radial-gradient(circle at 35px 0, ${color} 34px, transparent 35px) 0 0/140px 56px repeat-x, radial-gradient(circle at 105px 0, ${P.cream} 34px, transparent 35px) 0 0/140px 56px repeat-x` }} />
        </div>
      </Obj>
      <Obj cam={cam} x={x} y={-395} z={60} opacity={p}>
        <div style={{ position: "relative", width: 800, padding: "18px 40px 24px", borderRadius: 22, background: `linear-gradient(180deg, ${P.wood2}, ${P.wood})`, border: `6px solid ${P.wood3}`, boxShadow: "0 22px 36px rgba(60,30,10,.35)", direction: "rtl", textAlign: "center", translate: `0px ${(1 - p) * -30}px` }}>
          <div style={{ position: "absolute", left: 120, top: -34, width: 6, height: 40, background: P.wood3 }} />
          <div style={{ position: "absolute", right: 120, top: -34, width: 6, height: 40, background: P.wood3 }} />
          <div style={{ position: "absolute", right: -30, top: -30, width: 84, height: 84, borderRadius: "50%", background: color, color: "#fff", display: "grid", placeItems: "center", font: `700 54px ${HEAD}`, border: `6px solid ${P.cream}`, boxShadow: "0 8px 16px rgba(0,0,0,.3)" }}>{n}</div>
          <div style={{ font: `700 74px/1.2 ${HEAD}`, color: P.cream, whiteSpace: "nowrap" }}>{title}</div>
          <div style={{ font: `700 36px/1.35 ${BODY}`, color: "#FFE3B0", whiteSpace: "nowrap" }}>{sub}</div>
        </div>
      </Obj>
    </>
  );
};
const Cap: React.FC<{ cam: Cam; x: number; p: number; children: React.ReactNode }> = ({ cam, x, p, children }) => (
  <Obj cam={cam} x={x} y={318} z={50} opacity={p}>
    <div style={{ direction: "rtl", width: 980, textAlign: "center", font: `700 44px/1.35 ${BODY}`, color: P.cream, textShadow: "0 3px 10px rgba(0,0,0,.5)", translate: `0px ${(1 - p) * 16}px` }}>{children}</div>
  </Obj>
);
const OnCounter: React.FC<{ cam: Cam; x: number; y?: number; z?: number; o?: number; children: React.ReactNode }> = ({ cam, x, y = 0, z = 80, o = 1, children }) => (
  <Obj cam={cam} x={x} y={y} z={z} opacity={o}>
    {children}
  </Obj>
);
const Bub: React.FC<{ who: "c" | "a"; text: string; lf: number; at: number }> = ({ who, text, lf, at }) => {
  const p = ramp(lf, at, 8);
  if (p <= 0) return null;
  const a = who === "a";
  return (
    <div style={{ alignSelf: a ? "flex-start" : "flex-end", maxWidth: 300, padding: "10px 16px 14px", borderRadius: 18, borderBottomLeftRadius: a ? 4 : 18, borderBottomRightRadius: a ? 18 : 4, background: a ? "#DCF8C6" : "#fff", color: "#1c2b22", font: `600 27px/1.4 ${BODY}`, opacity: p, scale: `${0.9 + 0.1 * p}`, boxShadow: "0 3px 6px rgba(0,0,0,.18)" }}>
      {text}
      {a ? <span style={{ color: "#34B7F1", marginRight: 6 }}> ✓✓</span> : null}
    </div>
  );
};

/* ═══ الهوك: افتتاح السوق ═══ */
export const Hook: React.FC<Pr> = ({ cam, f }) => {
  const { kick } = useMusic();
  const out = 1 - smooth((f - 112) / 8);
  const x0 = X.hook;
  const sold = ramp(f, HIT, 10);
  return (
    <>
      <Obj cam={cam} x={x0} y={-400} z={60} opacity={ramp(f, 2, 14) * out}>
        <div style={{ direction: "rtl", textAlign: "center", whiteSpace: "nowrap" }}>
          <div style={{ font: `700 112px/1.15 ${HEAD}`, color: P.ink }}>خمس خدمات</div>
          <div style={{ font: `700 112px/1.15 ${HEAD}`, color: P.terra }}>تبيعها اليوم</div>
          <div style={{ font: `700 56px/1.4 ${BODY}`, color: P.mute }}>بالذكاء الاصطناعي</div>
        </div>
      </Obj>
      {[0, 1, 2, 3, 4].map((i) => (
        <Obj key={i} cam={cam} x={x0 + (i - 2) * 175} y={90 + (i % 2) * 28} z={90} opacity={ramp(f, 36 + i * 8, 10) * out}>
          <div style={{ width: 138, height: 138, borderRadius: 26, background: [P.green, P.gold, P.teal, P.plum, P.blue][i], display: "grid", placeItems: "center", font: `700 84px ${HEAD}`, color: "#fff", boxShadow: "0 16px 26px rgba(60,30,10,.3)", scale: `${1 + kick * 0.05 + sold * 0.0}`, rotate: `${(i - 2) * 4}deg` }}>{i + 1}</div>
        </Obj>
      ))}
    </>
  );
};

/* ═══ ١ · ردود واتساب تلقائية ═══ */
export const S1: React.FC<Pr> = ({ cam, f }) => {
  const lf = f - S.s1;
  const x = X.s1;
  return (
    <>
      <Stall cam={cam} x={x} lf={lf} color={P.green} n="1" title="ردود واتساب تلقائية" sub="يشتريها: المطاعم والعيادات والمتاجر" />
      <OnCounter cam={cam} x={x + 120} y={-50} o={ramp(lf, 6, 14)}>
        <div style={{ width: 380, height: 560, borderRadius: 48, background: "#0f1512", border: "10px solid #26332c", boxShadow: "0 30px 50px rgba(60,30,10,.4)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ height: 78, background: "#128C7E", color: "#fff", display: "flex", alignItems: "center", gap: 12, padding: "0 20px", direction: "rtl", font: `700 30px ${BODY}` }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fff3" }} />
            متجر الأناقة
          </div>
          <div style={{ flex: 1, background: "#ECE5DD", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 12, direction: "rtl" }}>
            <Bub who="c" text="متى تفتحون؟" lf={lf} at={26} />
            <Bub who="a" text="من 9 صباحاً حتى 10 مساءً" lf={lf} at={52} />
            <Bub who="c" text="أبغى أكلّم المسؤول" lf={lf} at={92} />
            <Bub who="a" text="حوّلتك لزميلنا وبيرد عليك" lf={lf} at={118} />
          </div>
        </div>
      </OnCounter>
      <OnCounter cam={cam} x={x - 300} y={20} o={ramp(lf, 10, 14)}>
        <div style={{ display: "grid", justifyItems: "center", gap: 10 }}>
          <div style={{ width: 230, height: 230, borderRadius: "50%", background: "#1B2442", border: `10px solid ${P.wood3}`, display: "grid", placeItems: "center", boxShadow: "0 20px 30px rgba(60,30,10,.35)" }}>
            <div style={{ font: `800 62px ${MONO}`, color: "#FFE3B0", direction: "ltr" }}>3:12</div>
          </div>
          <div style={{ font: `700 38px ${BODY}`, color: P.ink, direction: "rtl", textAlign: "center" }}>فجراً… وهو نايم<br />والوكيل يرد</div>
        </div>
      </OnCounter>
      <Cap cam={cam} x={x} p={ramp(lf, 112, 14)}>وكيل يجاوب الأسئلة المتكررة… ويحوّل الصعب لك</Cap>
    </>
  );
};

/* ═══ ٢ · تقارير أسبوعية ═══ */
const Sheet: React.FC<{ lbl: string; bars: number[]; color: string }> = ({ lbl, bars, color }) => (
  <div style={{ width: 280, height: 360, background: "#fff", borderRadius: 8, boxShadow: "0 10px 20px rgba(60,30,10,.3)", padding: "22px 22px", direction: "rtl" }}>
    <div style={{ font: `700 34px ${HEAD}`, color: P.ink }}>{lbl}</div>
    <div style={{ height: 6, width: 90, background: color, borderRadius: 3, margin: "8px 0 18px" }} />
    <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 150, direction: "ltr" }}>
      {bars.map((b, i) => (
        <div key={i} style={{ flex: 1, height: `${b}%`, background: i === bars.length - 1 ? color : "#E6D9C4", borderRadius: "6px 6px 0 0" }} />
      ))}
    </div>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ height: 10, borderRadius: 5, background: "#EADFCB", marginTop: 14, width: `${90 - i * 18}%` }} />
    ))}
  </div>
);
export const S2: React.FC<Pr> = ({ cam, f }) => {
  const lf = f - S.s2;
  const x = X.s2;
  const out = ease((lf - 34) / 40);
  return (
    <>
      <Stall cam={cam} x={x} lf={lf} color={P.gold} n="2" title="تقارير أسبوعية جاهزة" sub="يشتريها: أصحاب المشاريع والمدراء" />
      <OnCounter cam={cam} x={x - 60} y={90} z={70} o={ramp(lf, 8, 14)}>
        <div style={{ position: "relative", width: 460, height: 280 }}>
          <div style={{ position: "absolute", left: 90, top: -210 + (1 - out) * 210, width: 280, overflow: "hidden", height: 300 }}>
            <div>
              <Sheet lbl="تقرير الأسبوع" bars={[40, 55, 48, 70, 92]} color={P.gold} />
            </div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 210, borderRadius: 26, background: "linear-gradient(180deg,#F1ECE2,#C9C0AE)", border: "6px solid #8E8574", boxShadow: "0 24px 36px rgba(60,30,10,.35)" }}>
            <div style={{ position: "absolute", left: 60, right: 60, top: 18, height: 16, borderRadius: 8, background: "#2B261E" }} />
            <div style={{ position: "absolute", right: 36, bottom: 30, width: 20, height: 20, borderRadius: "50%", background: f % 20 < 10 && lf > 30 && lf < 90 ? P.green : "#999" }} />
          </div>
        </div>
      </OnCounter>
      {[0, 1, 2].map((i) => (
        <OnCounter key={i} cam={cam} x={x + 300 + i * 26} y={30 - i * 14} z={60 - i * 4} o={ramp(lf, 60 + i * 12, 10)}>
          <div style={{ rotate: `${5 - i * 4}deg` }}>
            <Sheet lbl={["الأسبوع الماضي", "قبله", "قبله"][i]} bars={[30 + i * 8, 44, 52, 40, 60]} color="#C9B99A" />
          </div>
        </OnCounter>
      ))}
      <OnCounter cam={cam} x={x - 330} y={40} o={ramp(lf, 20, 12)}>
        <div style={{ padding: "16px 26px 22px", borderRadius: 24, background: P.cream, border: `5px solid ${P.gold}`, boxShadow: "0 14px 22px rgba(60,30,10,.3)", direction: "rtl", textAlign: "center" }}>
          <div style={{ font: `700 36px ${BODY}`, color: P.mute }}>كل أحد</div>
          <div style={{ font: `800 64px ${MONO}`, color: P.ink, direction: "ltr" }}>8:00</div>
          <div style={{ font: `700 34px ${BODY}`, color: P.terra }}>صباحاً</div>
        </div>
      </OnCounter>
      <Cap cam={cam} x={x} p={ramp(lf, 112, 14)}>كل أحد الصبح يلقى تقريره جاهز في بريده</Cap>
    </>
  );
};

/* ═══ ٣ · فرز البريد والرسائل ═══ */
const Env: React.FC<{ c: string }> = ({ c }) => (
  <div style={{ position: "relative", width: 110, height: 76, background: "#fff", borderRadius: 8, border: `4px solid ${c}`, boxShadow: "0 6px 10px rgba(60,30,10,.3)" }}>
    <svg width="102" height="68" viewBox="0 0 102 68" style={{ position: "absolute", left: 0, top: 0 }}>
      <path d="M2 4 L51 38 L100 4" fill="none" stroke={c} strokeWidth={4} strokeLinejoin="round" />
    </svg>
  </div>
);
const TRAYS = [
  { label: "عاجل", c: P.terra, dx: 250 },
  { label: "عملاء", c: P.teal, dx: 60 },
  { label: "لاحقاً", c: P.gold, dx: -130 },
];
export const S3: React.FC<Pr> = ({ cam, f }) => {
  const lf = f - S.s3;
  const x = X.s3;
  const dest = [0, 1, 2, 1, 0, 2, 1, 0];
  return (
    <>
      <Stall cam={cam} x={x} lf={lf} color={P.teal} n="3" title="فرز البريد والرسائل" sub="يشتريها: الشركات الصغيرة والمكاتب" />
      {/* كومة المظاريف */}
      <OnCounter cam={cam} x={x - 360} y={150} o={ramp(lf, 6, 12)}>
        <div style={{ position: "relative", width: 170, height: 150 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ position: "absolute", left: 20 + (i % 2) * 14, top: 60 - i * 14, rotate: `${(i - 1.5) * 7}deg` }}>
              <Env c={["#999", "#777", "#aaa", "#888"][i]} />
            </div>
          ))}
        </div>
      </OnCounter>
      {/* الصواني */}
      {TRAYS.map((t, i) => (
        <Fragment key={t.label}>
          <OnCounter cam={cam} x={x + t.dx + 60} y={150} o={ramp(lf, 10 + i * 4, 12)}>
            <div style={{ display: "grid", justifyItems: "center", gap: 6 }}>
              <div style={{ width: 150, height: 110, borderRadius: "10px 10px 22px 22px", background: `linear-gradient(180deg, ${t.c}, ${t.c}CC)`, border: `5px solid ${P.wood3}`, boxShadow: "0 12px 18px rgba(60,30,10,.3)" }} />
              <div style={{ font: `700 40px ${HEAD}`, color: P.ink }}>{t.label}</div>
            </div>
          </OnCounter>
        </Fragment>
      ))}
      {/* المظاريف تتحرك للصينية الصحيحة */}
      {dest.map((d, i) => {
        const t0 = 24 + i * 10;
        const p = ease((lf - t0) / 26);
        if (lf < t0 || p >= 1) return null;
        const sx = x - 340;
        const tx = x + TRAYS[d].dx + 60;
        const px = sx + (tx - sx) * p;
        const py = 150 + (130 - 150) * p - Math.sin(p * Math.PI) * 190;
        return (
          <Obj key={i} cam={cam} x={px} y={py} z={100} rz={(p - 0.5) * 30}>
            <Env c={TRAYS[d].c} />
          </Obj>
        );
      })}
      <Cap cam={cam} x={x} p={ramp(lf, 112, 14)}>كل رسالة تروح للمكان الصح بدون ما يفتحها أحد</Cap>
    </>
  );
};

/* ═══ ٤ · جدول محتوى شهري ═══ */
export const S4: React.FC<Pr> = ({ cam, f }) => {
  const lf = f - S.s4;
  const x = X.s4;
  const cols = [P.terra, P.teal, P.gold, P.plum, P.blue, P.green];
  return (
    <>
      <Stall cam={cam} x={x} lf={lf} color={P.plum} n="4" title="جدول محتوى شهري" sub="يشتريها: المتاجر والكافيهات والمطاعم" />
      <OnCounter cam={cam} x={x} y={-10} z={70} o={ramp(lf, 6, 14)}>
        <div style={{ width: 800, padding: "18px 20px 22px", borderRadius: 22, background: P.cream, border: `8px solid ${P.wood3}`, boxShadow: "0 28px 40px rgba(60,30,10,.35)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, direction: "rtl", marginBottom: 8 }}>
            {["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"].map((d) => (
              <div key={d} style={{ textAlign: "center", font: `700 26px ${BODY}`, color: P.mute }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, direction: "rtl" }}>
            {Array.from({ length: 28 }, (_, i) => {
              const t = 20 + i * 3.2;
              const p = ramp(lf, t, 8);
              const c = cols[(i * 5) % cols.length];
              return (
                <div key={i} style={{ height: 72, borderRadius: 10, background: "#F0E3CE", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: c, opacity: p, scale: `${0.4 + 0.6 * p}`, borderRadius: 10, display: "grid", placeItems: "center" }}>
                    <div style={{ width: 26, height: 26, borderRadius: i % 3 === 0 ? "50%" : 6, background: "#ffffffcc" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </OnCounter>
      <Cap cam={cam} x={x} p={ramp(lf, 116, 14)}>من فكرة الشهر إلى المنشورات المكتوبة والمجدولة</Cap>
    </>
  );
};

/* ═══ ٥ · تحليل المبيعات ═══ */
export const S5: React.FC<Pr> = ({ cam, f }) => {
  const lf = f - S.s5;
  const x = X.s5;
  const vals = [46, 62, 38, 88, 54, 70];
  const names = ["عطور", "ساعات", "حقائب", "قهوة", "ورد", "تمور"];
  return (
    <>
      <Stall cam={cam} x={x} lf={lf} color={P.blue} n="5" title="تحليل المبيعات" sub="يشتريها: كل من عنده جدول مبيعات" />
      <OnCounter cam={cam} x={x} y={-10} z={70} o={ramp(lf, 6, 14)}>
        <div style={{ position: "relative", width: 800, height: 430, padding: "26px 36px 20px", borderRadius: 22, background: P.cream, border: `8px solid ${P.wood3}`, boxShadow: "0 28px 40px rgba(60,30,10,.35)" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 300, direction: "rtl", borderBottom: `4px solid ${P.ink}` }}>
            {vals.map((v, i) => {
              const p = ease((lf - 24 - i * 7) / 28);
              const top = i === 3;
              return (
                <div key={i} style={{ width: 90, display: "grid", justifyItems: "center" }}>
                  {top ? <div style={{ opacity: ramp(lf, 80, 10), font: `700 30px ${BODY}`, color: P.terra, marginBottom: 6, whiteSpace: "nowrap" }}>الأكثر مبيعاً ↓</div> : null}
                  <div style={{ width: 70, height: v * 2.8 * p, background: top ? P.terra : P.blue, borderRadius: "10px 10px 0 0", boxShadow: top && lf > 80 ? `0 0 26px ${P.terra}99` : "none" }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", direction: "rtl", paddingTop: 10 }}>
            {names.map((n) => (
              <div key={n} style={{ width: 90, textAlign: "center", font: `700 30px ${BODY}`, color: P.ink }}>{n}</div>
            ))}
          </div>
        </div>
      </OnCounter>
      <Cap cam={cam} x={x} p={ramp(lf, 116, 14)}>يرفع ملف المبيعات ويطلع له: وش اللي يبيع؟ وش اللي يوقف؟</Cap>
    </>
  );
};

/* ═══ من وين تبدأ؟ ═══ */
export const How: React.FC<Pr> = ({ cam, f }) => {
  const lf = f - S.how;
  const x = X.how;
  const steps = ["جرّب الخدمة على مشروعك أنت", "سجّل النتيجة: قبل وبعد", "اعرضها على أول عميل"];
  return (
    <>
      <Stall cam={cam} x={x} lf={lf} color={P.terra} n="★" title="من وين تبدأ؟" sub="ثلاث خطوات بدون رأس مال" />
      <OnCounter cam={cam} x={x - 300} y={-10} z={70} o={ramp(lf, 8, 14)}>
        <div style={{ padding: "14px 14px 52px", background: "#fff", boxShadow: "0 22px 32px rgba(60,30,10,.4)", rotate: "-4deg", position: "relative" }}>
          <div style={{ position: "absolute", top: -22, left: 70, width: 130, height: 40, background: "#E7A93B", opacity: 0.9, rotate: "3deg" }} />
          <Img src={V("desk.jpg")} style={{ width: 330, height: 300, objectFit: "cover", objectPosition: "40% 50%", display: "block" }} />
          <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center", font: `700 28px ${BODY}`, color: P.ink }}>ابدأ من مكانك</div>
        </div>
      </OnCounter>
      <OnCounter cam={cam} x={x + 200} y={-30} z={70}>
        <div style={{ display: "grid", gap: 20, direction: "rtl", width: 500 }}>
          {steps.map((s, i) => {
            const p = ramp(lf, 20 + i * 22, 12);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, opacity: p, translate: `${(1 - p) * 40}px 0px` }}>
                <div style={{ flex: "none", width: 70, height: 70, borderRadius: "50%", background: P.terra, color: "#fff", display: "grid", placeItems: "center", font: `700 44px ${HEAD}` }}>{i + 1}</div>
                <div style={{ font: `700 38px/1.3 ${BODY}`, color: P.ink }}>{s}</div>
              </div>
            );
          })}
        </div>
      </OnCounter>
      <OnCounter cam={cam} x={x + 190} y={170} z={70} o={ramp(lf, 90, 14)}>
        <div style={{ display: "flex", alignItems: "center", gap: 26, padding: "10px 28px 14px", background: P.cream, borderRadius: 20, border: `4px solid ${P.wood3}` }}>
          <div style={{ font: `700 32px ${BODY}`, color: P.mute, direction: "rtl" }}>أدوات الربط:</div>
          <Img src={V("zapier-text.svg")} style={{ height: 44 }} />
          <Img src={V("n8n-text.svg")} style={{ height: 44 }} />
          <Img src={V("make-color.svg")} style={{ height: 50 }} />
        </div>
      </OnCounter>
      <Cap cam={cam} x={x} p={ramp(lf, 120, 14)}>راجع كل مخرج قبل التسليم… وحافظ على بيانات عميلك</Cap>
    </>
  );
};
