import { Fragment } from "react";
import { Cam, smooth } from "../../lib/camera3d";
import { useMusic } from "../../lib/music";
import { S, Z } from "./tl";
import { BODY, IcoChat, IcoFolder, IcoTerm, KUFI, LAT, MONO, T, clamp, ramp, typed } from "./parts";
import { Obj, Bubble, Bug, CloudClock, CodeMark, Doc, Dots, FolderBack, FolderFront, Gear, Laptop, Moon, Orb, Person, Platform, Say, Shield, Sleeper, SunDisc, Title, Zzz } from "./art";

type P = { cam: Cam; f: number };

/* ═══════════ ١. المحادثة — علي يتكلم مع Claude، والفقاعات حوار حقيقي بينهم ═══════════ */
export const ChatIsland: React.FC<P> = ({ cam, f }) => {
  const lf = f - S.chat;
  const z = Z.chat;
  const c = T.chat;
  return (
    <>
      <Platform cam={cam} z={z} f={f} color={c} />
      <Title cam={cam} z={z} lf={lf} n="1" title="المحادثة" sub="فكّر معاه · تسأل وتتناقشون" color={c} />
      {/* علي (يسار) */}
      <Obj cam={cam} x={-300} y={140} z={z + 60}>
        <div style={{ opacity: ramp(lf, 2, 14) }}>
          <Person f={lf} arm="type" w={470} />
        </div>
      </Obj>
      {/* Claude (يمين) */}
      <Obj cam={cam} x={330} y={50} z={z - 40}>
        <div style={{ opacity: ramp(lf, 6, 14) }}>
          <Orb f={f} size={300} color={c} />
        </div>
      </Obj>
      {/* الحوار: أربع فقاعات تتبادل */}
      <Obj cam={cam} x={-215} y={-470} z={z + 120}>
        <Bubble who="u" text="اكتب لي رد مهذب لعميل تأخر طلبه" lf={lf} at={12} dur={26} w={420} />
      </Obj>
      <Obj cam={cam} x={215} y={-300} z={z + 80}>
        <div style={{ display: "grid", gap: 14, justifyItems: "end" }}>
          <Dots lf={lf} from={40} to={54} color={c} />
          <Bubble who="c" text="نعتذر عن التأخير، وطلبك يوصلك خلال ٢٤ ساعة مع هدية اعتذار" lf={lf} at={54} dur={40} w={420} />
        </div>
      </Obj>
      <Obj cam={cam} x={-215} y={-250} z={z + 140}>
        <Bubble who="u" text="خلّه أقصر وأدفأ" lf={lf} at={102} dur={12} w={400} />
      </Obj>
      <Obj cam={cam} x={215} y={-90} z={z + 100}>
        <div style={{ display: "grid", gap: 14, justifyItems: "end" }}>
          <Dots lf={lf} from={118} to={130} color={c} />
          <Bubble who="c" text="آسفين على التأخير، طلبك عندك بكرة" lf={lf} at={130} dur={24} w={400} />
        </div>
      </Obj>
    </>
  );
};

