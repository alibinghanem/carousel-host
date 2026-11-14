import React from "react";
import { Img, staticFile } from "remotion";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { BACK, C, CANDS, DISPLAY, ELIM, EN, IN, IN_OUT, OUT, SEG, SegK, V, WIN_AT, BODY, ease } from "./theme";

export const TAG = "مؤسسات · اختيار الأداة";
const iso = (t: string) => <span style={{ direction: "ltr", unicodeBidi: "isolate", fontFamily: EN, fontWeight: 700, whiteSpace: "nowrap" }}>{t}</span>;
const lp = (f: number, k: SegK) => f - SEG[k][0];
const inSeg = (f: number, k: SegK) => f >= SEG[k][0] - 2 && f < SEG[k][1] + 2;
const outOf = (f: number, k: SegK) => 1 - ease(f, SEG[k][1] - 12, 10, OUT);

/* ───── الخلفية: ورق كريمي بنقش خفيف، وصورة فريق حقيقية في الهوك ───── */
export const Backdrop: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const photo = 1 - ease(f, 170, 40, OUT);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 50% at 50% 50%, ${C.bg} 0%, ${C.bg2} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${C.line} 2.5px, transparent 2.5px)`, backgroundSize: "54px 54px", opacity: 0.55 }} />
      <div style={{ position: "absolute", left: -200, right: -200, top: 700, height: 600, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(108,76,245,${0.1 + kick * 0.05}), rgba(108,76,245,0))` }} />
      {photo > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: photo }}>
          <Img src={V("team.jpg")} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1080, width: "100%", objectFit: "cover", objectPosition: "50% 55%", transform: `scale(${1.08 + f * 0.0006})`, transformOrigin: "50% 80%" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${C.bg} 0%, ${C.bg} 28%, rgba(246,242,234,.55) 46%, rgba(246,242,234,0) 70%)` }} />
        </div>
      ) : null}
    </>
  );
};

/* ───── العناوين ───── */
type B = { k: SegK; chip: React.ReactNode; title: React.ReactNode; sub: React.ReactNode; color: string; lines?: number; size?: number };
const BLOCKS: B[] = [
  { k: "hook", chip: TAG, title: <>أي أداة ذكاء اصطناعي<br />تختار لشركتك؟</>, sub: "مو بالأشهر… ولا بالأرخص", color: C.violet, lines: 2, size: 80 },
  { k: "g1", chip: "البوابة ١ · تُقصي", title: "يتصل بأنظمتك؟", sub: "أفضل أداة ما تنفع لو ما تشتغل مع بريدك وملفاتك", color: C.violet, size: 96 },
  { k: "g2", chip: "البوابة ٢ · تُقصي", title: "وين تروح بياناتك؟", sub: "اسأل قبل ما ترفع أي ملف للشركة", color: C.violet, size: 96 },
  { k: "g3", chip: "البوابة ٣ · تُفاضل", title: "احسبه صح", sub: "لكل مستخدم فعلي… مو لكل مقعد", color: C.violet, size: 104 },
  { k: "g4", chip: "البوابة ٤ · تُفاضل", title: "كم يحتاج فريقك؟", sub: "أداة ممتازة ما يستخدمها أحد = صفر", color: C.violet, size: 98 },
  { k: "verdict", chip: "الخطوة الأخيرة", title: "جرّبها قبل ما تشتري", sub: "تجربة صغيرة تحسم القرار", color: C.mint, size: 90 },
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
      <div style={{ position: "absolute", top: 196, right: 80, padding: "6px 22px 10px", borderRadius: 999, background: b.color, color: "#fff", font: `700 30px ${BODY}`, transform: `scale(${pc})`, transformOrigin: "right center", whiteSpace: "nowrap", boxShadow: `0 8px 24px ${b.color}55` }}>{b.chip}</div>
      <div style={{ position: "absolute", top: 256, right: 74, left: 20, overflow: "hidden", padding: "0 6px 10px" }}>
        <div style={{ font: `900 ${size}px/1.42 ${DISPLAY}`, color: C.ink, whiteSpace: "nowrap", transform: `translateY(${(1 - pt) * 110}%)` }}>{b.title}</div>
      </div>
      <div style={{ position: "absolute", top: 256 + size * 1.42 * lines + 14, right: 80, left: 40, font: `700 36px/1.5 ${BODY}`, color: C.mu, opacity: ps, transform: `translateY(${(1 - ps) * 20}px)` }}>{b.sub}</div>
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

/* ───── شريط البوابات الأربع ───── */
const GATES = ["التكامل", "الأمان", "السعر", "التعلّم"];
const Strip: React.FC<{ top: number; active: number; p: number; labels?: boolean }> = ({ top, active, p, labels }) => (
  <div style={{ position: "absolute", top, left: 0, right: 0, direction: "rtl", opacity: p }}>
    {GATES.map((g, i) => {
      const left = 796 - 244 * i;
      const done = i + 1 < active;
      const on = i + 1 === active;
      return (
        <div key={g} style={{ position: "absolute", left, top: 0, width: 220, height: 64, borderRadius: 32, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, font: `700 30px ${BODY}`, background: on ? C.violet : done ? C.mint : "#fff", color: on || done ? "#fff" : C.mu, border: `3px solid ${on ? C.violet : done ? C.mint : C.line}`, boxShadow: on ? `0 8px 22px ${C.violet}66` : "none", transform: `scale(${on ? 1.06 : 1})` }}>
          <span style={{ fontFamily: EN, fontSize: 28 }}>{done ? "✓" : i + 1}</span>
          {g}
        </div>
      );
    })}
    {labels ? (
      <>
        <div style={{ position: "absolute", left: 552, top: -50, width: 464, textAlign: "center", font: `700 28px ${BODY}`, color: C.red }}>تُقصي مباشرة</div>
        <div style={{ position: "absolute", left: 64, top: -50, width: 464, textAlign: "center", font: `700 28px ${BODY}`, color: C.mu }}>تُفاضل بين الباقي</div>
      </>
    ) : null}
  </div>
);

/* ───── المرشحون ───── */
const CX = (i: number) => 940 - i * 190;
const CARD_TOP = 640;
const Cands: React.FC<{ gate: number; l: number }> = ({ gate, l }) => (
  <>
    {CANDS.map((c, i) => {
      const el = ELIM[c.k];
      const dead = el !== undefined && (el[0] < gate || (el[0] === gate && l >= el[1]));
      const since = el && el[0] === gate ? l - el[1] : -1;
      const shake = since >= 0 && since < 18 ? Math.sin(since * 2.2) * 8 * (1 - since / 18) : 0;
      const p = gate === 1 ? ease(l, 24 + i * 7, 16, BACK) : ease(l, 0, 12);
      const win = gate === 4 && c.k === "A" && l >= WIN_AT;
      const wp = win ? ease(l, WIN_AT, 16, BACK) : 0;
      return (
        <div key={c.k} style={{ position: "absolute", left: CX(i) - 75 + shake, top: CARD_TOP, width: 150, height: 170, borderRadius: 28, background: dead ? "#E7E1D2" : "#fff", border: `4px solid ${dead ? "#CFC7B3" : win ? C.mint : c.color}`, boxShadow: dead ? "none" : `0 14px 30px ${win ? C.mint : c.color}44`, transform: `scale(${(0.6 + 0.4 * p) * (1 + wp * 0.08)})`, opacity: p, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: dead ? "#BDB5A0" : c.color, color: "#fff", display: "grid", placeItems: "center", font: `900 44px ${EN}` }}>{c.k}</div>
          <div style={{ font: `700 28px ${BODY}`, color: dead ? "#9A927D" : C.ink }}>أداة</div>
          {dead ? <div style={{ position: "absolute", top: -18, left: -18, width: 50, height: 50, borderRadius: "50%", background: C.red, color: "#fff", display: "grid", placeItems: "center", font: `700 32px ${EN}`, transform: `scale(${ease(since < 0 ? 99 : since, 0, 10, BACK)})` }}>✕</div> : null}
          {win ? <div style={{ position: "absolute", top: -22, left: 50, width: 50, height: 50, borderRadius: "50%", background: C.mint, color: "#fff", display: "grid", placeItems: "center", font: `700 32px ${EN}`, transform: `scale(${wp})` }}>✓</div> : null}
        </div>
      );
    })}
  </>
);

/* ───── مشاهد الرسم ───── */
const sysTiles = [
  { t: "البريد", c: "#2E86DE", g: <path d="M6 10h36v28H6zM6 12l18 14 18-14" fill="none" stroke="#fff" strokeWidth="4" strokeLinejoin="round" /> },
  { t: "التقويم", c: "#F5A524", g: <><rect x="8" y="12" width="32" height="28" rx="4" fill="none" stroke="#fff" strokeWidth="4" /><path d="M8 22h32M16 8v8M32 8v8" stroke="#fff" strokeWidth="4" /></> },
  { t: "المستندات", c: "#12A5A5", g: <path d="M12 6h18l8 8v28H12zM30 6v10h8M18 26h14M18 34h14" fill="none" stroke="#fff" strokeWidth="4" strokeLinejoin="round" /> },
  { t: "CRM", c: "#E5589B", g: <><circle cx="24" cy="18" r="8" fill="none" stroke="#fff" strokeWidth="4" /><path d="M8 40c2-10 30-10 32 0" fill="none" stroke="#fff" strokeWidth="4" /></> },
];
const TL = [785, 555, 325, 95];
const LINKS: Record<string, number[]> = { A: [0, 2], B: [1, 3], D: [0, 3] };
const Gate1: React.FC<{ l: number }> = ({ l }) => (
  <>
    <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0 }}>
      {CANDS.map((c, i) => {
        const x0 = CX(i);
        const y0 = CARD_TOP + 170;
        const ok = LINKS[c.k];
        const d = ease(l, 60 + i * 8, 44, IN_OUT);
        if (ok)
          return ok.map((t) => {
            const x1 = TL[t] + 100;
            const y1 = 920;
            const px = x0 + (x1 - x0) * Math.min(1, d);
            const py = y0 + (y1 - y0) * Math.min(1, d);
            const q = ((l - 110 + i * 9) % 60) / 60;
            return (
              <g key={`${c.k}${t}`}>
                <line x1={x0} y1={y0} x2={px} y2={py} stroke={C.mint} strokeWidth={5} strokeLinecap="round" />
                {d >= 1 && q >= 0 ? <circle cx={x0 + (x1 - x0) * q} cy={y0 + (y1 - y0) * q} r={7} fill="#fff" stroke={C.mint} strokeWidth={4} /> : null}
              </g>
            );
          });
        const px = x0 + (x0 > 540 ? -18 : 18) * Math.min(1, d);
        const py = y0 + 70 * Math.min(1, d);
        return (
          <g key={c.k}>
            <line x1={x0} y1={y0} x2={px} y2={py} stroke={C.red} strokeWidth={5} strokeDasharray="10 10" strokeLinecap="round" />
            {d >= 1 ? <text x={px} y={py + 34} textAnchor="middle" fontSize={34} fontWeight={700} fill={C.red} fontFamily="Space Grotesk">✕</text> : null}
          </g>
        );
      })}
    </svg>
    {sysTiles.map((s, i) => {
      const p = ease(l, 36 + i * 8, 14, BACK);
      return (
        <div key={s.t} style={{ position: "absolute", left: TL[i], top: 920, width: 200, height: 150, borderRadius: 26, background: "#fff", border: `3px solid ${C.line}`, boxShadow: "0 10px 24px rgba(20,18,31,.1)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, transform: `scale(${p})`, opacity: p }}>
          <div style={{ width: 66, height: 66, borderRadius: 18, background: s.c, display: "grid", placeItems: "center" }}>
            <svg width="44" height="44" viewBox="0 0 48 48">{s.g}</svg>
          </div>
          <div style={{ font: `700 28px ${BODY}`, color: C.ink, direction: "rtl" }}>{s.t}</div>
        </div>
      );
    })}
    <div style={{ position: "absolute", left: 0, right: 0, top: 1090, textAlign: "center", font: `700 28px ${BODY}`, color: C.mu, opacity: ease(l, 80, 14) }}>أنظمتك اليوم (أمثلة)</div>
  </>
);

const Shield: React.FC<{ s: number }> = ({ s }) => (
  <svg width="300" height="360" viewBox="-150 -170 300 360" style={{ transform: `scale(${s})` }}>
    <defs>
      <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#8A6BFF" />
        <stop offset="1" stopColor="#4B2FD0" />
      </linearGradient>
    </defs>
    <path d="M0,-150 L120,-100 V10 C120,90 60,140 0,170 C-60,140 -120,90 -120,10 V-100 Z" fill="url(#sg)" stroke="#fff" strokeWidth="8" />
    <rect x="-46" y="-6" width="92" height="74" rx="14" fill="#fff" />
    <path d="M-28,-6 v-26 a28,28 0 0 1 56,0 v26" fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="round" />
    <circle cx="0" cy="26" r="9" fill="#4B2FD0" />
  </svg>
);
const CHECKS = ["بياناتنا تُستخدم للتدريب؟", "دخول موحّد (SSO) وصلاحيات؟", "سجل نشاط (Audit log)؟"];
const Gate2: React.FC<{ l: number }> = ({ l }) => (
  <>
    <div style={{ position: "absolute", left: 40, top: 840, width: 330, display: "flex", justifyContent: "center" }}>
      <Shield s={ease(l, 36, 24, BACK)} />
    </div>
    {CHECKS.map((t, i) => {
      const p = ease(l, 60 + i * 34, 14, BACK);
      const ok = ease(l, 96 + i * 34, 10, BACK);
      return (
        <div key={t} style={{ position: "absolute", left: 400, right: 70, top: 880 + i * 124, height: 104, borderRadius: 26, background: "#fff", border: `3px solid ${ok > 0.5 ? C.mint : C.line}`, boxShadow: "0 10px 24px rgba(20,18,31,.1)", display: "flex", alignItems: "center", gap: 18, padding: "0 22px", direction: "rtl", opacity: p, transform: `scale(${0.9 + 0.1 * p})` }}>
          <div style={{ flex: "none", width: 58, height: 58, borderRadius: "50%", background: ok > 0.5 ? C.mint : "#EFE9DA", color: ok > 0.5 ? "#fff" : C.mu, display: "grid", placeItems: "center", font: `700 34px ${EN}` }}>{ok > 0.5 ? "✓" : "؟"}</div>
          <div style={{ font: `700 31px/1.3 ${BODY}`, color: C.ink }}>{t}</div>
        </div>
      );
    })}
  </>
);

const Gate3: React.FC<{ l: number }> = ({ l }) => {
  const tiles = ["سعر المقعد", "المستخدمين الفعليين", "استخدام إضافي", "التكلفة الحقيقية"];
  const ops = ["×", "+", "="];
  const grow = (a: number) => ease(l, a, 50, IN_OUT);
  return (
    <>
      {tiles.map((t, i) => {
        const p = ease(l, 40 + i * 16, 14, BACK);
        const left = 806 - 244 * i;
        const last = i === 3;
        return (
          <React.Fragment key={t}>
            <div style={{ position: "absolute", left, top: 880, width: 200, height: 118, borderRadius: 24, background: last ? C.violet : "#fff", color: last ? "#fff" : C.ink, border: `3px solid ${last ? C.violet : C.line}`, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 12px", font: `700 29px/1.3 ${BODY}`, direction: "rtl", opacity: p, transform: `scale(${p})`, boxShadow: last ? `0 12px 28px ${C.violet}66` : "0 8px 20px rgba(20,18,31,.08)" }}>{t}</div>
            {i < 3 ? <div style={{ position: "absolute", left: left - 44, top: 902, width: 44, textAlign: "center", font: `700 44px ${EN}`, color: C.mu, opacity: p }}>{ops[i]}</div> : null}
          </React.Fragment>
        );
      })}
      {/* مقارنة بالميزانية (أرقام توضيحية) */}
      <div style={{ position: "absolute", left: 70, top: 1050, width: 940, height: 190, direction: "ltr" }}>
        {[
          { k: "A", w: 470, c: C.mint, at: 100 },
          { k: "B", w: 830, c: C.red, at: 124 },
        ].map((b, i) => (
          <div key={b.k} style={{ position: "absolute", left: 0, top: i * 84, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: b.k === "A" ? CANDS[0].color : CANDS[1].color, color: "#fff", display: "grid", placeItems: "center", font: `900 30px ${EN}` }}>{b.k}</div>
            <div style={{ width: b.w * grow(b.at), height: 44, borderRadius: 22, background: b.c, opacity: 0.92 }} />
          </div>
        ))}
        <div style={{ position: "absolute", left: 640, top: -14, width: 0, height: 190, borderLeft: `5px dashed ${C.ink}`, opacity: ease(l, 90, 14) }} />
        <div style={{ position: "absolute", left: 560, top: 172, width: 160, textAlign: "center", font: `700 28px ${BODY}`, color: C.ink, direction: "rtl", opacity: ease(l, 96, 14) }}>الميزانية</div>
      </div>
    </>
  );
};

const Gate4: React.FC<{ l: number }> = ({ l }) => {
  const W = 840;
  const H = 300;
  const x0 = 120;
  const y0 = 1220;
  const pt = (wk: number, v: number) => `${x0 + (wk / 4) * W},${y0 - v * H}`;
  const A = [0, 0.18, 1, 0.78, 2, 0.9, 3, 0.95, 4, 0.97];
  const Bc = [0, 0.1, 1, 0.16, 2, 0.24, 3, 0.31, 4, 0.36];
  const path = (a: number[]) => a.reduce((s, _, i) => (i % 2 ? s : s + (i ? "L" : "M") + pt(a[i], a[i + 1]) + " "), "");
  const dA = ease(l, 50, 90, IN_OUT);
  const dB = ease(l, 70, 90, IN_OUT);
  return (
    <>
      <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0, direction: "ltr" }}>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <line key={v} x1={x0} x2={x0 + W} y1={y0 - v * H} y2={y0 - v * H} stroke={C.line} strokeWidth={2} />
        ))}
        <line x1={x0} x2={x0} y1={y0 - H} y2={y0} stroke={C.ink} strokeWidth={4} />
        <line x1={x0} x2={x0 + W} y1={y0} y2={y0} stroke={C.ink} strokeWidth={4} />
        {[1, 2, 3, 4].map((w) => (
          <text key={w} x={x0 + (w / 4) * W} y={y0 + 42} textAnchor="middle" fontSize={30} fontWeight={700} fill={C.mu} fontFamily="Space Grotesk">{w}</text>
        ))}
        <path d={path(Bc)} fill="none" stroke="#A29A86" strokeWidth={8} strokeLinecap="round" strokeDasharray="1200" strokeDashoffset={1200 * (1 - dB)} />
        <path d={path(A)} fill="none" stroke={C.mint} strokeWidth={10} strokeLinecap="round" strokeDasharray="1400" strokeDashoffset={1400 * (1 - dA)} />
        {dA > 0.35 ? <circle cx={x0 + 0.5 * W} cy={y0 - 0.9 * H} r={14} fill={C.mint} stroke="#fff" strokeWidth={5} /> : null}
      </svg>
      <div style={{ position: "absolute", left: 120, top: 900, font: `700 28px ${BODY}`, color: C.mu, direction: "rtl", opacity: ease(l, 40, 14) }}>الاستخدام الفعلي ↑</div>
      <div style={{ position: "absolute", left: 120 + W - 340, top: 1262, width: 340, textAlign: "right", font: `700 28px ${BODY}`, color: C.mu, direction: "rtl", opacity: ease(l, 40, 14) }}>الأسبوع ←</div>
      <div style={{ position: "absolute", left: 500, top: 1020, padding: "8px 18px 12px", borderRadius: 16, background: C.mint, color: "#fff", font: `700 28px ${BODY}`, direction: "rtl", opacity: ease(l, 120, 14, BACK), transform: `scale(${ease(l, 120, 14, BACK)})` }}>الأداة A: يدخلون عليها بسرعة</div>
      <div style={{ position: "absolute", left: 640, top: 1070, padding: "8px 18px 12px", borderRadius: 16, background: "#fff", border: `3px solid #A29A86`, color: C.mu, font: `700 26px ${BODY}`, direction: "rtl", opacity: ease(l, 140, 14, BACK), transform: `scale(${ease(l, 140, 14, BACK)})` }}>أداة معقدة: تتعثر</div>
    </>
  );
};

