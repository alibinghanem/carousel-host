import { Img } from "remotion";
import { Reveal } from "../ClaudeVsGptPro/kit";
import { B, BACK, BODY, DISPLAY, EN, HAND, MONO, OUT, SEG, SegK, V, ease } from "./theme";
import { Caption, Draw, En, Title, TitleBlock, pop } from "./parts";

type CP = { f: number };
/** في الختام تتجمّد كل خلية على حالتها الكاملة، فلما ترجع الكاميرا لورا تنكشف الورقة كلها */
const FREEZE = SEG.end[0] - 14;
const local = (f: number, k: SegK) => {
  const dur = SEG[k][1] - SEG[k][0];
  if (f >= FREEZE) return { lf: dur - 14, out: dur - 12, on: true };
  return { lf: f - SEG[k][0], out: dur - 12, on: f >= SEG[k][0] - 30 && f < SEG[k][1] + 30 };
};

/* ───────── الهوك: رسمة على منديل تتحول لمخطط ───────── */
export const HookCell: React.FC<CP> = ({ f }) => {
  const { lf, out, on } = local(f, "hook");
  if (!on && f > 200) return null;
  const draw = (a: number, d = 22) => ease(lf, a, d, OUT);
  const toBlue = ease(lf, 86, 26, OUT);
  const ink = (a: number) => `rgba(${Math.round(59 + (232 - 59) * toBlue)},${Math.round(58 + (242 - 58) * toBlue)},${Math.round(54 + (255 - 54) * toBlue)},1)`;
  const c = ink(0);
  return (
    <>
      <Title lf={lf} out={out}>
        ما تعرف برمجة؟
      </Title>
      <div style={{ position: "absolute", top: 450, left: 60, right: 60, display: "flex", justifyContent: "center", direction: "rtl" }}>
        <Reveal f={lf} at={44} d={18} out={out}>
          <div style={{ font: `700 54px/1.4 ${BODY}`, color: B.soft, whiteSpace: "nowrap" }}>
            اشرح فكرتك… و<En c={B.clay}>Claude Code</En> يبنيها
          </div>
        </Reveal>
      </div>
      {/* المنديل */}
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 640,
          width: 780,
          height: 640,
          transform: `rotate(${-4 * (1 - toBlue)}deg) scale(${0.96 + 0.04 * ease(lf, 0, 14)})`,
          opacity: ease(lf, 0, 10),
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: B.napkin, borderRadius: 6, boxShadow: "0 30px 60px rgba(0,0,0,.35)", opacity: 1 - toBlue, backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,.025) 0 2px, transparent 2px 9px)" }} />
        <div style={{ position: "absolute", inset: 0, border: `4px dashed ${B.line}`, borderRadius: 6, opacity: toBlue }} />
        <svg width={780} height={640} viewBox="0 0 780 640" style={{ position: "absolute", inset: 0 }}>
          <Draw d="M90 150 C 200 140 560 146 690 152 C 694 280 688 420 692 560 C 520 566 260 562 88 558 C 92 420 86 280 90 150 Z" p={draw(6, 26)} c={c} w={5} />
          <Draw d="M90 210 C 300 206 500 212 690 208" p={draw(18, 14)} c={c} w={4} />
          {[0, 1, 2, 3, 4].map((i) => {
            const h = [110, 170, 130, 220, 160][i];
            const x = 160 + i * 80;
            return <Draw key={i} d={`M${x} 470 C ${x + 2} ${470 - h / 2} ${x - 2} ${470 - h} ${x} ${470 - h} L ${x + 44} ${470 - h} L ${x + 46} 470`} p={draw(26 + i * 5, 14)} c={c} w={4} />;
          })}
          <Draw d="M140 474 C 300 470 420 476 610 472" p={draw(50, 12)} c={c} w={4} />
          <Draw d="M520 260 C 520 236 650 236 650 260 C 650 290 520 290 520 260 Z" p={draw(56, 14)} c={B.clay} w={4} />
          <Draw d="M150 520 C 300 510 470 528 640 516" p={draw(64, 14)} c={c} w={3} />
        </svg>
        <div style={{ position: "absolute", top: 40, right: 60, font: `700 40px ${HAND}`, color: c, opacity: draw(10, 16), direction: "rtl", whiteSpace: "nowrap" }}>أبي أداة تطلّع تقرير المبيعات</div>
        <div style={{ position: "absolute", top: 232, left: 534, width: 104, textAlign: "center", font: `700 22px ${HAND}`, color: B.clay, opacity: draw(62, 10) }}>طلّعه</div>
      </div>
      <TitleBlock n={1} name="IDEA → TOOL" />
    </>
  );
};

