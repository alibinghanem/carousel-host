import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Background } from "../components/Background";
import { Target } from "../components/Target";
import { Chip, Flash, Glass, ReasonHead, Typer } from "../components/ui";
import { C, F, lerp } from "../theme";

/** السبب ١ (على الـ drop): لوحة فاضية «؟» تتحول لهدف واضح */
export const Reason1: React.FC = () => {
  const f = useCurrentFrame();
  const morph = lerp(f, [44, 78], [0, 1]);
  const dashRot = f * 1.4;
  return (
    <AbsoluteFill>
      <Background tint={C.y} />
      <Flash at={0} max={0.5} />
      <ReasonHead n="1" title="هدف غامض" color={C.y} />

      <div style={{ position: "absolute", left: 540 - 170, top: 520, width: 340, height: 340 }}>
        <svg width={340} height={340} viewBox="0 0 200 200" style={{ position: "absolute", inset: 0, opacity: 1 - morph, rotate: `${dashRot}deg` }}>
          <circle cx={100} cy={100} r={94} fill="rgba(255,255,255,.04)" stroke="#8A94A0" strokeWidth={4} strokeDasharray="12 10" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: F.head, fontWeight: 800, fontSize: 170, color: C.mute, opacity: 1 - morph, scale: `${1 + Math.sin(f / 5) * 0.05}` }}>؟</div>
        <Target size={340} draw={morph} glow={morph * 1.4} style={{ position: "absolute", inset: 0 }} />
      </div>
      <div style={{ position: "absolute", top: 880, left: 0, right: 0, textAlign: "center", fontFamily: F.head, fontWeight: 800, fontSize: 44, color: morph > 0.6 ? C.y : C.mute, direction: "rtl" }}>
        {morph > 0.6 ? "هنا بالضبط ✓" : "وين يرمي؟"}
      </div>

      <Glass style={{ position: "absolute", top: 960, left: 80, right: 80, padding: "20px 30px", opacity: lerp(f, [24, 34], [0, 1]) }}>
        <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: 32, color: C.r }}>✕ غامض</div>
        <div style={{ position: "relative", display: "inline-block", fontFamily: F.body, fontWeight: 700, fontSize: 40, color: "#C8CFD6" }}>
          «حسّن لي الإيميلات»
          <div style={{ position: "absolute", right: 0, top: "52%", height: 6, borderRadius: 3, background: C.r, width: `${lerp(f, [90, 104], [0, 100])}%` }} />
        </div>
      </Glass>

      <Glass light style={{ position: "absolute", top: 1110, left: 80, right: 80, padding: "20px 30px", opacity: lerp(f, [100, 110], [0, 1]), translate: `0px ${lerp(f, [100, 114], [40, 0])}px` }}>
        <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: 32, color: C.ok }}>✓ واضح</div>
        <Typer
          text={'«رد على إيميلات العملاء اللي فيها "استرجاع" خلال ساعة، بقالب الرد المعتمد»'}
          at={108}
          dur={50}
          caret={C.b}
          style={{ fontFamily: F.body, fontWeight: 700, fontSize: 34, lineHeight: 1.5, minHeight: 102 }}
        />
      </Glass>

      <div style={{ position: "absolute", top: 1330, left: 60, right: 60, display: "flex", justifyContent: "center", gap: 14, direction: "rtl" }}>
        <Chip at={162} bg={C.y} color={C.ink} style={{ fontSize: 32 }}>وش يسوي</Chip>
        <Chip at={170} bg={C.y} color={C.ink} style={{ fontSize: 32 }}>على أي شي</Chip>
        <Chip at={178} bg={C.y} color={C.ink} style={{ fontSize: 32 }}>بأي شكل</Chip>
      </div>

      <Audio from={0} src={staticFile("sfx/sub.wav")} volume={0.9} />
      <Audio from={60} src={staticFile("sfx/swell.wav")} volume={0.35} />
      <Audio from={78} src={staticFile("sfx/ding.wav")} volume={0.4} />
      <Audio from={92} src={staticFile("sfx/blip_lo.wav")} volume={0.5} />
      {[110, 120, 130, 140, 150].map((t) => (
        <Audio key={t} from={t} src={staticFile("sfx/click.wav")} volume={0.3} />
      ))}
      {[162, 170, 178].map((t) => (
        <Audio key={t} from={t} src={staticFile("sfx/pop.wav")} volume={0.4} />
      ))}
    </AbsoluteFill>
  );
};
