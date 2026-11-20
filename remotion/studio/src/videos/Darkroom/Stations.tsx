import React from "react";
import { Img, staticFile } from "remotion";
import { BACK, BODY, DISPLAY, EN, IN_OUT, MONO, ORDER, OUT, P, SEG, STEP, SX, SegK, V, ease } from "./theme";

/* ───── الكاميرا: تمشي يسار على طاولة التحميض ───── */
export const camX = (f: number) => {
  const base = (k: SegK) => {
    const [a, b] = SEG[k];
    return SX(k) - 0.09 * Math.min(Math.max(f - a, 0), b - a);
  };
  let c = base("hook");
  for (const k of ORDER.slice(1)) c = c + (base(k) - c) * ease(f, SEG[k][0] - 8, 32, IN_OUT);
  return c;
};

const local = (f: number, k: SegK) => f - SEG[k][0];
const Abs: React.FC<{ x: number; y: number; w?: number; h?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, ...style }}>{children}</div>
);
const Station: React.FC<{ k: SegK; children: React.ReactNode }> = ({ k, children }) => (
  <div style={{ position: "absolute", left: SX(k), top: 0, width: 1080, height: 1920 }}>{children}</div>
);

/* ───── الخلفية: جدار، ضوء أمان أحمر، طاولة ───── */
const Room: React.FC<{ kick: number }> = ({ kick }) => (
  <>
    <div style={{ position: "absolute", left: -STEP * 7, top: 0, width: STEP * 9, height: 1920, background: "repeating-linear-gradient(90deg, transparent 0 298px, rgba(255,255,255,.035) 298px 300px), linear-gradient(180deg, #24141500 0%, #1E1112 0%, #140B0C 65%)" }} />
    {ORDER.map((k) => (
      <React.Fragment key={k}>
        <div style={{ position: "absolute", left: SX(k) + 540 - 520, top: -260, width: 1040, height: 1100, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(224,49,43,${0.3 + kick * 0.06}), rgba(224,49,43,0))` }} />
        <div style={{ position: "absolute", left: SX(k) + 540 - 110, top: 36, width: 220, height: 96, borderRadius: "16px 16px 40px 40px", background: "#2B1C1C", boxShadow: "0 0 0 4px #3A2727" }}>
          <div style={{ position: "absolute", left: 22, right: 22, bottom: 12, height: 40, borderRadius: 20, background: "#FF4A3D", boxShadow: "0 0 40px 14px rgba(255,74,61,.7)" }} />
        </div>
      </React.Fragment>
    ))}
    <div style={{ position: "absolute", left: -STEP * 7, top: 1330, width: STEP * 9, height: 600, background: "linear-gradient(180deg, #3A2A26, #1B1110)" }} />
    <div style={{ position: "absolute", left: -STEP * 7, top: 1330, width: STEP * 9, height: 16, background: "#4E3933" }} />
  </>
);

/* حوض التحميض */
const Tray: React.FC<{ x: number; y: number; w: number; h: number; children?: React.ReactNode; f: number }> = ({ x, y, w, h, children, f }) => (
  <Abs x={x} y={y} w={w} h={h} style={{ borderRadius: 26, background: "linear-gradient(180deg,#4A3836,#2A1E1D)", boxShadow: "0 30px 50px rgba(0,0,0,.6), inset 0 0 0 6px #5A4442" }}>
    <div style={{ position: "absolute", inset: 22, borderRadius: 16, overflow: "hidden", background: "linear-gradient(180deg, rgba(120,30,25,.55), rgba(60,15,12,.8))" }}>
      {children}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${110 + Math.sin(f / 25) * 10}deg, rgba(255,120,100,0) 30%, rgba(255,140,120,.16) 50%, rgba(255,120,100,0) 70%)`, mixBlendMode: "screen" }} />
    </div>
  </Abs>
);

/* ───── الهوك: صورة المحل في الحوض ───── */
const Hook: React.FC<{ f: number }> = ({ f }) => {
  const dev = ease(f, 0, 50, OUT);
  return (
    <Station k="hook">
      <Tray x={80} y={700} w={920} h={620} f={f}>
        <Img
          src={V("shop.jpg")}
          style={{ position: "absolute", left: 30, top: 30, width: 816, height: 516, objectFit: "cover", filter: `brightness(${2.2 - 1.2 * dev}) contrast(${0.5 + 0.55 * dev}) sepia(${0.25 * (1 - dev)})`, transform: `scale(${1.01 + Math.sin(f / 18) * 0.004}) rotate(${Math.sin(f / 30) * 0.4}deg)`, boxShadow: "0 0 0 10px #F4EFE6" }}
        />
      </Tray>
    </Station>
  );
};

/* ───── ارفع الملف: جهاز التكبير والجدول التفاعلي ───── */
const ROWS = [
  ["فراولة", "يناير", "420", "6,300"],
  ["مانجو", "يناير", "310", "5,580"],
  ["طماطم", "فبراير", "880", "3,520"],
  ["خيار", "فبراير", "640", "2,240"],
  ["فراولة", "مارس", "510", "7,650"],
];
const Enlarger: React.FC<{ light: number }> = ({ light }) => (
  <>
    <Abs x={940} y={600} w={30} h={740} style={{ background: "linear-gradient(90deg,#3B3B3F,#7A7A80,#3B3B3F)", borderRadius: 6 }} />
    <Abs x={700} y={640} w={260} h={26} style={{ background: "#55555B", borderRadius: 6 }} />
    <Abs x={340} y={560} w={400} h={170} style={{ borderRadius: 22, background: "linear-gradient(180deg,#3A3A40,#1F1F24)", boxShadow: "0 18px 30px rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, direction: "ltr" }}>
      <div style={{ width: 92, height: 92, borderRadius: "50%", background: "#fff", display: "grid", placeItems: "center" }}>
        <Img src={V("openai.svg")} style={{ width: 62, height: 62 }} />
      </div>
      <div style={{ font: `700 46px ${EN}`, color: "#fff" }}>ChatGPT</div>
    </Abs>
    <Abs x={490} y={730} w={100} h={70} style={{ background: "linear-gradient(90deg,#222,#555,#222)", borderRadius: "0 0 14px 14px" }} />
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: light, pointerEvents: "none" }}>
      <defs>
        <linearGradient id="cone" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#FFF4D6" stopOpacity=".55" />
          <stop offset="1" stopColor="#FFF4D6" stopOpacity=".05" />
        </linearGradient>
      </defs>
      <path d="M515 800 L565 800 L1000 850 L80 850 Z" fill="url(#cone)" />
    </svg>
  </>
);
const Upload: React.FC<{ f: number }> = ({ f }) => {
  const lf = local(f, "upload");
  const fly = ease(lf, 8, 26, IN_OUT);
  const light = ease(lf, 34, 10, OUT);
  const tbl = ease(lf, 40, 18, OUT);
  const hi = Math.min(4, Math.max(0, Math.floor((lf - 90) / 28)));
  return (
    <Station k="upload">
      <Enlarger light={light} />
      {/* ورقة الملف تطلع لجهاز التكبير */}
      {fly < 1 ? (
        <Abs x={640 - fly * 180} y={1180 - fly * 520} style={{ opacity: 1 - ease(lf, 30, 6, OUT), transform: `scale(${1 - fly * 0.5}) rotate(${-8 + fly * 8}deg)`, direction: "rtl" }}>
          <div style={{ padding: "18px 26px 22px", background: P.paper, borderRadius: 12, boxShadow: "0 16px 30px rgba(0,0,0,.5)", display: "flex", alignItems: "center", gap: 14, font: `700 36px ${BODY}`, color: P.ink }}>
            <svg width="44" height="52" viewBox="0 0 22 26"><path d="M2 1h12l6 6v18H2z" fill="#1E7F4F" /><path d="M6 12h10M6 16h10M6 20h10M10 9v14" stroke="#fff" strokeWidth="1.6" /></svg>
            ملف المبيعات <span style={{ font: `700 26px ${EN}`, color: P.sub, direction: "ltr" }}>.xlsx</span>
          </div>
        </Abs>
      ) : null}
      {/* الجدول التفاعلي */}
      <Abs x={80} y={850} w={920} h={470} style={{ opacity: tbl, transform: `translateY(${(1 - tbl) * 30}px)`, background: P.paper, borderRadius: 14, boxShadow: "0 24px 40px rgba(0,0,0,.55)", overflow: "hidden", direction: "rtl" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: "#EAE2D6" }}>
          <span style={{ font: `700 28px ${BODY}`, color: P.sub }}>جدول تفاعلي</span>
          <span style={{ display: "flex", gap: 16, direction: "ltr" }}>
            <svg width="34" height="34" viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="#1A1414" strokeWidth="2.4" fill="none" /></svg>
            <svg width="34" height="34" viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" stroke="#1A1414" strokeWidth="2.4" fill="none" strokeLinecap="round" /></svg>
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.9fr 1fr", background: P.ink, color: "#fff", font: `700 30px ${BODY}`, padding: "10px 24px" }}>
          <span>المنتج</span><span>الشهر</span><span>الكمية</span><span>المبلغ</span>
        </div>
        {ROWS.map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.9fr 1fr", padding: "8px 24px", font: `600 29px ${BODY}`, color: P.ink, background: lf > 90 && i === hi ? "rgba(16,163,127,.2)" : i % 2 ? "#FBF8F2" : "transparent", borderBottom: "1px solid #E4DCCF", opacity: ease(lf, 46 + i * 5, 10, OUT) }}>
            <span>{r[0]}</span><span>{r[1]}</span><span style={{ font: `700 28px ${MONO}`, direction: "ltr", textAlign: "right" }}>{r[2]}</span><span style={{ font: `700 28px ${MONO}`, direction: "ltr", textAlign: "right" }}>{r[3]}</span>
          </div>
        ))}
      </Abs>
    </Station>
  );
};

