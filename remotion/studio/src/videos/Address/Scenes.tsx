import { Img, staticFile } from "remotion";
import { Reveal } from "../ClaudeVsGptPro/kit";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { A, BACK, BODY, DISPLAY, EN, OUT, PIN, SEG, SegK, V, W, ease } from "./theme";

const pop = (lf: number, at: number) => ease(lf, at, 14, BACK);
const local = (f: number, k: SegK) => {
  const [a, b] = SEG[k];
  return { lf: f - a, out: b - a - 12, on: f >= a - 2 && f < b + 2 };
};
const typed = (s: string, lf: number, at: number, d: number) => s.slice(0, Math.round(Math.min(1, Math.max(0, (lf - at) / d)) * s.length));
const halo = "0 0 18px rgba(255,255,255,.95), 0 0 6px rgba(255,255,255,.9)";

const Center: React.FC<{ y: number; children: React.ReactNode }> = ({ y, children }) => (
  <div style={{ position: "absolute", top: y, left: 0, width: W, display: "flex", justifyContent: "center", direction: "rtl" }}>{children}</div>
);


/* ───── الهوك: صورة الرياض الحقيقية — «وصّل للرياض… وين بالضبط؟» ───── */
export const Hook: React.FC<{ f: number }> = ({ f }) => {
  if (f > SEG.hook[1] + 18) return null;
  const lf = f;
  const exit = ease(f, SEG.hook[1] - 6, 22, OUT);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - exit, overflow: "hidden" }}>
      <Img src={V("riyadh.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "38% 50%", transform: `scale(${1.08 + lf * 0.0016 + exit * 0.6})`, filter: `blur(${exit * 8}px)` }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,14,24,.78) 0%, rgba(10,14,24,.25) 38%, rgba(10,14,24,.1) 60%, rgba(10,14,24,.7) 100%)" }} />
      <Center y={270}>
        <Reveal f={lf} at={0} d={14}>
          <div style={{ font: `900 116px/1.25 ${DISPLAY}`, color: "#fff", whiteSpace: "nowrap" }}>تسأله كأنه قوقل؟</div>
        </Reveal>
      </Center>
      <Center y={430}>
        <Reveal f={lf} at={12} d={16}>
          <div style={{ font: `700 50px/1.4 ${DISPLAY}`, color: "#FFD36B", whiteSpace: "nowrap" }}>كأنك تقول للمندوب: وصّل للرياض</div>
        </Reveal>
      </Center>
      {/* رسالة المندوب */}
      <div style={{ position: "absolute", top: 1080, right: 90, left: 90, display: "flex", justifyContent: "center", transform: `scale(${pop(lf, 40)})`, opacity: lf >= 40 ? 1 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 32px 24px", borderRadius: 30, background: "#fff", boxShadow: "0 20px 50px rgba(0,0,0,.35)", direction: "rtl" }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: A.task, display: "grid", placeItems: "center" }}>
            <svg width={44} height={44} viewBox="0 0 24 24">
              <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" fill="#fff" />
              <circle cx={7} cy={17.5} r={2} fill={A.ink} />
              <circle cx={17} cy={17.5} r={2} fill={A.ink} />
            </svg>
          </div>
          <div>
            <div style={{ font: `700 28px ${BODY}`, color: A.sub }}>المندوب</div>
            <div style={{ font: `800 46px ${DISPLAY}`, color: A.ink }}>الرياض كبيرة… وين بالضبط؟</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ───── الفكرة: قوقل يدوّر… والذكاء الاصطناعي يشتغل ───── */
export const Idea: React.FC<{ f: number }> = ({ f }) => {
  const { lf, out, on } = local(f, "idea");
  if (!on) return null;
  const gone = 1 - ease(lf, out, 12);
  const card = (p: number, children: React.ReactNode, top: number) => (
    <div style={{ position: "absolute", top, left: 80, right: 80, transform: `translateY(${(1 - p) * 60}px)`, opacity: p * gone }}>
      <div style={{ padding: "26px 32px 30px", borderRadius: 30, background: "rgba(255,255,255,.96)", boxShadow: "0 24px 60px rgba(19,22,28,.22)", direction: "rtl" }}>{children}</div>
    </div>
  );
  const q = typed("خطة تسويق", lf, 34, 22);
  return (
    <>
      <Center y={290}>
        <Reveal f={lf} at={4} d={18} out={out}>
          <div style={{ font: `900 80px/1.3 ${DISPLAY}`, color: A.ink, textShadow: halo, whiteSpace: "nowrap" }}>قوقل يدوّر لك…</div>
        </Reveal>
      </Center>
      <Center y={400}>
        <Reveal f={lf} at={14} d={18} out={out}>
          <div style={{ font: `900 70px/1.3 ${DISPLAY}`, color: A.route, textShadow: halo, whiteSpace: "nowrap" }}>والذكاء الاصطناعي يشتغل لك</div>
        </Reveal>
      </Center>
      {card(
        ease(lf, 24, 18),
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 24px", borderRadius: 999, border: "3px solid #DADCE0", direction: "rtl" }}>
            <Img src={V("google-color.svg")} style={{ width: 52, height: 52 }} />
            <div style={{ flex: 1, font: `700 42px ${BODY}`, color: A.ink, minHeight: 56 }}>{q}</div>
            <svg width={40} height={40} viewBox="0 0 24 24">
              <circle cx={10} cy={10} r={6.5} fill="none" stroke={A.sub} strokeWidth={2.4} />
              <path d="M15 15l6 6" stroke={A.sub} strokeWidth={2.4} strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ opacity: ease(lf, 60 + i * 6, 10), display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ height: 14, width: `${70 - i * 12}%`, borderRadius: 7, background: "#1A0DAB", opacity: 0.75 }} />
                <div style={{ height: 10, width: `${90 - i * 8}%`, borderRadius: 5, background: "#C9CCD3" }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, font: `700 36px ${BODY}`, color: A.sub }}>كلمات ← روابط، وأنت تقرأ وتجمع</div>
        </>,
        560,
      )}
      {card(
        ease(lf, 96, 18),
        <>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            {["claude-color.svg", "openai.svg", "gemini-color.svg"].map((s) => (
              <div key={s} style={{ width: 70, height: 70, borderRadius: 18, background: "#F3F4F6", display: "grid", placeItems: "center" }}>
                <Img src={V(s)} style={{ width: 46, height: 46 }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, font: `800 44px/1.4 ${DISPLAY}`, color: A.ink }}>
            مهمة واضحة ← <span style={{ color: A.route }}>شغل جاهز</span>
          </div>
          <div style={{ font: `700 34px ${BODY}`, color: A.sub }}>مثل موظف جديد ذكي… بس يحتاج تفاصيل</div>
        </>,
        980,
      )}
    </>
  );
};

/* ───── عنوان كل مستوى ───── */
const LEVELS: { k: SegK; n: string; tag: string; title: string; c: string; chip: string }[] = [
  { k: "role", n: "1", tag: "الدور", title: "قل له مين يكون", c: A.role, chip: "الحي" },
  { k: "task", n: "2", tag: "المهمة", title: "وش يسوي بالضبط؟", c: A.task, chip: "الشارع" },
  { k: "ctx", n: "3", tag: "السياق", title: "وش لازم يعرف؟", c: A.ctx, chip: "المبنى" },
  { k: "fmt", n: "4", tag: "الشكل", title: "كيف تبي الرد؟", c: A.fmt, chip: "الباب ✓" },
];
export const LevelTitles: React.FC<{ f: number }> = ({ f }) => (
  <>
    {LEVELS.map((L) => {
      const { lf, out, on } = local(f, L.k);
      if (!on) return null;
      return (
        <div key={L.k}>
          <Center y={285}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 26px 12px 14px", borderRadius: 999, background: L.c, color: "#fff", transform: `scale(${pop(lf, 2) * (1 - ease(lf, out, 12))})`, boxShadow: "0 10px 24px rgba(19,22,28,.2)" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fff", color: L.c, display: "grid", placeItems: "center", font: `900 30px ${EN}` }}>{L.n}</div>
              <div style={{ font: `800 36px ${DISPLAY}` }}>{L.tag}</div>
            </div>
          </Center>
          <Center y={370}>
            <Reveal f={lf} at={6} d={18} out={out}>
              <div style={{ font: `900 96px/1.3 ${DISPLAY}`, color: A.ink, textShadow: halo, whiteSpace: "nowrap" }}>{L.title}</div>
            </Reveal>
          </Center>
        </div>
      );
    })}
  </>
);

/* ───── الدبوس ووسم الدقة ───── */
export const Pin: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const s0 = SEG.idea[1] - 20;
  if (f < s0 || f > SEG.end[0] + 40) return null;
  let chip = "المدينة؟";
  let c = A.pin;
  let bounce = pop(f - s0, 0);
  for (const L of LEVELS) {
    if (f >= SEG[L.k][0] + 10) {
      chip = L.chip;
      c = L.c;
      bounce = pop(f - SEG[L.k][0], 10);
    }
  }
  const fade = 1 - ease(f, SEG.fmt[0] + 146, 8);
  return (
    <div style={{ position: "absolute", left: PIN.x - 50, top: PIN.y - 128, width: 100, opacity: fade }}>
      <svg width={100} height={130} viewBox="0 0 40 52" style={{ transform: `translateY(${(1 - bounce) * -40}px) scale(${1 + kick * 0.04})`, transformOrigin: "50% 100%", filter: "drop-shadow(0 8px 10px rgba(0,0,0,.3))" }}>
        <path d="M20 51C20 51 4 31 4 19a16 16 0 0 1 32 0c0 12-16 32-16 32z" fill={A.pin} stroke="#fff" strokeWidth={2.5} />
        <circle cx={20} cy={19} r={6.5} fill="#fff" />
      </svg>
      <div style={{ position: "absolute", top: -64, left: 50, transform: "translateX(-50%)", padding: "6px 22px 10px", borderRadius: 999, background: c, color: "#fff", font: `800 34px ${DISPLAY}`, whiteSpace: "nowrap", boxShadow: "0 8px 18px rgba(19,22,28,.25)" }}>{chip}</div>
    </div>
  );
};

