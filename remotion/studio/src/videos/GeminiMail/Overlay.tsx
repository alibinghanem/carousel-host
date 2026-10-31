import React from "react";
import { Img } from "remotion";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { CARD, PHONE_SIDE, project } from "./Scene3D";
import { ASK_STEP, DOCS_STEP, SUM_STEP, WRITE_STEP } from "./screens";
import { BACK, BG, BODY, C, DISPLAY, EN, IN, OUT, SEG, SegK, V, ease } from "./theme";

export const TAG = "Gemini · Gmail و Docs";
const iso = (t: string) => <span style={{ direction: "ltr", unicodeBidi: "isolate", fontFamily: EN, fontWeight: 700 }}>{t}</span>;
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

/* ───── الخلفية: صورة ظروف حقيقية في الهوك، وبعدها تدرّج ليلي يتغير مع المشهد ───── */
export const Backdrop: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  let c0 = BG.hook[0];
  let c1 = BG.hook[1];
  for (let i = 1; i < KEYS.length; i++) {
    const t = ease(f, SEG[KEYS[i]][0] - 15, 30, OUT);
    if (t <= 0) break;
    c0 = mixHex(BG[KEYS[i - 1]][0], BG[KEYS[i]][0], t);
    c1 = mixHex(BG[KEYS[i - 1]][1], BG[KEYS[i]][1], t);
  }
  const photo = 1 - ease(f, SEG.hook[1] - 34, 34, OUT);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(75% 45% at 50% 52%, ${c0} 0%, ${c1} 100%)` }} />
      <div style={{ position: "absolute", left: -200, right: -200, top: 660, height: 640, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(150,130,255,${0.08 + kick * 0.04}), rgba(150,130,255,0))` }} />
      {photo > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: photo }}>
          <Img src={V("letters.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "42% 50%", transform: `scale(${1.12 + f * 0.0016})`, filter: "brightness(.62) contrast(1.08) saturate(.85)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,8,32,.88) 0%, rgba(11,8,32,.5) 34%, rgba(11,8,32,.2) 58%, rgba(11,8,32,.7) 100%)" }} />
        </div>
      ) : null}
    </>
  );
};

