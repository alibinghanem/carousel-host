import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C } from "../theme";

/** خلفية حيّة: أضواء ملونة تتحرك + أرضية شبكية بمنظور + حبيبات */
export const Background: React.FC<{ tint?: string; floor?: boolean }> = ({
  tint = C.b,
  floor = true,
}) => {
  const f = useCurrentFrame();
  const o1x = 30 + Math.sin(f / 70) * 12;
  const o1y = 22 + Math.cos(f / 90) * 6;
  const o2x = 75 + Math.cos(f / 80) * 10;
  const o2y = 70 + Math.sin(f / 60) * 8;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(700px 700px at ${o1x}% ${o1y}%, ${tint}55, transparent 70%),
            radial-gradient(800px 800px at ${o2x}% ${o2y}%, ${C.r}33, transparent 70%),
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
          opacity: 0.07,
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
