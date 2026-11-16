import React from "react";
import { Img, staticFile } from "remotion";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { BACK, BG, BODY, C, DISPLAY, EN, HAND, IN, IN_OUT, OUT, SEG, SegK, V, clamp01, ease, typed } from "./theme";

export const TAG = "Gamma · العروض التقديمية";
export const iso = (t: string, s?: React.CSSProperties) => <span style={{ direction: "ltr", unicodeBidi: "isolate", fontFamily: EN, fontWeight: 700, whiteSpace: "nowrap", ...s }}>{t}</span>;
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

/* ───── الخلفية ───── */
export const Backdrop: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  let c0 = BG.hook[0];
  let c1 = BG.hook[1];
  for (let i = 1; i < KEYS.length; i++) {
    const t = ease(f, SEG[KEYS[i]][0] - 15, 30, OUT);
    if (t <= 0) break;
    c0 = mixHex(BG[KEYS[i - 1]][0], BG[KEYS[i]][0], t);
    c1 = mixHex(BG[KEYS[i - 1]][1], BG[KEYS[i]][1], t);
  }
  const photo = (1 - ease(f, SEG.hook[1] - 50, 40, OUT)) * 0.55;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 50% at 50% 50%, ${c0} 0%, ${c1} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.35 + kick * 0.1, backgroundImage: "radial-gradient(rgba(22,19,31,.16) 2.5px, transparent 3px)", backgroundSize: "44px 44px" }} />
      {photo > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: photo, mixBlendMode: "multiply" }}>
          <Img src={V("bg.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 40%", transform: `scale(${1.5 + f * 0.0015})`, filter: "contrast(1.05) saturate(.9) blur(1.5px)" }} />
        </div>
      ) : null}
    </>
  );
};

