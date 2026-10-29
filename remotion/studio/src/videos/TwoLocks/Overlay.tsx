import React from "react";
import { Img } from "remotion";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { G_STEP, KEY_TAG, LOCK1, LOCK2, PHONE_TWO, WA_STEP, project } from "./Scene3D";
import { BACK, BG, BODY, C, DISPLAY, IN, OUT, SEG, SegK, V, ease } from "./theme";

export const TAG = "تقنية · التحقق بخطوتين";
const iso = (t: string) => <span style={{ direction: "ltr", unicodeBidi: "isolate", fontFamily: "Space Grotesk", fontWeight: 700 }}>{t}</span>;
const KEYS = Object.keys(SEG) as SegK[];
const lp = (f: number, k: SegK) => f - SEG[k][0];
const inSeg = (f: number, k: SegK) => f >= SEG[k][0] - 2 && f < SEG[k][1] + 2;
const outOf = (f: number, k: SegK) => 1 - ease(f, SEG[k][1] - 12, 10, OUT);

const mixHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) + (((pb >> s) & 255) - ((pa >> s) & 255)) * t);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};

/* ───── الخلفية: صورة خزنة حقيقية في الهوك، وبعدها تدرّج يتغير مع المشهد ───── */
export const Backdrop: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  let c0 = BG.hook[0];
  let c1 = BG.hook[1];
  for (let i = 1; i < KEYS.length; i++) {
    const t = ease(f, SEG[KEYS[i]][0] - 15, 30, OUT);
    if (t <= 0) break;
    c0 = mixHex(BG[KEYS[i - 1]][0], BG[KEYS[i]][0], t);
    c1 = mixHex(BG[KEYS[i - 1]][1], BG[KEYS[i]][1], t);
  }
  const photo = 1 - ease(f, SEG.hook[1] - 28, 30, OUT);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 45% at 50% 50%, ${c0} 0%, ${c1} 100%)` }} />
      <div style={{ position: "absolute", left: -200, right: -200, top: 640, height: 640, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(255,255,255,${0.05 + kick * 0.03}), rgba(255,255,255,0))` }} />
      {photo > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: photo }}>
          <Img src={V("vault.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "38% 50%", transform: `scale(${1.15 + f * 0.0018})`, filter: "brightness(.7) contrast(1.1) saturate(.8)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,7,10,.85) 0%, rgba(5,7,10,.45) 36%, rgba(5,7,10,.15) 60%, rgba(5,7,10,.6) 100%)" }} />
        </div>
      ) : null}
    </>
  );
};

