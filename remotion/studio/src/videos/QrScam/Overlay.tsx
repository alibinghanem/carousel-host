import React from "react";
import { Img } from "remotion";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { PHONE_P, PLATE_S, projectW } from "./Scene3D";
import { BACK, BG, BODY, C, DISPLAY, EN, IN, OUT, SEG, SegK, V, ease } from "./theme";

export const TAG = "تقنية · QR مزيّف";
const iso = (t: string, s?: React.CSSProperties) => <span style={{ direction: "ltr", unicodeBidi: "isolate", fontFamily: EN, fontWeight: 700, whiteSpace: "nowrap", ...s }}>{t}</span>;
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

/* ───── الخلفية: صورة بطاقة حقيقية في الهوك، وتدرّجات بعدها + خطوط تحذير ───── */
export const Backdrop: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  let c0 = BG.hook[0];
  let c1 = BG.hook[1];
  for (let i = 1; i < KEYS.length; i++) {
    const t = ease(f, SEG[KEYS[i]][0] - 15, 30, OUT);
    if (t <= 0) break;
    c0 = mixHex(BG[KEYS[i - 1]][0], BG[KEYS[i]][0], t);
    c1 = mixHex(BG[KEYS[i - 1]][1], BG[KEYS[i]][1], t);
  }
  const photo = 1 - ease(f, SEG.hook[1] - 30, 40, OUT);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 45% at 50% 55%, ${c0} 0%, ${c1} 100%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 330, opacity: 0.1 + kick * 0.04, backgroundImage: "repeating-linear-gradient(135deg, #FFC400 0 40px, transparent 40px 80px)", WebkitMaskImage: "linear-gradient(0deg, #000, transparent)", maskImage: "linear-gradient(0deg, #000, transparent)" }} />
      {photo > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: photo }}>
          <Img src={V("card.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "30% 50%", transform: `scale(${1.3 + f * 0.0015})`, filter: "brightness(.55) contrast(1.1) saturate(.9)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(12,11,7,.92) 0%, rgba(12,11,7,.5) 36%, rgba(12,11,7,.3) 62%, rgba(12,11,7,.85) 100%)" }} />
        </div>
      ) : null}
    </>
  );
};

