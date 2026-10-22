import { AbsoluteFill, Img, staticFile } from "remotion";
import { useMusic } from "../../lib/music";
import { Reveal } from "../ClaudeVsGptPro/kit";
import { HandlesRow } from "../ClaudeVsGptPro/World";
import { BACK, BODY, DISPLAY, EN, IN, K, OUT, SEG, V, ease } from "./theme";
import { Caption, Chip, En, FileIcon, Headline, popIn } from "./parts";

/** الاستوديو: تدرّج طيني دافئ + بقع ضوء تنجرف + شبكة نقطية خفيفة */
export const Studio: React.FC<{ f: number }> = ({ f }) => {
  const { bass } = useMusic();
  return (
    <>
      <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 38%, #E58A68 0%, ${K.clay} 38%, ${K.clay2} 78%, ${K.deep} 100%)` }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(40% 25% at ${30 + 10 * Math.sin(f / 90)}% ${28 + 6 * Math.cos(f / 110)}%, rgba(255,236,214,${0.32 + bass * 0.15}), transparent 70%), radial-gradient(35% 22% at ${72 + 8 * Math.cos(f / 80)}% ${70 + 5 * Math.sin(f / 70)}%, rgba(255,214,180,.22), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,247,238,.10) 2.2px, transparent 2.6px)",
          backgroundSize: "46px 46px",
          backgroundPosition: `0px ${-f * 0.35}px`,
          maskImage: "linear-gradient(180deg, transparent 0%, #000 15%, #000 85%, transparent 100%)",
        }}
      />
    </>
  );
};

const FILES = [
  ["pdf", "فاتورة_07"],
  ["xlsx", "مبيعات"],
  ["docx", "تقرير_Q3"],
  ["pdf", "فاتورة_12"],
  ["jpg", "إيصال"],
  ["pptx", "عرض"],
  ["pdf", "عقد"],
  ["xlsx", "ميزانية"],
  ["docx", "محضر"],
  ["pdf", "فاتورة_19"],
  ["jpg", "صورة_فاتورة"],
  ["xlsx", "جرد"],
];