/* ═══════════ ٢. Cowork — أوراق مبعثرة تطير بنفسها للمجلدات ═══════════ */
const DOCS = Array.from({ length: 9 }, (_, i) => {
  const a = (i / 9) * Math.PI * 2 + 0.4;
  return { kind: (i % 3) as 0 | 1 | 2, sx: Math.cos(a) * 360, sy: -150 + Math.sin(a) * 210, sz: Math.sin(a * 2) * 160, rot: (i * 47) % 40 - 20, slot: Math.floor(i / 3) };
});
const FOLDERS = [
  { x: 330, label: "فواتير", color: T.chat },
  { x: 0, label: "عقود", color: T.code },
  { x: -330, label: "صور", color: T.cowork },
];
export const CoworkIsland: React.FC<P> = ({ cam, f }) => {
  const lf = f - S.cowork;
  const z = Z.cowork;
  const c = T.cowork;
  const FY = 150;
  const t0 = 44;
  return (
    <>
      <Platform cam={cam} z={z} f={f} color={c} />
      <Title cam={cam} z={z} lf={lf} n="2" title="Cowork" sub="وكّله · يشتغل على ملفاتك بدالك" color={c} />
      {/* المهمة تُكتب في الهواء */}
      <Obj cam={cam} y={-575} z={z + 100}>
        <Say
          p={ramp(lf, 8, 12)}
          color={T.gold}
          text={
            <>
              <span style={{ color: c }}>›</span> {typed("رتّب ملفات الشهر في مجلدات", lf, 12, 28)}
              <span style={{ opacity: lf % 12 < 6 ? 1 : 0 }}>▍</span>
            </>
          }
        />
      </Obj>
      {/* كرة Claude بين الأوراق */}
      <Obj cam={cam} y={-150} z={z}>
        <div style={{ opacity: ramp(lf, 4, 14) }}>
          <Orb f={f} size={220} color={c} />
        </div>
      </Obj>
      {/* المجلدات */}
      {FOLDERS.map((fo, fi) => {
        const last = t0 + (fi + 6) * 8 + 24;
        const check = ramp(lf, last, 8);
        return (
          <Fragment key={fo.label}>
            <Obj cam={cam} x={fo.x} y={FY} z={z - 30} opacity={ramp(lf, 4 + fi * 4, 12)}>
              <FolderBack color={fo.color} />
            </Obj>
            <Obj cam={cam} x={fo.x} y={FY} z={z + 40} opacity={ramp(lf, 4 + fi * 4, 12)}>
              <FolderFront color={fo.color} label={fo.label} check={check} />
            </Obj>
          </Fragment>
        );
      })}
      {/* الأوراق: تطير في قوس من مكانها المبعثر إلى مجلدها */}
      {DOCS.map((d, i) => {
        const fi = i % 3;
        const fo = FOLDERS[fi];
        const p = smooth((lf - t0 - i * 8) / 24);
        const tx = fo.x;
        const ty = FY - 10 + d.slot * -14;
        const wob = (1 - p) * Math.sin(f / 12 + i) * 16;
        const x = d.sx + (tx - d.sx) * p;
        const y = d.sy + (ty - d.sy) * p - Math.sin(p * Math.PI) * 170 + wob;
        const zz = z + d.sz * (1 - p) + 8 * p;
        return (
          <Obj key={i} cam={cam} x={x} y={y} z={zz} rz={d.rot * (1 - p)} opacity={ramp(lf, 10 + i * 2, 10)}>
            <div style={{ scale: `${1 - p * 0.28}` }}>
              <Doc kind={d.kind} s={1} />
            </div>
          </Obj>
        );
      })}
      {/* الأمان */}
      <Obj cam={cam} y={330} z={z + 60}>
        <div style={{ whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 16, direction: "rtl", opacity: ramp(lf, 150, 14), translate: `0px ${(1 - ramp(lf, 150, 14)) * 20}px`, textShadow: `0 4px 26px ${T.bg}` }}>
          <Shield c={c} s={58} />
          <span style={{ font: `700 44px/1.3 ${BODY}`, color: T.ink }}>ما يحذف أي ملف بدون إذنك</span>
        </div>
      </Obj>
    </>
  );
};

/* ═══════════ ٣. Claude Code — يلاحق bug في كودك ويقتله ═══════════ */
export const CodeIsland: React.FC<P> = ({ cam, f }) => {
  const lf = f - S.code;
  const z = Z.code;
  const c = T.code;
  const hitAt = 118;
  const bugP = clamp((lf - 26) / (hitAt - 26));
  const bugX = 400 - bugP * 520;
  const dead = ramp(lf, hitAt, 6);
  const fall = smooth((lf - (hitAt - 14)) / 14);
  const gone = 1 - ramp(lf, hitAt + 28, 12);
  return (
    <>
      <Platform cam={cam} z={z} f={f} color={c} />
      <Title cam={cam} z={z} lf={lf} n="3" title="Claude Code" sub="ابنِ معاه · يقرأ مشروعك ويعدّل ويجرّب" color={c} />
      <Obj cam={cam} y={-585} z={z + 100}>
        <Say
          p={ramp(lf, 8, 12)}
          color={T.gold}
          text={
            <>
              <span style={{ color: c, fontFamily: MONO }}>›</span> {typed("أصلح خطأ الدفع وجرّب النتيجة", lf, 12, 30)}
              <span style={{ opacity: lf % 12 < 6 ? 1 : 0 }}>▍</span>
            </>
          }
        />
      </Obj>
      <Obj cam={cam} x={-60} y={-20} z={z - 20} ry={-12} opacity={ramp(lf, 4, 14)}>
        <Laptop lf={lf} typeAt={18} fixAt={hitAt + 4} />
      </Obj>
      {/* شعار Claude Code يحوم */}
      <Obj cam={cam} x={-60} y={-420} z={z + 20}>
        <div style={{ opacity: ramp(lf, 6, 12), translate: `0px ${Math.sin(f / 14) * 12}px` }}>
          <CodeMark size={150} glow={c} />
        </div>
      </Obj>
      {/* تروس */}
      <Obj cam={cam} x={-470} y={120} z={z - 120} opacity={ramp(lf, 10, 14)}>
        <Gear size={230} rot={f * 1.6} color={c} />
      </Obj>
      <Obj cam={cam} x={420} y={-170} z={z - 200} opacity={ramp(lf, 14, 14)}>
        <Gear size={150} rot={-f * 2.4 + 10} color={T.cowork} />
      </Obj>
      {/* الحشرة تمشي على المنصة (منظر علوي) */}
      <Obj cam={cam} x={bugX} y={392} z={z + 60} rx={90} rz={-90} opacity={ramp(lf, 22, 10) * gone}>
        <div style={{ scale: "1.4" }}><Bug f={f} dead={dead} /></div>
      </Obj>
      {/* علامة صح تسقط عليها */}
      <Obj cam={cam} x={bugX} y={-380 + fall * 760} z={z + 60} opacity={fall > 0 && gone > 0.1 ? 1 : 0}>
        <div style={{ width: 150, height: 150, borderRadius: "50%", background: T.ok, display: "grid", placeItems: "center", boxShadow: `0 0 90px ${T.ok}` }}>
          <svg width={90} height={90} viewBox="0 0 24 24" fill="none" stroke={T.bg} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.6 4.6L19 7.5" />
          </svg>
        </div>
      </Obj>
      <Obj cam={cam} y={340} z={z + 60}>
        <Say p={ramp(lf, hitAt + 20, 14)} color={T.ok} size={52} weight={900} font={KUFI} text="تم الإصلاح… والاختبارات نجحت ✓" />
      </Obj>
    </>
  );
};