/* ───── اطلب: البرومبت والرسم يتحمّض ───── */
const PROMPT = "حلّل ملف المبيعات: وش أكثر 3 منتجات مبيعاً؟ وأي شهر كان الأضعف؟ وارسم المبيعات بالأشهر.";
const BARS = [52, 58, 66, 61, 70, 55, 34, 48, 63, 72, 80, 92];
const Prompt: React.FC<{ f: number }> = ({ f }) => {
  const lf = local(f, "prompt");
  const n = Math.round(ease(lf, 8, 70, (x) => x) * PROMPT.length);
  const dev = ease(lf, 110, 90, OUT);
  const lab = ease(lf, 200, 16, BACK);
  const max = 92;
  return (
    <Station k="prompt">
      <Abs x={80} y={560} w={920} h={300} style={{ background: P.paper, borderRadius: 14, boxShadow: "0 20px 36px rgba(0,0,0,.5)", padding: "26px 36px 0", direction: "rtl" }}>
        <div style={{ font: `700 28px ${BODY}`, color: P.green }}>طلبك:</div>
        <div style={{ marginTop: 6, font: `600 40px/1.55 ${BODY}`, color: P.ink }}>
          {PROMPT.slice(0, n)}
          <span style={{ opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: P.green }}>|</span>
        </div>
      </Abs>
      <Tray x={80} y={900} w={920} h={430} f={f}>
        <div style={{ position: "absolute", left: 26, top: 22, right: 26, bottom: 22, background: P.paper, opacity: 0.25 + 0.75 * ease(lf, 90, 20, OUT), filter: `brightness(${1.6 - 0.6 * dev})` }}>
          <svg width={824} height={342} style={{ position: "absolute", inset: 0 }}>
            <line x1={30} y1={300} x2={800} y2={300} stroke="#BFB6A8" strokeWidth={3} />
            {BARS.map((v, i) => {
              const h = (v / max) * 230 * dev;
              const x = 790 - (i + 1) * 62; // يناير على اليمين
              const c = i === 6 ? P.red : i === 11 ? P.green : "#8C8279";
              return <rect key={i} x={x} y={300 - h} width={42} height={h} rx={6} fill={c} opacity={dev} />;
            })}
          </svg>
          <div style={{ position: "absolute", left: 790 - 7 * 62 - 60, top: 300 - (34 / max) * 230 - 74, transform: `scale(${lab})`, padding: "4px 16px 8px", background: P.red, color: "#fff", font: `700 26px ${BODY}`, borderRadius: 10, whiteSpace: "nowrap", direction: "rtl" }}>الأضعف: يوليو</div>
          <div style={{ position: "absolute", left: 790 - 12 * 62 - 16, top: 300 - 230 - 64, transform: `scale(${lab})`, padding: "4px 16px 8px", background: P.green, color: "#fff", font: `700 26px ${BODY}`, borderRadius: 10, whiteSpace: "nowrap", direction: "rtl" }}>الأعلى: ديسمبر</div>
        </div>
      </Tray>
    </Station>
  );
};