/** الهوك: مكتب حقيقي وملفات مبعثرة ← تنسحب كلها لنقطة «Cowork» على الضربة */
export const Hook: React.FC<{ f: number }> = ({ f }) => {
  const { kick } = useMusic();
  if (f > SEG.hook[1] + 6) return null;
  const suck = ease(f, 92, 26, IN);
  const photo = ease(f, 0, 18, OUT) * (1 - ease(f, 100, 18));
  const pill = ease(f, 98, 14, BACK) * (1 - ease(f, 118, 8));
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 760,
          width: 780,
          height: 520,
          borderRadius: 28,
          overflow: "hidden",
          transform: `rotate(-3deg) scale(${0.94 + 0.06 * photo})`,
          opacity: photo,
          boxShadow: "0 40px 80px rgba(90,30,10,.4)",
          border: "10px solid #FFF7EE",
        }}
      >
        <Img src={V("desk.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(.85)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(185,87,47,.05), rgba(126,53,25,.35))" }} />
      </div>
      {FILES.map(([e, n], i) => {
        const ang = (i / FILES.length) * Math.PI * 2 + 0.4;
        const r = 330 + (i % 3) * 70;
        const bx = 540 + Math.cos(ang) * r * 0.95;
        const by = 1020 + Math.sin(ang) * r * 0.62;
        const jx = Math.sin(f / 9 + i) * 8;
        const jy = Math.cos(f / 11 + i * 2) * 8;
        const app = ease(f, 6 + i * 3, 14, BACK);
        const x = bx + (540 - bx) * suck + jx * (1 - suck);
        const y = by + (1020 - by) * suck + jy * (1 - suck);
        return (
          <div key={i} style={{ position: "absolute", left: x - 40, top: y - 60, transform: `scale(${app * (1 - suck * 0.8)}) rotate(${(i % 5 - 2) * 9 * (1 - suck)}deg)`, opacity: 1 - ease(f, 112, 6) }}>
            <FileIcon ext={e} w={72} label={n} />
          </div>
        );
      })}
      {pill > 0 ? (
        <div style={{ position: "absolute", left: 540 - 150, top: 985, width: 300, display: "flex", justifyContent: "center", transform: `scale(${pill * (1 + kick * 0.05)})` }}>
          <div style={{ padding: "14px 40px 18px", borderRadius: 999, background: K.ivory, color: K.clay2, font: `700 56px ${EN}`, boxShadow: "0 20px 40px rgba(90,30,10,.4)" }}>Cowork</div>
        </div>
      ) : null}
      <div style={{ position: "absolute", top: 330, left: 50, right: 50, direction: "rtl", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Reveal f={f} at={2} d={18} out={108}>
            <div style={{ font: `700 88px/1.3 ${DISPLAY}`, color: K.ivory, whiteSpace: "nowrap", textShadow: "0 6px 30px rgba(90,30,10,.35)" }}>ملفات مبعثرة؟</div>
          </Reveal>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Reveal f={f} at={30} d={18} out={108}>
            <div style={{ font: `700 88px/1.3 ${DISPLAY}`, color: K.ivory, whiteSpace: "nowrap", textShadow: "0 6px 30px rgba(90,30,10,.35)" }}>
              سلّمها لـ <En c="#FFE3CF">Claude</En>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
};

/** نصوص كل مشهد حول النافذة */
export const SceneTexts: React.FC<{ f: number }> = ({ f }) => {
  const lf = (k: keyof typeof SEG) => f - SEG[k][0];
  const chipsWhat = (i: number) => popIn(lf("what"), 120 + i * 6) * (1 - ease(lf("what"), 228, 12, IN));
  const chipsDoes = (i: number) => popIn(lf("does"), 110 + i * 6) * (1 - ease(lf("does"), 228, 12, IN));
  return (
    <>
      <Headline f={f} seg="what" kicker={<>وش هو <En>Cowork</En>؟</>} lines={[<><En>Claude</En> يشتغل بدالك</>]} />
      {f >= SEG.what[0] && f < SEG.what[1] + 2 ? (
        <>
          <Caption f={f} seg="what" at={70}>
            قدرات <span style={{ fontFamily: EN }}>Claude Code</span> لشغلك اليومي… بدون طرفية
          </Caption>
          <div style={{ position: "absolute", top: 1380, left: 40, right: 40, display: "flex", justifyContent: "center", gap: 12, direction: "rtl" }}>
            {["سطح المكتب", "الويب", "الجوال"].map((t, i) => (
              <Chip key={t} p={chipsWhat(i)}>
                {t}
              </Chip>
            ))}
            <Chip p={chipsWhat(3)} tone="deep">
              الباقات المدفوعة
            </Chip>
          </div>
        </>
      ) : null}

      <Headline f={f} seg="how" kicker="كيف تبدأ؟" lines={[<>اختر <En>Cowork</En></>, "واوصف المهمة"]} size={84} />
      {f >= SEG.how[0] && f < SEG.how[1] + 2 ? <Steps f={lf("how")} dur={SEG.how[1] - SEG.how[0]} /> : null}

      <Headline f={f} seg="does" kicker="وبعدها؟" lines={["يخلّصها على ملفاتك"]} />
      {f >= SEG.does[0] && f < SEG.does[1] + 2 ? (
        <>
          <div style={{ position: "absolute", top: 1288, left: 40, right: 40, display: "flex", justifyContent: "center", gap: 12, direction: "rtl" }}>
            {["مجلداتك", "متصفح مدمج", "تطبيقاتك المربوطة"].map((t, i) => (
              <Chip key={t} p={chipsDoes(i)}>
                {t}
              </Chip>
            ))}
          </div>
          <Caption f={f} seg="does" at={140} y={1376}>
            <span style={{ fontSize: 32 }}>للملفات المحلية خلّ تطبيق سطح المكتب مفتوح</span>
          </Caption>
        </>
      ) : null}

      <Headline f={f} seg="sched" kicker="مهمة تتكرر؟" lines={["جدولها مرة وحدة"]} />
      <Caption f={f} seg="sched" at={60}>
        اكتب <span style={{ fontFamily: EN, fontWeight: 700 }}>/schedule</span> أو اختر <span style={{ fontFamily: EN, fontWeight: 700 }}>Scheduled</span>
        <br />
        وتشتغل في السحابة حتى لو سكّرت اللابتوب
      </Caption>

      <Headline f={f} seg="safe" kicker="والأهم:" lines={["أنت صاحب القرار"]} />
      <Caption f={f} seg="safe" at={180}>
        راجع خطواته مع الملفات الحساسة
        <br />
        والفلوس والرسائل اللي تطلع باسمك
      </Caption>
    </>
  );
};

/** أرقام الخطوات الأربع أسفل النافذة، تضيء مع تقدّمها */
const Steps: React.FC<{ f: number; dur: number }> = ({ f, dur }) => {
  const items = ["اختر Cowork", "اوصف المهمة", "راجع الخطة", "خلّه يشتغل"];
  const on = [0, 22, 114, 216];
  const out = ease(f, dur - 12, 12, IN);
  return (
    <div style={{ position: "absolute", top: 1296, left: 40, right: 40, display: "flex", justifyContent: "center", gap: 14, direction: "rtl", opacity: 1 - out }}>
      {items.map((t, i) => {
        const p = ease(f, 8 + i * 6, 14, OUT);
        const lit = f >= on[i] ? 1 : 0;
        return (
          <div
            key={t}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              width: 220,
              opacity: p,
              transform: `translateY(${(1 - p) * 20}px)`,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                background: lit ? K.ivory : "rgba(126,53,25,.5)",
                color: lit ? K.clay2 : K.ivory,
                display: "grid",
                placeItems: "center",
                font: `700 34px ${DISPLAY}`,
                boxShadow: lit ? "0 0 0 8px rgba(255,247,238,.18)" : undefined,
              }}
            >
              {["١", "٢", "٣", "٤"][i]}
            </div>
            <div style={{ font: `700 28px ${BODY}`, color: K.ivory, whiteSpace: "nowrap", opacity: lit ? 1 : 0.7 }}>{t}</div>
          </div>
        );
      })}
    </div>
  );
};