/* ───────── وش يسوي ───────── */
const ICONS = {
  read: "M20 30 h50 l12 12 h58 v86 h-120 z M20 54 h120",
  edit: "M40 120 l12 -40 l60 -60 l28 28 l-60 60 z M100 32 l28 28",
  run: "M80 80 m-58 0 a58 58 0 1 0 116 0 a58 58 0 1 0 -116 0 M66 54 l40 26 l-40 26 z",
};
export const WhatCell: React.FC<CP> = ({ f }) => {
  const { lf, out, on } = local(f, "what");
  if (!on) return null;
  const rows: [keyof typeof ICONS, string, string][] = [
    ["read", "يقرأ مشروعك", "يفهم ملفاتك بنفسه"],
    ["edit", "يعدّل الملفات", "يكتب الكود في أكثر من ملف"],
    ["run", "يشغّل الأوامر", "ويجرّب إن الشي يشتغل"],
  ];
  return (
    <>
      <Title
        lf={lf}
        out={out}
        kicker={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
            <Img src={V("claudecode-color.svg")} style={{ width: 40, height: 40 }} />
            CLAUDE CODE
          </span>
        }
      >
        وش يسوي بالضبط؟
      </Title>
      <svg width={1080} height={900} viewBox="0 0 1080 900" style={{ position: "absolute", left: 0, top: 560 }}>
        <Draw d="M960 40 V 740" p={ease(lf, 20, 40)} c={B.dim} w={3} />
        {rows.map(([k], i) => (
          <g key={k} transform={`translate(780 ${40 + i * 240})`}>
            <rect x={0} y={0} width={160} height={160} rx={18} fill="rgba(232,242,255,.05)" stroke={B.dim} strokeWidth={2} />
            <Draw d={ICONS[k]} p={ease(lf, 24 + i * 22, 26)} w={6} c={i === 2 ? B.clay : B.line} />
          </g>
        ))}
      </svg>
      {rows.map(([k, t, s], i) => (
        <div key={k} style={{ position: "absolute", right: 340, top: 600 + i * 240, width: 640, direction: "rtl", opacity: pop(lf, 34 + i * 22), transform: `translateX(${(1 - pop(lf, 34 + i * 22)) * 30}px)` }}>
          <div style={{ font: `900 64px/1.25 ${DISPLAY}`, color: B.line }}>{t}</div>
          <div style={{ font: `600 34px/1.5 ${BODY}`, color: B.soft }}>{s}</div>
        </div>
      ))}
      <Caption lf={lf} at={130} out={out}>
        وأنت تكلمه <span style={{ color: B.yel }}>بكلامك العادي</span>… مو بالكود
      </Caption>
      <TitleBlock n={2} name="WHAT IT DOES" />
    </>
  );
};

