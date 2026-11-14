import React from "react";
import { Img } from "remotion";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { COACH_W3, PASS_AT, project } from "./Scene3D";
import { BACK, BODY, C, DISPLAY, IN, OUT, SEG, SegK, V, ZONE, ease } from "./theme";

export const TAG = "أتمتة · تدريب الفريق";
const iso = (t: string) => <span style={{ direction: "ltr", unicodeBidi: "isolate", fontFamily: "Space Grotesk", fontWeight: 700 }}>{t}</span>;
const lp = (f: number, k: SegK) => f - SEG[k][0];
const inSeg = (f: number, k: SegK) => f >= SEG[k][0] - 2 && f < SEG[k][1] + 2;
const outOf = (f: number, k: SegK) => 1 - ease(f, SEG[k][1] - 12, 10, OUT);

/* ───── الخلفية: ليل ملعب تحت الكشافات، وصورة التدريب الحقيقية في الهوك ───── */
export const Backdrop: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const photo = 1 - ease(f, SEG.hook[1] - 26, 30, OUT);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 40% at 50% 8%, #1C3352 0%, #0B1626 55%, #07101C 100%)" }} />
      {[-1, 1].map((s) => (
        <div key={s} style={{ position: "absolute", top: -140, left: s < 0 ? -160 : undefined, right: s > 0 ? -160 : undefined, width: 620, height: 620, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(255,246,220,${0.28 + kick * 0.08}), rgba(255,246,220,0))` }} />
      ))}
      {photo > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: photo }}>
          <Img src={V("aerial.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 50%", transform: `scale(${1.08 + f * 0.0016}) rotate(${-f * 0.01}deg)`, filter: "saturate(1.1) contrast(1.05)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,10,18,.9) 0%, rgba(5,10,18,.55) 34%, rgba(5,10,18,.1) 60%, rgba(5,10,18,.45) 100%)" }} />
        </div>
      ) : null}
    </>
  );
};

/* ───── العناوين ───── */
type B = { k: SegK; chip: string; title: React.ReactNode; sub: React.ReactNode; color: string; lines?: number; size?: number };
const BLOCKS: B[] = [
  { k: "hook", chip: TAG, title: <>جبت لفريقك أداة {iso("AI")}…<br />ومحد يستخدمها؟</>, sub: "المشكلة مو في الأداة… المشكلة في التدريب", color: C.gold, lines: 2 },
  { k: "plan", chip: "الحل", title: <>معسكر إعداد {iso("30")} يوم</>, sub: "4 أسابيع… كل أسبوع مرحلة، مثل أي فريق قبل الموسم", color: C.ok },
  { k: "w1", chip: "الأسبوع 1 · الأيام 1–7", title: "أساسيات قبل الكورة", sub: "يفهمون وش تقدر عليه الأداة… ووين حدودها", color: C.w1 },
  { k: "w2", chip: "الأسبوع 2 · الأيام 8–14", title: "تطبيق على شغلهم", sub: "كل موظف يختار 3 مهام تتكرر عنده… ويكتب لها برومبت", color: C.w2 },
  { k: "w3", chip: "الأسبوع 3 · الأيام 15–21", title: "أتمتة مهمة وحدة", sub: "مثل خطة لعب ثابتة: تتكرر… وتمشي لحالها", color: C.w3 },
  { k: "w4", chip: "الأسبوع 4 · الأيام 22–30", title: "مشروع حقيقي", sub: "كل فريق يسلّم مشروع من شغله الفعلي… ويقيس الوقت الموفّر", color: C.w4 },
  { k: "tip", chip: "الخطأ الشائع", title: "ورشة يوم… وخلاص", sub: "بدون تمرين يومي ينسون كل شي خلال أسبوع", color: "#FF5B4A" },
  { k: "end", chip: "الخلاصة", title: "احفظها… وأرسلها لمديرك", sub: "", color: C.gold, size: 66 },
];
const Block: React.FC<{ f: number; b: B }> = ({ f, b }) => {
  const [a, e] = SEG[b.k];
  if (f < a - 2 || f > e + 2) return null;
  const lf = f - a;
  const first = a === 0;
  const out = b.k === "end" ? 0 : ease(f, e - 10, 10, IN);
  const pc = first ? 1 : ease(lf, 4, 14, BACK);
  const pt = first ? ease(lf, 0, 14, OUT) : ease(lf, 8, 18, OUT);
  const ps = ease(lf, first ? 10 : 20, 16, OUT);
  const lines = b.lines ?? 1;
  return (
    <div style={{ position: "absolute", inset: 0, direction: "rtl", opacity: 1 - out, transform: `translateY(${-out * 40}px)` }}>
      <div style={{ position: "absolute", top: 196, right: 80, padding: "6px 24px 10px", borderRadius: 999, background: b.color, color: "#07101C", font: `700 30px ${BODY}`, transform: `scale(${pc})`, transformOrigin: "right center", whiteSpace: "nowrap", boxShadow: `0 0 30px ${b.color}55` }}>{b.chip}</div>
      <div style={{ position: "absolute", top: 254, right: 74, left: 30, overflow: "hidden", padding: "0 6px 14px" }}>
        <div style={{ font: `900 ${b.size ?? (lines > 1 ? 84 : 88)}px/1.42 ${DISPLAY}`, color: "#fff", whiteSpace: "nowrap", transform: `translateY(${(1 - pt) * 110}%)`, textShadow: "0 6px 30px rgba(0,0,0,.55)" }}>{b.title}</div>
      </div>
      {b.sub ? <div style={{ position: "absolute", top: 404 + (lines - 1) * 120, right: 80, left: 50, font: `700 38px/1.45 ${BODY}`, color: "rgba(255,255,255,.88)", opacity: ps, transform: `translateY(${(1 - ps) * 20}px)`, textShadow: "0 3px 16px rgba(0,0,0,.6)" }}>{b.sub}</div> : null}
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

/* ───── أيقونات صغيرة ───── */
const Ico: React.FC<{ n: "clock" | "lock" | "check"; c: string }> = ({ n, c }) => (
  <svg width="46" height="46" viewBox="0 0 46 46" style={{ flex: "none" }}>
    {n === "clock" ? (
      <>
        <circle cx="23" cy="23" r="18" fill="none" stroke={c} strokeWidth="5" />
        <path d="M23 13v11l7 5" fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" />
      </>
    ) : n === "lock" ? (
      <>
        <rect x="9" y="20" width="28" height="20" rx="5" fill={c} />
        <path d="M15 20v-5a8 8 0 0116 0v5" fill="none" stroke={c} strokeWidth="5" />
      </>
    ) : (
      <>
        <circle cx="23" cy="23" r="19" fill={c} />
        <path d="M14 23l6 6 12-13" fill="none" stroke="#07101C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    )}
  </svg>
);

/* ───── بطاقات أسفل الشاشة ───── */
const Card: React.FC<{ p: number; color: string; children: React.ReactNode; dx?: number }> = ({ p, color, children, dx = 60 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "12px 26px 16px", borderRadius: 20, background: "rgba(7,16,28,.78)", border: `2px solid ${color}55`, font: `700 34px ${BODY}`, color: "#fff", opacity: p, transform: `translateX(${(1 - p) * dx}px)`, backdropFilter: "blur(6px)" }}>{children}</div>
);
const Tag: React.FC<{ x: number; y: number; p: number; bg: string; fg?: string; children: React.ReactNode; size?: number }> = ({ x, y, p, bg, fg = "#07101C", children, size = 32 }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-100%) scale(${p})`, transformOrigin: "50% 100%", padding: "8px 22px 12px", borderRadius: 16, background: bg, color: fg, font: `700 ${size}px ${BODY}`, whiteSpace: "nowrap", direction: "rtl", boxShadow: "0 10px 30px rgba(0,0,0,.35)" }}>
      {children}
    </div>
  );

export const Labels: React.FC<{ f: number }> = ({ f }) => {
  const out: React.ReactNode[] = [];
  /* خطة المعسكر: أرقام المناطق على الملعب */
  if (inSeg(f, "plan")) {
    const pl = lp(f, "plan");
    (["w1", "w2", "w3", "w4"] as const).forEach((k, i) => {
      const [x, y] = project(f, [0, 0, ZONE[k]]);
      const names = ["أساسيات", "تطبيق", "أتمتة", "مشروع حقيقي"];
      const p = ease(pl, 52 + i * 16, 14, BACK) * outOf(f, "plan");
      out.push(
        <Tag key={k} x={x} y={y + 22} p={p} bg={C[k]} size={i < 2 ? 36 : 30}>
          {iso(String(i + 1))} · {names[i]}
        </Tag>,
      );
    });
  }
  /* الأسبوع 1 */
  if (inSeg(f, "w1")) {
    const l1 = lp(f, "w1");
    const items: [React.ReactNode, "clock" | "lock" | "check"][] = [
      [<>تمرين يومي {iso("15")} دقيقة على مهمة حقيقية</>, "clock"],
      ["وش ممنوع تلصقه من بيانات الشركة والعملاء", "lock"],
      ["يتأكدون من النتيجة قبل ما يعتمدونها", "check"],
    ];
    out.push(
      <div key="w1c" style={{ position: "absolute", left: 60, right: 60, top: 1150, display: "flex", flexDirection: "column", gap: 14, direction: "rtl" }}>
        {items.map(([t, ic], i) => (
          <Card key={i} p={ease(l1, 60 + i * 34, 16, OUT) * outOf(f, "w1")} color={C.w1}>
            <Ico n={ic} c={C.w1} />
            <span>{t}</span>
          </Card>
        ))}
      </div>,
    );
  }
  /* الأسبوع 2: كل تمريرة = برومبت لمهمة */
  if (inSeg(f, "w2")) {
    const tasks = ["ردود العملاء", "التقرير الأسبوعي", "محضر الاجتماع"];
    const lib = ease(f, PASS_AT(4), 16, BACK) * outOf(f, "w2");
    out.push(
      <div key="w2c" style={{ position: "absolute", left: 60, right: 60, top: 1170, direction: "rtl", textAlign: "center" }}>
        <div style={{ font: `700 30px ${BODY}`, color: "rgba(255,255,255,.75)", marginBottom: 12, opacity: ease(f, PASS_AT(0), 14, OUT) * outOf(f, "w2") }}>كل تمريرة = برومبت جاهز لمهمة:</div>
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          {tasks.map((t, i) => {
            const p = ease(f, PASS_AT(i) + 18, 14, BACK) * outOf(f, "w2");
            return (
              <div key={i} style={{ padding: "10px 22px 14px", borderRadius: 16, background: C.w2, color: "#07101C", font: `700 32px ${BODY}`, whiteSpace: "nowrap", transform: `scale(${p})`, opacity: Math.min(1, p * 2) }}>
                {t}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 18, display: "inline-block", padding: "10px 30px 14px", borderRadius: 18, background: "rgba(7,16,28,.8)", border: `2px solid ${C.w2}`, color: "#fff", font: `700 34px ${BODY}`, transform: `scale(${lib})`, opacity: Math.min(1, lib * 2) }}>
          وتنحفظ في <span style={{ color: C.w2 }}>مكتبة برومبتات مشتركة</span> للفريق
        </div>
      </div>,
    );
  }
  /* الأسبوع 3: أدوات الربط + المراجعة البشرية */
  if (inSeg(f, "w3")) {
    const l3 = lp(f, "w3");
    const [cx, cy] = project(f, [COACH_W3[0], 1.9, COACH_W3[2]]);
    out.push(
      <Tag key="rev" x={cx} y={cy - 8} p={ease(l3, 176, 14, BACK) * outOf(f, "w3")} bg={C.ok}>
        والإنسان يراجع قبل الإرسال ✓
      </Tag>,
    );
    const pl = ease(l3, 60, 16, OUT) * outOf(f, "w3");
    out.push(
      <div key="w3c" style={{ position: "absolute", left: 60, right: 60, top: 1272, direction: "rtl" }}>
        <Card p={pl} color={C.w3}>
          <span style={{ whiteSpace: "nowrap" }}>أدوات ربط مثل:</span>
          {[
            ["zapier-color.svg", "Zapier"],
            ["make-color.svg", "Make"],
            ["n8n-color.svg", "n8n"],
          ].map(([src, n]) => (
            <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 16px", borderRadius: 14, background: "#fff", color: "#111", font: `700 30px 'Space Grotesk'`, direction: "ltr" }}>
              <Img src={V(src)} style={{ width: 38, height: 38 }} />
              {n}
            </span>
          ))}
        </Card>
      </div>,
    );
  }
  /* الخطأ الشائع: الكابتن */
  if (inSeg(f, "tip")) {
    const lt = lp(f, "tip");
    const [cx, cy] = project(f, [0, 2.1, 0]);
    out.push(
      <Tag key="cap" x={cx} y={cy - 6} p={ease(lt, 36, 14, BACK) * outOf(f, "tip")} bg={C.gold}>
        الكابتن
      </Tag>,
    );
    out.push(
      <div key="tipc" style={{ position: "absolute", left: 60, right: 60, top: 1230, direction: "rtl" }}>
        <Card p={ease(lt, 46, 16, OUT) * outOf(f, "tip")} color={C.gold}>
          <Ico n="check" c={C.gold} />
          <span>
            <b style={{ color: C.gold }}>الصح:</b> تمرين يومي، و«كابتن» لكل فريق يتابع ويجاوب أسئلتهم
          </span>
        </Card>
      </div>,
    );
  }
  return <>{out}</>;
};

/* ───── الختام ───── */
export const End: React.FC<{ f: number }> = ({ f }) => {
  const [a] = SEG.end;
  if (f < a + 10) return null;
  const pn = ease(f, a + 46, 18, OUT);
  const pc = ease(f, a + 62, 18, OUT);
  const ph = ease(f, a + 76, 18, BACK);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, direction: "rtl", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 1226, left: 0, right: 0, font: `900 84px/1.35 ${DISPLAY}`, color: "#fff", opacity: pn, transform: `translateY(${(1 - pn) * 30}px)`, textShadow: "0 6px 30px rgba(0,0,0,.6)" }}>علي التميمي</div>
      <div style={{ position: "absolute", top: 1350, left: 0, right: 0, font: `700 36px/1.4 ${BODY}`, color: "rgba(255,255,255,.88)", opacity: pc }}>تابعني… كل يوم خطوة في الذكاء الاصطناعي</div>
      <div style={{ position: "absolute", top: 1420, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${ph})` }}>
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
export const Shade: React.FC = () => (
  <>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(85% 60% at 50% 55%, rgba(4,8,14,0) 45%, rgba(4,8,14,.55) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 600, background: "linear-gradient(180deg, rgba(4,8,14,.8), rgba(4,8,14,0))" }} />
  </>
);