/* ───── العناوين ───── */
const Logo: React.FC<{ src: string; s?: number; bg?: string }> = ({ src, s = 40, bg = "#fff" }) => (
  <span style={{ display: "inline-grid", placeItems: "center", width: s, height: s, borderRadius: s / 4, background: bg, margin: "0 8px", verticalAlign: "middle" }}>
    <Img src={V(src)} style={{ width: s * 0.72, height: s * 0.72, objectFit: "contain" }} />
  </span>
);
type B = { k: SegK; chip: React.ReactNode; title: React.ReactNode; sub: React.ReactNode; color: string; lines?: number; size?: number };
const BLOCKS: B[] = [
  { k: "hook", chip: <span>{iso("Gemini")} · {iso("Gmail")} و {iso("Docs")}</span>, title: <>إيميلات الشغل<br />غرّقتك؟</>, sub: "خلّ Gemini يقراها ويطلع لك الزبدة", color: "#C9B8FF", lines: 2, size: 108 },
  { k: "intro", chip: <><Logo src="gemini-color.svg" s={36} />Gemini</>, title: "يقرأ… يلخّص… ويكتب", sub: <>داخل <Logo src="gmail-color.svg" s={44} />{iso("Gmail")} و <Logo src="googledocs-color.svg" s={44} />{iso("Docs")} بدون ما تطلع منها</>, color: "#C9B8FF", size: 96 },
  { k: "sum", chip: <><Logo src="gmail-color.svg" s={36} />Gmail · الملخّص</>, title: "الزبدة بضغطة", sub: "للسلاسل الطويلة اللي ما لها آخر", color: "#8AB4F8" },
  { k: "ask", chip: <><Logo src="gmail-color.svg" s={36} />Gmail · اسأل Gemini</>, title: "اسأل بريدك", sub: "كأنك تكلّم سكرتير يعرف كل رسايلك", color: "#C9B8FF" },
  { k: "write", chip: <><Logo src="gmail-color.svg" s={36} /><span>Gmail · {iso("Help me write")}</span></>, title: "اكتب الرد بجملة", sub: "تقول وش تبي… ويطلع لك مسودة كاملة", color: "#F6AEC0" },
  { k: "docs", chip: <><Logo src="googledocs-color.svg" s={36} />Google Docs</>, title: <>ونفسها في {iso("Docs")}</>, sub: "ملخّص وتعديل ومسودات… داخل المستند", color: "#8AB4F8" },
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
      <div style={{ position: "absolute", top: 196, right: 80, padding: "6px 22px 10px", borderRadius: 999, background: b.color, color: C.ink, font: `700 30px ${BODY}`, transform: `scale(${pc})`, transformOrigin: "right center", whiteSpace: "nowrap", boxShadow: `0 0 30px ${b.color}55`, display: "flex", alignItems: "center" }}>{b.chip}</div>
      <div style={{ position: "absolute", top: 258, right: 74, left: 20, overflow: "hidden", padding: "0 6px 10px" }}>
        <div style={{ font: `700 ${size}px/1.42 ${DISPLAY}`, color: "#fff", whiteSpace: "nowrap", transform: `translateY(${(1 - pt) * 110}%)`, textShadow: "0 6px 30px rgba(0,0,0,.55)" }}>{b.title}</div>
      </div>
      <div style={{ position: "absolute", top: 258 + size * 1.42 * lines + 18, right: 80, left: 40, font: `700 38px/1.5 ${BODY}`, color: "rgba(255,255,255,.9)", opacity: ps, transform: `translateY(${(1 - ps) * 20}px)`, textShadow: "0 3px 16px rgba(0,0,0,.6)" }}>{b.sub}</div>
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

/* ───── ملصقات وخطوات ───── */
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
      <div style={{ position: "absolute", top: 650, right: 56, width: 450, display: "flex", flexDirection: "column", alignItems: "stretch", direction: "rtl" }}>
        {items.map((t, i) => {
          const p = ease(l, 30 + i * 48, 14, BACK) * o;
          const on = i === step;
          return (
            <div key={i} style={{ opacity: Math.min(1, p * 1.5), transform: `scale(${0.85 + 0.15 * p})` }}>
              {i > 0 ? <div style={{ textAlign: "center", font: `700 34px ${BODY}`, color: "rgba(255,255,255,.6)", lineHeight: "44px" }}>↓</div> : null}
              <div style={{ padding: "14px 24px 18px", borderRadius: 18, background: on ? color : "rgba(255,255,255,.1)", color: on ? C.ink : "#fff", border: `2px solid ${on ? color : "rgba(255,255,255,.18)"}`, font: `700 33px/1.4 ${BODY}`, boxShadow: on ? `0 0 34px ${color}66` : "none" }}>{t}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 1104, right: 56, width: 450, boxSizing: "border-box", padding: "16px 24px 20px", borderRadius: 20, background: "rgba(8,6,26,.82)", border: `2px solid ${color}88`, color: "#fff", font: `700 30px/1.45 ${BODY}`, direction: "rtl", opacity: ease(l, noteAt, 16, OUT) * o, transform: `translateY(${(1 - ease(l, noteAt, 16, OUT)) * 30}px)` }}>
        {note}
      </div>
    </>
  );
};

export const Labels: React.FC<{ f: number }> = ({ f }) => {
  const out: React.ReactNode[] = [];
  if (f < SEG.hook[1] + 2) {
    const n = Math.round(ease(f, 6, 84, OUT) * 47);
    const p = ease(f, 6, 14, BACK) * (1 - ease(f, SEG.hook[1] - 12, 10, OUT));
    out.push(
      <div key="cnt" style={{ position: "absolute", left: 0, right: 0, top: 742, display: "flex", justifyContent: "center", opacity: p, transform: `scale(${0.8 + 0.2 * p})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "10px 30px 14px", borderRadius: 999, background: C.red, color: "#fff", direction: "rtl", boxShadow: "0 12px 40px rgba(234,67,53,.45)" }}>
          <span style={{ font: `700 64px ${EN}` }}>{n}</span>
          <span style={{ font: `700 34px ${BODY}` }}>رسالة ما انقرت</span>
        </div>
      </div>,
    );
  }
  if (inSeg(f, "intro")) {
    const l = lp(f, "intro");
    const o = outOf(f, "intro");
    const [x, y] = project(f, [CARD[0], CARD[1] + 1.42, CARD[2]]);
    out.push(
      <Tag key="c" x={x} y={y - 18} p={ease(l, 176, 14, BACK) * o} bg="#fff" size={34}>
        {iso("14")} رسالة ← {iso("3")} أسطر
      </Tag>,
    );
  }
  if (inSeg(f, "sum")) {
    const l = lp(f, "sum");
    out.push(
      <Steps
        key="s"
        f={f}
        k="sum"
        step={SUM_STEP(l)}
        color="#8AB4F8"
        items={["افتح السلسلة الطويلة", <>اضغط {iso("Summarize this email")}</>, "تطلع لك الزبدة بنقاط فوق الرسايل"]}
        noteAt={170}
        note={<>الملخّص بدأ ينزل <b style={{ color: "#8AB4F8" }}>مجاناً</b> لحسابات Gmail تدريجياً… بشرط تكون «الميزات الذكية» مفعّلة بالإعدادات</>}
      />,
    );
  }
  if (inSeg(f, "ask")) {
    const l = lp(f, "ask");
    out.push(
      <Steps
        key="a"
        f={f}
        k="ask"
        step={ASK_STEP(l)}
        color="#C9B8FF"
        items={["اضغط شعار Gemini فوق", "اسأل عن بريدك بكلامك", "يجاوبك من رسايلك ويوريك المصدر"]}
        noteAt={200}
        note={<>سؤال البريد يحتاج اشتراك <b style={{ color: "#C9B8FF" }}>{iso("Google AI Pro")}</b>… أو {iso("Workspace")} للشركات</>}
      />,
    );
  }
  if (inSeg(f, "write")) {
    const l = lp(f, "write");
    out.push(
      <Steps
        key="w"
        f={f}
        k="write"
        step={WRITE_STEP(l)}
        color="#F6AEC0"
        items={[<>اضغط {iso("Help me write")}</>, "اكتب طلبك بجملة وحدة", "عدّله: رسمي، أطول، أقصر"]}
        noteAt={186}
        note={<>راجع المسودة قبل ترسل… <b style={{ color: "#F6AEC0" }}>Gemini ممكن يغلط</b>، والقرار الأخير لك</>}
      />,
    );
    const [px, py] = project(f, [PHONE_SIDE[0] + 1.6, PHONE_SIDE[1] + 2.3, PHONE_SIDE[2] + 0.4]);
    out.push(
      <Tag key="sent" x={px} y={py} p={ease(l, 262, 12, BACK) * outOf(f, "write")} bg="#fff" size={30}>
        أرسلتها أنت ✓
      </Tag>,
    );
  }
  if (inSeg(f, "docs")) {
    const l = lp(f, "docs");
    const o = outOf(f, "docs");
    const step = DOCS_STEP(l);
    const rows: [React.ReactNode, React.ReactNode, number][] = [
      [iso("Ask Gemini"), "ملخّص المستند باللوحة الجانبية", 60],
      ["ظلّل فقرة", "اختصرها، أعد صياغتها، أو حوّلها نقاط", 150],
      [iso("Help me write"), "مسودة كاملة من سطر واحد", 226],
    ];
    const act = l >= 226 ? 2 : step === 2 ? 1 : 0;
    out.push(
      <div key="d" style={{ position: "absolute", top: 1168, left: 56, right: 56, display: "flex", flexDirection: "column", gap: 12, direction: "rtl" }}>
        {rows.map(([a, b, at], i) => {
          const p = ease(l, at, 14, BACK) * o;
          const on = i === act;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 22px 15px", borderRadius: 18, background: on ? "#8AB4F8" : "rgba(8,10,30,.72)", color: on ? C.ink : "#fff", border: `2px solid ${on ? "#8AB4F8" : "rgba(255,255,255,.18)"}`, font: `700 31px/1.35 ${BODY}`, opacity: Math.min(1, p * 1.5), transform: `scale(${0.88 + 0.12 * p})` }}>
              <span style={{ whiteSpace: "nowrap" }}>{a}</span>
              <span style={{ opacity: 0.7 }}>←</span>
              <span>{b}</span>
            </div>
          );
        })}
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
      <div style={{ position: "absolute", top: 220, left: 0, right: 0, font: `700 88px/1.4 ${DISPLAY}`, color: "#fff", opacity: pt, transform: `translateY(${(1 - pt) * 30}px)`, textShadow: "0 6px 30px rgba(0,0,0,.6)" }}>
        خلّه يقرأ… وانت قرّر
        <div style={{ font: `700 40px/1.4 ${BODY}`, color: "#C9B8FF" }}>احفظ الفيديو وجرّبها على أول سلسلة طويلة</div>
      </div>
      <div style={{ position: "absolute", top: 1250, left: 0, right: 0, font: `700 84px/1.3 ${BODY}`, color: "#fff", opacity: pn, transform: `translateY(${(1 - pn) * 30}px)`, textShadow: "0 6px 30px rgba(0,0,0,.6)" }}>علي التميمي</div>
      <div style={{ position: "absolute", top: 1364, left: 0, right: 0, font: `700 34px/1.4 ${BODY}`, color: "rgba(255,255,255,.88)", opacity: pc }}>كل يوم أداة ذكاء اصطناعي تختصر شغلك</div>
      <div style={{ position: "absolute", top: 1425, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${ph})` }}>
        <div style={{ padding: "10px 32px", borderRadius: 999, background: C.grad }}>
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
export const Shade: React.FC = () => <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 620, background: "linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,0))" }} />;