/* ═══════════ ٤. الجدولة — يشتغل وأنت نايم، وتصحى على النتيجة ═══════════ */
export const RoutineIsland: React.FC<P> = ({ cam, f }) => {
  const lf = f - S.routine;
  const z = Z.routine;
  const c = T.gold;
  const wakeAt = 130;
  const asleep = 1 - ramp(lf, wakeAt, 10);
  const sun = smooth((lf - 108) / 36);
  const { kick } = useMusic();
  const SEND = [56, 70, 84, 98];
  return (
    <>
      <Platform cam={cam} z={z} f={f} color={T.code} />
      {/* القمر ثم الشمس */}
      <Obj cam={cam} x={330} y={-420} z={z - 700} far={5200} near={1500} opacity={ramp(lf, 0, 20) * (1 - sun)}>
        <Moon size={300} />
      </Obj>
      <Obj cam={cam} x={-60} y={300 - sun * 640} z={z - 900} far={6200} near={1500} opacity={sun * (1 - ramp(lf, 196, 24))}>
        <SunDisc size={900} />
      </Obj>
      <Title cam={cam} z={z} lf={lf} n="4" title="الجدولة" sub="خلّه يشتغل وأنت نايم" color={c} />
      {/* علي نايم → يصحى */}
      <Obj cam={cam} x={-170} y={190} z={z + 120} opacity={asleep}>
        <Sleeper f={f} />
      </Obj>
      <Obj cam={cam} x={-250} y={-60} z={z + 150} opacity={asleep}>
        <Zzz f={f} />
      </Obj>
      <Obj cam={cam} x={-240} y={120} z={z + 120} opacity={1 - asleep}>
        <Person f={lf} arm="phone" w={330} />
      </Obj>
      {/* الجوال على الطاولة يستقبل التقارير */}
      <Obj cam={cam} x={150} y={250} z={z + 40}>
        <div style={{ width: 90, height: 150, borderRadius: 18, background: "#10141F", border: "4px solid #3B455F", display: "grid", placeItems: "center", boxShadow: `0 0 ${sun > 0.5 ? 60 : 20}px ${sun > 0.5 ? T.ok : T.code}77` }}>
          <div style={{ font: `900 52px ${KUFI}`, color: T.ok, opacity: ramp(lf, 114, 8) }}>✓</div>
        </div>
      </Obj>
      {/* السحابة بساعتها */}
      <Obj cam={cam} x={230} y={-170} z={z - 60} opacity={ramp(lf, 20, 18)}>
        <div style={{ scale: `${1 + kick * 0.02}` }}>
          <CloudClock f={f} spin={1 + ramp(lf, 46, 30) * 5} color={c} />
        </div>
      </Obj>
      <Obj cam={cam} x={230} y={90} z={z + 20}>
        <Say p={ramp(lf, 26, 14)} size={50} weight={900} font={KUFI} color={T.ink} text="تشتغل في السحابة ☁" width={640} />
      </Obj>
      {/* تقارير تطير من السحابة للجوال */}
      {SEND.map((t, i) => {
        const p = clamp((lf - t) / 36);
        if (p <= 0 || p >= 1) return null;
        const x = 230 + (150 - 230) * p;
        const y = -80 + (330 + 20 + 80 - 20) * smooth(p) * 0.9 - Math.sin(p * Math.PI) * 120;
        return (
          <Obj key={t} cam={cam} x={x} y={y} z={z + 80 + p * 130} rz={-20 + p * 40}>
            <div style={{ scale: `${0.9 - p * 0.45}` }}>
              <Doc kind={(i % 3) as 0 | 1 | 2} s={0.8} />
            </div>
          </Obj>
        );
      })}
      {/* تسميات الجدولة الحقيقية */}
      <Obj cam={cam} y={455} z={z + 60} opacity={ramp(lf, 38, 14) * (1 - ramp(lf, wakeAt - 6, 8))}>
        <div style={{ direction: "rtl", textAlign: "center", whiteSpace: "nowrap", textShadow: `0 4px 26px ${T.bg}` }}>
          <div style={{ font: `700 42px/1.5 ${BODY}`, color: T.ink }}>
            <span style={{ direction: "ltr", display: "inline-block", fontFamily: LAT }}>Routines · Claude Code</span>
          </div>
          <div style={{ font: `700 42px/1.5 ${BODY}`, color: T.cowork }}>
            مهام <bdi>Cowork</bdi> المجدولة
          </div>
        </div>
      </Obj>
      <Obj cam={cam} y={455} z={z + 60} opacity={ramp(lf, wakeAt + 4, 14)}>
        <Say size={50} weight={900} font={KUFI} color={T.gold} text="صحيت… والتقرير جاهز" width={900} />
      </Obj>
    </>
  );
};

