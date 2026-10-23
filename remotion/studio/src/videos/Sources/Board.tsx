import React from "react";
import { Img, staticFile } from "remotion";
import { BACK, BODY, DISPLAY, EN, HAND, IN_OUT, L, MONO, OUT, P, SEG, V, VISIT, ease } from "./theme";

/* ───── الكاميرا: تمشي على اللوحة من فوق لتحت ───── */
export type Cam = { cx: number; cy: number; s: number; sy: number };
const mix = (a: Cam, b: Cam, t: number): Cam => ({
  cx: a.cx + (b.cx - a.cx) * t,
  cy: a.cy + (b.cy - a.cy) * t,
  sy: a.sy + (b.sy - a.sy) * t,
  s: Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * t),
});
export const camAt = (f: number): Cam => {
  const hook: Cam = { cx: 1100, cy: 700, s: 1.38 - 0.12 * ease(f, 0, 110, (x) => x), sy: 1000 };
  const K: [number, number, Cam][] = [
    [SEG.ans[0] - 10, 34, { cx: 1100, cy: 1500 - 0.08 * Math.max(0, f - SEG.ans[0]), s: 1.0, sy: 1010 }],
    [SEG.strings[0] - 6, 36, { cx: 1100, cy: 2000, s: 0.51, sy: 1010 }],
    [VISIT[0] - 6, 30, { cx: 560, cy: 2420, s: 0.95, sy: 1000 }],
    [VISIT[1] - 6, 28, { cx: 1100, cy: 2640, s: 0.95, sy: 1000 }],
    [VISIT[2] - 6, 28, { cx: 1640, cy: 2420, s: 0.95, sy: 1000 }],
    [SEG.more[0] - 6, 34, { cx: 1110, cy: 3740, s: 0.9, sy: 1010 }],
    [SEG.prompt[0] - 6, 32, { cx: 1100, cy: 4560 + 0.06 * Math.max(0, f - SEG.prompt[0]), s: 1.0, sy: 1010 }],
    [SEG.end[0] - 6, 34, { cx: 1100, cy: 5250, s: 0.85, sy: 690 }],
  ];
  let c = hook;
  for (const [a, d, k] of K) c = mix(c, k, ease(f, a, d, IN_OUT));
  return c;
};

/* ───── عناصر صغيرة ───── */
const Pin: React.FC<{ x: number; y: number; c?: string; r?: number }> = ({ x, y, c = "#E63946", r = 16 }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, #fff 0%, ${c} 35%, #5a1010 100%)`, boxShadow: "3px 6px 6px rgba(0,0,0,.35)", zIndex: 5 }} />
);
const Num: React.FC<{ n: number; size?: number; glow?: number }> = ({ n, size = 44, glow = 0 }) => (
  <span style={{ display: "inline-grid", placeItems: "center", width: size, height: size, borderRadius: "50%", background: P.teal, color: "#fff", font: `800 ${size * 0.55}px ${MONO}`, boxShadow: `0 0 ${glow * 30}px ${glow * 8}px rgba(32,128,141,.55)` }}>{n}</span>
);
const Bar: React.FC<{ w: number; c?: string; h?: number }> = ({ w, c = "#CFC8BA", h = 18 }) => <div style={{ width: w, height: h, borderRadius: h / 2, background: c }} />;
const box = (o: { x: number; y: number; w: number; h: number }): React.CSSProperties => ({ position: "absolute", left: o.x - o.w / 2, top: o.y - o.h / 2, width: o.w, height: o.h });

/* ختم يضرب على البطاقة */
const Stamp: React.FC<{ f: number; at: number; text: string; c: string; x: number; y: number; rot?: number; size?: number }> = ({ f, at, text, c, x, y, rot = -12, size = 46 }) => {
  const p = ease(f, at, 10, OUT);
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${1.7 - 0.7 * p})`, opacity: p, padding: "4px 22px 12px", border: `7px solid ${c}`, borderRadius: 14, color: c, font: `900 ${size}px ${DISPLAY}`, whiteSpace: "nowrap", direction: "rtl", background: "rgba(255,252,242,.88)", zIndex: 8, boxShadow: "0 6px 14px rgba(0,0,0,.18)" }}>
      {text}
    </div>
  );
};

/* ───── الفلّين ───── */
const Cork: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: -400,
      top: -600,
      width: 3000,
      height: 7000,
      background: [
        "radial-gradient(circle at 30% 40%, rgba(80,45,15,.32) 1.4px, transparent 2.6px) 0 0/17px 19px",
        "radial-gradient(circle at 70% 60%, rgba(255,235,200,.22) 1.2px, transparent 2.4px) 6px 9px/23px 21px",
        "radial-gradient(circle at 50% 50%, rgba(90,50,20,.22) 2px, transparent 3.4px) 11px 4px/41px 37px",
        `linear-gradient(180deg, ${P.cork}, #BE8B55 50%, ${P.cork})`,
      ].join(","),
    }}
  />
);

