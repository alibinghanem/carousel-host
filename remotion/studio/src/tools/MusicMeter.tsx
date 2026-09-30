import { AbsoluteFill } from "remotion";
import { Background } from "../lib/Background";
import { MusicProvider, Spectrum, useMusic } from "../lib/music";

/** أداة فحص: تعرض طاقة الموسيقى فريم بفريم — للتأكد إن النبض يطابق الإيقاع */
const Meter: React.FC = () => {
  const { kick, bass, mid, high, frame } = useMusic();
  const row = (label: string, v: number, c: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 44, color: "#fff", fontFamily: "JetBrains Mono" }}>
      <div style={{ width: 150 }}>{label}</div>
      <div style={{ width: 600, height: 36, background: "#ffffff22", borderRadius: 18 }}>
        <div style={{ width: v * 600, height: 36, background: c, borderRadius: 18 }} />
      </div>
      <div style={{ width: 130 }}>{v.toFixed(2)}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 40 }}>
      <div style={{ color: "#fff", fontSize: 60, fontFamily: "JetBrains Mono" }}>f {frame}</div>
      {row("kick", kick, "#FFFFFF")}
      {row("bass", bass, "#FF5A5F")}
      {row("mid", mid, "#FFC940")}
      {row("high", high, "#35E0FF")}
      <Spectrum width={900} height={260} color="#fff" />
    </AbsoluteFill>
  );
};

export const MusicMeter: React.FC<{ src: string }> = ({ src }) => (
  <MusicProvider src={src} volume={1}>
    <Background />
    <Meter />
  </MusicProvider>
);
