import React from "react";
import { Img } from "remotion";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { FAIL_AT, THIEF_BAD, projectW, tapPacket } from "./Scene3D";
import { BACK, BG, BODY, C, DISPLAY, EN, IN, OUT, REAL, SEG, SegK, V, ease } from "./theme";

export const TAG = "تقنية · الدفع باللمس";
const iso = (t: string) => <span style={{ direction: "ltr", unicodeBidi: "isolate", fontFamily: EN, fontWeight: 700, whiteSpace: "nowrap" }}>{t}</span>;
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

/* ───── الخلفية: صورة حقيقية لعميل يدفع بالجوال في الهوك، وبعدها تدرّج ───── */
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
      <div style={{ position: "absolute", left: -200, right: -200, top: 720, height: 640, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(242,193,78,${0.06 + kick * 0.04}), rgba(242,193,78,0))` }} />
      {/* شبكة نقاط خفيفة */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.12, backgroundImage: "radial-gradient(rgba(255,255,255,.7) 1.5px, transparent 1.6px)", backgroundSize: "44px 44px" }} />
      {photo > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: photo }}>
          <Img src={V("tap.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "56% 50%", transform: `scale(${1.25 + f * 0.0016})`, transformOrigin: "56% 80%", filter: "brightness(.62) contrast(1.08) saturate(1.05)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,9,16,.92) 0%, rgba(11,9,16,.55) 34%, rgba(11,9,16,.15) 60%, rgba(11,9,16,.7) 100%)" }} />
        </div>
      ) : null}
    </>
  );
};

/* ───── العناوين ───── */
type B = { k: SegK; chip: React.ReactNode; title: React.ReactNode; sub: React.ReactNode; color: string; lines?: number; size?: number };
const BLOCKS: B[] = [
  { k: "hook", chip: TAG, title: <>تدفع بجوالك كل يوم…<br />وتعرف ليش آمن؟</>, sub: "الجواب: رقم بطاقتك ما يطلع أصلاً", color: C.gold, lines: 2, size: 94 },
  { k: "card", chip: "البطاقة البلاستيك", title: "رقمك يمشي كامل", sub: "رقم البطاقة الحقيقي يوصل للمتجر", color: C.lilac, size: 100 },
  { k: "vault", chip: "١ · لما تضيف البطاقة للجوال", title: "الجوال ما يخزّن رقمك", sub: "يخزّن رقم بديل داخل شريحة أمان", color: C.mint, size: 92 },
  { k: "tap", chip: "٢ · لما تدفع", title: "كل دفعة… رمز جديد", sub: "تأكيد بوجهك أو بصمتك، ثم تقرّب الجوال", color: C.mint, size: 100 },
  { k: "thief", chip: "ولو أحد التقطها؟", title: "نسخة ما تنفع", sub: "الرمز انستخدم… والرقم الحقيقي مو فيها", color: "#FF8A95", size: 100 },
  { k: "verdict", chip: "الجواب", title: "آمن أكثر؟ إيه", sub: "والفرق في شيئين", color: C.gold, size: 100 },
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
      <div style={{ position: "absolute", top: 258, right: 74, left: 20, overflow: "hidden", padding: "0 6px 10px" }}>
        <div style={{ font: `800 ${size}px/1.36 ${DISPLAY}`, color: "#fff", whiteSpace: "nowrap", transform: `translateY(${(1 - pt) * 110}%)`, textShadow: "0 6px 30px rgba(0,0,0,.55)" }}>{b.title}</div>
      </div>
      <div style={{ position: "absolute", top: 258 + size * 1.36 * lines + 16, right: 80, left: 40, font: `700 38px/1.5 ${BODY}`, color: "rgba(255,255,255,.9)", opacity: ps, transform: `translateY(${(1 - ps) * 20}px)`, textShadow: "0 3px 16px rgba(0,0,0,.6)" }}>{b.sub}</div>
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

/* ───── ملصقات ───── */
const Tag: React.FC<{ x: number; y: number; p: number; bg: string; fg?: string; children: React.ReactNode; size?: number }> = ({ x, y, p, bg, fg = C.ink, children, size = 30 }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${p})`, padding: "7px 20px 11px", borderRadius: 16, background: bg, color: fg, font: `700 ${size}px ${BODY}`, whiteSpace: "nowrap", direction: "rtl", boxShadow: "0 10px 30px rgba(0,0,0,.4)" }}>
      {children}
    </div>
  );
const Note: React.FC<{ p: number; color: string; top: number; children: React.ReactNode; left?: number; right?: number }> = ({ p, color, top, children, left = 56, right = 56 }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", top, left, right, padding: "16px 26px 20px", borderRadius: 20, background: "rgba(11,9,16,.86)", border: `2px solid ${color}99`, color: "#fff", font: `700 31px/1.45 ${BODY}`, direction: "rtl", opacity: p, transform: `translateY(${(1 - p) * 26}px)` }}>
      {children}
    </div>
  );

