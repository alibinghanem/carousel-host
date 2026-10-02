import { Cam, smooth } from "../../lib/camera3d";
import { Obj } from "../../lib/world3d";
import { useMusic } from "../../lib/music";
import { ARR, Z } from "./tl";
import { Float } from "./Chat";
import { BODY, ClaudeMark, Foot, Header, IcoFolder, KUFI, LAT, Panel, T, ramp } from "./parts";

const ACC = T.cowork;

/** ملفات فوضى → 3 مجلدات. ‎t‎ = رقم المجلد الهدف */
const FILES = [
  { x: 40, y: 128, r: -6, tag: "PDF", c: "#FF8A8A", t: 0 },
  { x: 214, y: 150, r: 5, tag: "JPG", c: "#8FB8FF", t: 1 },
  { x: 100, y: 246, r: -3, tag: "PDF", c: "#FF8A8A", t: 2 },
  { x: 262, y: 276, r: 7, tag: "JPG", c: "#8FB8FF", t: 0 },
  { x: 36, y: 352, r: 4, tag: "XLSX", c: "#7DE0B0", t: 1 },
  { x: 214, y: 378, r: -5, tag: "PDF", c: "#FF8A8A", t: 2 },
];
const FOLDERS = [
  { name: "مطاعم", y: 128, amt: "640" },
  { name: "وقود", y: 248, amt: "410" },
  { name: "اشتراكات", y: 368, amt: "215" },
];
const FX = 520; // x المجلدات
const START = 50; // بداية فرز أول ملف
const STEP = 18; // بين ملف وملف
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const Shield: React.FC = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={ACC} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
    <path d="M8.5 12l2.5 2.5L16 9.5" />
  </svg>
);

