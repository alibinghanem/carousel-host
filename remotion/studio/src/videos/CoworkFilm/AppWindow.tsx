import { useMusic } from "../../lib/music";
import { BACK, BODY, EN, IN, K, MONO, OUT, SEG, clamp01, ease } from "./theme";
import { ClaudeLogo, Cursor, CurKey, FileIcon, Folder, popIn } from "./parts";

/**
 * نافذة Claude العائمة (رسم توضيحي بالشعار الحقيقي، مو لقطة رسمية).
 * تبقى نفسها من «وش هو» إلى «الأمان» وتتغير حالتها داخلياً، فالفيلم لقطة متصلة.
 * إحداثيات داخل النافذة: 860×600 · الشريط الجانبي يمين · مربع الرسالة أسفل.
 */
export const WX = 110;
export const WY = 650;
const WW = 860;
const WH = 600;

const TASK = "رتّب فواتير سبتمبر حسب المورد، وسوّ جدول ملخص";
const PLAN = ["أقرأ 23 فاتورة في مجلد سبتمبر", "أصنّفها حسب المورد", "أنشئ مجلد لكل مورد وأنقلها", "أسوّي جدول ملخص (Excel)"];

const CURSOR: CurKey[] = [
  { f: 128, x: 560, y: 760 },
  { f: 156, x: 192, y: 556 },
  { f: 160, x: 192, y: 556, click: true },
  { f: 240, x: 260, y: 520 },
  { f: 372, x: 330, y: 505, click: true },
  { f: 540, x: 330, y: 505 },
  { f: 572, x: 66, y: 421 },
  { f: 578, x: 66, y: 421, click: true },
  { f: 930, x: 66, y: 421 },
  { f: 952, x: 765, y: 222 },
  { f: 956, x: 765, y: 222, click: true },
  { f: 1180, x: 500, y: 300 },
  { f: 1206, x: 596, y: 268 },
  { f: 1210, x: 596, y: 268, click: true },
  { f: 1300, x: 420, y: 420 },
  { f: 1342, x: 430, y: 388 },
  { f: 1346, x: 430, y: 388, click: true },
];

const typed = (t: string, f: number, a: number, d: number) => t.slice(0, Math.round(clamp01((f - a) / d) * t.length));

const fade = (f: number, a: number, b: number, d = 12) => ease(f, a, d) * (1 - ease(f, b - d, d));

