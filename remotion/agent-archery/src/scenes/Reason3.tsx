import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Background } from "../components/Background";
import { Target } from "../components/Target";
import { Glass, ReasonHead, Words } from "../components/ui";
import { C, F, lerp } from "../theme";

/** السبب ٣: معيار نجاح مكتوب… يتعلّم عليه بندًا بندًا */
const ITEMS = [
  { t: "كل إيميل له رد", at: 104 },
  { t: "الرد أقل من 120 كلمة", at: 130 },
  { t: "ما فيه أي وعد بمبلغ", at: 156 },
];

export const Reason3: React.FC = () => {
  const f = useCurrentFrame();
  const score = Math.round(lerp(f, [24, 80], [0, 10]));
  return (
    <AbsoluteFill>
      <Background tint={C.b} />
      <ReasonHead n="3" title="بلا معيار نجاح" color={C.b} textColor="#fff" />

      <div style={{ position: "absolute", left: 90, top: 520, width: 360, height: 360, rotate: `${Math.sin(f / 20) * 3}deg` }}>
        <Target size={360} draw={lerp(f, [6, 36], [0, 1])} />
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: F.en, fontWeight: 700, fontSize: 64, color: C.ink }}>{score}</div>
      </div>
      <div style={{ position: "absolute", top: 560, right: 70, width: 540, direction: "rtl", whiteSpace: "nowrap" }}>
        <Words text="متى يوقف؟" at={18} stagger={6} style={{ fontFamily: F.head, fontWeight: 800, fontSize: 70, color: "#fff" }} />
        <Words text="ومتى يقول «تم»؟" at={38} stagger={6} color={C.y} style={{ fontFamily: F.head, fontWeight: 800, fontSize: 62 }} />
        <div style={{ marginTop: 16, fontFamily: F.body, fontWeight: 600, fontSize: 32, color: "#C8CFD6", opacity: lerp(f, [60, 72], [0, 1]) }}>اكتبها له حرفياً ⬇</div>
      </div>

      <Glass light style={{ position: "absolute", top: 940, left: 80, right: 80, padding: "26px 34px", opacity: lerp(f, [76, 88], [0, 1]), translate: `0px ${lerp(f, [76, 92], [50, 0])}px` }}>
        <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 28, color: "#6B7480" }}>انسخها في تعليمات الوكيل:</div>
        <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 38, marginTop: 6 }}>«تعتبر المهمة منتهية لما:</div>
        {ITEMS.map((it) => (
          <div key={it.t} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10, fontFamily: F.body, fontWeight: 700, fontSize: 38, opacity: lerp(f, [it.at, it.at + 6], [0.25, 1]) }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: f >= it.at ? C.ok : "#E6E3DB",
                color: "#fff",
                fontSize: 24,
                scale: `${f >= it.at ? lerp(f, [it.at, it.at + 8], [1.6, 1]) : 1}`,
              }}
            >
              ✓
            </div>
            {it.t}
          </div>
        ))}
        <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 38, marginTop: 12, color: C.r, opacity: lerp(f, [184, 196], [0, 1]) }}>وإذا ما قدرت، وقّف واسألني»</div>
      </Glass>

      {ITEMS.map((it) => (
        <Audio key={it.at} from={it.at} src={staticFile("sfx/tick.wav")} volume={0.55} />
      ))}
      <Audio from={184} src={staticFile("sfx/blip_hi.wav")} volume={0.4} />
      <Audio from={0} src={staticFile("sfx/whoosh.wav")} volume={0.5} />
    </AbsoluteFill>
  );
};