export const Cowork: React.FC<{ cam: Cam; f: number }> = ({ cam, f }) => {
  const lf = f - ARR.cowork;
  const { kick } = useMusic();
  // موضع الروبوت (Claude) عبر الملفات
  let ox = 470;
  let oy = 300;
  let carry = -1;
  FILES.forEach((fl, i) => {
    const s = START + i * STEP;
    const fx = fl.x + 85;
    const fy = fl.y + 52;
    const tx = FX - 8;
    const ty = FOLDERS[fl.t].y + 50;
    if (lf >= s && lf < s + 8) {
      const t = smooth((lf - s) / 8);
      ox = lerp(ox, fx, t);
      oy = lerp(oy, fy, t);
    } else if (lf >= s + 8 && lf < s + 16) {
      const t = smooth((lf - s - 8) / 8);
      ox = lerp(fx, tx, t);
      oy = lerp(fy, ty, t);
      carry = i;
    } else if (lf >= s + 16) {
      ox = tx;
      oy = ty;
    }
  });
  const done = FILES.map((_, i) => lf >= START + i * STEP + 16);
  const counts = [0, 1, 2].map((k) => FILES.filter((fl, i) => fl.t === k && done[i]).length);
  const rowsAt = 156;
  const row = (i: number) => ramp(lf, rowsAt + i * 8, 8);
  const total = ramp(lf, 192, 10);
  const pill = (txt: string, at: number) => {
    const p = ramp(lf, at, 10);
    return (
      <div
        key={txt}
        style={{
          flex: 1,
          textAlign: "center",
          padding: "8px 8px 12px",
          borderRadius: 999,
          font: `700 34px ${BODY}`,
          color: p > 0.5 ? T.bg : T.mute,
          background: p > 0.5 ? ACC : "rgba(255,255,255,.06)",
          border: `2px solid ${p > 0.5 ? ACC : "rgba(255,255,255,.14)"}`,
          scale: `${1 + (p > 0.5 ? kick * 0.03 : 0)}`,
        }}
      >
        {p > 0.5 ? "✓ " : ""}
        {txt}
      </div>
    );
  };
  return (
    <>
      <Obj cam={cam} z={Z.cowork} y={-600} near={1000} far={2600} farSoft={700}>
        <Header n="2" title="Cowork" sub="توكّله مهمة… وترجع تلقاها جاهزة" accent={ACC} lf={lf} icon={<IcoFolder s={58} c="#0A0F1D" />} />
      </Obj>
      <Obj cam={cam} z={Z.cowork} y={-50} near={1000} far={2600} farSoft={700}>
        <Panel accent={ACC} lf={lf}>
          {/* شريط المجلد + الصلاحية */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 84, display: "flex", alignItems: "center", gap: 16, padding: "0 36px", borderBottom: "2px solid rgba(255,255,255,.08)" }}>
            <IcoFolder s={44} c={ACC} />
            <div style={{ font: `900 36px ${KUFI}`, color: T.ink }}>فواتير الأسبوع</div>
            <div
              style={{
                marginRight: "auto",
                padding: "4px 20px 8px",
                borderRadius: 999,
                background: `${ACC}22`,
                border: `2px solid ${ACC}`,
                font: `700 30px ${BODY}`,
                color: ACC,
                opacity: ramp(lf, 28, 10),
                scale: `${0.7 + 0.3 * ramp(lf, 28, 10)}`,
              }}
            >
              ✓ مسموح بهذا المجلد
            </div>
          </div>
          {/* الملفات الفوضى */}
          {FILES.map((fl, i) => {
            const s = START + i * STEP;
            const p = ramp(lf, 8 + i * 3, 10);
            const gone = lf >= s + 16;
            const moving = i === carry;
            const t = moving ? smooth((lf - s - 8) / 8) : 0;
            const tx = FX - 8 - 85;
            const ty = FOLDERS[fl.t].y + 50 - 52;
            const jx = lf < s ? Math.sin(lf / 9 + i) * 3 : 0;
            if (gone) return null;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: lerp(fl.x, tx, t) + jx,
                  top: lerp(fl.y, ty, t) + (1 - p) * -60,
                  width: 170,
                  height: 104,
                  rotate: `${lerp(fl.r, 0, t)}deg`,
                  scale: `${(0.5 + 0.5 * p) * (moving ? 1 - t * 0.45 : 1)}`,
                  opacity: p * (moving ? 1 - t * 0.3 : 1),
                  borderRadius: 16,
                  background: "rgba(255,255,255,.07)",
                  border: "2px solid rgba(255,255,255,.2)",
                  padding: "10px 14px",
                }}
              >
                <div style={{ display: "inline-block", padding: "0 10px 2px", borderRadius: 8, background: fl.c, color: T.bg, font: `800 22px ${LAT}`, direction: "ltr" }}>{fl.tag}</div>
                <div style={{ marginTop: 10, height: 10, borderRadius: 5, background: "rgba(255,255,255,.22)", width: "86%" }} />
                <div style={{ marginTop: 9, height: 10, borderRadius: 5, background: "rgba(255,255,255,.14)", width: "58%" }} />
              </div>
            );
          })}
          {/* المجلدات */}
          {FOLDERS.map((fd, k) => {
            const p = ramp(lf, 14 + k * 5, 10);
            const full = counts[k] > 0;
            return (
              <div
                key={k}
                style={{
                  position: "absolute",
                  left: FX,
                  top: fd.y,
                  width: 400,
                  height: 100,
                  borderRadius: 22,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "0 24px",
                  background: full ? `${ACC}22` : "rgba(255,255,255,.05)",
                  border: `2px solid ${full ? ACC : "rgba(255,255,255,.18)"}`,
                  opacity: p,
                  translate: `${(1 - p) * 60}px 0px`,
                }}
              >
                <IcoFolder s={52} c={full ? ACC : T.mute} />
                <div style={{ font: `900 40px ${KUFI}`, color: T.ink }}>{fd.name}</div>
                <div
                  style={{
                    marginRight: "auto",
                    minWidth: 52,
                    height: 52,
                    borderRadius: 26,
                    display: "grid",
                    placeItems: "center",
                    background: full ? ACC : "rgba(255,255,255,.1)",
                    color: full ? T.bg : T.mute,
                    font: `800 32px ${LAT}`,
                    scale: `${1 + (lf - (START + 16) > 0 ? Math.max(0, 0.25 - ((lf - START - 16) % STEP) * 0.03) * (full ? 1 : 0) : 0)}`,
                  }}
                >
                  {counts[k]}
                </div>
              </div>
            );
          })}
          {/* Claude يرتب */}
          <div
            style={{
              position: "absolute",
              left: ox - 44,
              top: oy - 44,
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: T.bg,
              border: `3px solid ${T.chat}`,
              display: "grid",
              placeItems: "center",
              boxShadow: `0 0 ${34 + kick * 26}px ${T.chat}88`,
              opacity: ramp(lf, 30, 10),
              scale: `${0.6 + 0.4 * ramp(lf, 30, 10)}`,
            }}
          >
            <ClaudeMark size={52} />
          </div>
          {/* خطوات المهمة */}
          <div style={{ position: "absolute", left: 40, right: 40, top: 480, display: "flex", gap: 16 }}>
            {pill("قرأ الملفات", 44)}
            {pill("صنّفها", 118)}
            {pill("سوّى الجدول", 196)}
          </div>
          {/* الجدول النهائي */}
          <div
            style={{
              position: "absolute",
              left: 40,
              right: 40,
              top: 552,
              height: 246,
              borderRadius: 24,
              overflow: "hidden",
              background: "rgba(255,255,255,.05)",
              border: "2px solid rgba(255,255,255,.18)",
              opacity: ramp(lf, 148, 10),
            }}
          >
            <div style={{ display: "flex", padding: "8px 28px 10px", background: `${ACC}30`, font: `800 30px ${BODY}`, color: ACC }}>
              <div style={{ flex: 1 }}>البند</div>
              <div style={{ width: 240, textAlign: "left" }}>المبلغ (ريال)</div>
            </div>
            {FOLDERS.map((fd, i) => (
              <div key={i} style={{ display: "flex", padding: "5px 28px 6px", font: `700 34px ${BODY}`, color: T.ink, opacity: row(i), translate: `${(1 - row(i)) * 30}px 0px`, borderBottom: "1px solid rgba(255,255,255,.08)" }}>
                <div style={{ flex: 1 }}>{fd.name}</div>
                <div style={{ width: 240, textAlign: "left", font: `800 34px ${LAT}` }}>{fd.amt}</div>
              </div>
            ))}
            <div style={{ display: "flex", padding: "5px 28px 6px", font: `900 36px ${KUFI}`, color: ACC, opacity: total, background: `${ACC}1A`, scale: `${1 + Math.max(0, 0.04 - (lf - 192) * 0.004)}` }}>
              <div style={{ flex: 1 }}>الإجمالي</div>
              <div style={{ width: 240, textAlign: "left", font: `800 38px ${LAT}` }}>1,265</div>
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 4, left: 0, right: 0, textAlign: "center", font: `700 24px ${BODY}`, color: T.mute, opacity: 0.55 }}>رسم توضيحي</div>
        </Panel>
      </Obj>
      <Obj cam={cam} z={Z.cowork} y={420} near={1000} far={2600} farSoft={700}>
        <Foot lf={lf} at={40} accent={ACC} icon={<Shield />}>
          ما يحذف أي ملف بدون إذنك
        </Foot>
      </Obj>
      <Float cam={cam} f={f} z={Z.cowork + 400} x={-580} y={-330} color={ACC} kind="file" ph={1} at={ARR.cowork + 10} />
      <Float cam={cam} f={f} z={Z.cowork + 300} x={600} y={-180} color={ACC} kind="gear" ph={3} at={ARR.cowork + 24} />
      <Float cam={cam} f={f} z={Z.cowork + 520} x={-590} y={380} color={ACC} kind="spark" ph={5} at={ARR.cowork + 40} />
      <Float cam={cam} f={f} z={Z.cowork + 360} x={580} y={430} color={ACC} kind="file" ph={2} at={ARR.cowork + 56} />
    </>
  );
};