export const Labels: React.FC<{ f: number }> = ({ f }) => {
  const out: React.ReactNode[] = [];
  if (inSeg(f, "card")) {
    const l = lp(f, "card");
    const o = outOf(f, "card");
    out.push(
      <Tag key="real" x={540} y={1036} p={ease(l, 34, 14, BACK) * (1 - ease(l, 72, 8, OUT)) * o} bg={C.lilac} size={30}>
        الرقم الحقيقي مطبوع ومخزّن في البطاقة
      </Tag>,
    );
    const fly = ease(l, 118, 30, OUT);
    out.push(
      <div key="fly" style={{ position: "absolute", left: 0, right: 0, top: 590 + (1 - fly) * 420, display: "flex", justifyContent: "center", opacity: Math.min(1, fly * 1.4) * o }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "10px 28px 14px", borderRadius: 20, background: "rgba(11,9,16,.88)", border: `2px solid ${C.lilac}`, direction: "rtl", boxShadow: `0 0 40px ${C.lilac}55` }}>
          <span style={{ font: `700 30px ${BODY}`, color: "#fff" }}>المتجر يستلم:</span>
          <span style={{ font: `700 40px ${EN}`, color: C.lilac, direction: "ltr" }}>{REAL}</span>
        </div>
      </div>,
    );
    out.push(
      <Note key="n" p={ease(l, 158, 16, OUT) * o} color={C.lilac} top={700}>
        ولو تسرّبت بيانات متجر يوماً… <b style={{ color: C.lilac }}>رقمك الحقيقي</b> ضمنها
      </Note>,
    );
  }
  if (inSeg(f, "vault")) {
    const l = lp(f, "vault");
    const o = outOf(f, "vault");
    const step = l < 104 ? 0 : l < 160 ? 1 : 2;
    const items = ["تضيف بطاقتك لمحفظة الجوال", <>ينشأ <b>رقم بديل</b> خاص بجهازك</>, <>يتخزّن مشفّر في <b>شريحة الأمان</b> داخل الجوال</>];
    out.push(
      <div key="steps" style={{ position: "absolute", top: 640, right: 40, width: 440, display: "flex", flexDirection: "column", direction: "rtl" }}>
        {items.map((t, i) => {
          const p = ease(l, 30 + i * 62, 14, BACK) * o;
          const on = i === step;
          return (
            <div key={i} style={{ opacity: Math.min(1, p * 1.5), transform: `scale(${0.85 + 0.15 * p})` }}>
              {i > 0 ? <div style={{ textAlign: "center", font: `700 34px ${BODY}`, color: "rgba(255,255,255,.6)", lineHeight: "40px" }}>↓</div> : null}
              <div style={{ padding: "12px 20px 16px", borderRadius: 18, background: on ? C.mint : "rgba(255,255,255,.1)", color: on ? C.ink : "#fff", border: `2px solid ${on ? C.mint : "rgba(255,255,255,.18)"}`, font: `700 31px/1.4 ${BODY}`, boxShadow: on ? `0 0 34px ${C.mint}66` : "none" }}>{t}</div>
            </div>
          );
        })}
      </div>,
    );
    out.push(
      <Tag key="se" x={330} y={1418} p={ease(l, 112, 14, BACK) * (1 - ease(l, 196, 12, OUT)) * o} bg={C.mint} size={28}>
        شريحة الأمان {iso("Secure Element")}
      </Tag>,
    );
    out.push(
      <Note key="n" p={ease(l, 200, 16, OUT) * o} color={C.mint} top={1150} left={600} right={40}>
        <span style={{ fontSize: 28 }}>
          وحسب Apple: رقم بطاقتك الأصلي <b style={{ color: C.mint }}>ما تخزّنه</b>، ورقم الجهاز مو على سيرفراتها ولا في نسخ {iso("iCloud")}
        </span>
      </Note>,
    );
  }
  if (inSeg(f, "tap")) {
    const l = lp(f, "tap");
    const o = outOf(f, "tap");
    out.push(
      <Tag key="nfc" x={830} y={1030} p={ease(l, 96, 14, BACK) * (1 - ease(l, 156, 10, OUT)) * o} bg={C.mint} size={28}>
        لمس {iso("(NFC)")}
      </Tag>,
    );
    const pk = projectW(f, tapPacket(l));
    const big = ease(l, 166, 14, BACK) * o;
    out.push(
      <Tag key="rec" x={540} y={pk[1] - 170} p={big} bg="#fff" size={30}>
        هذا كل اللي يوصل للمتجر
      </Tag>,
    );
    out.push(
      <Tag key="code" x={540} y={pk[1] + 168} p={ease(l, 200, 14, BACK) * o} bg={C.mint} size={30}>
        كل دفعة جاية = رمز مختلف
      </Tag>,
    );
  }
  if (inSeg(f, "thief")) {
    const l = lp(f, "thief");
    const o = outOf(f, "thief");
    out.push(
      <Tag key="h" x={560} y={560} p={ease(l, 40, 14, BACK) * (1 - ease(l, 130, 10, OUT)) * o} bg="#FF8A95" size={30}>
        محتال يلتقط بيانات العملية
      </Tag>,
    );
    const [bx, by] = projectW(f, [THIEF_BAD[0], 0.1, 1.2]);
    out.push(
      <Tag key="x" x={bx} y={by - 40} p={ease(l, FAIL_AT + 6, 12, BACK) * o} bg={C.red} fg="#fff" size={40}>
        ✕ مرفوضة
      </Tag>,
    );
    out.push(
      <Note key="n" p={ease(l, 196, 16, OUT) * o} color="#FF8A95" top={540}>
        الرمز <b style={{ color: "#FF8A95" }}>ينفع مرة وحدة</b>، والرقم البديل مربوط بجوالك… فالنسخة المسروقة ما تفيده
      </Note>,
    );
  }
  if (inSeg(f, "verdict")) {
    const l = lp(f, "verdict");
    const o = outOf(f, "verdict");
    const head = ease(l, 24, 14, OUT) * o;
    out.push(
      <div key="hd" style={{ position: "absolute", top: 1040, left: 56, right: 56, display: "flex", direction: "rtl", gap: 16, opacity: head }}>
        <div style={{ flex: 1, textAlign: "center", font: `800 40px ${DISPLAY}`, color: C.mint }}>الجوال</div>
        <div style={{ flex: 1, textAlign: "center", font: `800 40px ${DISPLAY}`, color: "rgba(255,255,255,.7)" }}>البطاقة</div>
      </div>,
    );
    const rows: [string, string, string][] = [
      ["اللي يوصل للمتجر", "رقم بديل", "رقمك الحقيقي"],
      ["رمز الأمان", "جديد كل عملية", "ثابت على ظهرها"],
    ];
    rows.forEach(([lab, a, b], i) => {
      const p = ease(l, 50 + i * 50, 14, BACK) * o;
      out.push(
        <div key={`r${i}`} style={{ position: "absolute", top: 1106 + i * 112, left: 56, right: 56, opacity: Math.min(1, p * 1.5), transform: `scale(${0.9 + 0.1 * p})`, direction: "rtl" }}>
          <div style={{ textAlign: "center", font: `700 24px ${BODY}`, color: "rgba(255,255,255,.65)", marginBottom: 4 }}>{lab}</div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1, textAlign: "center", padding: "8px 10px 12px", borderRadius: 16, background: C.mint, color: C.ink, font: `700 31px ${BODY}` }}>✓ {a}</div>
            <div style={{ flex: 1, textAlign: "center", padding: "8px 10px 12px", borderRadius: 16, background: "rgba(255,255,255,.08)", border: "2px solid rgba(255,255,255,.2)", color: "rgba(255,255,255,.85)", font: `700 31px ${BODY}` }}>{b}</div>
          </div>
        </div>,
      );
    });
    const pl = ease(l, 170, 16, OUT) * o;
    out.push(
      <div key="logos" style={{ position: "absolute", top: 1348, left: 56, right: 56, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, direction: "rtl", opacity: pl, transform: `translateY(${(1 - pl) * 20}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 20px", borderRadius: 14, background: "#fff" }}>
          <Img src={V("applepay.svg")} style={{ height: 52 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", borderRadius: 14, background: "#fff", color: "#202124", font: `700 28px ${EN}`, direction: "ltr" }}>
          <Img src={V("google.svg")} style={{ height: 34 }} />
          Google Wallet
        </div>
        <div style={{ font: `700 28px ${BODY}`, color: "#fff" }}>نفس الفكرة</div>
      </div>,
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
      <div style={{ position: "absolute", top: 200, left: 0, right: 0, font: `800 88px/1.3 ${DISPLAY}`, color: "#fff", opacity: pt, transform: `translateY(${(1 - pt) * 30}px)`, textShadow: "0 6px 30px rgba(0,0,0,.6)" }}>
        رقمك الحقيقي
        <br />
        <span style={{ color: C.gold }}>ما يطلع من جيبك</span>
        <div style={{ font: `700 38px/1.4 ${BODY}`, color: "#E9F7F0" }}>أرسلها لأحد يخاف يدفع بالجوال</div>
      </div>
      <div style={{ position: "absolute", top: 1290, left: 0, right: 0, font: `700 84px/1.3 ${BODY}`, color: "#fff", opacity: pn, transform: `translateY(${(1 - pn) * 30}px)`, textShadow: "0 6px 30px rgba(0,0,0,.6)" }}>علي التميمي</div>
      <div style={{ position: "absolute", top: 1400, left: 0, right: 0, font: `700 34px/1.4 ${BODY}`, color: "rgba(255,255,255,.88)", opacity: pc }}>كل يوم معلومة تقنية تهمّك</div>
      <div style={{ position: "absolute", top: 1462, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${ph})` }}>
        <div style={{ padding: "10px 32px", borderRadius: 999, background: C.grad }}>
          <HandlesRow size={30} color="#120E18" />
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
