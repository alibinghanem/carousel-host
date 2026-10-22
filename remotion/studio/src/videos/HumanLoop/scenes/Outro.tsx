import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { lerp } from "../../../lib/theme";
import { Handles } from "../../../lib/Hud";
import { Sfx, Spectrum, useMusic } from "../../../lib/music";
import { B, D, H, PaperBg, Stamp } from "../parts";

/** الختام (1560–1800): علي + الحسابين + الخلاصة + سؤال — الموسيقى تهدأ */
export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { bass } = useMusic();
  const a = spring({ frame: f - 4, fps, config: { damping: 13, stiffness: 140 } });
  const sum = spring({ frame: f - 30, fps, config: { damping: 14, stiffness: 160 } });
  return (
    <AbsoluteFill>
      <PaperBg />
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", direction: "rtl" }}>
        <div
          style={{
            width: 330,
            height: 330,
            borderRadius: "50%",
            overflow: "hidden",
            background: H.y,
            border: `10px solid ${H.ink}`,
            boxShadow: `0 0 0 ${10 + bass * 14}px ${H.y}`,
            scale: `${a}`,
          }}
        >
          <Img src={staticFile("avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%" }} />
        </div>
        <div style={{ marginTop: 26, fontFamily: D, fontWeight: 800, fontSize: 84, color: H.ink, opacity: lerp(f, [12, 22], [0, 1]) }}>علي التميمي</div>
        <div style={{ marginTop: 14, opacity: lerp(f, [18, 28], [0, 1]) }}>
          <Handles size={30} />
        </div>
        <div
          style={{
            position: "relative",
            marginTop: 52,
            padding: "30px 48px",
            borderRadius: 32,
            background: H.ink,
            textAlign: "center",
            scale: `${0.7 + 0.3 * sum}`,
            opacity: Math.min(1, sum * 2),
          }}
        >
          <div style={{ fontFamily: D, fontWeight: 800, fontSize: 62, color: "#fff", lineHeight: 1.3 }}>الوكيل يجهّز…</div>
          <div style={{ fontFamily: D, fontWeight: 800, fontSize: 70, color: H.y, lineHeight: 1.3 }}>وأنت تعتمد</div>
        </div>
        <div style={{ marginTop: 40, fontFamily: B, fontWeight: 700, fontSize: 50, color: H.ink, opacity: lerp(f, [70, 82], [0, 1]) }}>
          وين بتحط أول بوابة عندك؟
        </div>
        <div style={{ marginTop: 6, fontFamily: B, fontWeight: 600, fontSize: 36, color: H.steel, opacity: lerp(f, [80, 92], [0, 1]) }}>
          قل لي بالتعليقات · وتابعني للمزيد
        </div>
        <div style={{ marginTop: 26, opacity: lerp(f, [20, 40], [0, 0.8]) }}>
          <Spectrum width={560} height={64} color={H.ink} bars={28} />
        </div>
      </div>
      <Stamp at={54} text="معتمد" x={240} y={880} rot={-14} size={44} />
      <Sfx name="whoosh_soft" at={0} volume={0.4} />
      <Sfx name="pop" at={6} volume={0.35} />
      <Sfx name="impact" at={54} volume={0.26} />
      <Sfx name="success" at={58} volume={0.3} />
    </AbsoluteFill>
  );
};
