import { Cam } from "../../lib/camera3d";
import { Obj } from "../../lib/world3d";
import { useMusic } from "../../lib/music";
import { ARR, Z } from "./tl";
import { Float } from "./Chat";
import { BODY, Foot, Header, IcoTerm, KUFI, MONO, Panel, T, ramp, typed } from "./parts";

const ACC = T.code;

export const Code: React.FC<{ cam: Cam; f: number }> = ({ cam, f }) => {
  const lf = f - ARR.code;
  const { kick } = useMusic();
  const prompt = "> fix the checkout bug and run the tests";
  const pt = typed(prompt, lf, 22, 50);
  const line = (at: number, node: React.ReactNode, key: string) => {
    const p = ramp(lf, at, 6);
    return (
      <div key={key} style={{ opacity: p, translate: `${(1 - p) * -16}px 0px`, height: 46, whiteSpace: "nowrap" }}>
        {node}
      </div>
    );
  };
  const pill = (txt: React.ReactNode, at: number, x: number, y: number) => {
    const p = ramp(lf, at, 8);
    const on = p > 0.5;
    return (
      <div
        key={at}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: 432,
          height: 84,
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          background: on ? `${ACC}2E` : "rgba(255,255,255,.05)",
          border: `2px solid ${on ? ACC : "rgba(255,255,255,.16)"}`,
          font: `800 38px ${BODY}`,
          color: on ? T.ink : T.mute,
          scale: `${1 + (on ? Math.max(0, 0.06 - (lf - at) * 0.006) : 0)}`,
        }}
      >
        <span style={{ color: ACC, font: `900 38px ${BODY}` }}>{on ? "✓" : "○"}</span>
        {txt}
      </div>
    );
  };
  const tests = lf >= 174;
  return (
    <>
      <Obj cam={cam} z={Z.code} y={-600} near={1000} far={2600} farSoft={700}>
        <Header n="3" title="Claude Code" sub="تبني معاه برمجيات" accent={ACC} lf={lf} icon={<IcoTerm s={58} c="#0A0F1D" />} />
      </Obj>
      <Obj cam={cam} z={Z.code} y={-50} near={1000} far={2600} farSoft={700}>
        <Panel accent={ACC} lf={lf}>
          {/* الطرفية */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 398, background: "#070B16", borderBottom: `2px solid ${ACC}44`, direction: "ltr" }}>
            <div style={{ height: 56, display: "flex", alignItems: "center", gap: 10, padding: "0 24px", background: "rgba(255,255,255,.05)" }}>
              {["#FF6B6B", "#FFD166", "#3DDC97"].map((c) => (
                <div key={c} style={{ width: 16, height: 16, borderRadius: "50%", background: c }} />
              ))}
              <div style={{ marginLeft: 16, font: `600 24px ${MONO}`, color: T.mute }}>my-app — claude</div>
            </div>
            <div style={{ padding: "12px 28px", font: `800 30px ${MONO}`, color: T.ink }}>
              {line(12, <span style={{ color: T.mute }}>$ claude</span>, "a")}
              {lf >= 22 ? (
                <div style={{ height: 46, whiteSpace: "nowrap", color: ACC }}>
                  {pt}
                  {lf < 78 ? <span style={{ display: "inline-block", width: 14, height: 30, background: ACC, marginLeft: 4, verticalAlign: "-4px", opacity: Math.floor(lf / 8) % 2 ? 0.3 : 1 }} /> : null}
                </div>
              ) : null}
              {line(86, <span><span style={{ color: ACC }}>● </span>Reading src/checkout.ts</span>, "b")}
              {line(116, <span><span style={{ color: ACC }}>● </span>Editing 2 files</span>, "c")}
              {!tests ? line(146, <span><span style={{ color: ACC }}>● </span>Running tests…</span>, "d") : null}
              {tests ? line(174, <span style={{ color: T.ok }}>✓ 12 tests passed</span>, "e") : null}
              {line(206, <span><span style={{ color: ACC }}>● </span>git commit -m "fix checkout"</span>, "f")}
            </div>
          </div>
          {/* ما يسويه Claude Code بالعربي */}
          {pill("يقرأ مشروعك", 86, 36, 420)}
          {pill("يعدّل الملفات", 116, 492, 420)}
          {pill("يشغّل الاختبارات", 174, 36, 520)}
          {pill(<span>يسوّي <span style={{ fontFamily: LATF }}>commit</span></span>, 206, 492, 520)}
          {/* الفرق (diff) + سلسلة الـ commits */}
          <div
            style={{
              position: "absolute",
              left: 36,
              right: 36,
              top: 632,
              height: 160,
              borderRadius: 22,
              background: "#070B16",
              border: "2px solid rgba(255,255,255,.14)",
              direction: "ltr",
              padding: "10px 24px",
              opacity: ramp(lf, 114, 10),
              overflow: "hidden",
            }}
          >
            <div style={{ font: `600 24px ${MONO}`, color: T.mute, height: 34 }}>src/checkout.ts</div>
            <div style={{ font: `800 30px ${MONO}`, height: 48, color: T.bad, background: "rgba(255,107,122,.12)", margin: "0 -24px", padding: "0 24px", whiteSpace: "nowrap" }}>- if (total = 0) return;</div>
            <div style={{ font: `800 30px ${MONO}`, height: 48, color: T.ok, background: "rgba(61,220,151,.12)", margin: "0 -24px", padding: "0 24px", whiteSpace: "nowrap", opacity: ramp(lf, 126, 8) }}>+ if (total === 0) return;</div>
            <svg width="190" height="60" viewBox="0 0 190 60" style={{ position: "absolute", right: 22, top: 8 }}>
              <line x1="20" y1="30" x2="170" y2="30" stroke={`${ACC}77`} strokeWidth="3" />
              {[20, 95, 170].map((x, i) => {
                const on = i < 2 || lf >= 210;
                return <circle key={x} cx={x} cy="30" r={i === 2 ? 11 + (lf >= 210 ? kick * 5 : 0) : 9} fill={on ? ACC : T.bg} stroke={ACC} strokeWidth="3" />;
              })}
            </svg>
          </div>
          <div style={{ position: "absolute", bottom: 4, left: 0, right: 0, textAlign: "center", font: `700 24px ${BODY}`, color: T.mute, opacity: 0.55 }}>مثال توضيحي</div>
        </Panel>
      </Obj>
      <Obj cam={cam} z={Z.code} y={420} near={1000} far={2600} farSoft={700}>
        <Foot lf={lf} at={190} accent={ACC}>
          للمبرمجين… تشغّله من الطرفية أو تبويب <span style={{ fontFamily: KUFI }}>Code</span>
        </Foot>
      </Obj>
      <Float cam={cam} f={f} z={Z.code + 420} x={-580} y={-320} color={ACC} kind="brace" ph={0} at={ARR.code + 10} />
      <Float cam={cam} f={f} z={Z.code + 280} x={600} y={-100} color={ACC} kind="gear" ph={2} at={ARR.code + 26} />
      <Float cam={cam} f={f} z={Z.code + 520} x={-600} y={400} color={ACC} kind="spark" ph={4} at={ARR.code + 40} />
      <Float cam={cam} f={f} z={Z.code + 360} x={590} y={420} color={ACC} kind="brace" ph={3} at={ARR.code + 54} />
    </>
  );
};
const LATF = "Space Grotesk";