/* ───── العناوين ───── */
type B = { k: SegK; chip: React.ReactNode; title: React.ReactNode; sub: React.ReactNode; color: string; lines?: number; size?: number };
const Logo: React.FC<{ src: string }> = ({ src }) => (
  <span style={{ display: "inline-grid", placeItems: "center", width: 40, height: 40, borderRadius: 10, background: "#fff", marginLeft: 12, verticalAlign: "middle" }}>
    <Img src={V(src)} style={{ width: 30, height: 30 }} />
  </span>
);
const BLOCKS: B[] = [
  { k: "hook", chip: TAG, title: <>كلمة مرورك انسرقت…<br />وحسابك بأمان؟</>, sub: "هذا هو السبب", color: C.gold, lines: 2, size: 92 },
  { k: "one", chip: "القفل الأول", title: "كلمة مرور بس = قفل واحد", sub: "لو انسرقت (تسريب أو رسالة احتيال)… الباب ينفتح", color: C.red, size: 80 },
  { k: "two", chip: "القفل الثاني", title: "التحقق بخطوتين", sub: "قفل ثاني يحتاج رمز يوصل لجوالك أنت… أو موافقة منه", color: C.ok },
  { k: "wa", chip: <><Logo src="whatsapp-color.svg" />واتساب</>, title: "فعّله في واتساب", sub: "ياخذ منك دقيقة وحدة", color: C.green },
  { k: "google", chip: <><Logo src="google-color.svg" />Google</>, title: "وفي حساب Google", sub: "قوقل وجيميل ويوتيوب… كلها بحساب واحد", color: C.blue },
  { k: "rule", chip: "القاعدة الذهبية", title: "الرمز لك أنت بس", sub: "أي أحد يطلبه منك = محتال… حتى لو قال إنه من الشركة", color: C.gold },
];
const Block: React.FC<{ f: number; b: B }> = ({ f, b }) => {
  const [a, e] = SEG[b.k];
  if (f < a - 2 || f > e + 2) return null;
  const lf = f - a;
  const first = a === 0;
  const out = ease(f, e - 10, 10, IN);
  const pc = first ? 1 : ease(lf, 4, 14, BACK);
  const pt = first ? ease(lf, 0, 14, OUT) : ease(lf, 8, 18, OUT);
  const ps = ease(lf, first ? 10 : 20, 16, OUT);
  const lines = b.lines ?? 1;
  const size = b.size ?? 96;
  return (
    <div style={{ position: "absolute", inset: 0, direction: "rtl", opacity: 1 - out, transform: `translateY(${-out * 40}px)` }}>
      <div style={{ position: "absolute", top: 196, right: 80, padding: "6px 24px 10px", borderRadius: 999, background: b.color, color: C.ink, font: `700 30px ${BODY}`, transform: `scale(${pc})`, transformOrigin: "right center", whiteSpace: "nowrap", boxShadow: `0 0 30px ${b.color}55` }}>{b.chip}</div>
      <div style={{ position: "absolute", top: 254, right: 74, left: 30, overflow: "hidden", padding: "0 6px 14px" }}>
        <div style={{ font: `900 ${size}px/1.3 ${DISPLAY}`, color: "#fff", whiteSpace: "nowrap", transform: `translateY(${(1 - pt) * 110}%)`, textShadow: "0 6px 30px rgba(0,0,0,.55)" }}>{b.title}</div>
      </div>
      <div style={{ position: "absolute", top: 254 + size * 1.3 * lines + 22, right: 80, left: 50, font: `700 38px/1.45 ${BODY}`, color: "rgba(255,255,255,.88)", opacity: ps, transform: `translateY(${(1 - ps) * 20}px)`, textShadow: "0 3px 16px rgba(0,0,0,.6)" }}>{b.sub}</div>
    </div>
  );
};
export const Titles: React.FC<{ f: number }> = ({ f }) => (
  <>
    {BLOCKS.map((b) => (
      <Block key={b.k} f={f} b={b} />
    ))}
  </>
);

