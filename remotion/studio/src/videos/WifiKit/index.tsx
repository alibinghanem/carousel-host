import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Check3D } from "../../lib/three3d/Fake";
import { Phone, ScreenDraw } from "../../lib/three3d/Phone";
import { CameraRig, Lights, StudioEnv } from "../../lib/three3d/Studio";
import { Cabinet, HouseCut, MeshPoint, Obstacle, Router3D, Shelf, WifiArcs } from "../../lib/three3d/Wifi";

/**
 * لقطات 3D ثابتة (PNG شفاف) لكاروسيل «ليش الواي فاي ضعيف في غرفتك؟»: كل فريم لقطة.
 * 0 الغلاف: بيت بمقطع عرضي، الراوتر بغرفة والإشارة تضعف عند الجدران، والجوال بالغرفة الثانية بإشارة ضعيفة
 * 1 الراوتر داخل خزانة: أقواس حمراء صغيرة · 2 الراوتر برف مرتفع بالنص: أقواس خضراء للغرفتين
 * 3 عوائق: جدار خرساني وخزانة معدنية وخزان ماء تضعف الإشارة · 4 نطاقان: 2.4 أقواس واسعة قليلة، و5 أقواس متقاربة قصيرة
 * 5 نقطة ثانية (Mesh): نقطتان تغطيان بيتاً بثلاث غرف
 */
export const WIFIKIT_FRAMES = 6;
const AR = "'IBM Plex Sans Arabic', 'Space Grotesk'";
type V3 = [number, number, number];
const GRN = "#27E89A";
const ORG = "#FFA23A";
const RED = "#FF4B3E";

const sFor = (r: number, h: number) => Math.min(Math.PI * 0.62, 2 * Math.asin(Math.min(1, h / r)));

/** رمز واي فاي على شاشة الجوال: level 0..3 */
const wifiScreen = (level: number, label: string, color: string): ScreenDraw => (g, w, h) => {
  g.fillStyle = "#0E1A24";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#fff";
  g.font = "700 22px 'Space Grotesk'";
  g.direction = "ltr";
  g.textAlign = "left";
  g.fillText("9:41", 44, 66);
  const cx = w / 2;
  const cy = 600;
  g.lineCap = "round";
  [3, 2, 1].forEach((i) => {
    g.strokeStyle = i <= level ? color : "rgba(255,255,255,.2)";
    g.lineWidth = 34;
    g.beginPath();
    g.arc(cx, cy, 90 * i, -Math.PI * 0.82, -Math.PI * 0.18);
    g.stroke();
  });
  g.fillStyle = level >= 1 ? color : "rgba(255,255,255,.2)";
  g.beginPath();
  g.arc(cx, cy, 28, 0, Math.PI * 2);
  g.fill();
  g.direction = "rtl";
  g.textAlign = "center";
  g.fillStyle = color;
  g.font = `800 56px ${AR}`;
  g.fillText(label, cx, 830);
  g.font = `600 22px ${AR}`;
  g.fillStyle = "rgba(255,255,255,.4)";
  g.fillText("واجهة توضيحية", cx, h - 70);
};

const cross = (p: V3, s = 1) => (
  <group position={p} scale={s}>
    {[Math.PI / 4, -Math.PI / 4].map((r) => (
      <mesh key={r} rotation={[0, 0, r]}>
        <boxGeometry args={[1.1, 0.2, 0.16]} />
        <meshPhysicalMaterial color={RED} roughness={0.3} clearcoat={1} />
      </mesh>
    ))}
  </group>
);