/* ───── العناوين ───── */
type B = { k: SegK; chip: React.ReactNode; title: React.ReactNode; sub: React.ReactNode; color: string; fg?: string; lines?: number; size?: number };
const BLOCKS: B[] = [
  { k: "hook", chip: TAG, title: <>عرض كامل…<br />من فكرة وحدة</>, sub: <>في دقيقة، بدل ساعات من التنسيق</>, color: C.ink, fg: "#FFE15A", lines: 2, size: 112 },
  { k: "gen", chip: <>الطريقة 1 · {iso("Generate")}</>, title: "اكتب الفكرة بس", sub: <>{iso("Gamma")} تكتب وتصمّم البطاقات</>, color: C.vio, fg: "#fff", size: 108 },
  { k: "paste", chip: <>الطريقة 2 · {iso("Paste in text")}</>, title: "عندك نص جاهز؟", sub: "الصقه، وهي ترتّبه بطاقات", color: C.mint, fg: "#fff", size: 108 },
  { k: "imp", chip: <>الطريقة 3 · {iso("Import")}</>, title: "أو استورد ملفك", sub: "عرض قديم أو مستند أو جدول", color: C.cor, fg: "#fff", size: 108 },
  { k: "exp", chip: "الخطوة الأخيرة · التصدير", title: "عدّل وصدّر", sub: "بالصيغة اللي تحتاجها", color: C.ink, fg: "#FFE15A", size: 112 },
  { k: "sum", chip: "الخلاصة", title: "3 مداخل… ومخرج", sub: "", color: C.ink, fg: "#FFE15A", size: 108 },
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
      <div style={{ position: "absolute", top: 196, right: 80, padding: "6px 22px 10px", borderRadius: 999, background: b.color, color: b.fg ?? "#fff", font: `700 30px ${BODY}`, transform: `scale(${pc})`, transformOrigin: "right center", whiteSpace: "nowrap", boxShadow: "0 8px 22px rgba(22,19,31,.25)" }}>{b.chip}</div>
      <div style={{ position: "absolute", top: 256, right: 74, left: 20, overflow: "hidden", padding: "0 6px 12px" }}>
        <div style={{ font: `900 ${size}px/1.3 ${DISPLAY}`, color: C.ink, whiteSpace: "nowrap", transform: `translateY(${(1 - pt) * 110}%)` }}>{b.title}</div>
      </div>
      {b.sub ? <div style={{ position: "absolute", top: 256 + size * 1.3 * lines + 18, right: 80, left: 40, font: `700 38px/1.5 ${BODY}`, color: C.sub, opacity: ps, transform: `translateY(${(1 - ps) * 20}px)` }}>{b.sub}</div> : null}
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

/* ───── عناصر مشتركة ───── */
const shadow = "0 18px 40px rgba(22,19,31,.22)";
/** بطاقة شريحة مصغّرة. v: نوع المحتوى */
const Slide: React.FC<{ w: number; v: 0 | 1 | 2 | 3; c: string; style?: React.CSSProperties; title?: string }> = ({ w, v, c, style, title }) => {
  const h = (w * 9) / 16;
  const k = w / 300;
  return (
    <div style={{ width: w, height: h, borderRadius: 14 * k, background: "#fff", boxShadow: shadow, padding: 14 * k, overflow: "hidden", direction: "rtl", border: `${2 * k}px solid rgba(22,19,31,.08)`, ...style }}>
      <div style={{ height: 14 * k, width: (v === 0 ? 150 : 100) * k, borderRadius: 7 * k, background: c, marginBottom: 10 * k, marginLeft: "auto" }} />
      {title ? <div style={{ font: `900 ${22 * k}px/1.2 ${DISPLAY}`, color: C.ink }}>{title}</div> : null}
      {v === 0 ? (
        <>
          <div style={{ height: 10 * k, width: 210 * k, borderRadius: 5 * k, background: "#D9D5E3", marginTop: 12 * k, marginLeft: "auto" }} />
          <div style={{ height: 10 * k, width: 150 * k, borderRadius: 5 * k, background: "#D9D5E3", marginTop: 8 * k, marginLeft: "auto" }} />
        </>
      ) : null}
      {v === 1 ? [190, 160, 175].map((x, i) => (
        <div key={i} style={{ display: "flex", gap: 8 * k, alignItems: "center", marginTop: 9 * k, direction: "rtl" }}>
          <span style={{ width: 9 * k, height: 9 * k, borderRadius: "50%", background: c }} />
          <span style={{ height: 9 * k, width: x * k, borderRadius: 5 * k, background: "#D9D5E3" }} />
        </div>
      )) : null}
      {v === 2 ? (
        <div style={{ display: "flex", gap: 8 * k, alignItems: "flex-end", height: 70 * k, marginTop: 8 * k, direction: "ltr" }}>
          {[34, 52, 40, 64].map((x, i) => <span key={i} style={{ width: 28 * k, height: x * k, borderRadius: 5 * k, background: i === 3 ? c : "#D9D5E3" }} />)}
        </div>
      ) : null}
      {v === 3 ? (
        <div style={{ display: "flex", gap: 10 * k, marginTop: 8 * k }}>
          <span style={{ width: 96 * k, height: 70 * k, borderRadius: 8 * k, background: c, opacity: 0.85 }} />
          <div style={{ flex: 1 }}>
            {[1, 2, 3].map((i) => <div key={i} style={{ height: 9 * k, borderRadius: 5 * k, background: "#D9D5E3", marginTop: 9 * k, width: (110 - i * 14) * k, marginLeft: "auto" }} />)}
          </div>
        </div>
      ) : null}
    </div>
  );
};
const Badge: React.FC<{ n: number | string; p: number; color?: string; style?: React.CSSProperties }> = ({ n, p, color = C.ink, style }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", width: 56, height: 56, borderRadius: 28, background: color, color: "#fff", display: "grid", placeItems: "center", font: `800 30px ${EN}`, transform: `scale(${p})`, boxShadow: "0 8px 20px rgba(22,19,31,.3)", ...style }}>{n}</div>
  );
const Tag: React.FC<{ p: number; bg: string; fg?: string; top: number; right?: number; left?: number; size?: number; children: React.ReactNode }> = ({ p, bg, fg = "#fff", top, right, left, size = 30, children }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", top, right, left, padding: "7px 22px 11px", borderRadius: 16, background: bg, color: fg, font: `700 ${size}px ${BODY}`, whiteSpace: "nowrap", direction: "rtl", transform: `scale(${p})`, transformOrigin: right !== undefined ? "right center" : "left center", boxShadow: "0 10px 26px rgba(22,19,31,.28)" }}>{children}</div>
  );
const Note: React.FC<{ p: number; color: string; top: number; children: React.ReactNode; size?: number }> = ({ p, color, top, children, size = 30 }) =>
  p <= 0 ? null : (
    <div style={{ position: "absolute", top, left: 56, right: 56, padding: "16px 26px 20px", borderRadius: 22, background: "rgba(255,255,255,.92)", border: `3px solid ${color}`, color: C.ink, font: `700 ${size}px/1.45 ${BODY}`, direction: "rtl", opacity: p, transform: `translateY(${(1 - p) * 26}px)`, boxShadow: "0 12px 28px rgba(22,19,31,.15)" }}>{children}</div>
  );
const Sticky: React.FC<{ w: number; rot: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ w, rot, children, style }) => (
  <div style={{ width: w, height: w, background: "linear-gradient(160deg,#FFE96E 0%,#FFD93D 100%)", transform: `rotate(${rot}deg)`, boxShadow: "0 30px 50px rgba(120,90,0,.35), inset 0 -40px 60px rgba(255,170,0,.25)", padding: w * 0.1, direction: "rtl", position: "relative", ...style }}>
    <div style={{ position: "absolute", top: 0, left: "50%", marginLeft: -w * 0.18, width: w * 0.36, height: w * 0.08, background: "rgba(255,255,255,.35)", transform: "translateY(-50%)" }} />
    {children}
  </div>
);
const Btn: React.FC<{ text: string; color: string; press: number; w?: number }> = ({ text, color, press, w = 400 }) => (
  <div style={{ width: w, padding: "16px 0 22px", borderRadius: 24, background: color, color: "#fff", textAlign: "center", font: `800 44px ${EN}`, direction: "ltr", boxShadow: `0 ${14 - 10 * press}px 0 rgba(22,19,31,.25)`, transform: `translateY(${10 * press}px) scale(${1 - 0.03 * press})` }}>{text}</div>
);
const Chip: React.FC<{ children: React.ReactNode; bg: string; fg?: string; style?: React.CSSProperties }> = ({ children, bg, fg = C.ink, style }) => (
  <div style={{ padding: "8px 22px 12px", borderRadius: 18, background: bg, color: fg, font: `700 30px ${BODY}`, whiteSpace: "nowrap", boxShadow: "0 8px 20px rgba(22,19,31,.18)", ...style }}>{children}</div>
);