/** الختام */
export const End: React.FC<{ f: number }> = ({ f }) => {
  const { kick } = useMusic();
  if (f < 0) return null;
  const av = ease(f, 10, 24, OUT);
  const ring = ease(f, 4, 26, OUT);
  const center = (y: number, node: React.ReactNode) => <div style={{ position: "absolute", top: y, left: 0, width: 1080, display: "flex", justifyContent: "center", direction: "rtl" }}>{node}</div>;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 540 - 220,
          top: 420,
          width: 440,
          height: 440,
          borderRadius: "50%",
          padding: 12,
          background: `conic-gradient(from 0deg, ${K.ivory} 0deg ${360 * ring}deg, transparent ${360 * ring}deg)`,
          boxShadow: `0 30px 60px rgba(90,30,10,.4), 0 0 ${40 + kick * 30}px rgba(255,236,214,.35)`,
        }}
      >
        <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: K.deep }}>
          <div style={{ width: "100%", height: "100%", clipPath: `circle(${av * 52}% at 50% 50%)` }}>
            <Img src={staticFile("avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%", transform: `scale(${1.15 - 0.15 * av})` }} />
          </div>
        </div>
      </div>
      {center(
        900,
        <Reveal f={f} at={26} d={22}>
          <div style={{ font: `700 96px/1.3 ${DISPLAY}`, color: K.ivory, whiteSpace: "nowrap" }}>علي التميمي</div>
        </Reveal>,
      )}
      {center(
        1040,
        <Reveal f={f} at={42} d={22}>
          <div style={{ font: `700 54px/1.4 ${DISPLAY}`, color: "#FFE3CF", whiteSpace: "nowrap" }}>
            وش أول مهمة بتسلّمها لـ <En>Cowork</En>؟
          </div>
        </Reveal>,
      )}
      {center(
        1135,
        <Reveal f={f} at={54} d={18}>
          <div style={{ font: `600 38px ${BODY}`, color: "rgba(255,247,238,.85)", whiteSpace: "nowrap" }}>اكتبها بالتعليقات</div>
        </Reveal>,
      )}
      {center(
        1240,
        <div style={{ opacity: ease(f, 66, 16), transform: `translateY(${(1 - ease(f, 66, 16)) * 16}px)`, padding: "14px 30px", borderRadius: 999, background: K.ivory }}>
          <HandlesRow size={34} color={K.clay2} />
        </div>,
      )}
    </>
  );
};

/** الحسابان أسفل الشاشة طول الفيديو */
export const Footer: React.FC<{ f: number }> = ({ f }) => {
  const o = ease(f, 8, 14) * (1 - ease(f, SEG.end[0] - 10, 10));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 1478, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o * 0.85 }}>
      <HandlesRow size={26} color="rgba(255,247,238,.85)" />
    </div>
  );
};