/* ───── الهوك: ورقة لاصقة بلا مصدر ───── */
const Note: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ ...box(L.note), background: `linear-gradient(170deg, #FFE98F, ${P.sticky})`, transform: "rotate(-3deg)", boxShadow: "8px 16px 24px rgba(60,30,0,.35)", padding: "70px 50px 0", direction: "rtl" }}>
    <Pin x={L.note.w / 2} y={22} />
    <div style={{ font: `700 60px/1.5 ${HAND}`, color: P.ink, whiteSpace: "nowrap" }}>«الدراسات تقول إن…»</div>
    <div style={{ marginTop: 18, font: `700 38px/1.5 ${BODY}`, color: P.sub }}>قالها الذكاء الاصطناعي بكل ثقة</div>
    <Stamp f={f} at={44} text="المصدر؟" c={P.bad} x={L.note.w / 2} y={445} rot={-8} size={64} />
  </div>
);

/* ───── ورقة الجواب ───── */
const ROWS = [600, 620, 0, 640, 600, 0, 610, 580, 0, 470];
const Doc: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const lf = f - SEG.ans[0];
  const d = L.doc;
  const top = d.y - d.h / 2;
  const left = d.x - d.w / 2;
  // عرض كل سطر: الأسطر اللي فيها رقم تنتهي عنده
  const rowW = (i: number) => {
    const m = [2, 5, 8].indexOf(i);
    if (m < 0) return ROWS[i];
    return d.x + d.w / 2 - 50 - (L.marks[m].x + 34);
  };
  return (
    <>
      <div style={{ ...box(d), background: P.paper, boxShadow: "10px 18px 30px rgba(60,30,0,.35)", direction: "rtl" }}>
        <div style={{ position: "absolute", top: 34, right: 50, left: 50, display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 22, borderBottom: "3px solid #E6DFD1" }}>
          <div style={{ font: `700 30px ${BODY}`, color: P.sub }}>نتيجة البحث</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, direction: "ltr" }}>
            <Img src={V("perplexity-color.svg")} style={{ width: 62, height: 62 }} />
            <Img src={V("perplexity-text.svg")} style={{ height: 40, width: 195 }} />
          </div>
        </div>
        <div style={{ position: "absolute", top: 150, right: 50, left: 50, padding: "14px 24px 18px", borderRadius: 18, background: "#EFE9DD", font: `700 36px/1.4 ${BODY}`, color: P.ink }}>سؤالك: وش آخر تحديثات نظام العمل؟</div>
      </div>
      {ROWS.map((_, i) => {
        const p = ease(lf, 10 + i * 4, 14, OUT);
        return (
          <div key={i} style={{ position: "absolute", top: top + 270 + i * 46 - 9, left: left + 50, width: d.w - 100, display: "flex", justifyContent: "flex-end", opacity: p }}>
            <div style={{ transformOrigin: "right", transform: `scaleX(${p})` }}>
              <Bar w={rowW(i)} c={i === 0 ? "#9C9384" : "#CFC8BA"} />
            </div>
          </div>
        );
      })}
      {L.marks.map((m, i) => {
        const p = ease(lf, 60 + i * 20, 14, BACK);
        const glow = p > 0 ? Math.max(0, 1 - Math.abs(lf - (60 + i * 20) - 10) / 30) + kick * 0.3 : 0;
        return p > 0 ? (
          <div key={i} style={{ position: "absolute", left: m.x - 22, top: m.y - 22, transform: `scale(${p})`, zIndex: 6 }}>
            <Num n={i + 1} glow={glow} />
          </div>
        ) : null;
      })}
      <Pin x={d.x} y={top + 14} />
    </>
  );
};