/* ───── المشاهد ───── */
const Hook: React.FC<{ f: number }> = ({ f }) => {
  const l = f;
  const o = outOf(f, "hook");
  const note = ease(l, 6, 24, BACK);
  const move = ease(l, 96, 28, IN_OUT);
  const t1 = typed("عندي فكرة…", l, 18, 22);
  const t2 = typed("وما عندي عرض!", l, 44, 28);
  const fan = ease(l, 104, 30, BACK);
  const stamp = ease(l, 150, 16, BACK);
  const cards: [number, 0 | 1 | 2 | 3, string][] = [[-26, 0, C.vio], [-13, 1, C.cor], [0, 2, C.mint], [13, 3, C.vio], [26, 0, C.cor]];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <Tag p={ease(l, 60, 16, BACK) * (1 - move * 0.0)} bg={C.cor} top={660} right={80} size={32}>الاجتماع بعد ساعة ⏰</Tag>
      {cards.map(([rot, v, c], i) => (
        <div key={i} style={{ position: "absolute", left: 540 - 190, top: 900 - 110 + 60, transform: `translate(${(i - 2) * 56 * fan}px, ${-Math.abs(i - 2) * 14 * fan}px) rotate(${rot * fan}deg) scale(${fan})`, transformOrigin: "50% 120%", opacity: fan, zIndex: i }}>
          <Slide w={380} v={v} c={c} title={["البداية", "المشكلة", "الأرقام", "الحل", "الخطوة"][i]} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 540 - 270, top: 760, transform: `translate(${move * 0}px, ${move * 280}px) scale(${note * (1 - move * 0.4)}) rotate(${-4 + move * 4}deg)`, transformOrigin: "50% 50%", zIndex: 10, opacity: 1 - move * 0.0 }}>
        <Sticky w={540} rot={0}>
          <div style={{ font: `700 78px/1.35 ${HAND}`, color: C.ink, minHeight: 220 }}>{t1}<br />{t2}</div>
        </Sticky>
      </div>
      <Tag p={stamp} bg={C.mint} top={1330} left={90} size={36}>عرض كامل ✓</Tag>
    </div>
  );
};