/* ───── حبل التجفيف: 4 رسوم تفاعلية ───── */
const Clip: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <Abs x={x - 14} y={y - 30} w={28} h={70} style={{ borderRadius: 6, background: "linear-gradient(90deg,#B98A55,#E0B884,#B98A55)", boxShadow: "0 4px 6px rgba(0,0,0,.4)", zIndex: 3 }} />
);
const ChartBar = () => (
  <svg viewBox="0 0 200 120" style={{ width: "100%", height: "100%" }}>
    {[50, 80, 60, 100, 70].map((v, i) => <rect key={i} x={170 - i * 36} y={115 - v} width={24} height={v} rx={4} fill={i === 3 ? "#10A37F" : "#8C8279"} />)}
  </svg>
);
const ChartLine = () => (
  <svg viewBox="0 0 200 120" style={{ width: "100%", height: "100%" }}>
    <polyline points="10,90 50,70 90,78 130,40 170,28 195,20" fill="none" stroke="#5AA9E6" strokeWidth={5} strokeLinejoin="round" />
    {[[10, 90], [50, 70], [90, 78], [130, 40], [170, 28]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={6} fill="#fff" stroke="#5AA9E6" strokeWidth={3} />)}
  </svg>
);
const ChartPie = () => (
  <svg viewBox="0 0 200 120" style={{ width: "100%", height: "100%" }}>
    <circle cx={100} cy={60} r={54} fill="#8C8279" />
    <path d="M100 60 L100 6 A54 54 0 0 1 151 78 Z" fill="#10A37F" />
    <path d="M100 60 L151 78 A54 54 0 0 1 70 105 Z" fill="#FFB347" />
  </svg>
);
const ChartScatter = () => (
  <svg viewBox="0 0 200 120" style={{ width: "100%", height: "100%" }}>
    {[[20, 95], [40, 80], [55, 85], [70, 66], [90, 60], [105, 52], [125, 45], [140, 38], [160, 30], [180, 18], [60, 100], [150, 55]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={7} fill={i % 3 ? "#FFB347" : "#E0312B"} opacity={0.9} />)}
  </svg>
);
const Charts: React.FC<{ f: number }> = ({ f }) => {
  const lf = local(f, "charts");
  const prints: [number, number, string, React.FC][] = [
    [560, 640, "أعمدة", ChartBar],
    [80, 640, "خطي", ChartLine],
    [560, 1040, "دائري", ChartPie],
    [80, 1040, "نقاط", ChartScatter],
  ];
  const btn = ease(lf, 110, 14, BACK);
  const cur = ease(lf, 130, 26, IN_OUT);
  const tip = ease(lf, 160, 12, BACK);
  return (
    <Station k="charts">
      {[620, 1020].map((y) => (
        <Abs key={y} x={-80} y={y} w={1240} h={4} style={{ background: "#8A7A70" }} />
      ))}
      {prints.map(([x, y, t, C], i) => {
        const p = ease(lf, 20 + i * 18, 16, BACK);
        const sw = Math.sin(f / 22 + i) * 1.2;
        return (
          <React.Fragment key={t}>
            <Abs x={x} y={y} w={440} h={340} style={{ transformOrigin: "50% 0", transform: `rotate(${sw}deg) translateY(${(1 - p) * -60}px)`, opacity: p, background: P.paper, boxShadow: "0 18px 30px rgba(0,0,0,.55)", padding: "26px 26px 0", direction: "rtl" }}>
              <div style={{ height: 220 }}>
                <C />
              </div>
              <div style={{ textAlign: "center", font: `700 38px/1.5 ${BODY}`, color: P.ink }}>{t}</div>
            </Abs>
            <Clip x={x + 220} y={y} />
          </React.Fragment>
        );
      })}
      {/* زر التحويل للتفاعلي ومؤشر وتلميح على الرسم الخطي */}
      <Abs x={110} y={670} style={{ transform: `scale(${btn})`, transformOrigin: "left top", padding: "6px 16px 8px", borderRadius: 10, background: P.ink, color: "#fff", font: `700 22px ${EN}`, whiteSpace: "nowrap", zIndex: 4 }}>Switch to interactive chart</Abs>
      {cur > 0 ? (
        <Abs x={150 + cur * 200} y={760 + cur * 30} style={{ zIndex: 5 }}>
          <svg width="40" height="48" viewBox="0 0 20 24"><path d="M2 2l14 9-6 1.5 3.5 7-2.5 1.2-3.5-7L3 18z" fill="#fff" stroke="#1A1414" strokeWidth="1.4" /></svg>
        </Abs>
      ) : null}
      <Abs x={330} y={700} style={{ transform: `scale(${tip})`, transformOrigin: "left bottom", padding: "6px 16px 10px", borderRadius: 10, background: "#fff", boxShadow: "0 6px 14px rgba(0,0,0,.35)", font: `700 26px ${BODY}`, color: P.ink, whiteSpace: "nowrap", direction: "rtl", zIndex: 4 }}>
        مارس · <span style={{ font: `700 26px ${MONO}`, direction: "ltr", unicodeBidi: "isolate" }}>5,200</span>
      </Abs>
    </Station>
  );
};