/* ───── ملصقات على العناصر ───── */
const Tag: React.FC<{ x: number; y: number; p: number; bg: string; fg?: string; children: React.ReactNode; size?: number }> = ({ x, y, p, bg, fg = C.ink, children, size = 32 }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${p})`, padding: "8px 22px 12px", borderRadius: 16, background: bg, color: fg, font: `700 ${size}px ${BODY}`, whiteSpace: "nowrap", direction: "rtl", boxShadow: "0 10px 30px rgba(0,0,0,.35)" }}>
      {children}
    </div>
  );
const Steps: React.FC<{ f: number; k: SegK; items: React.ReactNode[]; step: number; color: string; note: React.ReactNode; noteAt: number }> = ({ f, k, items, step, color, note, noteAt }) => {
  const l = lp(f, k);
  const o = outOf(f, k);
  return (
    <>
      <div style={{ position: "absolute", top: 640, right: 60, width: 440, display: "flex", flexDirection: "column", alignItems: "stretch", gap: 0, direction: "rtl" }}>
        {items.map((t, i) => {
          const p = ease(l, 30 + i * 48, 14, BACK) * o;
          const on = i === step;
          return (
            <div key={i} style={{ opacity: Math.min(1, p * 1.5), transform: `scale(${0.85 + 0.15 * p})` }}>
              {i > 0 ? <div style={{ textAlign: "center", font: `700 34px ${BODY}`, color: "rgba(255,255,255,.6)", lineHeight: "44px" }}>↓</div> : null}
              <div style={{ padding: "14px 24px 18px", borderRadius: 18, background: on ? color : "rgba(255,255,255,.1)", color: on ? C.ink : "#fff", border: `2px solid ${on ? color : "rgba(255,255,255,.18)"}`, font: `700 34px/1.35 ${BODY}`, boxShadow: on ? `0 0 34px ${color}66` : "none" }}>{t}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 1250, left: 60, right: 60, padding: "16px 26px 20px", borderRadius: 20, background: "rgba(5,10,16,.78)", border: `2px solid ${color}88`, color: "#fff", font: `700 32px/1.45 ${BODY}`, direction: "rtl", opacity: ease(l, noteAt, 16, OUT) * o, transform: `translateY(${(1 - ease(l, noteAt, 16, OUT)) * 30}px)` }}>
        {note}
      </div>
    </>
  );
};

export const Labels: React.FC<{ f: number }> = ({ f }) => {
  const out: React.ReactNode[] = [];
  if (inSeg(f, "one")) {
    const l = lp(f, "one");
    const o = outOf(f, "one");
    const [x1, y1] = project(f, [LOCK1[0], LOCK1[1] - 1.05, LOCK1[2]]);
    out.push(<Tag key="l1" x={x1} y={y1 + 20} p={ease(l, 20, 14, BACK) * (1 - ease(l, 112, 10, OUT)) * o} bg="#D5DBE2">كلمة المرور</Tag>);
    const [kx, ky] = project(f, KEY_TAG(f));
    out.push(<Tag key="k" x={kx + 70} y={ky - 90} p={ease(l, 40, 12, BACK) * (1 - ease(l, 98, 10, OUT)) * o} bg={C.red} fg="#fff" size={30}>كلمة مرورك المسروقة</Tag>);
    const [vx, vy] = project(f, [0, 0.9, 0.5]);
    out.push(<Tag key="op" x={vx} y={vy + 40} p={ease(l, 140, 14, BACK) * o} bg={C.red} fg="#fff" size={44}>انفتح!</Tag>);
  }
  if (inSeg(f, "two")) {
    const l = lp(f, "two");
    const o = outOf(f, "two");
    const [x1, y1] = project(f, [LOCK1[0], LOCK1[1] - 1.05, LOCK1[2]]);
    const [x2, y2] = project(f, [LOCK2[0], LOCK2[1] - 1.05, LOCK2[2]]);
    out.push(<Tag key="t1" x={x1} y={y1 + 20} p={ease(l, 26, 14, BACK) * o} bg="#D5DBE2">{iso("1")} · كلمة المرور</Tag>);
    out.push(<Tag key="t2" x={x2} y={y2 + 20} p={ease(l, 36, 14, BACK) * o} bg={C.ok}>{iso("2")} · جوالك</Tag>);
    out.push(<Tag key="x" x={x2} y={y2 - 250} p={ease(l, 172, 10, BACK) * (1 - ease(l, 212, 10, OUT))} bg={C.red} fg="#fff" size={36}>✕ ما يكفي</Tag>);
    const [px, py] = project(f, [PHONE_TWO[0], PHONE_TWO[1] - 1.75, PHONE_TWO[2]]);
    out.push(<Tag key="ph" x={px - 40} y={py + 30} p={ease(l, 236, 14, BACK) * o} bg="#fff" size={30}>الرمز يوصل لك أنت بس</Tag>);
  }
  if (inSeg(f, "wa")) {
    out.push(
      <Steps
        key="wa"
        f={f}
        k="wa"
        step={WA_STEP(f) === 3 ? 3 : WA_STEP(f)}
        color={C.green}
        items={["الإعدادات", "الحساب", "التحقق بخطوتين", "تفعيل"]}
        noteAt={196}
        note={<>صارت <b style={{ color: C.green }}>كلمة مرور كاملة</b> (حروف وأرقام ورموز) بدل الرمز السداسي. خلّها قوية، وأضف إيميلك عشان لو نسيتها</>}
      />,
    );
  }
  if (inSeg(f, "google")) {
    out.push(
      <Steps
        key="g"
        f={f}
        k="google"
        step={G_STEP(f) === 0 ? 0 : lp(f, "google") < 150 ? 1 : 2}
        color={C.blue}
        items={["حسابك في Google", "الأمان وتسجيل الدخول", "تفعيل التحقق بخطوتين"]}
        noteAt={170}
        note={<>الأفضل: <b style={{ color: "#8AB4F8" }}>موافقة من جوالك أو مفتاح مرور</b>… أأمن من رموز {iso("SMS")} لأنها تحميك من سرقة الشريحة</>}
      />,
    );
  }
  if (inSeg(f, "rule")) {
    const l = lp(f, "rule");
    const o = outOf(f, "rule");
    const [x1, y1] = project(f, [LOCK1[0], LOCK1[1] - 1.05, LOCK1[2]]);
    const [x2, y2] = project(f, [LOCK2[0], LOCK2[1] - 1.05, LOCK2[2]]);
    out.push(<Tag key="r1" x={x1} y={y1 + 20} p={ease(l, 24, 14, BACK) * o} bg="#D5DBE2">مقفول</Tag>);
    out.push(<Tag key="r2" x={x2} y={y2 + 20} p={ease(l, 30, 14, BACK) * o} bg={C.ok}>مقفول</Tag>);
    out.push(<Tag key="rx" x={x2} y={y2 - 250} p={ease(l, 96, 10, BACK) * (1 - ease(l, 136, 10, OUT))} bg={C.red} fg="#fff" size={36}>✕ مرفوض</Tag>);
  }
  return <>{out}</>;
};

/* ───── الختام ───── */
export const End: React.FC<{ f: number }> = ({ f }) => {
  const [a] = SEG.end;
  if (f < a + 10) return null;
  const pt = ease(f, a + 20, 18, OUT);
  const pn = ease(f, a + 46, 18, OUT);
  const pc = ease(f, a + 62, 18, OUT);
  const ph = ease(f, a + 76, 18, BACK);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, direction: "rtl", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 230, left: 0, right: 0, font: `900 84px/1.35 ${DISPLAY}`, color: "#fff", opacity: pt, transform: `translateY(${(1 - pt) * 30}px)`, textShadow: "0 6px 30px rgba(0,0,0,.6)" }}>
        فعّله اليوم…
        <div style={{ font: `700 40px/1.4 ${BODY}`, color: C.gold }}>وأرسلها لأهلك قبل لا يحتاجونها</div>
      </div>
      <div style={{ position: "absolute", top: 1250, left: 0, right: 0, font: `900 84px/1.3 ${DISPLAY}`, color: "#fff", opacity: pn, transform: `translateY(${(1 - pn) * 30}px)`, textShadow: "0 6px 30px rgba(0,0,0,.6)" }}>علي التميمي</div>
      <div style={{ position: "absolute", top: 1362, left: 0, right: 0, font: `700 34px/1.4 ${BODY}`, color: "rgba(255,255,255,.88)", opacity: pc }}>كل يوم معلومة تقنية تحميك</div>
      <div style={{ position: "absolute", top: 1425, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${ph})` }}>
        <div style={{ padding: "10px 32px", borderRadius: 999, background: "#0FA37F" }}>
          <HandlesRow size={30} color="#fff" />
        </div>
      </div>
    </div>
  );
};
export const Footer: React.FC<{ f: number }> = ({ f }) => {
  const o = ease(f, 8, 12) * (1 - ease(f, SEG.end[0], 10));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 1480, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ padding: "8px 24px", borderRadius: 999, background: "rgba(0,0,0,.55)", border: "1px solid rgba(255,255,255,.15)" }}>
        <HandlesRow size={26} color="#fff" />
      </div>
    </div>
  );
};
export const Shade: React.FC = () => <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 600, background: "linear-gradient(180deg, rgba(0,0,0,.6), rgba(0,0,0,0))" }} />;