const Gen: React.FC<{ f: number }> = ({ f }) => {
  const l = lp(f, "gen");
  const o = outOf(f, "gen");
  const press = ease(l, 150, 8, OUT) * (1 - ease(l, 160, 12, OUT));
  const grid = ease(l, 166, 24, BACK);
  const th = ease(l, 96, 16, BACK);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", top: 650, right: 80, left: 80, padding: "16px 28px 20px", background: "#fff", borderRadius: 30, boxShadow: shadow, direction: "rtl", border: `3px solid ${C.vio}`, transform: `scale(${0.9 + 0.1 * ease(l, 4, 18, BACK)})`, opacity: ease(l, 4, 14) }}>
        <div style={{ font: `700 26px ${BODY}`, color: C.sub }}>الفكرة</div>
        <div style={{ font: `800 46px/1.4 ${BODY}`, color: C.ink, minHeight: 66 }}>{typed("عرض عن خطة التسويق للربع القادم", l, 20, 70)}<span style={{ opacity: Math.floor(l / 8) % 2 ? 0 : 1, color: C.vio }}>|</span></div>
      </div>
      <Badge n={1} p={ease(l, 14, 14, BACK)} color={C.vio} style={{ top: 628, right: 56 }} />
      <div style={{ position: "absolute", top: 800, right: 80, left: 80, display: "flex", gap: 20, direction: "rtl", opacity: th }}>
        <div style={{ flex: 1, background: "#fff", borderRadius: 24, padding: "14px 22px 18px", boxShadow: shadow }}>
          <div style={{ font: `700 26px ${BODY}`, color: C.sub }}>الثيم</div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            {[C.vio, C.cor, C.mint, "#FFB703"].map((c, i) => <span key={i} style={{ width: 44, height: 44, borderRadius: 22, background: c, boxShadow: i === 0 ? `0 0 0 5px #fff, 0 0 0 9px ${C.vio}` : "none" }} />)}
          </div>
        </div>
        <div style={{ flex: 1, background: "#fff", borderRadius: 24, padding: "14px 22px 18px", boxShadow: shadow }}>
          <div style={{ font: `700 26px ${BODY}`, color: C.sub }}>عدد البطاقات</div>
          <div style={{ font: `800 44px ${EN}`, color: C.ink, direction: "ltr", marginTop: 4 }}>− 10 +</div>
        </div>
      </div>
      <Badge n={2} p={ease(l, 100, 14, BACK)} color={C.vio} style={{ top: 780, right: 56 }} />
      <div style={{ position: "absolute", top: 946, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: ease(l, 120, 14) }}>
        <Btn text="Generate" color={C.vio} press={press} />
      </div>
      <Badge n={3} p={ease(l, 124, 14, BACK)} color={C.vio} style={{ top: 946, right: 130 }} />
      <div style={{ position: "absolute", top: 1085, left: 80, right: 80, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, direction: "rtl", justifyItems: "center" }}>
        {([0, 1, 2, 3, 2, 1] as (0 | 1 | 2 | 3)[]).map((v, i) => {
          const p = ease(l, 170 + i * 8, 16, BACK) * grid;
          return <div key={i} style={{ opacity: Math.min(1, p * 1.5), transform: `scale(${0.7 + 0.3 * p})` }}><Slide w={250} v={v} c={[C.vio, C.cor, C.mint][i % 3]} /></div>;
        })}
      </div>
      <Note p={ease(l, 220, 16, OUT) * (1 - ease(l, 270, 10))} color={C.vio} top={1408} size={26}>
        هي تقترح الهيكل والنص والتصميم · واجهة توضيحية
      </Note>
    </div>
  );
};

