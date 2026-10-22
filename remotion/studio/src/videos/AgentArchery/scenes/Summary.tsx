import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { Audio } from "@remotion/media";
import { Background } from "../../../lib/Background";
import { Arrow, Target } from "../Target";
import { Burst, Flash, Glass, Words } from "../../../lib/ui";
import { C, F, lerp, shake } from "../../../lib/theme";

/** 32–36ث: بطاقة ٣ أسئلة… ثم السهم في الهدف */
const CHECKS = [
  { t: "الهدف مكتوب بوضوح؟", at: 30 },
  { t: "الأدوات مربوطة؟", at: 56 },
  { t: "معيار النجاح واضح؟", at: 82 },
];
const HIT = 120;

export const Summary: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fly = lerp(f, [HIT - 10, HIT], [0, 1], (t) => t * t);
  const s = spring({ frame: f - HIT - 2, fps, config: { damping: 10, stiffness: 180 } });
  const sy = shake(f, HIT, 16, 14);
  return (
    <AbsoluteFill style={{ translate: `0px ${sy}px` }}>
      <Background tint={C.ok} />
      <Words text="قبل ما تطلق أي وكيل" at={4} stagger={6} style={{ position: "absolute", top: 320, left: 60, right: 60, textAlign: "center", fontFamily: F.head, fontWeight: 800, fontSize: 92, color: "#fff" }} />

      <Glass style={{ position: "absolute", top: 480, left: 90, right: 90, padding: "12px 30px" }}>
        {CHECKS.map((c, i) => (
          <div key={c.t} style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 0", borderTop: i ? "2px dashed rgba(255,255,255,.14)" : "none" }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                border: `5px solid ${f >= c.at ? C.ok : "rgba(255,255,255,.4)"}`,
                background: f >= c.at ? C.ok : "transparent",
                display: "grid",
                placeItems: "center",
                color: C.ink,
                fontSize: 38,
                fontWeight: 800,
                scale: `${f >= c.at ? lerp(f, [c.at, c.at + 8], [1.5, 1]) : 1}`,
              }}
            >
              {f >= c.at ? "✓" : ""}
            </div>
            <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 42 }}>{c.t}</div>
          </div>
        ))}
      </Glass>

      <div style={{ position: "absolute", left: 540 - 170, top: 930, width: 340, height: 340 }}>
        <Target size={340} glow={1 + (f > HIT ? 1.5 * (1 - s) + 0.6 : 0)} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 540 - 30,
          top: lerp(fly, [0, 1], [1900, 1100], (t) => t),
          opacity: f >= HIT - 10 ? 1 : 0,
          scale: `${lerp(fly, [0, 1], [1, 0.55], (t) => t)}`,
          transformOrigin: "30px 0px",
          filter: `drop-shadow(0 0 16px ${C.y})`,
        }}
      >
        <Arrow len={360} />
      </div>
      <Burst at={HIT} x={540} y={1100} color={C.y} n={28} />
      <Flash at={HIT} color={C.y} max={0.45} />

      <div
        style={{
          position: "absolute",
          top: 1290,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: F.head,
          fontWeight: 800,
          fontSize: 76,
          color: C.y,
          direction: "rtl",
          opacity: f > HIT ? Math.min(1, s * 1.5) : 0,
          scale: `${0.5 + 0.5 * s}`,
          textShadow: `0 0 40px ${C.y}88`,
        }}
      >
        3/3 = في الهدف
      </div>

      {CHECKS.map((c) => (
        <Audio key={c.at} from={c.at} src={staticFile("sfx-synth/tick.wav")} volume={0.55} />
      ))}
      <Audio from={HIT - 11} src={staticFile("sfx-synth/whoosh.wav")} volume={0.8} />
      <Audio from={HIT} src={staticFile("sfx-synth/thud.wav")} volume={0.8} />
      <Audio from={HIT + 2} src={staticFile("sfx-synth/ding.wav")} volume={0.5} />
    </AbsoluteFill>
  );
};