/* ───── اللوحة السفلية ───── */
const Panel: React.FC<{ k: SegK; f: number; at: number; children: React.ReactNode }> = ({ k, f, at, children }) => {
  const l = lp(f, k);
  const p = ease(l, at, 16, OUT);
  return (
    <div style={{ position: "absolute", top: 1262, left: 56, right: 56, padding: "18px 26px 22px", borderRadius: 22, background: "#fff", border: `3px solid ${C.violet}55`, boxShadow: "0 12px 28px rgba(20,18,31,.1)", color: C.ink, font: `700 31px/1.5 ${BODY}`, direction: "rtl", opacity: p * outOf(f, k), transform: `translateY(${(1 - p) * 30}px)` }}>
      {children}
    </div>
  );
};

/* ───── الهوك ───── */
const HookVis: React.FC<{ f: number }> = ({ f }) => {
  const out = outOf(f, "hook");
  return (
    <div style={{ opacity: out }}>
      {/* مرفوضات: الأشهر · الأرخص */}
      {["الأشهر", "الأرخص"].map((t, i) => {
        const p = ease(f, 70 + i * 22, 14, BACK);
        const cross = ease(f, 120 + i * 18, 14, OUT);
        return (
          <div key={t} style={{ position: "absolute", top: 590, right: 80 + i * 300, padding: "10px 30px 14px", borderRadius: 999, background: "#fff", border: `3px solid ${C.line}`, color: C.ink, font: `800 44px ${DISPLAY}`, direction: "rtl", opacity: p, transform: `scale(${p})`, boxShadow: "0 10px 24px rgba(20,18,31,.1)" }}>
            {t}
            <div style={{ position: "absolute", left: -8, top: "52%", height: 7, width: `${cross * 112}%`, background: C.red, borderRadius: 4, transformOrigin: "right" }} />
          </div>
        );
      })}
      <Strip top={760} active={0} p={ease(f, 150, 16, OUT)} labels />
    </div>
  );
};