const Paste: React.FC<{ f: number }> = ({ f }) => {
  const l = lp(f, "paste");
  const o = outOf(f, "paste");
  const sw = ease(l, 160, 14, IN_OUT);
  const arr = ease(l, 70, 16, OUT);
  const cards = ease(l, 82, 26, BACK);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", top: 650, right: 80, width: 420, height: 590, background: "#fff", borderRadius: 26, boxShadow: shadow, padding: 24, direction: "rtl", transform: `scale(${0.9 + 0.1 * ease(l, 4, 18, BACK)})`, opacity: ease(l, 4, 14) }}>
        <div style={{ font: `700 26px ${BODY}`, color: C.sub, marginBottom: 14 }}>نص ملصوق</div>
        {[360, 300, 340, 220, 350, 280, 320, 200, 340, 260].map((x, i) => (
          <div key={i} style={{ height: 14, width: x * ease(l, 14 + i * 3, 10), borderRadius: 7, background: i % 4 === 0 ? "#BDB2F7" : "#D9D5E3", margin: "0 0 16px auto" }} />
        ))}
      </div>
      <Badge n={1} p={ease(l, 14, 14, BACK)} color={C.mint} style={{ top: 628, right: 56 }} />
      <div style={{ position: "absolute", top: 880, left: 530 - 60, width: 0, opacity: arr, font: `900 90px ${DISPLAY}`, color: C.mint, transform: `translateX(${(1 - arr) * 30}px)` }}>←</div>
      <div style={{ position: "absolute", top: 650, left: 70, width: 340, direction: "rtl" }}>
        {([0, 1, 2] as const).map((i) => (
          <div key={i} style={{ marginBottom: 16, opacity: Math.min(1, cards * 1.6 - i * 0.2), transform: `translateY(${(1 - cards) * 30 * (i + 1)}px)` }}>
            <Slide w={340} v={([1, 2, 3] as const)[i]} c={[C.mint, C.vio, C.cor][i]} title={["الهدف", "الأرقام", "الخطوات"][i]} />
          </div>
        ))}
      </div>
      <Badge n={2} p={ease(l, 90, 14, BACK)} color={C.mint} style={{ top: 628, left: 44 }} />
      <div style={{ position: "absolute", top: 1262, right: 80, left: 80, padding: "14px 30px 18px", background: "#fff", borderRadius: 26, boxShadow: shadow, display: "flex", alignItems: "center", gap: 22, direction: "rtl", opacity: ease(l, 136, 16), transform: `translateY(${(1 - ease(l, 136, 16)) * 24}px)` }}>
        <div style={{ width: 100, height: 54, borderRadius: 27, background: sw > 0.5 ? C.mint : "#CFC9DD", position: "relative", flex: "none" }}>
          <div style={{ position: "absolute", top: 5, right: 5 + sw * 46, width: 44, height: 44, borderRadius: 22, background: "#fff", boxShadow: "0 3px 8px rgba(0,0,0,.25)" }} />
        </div>
        <div style={{ font: `800 32px/1.4 ${BODY}`, color: C.ink }}>{iso("Preserve this exact text")}<br /><span style={{ font: `600 26px ${BODY}`, color: C.sub }}>تبي كلامك يبقى زي ما هو؟</span></div>
      </div>
      <Note p={ease(l, 210, 16, OUT) * (1 - ease(l, 270, 10))} color={C.mint} top={1398} size={26}>
        بدون الخيار، هي تعيد صياغة النص وتنظّمه · واجهة توضيحية
      </Note>
    </div>
  );
};