const SHOTS: { cam: V3; look: V3; body: React.ReactNode }[] = [
  {
    cam: [0, 1.7, 19],
    look: [0, 1.5, 0],
    body: (
      <>
        <HouseCut position={[0, 0, 0]} />
        <Router3D position={[-2.5, 0, 0.5]} scale={0.9} />
        <WifiArcs position={[-2.4, 0.75, 0.9]} arcs={[{ r: 0.8, o: 0.95, c: GRN }, { r: 1.45, o: 0.8, c: GRN }, { r: 2.1, o: 0.65, c: GRN }, { r: 3.0, o: 0.42, c: ORG, s: sFor(3.0, 2.0) }, { r: 3.8, o: 0.3, c: ORG, s: sFor(3.8, 1.9) }, { r: 5.0, o: 0.2, c: RED, s: sFor(5.0, 1.8) }]} />
        <Phone position={[2.5, 1.25, 0.6]} rotation={[0.03, -0.2, 0]} scale={0.36} draw={wifiScreen(1, "ضعيفة", RED)} frame="#3B4250" />
        {cross([2.5, 2.7, 0.9], 0.5)}
      </>
    ),
  },
  {
    cam: [0, 1.5, 15],
    look: [0, 1.4, 0],
    body: (
      <>
        <Cabinet position={[-1.2, 0, 0]} scale={1.1} />
        <Router3D position={[-1.2, 0.25, 0.3]} scale={0.75} led={ORG} />
        <WifiArcs position={[-0.95, 0.9, 0.9]} arcs={[{ r: 0.8, o: 0.55, c: RED, s: 1.0 }, { r: 1.2, o: 0.3, c: RED, s: 0.9 }]} />
        <Phone position={[2.7, 1.2, 0.4]} rotation={[0.03, -0.25, 0]} scale={0.4} draw={wifiScreen(1, "ضعيفة", RED)} frame="#3B4250" />
        {cross([2.7, 2.85, 0.8], 0.5)}
      </>
    ),
  },
  {
    cam: [0, 1.7, 19],
    look: [0, 1.5, 0],
    body: (
      <>
        <HouseCut position={[0, 0, 0]} />
        <Shelf position={[0, 1.55, 0.2]} />
        <Router3D position={[0, 1.62, 0.2]} scale={0.8} />
        <WifiArcs dir={1} position={[0.1, 2.3, 0.9]} arcs={[{ r: 0.9, o: 0.95, c: GRN }, { r: 1.7, o: 0.85, c: GRN }, { r: 2.5, o: 0.7, c: GRN }, { r: 3.3, o: 0.5, c: GRN }]} />
        <WifiArcs dir={-1} position={[-0.1, 2.3, 0.9]} arcs={[{ r: 0.9, o: 0.95, c: GRN }, { r: 1.7, o: 0.85, c: GRN }, { r: 2.5, o: 0.7, c: GRN }, { r: 3.3, o: 0.5, c: GRN }]} />
        <Phone position={[-2.5, 0.95, 0.6]} rotation={[0.03, 0.2, 0]} scale={0.34} draw={wifiScreen(3, "قوية", GRN)} frame="#3B4250" />
        <Phone position={[2.5, 0.95, 0.6]} rotation={[0.03, -0.2, 0]} scale={0.34} draw={wifiScreen(3, "قوية", GRN)} frame="#3B4250" />
      </>
    ),
  },
  {
    cam: [0.3, 1.5, 20],
    look: [0.3, 1.6, 0],
    body: (
      <>
        <Router3D position={[-3.8, 0, 0.5]} scale={0.9} />
        <WifiArcs position={[-3.7, 0.75, 0.9]} arcs={[{ r: 1.0, o: 0.95, c: GRN }, { r: 1.7, o: 0.8, c: GRN }, { r: 2.5, o: 0.55, c: ORG, s: sFor(2.5, 2.2) }, { r: 3.3, o: 0.4, c: ORG, s: sFor(3.3, 2.0) }, { r: 4.1, o: 0.3, c: ORG, s: sFor(4.1, 1.8) }, { r: 5.3, o: 0.24, c: RED, s: sFor(5.3, 1.6) }, { r: 6.1, o: 0.2, c: RED, s: sFor(6.1, 1.5) }, { r: 7.1, o: 0.14, c: RED, s: sFor(7.1, 1.4) }]} />
        <Obstacle kind="concrete" position={[-1.7, 0, 0]} />
        <Obstacle kind="metal" position={[0.7, 0, 0]} />
        <Obstacle kind="water" position={[3.1, 0, 0]} />
      </>
    ),
  },
  {
    cam: [0.6, 0.4, 18.5],
    look: [0.6, 0.4, 0],
    body: (
      <>
        <Router3D position={[-3.0, 1.9, 0.5]} scale={0.8} />
        <WifiArcs position={[-2.95, 2.55, 0.9]} arcs={[1.0, 2.4, 3.8, 5.2].map((r, i) => ({ r, o: 0.9 - i * 0.18, c: ORG, w: 0.07, s: sFor(r, 1.15) }))} />
        <Router3D position={[-3.0, -1.9, 0.5]} scale={0.8} />
        <WifiArcs position={[-2.95, -1.25, 0.9]} arcs={[0.6, 0.9, 1.2, 1.5, 1.8, 2.1].map((r, i) => ({ r, o: 0.95 - i * 0.12, c: "#3DD6F5", w: 0.035, s: sFor(r, 0.9) }))} />
      </>
    ),
  },
  {
    cam: [0, 1.7, 19],
    look: [0, 1.5, 0],
    body: (
      <>
        <HouseCut position={[0, 0, 0]} />
        <Router3D position={[-2.5, 0, 0.5]} scale={0.9} />
        <MeshPoint position={[2.5, 0, 0.5]} />
        <WifiArcs dir={1} position={[-2.4, 0.75, 0.9]} arcs={[{ r: 0.9, o: 0.9, c: GRN }, { r: 1.7, o: 0.8, c: GRN }, { r: 2.5, o: 0.6, c: GRN }, { r: 3.3, o: 0.45, c: GRN }]} />
        <WifiArcs dir={-1} position={[2.4, 0.95, 0.9]} arcs={[{ r: 0.9, o: 0.9, c: GRN }, { r: 1.7, o: 0.8, c: GRN }, { r: 2.5, o: 0.6, c: GRN }, { r: 3.3, o: 0.45, c: GRN }]} />
        <Phone position={[0, 1.05, 0.7]} rotation={[0.03, 0, 0]} scale={0.34} draw={wifiScreen(3, "قوية", GRN)} frame="#3B4250" />
        <Check3D position={[0, 2.75, 0.9]} rotation={[0.05, 0, 0]} scale={0.7} color={GRN} />
      </>
    ),
  },
];

export const WifiKit: React.FC = () => {
  const f = useCurrentFrame();
  const s = SHOTS[Math.min(SHOTS.length - 1, f)];
  return (
    <AbsoluteFill>
      <ThreeCanvas width={1080} height={1080} camera={{ fov: 30, position: s.cam }}>
        <StudioEnv intensity={0.9} />
        <Lights key1="#FFF8EC" rim="#3DD6F5" rim2="#27E89A" k={2.2} r={58} />
        <CameraRig pos={s.cam} look={s.look} />
        {s.body}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
