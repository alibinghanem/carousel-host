import { Img, staticFile } from "remotion";
import { Reveal } from "../ClaudeVsGptPro/kit";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { BACK, BODY, COLOR, DISPLAY, EN, K, OUT, SEG, SegK, StepK, V, W, ease } from "./theme";

const pop = (lf: number, at: number) => ease(lf, at, 14, BACK);
const fade = (lf: number, at: number, d = 12) => ease(lf, at, d, OUT);
const local = (f: number, k: SegK) => {
  const [a, b] = SEG[k];
  return { lf: f - a, out: b - a - 12, on: f >= a - 2 && f < b + 2 };
};
const typed = (s: string, lf: number, at: number, d: number) => s.slice(0, Math.round(Math.min(1, Math.max(0, (lf - at) / d)) * s.length));
const Center: React.FC<{ y: number; children: React.ReactNode }> = ({ y, children }) => (
  <div style={{ position: "absolute", top: y, left: 0, width: W, display: "flex", justifyContent: "center", direction: "rtl" }}>{children}</div>
);

/* ───── الهوك: كيك حقيقي — «حملة تسويق كاملة… في ساعة وحدة؟» ───── */
export const Hook: React.FC<{ f: number }> = ({ f }) => {
  if (f > SEG.hook[1] + 20) return null;
  const exit = ease(f, SEG.hook[1] - 4, 20, OUT);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", transform: `translateY(${exit * 1920}px)` }}>
      <Img src={V("cake.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "60% 50%", transform: `scale(${1.12 + f * 0.0012})` }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(29,20,14,.82) 0%, rgba(29,20,14,.35) 40%, rgba(29,20,14,.2) 60%, rgba(29,20,14,.75) 100%)" }} />
      <Center y={270}>
        <Reveal f={f} at={0} d={14}>
          <div style={{ font: `700 104px/1.3 ${DISPLAY}`, color: "#fff", whiteSpace: "nowrap" }}>حملة تسويق كاملة</div>
        </Reveal>
      </Center>
      <Center y={410}>
        <Reveal f={f} at={10} d={16}>
          <div style={{ font: `700 120px/1.3 ${DISPLAY}`, color: K.mustard, whiteSpace: "nowrap" }}>في ساعة وحدة؟</div>
        </Reveal>
      </Center>
      <Center y={580}>
        <Reveal f={f} at={22} d={16}>
          <div style={{ font: `700 40px ${BODY}`, color: "#F3E7DA", whiteSpace: "nowrap" }}>مثال: متجر كيك منزلي</div>
        </Reveal>
      </Center>
    </div>
  );
};

/* ───── عنوان الخطوة ───── */
const TITLES: Record<StepK, { mins: string; title: string }> = {
  know: { mins: "10 دقايق", title: "اعرف زبونك" },
  offer: { mins: "10 دقايق", title: "العرض والرسالة" },
  plan: { mins: "15 دقيقة", title: "جدول أسبوعين" },
  write: { mins: "20 دقيقة", title: "اكتب المحتوى" },
  ship: { mins: "5 دقايق", title: "راجع وجدول" },
};
export const StepTitle: React.FC<{ f: number; k: StepK; n: number }> = ({ f, k, n }) => {
  const { lf, out, on } = local(f, k);
  if (!on) return null;
  const t = TITLES[k];
  return (
    <>
      <Center y={250}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "6px 24px 10px 12px", borderRadius: 999, background: COLOR[k], color: k === "know" ? K.ink : "#fff", transform: `scale(${pop(lf, 2) * (1 - ease(lf, out, 12))})`, boxShadow: "0 8px 18px rgba(29,43,42,.18)" }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#fff", color: K.ink, display: "grid", placeItems: "center", font: `800 28px ${EN}` }}>{n}</div>
          <div style={{ font: `700 32px ${BODY}` }}>{t.mins}</div>
        </div>
      </Center>
      <Center y={318}>
        <Reveal f={lf} at={6} d={18} out={out}>
          <div style={{ font: `700 92px/1.3 ${DISPLAY}`, color: K.ink, whiteSpace: "nowrap" }}>{t.title}</div>
        </Reveal>
      </Center>
    </>
  );
};