/* ───── المصادر الثلاثة ───── */
const SrcOfficial: React.FC = () => {
  const s = L.src[0];
  return (
    <div style={{ ...box(s), background: "#fff", boxShadow: "10px 16px 26px rgba(60,30,0,.35)", transform: "rotate(-2deg)", direction: "rtl", overflow: "hidden" }}>
      <div style={{ height: 70, background: "#E8EEF2", display: "flex", alignItems: "center", gap: 14, padding: "0 26px", font: `700 30px ${BODY}`, color: "#264653" }}>
        <svg width="34" height="34" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="none" stroke="#264653" strokeWidth="2" /><path d="M2.5 12h19M12 2.5c3 3.2 3 15.8 0 19M12 2.5c-3 3.2-3 15.8 0 19" fill="none" stroke="#264653" strokeWidth="1.6" /></svg>
        موقع جهة رسمية
      </div>
      <div style={{ padding: "30px 30px 0", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
        <Bar w={380} c="#2B3A42" h={26} />
        <Bar w={420} /><Bar w={400} /><Bar w={430} /><Bar w={300} />
      </div>
      <div style={{ position: "absolute", bottom: 22, right: 30, font: `800 28px ${MONO}`, color: "#264653", direction: "rtl" }}>آخر تحديث: <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>2026</span></div>
    </div>
  );
};
const SrcNews: React.FC = () => {
  const s = L.src[1];
  return (
    <div style={{ ...box(s), background: "#FFFDF7", padding: "24px 24px 0", boxShadow: "10px 16px 26px rgba(60,30,0,.35)", transform: "rotate(3deg)" }}>
      <Img src={V("news.jpg")} style={{ width: "100%", height: 400, objectFit: "cover", objectPosition: "50% 30%", filter: "saturate(.9)" }} />
      <div style={{ textAlign: "center", font: `700 48px/1.6 ${HAND}`, color: P.ink, direction: "rtl" }}>
        جريدة · <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>2023</span>
      </div>
    </div>
  );
};
const SrcForum: React.FC = () => {
  const s = L.src[2];
  const bubble = (side: "r" | "l", w: number) => (
    <div style={{ display: "flex", flexDirection: side === "r" ? "row" : "row-reverse", gap: 14, alignItems: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#B9C3CC" }} />
      <div style={{ padding: "18px 20px", borderRadius: 18, background: side === "r" ? "#fff" : "#DDE6EE", display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
        <Bar w={w} /><Bar w={w - 80} />
      </div>
    </div>
  );
  return (
    <div style={{ ...box(s), background: "#EEF2F5", boxShadow: "10px 16px 26px rgba(60,30,0,.35)", transform: "rotate(2deg)", direction: "rtl", padding: "0 0 0 0", overflow: "hidden" }}>
      <div style={{ height: 70, background: "#D5DEE6", display: "flex", alignItems: "center", padding: "0 26px", font: `700 30px ${BODY}`, color: "#3D4B57" }}>منتدى · مستخدم مجهول</div>
      <div style={{ padding: "26px 26px 0", display: "flex", flexDirection: "column", gap: 20 }}>
        {bubble("r", 300)}
        {bubble("l", 260)}
      </div>
    </div>
  );
};

/* خيط أحمر من الرقم للمصدر */
const strD = (i: number) => {
  const m = L.marks[i];
  const s = L.src[i];
  const x2 = s.x;
  const y2 = s.y - s.h / 2 + 16;
  return `M ${m.x} ${m.y} Q ${(m.x + x2) / 2} ${Math.max(m.y, y2) + 140} ${x2} ${y2}`;
};

/* المكبّر */
const Lens: React.FC<{ f: number }> = ({ f }) => {
  const i = f < VISIT[1] ? 0 : f < VISIT[2] ? 1 : 2;
  const a = VISIT[i];
  const on = ease(f, VISIT[0] + 14, 14, OUT) * (1 - ease(f, SEG.check[1] - 10, 10, OUT));
  if (on <= 0) return null;
  const s = L.src[i];
  const t = ease(f, a + 6, 52, IN_OUT);
  const away = ease(f, a + 58, 12, OUT) * (1 - ease(f, a + 128, 4, OUT));
  const x = s.x + 120 - t * 220 - away * 260;
  const y = s.y - 120 + t * 160 + away * 220;
  return (
    <div style={{ position: "absolute", left: x - 150, top: y - 150, width: 300, height: 300, opacity: on * (1 - away), zIndex: 9 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "22px solid #2B2B2B", background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,.55), rgba(200,230,255,.12) 60%, rgba(255,255,255,.05))", boxShadow: "0 18px 30px rgba(0,0,0,.35), inset 0 0 0 4px rgba(255,255,255,.3)" }} />
      <div style={{ position: "absolute", left: 230, top: 238, width: 46, height: 190, borderRadius: 22, background: "linear-gradient(90deg,#5B3A1E,#8A5A30)", transform: "rotate(-45deg)", transformOrigin: "top center" }} />
    </div>
  );
};

/* ───── كمّل التحقيق ───── */
const More: React.FC<{ f: number }> = ({ f }) => {
  const lf = f - SEG.more[0];
  const p1 = ease(lf, 20, 16, BACK);
  const p2 = ease(lf, 60, 16, BACK);
  const p3 = ease(lf, 100, 16, BACK);
  const card = (o: { x: number; y: number; w: number; h: number }, p: number, rot: number, children: React.ReactNode) => (
    <div style={{ ...box(o), transform: `rotate(${rot}deg) scale(${0.6 + 0.4 * p})`, opacity: p, direction: "rtl" }}>{children}</div>
  );
  return (
    <>
      {card(L.follow, p1, -3,
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(170deg, #FFE98F, ${P.sticky})`, boxShadow: "8px 14px 22px rgba(60,30,0,.35)", padding: "64px 40px 0" }}>
          <Pin x={L.follow.w / 2} y={22} />
          <div style={{ font: `700 30px ${BODY}`, color: P.sub }}>سؤال متابعة:</div>
          <div style={{ marginTop: 8, font: `700 54px/1.5 ${HAND}`, color: P.ink }}>«طيب، وش اللي تغيّر عن النظام القديم؟»</div>
        </div>,
      )}
      {card(L.search, p2, 2,
        <div style={{ position: "absolute", inset: 0, background: "#fff", boxShadow: "8px 14px 22px rgba(60,30,0,.35)", padding: "40px 36px 0" }}>
          <Pin x={L.search.w / 2} y={20} c="#2A9D8F" />
          <div style={{ display: "flex", alignItems: "center", gap: 14, direction: "ltr", justifyContent: "flex-end" }}>
            <span style={{ font: `700 50px ${EN}`, color: P.ink }}>Search</span>
            <Img src={V("perplexity-color.svg")} style={{ width: 48, height: 48 }} />
          </div>
          <div style={{ marginTop: 10, font: `700 38px/1.4 ${BODY}`, color: P.teal }}>جواب سريع ومباشر</div>
        </div>,
      )}
      {card(L.research, p3, -2,
        <div style={{ position: "absolute", inset: 0, background: "#fff", boxShadow: "8px 14px 22px rgba(60,30,0,.35)", padding: "22px 22px 0" }}>
          <Pin x={L.research.w / 2} y={14} c="#2A9D8F" />
          <Img src={V("library.jpg")} style={{ width: "100%", height: 190, objectFit: "cover", objectPosition: "50% 45%" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 14, direction: "ltr", justifyContent: "flex-end", marginTop: 12, padding: "0 12px" }}>
            <span style={{ font: `700 46px ${EN}`, color: P.ink }}>Research</span>
            <Img src={V("perplexity-color.svg")} style={{ width: 44, height: 44 }} />
          </div>
          <div style={{ padding: "0 12px", font: `700 34px/1.4 ${BODY}`, color: P.teal }}>تقرير أطول من مصادر أكثر</div>
        </div>,
      )}
    </>
  );
};

/* ───── البرومبت على بطاقة فهرسة ───── */
const PROMPT_A = "وش آخر تحديثات نظام العمل في السعودية؟ ";
const PROMPT_B = "اعتمد على المصادر الرسمية فقط";
const PROMPT_C = "، و";
const PROMPT_D = "اذكر رابط المصدر لكل معلومة";
const Prompt: React.FC<{ f: number }> = ({ f }) => {
  const lf = f - SEG.prompt[0];
  const o = L.prompt;
  const total = (PROMPT_A + PROMPT_B + PROMPT_C + PROMPT_D + ".").length;
  const n = Math.round(ease(lf, 24, 70, (x) => x) * total);
  let k = n;
  const take = (s: string) => {
    const t = s.slice(0, Math.max(0, k));
    k -= s.length;
    return t;
  };
  const a = take(PROMPT_A);
  const b = take(PROMPT_B);
  const c = take(PROMPT_C);
  const d = take(PROMPT_D);
  const e = take(".");
  const hl = (t: string) => <span style={{ background: "linear-gradient(transparent 55%, #FFE27A 55%)", fontWeight: 700 }}>{t}</span>;
  return (
    <div style={{ ...box(o), background: "repeating-linear-gradient(180deg, #FFFFFF 0 66px, #9CC3E6 66px 68px)", boxShadow: "10px 18px 30px rgba(60,30,0,.35)", transform: "rotate(-1deg)", direction: "rtl", padding: "36px 70px 0 50px" }}>
      <div style={{ position: "absolute", top: 0, bottom: 0, right: 40, width: 4, background: "#E46A6A" }} />
      <Pin x={o.w / 2} y={18} />
      <div style={{ font: `700 32px/66px ${BODY}`, color: P.teal }}>انسخ هذا السؤال وجرّبه:</div>
      <div style={{ font: `600 44px/66px ${BODY}`, color: P.ink }}>
        {a}
        {hl(b)}
        {c}
        {hl(d)}
        {e}
        <span style={{ opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: P.teal }}>|</span>
      </div>
    </div>
  );
};

/* ───── ملف القضية ───── */
const Folder: React.FC<{ f: number }> = ({ f }) => {
  const o = L.folder;
  const lf = f - SEG.end[0];
  const ph = ease(lf, 16, 16, BACK);
  return (
    <div style={{ ...box(o), direction: "rtl" }}>
      <div style={{ position: "absolute", top: -60, right: 60, width: 330, height: 80, borderRadius: "18px 18px 0 0", background: P.manila, display: "grid", placeItems: "center", font: `700 34px ${BODY}`, color: "#6B4E1F" }}>ملف التحقيق</div>
      <div style={{ position: "absolute", inset: 0, borderRadius: "0 0 18px 18px", background: `linear-gradient(170deg, #F0D7A2, ${P.manila})`, boxShadow: "10px 18px 30px rgba(60,30,0,.4)" }} />
      <div style={{ position: "absolute", top: 70, right: 70, width: 330, height: 400, padding: 16, background: "#fff", transform: `rotate(4deg) scale(${ph})`, boxShadow: "6px 10px 18px rgba(0,0,0,.25)" }}>
        <Img src={staticFile("avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%", background: "#EDE6D8" }} />
        <div style={{ position: "absolute", top: -34, right: 120, width: 34, height: 110, border: "7px solid #9AA3AC", borderRadius: 18 }} />
      </div>
      <div style={{ position: "absolute", top: 110, left: 70, width: 340, display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-end" }}>
        <div style={{ font: `700 30px ${BODY}`, color: "#6B4E1F" }}>المحقق</div>
        <Bar w={300} c="#BFA06A" /><Bar w={260} c="#BFA06A" /><Bar w={300} c="#BFA06A" /><Bar w={200} c="#BFA06A" />
      </div>
      <Stamp f={f} at={SEG.end[0] + 40} text="القضية مقفلة" c={P.bad} x={250} y={560} rot={-10} size={54} />
    </div>
  );
};

/* ───── العالم ───── */
export const Board: React.FC<{ f: number; cam: Cam; kick: number }> = ({ f, cam, kick }) => {
  const tx = 540 - cam.cx * cam.s;
  const ty = cam.sy - cam.cy * cam.s;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 2200, height: 5800, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${cam.s})` }}>
      <Cork />
      <Note f={f} />
      <Doc f={f} kick={kick} />
      <SrcOfficial />
      <SrcNews />
      <SrcForum />
      {L.src.map((s, i) => (
        <React.Fragment key={i}>
          <Pin x={s.x} y={s.y - s.h / 2 + 16} />
          <div style={{ position: "absolute", left: s.x - s.w / 2 - 20, top: s.y - s.h / 2 - 20, zIndex: 6 }}>
            <Num n={i + 1} size={60} />
          </div>
        </React.Fragment>
      ))}
      <svg width={2200} height={5800} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", zIndex: 7, pointerEvents: "none" }}>
        {L.src.map((_, i) => {
          const p = ease(f, SEG.strings[0] + 24 + i * 34, 40, OUT);
          return p > 0 ? <path key={i} d={strD(i)} fill="none" stroke={P.string} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} style={{ filter: "drop-shadow(3px 6px 3px rgba(0,0,0,.3))" }} /> : null;
        })}
      </svg>
      <Stamp f={f} at={VISIT[0] + 70} text="موثّق" c={P.ok} x={L.src[0].x + 60} y={L.src[0].y + 70} />
      <Stamp f={f} at={VISIT[1] + 70} text="قديم؟ راجع التاريخ" c={P.amber} x={L.src[1].x} y={L.src[1].y - 40} size={40} />
      <Stamp f={f} at={VISIT[2] + 70} text="تأكد مرتين" c={P.bad} x={L.src[2].x} y={L.src[2].y + 90} />
      <Lens f={f} />
      <More f={f} />
      <Prompt f={f} />
      <Folder f={f} />
    </div>
  );
};
