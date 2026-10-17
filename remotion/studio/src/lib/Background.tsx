import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "./theme";
import { useMusic } from "./music";

/** خلفية حيّة: أضواء ملونة تتحرك + أرضية شبكية بمنظور + حبيبات.
 *  داخل MusicProvider تنبض مع الباص تلقائياً (react=0 يطفّيها). */
const hex = (v: number) =>
  Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0");

export const Background: React.FC<{ tint?: string; floor?: boolean; react?: number }> = ({
  tint = C.b,
  floor = true,
  react = 1,
}) => {
  const f = useCurrentFrame();
  const { kick, bass, high } = useMusic();
  const k = (kick * 0.65 + bass * 0.35) * react; // 0..1 — نبضة حادة مع كل ضربة + توهج عام
  const r1 = 700 + k * 260;
  const r2 = 800 + k * 180;
  const o1x = 30 + Math.sin(f / 70) * 12;
  const o1y = 22 + Math.cos(f / 90) * 6;
  const o2x = 75 + Math.cos(f / 80) * 10;
  const o2y = 70 + Math.sin(f / 60) * 8;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(${r1}px ${r1}px at ${o1x}% ${o1y}%, ${tint}${hex(0x55 + k * 0x50)}, transparent 70%),
            radial-gradient(${r2}px ${r2}px at ${o2x}% ${o2y}%, ${C.r}${hex(0x33 + k * 0x30)}, transparent 70%),
            radial-gradient(600px 600px at 50% 110%, ${C.y}22, transparent 70%)`,
        }}
      />
      {floor ? (
        <div
          style={{
            position: "absolute",
            left: -540,
            right: -540,
            bottom: -200,
            height: 900,
            transform: "perspective(700px) rotateX(72deg)",
            transformOrigin: "50% 100%",
            filter: `brightness(${1 + k * 1.6})`,
            backgroundImage: `linear-gradient(${C.cyan}33 2px, transparent 2px), linear-gradient(90deg, ${C.cyan}33 2px, transparent 2px)`,
            backgroundSize: "90px 90px",
            backgroundPosition: `0px ${(f * 3) % 90}px`,
            maskImage: "linear-gradient(to top, black 10%, transparent 85%)",
            WebkitMaskImage: "linear-gradient(to top, black 10%, transparent 85%)",
          }}
        />
      ) : null}
      <AbsoluteFill
        style={{
          opacity: 0.07 + high * react * 0.05,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,.9) 1px, transparent 1.4px)",
          backgroundSize: "6px 6px",
          backgroundPosition: `${(f * 7) % 6}px ${(f * 5) % 6}px`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(1200px 1400px at 50% 45%, transparent 55%, rgba(0,0,0,.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
