import { Img, staticFile } from "remotion";
import { Reveal } from "../ClaudeVsGptPro/kit";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { Bubble, Caption, Coin, Cursor, En, Logo, Panel, Title, fade, pop } from "./parts";
import { BODY, DISPLAY, EN, G, IN_OUT, MONO, OUT, PIXEL, SEG, SegK, V, ease, outline } from "./theme";

const local = (f: number, k: SegK) => {
  const [a, b] = SEG[k];
  return { lf: f - a, out: b - a - 12, on: f >= a - 30 && f < b + 30 };
};

const typed = (s: string, lf: number, at: number, d: number) => s.slice(0, Math.round(Math.min(1, Math.max(0, (lf - at) / d)) * s.length));

const Abs: React.FC<{ top: number; left?: number; right?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ top, left = 70, right = 70, style, children }) => (
  <div style={{ position: "absolute", top, left, right, direction: "rtl", ...style }}>{children}</div>
);

/* ───────── الهوك: تلفزيون قديم، تتفرج وتنسى ← GAME OVER ───────── */
export const Hook: React.FC<{ f: number }> = ({ f }) => {
  if (f >= SEG.hook[1] + 2) return null;
  const lf = f;
  const go = lf >= 52 ? 1 : 0;
  const glitch = lf >= 52 && lf < 64 ? 1 : 0;
  const off1 = ease(lf, 100, 9, OUT); // ينكمش عمودياً
  const off2 = ease(lf, 109, 8, OUT); // ثم أفقياً
  const zoom = 1.06 + lf * 0.0012;
  const jx = glitch ? ((lf * 37) % 9) - 4 : 0;
  return (
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 55% at 50% 55%, #2A2140 0%, ${G.tv} 70%)` }}>
      <Abs top={250} style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Reveal f={lf} at={0} d={14}>
            <div style={{ font: `800 92px/1.25 ${DISPLAY}`, color: G.white, whiteSpace: "nowrap" }}>تتعلم من الفيديوهات…</div>
          </Reveal>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Reveal f={lf} at={10} d={16}>
            <div style={{ font: `800 116px/1.25 ${DISPLAY}`, color: G.coin, whiteSpace: "nowrap" }}>وتنسى بعد يومين؟</div>
          </Reveal>
        </div>
      </Abs>
      {/* التلفزيون */}
      <div style={{ position: "absolute", left: 100, top: 600, width: 880, height: 760, borderRadius: 64, background: "linear-gradient(180deg,#3A3150,#241D33)", boxShadow: "0 30px 60px rgba(0,0,0,.5), inset 0 4px 0 rgba(255,255,255,.08)", transform: `translateX(${jx}px)` }}>
        <div style={{ position: "absolute", left: 40, top: 40, width: 800, height: 600, borderRadius: 44, overflow: "hidden", background: "#000" }}>
          <div style={{ position: "absolute", inset: 0, transform: `scale(${1 - off2 * 0.98}, ${1 - off1 * 0.985})`, background: "#000", overflow: "hidden" }}>
            <Img src={V("notes.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, filter: `grayscale(.35) contrast(1.05) brightness(${go ? 0.55 : 0.9})` }} />
            {glitch ? (
              <Img src={V("notes.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom}) translateX(14px)`, mixBlendMode: "screen", opacity: 0.6, filter: "sepia(1) hue-rotate(-50deg) saturate(6)" }} />
            ) : null}
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(180deg, rgba(0,0,0,.22) 0 3px, transparent 3px 7px)" }} />
            {/* شريط تقدّم فيديو عام */}
            <div style={{ position: "absolute", left: 40, right: 40, bottom: 34, height: 10, borderRadius: 5, background: "rgba(255,255,255,.3)" }}>
              <div style={{ width: `${Math.min(100, 20 + lf * 1.4)}%`, height: "100%", borderRadius: 5, background: "#FF4D4D" }} />
            </div>
            {go ? (
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                <div style={{ font: `400 76px ${PIXEL}`, color: G.red, textShadow: outline("#000", 6, 8), transform: `scale(${pop(lf, 52)}) translateX(${glitch ? -jx * 2 : 0}px)`, whiteSpace: "nowrap" }}>GAME OVER</div>
              </div>
            ) : null}
            <div style={{ position: "absolute", inset: 0, background: `rgba(255,255,255,${off1 * 0.9})` }} />
          </div>
        </div>
        {/* أزرار */}
        {[0, 1].map((i) => (
          <div key={i} style={{ position: "absolute", top: 668, left: 640 + i * 100, width: 56, height: 56, borderRadius: "50%", background: "#120E1A", boxShadow: "inset 0 3px 0 rgba(255,255,255,.12)" }} />
        ))}
        <div style={{ position: "absolute", top: 684, left: 60, display: "flex", gap: 10 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} style={{ width: 8, height: 26, borderRadius: 4, background: "#120E1A" }} />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ───────── البداية: اختر مدرّبك ───────── */
const COACHES = [
  { src: "claude-color.svg", name: "Claude" },
  { src: "openai.svg", name: "ChatGPT" },
  { src: "gemini-color.svg", name: "Gemini" },
];
export const StartFloor: React.FC<{ f: number }> = ({ f }) => {
  const { lf, out, on } = local(f, "start");
  if (!on) return null;
  const sel = lf < 60 ? -1 : lf < 76 ? 0 : lf < 92 ? 1 : lf < 108 ? 2 : 3;
  const xs = [790, 540, 290];
  return (
    <>
      <Abs top={300} style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Reveal f={lf} at={4} d={18} out={out}>
            <div style={{ font: `800 96px/1.25 ${DISPLAY}`, color: G.white, textShadow: outline(G.ink, 7, 12), whiteSpace: "nowrap" }}>خلّ الذكاء الاصطناعي</div>
          </Reveal>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Reveal f={lf} at={12} d={18} out={out}>
            <div style={{ font: `800 112px/1.25 ${DISPLAY}`, color: G.coin, textShadow: outline(G.ink, 8, 12), whiteSpace: "nowrap" }}>مدرّبك الشخصي</div>
          </Reveal>
        </div>
      </Abs>
      <Abs top={650} style={{ textAlign: "center", opacity: fade(lf, 28) * (1 - ease(lf, out, 12)) }}>
        <div style={{ font: `400 30px ${PIXEL}`, color: G.white, textShadow: outline(G.ink, 4, 5), direction: "ltr" }}>SELECT YOUR COACH</div>
      </Abs>
      {COACHES.map((c, i) => {
        const p = pop(lf, 34 + i * 8) * (1 - ease(lf, out, 12));
        const hot = sel === i || sel === 3;
        return (
          <div key={c.name} style={{ position: "absolute", top: 730, left: xs[i] - 125, width: 250, transform: `scale(${p * (hot ? 1.06 : 1)})`, opacity: p > 0 ? 1 : 0 }}>
            <Panel style={{ height: 270, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, border: `6px solid ${hot ? G.coin : G.ink}`, outline: hot ? `6px solid ${G.ink}` : undefined }}>
              <Logo src={V(c.src)} size={120} />
              <div style={{ font: `700 36px ${EN}`, color: G.ink }}>{c.name}</div>
            </Panel>
          </div>
        );
      })}
      {sel >= 0 && sel < 3 ? (
        <div style={{ position: "absolute", top: 690, left: xs[sel] - 22, transform: "rotate(90deg)" }}>
          <Cursor size={44} />
        </div>
      ) : null}
      <Abs top={1060} style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Reveal f={lf} at={108} d={16} out={out}>
            <div style={{ font: `800 64px/1.3 ${DISPLAY}`, color: G.white, textShadow: outline(G.ink, 5, 8), whiteSpace: "nowrap" }}>أي أداة منهم تنفع</div>
          </Reveal>
        </div>
      </Abs>
      {lf > 124 && lf < out ? (
        <Abs top={1215} style={{ textAlign: "center", opacity: Math.floor(lf / 10) % 2 === 0 ? 1 : 0.15 }}>
          <div style={{ font: `400 38px ${PIXEL}`, color: G.coin, textShadow: outline(G.ink, 4, 6), direction: "ltr" }}>PRESS START</div>
        </Abs>
      ) : null}
    </>
  );
};

/* ───────── المستوى 1: الخطة ───────── */
const PROMPT1 = "أبي أتعلم Excel في 30 يوم،\n20 دقيقة باليوم، وأنا مبتدئ. سوّ لي خطة.";
const WEEKS = [
  { x: 770, y: 92, w: "أسبوع 1", t: "الأساسيات", at: 112 },
  { x: 230, y: 92, w: "أسبوع 2", t: "المعادلات", at: 142 },
  { x: 230, y: 312, w: "أسبوع 3", t: "الجداول المحورية", at: 170 },
  { x: 770, y: 312, w: "أسبوع 4", t: "تقرير كامل", at: 198 },
];
export const PlanFloor: React.FC<{ f: number }> = ({ f }) => {
  const { lf, out, on } = local(f, "plan");
  if (!on) return null;
  const gone = 1 - ease(lf, out, 12);
  const path = ease(lf, 106, 96, IN_OUT);
  return (
    <>
      <Title lf={lf} out={out} level="LEVEL 1" tag="الخطة">
        اطلب خطة على مقاسك
      </Title>
      <Bubble who="me" p={pop(lf, 22) * gone} style={{ position: "absolute", top: 580, left: 80, right: 80 }}>
        <div style={{ whiteSpace: "pre-line", minHeight: 114 }}>{typed(PROMPT1, lf, 30, 60)}</div>
      </Bubble>
      <div style={{ position: "absolute", top: 830, left: 70, width: 940, height: 430, opacity: fade(lf, 100) * gone }}>
        <Panel tone="cream" style={{ position: "absolute", inset: 0, borderRadius: 18 }}>
          <div />
        </Panel>
        <svg width={940} height={430} style={{ position: "absolute", left: 0, top: 0 }}>
          <path d="M770 92 H230 Q140 92 140 202 Q140 312 230 312 H770" fill="none" stroke={G.dirt} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={`${path} 1`} />
          <path d="M770 92 H230 Q140 92 140 202 Q140 312 230 312 H770" fill="none" stroke={G.cream} strokeWidth={4} strokeDasharray="12 16" opacity={path > 0.02 ? 0.9 : 0} />
        </svg>
        {WEEKS.map((n, i) => {
          const p = pop(lf, n.at);
          return (
            <div key={i} style={{ position: "absolute", left: n.x - 130, top: n.y - 66, width: 260, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${p})`, opacity: p > 0 ? 1 : 0 }}>
              <svg width={70} height={70} viewBox="0 0 14 14" shapeRendering="crispEdges">
                <rect x={3} y={1} width={1.2} height={13} fill={G.ink} />
                <path d={i === 3 ? "M4 1h8v2h-2v1h2v2h-8z" : "M4 1h7l-2 2.5 2 2.5h-7z"} fill={i === 3 ? G.coin : G.red} stroke={G.ink} strokeWidth={0.5} />
              </svg>
              <div style={{ marginTop: 2, padding: "2px 16px 8px", background: G.white, border: `4px solid ${G.ink}`, borderRadius: 10, textAlign: "center", direction: "rtl" }}>
                <div style={{ font: `800 26px/1.3 ${DISPLAY}`, color: G.dirt2 }}>{n.w}</div>
                <div style={{ font: `700 30px/1.25 ${BODY}`, color: G.ink, whiteSpace: "nowrap" }}>{n.t}</div>
              </div>
            </div>
          );
        })}
      </div>
      <Caption lf={lf} at={214} out={out}>
        حدد هدفك، ومدتك، ووقتك اليومي، ومستواك
      </Caption>
    </>
  );
};

/* ───────── المستوى 2: الشرح بمستواك ───────── */
const LEVELS = ["مبتدئ", "متوسط", "خبير"];
export const ExplainFloor: React.FC<{ f: number }> = ({ f }) => {
  const { lf, out, on } = local(f, "explain");
  if (!on) return null;
  const gone = 1 - ease(lf, out, 12);
  const cur = lf < 34 ? 2 : lf < 44 ? 1 : 0;
  const chosen = lf >= 48;
  const xs = [790, 540, 290];
  const hl = ease(lf, 160, 14);
  return (
    <>
      <Title lf={lf} out={out} level="LEVEL 2" tag="الشرح">
        خلّه يشرح بمستواك
      </Title>
      {LEVELS.map((t, i) => {
        const p = pop(lf, 14 + i * 5) * gone;
        const on2 = chosen && i === 0;
        return (
          <div key={t} style={{ position: "absolute", top: 580, left: xs[i] - 115, width: 230, transform: `scale(${p * (on2 ? 1.08 : 1)})`, opacity: p > 0 ? 1 : 0 }}>
            <Panel tone={on2 ? "white" : "cream"} style={{ height: 96, display: "grid", placeItems: "center", background: on2 ? G.coin : i === 0 ? G.cream : "#E9E3D2" }}>
              <div style={{ font: `800 44px ${DISPLAY}`, color: G.ink, opacity: on2 || !chosen ? 1 : 0.45 }}>{t}</div>
            </Panel>
          </div>
        );
      })}
      {lf >= 20 && lf < out ? (
        <div style={{ position: "absolute", top: 600, left: xs[cur] + 112, transform: "scaleX(-1)" }}>
          <Cursor size={48} />
        </div>
      ) : null}
      <Bubble who="me" p={pop(lf, 60) * gone} style={{ position: "absolute", top: 750, left: 80, right: 80 }}>
        اشرح <En>VLOOKUP</En> كأني ما أعرف شي، بمثال من شغلي
      </Bubble>
      <Bubble who="ai" p={pop(lf, 100) * gone} style={{ position: "absolute", top: 940, left: 80, right: 80 }}>
        تخيّل دليل جوالك: تكتب الاسم، ويطلع لك الرقم. <En>VLOOKUP</En> نفس الفكرة داخل الجدول.
      </Bubble>
      <div style={{ position: "absolute", top: 1180, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 22, alignItems: "center", direction: "rtl", opacity: fade(lf, 140) * gone }}>
        <Panel tone="cream" style={{ padding: "6px 26px 12px", background: hl > 0.5 ? G.coin : G.cream }}>
          <div style={{ font: `800 40px ${DISPLAY}` }}>سارة</div>
        </Panel>
        <svg width={90} height={40} viewBox="0 0 18 8" shapeRendering="crispEdges">
          <path d="M18 3h-12v-3l-6 4 6 4v-3h12z" fill={G.ink} />
        </svg>
        <Panel style={{ padding: "8px 26px 12px", background: hl > 0.5 ? G.coin : G.white }}>
          <div style={{ font: `800 38px ${MONO}`, direction: "ltr" }}>055 123 4567</div>
        </Panel>
      </div>
      <Caption lf={lf} at={196} out={out}>
        ما فهمت؟ قل: أبسط، وبمثال ثاني
      </Caption>
    </>
  );
};

/* ───────── المستوى 3: الاختبار اليومي (زعيم «النسيان») ───────── */
const OPTS = [
  { b: "أ", t: "صفر" },
  { b: "ب", t: "#N/A" },
  { b: "ج", t: "أول قيمة في الجدول" },
];
const Boss: React.FC<{ f: number; hit: number }> = ({ f, hit }) => {
  const bob = Math.sin(f / 10) * 6;
  const sh = hit > 0 && hit < 1 ? Math.sin(hit * 40) * 10 * (1 - hit) : 0;
  return (
    <svg width={200} height={170} viewBox="0 0 20 17" shapeRendering="crispEdges" style={{ transform: `translate(${sh}px, ${bob}px)` }}>
      <path d="M4 3h12v1h2v2h1v9h-2v-1h-2v1h-2v-1h-2v1h-2v-1h-2v1h-2v-1h-2v1h-2v-9h1v-2h2z" fill={hit > 0 && hit < 0.3 ? "#fff" : G.boss} stroke={G.ink} strokeWidth={0.6} />
      <rect x={6} y={6} width={3} height={3} fill="#fff" />
      <rect x={12} y={6} width={3} height={3} fill="#fff" />
      <rect x={7} y={7} width={1.5} height={1.5} fill={G.ink} />
      <rect x={13} y={7} width={1.5} height={1.5} fill={G.ink} />
      <rect x={8} y={11} width={5} height={1} fill={G.ink} />
    </svg>
  );
};
export const QuizFloor: React.FC<{ f: number }> = ({ f }) => {
  const { lf, out, on } = local(f, "quiz");
  if (!on) return null;
  const gone = 1 - ease(lf, out, 12);
  const pick = lf >= 150;
  const hit = ease(lf, 154, 26, (t) => t);
  const hp = lf >= 156 ? 2 : 3;
  const curRow = lf < 112 ? -1 : lf < 128 ? 0 : 1;
  const xp = lf >= 154 ? ease(lf, 154, 40) : 0;
  return (
    <>
      <Title lf={lf} out={out} level="LEVEL 3" tag="الاختبار">
        خلّه يختبرك كل يوم
      </Title>
      <Bubble who="me" p={pop(lf, 18) * gone} style={{ position: "absolute", top: 580, left: 80, right: 80 }}>
        اختبرني بـ 3 أسئلة على درس أمس، سؤال سؤال
      </Bubble>
      <div style={{ position: "absolute", top: 730, left: 90, right: 90, display: "flex", alignItems: "center", gap: 30, direction: "rtl", opacity: fade(lf, 50) * gone }}>
        <div style={{ flex: 1 }}>
          <div style={{ font: `800 44px ${DISPLAY}`, color: G.white, textShadow: outline(G.ink, 5, 6) }}>الزعيم: النسيان</div>
          <div style={{ display: "flex", gap: 10, marginTop: 10, direction: "ltr", justifyContent: "flex-end" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 120, height: 30, border: `5px solid ${G.ink}`, background: i < hp ? G.red : "rgba(255,255,255,.35)", borderRadius: 4 }} />
            ))}
          </div>
        </div>
        <Boss f={f} hit={hit} />
      </div>
      <div style={{ position: "absolute", top: 905, left: 80, right: 80, opacity: fade(lf, 70) * gone, transform: `translateY(${(1 - fade(lf, 70)) * 30}px)` }}>
        <Panel style={{ padding: "22px 30px 26px", direction: "rtl" }}>
          <div style={{ font: `800 42px/1.4 ${DISPLAY}` }}>
            لو <En>VLOOKUP</En> ما لقت القيمة، وش ترجع؟
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
            {OPTS.map((o, i) => {
              const right = pick && i === 1;
              return (
                <div key={o.b} style={{ position: "relative", display: "flex", alignItems: "center", gap: 18, padding: "6px 14px", borderRadius: 10, background: right ? "rgba(34,179,94,.18)" : "transparent", outline: right ? `4px solid ${G.ok}` : undefined, opacity: pop(lf, 86 + i * 8) }}>
                  <div style={{ width: 54, height: 54, borderRadius: 8, background: right ? G.ok : G.ink, color: G.white, display: "grid", placeItems: "center", font: `800 32px ${DISPLAY}` }}>{o.b}</div>
                  <div style={{ font: `700 38px ${o.t.startsWith("#") ? MONO : BODY}`, direction: o.t.startsWith("#") ? "ltr" : "rtl" }}>{o.t}</div>
                  {right ? <div style={{ marginRight: "auto", font: `800 44px ${DISPLAY}`, color: G.ok, transform: `scale(${pop(lf, 150)})` }}>✓</div> : null}
                  {curRow === i && !pick ? (
                    <div style={{ position: "absolute", right: -64, top: 10, transform: "scaleX(-1)" }}>
                      <Cursor size={40} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
      {xp > 0 && xp < 1 ? (
        <div style={{ position: "absolute", top: 790 - xp * 110, left: 330, font: `400 40px ${PIXEL}`, color: G.coin, textShadow: outline(G.ink, 4, 6), opacity: 1 - Math.max(0, xp - 0.7) / 0.3, direction: "ltr" }}>+50 XP</div>
      ) : null}
      <Caption lf={lf} at={190} out={out}>
        كل جواب من راسك يثبّت المعلومة أكثر
      </Caption>
    </>
  );
};

/* ───────── المستوى 4: التصحيح بتلميح ───────── */
export const FixFloor: React.FC<{ f: number }> = ({ f }) => {
  const { lf, out, on } = local(f, "fix");
  if (!on) return null;
  const gone = 1 - ease(lf, out, 12);
  const sw = ease(lf, 122, 14);
  const done = lf >= 140;
  return (
    <>
      <Title lf={lf} out={out} level="LEVEL 4" tag="التصحيح">
        صحّح غلطك بتلميح
      </Title>
      <Bubble who="me" p={pop(lf, 20) * gone} style={{ position: "absolute", top: 580, left: 80, right: 80 }}>
        سويت المعادلة وطلع لي خطأ:
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 10, direction: "ltr", justifyContent: "flex-end" }}>
          <span style={{ font: `800 34px ${MONO}`, color: G.white }}>=VLOOKUP(A2, B:C, 3, 0)</span>
          <span style={{ padding: "2px 14px 6px", borderRadius: 8, background: G.red, font: `800 30px ${MONO}`, color: G.white, transform: `scale(${pop(lf, 40)})` }}>#REF!</span>
        </div>
      </Bubble>
      <Bubble who="ai" p={pop(lf, 70) * gone} style={{ position: "absolute", top: 830, left: 80, right: 80 }}>
        <b style={{ color: G.ok }}>تلميح:</b> النطاق <En>B:C</En> فيه كم عمود؟
      </Bubble>
      <div style={{ position: "absolute", top: 1010, left: 80, right: 80, opacity: fade(lf, 112) * gone }}>
        <Panel style={{ padding: "16px 26px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", direction: "ltr", background: done ? "#E9F8EF" : G.white }}>
          <span style={{ font: `800 38px ${MONO}` }}>
            =VLOOKUP(A2, B:C,{" "}
            <span style={{ position: "relative", display: "inline-block", width: 30 }}>
              <span style={{ position: "absolute", left: 0, color: G.red, opacity: 1 - sw, transform: `translateY(${-sw * 30}px)` }}>3</span>
              <span style={{ position: "absolute", left: 0, color: G.ok, opacity: sw, transform: `translateY(${(1 - sw) * 30}px)` }}>2</span>
              &nbsp;
            </span>
            , 0)
          </span>
          <span style={{ padding: "2px 18px 8px", borderRadius: 10, background: G.ok, color: G.white, font: `800 34px ${DISPLAY}`, transform: `scale(${pop(lf, 140)})`, opacity: done ? 1 : 0 }}>تم ✓</span>
        </Panel>
      </div>
      <div style={{ position: "absolute", top: 1160, left: 80, right: 80, display: "flex", gap: 22, direction: "rtl" }}>
        <div style={{ flex: 1, transform: `scale(${pop(lf, 166) * gone})` }}>
          <Panel style={{ padding: "10px 20px 14px", background: "#FDE4E3", textAlign: "center" }}>
            <div style={{ font: `800 28px ${DISPLAY}`, color: G.red }}>✗ غش</div>
            <div style={{ font: `700 34px ${BODY}`, textDecoration: "line-through", textDecorationColor: G.red, textDecorationThickness: 4 }}>«حل لي الواجب»</div>
          </Panel>
        </div>
        <div style={{ flex: 1.25, transform: `scale(${pop(lf, 180) * gone})` }}>
          <Panel style={{ padding: "10px 20px 14px", background: "#E9F8EF", textAlign: "center" }}>
            <div style={{ font: `800 28px ${DISPLAY}`, color: G.ok }}>✓ تعلّم</div>
            <div style={{ font: `700 34px ${BODY}` }}>«وين غلطي؟ أعطني تلميح»</div>
          </Panel>
        </div>
      </div>
      <Caption lf={lf} at={206} out={out}>
        التلميح يعلّمك، والجواب الجاهز ينسّيك
      </Caption>
    </>
  );
};

/* ───────── القمة: LEVEL UP وبطاقة اللاعب ───────── */
export const EndFloor: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const { lf, on } = local(f, "end");
  if (!on) return null;
  const center = (y: number, node: React.ReactNode) => <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", direction: "rtl" }}>{node}</div>;
  const card = pop(lf, 22);
  return (
    <>
      {Array.from({ length: 14 }, (_, i) => {
        const t = lf - 8 - i * 6;
        if (t < 0) return null;
        const x = i % 2 === 0 ? 30 + ((i * 53) % 150) : 880 + ((i * 41) % 140);
        const y = -80 + t * (9 + (i % 4) * 2);
        if (y > 1500) return null;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, opacity: 0.9 }}>
            <Coin f={f} size={44} phase={i * 7} />
          </div>
        );
      })}
      {center(
        270,
        <div style={{ font: `400 70px ${PIXEL}`, color: G.coin, textShadow: outline(G.ink, 6, 10), transform: `scale(${pop(lf, 6) * (1 + kick * 0.04)})`, direction: "ltr", whiteSpace: "nowrap" }}>LEVEL UP!</div>,
      )}
      <div style={{ position: "absolute", top: 400, left: 540 - 220, width: 440, transform: `scale(${card})`, opacity: card > 0 ? 1 : 0 }}>
        <Panel tone="ink" style={{ padding: "18px 18px 22px", textAlign: "center", border: `8px solid ${G.coin}`, boxShadow: `0 14px 0 ${G.ink}` }}>
          <div style={{ font: `400 28px ${PIXEL}`, color: G.coin, marginBottom: 14, direction: "ltr" }}>PLAYER 1</div>
          <div style={{ width: 380, height: 380, margin: "0 auto", border: `6px solid ${G.white}`, borderRadius: 8, overflow: "hidden" }}>
            <Img src={staticFile("avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%" }} />
          </div>
        </Panel>
      </div>
      {center(
        900,
        <Reveal f={lf} at={44} d={20}>
          <div style={{ font: `800 100px/1.25 ${DISPLAY}`, color: G.white, textShadow: outline(G.ink, 7, 12), whiteSpace: "nowrap" }}>علي التميمي</div>
        </Reveal>,
      )}
      {center(
        1045,
        <Reveal f={lf} at={60} d={20}>
          <div style={{ font: `800 62px/1.3 ${DISPLAY}`, color: G.coin, textShadow: outline(G.ink, 6, 8), whiteSpace: "nowrap" }}>وش المهارة اللي تبي تتعلمها؟</div>
        </Reveal>,
      )}
      {center(
        1150,
        <Reveal f={lf} at={74} d={18}>
          <div style={{ padding: "8px 28px 12px", borderRadius: 999, background: "rgba(13,27,61,.85)", font: `700 36px ${BODY}`, color: G.white, whiteSpace: "nowrap" }}>اكتبها بالتعليقات، وأعطيك برومبت الخطة</div>
        </Reveal>,
      )}
      {center(
        1262,
        <div style={{ opacity: ease(lf, 86, 14), padding: "14px 30px", borderRadius: 999, background: G.white, border: `5px solid ${G.ink}`, boxShadow: `0 8px 0 ${G.ink}` }}>
          <HandlesRow size={34} color={G.ink} />
        </div>,
      )}
    </>
  );
};