/* ───────── اشرح وش تبي ───────── */
const PROMPT = "عندي ملف مبيعات،\nأبي أداة تطلّع منه تقرير أسبوعي برسم بياني";
const PLAN = ["أقرأ الملف وأفهم أعمدته", "أحسب إجمالي كل منتج", "أرسم الرسم وأحفظ التقرير"];
/** ملف المبيعات ملفك أصلاً؛ الباقي يكتبه Claude */
const FILES = ["report.py", "chart.py", "data/sales.csv", "README.md"];
const MINE = "data/sales.csv";
export const HowCell: React.FC<CP> = ({ f }) => {
  const { lf, out, on } = local(f, "how");
  if (!on) return null;
  const n = Math.round(Math.min(1, Math.max(0, (lf - 16) / 70)) * PROMPT.length);
  return (
    <>
      <Title lf={lf} out={out} kicker="1 · DESCRIBE">
        اشرح وش تبي
      </Title>
      <div style={{ position: "absolute", top: 540, left: 80, right: 80, height: 200, border: `4px solid ${B.line}`, borderRadius: 22, padding: "22px 30px", direction: "rtl", opacity: pop(lf, 8) }}>
        <div style={{ position: "absolute", top: -22, right: 24, padding: "0 12px", background: B.sheet, font: `700 26px ${MONO}`, color: B.yel, direction: "ltr" }}>YOU</div>
        <div style={{ font: `600 38px/1.55 ${BODY}`, color: B.line, whiteSpace: "pre-line" }}>
          {PROMPT.slice(0, n)}
          {n < PROMPT.length && Math.floor(f / 8) % 2 === 0 ? <span style={{ color: B.clay }}>|</span> : null}
        </div>
      </div>
      <div style={{ position: "absolute", top: 790, right: 80, left: 80, direction: "rtl" }}>
        <div style={{ font: `700 26px ${MONO}`, color: B.clay, direction: "ltr", textAlign: "right", opacity: pop(lf, 96), marginBottom: 10 }}>CLAUDE · PLAN</div>
        {PLAN.map((p, i) => (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: 16, height: 64, opacity: pop(lf, 104 + i * 14), transform: `translateX(${(1 - pop(lf, 104 + i * 14)) * 24}px)` }}>
            <div style={{ width: 46, height: 46, borderRadius: 23, border: `3px solid ${B.clay}`, display: "grid", placeItems: "center", font: `900 26px ${DISPLAY}`, color: B.clay }}>{["١", "٢", "٣"][i]}</div>
            <span style={{ font: `700 36px ${BODY}`, color: B.line }}>{p}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 1040, left: 120, width: 520, direction: "ltr" }}>
        <div style={{ font: `700 30px ${MONO}`, color: B.yel, opacity: pop(lf, 160) }}>sales-report/</div>
        <svg width={40} height={230} style={{ position: "absolute", left: 14, top: 44 }}>
          <Draw d="M4 0 V 200" p={ease(lf, 164, 30)} c={B.dim} w={3} />
        </svg>
        {FILES.map((fl, i) => (
          <div key={fl} style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 40, height: 52, opacity: pop(lf, 170 + i * 10) }}>
            <span style={{ font: `700 28px ${MONO}`, color: fl === MINE ? B.soft : B.line }}>{fl}</span>
            {fl === MINE ? (
              <span style={{ padding: "0 10px 2px", borderRadius: 8, border: `2px solid ${B.dim}`, color: B.soft, font: `700 22px ${MONO}`, opacity: pop(lf, 176 + i * 10) }}>yours</span>
            ) : (
              <span style={{ padding: "0 10px 2px", borderRadius: 8, background: "rgba(74,222,128,.18)", color: B.ok, font: `800 22px ${MONO}`, transform: `scale(${ease(lf, 176 + i * 10, 10, BACK)})` }}>+ new</span>
            )}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 1070, right: 80, width: 330, direction: "rtl", textAlign: "center", opacity: pop(lf, 200) }}>
        <div style={{ font: `900 50px/1.3 ${DISPLAY}`, color: B.line }}>يخطط</div>
        <div style={{ font: `900 40px ${DISPLAY}`, color: B.clay }}>↓</div>
        <div style={{ font: `900 44px/1.3 ${DISPLAY}`, color: B.line }}>ويكتب الكود</div>
        <div style={{ font: `600 30px ${BODY}`, color: B.soft }}>في أكثر من ملف</div>
      </div>
      <TitleBlock n={3} name="PLAN + BUILD" />
    </>
  );
};

/* ───────── يجرّبه ويصلحه ───────── */
export const VerifyCell: React.FC<CP> = ({ f }) => {
  const { lf, out, on } = local(f, "verify");
  if (!on) return null;
  const line = (at: number, node: React.ReactNode, bg?: string) => (
    <div style={{ opacity: pop(lf, at), transform: `translateY(${(1 - pop(lf, at)) * 10}px)`, background: bg, padding: "4px 10px", borderRadius: 8, marginBottom: 8 }}>{node}</div>
  );
  return (
    <>
      <Title lf={lf} out={out} kicker="2 · RUN · FIX · RUN">
        ويجرّبه بنفسه
      </Title>
      <div style={{ position: "absolute", top: 540, left: 70, right: 70, height: 560, borderRadius: 24, background: B.deep, border: `3px solid ${B.dim}`, boxShadow: "0 30px 60px rgba(0,0,0,.35)", overflow: "hidden" }}>
        <div style={{ height: 50, borderBottom: `2px solid ${B.dim}`, display: "flex", alignItems: "center", gap: 8, padding: "0 18px" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
          ))}
        </div>
        <div style={{ padding: "22px 26px", font: `700 30px/1.45 ${MONO}`, color: B.line, direction: "ltr" }}>
          {line(16, <><span style={{ color: B.ok }}>$</span> python report.py</>)}
          {line(36, <span style={{ color: B.bad }}>KeyError: &apos;date&apos;</span>)}
          {line(
            60,
            <div style={{ direction: "rtl", font: `700 30px ${BODY}`, color: B.clay }}>
              ● يتتبّع الخطأ: اسم العمود في الملف <span style={{ fontFamily: MONO, direction: "ltr", unicodeBidi: "isolate" }}>&quot;Date&quot;</span>
            </div>,
          )}
          {line(86, <span>- week = row[&apos;date&apos;]</span>, "rgba(255,107,107,.18)")}
          {line(98, <span>+ week = row[&apos;Date&apos;]</span>, "rgba(74,222,128,.18)")}
          {line(122, <><span style={{ color: B.ok }}>$</span> python report.py</>)}
          {line(142, <span style={{ color: B.ok }}>✓ report.html</span>)}
        </div>
      </div>
      <div style={{ position: "absolute", top: 1130, left: 260, width: 560, height: 150, borderRadius: 18, border: `3px solid ${B.line}`, padding: "14px 22px", display: "flex", alignItems: "flex-end", gap: 18, opacity: pop(lf, 150), direction: "rtl" }}>
        <div style={{ position: "absolute", top: 12, right: 20, font: `700 26px ${BODY}`, color: B.yel }}>تقرير الأسبوع</div>
        {[50, 80, 64, 100, 72, 92].map((h, i) => (
          <div key={i} style={{ width: 46, height: h * ease(lf, 156 + i * 4, 16), borderRadius: "8px 8px 2px 2px", background: i === 3 ? B.clay : B.soft }} />
        ))}
      </div>
      <Caption lf={lf} at={170} out={out} y={1310}>
        يلقى سبب الخطأ، يصلحه، ويعيد التشغيل
      </Caption>
      <TitleBlock n={4} name="VERIFY" />
    </>
  );
};