export const AppWindow: React.FC<{ f: number }> = ({ f }) => {
  const { kick } = useMusic();
  const [a] = SEG.what;
  const [endA] = SEG.end;
  if (f < a - 4 || f > endA + 20) return null;
  // دخول من نقطة «Cowork» في الهوك (match cut) · خروج للأعلى قبل الختام
  const inP = ease(f, a - 4, 26, OUT);
  const outP = ease(f, endA - 14, 22, IN);
  // نبضة صغيرة على بداية كل مشهد
  const cuts = [SEG.how[0], SEG.does[0], SEG.sched[0], SEG.safe[0]];
  const punch = cuts.reduce((m, c) => Math.max(m, f >= c && f < c + 16 ? 1 - (f - c) / 16 : 0), 0);
  const scale = (0.55 + 0.45 * inP) * (1 - 0.12 * outP) * (1 - 0.018 * punch) * (1 + kick * 0.004);
  const ty = (1 - inP) * 160 - outP * 700;
  const rx = (1 - inP) * 24;

  const isWhat = f < SEG.how[0];
  const isHow = f >= SEG.how[0] && f < SEG.does[0];
  const isDoes = f >= SEG.does[0] && f < SEG.sched[0];
  const isSched = f >= SEG.sched[0] && f < SEG.safe[0];
  const isSafe = f >= SEG.safe[0];

  // مربع الرسالة
  const coworkOn = ease(f, 160, 10, OUT);
  const taskText = isHow ? (f < 470 ? typed(TASK, f, 382, 70) : "") : "";
  const schedText = isSched ? (f < 948 ? typed("/schedule", f, 912, 20) : "") : "";
  const placeholder = !taskText && !schedText;

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, perspective: 1600, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: WX,
          top: WY,
          width: WW,
          height: WH,
          transform: `translateY(${ty}px) rotateX(${rx}deg) scale(${scale})`,
          transformOrigin: "50% 40%",
          opacity: Math.min(1, inP * 1.4) * (1 - outP),
          filter: outP > 0.05 ? `blur(${outP * 14}px)` : undefined,
        }}
      >
        {/* الظل والجسم */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 34,
            background: K.ivory,
            boxShadow: "0 50px 90px rgba(90,30,10,.38), 0 10px 24px rgba(90,30,10,.18), inset 0 0 0 2px rgba(255,255,255,.7)",
            overflow: "hidden",
          }}
        >
          {/* الشريط العلوي */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 60, borderBottom: `2px solid ${K.line}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <div style={{ position: "absolute", left: 22, top: 22, display: "flex", gap: 8 }}>
              {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
                <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
              ))}
            </div>
            <ClaudeLogo size={28} />
            <span style={{ font: `700 26px ${EN}`, color: K.ink }}>Claude</span>
          </div>
          {/* الشريط الجانبي (يمين) */}
          <div style={{ position: "absolute", top: 60, right: 0, width: 190, bottom: 0, background: K.ivory2, borderLeft: `2px solid ${K.line}`, padding: "22px 18px", direction: "rtl" }}>
            {[0.8, 0.6, 0.7].map((w, i) => (
              <div key={i} style={{ height: 14, width: `${w * 100}%`, borderRadius: 7, background: K.line, marginBottom: 22 }} />
            ))}
            {(() => {
              const on = isSched ? ease(f, 956, 10, OUT) : 0;
              return (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 14, background: on > 0 ? `rgba(217,119,87,${0.18 * on})` : "transparent", border: `2px solid rgba(217,119,87,${on})`, marginTop: 6 }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={on > 0.5 ? K.clay2 : K.sub} strokeWidth="2.2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" strokeLinecap="round" />
                  </svg>
                  <span style={{ font: `700 24px ${EN}`, color: on > 0.5 ? K.clay2 : K.sub }}>Scheduled</span>
                </div>
              );
            })()}
            {[0.5, 0.75].map((w, i) => (
              <div key={i} style={{ height: 14, width: `${w * 100}%`, borderRadius: 7, background: K.line, marginTop: 24 }} />
            ))}
          </div>

          {/* المنطقة الرئيسية */}
          <div style={{ position: "absolute", top: 60, left: 0, width: 670, height: 410 }}>
            {/* «وش هو»: الشاشة الرئيسية */}
            {isWhat || (isSched && f < 968) ? (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, opacity: isWhat ? fade(f, a, SEG.how[0]) : fade(f, SEG.sched[0], 968, 8) }}>
                <ClaudeLogo size={84} style={{ transform: `rotate(${f * 0.6}deg)` }} />
                <div style={{ font: `700 36px ${BODY}`, color: K.ink, direction: "rtl" }}>وش المهمة اليوم؟</div>
              </div>
            ) : null}
            {/* «كيف»: الخطة */}
            {isHow && f >= 470 ? (
              <PlanCard f={f} at={474} />
            ) : null}
            {/* «يشتغل»: تقدّم + مجلدات + مخرجات */}
            {isDoes ? <WorkView f={f} at={SEG.does[0]} /> : null}
            {/* «جدولها» */}
            {isSched ? <SchedCard f={f} at={964} /> : null}
            {/* «الأمان» */}
            {isSafe ? <SafeCard f={f} at={SEG.safe[0]} /> : null}
          </div>

          {/* مربع الرسالة */}
          <div style={{ position: "absolute", left: 20, top: 470, width: 630, height: 115, borderRadius: 24, background: "#fff", border: `2px solid ${coworkOn > 0.5 ? K.clay : K.line}`, boxShadow: "0 6px 16px rgba(20,20,19,.06)", direction: "rtl" }}>
            <div style={{ position: "absolute", top: 12, right: 22, left: 22, font: `600 24px/1.4 ${BODY}`, color: placeholder ? "#A8A69E" : K.ink, whiteSpace: "nowrap", overflow: "hidden" }}>
              {schedText ? <span style={{ fontFamily: MONO, fontWeight: 800, direction: "ltr", unicodeBidi: "isolate", color: K.clay2 }}>{schedText}</span> : taskText || "اوصف المهمة…"}
              {(taskText && taskText.length < TASK.length) || (schedText && schedText.length < 9) ? <span style={{ color: K.clay }}>|</span> : null}
            </div>
            <div style={{ position: "absolute", left: 16, bottom: 12, display: "flex", gap: 6, padding: 4, borderRadius: 999, background: K.ivory2, direction: "ltr" }}>
              {["Chat", "Cowork"].map((t, i) => {
                const on = i === 1 ? coworkOn : 1 - coworkOn;
                return (
                  <div key={t} style={{ padding: "5px 18px 7px", borderRadius: 999, background: on > 0.5 ? (i === 1 ? K.clay : "#fff") : "transparent", color: on > 0.5 ? (i === 1 ? "#fff" : K.ink) : K.sub, font: `700 22px ${EN}`, boxShadow: on > 0.5 ? "0 2px 6px rgba(0,0,0,.12)" : undefined }}>
                    {t}
                  </div>
                );
              })}
            </div>
            <div style={{ position: "absolute", right: 16, bottom: 12, width: 38, height: 38, borderRadius: 19, border: `2px solid ${K.line}`, display: "grid", placeItems: "center", font: `700 26px ${EN}`, color: K.sub }}>+</div>
          </div>

          {/* نافذة تأكيد الحذف */}
          {isSafe ? <DeleteModal f={f} at={1290} /> : null}
        </div>
        <Cursor f={f} keys={CURSOR} show={fade(f, 128, 640) + (f > 900 && f < 1430 ? fade(f, 930, 1420) : 0)} />
      </div>
    </div>
  );
};

/** بطاقة الخطة: Claude يعرض الخطوات قبل ما يبدأ */
const PlanCard: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const p = ease(f, at, 18, OUT);
  return (
    <div style={{ position: "absolute", left: 20, top: 14, width: 630, height: 380, borderRadius: 24, background: "#fff", border: `2px solid ${K.line}`, padding: "18px 24px", direction: "rtl", opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <ClaudeLogo size={30} />
        <span style={{ font: `700 30px ${BODY}`, color: K.ink }}>الخطة</span>
      </div>
      {PLAN.map((s, i) => {
        const r = ease(f, at + 10 + i * 9, 14, OUT);
        const done = 0;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, height: 58, opacity: r, transform: `translateX(${(1 - r) * -20}px)` }}>
            <div style={{ width: 34, height: 34, borderRadius: 17, border: `3px solid ${done > 0.5 ? K.ok : K.line}`, background: done > 0.5 ? K.ok : "transparent", display: "grid", placeItems: "center", color: "#fff", font: `800 20px ${BODY}` }}>
              {done > 0.5 ? "✓" : <span style={{ color: K.sub, fontFamily: EN }}>{i + 1}</span>}
            </div>
            <span style={{ font: `600 27px ${BODY}`, color: K.ink }}>{s}</span>
          </div>
        );
      })}
      {f >= 584 ? (
        <div style={{ position: "absolute", left: 96, bottom: 28, display: "flex", alignItems: "center", gap: 10, font: `700 24px ${BODY}`, color: K.clay2, opacity: ease(f, 584, 10) }}>
          <div style={{ width: 24, height: 24, borderRadius: 12, border: `4px solid ${K.line}`, borderTopColor: K.clay, transform: `rotate(${f * 14}deg)` }} />
          بدأ الشغل…
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 22, bottom: 16, width: 56, height: 56, borderRadius: 28, background: K.clay, display: "grid", placeItems: "center", boxShadow: `0 6px 14px ${K.clay}66`, transform: `scale(${f >= 578 && f < 590 ? 0.9 : 1})` }}>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M8 5l11 7-11 7z" fill="#fff" />
        </svg>
      </div>
    </div>
  );
};

/** أثناء الشغل: الخطوات تتشيّك، الفواتير تطير لمجلداتها، والمخرجات تطلع */
const WorkView: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const lf = f - at;
  const folders = ["النور", "الريم", "الوفرة"];
  const files = Array.from({ length: 9 }, (_, i) => i);
  return (
    <div style={{ position: "absolute", inset: 0, direction: "rtl" }}>
      {/* يمين: التقدّم */}
      <div style={{ position: "absolute", right: 20, top: 16, width: 270 }}>
        {PLAN.map((s, i) => {
          const st = 20 + i * 42;
          const done = ease(lf, st + 34, 6);
          const active = lf >= st && done < 1;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, height: 64, opacity: lf >= st - 6 ? 1 : 0.35 }}>
              <div style={{ position: "relative", width: 32, height: 32, flex: "none" }}>
                {done > 0.5 ? (
                  <div style={{ width: 32, height: 32, borderRadius: 16, background: K.ok, color: "#fff", display: "grid", placeItems: "center", font: `800 20px ${BODY}` }}>✓</div>
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: 16, border: `4px solid ${K.line}`, borderTopColor: active ? K.clay : K.line, transform: `rotate(${lf * 14}deg)` }} />
                )}
              </div>
              <span style={{ font: `600 22px/1.3 ${BODY}`, color: K.ink }}>{s}</span>
            </div>
          );
        })}
      </div>
      {/* يسار: المجلدات */}
      <div style={{ position: "absolute", left: 20, top: 14, width: 350, display: "flex", justifyContent: "space-between" }}>
        {folders.map((n, i) => (
          <div key={n} style={{ transform: `scale(${1 + (lf > 90 + i * 8 && lf < 104 + i * 8 ? 0.08 : 0)})` }}>
            <Folder w={100} label={n} fill={ease(lf, 70 + i * 10, 40)} />
          </div>
        ))}
      </div>
      {files.map((i) => {
        const t = ease(lf, 56 + i * 6, 22, OUT);
        const fx = 150 + (i % 5) * 46;
        const fy = 230 + Math.floor(i / 5) * 40;
        const tx = 70 + (i % 3) * 125;
        const tyy = 60;
        const x = fx + (tx - fx) * t;
        const y = fy + (tyy - fy) * t - Math.sin(t * Math.PI) * 60;
        if (t >= 1) return null;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, transform: `scale(${1 - t * 0.5}) rotate(${(i % 3 - 1) * 12 * (1 - t)}deg)`, opacity: lf < 40 ? ease(lf, 30, 10) : 1 }}>
            <FileIcon ext="pdf" w={40} />
          </div>
        );
      })}
      {/* المخرجات */}
      <div style={{ position: "absolute", left: 20, top: 250, width: 350, display: "flex", justifyContent: "space-around" }}>
        {[
          ["xlsx", "جدول"],
          ["docx", "مستند"],
          ["pptx", "عرض"],
        ].map(([e, l], i) => (
          <div key={e} style={{ transform: `scale(${popIn(lf, 150 + i * 10)})` }}>
            <FileIcon ext={e} w={56} label={l} />
          </div>
        ))}
      </div>
    </div>
  );
};

/** بطاقة المهمة المجدولة */
const SchedCard: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const p = ease(f, at, 18, OUT);
  const lf = f - at;
  return (
    <div style={{ position: "absolute", left: 20, top: 14, width: 630, height: 380, borderRadius: 24, background: "#fff", border: `2px solid ${K.line}`, padding: "22px 26px", direction: "rtl", opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
      <div style={{ font: `700 32px ${BODY}`, color: K.ink }}>تقرير المبيعات الأسبوعي</div>
      <div style={{ display: "flex", gap: 14, marginTop: 18, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 18px", borderRadius: 14, background: K.ivory2, font: `700 26px ${BODY}`, color: K.ink }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={K.clay2} strokeWidth="2.2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" strokeLinecap="round" />
          </svg>
          كل أحد · <span style={{ fontFamily: MONO, fontWeight: 800, direction: "ltr", unicodeBidi: "isolate" }}>8:00</span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 18px", borderRadius: 14, background: "rgba(217,119,87,.14)", font: `700 26px ${BODY}`, color: K.clay2 }}>
          <svg width="30" height="26" viewBox="0 0 30 22" fill={K.clay2}>
            <path d="M24 9a6 6 0 00-11.6-1.8A5 5 0 004 12a5 5 0 005 5h15a4 4 0 000-8z" />
          </svg>
          يشتغل في السحابة
        </span>
      </div>
      {/* خط زمني: أربعة أسابيع تنبض */}
      <div style={{ position: "absolute", left: 30, right: 30, bottom: 60, height: 6, borderRadius: 3, background: K.line }} />
      {[0, 1, 2, 3].map((i) => {
        const t = ease(lf, 30 + i * 26, 12, BACK);
        const ring = lf - (30 + i * 26);
        return (
          <div key={i} style={{ position: "absolute", right: 40 + i * 175, bottom: 40 }}>
            {ring > 0 && ring < 24 ? <div style={{ position: "absolute", left: 23 - ring * 1.5, top: 23 - ring * 1.5, width: ring * 3, height: ring * 3, borderRadius: "50%", border: `3px solid ${K.clay}`, opacity: 1 - ring / 24 }} /> : null}
            <div style={{ width: 46, height: 46, borderRadius: 23, background: t > 0.5 ? K.clay : "#fff", border: `3px solid ${K.clay}`, transform: `scale(${0.6 + 0.4 * t})`, display: "grid", placeItems: "center", color: "#fff", font: `800 20px ${BODY}` }}>{t > 0.5 ? "✓" : ""}</div>
            <div style={{ position: "absolute", top: 54, left: -20, width: 86, textAlign: "center", font: `600 20px ${BODY}`, color: K.sub }}>أحد {i + 1}</div>
          </div>
        );
      })}
    </div>
  );
};

/** وضع الموافقة: Manual · Auto · Skip */
const MODES = [
  { k: "Manual", d: "يستأذنك قبل الخطوات" },
  { k: "Auto", d: "يفحص كل خطوة ويمنع غير الآمن" },
  { k: "Skip", d: "بدون فحص: للمهام الموثوقة فقط" },
];
const SafeCard: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const p = ease(f, at, 18, OUT);
  const sel = f >= 1210 ? 1 : 0;
  return (
    <div style={{ position: "absolute", left: 20, top: 14, width: 630, height: 380, borderRadius: 24, background: "#fff", border: `2px solid ${K.line}`, padding: "20px 24px", direction: "rtl", opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
      <div style={{ font: `700 30px ${BODY}`, color: K.ink, marginBottom: 12 }}>وضع الموافقة</div>
      {MODES.map((m, i) => {
        const r = ease(f, at + 10 + i * 8, 14, OUT);
        const on = i === sel;
        const warn = i === 2;
        return (
          <div
            key={m.k}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "12px 16px",
              marginBottom: 12,
              borderRadius: 18,
              border: `3px solid ${on ? K.clay : warn ? "rgba(229,72,77,.35)" : K.line}`,
              background: on ? "rgba(217,119,87,.10)" : "#fff",
              opacity: r,
              transform: `translateX(${(1 - r) * -24}px)`,
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 14, border: `3px solid ${on ? K.clay : K.line}`, display: "grid", placeItems: "center" }}>{on ? <div style={{ width: 14, height: 14, borderRadius: 7, background: K.clay }} /> : null}</div>
            <span style={{ font: `700 28px ${EN}`, color: warn ? K.warn : K.ink, width: 110, direction: "ltr", textAlign: "right" }}>{m.k}</span>
            <span style={{ font: `600 24px ${BODY}`, color: K.sub }}>{m.d}</span>
          </div>
        );
      })}
    </div>
  );
};

/** الحذف النهائي يحتاج موافقتك */
const DeleteModal: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const p = ease(f, at, 16, BACK);
  const dim = ease(f, at - 4, 12);
  const ok = ease(f, 1350, 12, OUT);
  if (dim <= 0) return null;
  return (
    <div style={{ position: "absolute", inset: 0, background: `rgba(20,20,19,${0.35 * dim})`, display: "grid", placeItems: "center" }}>
      <div style={{ width: 540, padding: "28px 30px 26px", borderRadius: 28, background: "#fff", boxShadow: "0 30px 60px rgba(0,0,0,.35)", direction: "rtl", transform: `scale(${0.85 + 0.15 * p})`, opacity: p, textAlign: "center" }}>
        {ok < 0.5 ? (
          <>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={K.warn} strokeWidth="2">
              <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ font: `700 32px ${BODY}`, color: K.ink, marginTop: 8 }}>حذف نهائي لـ 3 ملفات؟</div>
            <div style={{ font: `600 24px ${BODY}`, color: K.sub, marginTop: 6 }}>Claude ما يحذف شي قبل موافقتك</div>
            <div style={{ display: "inline-block", marginTop: 18, padding: "10px 40px 12px", borderRadius: 16, background: K.clay, color: "#fff", font: `700 28px ${EN}`, transform: `scale(${f >= 1346 && f < 1352 ? 0.92 : 1})` }}>Allow</div>
          </>
        ) : (
          <div style={{ padding: "26px 0", opacity: ok }}>
            <div style={{ width: 70, height: 70, margin: "0 auto", borderRadius: 35, background: K.ok, color: "#fff", display: "grid", placeItems: "center", font: `800 40px ${BODY}` }}>✓</div>
            <div style={{ font: `700 30px ${BODY}`, color: K.ink, marginTop: 14 }}>تم… بعد موافقتك</div>
          </div>
        )}
      </div>
    </div>
  );
};