/* ───── العناوين ───── */
type B = { k: SegK; chip: React.ReactNode; title: React.ReactNode; sub: React.ReactNode; color: string; lines?: number; size?: number };
const BLOCKS: B[] = [
  { k: "hook", chip: TAG, title: <>صوّرت الكود…<br />ودفعت لمحتال</>, sub: "ملصق بسيط يغيّر وين تروح فلوسك", color: C.yel, lines: 2, size: 104 },
  { k: "real", chip: "الكود الرسمي", title: "كود تثق فيه", sub: "على عداد المواقف أو الطاولة أو الإعلان", color: C.grn, size: 104 },
  { k: "sticker", chip: "الخدعة", title: "ملصق فوق ملصق", sub: "نفس الشكل… بس الرابط غير", color: C.red, size: 104 },
  { k: "scan", chip: "لما تصوّره", title: "وين يوديك؟", sub: "صفحة دفع مزيّفة تسحب بيانات بطاقتك", color: C.red, size: 108 },
  { k: "check", chip: "قبل لا تفتح", title: "ثلاث فحوصات", sub: "ثواني تحميك من الخدعة", color: C.yel, size: 108 },
  { k: "act", chip: "لو وقعت؟", title: "اتصرف بسرعة", sub: "كل دقيقة تفرق", color: C.grn, size: 108 },
];
const Block: React.FC<{ f: number; b: B }> = ({ f, b }) => {
  const [a, e] = SEG[b.k];
  if (f < a - 2 || f > e + 2) return null;
  const lf = f - a;
  const first = a === 0;
  const out = ease(f, e - 10, 10, IN);
  const pc = first ? 1 : ease(lf, 4, 14, BACK);
  const pt = first ? ease(lf, 0, 14, OUT) : ease(lf, 8, 18, OUT);
  const ps = ease(lf, first ? 12 : 20, 16, OUT);
  const lines = b.lines ?? 1;
  const size = b.size ?? 100;
  return (
    <div style={{ position: "absolute", inset: 0, direction: "rtl", opacity: 1 - out, transform: `translateY(${-out * 40}px)` }}>
      <div style={{ position: "absolute", top: 196, right: 80, padding: "6px 22px 10px", borderRadius: 999, background: b.color, color: C.ink, font: `700 30px ${BODY}`, transform: `scale(${pc})`, transformOrigin: "right center", whiteSpace: "nowrap", boxShadow: `0 0 30px ${b.color}55` }}>{b.chip}</div>
      <div style={{ position: "absolute", top: 256, right: 74, left: 20, overflow: "hidden", padding: "0 6px 12px" }}>
        <div style={{ font: `900 ${size}px/1.3 ${DISPLAY}`, color: "#fff", whiteSpace: "nowrap", transform: `translateY(${(1 - pt) * 110}%)`, textShadow: "0 6px 30px rgba(0,0,0,.55)" }}>{b.title}</div>
      </div>
      <div style={{ position: "absolute", top: 256 + size * 1.3 * lines + 20, right: 80, left: 40, font: `700 38px/1.5 ${BODY}`, color: "rgba(255,255,255,.9)", opacity: ps, transform: `translateY(${(1 - ps) * 20}px)`, textShadow: "0 3px 16px rgba(0,0,0,.6)" }}>{b.sub}</div>
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

/* ───── ملصقات وبطاقات ───── */
const Tag: React.FC<{ x: number; y: number; p: number; bg: string; fg?: string; children: React.ReactNode; size?: number }> = ({ x, y, p, bg, fg = C.ink, children, size = 30 }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${p})`, padding: "7px 20px 11px", borderRadius: 16, background: bg, color: fg, font: `700 ${size}px ${BODY}`, whiteSpace: "nowrap", direction: "rtl", boxShadow: "0 10px 30px rgba(0,0,0,.4)" }}>
      {children}
    </div>
  );
const Note: React.FC<{ p: number; color: string; top: number; children: React.ReactNode; left?: number; right?: number; size?: number }> = ({ p, color, top, children, left = 56, right = 56, size = 31 }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", top, left, right, padding: "16px 26px 20px", borderRadius: 20, background: "rgba(14,13,8,.88)", border: `2px solid ${color}aa`, color: "#fff", font: `700 ${size}px/1.45 ${BODY}`, direction: "rtl", opacity: p, transform: `translateY(${(1 - p) * 26}px)` }}>
      {children}
    </div>
  );
/** قائمة خطوات على اليمين: step = المضيء */
const List: React.FC<{ l: number; o: number; items: React.ReactNode[]; step: number; color: string; top?: number; right?: number; width?: number; at?: number; gap?: number }> = ({ l, o, items, step, color, top = 640, right = 40, width = 470, at = 24, gap = 50 }) => (
  <div style={{ position: "absolute", top, right, width, display: "flex", flexDirection: "column", gap: 12, direction: "rtl" }}>
    {items.map((t, i) => {
      const p = ease(l, at + i * gap, 14, BACK) * o;
      const on = i === step;
      return (
        <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 18px 16px", borderRadius: 20, background: on ? color : "rgba(255,255,255,.09)", color: on ? C.ink : "#fff", border: `2px solid ${on ? color : "rgba(255,255,255,.2)"}`, font: `700 28px/1.4 ${BODY}`, opacity: Math.min(1, p * 1.5), transform: `scale(${0.88 + 0.12 * p})`, boxShadow: on ? `0 0 34px ${color}66` : "none" }}>
          <span style={{ flex: "none", width: 42, height: 42, borderRadius: 21, display: "grid", placeItems: "center", background: on ? C.ink : "rgba(255,255,255,.16)", color: on ? color : "#fff", font: `700 24px ${EN}` }}>{i + 1}</span>
          <span>{t}</span>
        </div>
      );
    })}
  </div>
);

export const Labels: React.FC<{ f: number }> = ({ f }) => {
  const out: React.ReactNode[] = [];
  if (inSeg(f, "real")) {
    const l = lp(f, "real");
    const o = outOf(f, "real");
    const s = PLATE_S.real!;
    const [x, y] = projectW(f, [s.p[0], s.p[1] + 2.35, 0.3]);
    out.push(
      <Tag key="ok" x={x} y={y} p={ease(l, 40, 14, BACK) * o} bg={C.grn} size={32}>
        كود رسمي ✓
      </Tag>,
    );
    out.push(
      <Note key="n" p={ease(l, 120, 16, OUT) * o} color={C.yel} top={1290}>
        كود الـ {iso("QR")} مجرد <b style={{ color: C.yel }}>رابط مطبوع</b>… وأي أحد يقدر يطبع كوداً ويلصقه
      </Note>,
    );
  }
  if (inSeg(f, "sticker")) {
    const l = lp(f, "sticker");
    const o = outOf(f, "sticker");
    const s = PLATE_S.sticker!;
    const [x, y] = projectW(f, [s.p[0], s.p[1] + 2.25, 0.3]);
    out.push(
      <Tag key="fake" x={x} y={y} p={ease(l, 104, 14, BACK) * o} bg={C.red} fg="#fff" size={32}>
        كود مزيّف!
      </Tag>,
    );
    const rows: [React.ReactNode, number][] = [
      [<><b style={{ color: C.yel }}>FTC</b> حذّرت (ديسمبر 2023): محتالون يلصقون أكواداً مزيّفة فوق أكواد <b style={{ color: C.yel }}>عدادات المواقف</b></>, 130],
      [<>في <b style={{ color: C.yel }}>ريدوندو بيتش</b> (أمريكا) لقوا ملصقات مزيّفة على <b style={{ color: C.yel }}>~150 عداد</b></>, 190],
    ];
    out.push(
      <div key="rows" style={{ position: "absolute", top: 690, right: 40, width: 450, display: "flex", flexDirection: "column", gap: 14, direction: "rtl" }}>
        {rows.map(([t, at], i) => {
          const p = ease(l, at, 14, BACK) * o;
          return (
            <div key={i} style={{ padding: "14px 20px 18px", borderRadius: 20, background: "rgba(14,13,8,.88)", border: `2px solid ${C.red}99`, color: "#fff", font: `700 28px/1.45 ${BODY}`, opacity: Math.min(1, p * 1.5), transform: `scale(${0.9 + 0.1 * p})` }}>
              {t}
            </div>
          );
        })}
      </div>,
    );
    out.push(
      <Note key="n" p={ease(l, 230, 16, OUT) * o} color={C.red} top={1290} size={29}>
        الاسم الفني: <b style={{ color: C.red }}>{iso("Quishing")}</b> (تصيّد عبر كود {iso("QR")})
      </Note>,
    );
  }
  if (inSeg(f, "scan")) {
    const l = lp(f, "scan");
    const o = outOf(f, "scan");
    const [px, py] = projectW(f, [PHONE_P[0], PHONE_P[1] - 0.2, PHONE_P[2]]);
    out.push(
      <Tag key="url" x={px} y={py} p={ease(l, 118, 14, BACK) * o} bg="#fff" size={26}>
        رابط قريب… بس حرف مبدّل
      </Tag>,
    );
    out.push(
      <Note key="n" p={ease(l, 200, 16, OUT) * o} color={C.red} top={1345} size={27}>
        المحتال يلتقط بطاقتك: تدخل رقمها والرمز… وتروح <b style={{ color: C.red }}>مباشرة له</b>. وصورة الصفحة هنا <b>مثال توضيحي</b>
      </Note>,
    );
  }
  if (inSeg(f, "check")) {
    const l = lp(f, "check");
    const o = outOf(f, "check");
    const step = l < 90 ? 0 : l < 170 ? 1 : 2;
    out.push(
      <List
        key="l"
        l={l}
        o={o}
        step={step}
        color={C.yel}
        top={640}
        width={470}
        items={[
          <><b>الملصق:</b> ارفع طرفه… هل تحته كود ثاني؟ وحواف الأحرف حادة؟</>,
          <><b>الرابط:</b> اقرأه قبل ما تفتحه، وانتبه لحرف مبدّل</>,
          <><b>الأضمن:</b> تطبيق رسمي نزّلته من قبل</>,
        ]}
      />,
    );
    const s = PLATE_S.check!;
    const [x, y] = projectW(f, [s.p[0] - 0.4, s.p[1] - 1.9, 0.3]);
    out.push(
      <Tag key="u" x={x} y={y} p={ease(l, 120, 14, BACK) * o} bg={C.grn} size={28}>
        الأصلي تحته ✓
      </Tag>,
    );
    out.push(
      <Note key="n" p={ease(l, 220, 16, OUT) * o} color={C.yel} top={1300} size={29}>
        بعض النصائح من الشرطة: جرّب ترفع طرف الملصق، لو انفكّ من العداد لا تستخدم الكود
      </Note>,
    );
  }
  if (inSeg(f, "act")) {
    const l = lp(f, "act");
    const o = outOf(f, "act");
    const step = l < 80 ? 0 : l < 160 ? 1 : 2;
    out.push(
      <List
        key="l"
        l={l}
        o={o}
        step={step}
        color={C.grn}
        top={640}
        width={500}
        items={[
          <>بلّغ <b>الجهة صاحبة المكان</b> (البلدية أو المنشأة) عشان يشيلون الملصق</>,
          <>دخلت بيانات بطاقتك؟ <b>اتصل ببنكك الحين</b></>,
          <>أدخلت كلمة مرور؟ <b>غيّرها فوراً</b></>,
        ]}
      />,
    );
    out.push(
      <Note key="n" p={ease(l, 220, 16, OUT) * o} color={C.grn} top={1290}>
        ثق بـ<b style={{ color: C.grn }}>المصدر</b> مو بـ<b style={{ color: C.grn }}>الشكل</b>: الكود ما يثبت إن المكان رسمي
      </Note>,
    );
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
      <div style={{ position: "absolute", top: 210, left: 0, right: 0, font: `900 90px/1.3 ${DISPLAY}`, color: "#fff", opacity: pt, transform: `translateY(${(1 - pt) * 30}px)`, textShadow: "0 6px 30px rgba(0,0,0,.6)" }}>
        قبل ما تصوّر…
        <br />
        <span style={{ color: C.yel }}>ارفع طرف الملصق</span>
        <div style={{ font: `700 38px/1.4 ${BODY}`, color: "#FFF1C2" }}>أرسلها لأحد يصوّر أي كود يشوفه</div>
      </div>
      <div style={{ position: "absolute", top: 1290, left: 0, right: 0, font: `700 84px/1.3 ${BODY}`, color: "#fff", opacity: pn, transform: `translateY(${(1 - pn) * 30}px)`, textShadow: "0 6px 30px rgba(0,0,0,.6)" }}>علي التميمي</div>
      <div style={{ position: "absolute", top: 1400, left: 0, right: 0, font: `700 34px/1.4 ${BODY}`, color: "rgba(255,255,255,.88)", opacity: pc }}>كل يوم معلومة تقنية تهمّك</div>
      <div style={{ position: "absolute", top: 1462, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${ph})` }}>
        <div style={{ padding: "10px 32px", borderRadius: 999, background: C.grad }}>
          <HandlesRow size={30} color="#14161A" />
        </div>
      </div>
    </div>
  );
};
export const Footer: React.FC<{ f: number }> = ({ f }) => {
  const o = ease(f, 8, 12) * (1 - ease(f, SEG.end[0], 10));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 1490, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ padding: "8px 24px", borderRadius: 999, background: "rgba(0,0,0,.55)", border: "1px solid rgba(255,255,255,.15)" }}>
        <HandlesRow size={26} color="#fff" />
      </div>
    </div>
  );
};
export const Shade: React.FC = () => <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 620, background: "linear-gradient(180deg, rgba(0,0,0,.5), rgba(0,0,0,0))" }} />;
