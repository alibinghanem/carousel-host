import { Cam } from "../../lib/camera3d";
import { Obj } from "../../lib/world3d";
import { useMusic } from "../../lib/music";
import { ARR, Z } from "./tl";
import { Float } from "./Chat";
import { BODY, ClaudeMark, Header, IcoChat, IcoFolder, IcoTerm, KUFI, LAT, Panel, T, ramp } from "./parts";

const ACC = T.gold;

const ROWS = [
  { c: T.chat, Ico: IcoChat, name: "المحادثة", verb: "فكّر معاه", desc: "تسأل وتناقش وتكتب معاه", at: 14 },
  { c: T.cowork, Ico: IcoFolder, name: "Cowork", verb: "وكّله", desc: "تعطيه مهمة وملفات… وترجع تلقاها جاهزة", at: 46 },
  { c: T.code, Ico: IcoTerm, name: "Claude Code", verb: "ابنِ معاه", desc: "للمبرمجين: يعدّل الكود ويختبره داخل مشروعك", at: 78 },
];

const Note: React.FC<{ lf: number; at: number; children: React.ReactNode; icon: React.ReactNode }> = ({ lf, at, children, icon }) => {
  const p = ramp(lf, at, 12);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        height: 98,
        padding: "0 26px",
        borderRadius: 22,
        background: "rgba(242,214,155,.08)",
        border: `2px dashed ${ACC}88`,
        font: `700 35px/1.35 ${BODY}`,
        color: T.ink,
        opacity: p,
        translate: `0px ${(1 - p) * 24}px`,
      }}
    >
      <div style={{ flex: "none" }}>{icon}</div>
      <div>{children}</div>
    </div>
  );
};

/** المحطة ٤: الفرق باختصار + ملاحظتان تهمان المتابع (الدمج، والاشتراك) */
export const Compare: React.FC<{ cam: Cam; f: number }> = ({ cam, f }) => {
  const lf = f - ARR.compare;
  const { kick } = useMusic();
  return (
    <>
      <Obj cam={cam} z={Z.compare} y={-600} near={1000} far={2600} farSoft={700}>
        <Header n="≠" title="الفرق باختصار" sub="فكّر معاه · وكّله · ابنِ معاه" accent={ACC} lf={lf} icon={<span style={{ font: `900 64px ${KUFI}` }}>≠</span>} />
      </Obj>
      <Obj cam={cam} z={Z.compare} y={-50} near={1000} far={2600} farSoft={700}>
        <Panel accent={ACC} lf={lf}>
          {ROWS.map((r, i) => {
            const p = ramp(lf, r.at, 12);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 30,
                  right: 30,
                  top: 20 + i * 196,
                  height: 176,
                  borderRadius: 28,
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  padding: "0 26px",
                  background: `linear-gradient(160deg, ${r.c}26, ${r.c}0A)`,
                  border: `2px solid ${r.c}88`,
                  opacity: p,
                  translate: `${(1 - p) * 140}px 0px`,
                  boxShadow: p > 0.9 ? `0 0 ${22 + kick * 22}px ${r.c}22` : undefined,
                }}
              >
                <div style={{ flex: "none", width: 96, height: 96, borderRadius: 28, background: r.c, display: "grid", placeItems: "center", color: T.bg }}>
                  <r.Ico s={58} c={T.bg} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <div style={{ font: `900 54px/1.2 ${KUFI}`, color: T.ink, whiteSpace: "nowrap" }}>{r.name}</div>
                    <div style={{ marginRight: "auto", padding: "0 20px 6px", borderRadius: 999, background: r.c, color: T.bg, font: `900 38px/1.4 ${KUFI}`, whiteSpace: "nowrap" }}>{r.verb}</div>
                  </div>
                  <div style={{ marginTop: 6, font: `700 38px/1.4 ${BODY}`, color: T.ink, opacity: 0.8 }}>{r.desc}</div>
                </div>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 30, right: 30, top: 612, display: "flex", flexDirection: "column", gap: 12 }}>
            <Note lf={lf} at={122} icon={<ClaudeMark size={48} />}>
              المحادثة و<bdi>Cowork</bdi> صاروا بشاشة وحدة… و<bdi>Claude</bdi> يختار الطريقة (يتوزع تدريجياً)
            </Note>
            <Note lf={lf} at={156} icon={<span style={{ font: `800 40px ${LAT}`, color: ACC }}>$</span>}>
              <bdi>Cowork</bdi> و<bdi>Claude Code</bdi>: تحتاج اشتراك <bdi>Claude</bdi> مدفوع (أو حساب <bdi>Console</bdi> لـ <bdi>Code</bdi>)
            </Note>
          </div>
        </Panel>
      </Obj>
      <Float cam={cam} f={f} z={Z.compare + 420} x={-590} y={-300} color={T.chat} kind="bubble" ph={0} at={ARR.compare + 6} />
      <Float cam={cam} f={f} z={Z.compare + 300} x={600} y={-60} color={T.cowork} kind="file" ph={2} at={ARR.compare + 18} />
      <Float cam={cam} f={f} z={Z.compare + 480} x={-590} y={380} color={T.code} kind="brace" ph={4} at={ARR.compare + 30} />
    </>
  );
};