/* ───── بوليصة الطلب: تكبر سطر سطر ───── */
const ROWS: { k: SegK; label: string; c: string; text: string }[] = [
  { k: "role", label: "الدور", c: A.role, text: "أنت مسوّق لمتجر عطور أونلاين" },
  { k: "task", label: "المهمة", c: A.task, text: "اكتب خطة محتوى لشهر نوفمبر" },
  { k: "ctx", label: "السياق", c: A.ctx, text: "جمهورنا نساء بالخليج، ميزانيتنا صغيرة، وننشر في انستقرام" },
  { k: "fmt", label: "الشكل", c: A.fmt, text: "جدول: اليوم، الفكرة، نوع المنشور، الكابشن" },
];
export const Waybill: React.FC<{ f: number }> = ({ f }) => {
  const s0 = SEG.idea[1] - 30;
  if (f < s0 || f > SEG.end[0] + 30) return null;
  const p = ease(f, s0, 20, OUT) * (1 - ease(f, SEG.end[0], 18));
  const struck = f >= SEG.role[0] + 40;
  const done = f >= SEG.fmt[0] + 120;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 470, transform: `translateY(${(1 - p) * 120}px)`, opacity: p }}>
      <div style={{ position: "relative", borderRadius: 28, background: A.card, boxShadow: "0 26px 60px rgba(19,22,28,.28)", padding: "20px 30px 24px", direction: "rtl", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottom: "3px dashed #E2E4E9" }}>
          <div style={{ font: `900 38px ${DISPLAY}`, color: A.ink }}>بوليصة طلبك</div>
          <div style={{ display: "flex", gap: 3, alignItems: "flex-end", direction: "ltr" }}>
            {Array.from({ length: 22 }, (_, i) => (
              <div key={i} style={{ width: i % 3 === 0 ? 5 : 2.5, height: 34, background: A.ink }} />
            ))}
          </div>
        </div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ padding: "2px 14px 6px", borderRadius: 10, background: "#EEF0F3", font: `700 26px ${BODY}`, color: A.sub }}>قبل</div>
          <div style={{ position: "relative", font: `700 36px ${BODY}`, color: struck ? "#9AA0AC" : A.ink }}>
            «خطة تسويق»
            <div style={{ position: "absolute", right: 0, top: "52%", height: 4, width: `${ease(f, SEG.role[0] + 40, 10) * 100}%`, background: A.pin, borderRadius: 2 }} />
          </div>
          {!struck ? <div style={{ font: `700 30px ${BODY}`, color: A.pin }}>← وين بالضبط؟</div> : null}
        </div>
        {ROWS.map((r) => {
          const a = SEG[r.k][0] + 24;
          if (f < a) return null;
          const t = typed(r.text, f - a, 0, Math.max(24, r.text.length * 0.9));
          return (
            <div key={r.k} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginTop: 14, opacity: ease(f, a, 8) }}>
              <div style={{ flex: "none", width: 112, padding: "4px 0 8px", textAlign: "center", borderRadius: 12, background: r.c, color: "#fff", font: `800 28px ${DISPLAY}` }}>{r.label}</div>
              <div style={{ font: `700 34px/1.45 ${BODY}`, color: A.ink, paddingTop: 2 }}>{t}</div>
            </div>
          );
        })}
        {done ? (
          <div style={{ position: "absolute", top: 70, left: 26, transform: `rotate(-10deg) scale(${pop(f - SEG.fmt[0] - 120, 0)})`, padding: "6px 22px 10px", border: `5px solid ${A.ctx}`, borderRadius: 14, color: A.ctx, font: `900 40px ${DISPLAY}`, background: "rgba(255,255,255,.9)" }}>
            جاهز للتوصيل ✓
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* ───── اللي يرجع لك: جدول جاهز ───── */
export const Result: React.FC<{ f: number }> = ({ f }) => {
  const a = SEG.fmt[0] + 150;
  if (f < a || f > SEG.fmt[1] + 2) return null;
  const p = pop(f, a) * (1 - ease(f, SEG.fmt[1] - 12, 12));
  const cols = ["اليوم", "الفكرة", "النوع", "الكابشن"];
  return (
    <div style={{ position: "absolute", top: 520, left: 110, right: 110, transform: `scale(${p})`, opacity: p > 0 ? 1 : 0 }}>
      <div style={{ borderRadius: 24, background: "#fff", boxShadow: "0 26px 60px rgba(19,22,28,.3)", padding: "18px 22px 22px", direction: "rtl" }}>
        <div style={{ font: `800 34px ${DISPLAY}`, color: A.fmt, marginBottom: 10 }}>يرجع لك جدول جاهز تنشر منه</div>
        <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1.4fr 0.9fr 1.6fr", gap: 6 }}>
          {cols.map((c) => (
            <div key={c} style={{ padding: "6px 10px 8px", borderRadius: 8, background: A.fmt, color: "#fff", font: `800 26px ${DISPLAY}`, textAlign: "center" }}>{c}</div>
          ))}
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} style={{ height: 34, borderRadius: 8, background: "#F1EEFB", display: "flex", alignItems: "center", padding: "0 10px", opacity: ease(f, a + 10 + Math.floor(i / 4) * 6, 8) }}>
              <div style={{ height: 10, width: `${55 + ((i * 17) % 40)}%`, borderRadius: 5, background: "#C9BDF0" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ───── الختام: الطلب وصل للباب، وعلي داخل دبوس ───── */
export const End: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const lf = f - SEG.end[0];
  if (lf < 16) return null;
  const dim = ease(lf, 16, 18);
  const pinP = pop(lf, 26);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 50% at 50% 40%, rgba(19,22,28,${0.86 * dim}), rgba(19,22,28,${0.94 * dim}))`, backdropFilter: `blur(${dim * 10}px)` }} />
      <div style={{ position: "absolute", left: W / 2 - 230, top: 300, width: 460, height: 600, transform: `translateY(${(1 - pinP) * -80}px) scale(${pinP})`, transformOrigin: "50% 100%", opacity: pinP > 0 ? 1 : 0 }}>
        <svg width={460} height={600} viewBox="0 0 40 52" style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 20px 30px rgba(0,0,0,.45))" }}>
          <path d="M20 51C20 51 4 31 4 19a16 16 0 0 1 32 0c0 12-16 32-16 32z" fill={A.pin} stroke="#fff" strokeWidth={1.2} />
        </svg>
        <div style={{ position: "absolute", left: 80, top: 68, width: 300, height: 300, borderRadius: "50%", overflow: "hidden", border: "10px solid #fff", boxShadow: `0 0 ${30 + kick * 30}px rgba(255,211,107,.35)` }}>
          <Img src={staticFile("avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%" }} />
        </div>
      </div>
      <Center y={930}>
        <Reveal f={lf} at={44} d={20}>
          <div style={{ font: `900 100px/1.25 ${DISPLAY}`, color: "#fff", whiteSpace: "nowrap" }}>علي التميمي</div>
        </Reveal>
      </Center>
      <Center y={1070}>
        <Reveal f={lf} at={58} d={20}>
          <div style={{ font: `800 54px/1.35 ${DISPLAY}`, color: "#FFD36B", whiteSpace: "nowrap" }}>وش سؤال سألته كأنه قوقل؟</div>
        </Reveal>
      </Center>
      <Center y={1160}>
        <Reveal f={lf} at={70} d={18}>
          <div style={{ font: `700 38px ${BODY}`, color: "#E7E9EE", whiteSpace: "nowrap" }}>اكتبه بالتعليقات، وأحوّله لك طلب شغل</div>
        </Reveal>
      </Center>
      <Center y={1270}>
        <div style={{ opacity: ease(lf, 82, 14), padding: "14px 30px", borderRadius: 999, background: "#fff" }}>
          <HandlesRow size={34} color={A.ink} />
        </div>
      </Center>
    </>
  );
};

export const Footer: React.FC<{ f: number }> = ({ f }) => {
  const o = ease(f, 6, 12) * (1 - ease(f, SEG.end[0] + 10, 10));
  if (o <= 0) return null;
  const dark = f < SEG.hook[1];
  return (
    <div style={{ position: "absolute", top: 1478, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ padding: "8px 24px", borderRadius: 999, background: dark ? "rgba(255,255,255,.14)" : "rgba(255,255,255,.92)", boxShadow: dark ? undefined : "0 6px 16px rgba(19,22,28,.12)" }}>
        <HandlesRow size={26} color={dark ? "rgba(255,255,255,.9)" : A.ink} />
      </div>
    </div>
  );
};

