import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { Audio } from "@remotion/media";
import { Background } from "../components/Background";
import { Target } from "../components/Target";
import { Words } from "../components/ui";
import { Handles } from "../components/Hud";
import { C, F, lerp } from "../theme";

/** 36–40ث: صورة علي في مركز الهدف + الحسابين + سؤال */
export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 2, fps, config: { damping: 14, stiffness: 140 } });
  const ticks = Array.from({ length: 72 });
  return (
    <AbsoluteFill>
      <Background tint={C.y} />
      <div style={{ position: "absolute", left: 540 - 330, top: 330, width: 660, height: 660, scale: `${0.6 + 0.4 * s}`, opacity: Math.min(1, s * 1.5) }}>
        <svg width={660} height={660} viewBox="0 0 660 660" style={{ position: "absolute", inset: 0, rotate: `${f * 0.6}deg` }}>
          {ticks.map((_, i) => {
            const a = (i / 72) * Math.PI * 2;
            const len = 18 + 22 * Math.abs(Math.sin(i * 1.7 + f / 6));
            const r1 = 292;
            return (
              <line
                key={i}
                x1={330 + Math.cos(a) * r1}
                y1={330 + Math.sin(a) * r1}
                x2={330 + Math.cos(a) * (r1 + len)}
                y2={330 + Math.sin(a) * (r1 + len)}
                stroke={i % 2 ? C.cyan : C.y}
                strokeWidth={7}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <div style={{ position: "absolute", left: 50, top: 50 }}>
          <Target size={560} />
        </div>
        <div style={{ position: "absolute", left: 175, top: 175, width: 310, height: 310, borderRadius: "50%", overflow: "hidden", border: "10px solid #fff", background: `linear-gradient(180deg, #FFE58A, ${C.y})` }}>
          <Img src={staticFile("avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%" }} />
        </div>
      </div>
      <Words text="علي التميمي" at={12} style={{ position: "absolute", top: 1010, left: 0, right: 0, textAlign: "center", fontFamily: F.head, fontWeight: 800, fontSize: 92, color: "#fff" }} />
      <div style={{ position: "absolute", top: 1195, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: lerp(f, [22, 32], [0, 1]) }}>
        <Handles light />
      </div>
      <Words
        text="وش أغرب شي سواه لك وكيل ذكاء اصطناعي؟"
        at={34}
        stagger={2}
        style={{ position: "absolute", top: 1300, left: 70, right: 70, textAlign: "center", fontFamily: F.body, fontWeight: 700, fontSize: 42, color: C.y }}
      />
      <Audio from={2} src={staticFile("sfx/pop.wav")} volume={0.5} />
    </AbsoluteFill>
  );
};