/* ───── ورقة التلميحات: الملخص بالأرقام ───── */
const Sum: React.FC<{ f: number }> = ({ f }) => {
  const lf = local(f, "sum");
  const frames: [string, React.ReactNode, string][] = [
    ["أعلى منتج", "الفراولة", P.green],
    ["أضعف شهر", "يوليو", P.red],
    ["النمو في آخر ربع", <span key="g" style={{ direction: "ltr", unicodeBidi: "isolate" }}>+18%</span>, P.amber],
  ];
  return (
    <Station k="sum">
      <Abs x={80} y={570} w={920} h={760} style={{ background: "#0B0808", borderRadius: 10, boxShadow: "0 24px 40px rgba(0,0,0,.6)" }}>
        {[0, 1].map((s) => (
          <div key={s} style={{ position: "absolute", top: 0, bottom: 0, [s ? "left" : "right"]: 14, width: 34, background: "repeating-linear-gradient(180deg, transparent 0 18px, #3A302C 18px 40px)" }} />
        ))}
        {frames.map(([a, b, c], i) => {
          const p = ease(lf, 24 + i * 34, 30, OUT);
          return (
            <div key={a} style={{ position: "absolute", left: 70, right: 70, top: 34 + i * 236, height: 210, borderRadius: 6, background: `linear-gradient(180deg, rgba(60,40,36,${p}), rgba(30,20,18,${p}))`, border: "2px solid #4A3A35", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 40px", direction: "rtl", opacity: 0.25 + 0.75 * p }}>
              <div style={{ font: `700 32px ${BODY}`, color: c }}>{a}</div>
              <div style={{ font: `900 84px/1.25 ${DISPLAY}`, color: "#fff", filter: `blur(${(1 - p) * 8}px)` }}>{b}</div>
            </div>
          );
        })}
        <div style={{ position: "absolute", bottom: 18, left: 70, padding: "2px 14px 6px", border: "2px dashed #8A7A70", color: "#C9B9AE", font: `700 24px ${BODY}` }}>مثال</div>
      </Abs>
    </Station>
  );
};

/* ───── قبل ما تبدأ: 4 بطاقات ───── */
const Tips: React.FC<{ f: number }> = ({ f }) => {
  const lf = local(f, "tips");
  const cards: [string, React.ReactNode][] = [
    ["حجم الملف", <>لين <span key="m" style={{ direction: "ltr", unicodeBidi: "isolate", fontFamily: "Space Grotesk" }}>50MB</span> تقريباً</>],
    ["النسخة المجانية", <>3 ملفات باليوم</>],
    ["الجدول", <>تنزّله <span key="c" style={{ direction: "ltr", unicodeBidi: "isolate", fontFamily: "Space Grotesk" }}>CSV</span> من زر التنزيل</>],
    ["قبل ما تعتمد الرقم", <>اطلب يوريك الحساب خطوة بخطوة</>],
  ];
  const pos = [
    [560, 580],
    [80, 580],
    [560, 960],
    [80, 960],
  ];
  return (
    <Station k="tips">
      {cards.map(([t, b], i) => {
        const p = ease(lf, 16 + i * 22, 16, BACK);
        const [x, y] = pos[i];
        return (
          <Abs key={t} x={x} y={y} w={440} h={330} style={{ transform: `rotate(${[-2, 2, 1.5, -1.5][i]}deg) scale(${0.7 + 0.3 * p})`, opacity: p, background: P.paper, boxShadow: "0 18px 30px rgba(0,0,0,.55)", padding: "50px 34px 0", direction: "rtl" }}>
            <div style={{ position: "absolute", top: -16, left: 150, width: 140, height: 40, background: "rgba(255,220,170,.7)", transform: "rotate(-3deg)" }} />
            <div style={{ font: `700 32px ${BODY}`, color: i === 3 ? P.red : P.green }}>{t}</div>
            <div style={{ marginTop: 10, font: `700 44px/1.4 ${BODY}`, color: P.ink }}>{b}</div>
          </Abs>
        );
      })}
    </Station>
  );
};

/* ───── الختام: صورة علي تتحمّض ───── */
const End: React.FC<{ f: number }> = ({ f }) => {
  const lf = local(f, "end");
  const dev = ease(lf, 20, 60, OUT);
  return (
    <Station k="end">
      <Tray x={210} y={560} w={660} h={600} f={f}>
        <div style={{ position: "absolute", left: 60, top: 40, width: 496, height: 496, background: P.paper, padding: 18 }}>
          <Img src={staticFile("avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%", opacity: 0.15 + 0.85 * dev, filter: `brightness(${2 - dev}) contrast(${0.5 + 0.5 * dev}) sepia(${0.4 * (1 - dev)})` }} />
        </div>
      </Tray>
    </Station>
  );
};

export const World: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const c = camX(f);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `translateX(${-c}px)` }}>
      <Room kick={kick} />
      <Hook f={f} />
      <Upload f={f} />
      <Prompt f={f} />
      <Charts f={f} />
      <Sum f={f} />
      <Tips f={f} />
      <End f={f} />
    </div>
  );
};