/* ───────── وين تلقاه ───────── */
export const WhereCell: React.FC<CP> = ({ f }) => {
  const { lf, out, on } = local(f, "where");
  if (!on) return null;
  const tile = (i: number, x: number, y: number, title: React.ReactNode, sub: React.ReactNode, icon: React.ReactNode, badge?: string) => {
    const p = ease(lf, 20 + i * 12, 18, BACK);
    return (
      <div style={{ position: "absolute", left: x, top: y, width: 440, height: 300, borderRadius: 24, border: `3px solid ${i === 0 ? B.yel : B.dim}`, background: "rgba(232,242,255,.04)", padding: "22px 24px", direction: "rtl", transform: `scale(${0.9 + 0.1 * p})`, opacity: Math.min(1, p * 1.3), overflow: "hidden" }}>
        {badge ? <div style={{ position: "absolute", top: 18, left: 18, padding: "4px 16px 6px", borderRadius: 999, background: B.yel, color: B.deep, font: `800 24px ${BODY}` }}>{badge}</div> : null}
        <div style={{ height: 110 }}>{icon}</div>
        <div style={{ font: `900 40px/1.3 ${DISPLAY}`, color: B.line }}>{title}</div>
        <div style={{ font: `600 28px/1.45 ${BODY}`, color: B.soft, marginTop: 4 }}>{sub}</div>
      </div>
    );
  };
  return (
    <>
      <Title lf={lf} out={out} kicker="3 · WHERE">
        وين تلقاه؟
      </Title>
      {tile(
        0,
        560,
        540,
        "تطبيق سطح المكتب",
        <>
          تبويب <En c={B.yel}>Code</En>، بدون تثبيت ثاني
        </>,
        <div style={{ width: 160, height: 100, borderRadius: 10, overflow: "hidden", border: `3px solid ${B.line}` }}>
          <Img src={V("laptop.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>,
        "الأسهل",
      )}
      {tile(
        1,
        80,
        540,
        "المتصفح",
        <>
          <En>claude.ai/code</En> بدون إعداد
        </>,
        <svg width={150} height={100} viewBox="0 0 150 100">
          <Draw d="M6 10 h138 v84 h-138 z M6 30 h138" p={ease(lf, 34, 20)} w={5} />
          <circle cx={20} cy={20} r={4} fill={B.line} />
        </svg>,
      )}
      {tile(
        2,
        560,
        870,
        "الطرفية",
        <>
          أمر تثبيت، ثم <span style={{ fontFamily: MONO, direction: "ltr", unicodeBidi: "isolate", color: B.yel }}>claude</span>
        </>,
        <svg width={150} height={100} viewBox="0 0 150 100">
          <Draw d="M6 10 h138 v84 h-138 z M26 40 l18 14 l-18 14 M56 70 h34" p={ease(lf, 46, 20)} w={5} />
        </svg>,
      )}
      {tile(
        3,
        80,
        870,
        "محرر الأكواد",
        <>
          <En>VS Code</En> · <En>JetBrains</En>
        </>,
        <svg width={150} height={100} viewBox="0 0 150 100">
          <Draw d="M50 20 l-30 30 l30 30 M100 20 l30 30 l-30 30 M85 14 l-20 72" p={ease(lf, 58, 20)} w={5} />
        </svg>,
      )}
      <Caption lf={lf} at={110} out={out} y={1220}>
        <div>
          يحتاج اشتراك <En>Claude</En> مدفوع
        </div>
        <div style={{ fontFamily: EN, color: B.line, direction: "ltr" }}>Pro · Max · Team · Enterprise</div>
      </Caption>
      <TitleBlock n={5} name="SURFACES" />
    </>
  );
};

/* ───────── أنت المتحكم + الخطأ الشائع ───────── */
export const ControlCell: React.FC<CP> = ({ f }) => {
  const { lf, out, on } = local(f, "control");
  if (!on) return null;
  const press = lf >= 70 && lf < 78;
  return (
    <>
      <Title lf={lf} out={out} kicker="4 · YOU APPROVE">
        وأنت المتحكم
      </Title>
      <div style={{ position: "absolute", top: 540, left: 80, right: 80, height: 330, borderRadius: 24, background: B.deep, border: `3px solid ${B.dim}`, padding: "22px 28px", opacity: pop(lf, 10), direction: "rtl" }}>
        <div style={{ font: `700 32px ${BODY}`, color: B.line }}>يعرض لك التغيير قبل ما يعدّل</div>
        <div style={{ marginTop: 14, font: `700 28px/1.5 ${MONO}`, direction: "ltr", color: B.line }}>
          <div style={{ background: "rgba(255,107,107,.18)", padding: "2px 10px", borderRadius: 6, opacity: pop(lf, 24) }}>- week = row[&apos;date&apos;]</div>
          <div style={{ background: "rgba(74,222,128,.18)", padding: "2px 10px", borderRadius: 6, marginTop: 6, opacity: pop(lf, 32) }}>+ week = row[&apos;Date&apos;]</div>
        </div>
        <div style={{ position: "absolute", left: 28, bottom: 24, display: "flex", gap: 14, alignItems: "center", direction: "ltr" }}>
          <div style={{ padding: "8px 34px 10px", borderRadius: 14, background: B.ok, color: B.deep, font: `800 32px ${EN}`, transform: `scale(${press ? 0.92 : 1})`, boxShadow: lf > 70 ? "0 0 0 8px rgba(74,222,128,.25)" : undefined, opacity: pop(lf, 44) }}>Yes</div>
          <div style={{ font: `700 26px ${BODY}`, color: B.soft, direction: "rtl", opacity: pop(lf, 50) }}>توافق وهو يكمل</div>
        </div>
        <div style={{ position: "absolute", right: 28, bottom: 24, display: "flex", gap: 12, alignItems: "center", opacity: pop(lf, 90) }}>
          <span style={{ padding: "6px 16px 8px", borderRadius: 10, border: `3px solid ${B.yel}`, color: B.yel, font: `800 26px ${MONO}`, direction: "ltr" }}>Shift+Tab</span>
          <span style={{ font: `700 26px ${BODY}`, color: B.soft }}>يبدّل وضع الصلاحيات</span>
        </div>
      </div>
      <div style={{ position: "absolute", top: 920, left: 80, right: 80, direction: "rtl" }}>
        <div style={{ font: `900 44px ${DISPLAY}`, color: B.yel, opacity: pop(lf, 120), marginBottom: 14 }}>الخطأ الشائع: طلب عام</div>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 22px", borderRadius: 18, border: `3px solid ${B.bad}`, background: "rgba(255,107,107,.08)", opacity: pop(lf, 132), marginBottom: 14 }}>
          <span style={{ font: `800 36px ${BODY}`, color: B.bad }}>✗</span>
          <span style={{ font: `700 34px/1.45 ${BODY}`, color: B.line }}>«صلّح المشكلة»</span>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 22px", borderRadius: 18, border: `3px solid ${B.ok}`, background: "rgba(74,222,128,.08)", opacity: pop(lf, 148) }}>
          <span style={{ font: `800 36px ${BODY}`, color: B.ok }}>✓</span>
          <span style={{ font: `700 34px/1.45 ${BODY}`, color: B.line }}>«صلّح مشكلة الدخول اللي تطلّع شاشة فاضية بعد كلمة مرور غلط»</span>
        </div>
      </div>
      <TitleBlock n={6} name="CONTROL" />
    </>
  );
};
