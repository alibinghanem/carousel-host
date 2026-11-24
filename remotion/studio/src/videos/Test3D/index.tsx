import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Phone } from "../../lib/three3d/Phone";
import { BatteryCell, Cable, Heat, Shield, Thermometer } from "../../lib/three3d/Parts";
import { CameraRig, Lights, SoftShadow, StudioEnv } from "../../lib/three3d/Studio";

/** معرض لعناصر 3D للفحص */
export const Test3D: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #1B2440, #070A12 70%)" }}>
      <ThreeCanvas width={1080} height={1920} camera={{ fov: 30, position: [0, 0, 26] }}>
        <StudioEnv />
        <Lights />
        <CameraRig pos={[0, 1, 26]} look={[0, 0, 0]} />
        <Phone
          position={[-2.3, 3.4, 0]}
          rotation={[0.05, -0.35 + f * 0.01, 0.04]}
          draw={(g, w, h) => {
            const gr = g.createLinearGradient(0, 0, 0, h);
            gr.addColorStop(0, "#1E3A8A");
            gr.addColorStop(1, "#0B1022");
            g.fillStyle = gr;
            g.fillRect(0, 0, w, h);
            g.fillStyle = "#fff";
            g.font = "700 150px 'Space Grotesk'";
            g.textAlign = "center";
            g.fillText("80%", w / 2, h / 2);
          }}
        />
        <Phone position={[2.6, 3.4, 0]} rotation={[0.05, 0.4, -0.04]} xray={0.7} caseOn={1} draw={(g, w, h) => { g.fillStyle = "#111"; g.fillRect(0, 0, w, h); }}>
          <BatteryCell level={0.45} r={0.8} h={3.4} position={[0, -0.4, 0]} />
        </Phone>
        <BatteryCell level={0.8} position={[-3.2, -4.6, 0]} rotation={[0.2, 0, 0.1]} />
        <Thermometer level={0.75} position={[0, -4.4, 0]} rotation={[0, 0, -0.1]} />
        <Shield position={[3.4, -4.4, 0]} rotation={[0.1, -0.3, 0]} />
        <Cable pts={[[2.6, 0.1, 0], [2.6, -1.0, 0.5], [1.4, -1.6, 1.2], [0.2, -1.4, 2]]} />
        <Heat f={f} on={1} base={-7} height={5} />
        <SoftShadow y={-7} w={12} d={3} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