const Imp: React.FC<{ f: number }> = ({ f }) => {
  const l = lp(f, "imp");
  const o = outOf(f, "imp");
  const files: [string, string][] = [["PPTX", "#D24726"], ["DOCX", "#2B579A"], ["PDF", "#E5252A"]];
  const press = ease(l, 120, 8, OUT) * (1 - ease(l, 130, 12, OUT));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", top: 650, right: 80, left: 80, display: "flex", gap: 24, direction: "ltr", justifyContent: "center" }}>
        {files.map(([t, c], i) => {
          const p = ease(l, 8 + i * 14, 18, BACK);
          const fly = ease(l, 120 + i * 6, 30, IN_OUT);
          return (
            <div key={t} style={{ width: 250, height: 300, borderRadius: 26, background: "#fff", boxShadow: shadow, position: "relative", transform: `translateY(${fly * 210}px) scale(${(0.6 + 0.4 * p) * (1 - fly * 0.45)})`, opacity: p * (1 - fly) }}>
              <div style={{ position: "absolute", top: 26, left: 26, right: 26, height: 150, borderRadius: 16, background: c, display: "grid", placeItems: "center", font: `800 56px ${EN}`, color: "#fff" }}>{t}</div>
              {[170, 130].map((x, j) => <div key={j} style={{ position: "absolute", top: 206 + j * 30, left: 26, width: x, height: 12, borderRadius: 6, background: "#D9D5E3" }} />)}
            </div>
          );
        })}
      </div>
      <Badge n={1} p={ease(l, 8, 14, BACK)} color={C.cor} style={{ top: 636, right: 56 }} />
      <div style={{ position: "absolute", top: 990, right: 80, left: 80, display: "flex", gap: 14, justifyContent: "center", direction: "ltr", opacity: ease(l, 52, 16) }}>
        {["XLSX", "CSV", "🔗 Link"].map((t) => <Chip key={t} bg="#fff" style={{ font: `700 32px ${EN}` }}>{t}</Chip>)}
      </div>
      <div style={{ position: "absolute", top: 1090, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: ease(l, 96, 14) }}>
        <Btn text="Import" color={C.cor} press={press} w={360} />
      </div>
      <Badge n={2} p={ease(l, 100, 14, BACK)} color={C.cor} style={{ top: 1086, right: 150 }} />
      <div style={{ position: "absolute", top: 1010, left: 100, opacity: ease(l, 150, 20) * (1 - 0) }} />
      <div style={{ position: "absolute", top: 1230, left: 80, right: 80, display: "flex", gap: 16, justifyContent: "center", opacity: ease(l, 150, 18) }}>
        {([0, 1, 2, 3] as const).map((v, i) => <Slide key={i} w={225} v={v} c={[C.cor, C.vio, C.mint, C.cor][i]} style={{ transform: `translateY(${(1 - ease(l, 152 + i * 8, 16, BACK)) * 40}px)` }} />)}
      </div>
      <Note p={ease(l, 215, 16, OUT) * (1 - ease(l, 270, 10))} color={C.cor} top={1370} size={26}>
        من صفحة المساعدة: المولّد الكلاسيكي يستورد <b>النص</b> بس، مو تصميم الملف
      </Note>
    </div>
  );
};