/* ───── فقاعة الطلب ───── */
const Prompt: React.FC<{ lf: number; out: number; text: string; top: number; logos?: boolean }> = ({ lf, out, text, top, logos }) => {
  const p = pop(lf, 10) * (1 - ease(lf, out, 12));
  return (
    <div style={{ position: "absolute", top, left: 70, right: 70, transform: `translateY(${(1 - p) * 40}px)`, opacity: p > 0 ? 1 : 0 }}>
      <div style={{ padding: "18px 28px 22px", borderRadius: "28px 28px 8px 28px", background: K.ink, color: "#fff", direction: "rtl", boxShadow: "0 16px 30px rgba(29,43,42,.22)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ font: `700 26px ${BODY}`, color: K.mustard }}>تكتب:</div>
          {logos ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center", font: `700 22px ${BODY}`, color: "#B9C6C3" }}>
              أي أداة
              {["claude-color.svg", "openai.svg", "gemini-color.svg"].map((s) => (
                <div key={s} style={{ width: 36, height: 36, borderRadius: 9, background: "#fff", display: "grid", placeItems: "center" }}>
                  <Img src={V(s)} style={{ width: 24, height: 24 }} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div style={{ font: `700 34px/1.5 ${BODY}`, whiteSpace: "pre-line", minHeight: 102 }}>{typed(text, lf, 14, 50)}</div>
      </div>
    </div>
  );
};

const card = (p: number): React.CSSProperties => ({ transform: `translateY(${(1 - p) * 50}px) scale(${0.9 + 0.1 * p})`, opacity: p > 0 ? 1 : 0 });

/* ───── ١ اعرف زبونك ───── */
const PERSONAS = [
  { t: "أم مشغولة", d: "طلب سريع للمناسبات", c: K.mustard },
  { t: "موظف", d: "هدية حلوة لزميله", c: K.tomato },
  { t: "طلاب", d: "حلى بسعر مناسب", c: K.mint },
];
const Person: React.FC<{ c: string }> = ({ c }) => (
  <svg width={90} height={90} viewBox="0 0 40 40">
    <circle cx={20} cy={20} r={20} fill={c} opacity={0.18} />
    <circle cx={20} cy={15} r={7} fill={c} />
    <path d="M8 34c1-7 6-10 12-10s11 3 12 10z" fill={c} />
  </svg>
);
export const Know: React.FC<{ f: number }> = ({ f }) => {
  const { lf, out, on } = local(f, "know");
  if (!on) return null;
  const gone = 1 - ease(lf, out, 12);
  return (
    <>
      <Prompt lf={lf} out={out} top={800} logos text={"عندي متجر كيك منزلي في الرياض.\nحدّد 3 أنواع زبائن: وش يبون، ووش يضايقهم"} />
      <div style={{ position: "absolute", top: 1090, left: 60, right: 60, display: "flex", gap: 18, direction: "rtl" }}>
        {PERSONAS.map((p, i) => (
          <div key={p.t} style={{ flex: 1, ...card(pop(lf, 80 + i * 14) * gone) }}>
            <div style={{ padding: "18px 14px 22px", borderRadius: 26, background: "#fff", textAlign: "center", boxShadow: "0 14px 28px rgba(29,43,42,.14)", borderTop: `10px solid ${p.c}` }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Person c={p.c} />
              </div>
              <div style={{ font: `700 40px ${DISPLAY}`, color: K.ink, marginTop: 4 }}>{p.t}</div>
              <div style={{ font: `700 27px/1.4 ${BODY}`, color: K.sub }}>{p.d}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

/* ───── ٢ العرض والرسالة ───── */
const HOOKS = ["كيكة البيت… بطعم المناسبة", "من فرننا لبابك", "حلاك جاهز قبل ضيوفك"];
export const Offer: React.FC<{ f: number }> = ({ f }) => {
  const { lf, out, on } = local(f, "offer");
  if (!on) return null;
  const gone = 1 - ease(lf, out, 12);
  return (
    <>
      <Prompt lf={lf} out={out} top={800} text={"اقترح عرض واحد مغري يناسبهم،\nو3 جمل تسويقية قصيرة"} />
      <div style={{ position: "absolute", top: 1070, left: 90, right: 90, ...card(pop(lf, 80) * gone) }}>
        <div style={{ position: "relative", padding: "20px 34px 24px", borderRadius: 22, background: K.tomato, color: "#fff", textAlign: "center", boxShadow: "0 16px 30px rgba(200,50,42,.35)", direction: "rtl" }}>
          <div style={{ font: `700 26px ${BODY}`, opacity: 0.85 }}>العرض</div>
          <div style={{ font: `700 50px/1.3 ${DISPLAY}` }}>اطلب قبل الخميس… والتوصيل علينا</div>
          {[0, 1].map((i) => (
            <div key={i} style={{ position: "absolute", top: "50%", [i ? "left" : "right"]: -18, width: 36, height: 36, marginTop: -18, borderRadius: "50%", background: K.tile }} />
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", top: 1250, left: 50, right: 50, display: "flex", gap: 14, justifyContent: "center", direction: "rtl" }}>
        {HOOKS.map((h, i) => (
          <div key={h} style={{ ...card(pop(lf, 120 + i * 16) * gone), transform: `${card(pop(lf, 120 + i * 16) * gone).transform} rotate(${[-3, 2, -2][i]}deg)` }}>
            <div style={{ padding: "12px 18px 16px", borderRadius: 16, background: K.cream, border: `3px solid ${K.ink}`, font: `700 28px ${BODY}`, color: K.ink, whiteSpace: "nowrap", boxShadow: "0 8px 0 rgba(29,43,42,.15)" }}>«{h}»</div>
          </div>
        ))}
      </div>
    </>
  );
};

/* ───── ٣ جدول أسبوعين ───── */
const DAYS = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];
const TYPES = [
  { t: "ريلز", c: K.tomato },
  { t: "صورة", c: K.mustard },
  { t: "ستوري", c: K.mint },
];
const PLAN = [0, 1, 2, 0, 1, 0, 2, 1, 0, 2, 0, 1, 2, 0];
export const Plan: React.FC<{ f: number }> = ({ f }) => {
  const { lf, out, on } = local(f, "plan");
  if (!on) return null;
  const gone = 1 - ease(lf, out, 12);
  return (
    <>
      <Prompt lf={lf} out={out} top={800} text={"سوّ جدول محتوى لأسبوعين:\nاليوم، الفكرة، نوع المنشور"} />
      <div style={{ position: "absolute", top: 1060, left: 70, right: 70, ...card(fade(lf, 74) * gone) }}>
        <div style={{ padding: "18px 20px 22px", borderRadius: 26, background: "#fff", boxShadow: "0 16px 30px rgba(29,43,42,.14)", direction: "rtl" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
            {DAYS.map((d) => (
              <div key={d} style={{ textAlign: "center", font: `700 28px ${DISPLAY}`, color: K.sub }}>{d}</div>
            ))}
            {PLAN.map((ty, i) => {
              const p = pop(lf, 86 + i * 6);
              return (
                <div key={i} style={{ height: 70, borderRadius: 14, background: "#F2F5F4", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 6, borderRadius: 10, background: TYPES[ty].c, transform: `scale(${p})`, opacity: p > 0 ? 1 : 0, display: "grid", placeItems: "center", font: `700 22px ${BODY}`, color: "#fff" }}>{TYPES[ty].t}</div>
                  <div style={{ position: "absolute", top: 2, right: 6, font: `700 16px ${EN}`, color: "rgba(29,43,42,.35)" }}>{i + 1}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 1330, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 26, direction: "rtl", opacity: fade(lf, 180) * gone }}>
        {TYPES.map((t) => (
          <div key={t.t} style={{ display: "flex", alignItems: "center", gap: 10, font: `700 30px ${BODY}`, color: K.ink }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: t.c }} />
            {t.t}
          </div>
        ))}
      </div>
    </>
  );
};

/* ───── ٤ اكتب المحتوى ───── */
const CAP = "كيكة الشوكولاتة جاهزة لجمعتكم! اطلبها قبل الأربعاء، وتوصلك لين الباب.";
export const Write: React.FC<{ f: number }> = ({ f }) => {
  const { lf, out, on } = local(f, "write");
  if (!on) return null;
  const gone = 1 - ease(lf, out, 12);
  const ph = pop(lf, 80) * gone;
  return (
    <>
      <Prompt lf={lf} out={out} top={800} text={"اكتب كابشن أول 7 منشورات بلهجة سعودية\nخفيفة، ومع كل واحد فكرة الصورة"} />
      {/* سبع بطاقات منشورات */}
      {Array.from({ length: 6 }, (_, i) => {
        const p = pop(lf, 150 + i * 8) * gone;
        return (
          <div key={i} style={{ position: "absolute", top: 1080 + i * 6, left: 560 + i * 62, width: 120, height: 150, borderRadius: 16, background: "#fff", border: `3px solid ${K.ink}`, transform: `rotate(${4 + i * 3}deg) scale(${p})`, opacity: p > 0 ? 1 : 0, boxShadow: "0 8px 16px rgba(29,43,42,.12)", display: "grid", placeItems: "center", font: `800 40px ${EN}`, color: COLOR.write }}>
            {i + 2}
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 1050, left: 110, width: 430, ...card(ph) }}>
        <div style={{ borderRadius: 34, background: K.ink, padding: 12, boxShadow: "0 20px 40px rgba(29,43,42,.3)" }}>
          <div style={{ borderRadius: 24, background: "#fff", overflow: "hidden", direction: "rtl" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: K.choc }} />
              <div style={{ font: `700 22px ${BODY}`, color: K.ink }}>متجر الكيك</div>
              <div style={{ marginRight: "auto", font: `800 22px ${EN}`, color: COLOR.write }}>1/7</div>
            </div>
            <Img src={V("cake.jpg")} style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
            <div style={{ padding: "10px 14px 14px", font: `700 23px/1.5 ${BODY}`, color: K.ink, minHeight: 104 }}>{typed(CAP, lf, 96, 60)}</div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ───── ٥ راجع وجدول ───── */
const CHECKS = ["الأسعار صحيحة؟", "العرض تقدر تلتزم فيه؟", "الصور من منتجك الحقيقي؟", "المواعيد واقعية؟"];
export const Ship: React.FC<{ f: number }> = ({ f }) => {
  const { lf, out, on } = local(f, "ship");
  if (!on) return null;
  const gone = 1 - ease(lf, out, 12);
  return (
    <>
      <div style={{ position: "absolute", top: 800, left: 80, right: 80, ...card(fade(lf, 8) * gone) }}>
        <div style={{ padding: "22px 30px 26px", borderRadius: 26, background: "#fff", boxShadow: "0 16px 30px rgba(29,43,42,.14)", direction: "rtl" }}>
          <div style={{ font: `700 34px ${DISPLAY}`, color: K.sub, marginBottom: 6 }}>قبل ما تنشر، راجع:</div>
          {CHECKS.map((c, i) => {
            const p = pop(lf, 24 + i * 16);
            return (
              <div key={c} style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 0", borderTop: i ? "2px dashed #E3EAE8" : undefined }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, border: `4px solid ${K.ok}`, display: "grid", placeItems: "center", background: p > 0.5 ? K.ok : "#fff", color: "#fff", font: `800 30px ${BODY}`, transform: `scale(${0.8 + 0.2 * p})` }}>{p > 0.5 ? "✓" : ""}</div>
                <div style={{ font: `700 36px ${BODY}`, color: K.ink }}>{c}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", top: 1200, left: 80, right: 80, display: "flex", gap: 16, direction: "rtl" }}>
        <div style={{ flex: 1, ...card(pop(lf, 100) * gone) }}>
          <div style={{ padding: "14px 20px 18px", borderRadius: 20, background: "#FBE3E0", border: `3px solid ${K.tomato}`, font: `700 29px/1.45 ${BODY}`, color: "#7A1C14" }}>
            <div style={{ font: `700 30px ${DISPLAY}`, color: K.tomato }}>✗ الخطأ الشائع</div>
            تنشر كل اللي طلع بدون مراجعة
          </div>
        </div>
        <div style={{ flex: 1, ...card(pop(lf, 116) * gone) }}>
          <div style={{ padding: "14px 20px 18px", borderRadius: 20, background: "#E1F3EA", border: `3px solid ${K.ok}`, font: `700 29px/1.45 ${BODY}`, color: K.ink }}>
            <div style={{ font: `700 30px ${DISPLAY}`, color: K.ok }}>✓ وبعدها</div>
            جدولها في تطبيق النشر وارتاح
          </div>
        </div>
      </div>
    </>
  );
};

/* ───── الختام ───── */
export const End: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const lf = f - SEG.end[0];
  if (lf < 0) return null;
  const av = ease(lf, 24, 22, OUT);
  return (
    <>
      <Center y={250}>
        <Reveal f={lf} at={4} d={16}>
          <div style={{ font: `700 76px/1.3 ${DISPLAY}`, color: K.ink, whiteSpace: "nowrap" }}>
            الحملة جاهزة <span style={{ color: K.ok }}>في 60 دقيقة</span>
          </div>
        </Reveal>
      </Center>
      {/* صورة علي داخل المؤقت */}
      <div style={{ position: "absolute", left: W / 2 - 128, top: 690 - 128, width: 256, height: 256, borderRadius: "50%", overflow: "hidden", clipPath: `circle(${av * 50}% at 50% 50%)`, border: `8px solid ${K.cream}`, boxShadow: `0 0 ${20 + kick * 30}px rgba(244,178,58,.5)` }}>
        <Img src={staticFile("avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%" }} />
      </div>
      <Center y={960}>
        <Reveal f={lf} at={40} d={20}>
          <div style={{ font: `700 100px/1.3 ${DISPLAY}`, color: K.ink, whiteSpace: "nowrap" }}>علي التميمي</div>
        </Reveal>
      </Center>
      <Center y={1100}>
        <Reveal f={lf} at={54} d={20}>
          <div style={{ font: `700 56px/1.35 ${DISPLAY}`, color: K.tomato, whiteSpace: "nowrap" }}>وش مشروعك؟</div>
        </Reveal>
      </Center>
      <Center y={1190}>
        <Reveal f={lf} at={64} d={18}>
          <div style={{ font: `700 38px ${BODY}`, color: K.ink, whiteSpace: "nowrap" }}>اكتبه بالتعليقات، وأعطيك أول برومبت لحملتك</div>
        </Reveal>
      </Center>
      <Center y={1290}>
        <div style={{ opacity: ease(lf, 76, 14), padding: "14px 30px", borderRadius: 999, background: K.ink }}>
          <HandlesRow size={34} color="#fff" />
        </div>
      </Center>
    </>
  );
};