/* ───── الخلاصة والختام ───── */
const LOGOS = ["claude-color.svg", "openai.svg", "gemini-color.svg", "copilot-color.svg"];
const Verdict: React.FC<{ f: number }> = ({ f }) => {
  const l = lp(f, "verdict");
  const o = outOf(f, "verdict");
  const items = [
    ["٥", "أشخاص"],
    ["١", "مهمة وحدة"],
    ["٢", "أسبوع"],
    ["⏱", "قِس قبل وبعد"],
  ];
  return (
    <div style={{ opacity: o }}>
      {items.map(([n, t], i) => {
        const p = ease(l, 24 + i * 12, 14, BACK);
        const col = i % 2;
        const row = Math.floor(i / 2);
        return (
          <div key={t} style={{ position: "absolute", top: 600 + row * 170, right: 80 + col * 470, width: 440, height: 146, borderRadius: 28, background: "#fff", border: `3px solid ${C.violet}66`, boxShadow: "0 12px 28px rgba(20,18,31,.1)", display: "flex", alignItems: "center", gap: 22, padding: "0 26px", direction: "rtl", opacity: p, transform: `scale(${p})` }}>
            <div style={{ flex: "none", width: 86, height: 86, borderRadius: 24, background: C.violet, color: "#fff", display: "grid", placeItems: "center", font: `900 52px ${DISPLAY}` }}>{n}</div>
            <div style={{ font: `800 40px/1.3 ${DISPLAY}`, color: C.ink }}>{t}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 976, left: 0, right: 0, textAlign: "center", font: `700 32px ${BODY}`, color: C.mu, direction: "rtl", opacity: ease(l, 70, 14) }}>اسأل نفس الأسئلة على كل مرشّح، مثلاً:</div>
      <div style={{ position: "absolute", top: 1040, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 26 }}>
        {LOGOS.map((s, i) => {
          const p = ease(l, 84 + i * 8, 14, BACK);
          return (
            <div key={s} style={{ width: 150, height: 150, borderRadius: 34, background: "#fff", border: `3px solid ${C.line}`, boxShadow: "0 12px 28px rgba(20,18,31,.1)", display: "grid", placeItems: "center", opacity: p, transform: `scale(${p})` }}>
              <Img src={V(s)} style={{ width: 80, height: 80 }} />
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 1210, left: 0, right: 0, textAlign: "center", font: `600 26px ${BODY}`, color: C.mu, direction: "rtl", opacity: ease(l, 110, 14) }}>أمثلة للمقارنة، مو ترشيح ولا ترتيب</div>
    </div>
  );
};

export const End: React.FC<{ f: number }> = ({ f }) => {
  const [a] = SEG.end;
  if (f < a + 6) return null;
  const pt = ease(f, a + 14, 18, OUT);
  const pa = ease(f, a + 30, 20, BACK);
  const pn = ease(f, a + 52, 18, OUT);
  const pc = ease(f, a + 66, 18, OUT);
  const ph = ease(f, a + 80, 18, BACK);
  return (
    <div style={{ position: "absolute", inset: 0, direction: "rtl", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 230, left: 0, right: 0, font: `900 92px/1.35 ${DISPLAY}`, color: C.ink, opacity: pt, transform: `translateY(${(1 - pt) * 30}px)` }}>
        الأداة المناسبة…
        <div style={{ font: `700 40px/1.4 ${BODY}`, color: C.violet }}>هي اللي يستخدمها فريقك فعلاً</div>
      </div>
      <div style={{ position: "absolute", top: 640, left: "50%", marginLeft: -200, width: 400, height: 400, borderRadius: "50%", padding: 14, background: `conic-gradient(${C.violet}, ${C.mint}, ${C.amber}, ${C.violet})`, transform: `scale(${pa})`, boxShadow: "0 24px 50px rgba(20,18,31,.25)" }}>
        <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: C.bg }}>
          <Img src={staticFile("avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%" }} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 1100, left: 0, right: 0, font: `900 88px/1.3 ${DISPLAY}`, color: C.ink, opacity: pn, transform: `translateY(${(1 - pn) * 30}px)` }}>علي التميمي</div>
      <div style={{ position: "absolute", top: 1226, left: 0, right: 0, font: `700 34px/1.4 ${BODY}`, color: C.mu, opacity: pc }}>كل يوم أداة ذكاء اصطناعي تختصر شغلك</div>
      <div style={{ position: "absolute", top: 1300, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${ph})` }}>
        <div style={{ padding: "10px 32px", borderRadius: 999, background: C.ink }}>
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
      <div style={{ padding: "8px 24px", borderRadius: 999, background: C.ink, opacity: 0.92 }}>
        <HandlesRow size={26} color="#fff" />
      </div>
    </div>
  );
};

/* ───── المحتوى حسب المشهد ───── */
export const Content: React.FC<{ f: number }> = ({ f }) => {
  const gates: SegK[] = ["g1", "g2", "g3", "g4"];
  return (
    <>
      <HookVis f={f} />
      {gates.map((k, gi) => {
        if (!inSeg(f, k)) return null;
        const l = lp(f, k);
        const o = outOf(f, k);
        return (
          <div key={k} style={{ position: "absolute", inset: 0, opacity: o }}>
            <Strip top={516} active={gi + 1} p={ease(l, 6, 14, OUT)} />
            <Cands gate={gi + 1} l={l} />
            {gi === 0 ? <Gate1 l={l} /> : gi === 1 ? <Gate2 l={l} /> : gi === 2 ? <Gate3 l={l} /> : <Gate4 l={l} />}
          </div>
        );
      })}
      {inSeg(f, "g1") ? <Panel k="g1" f={f} at={120}>اسأل: وين يشتغل فريقك اليوم؟ وهل فيه ربط جاهز {iso("(Connectors)")} أو {iso("API")}؟</Panel> : null}
      {inSeg(f, "g2") ? <Panel k="g2" f={f} at={150}>اطلب الجواب <b style={{ color: C.violet }}>مكتوب</b> من المورّد… مو وعد شفهي</Panel> : null}
      {inSeg(f, "g3") ? <Panel k="g3" f={f} at={150}>احسبها لـ ١٢ شهر، وانتبه للاستخدام الإضافي بعد الحد <span style={{ color: C.mu, fontSize: 25 }}>(أرقام الرسم توضيحية)</span></Panel> : null}
      {inSeg(f, "g4") ? <Panel k="g4" f={f} at={150}>جرّبها مع ٥ أشخاص أسبوعين: كم صاروا يستخدمونها <b style={{ color: C.violet }}>فعلاً</b>؟</Panel> : null}
      {inSeg(f, "verdict") ? <Verdict f={f} /> : null}
    </>
  );
};