const Exp: React.FC<{ f: number }> = ({ f }) => {
  const l = lp(f, "exp");
  const o = outOf(f, "exp");
  const menu = ease(l, 40, 20, BACK);
  const rows: [string, string, string][] = [["PDF", "ملف جاهز للمشاركة", "#E5252A"], ["PNG", "صورة لكل شريحة", "#1FB98A"], ["PowerPoint", "ملف PPTX قابل للتعديل", "#D24726"], ["Google Slides", "عبر ملف PPTX تفتحه هناك", "#F4B400"]];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", top: 660, right: 80, transform: `scale(${0.9 + 0.1 * ease(l, 4, 18, BACK)})`, opacity: ease(l, 4, 14), transformOrigin: "right top" }}>
        <Slide w={430} v={2} c={C.vio} title="خطة التسويق" />
      </div>
      <div style={{ position: "absolute", top: 640, left: 70, width: 430, display: "flex", flexDirection: "column", gap: 12, transform: `scale(${0.85 + 0.15 * menu})`, opacity: menu, transformOrigin: "left top", direction: "rtl" }}>
        <Chip bg={C.ink} fg="#FFE15A" style={{ font: `800 34px ${EN}` }}>Export</Chip>
        {rows.map(([t, s, c], i) => (
          <div key={t} style={{ display: "flex", gap: 14, alignItems: "center", background: "#fff", borderRadius: 22, padding: "10px 18px 14px", boxShadow: shadow, opacity: ease(l, 52 + i * 14, 12), transform: `translateX(${(1 - ease(l, 52 + i * 14, 14, BACK)) * 30}px)` }}>
            <span style={{ width: 16, height: 56, borderRadius: 8, background: c, flex: "none" }} />
            <div><div style={{ font: `800 32px ${EN}`, color: C.ink, direction: "ltr", textAlign: "right" }}>{t}</div><div style={{ font: `600 24px ${BODY}`, color: C.sub }}>{s}</div></div>
          </div>
        ))}
      </div>
      <Badge n={1} p={ease(l, 14, 14, BACK)} color={C.ink} style={{ top: 640, right: 40 }} />
      <Badge n={2} p={ease(l, 48, 14, BACK)} color={C.ink} style={{ top: 628, left: 40 }} />
      <Tag p={ease(l, 150, 16, BACK)} bg={C.cor} top={1210} right={80} size={30}>الباقة المجانية: علامة «Made with Gamma»</Tag>
      <Note p={ease(l, 190, 16, OUT)} color={C.ink} top={1310} size={27}>
        التصدير كامل العرض أو شرائح محددة · وعلامة Gamma تنشال في الباقات المدفوعة
      </Note>
    </div>
  );
};

const Sum: React.FC<{ f: number }> = ({ f }) => {
  const l = lp(f, "sum");
  const o = outOf(f, "sum");
  const rows: [string, string, string][] = [["1", "Generate", "اكتب الفكرة"], ["2", "Paste in text", "الصق نصك"], ["3", "Import", "استورد ملفك"]];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", top: 640, right: 80, left: 80, display: "flex", flexDirection: "column", gap: 16, direction: "rtl" }}>
        {rows.map(([n, e, a], i) => {
          const p = ease(l, 8 + i * 16, 14, BACK);
          return (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 22, background: "#fff", borderRadius: 26, padding: "14px 26px 18px", boxShadow: shadow, opacity: Math.min(1, p * 1.5), transform: `scale(${0.88 + 0.12 * p})` }}>
              <span style={{ width: 60, height: 60, borderRadius: 30, background: [C.vio, C.mint, C.cor][i], color: "#fff", display: "grid", placeItems: "center", font: `800 34px ${EN}` }}>{n}</span>
              <span style={{ font: `800 40px ${EN}`, direction: "ltr", color: C.ink }}>{e}</span>
              <span style={{ font: `700 32px ${BODY}`, color: C.sub, marginRight: "auto" }}>{a}</span>
            </div>
          );
        })}
        <div style={{ textAlign: "center", font: `900 60px ${DISPLAY}`, color: C.ink, opacity: ease(l, 60, 14), marginTop: 6 }}>↓</div>
        <div style={{ background: C.ink, color: "#FFE15A", borderRadius: 26, padding: "16px 26px 22px", font: `800 42px/1.4 ${BODY}`, textAlign: "center", opacity: ease(l, 70, 14, BACK), transform: `scale(${0.9 + 0.1 * ease(l, 70, 14, BACK)})` }}>عدّل وصدّر: PDF · PNG · PowerPoint</div>
      </div>
    </div>
  );
};