/* ═══════════ ٥. الفرق باختصار — ثلاث كرات ═══════════ */
const TRIO = [
  { x: 350, name: "Chat", word: "فكّر معاه", line: "تسأل وتتناقش", color: T.chat, Ico: IcoChat },
  { x: 0, name: "Cowork", word: "وكّله", line: "يرتّب ملفاتك ويسلّمك النتيجة", color: T.cowork, Ico: IcoFolder },
  { x: -350, name: "Claude Code", word: "ابنِ معاه", line: "يعدّل مشروعك ويجرّب", color: T.code, Ico: IcoTerm },
];
export const CompareIsland: React.FC<P> = ({ cam, f }) => {
  const lf = f - S.compare;
  const z = Z.compare;
  const { kick } = useMusic();
  return (
    <>
      <Platform cam={cam} z={z} f={f} color={T.gold} />
      <Title cam={cam} z={z} lf={lf} n="＝" title="الفرق باختصار" sub="نوع الشغل… مو الزر" color={T.gold} />
      {TRIO.map((t, i) => {
        const p = ramp(lf, 14 + i * 14, 16);
        return (
          <Fragment key={t.name}>
            <Obj cam={cam} x={t.x} y={-230 + Math.sin(f / 16 + i) * 14} z={z + 40} opacity={p}>
              <div style={{ position: "relative", width: 250, height: 250, scale: `${0.5 + 0.5 * p + kick * 0.03}` }}>
                <div style={{ position: "absolute", inset: -60, borderRadius: "50%", background: `radial-gradient(circle, ${t.color}55, transparent 66%)` }} />
                <div style={{ position: "absolute", inset: -16, borderRadius: "50%", border: `3px dashed ${t.color}99`, rotate: `${f * (i % 2 ? -1 : 1)}deg` }} />
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", display: "grid", placeItems: "center", color: t.color, background: `radial-gradient(circle at 35% 30%, #2A3558, ${T.bg})`, border: `4px solid ${t.color}`, boxShadow: `0 0 70px ${t.color}66` }}>
                  <t.Ico s={130} c={t.color} />
                </div>
              </div>
            </Obj>
            <Obj cam={cam} x={t.x} y={30} z={z + 60} opacity={ramp(lf, 22 + i * 14, 14)}>
              <div style={{ direction: "rtl", textAlign: "center", width: 350, textShadow: `0 4px 26px ${T.bg}` }}>
                <div style={{ font: `900 66px/1.2 ${KUFI}`, color: t.color }}>{t.word}</div>
                <div style={{ font: `700 40px/1.2 ${LAT}`, color: T.ink, direction: "ltr", marginTop: 8 }}>{t.name}</div>
                <div style={{ font: `700 40px/1.4 ${BODY}`, color: T.mute, marginTop: 10 }}>{t.line}</div>
              </div>
            </Obj>
          </Fragment>
        );
      })}
      <Obj cam={cam} y={350} z={z + 80} opacity={ramp(lf, 100, 14)}>
        <Say size={42} color={T.gold} width={1000} text={<>الجدولة متاحة في: <bdi>Cowork</bdi> · <bdi>Claude Code</bdi></>} />
      </Obj>
      <Obj cam={cam} y={425} z={z + 80} opacity={ramp(lf, 128, 14)}>
        <Say size={36} color={T.mute} weight={600} width={1000} text={<>المحادثة مع <bdi>Cowork</bdi> صارا تدريجياً <bdi>Claude</bdi> واحد</>} />
      </Obj>
    </>
  );
};