export const Labels: React.FC<{ f: number }> = ({ f }) => (
  <>
    {inSeg(f, "hook") ? <Hook f={f} /> : null}
    {inSeg(f, "gen") ? <Gen f={f} /> : null}
    {inSeg(f, "paste") ? <Paste f={f} /> : null}
    {inSeg(f, "imp") ? <Imp f={f} /> : null}
    {inSeg(f, "exp") ? <Exp f={f} /> : null}
    {inSeg(f, "sum") ? <Sum f={f} /> : null}
  </>
);

/* ───── الختام ───── */
export const End: React.FC<{ f: number }> = ({ f }) => {
  const [a] = SEG.end;
  if (f < a + 6) return null;
  const pt = ease(f, a + 12, 18, OUT);
  const pa = ease(f, a + 28, 22, BACK);
  const pn = ease(f, a + 50, 18, OUT);
  const pc = ease(f, a + 64, 18, OUT);
  const ph = ease(f, a + 78, 18, BACK);
  return (
    <div style={{ position: "absolute", inset: 0, direction: "rtl", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 200, left: 0, right: 0, font: `900 88px/1.3 ${DISPLAY}`, color: C.ink, opacity: pt, transform: `translateY(${(1 - pt) * 30}px)` }}>
        العرض الجاي…
        <br />
        <span style={{ background: C.ink, color: "#FFE15A", padding: "0 24px 8px", borderRadius: 20, display: "inline-block" }}>من فكرة وحدة</span>
        <div style={{ font: `700 38px/1.4 ${BODY}`, color: C.sub, marginTop: 10 }}>أرسلها لزميلك اللي عنده اجتماع</div>
      </div>
      <div style={{ position: "absolute", top: 720, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${pa}) rotate(${(1 - pa) * -8}deg)` }}>
        <Sticky w={470} rot={-3} style={{ padding: 0, display: "grid", placeItems: "center" }}>
          <div style={{ width: 340, height: 340, borderRadius: "50%", overflow: "hidden", background: C.ink, border: `8px solid ${C.ink}` }}>
            <Img src={staticFile("avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%" }} />
          </div>
        </Sticky>
      </div>
      <div style={{ position: "absolute", top: 1290, left: 0, right: 0, font: `900 84px/1.3 ${DISPLAY}`, color: C.ink, opacity: pn, transform: `translateY(${(1 - pn) * 30}px)` }}>علي التميمي</div>
      <div style={{ position: "absolute", top: 1400, left: 0, right: 0, font: `700 34px/1.4 ${BODY}`, color: C.sub, opacity: pc }}>كل يوم معلومة تقنية تهمّك</div>
      <div style={{ position: "absolute", top: 1462, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${ph})` }}>
        <div style={{ padding: "10px 32px", borderRadius: 999, background: C.ink }}>
          <HandlesRow size={30} color="#FFE15A" />
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
      <div style={{ padding: "8px 24px", borderRadius: 999, background: "rgba(22,19,31,.9)" }}>
        <HandlesRow size={26} color="#FFE15A" />
      </div>
    </div>
  );
};
export { clamp01 };
