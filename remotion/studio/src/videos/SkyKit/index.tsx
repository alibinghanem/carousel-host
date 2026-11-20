import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Phone, ScreenDraw } from "../../lib/three3d/Phone";
import { Globe, Satellite, faceRot, useTex } from "../../lib/three3d/Ocean";
import { Beam, Building, ClockDial, DistSphere, Pin, SignalRings } from "../../lib/three3d/Sky";
import { CameraRig, Lights, StudioEnv } from "../../lib/three3d/Studio";
import * as THREE from "three";

/**
 * لقطات 3D ثابتة (PNG شفاف) لكاروسيل «كيف يعرف جوالك مكانك؟» (GPS): كل فريم لقطة.
 * 0 الغلاف: كرة أرضية وأربعة أقمار وأشعة لجوال · 1 قمر ببثّ وساعة · 2 كرات المسافة تتقاطع
 * 3 جوال بخريطة ونقطة ودقّة · 4 مباني تحجب الإشارة · 5 جوال بدون خدمة والموقع شغّال
 */
export const SKYKIT_FRAMES = 6;

const AR = "'IBM Plex Sans Arabic', 'Space Grotesk'";
const txt = (g: CanvasRenderingContext2D, t: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "right", dir: CanvasDirection = "rtl") => {
  g.font = font;
  g.fillStyle = color;
  g.direction = dir;
  g.textAlign = align;
  g.fillText(t, x, y);
};

/** خريطة عامة مرسومة (مو من تطبيق): ماء، حدائق، شوارع، نقطة زرقاء بدائرة الدقة */
const mapScreen =
  (o: { noService?: boolean; card?: boolean; ring?: number }): ScreenDraw =>
  (g, w, h) => {
    g.fillStyle = "#EEF1E6";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#BFE0F5";
    g.beginPath();
    g.moveTo(0, 520);
    g.bezierCurveTo(140, 470, 220, 640, 120, 820);
    g.bezierCurveTo(70, 910, 40, 980, 0, 1010);
    g.closePath();
    g.fill();
    g.fillStyle = "#CDE8C3";
    g.beginPath();
    g.roundRect(330, 180, 170, 150, 28);
    g.fill();
    g.beginPath();
    g.roundRect(60, 160, 120, 190, 28);
    g.fill();
    g.beginPath();
    g.roundRect(360, 790, 150, 210, 28);
    g.fill();
    const road = (pts: number[][], wd: number, col: string) => {
      g.strokeStyle = col;
      g.lineWidth = wd;
      g.lineCap = "round";
      g.lineJoin = "round";
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
    };
    [
      [[0, 400], [540, 470]],
      [[0, 700], [540, 640]],
      [[200, 120], [260, 1100]],
      [[420, 120], [380, 1100]],
      [[0, 280], [540, 250]],
    ].forEach((p) => road(p, 22, "#fff"));
    road([[0, 560], [260, 560], [540, 600]], 34, "#F7D88A");
    road([[300, 120], [320, 1100]], 34, "#F7D88A");
    // علامة الطريق
    g.fillStyle = "rgba(0,0,0,.08)";
    // شريط الحالة
    g.fillStyle = "rgba(255,255,255,.92)";
    g.fillRect(0, 0, w, 110);
    txt(g, "9:41", 44, 70, `700 22px 'Space Grotesk'`, "#202124", "left", "ltr");
    if (o.noService) {
      txt(g, "No Service", w - 44, 70, `700 22px 'Space Grotesk'`, "#D93025", "right", "ltr");
    } else {
      txt(g, "5G", w - 44, 70, `700 22px 'Space Grotesk'`, "#202124", "right", "ltr");
    }
    // النقطة الزرقاء
    const cx = 270;
    const cy = 600;
    const r = 70 + (o.ring ?? 0) * 70;
    g.fillStyle = "rgba(66,133,244,.18)";
    g.beginPath();
    g.arc(cx, cy, r, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "rgba(66,133,244,.55)";
    g.lineWidth = 4;
    g.stroke();
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(cx, cy, 30, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#4285F4";
    g.beginPath();
    g.arc(cx, cy, 22, 0, Math.PI * 2);
    g.fill();
    if (o.card) {
      g.fillStyle = "#fff";
      g.beginPath();
      g.roundRect(24, 900, w - 48, 230, 34);
      g.fill();
      txt(g, "موقعك الحالي", w - 56, 970, `700 40px ${AR}`, "#202124");
      txt(g, "الدقة تقريباً ±4.9 م", w - 56, 1030, `600 30px ${AR}`, "#5F6368");
      txt(g, "تحت سماء مفتوحة", w - 56, 1076, `600 26px ${AR}`, "#80868B");
    }
    if (o.noService) {
      g.fillStyle = "rgba(32,33,36,.86)";
      g.beginPath();
      g.roundRect(60, 900, w - 120, 130, 30);
      g.fill();
      txt(g, "بدون شبكة… والنقطة شغّالة", w / 2, 978, `700 33px ${AR}`, "#fff", "center");
    }
  };

const SAT_POS: V[] = [
  [-5.2, 4.2, -1],
  [5.0, 4.8, 0],
  [-2.4, 6.2, -2],
  [2.8, 2.8, 2],
];
type V = [number, number, number];

const Shot: React.FC<{ f: number; earth: THREE.Texture | null }> = ({ f, earth }) => {
  if (f === 0) {
    const { rx, ry } = faceRot(8, 44);
    const phoneTop: V = [0.1, 0.2, 3];
    return (
      <>
        <CameraRig pos={[0, 1.2, 27]} look={[0, 1.2, 0]} />
        <Globe tex={earth} r={2.7} position={[0, -9.0, -3]} scale={2.9} rx={rx} ry={ry} />
        {SAT_POS.map((p, i) => (
          <React.Fragment key={i}>
            <Satellite position={p} scale={0.62} rotation={[0.35, 0.6 + i * 0.7, 0.2]} />
            <Beam from={p} to={phoneTop} color={i % 2 ? "#7FF0C8" : "#5CF2FF"} r={0.04} />
          </React.Fragment>
        ))}
        <Phone position={[0.1, -2.2, 3]} rotation={[-0.2, 0.22, 0.02]} scale={0.95} draw={mapScreen({ ring: 0.5 })} frame="#5B6270" />
      </>
    );
  }
  if (f === 1)
    return (
      <>
        <CameraRig pos={[0, 0.2, 19.5]} look={[0.4, 0, 0]} />
        <Satellite position={[-1.2, 2.2, 0]} scale={1.75} rotation={[0.42, 0.55, 0.12]} />
        <SignalRings position={[-1.2, 1.2, 0]} t={0.25} n={6} max={5.4} />
        <ClockDial position={[3.0, -2.8, 1.2]} rotation={[0.15, -0.3, 0]} scale={0.95} t={0.62} />
      </>
    );
  if (f === 2) {
    const P: V = [0, 0.2, 0.4];
    const C: V[] = [
      [-3.4, 3.1, 0],
      [3.5, 2.6, 0.6],
      [0.4, -3.6, 0.3],
    ];
    const rad = C.map((c) => Math.hypot(c[0] - P[0], c[1] - P[1], c[2] - P[2]));
    const cols = ["#5CF2FF", "#C58BFF", "#7FF0C8"];
    return (
      <>
        <CameraRig pos={[0, 0.3, 24]} look={[0, 0, 0]} />
        {C.map((c, i) => (
          <React.Fragment key={i}>
            <DistSphere position={c} r={rad[i]} color={cols[i]} opacity={0.12} />
            <Satellite position={c} scale={0.5} rotation={[0.3, 0.8 + i, 0.2]} />
          </React.Fragment>
        ))}
        <mesh position={P}>
          <sphereGeometry args={[0.24, 24, 18]} />
          <meshBasicMaterial color="#fff" toneMapped={false} />
        </mesh>
        <mesh position={P}>
          <sphereGeometry args={[0.7, 24, 18]} />
          <meshBasicMaterial color="#fff" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      </>
    );
  }
  if (f === 3)
    return (
      <>
        <CameraRig pos={[0, 0.6, 18]} look={[0.3, 0.2, 0]} />
        <Phone position={[-0.7, -0.2, 0]} rotation={[0.08, 0.28, 0.03]} scale={1.1} draw={mapScreen({ card: true, ring: 0.6 })} frame="#5B6270" />
        <Pin position={[2.7, 1.4, 1.2]} rotation={[0.1, -0.4, 0.12]} scale={1.0} />
        <SignalRings position={[2.7, 0.2, 1.2]} t={0.35} n={3} max={1.4} color="#4285F4" rotation={[Math.PI / 2, 0, 0]} />
      </>
    );
  if (f === 4)
    return (
      <>
        <CameraRig pos={[0, 1.6, 25]} look={[0, 1.2, 0]} />
        <Building position={[-3.6, -3.2, -0.5]} w={2.6} h={8.2} d={2.4} seed={2} />
        <Building position={[0.1, -3.2, -2]} w={2.4} h={6.2} d={2.4} seed={5} color="#33405A" />
        <Building position={[3.8, -3.2, -0.4]} w={2.8} h={9} d={2.4} seed={9} />
        <Phone position={[0.1, -2.1, 1.9]} rotation={[-0.15, 0, 0]} scale={0.55} draw={mapScreen({ ring: 1 })} frame="#5B6270" />
        <Satellite position={[0.2, 7.6, 0]} scale={0.85} rotation={[0.4, 0.5, 0.2]} />
        <Beam from={[0.2, 7.5, 0]} to={[-3.6, 5.1, 0.7]} color="#FF8A8A" r={0.04} />
        <Beam from={[-3.6, 5.1, 0.7]} to={[-6.2, 7.2, 1.2]} color="#FF8A8A" dash r={0.035} />
        <Beam from={[0.2, 7.5, 0]} to={[0.1, -1.0, 1.9]} color="#5CF2FF" dash r={0.04} />
      </>
    );
  return (
    <>
      <CameraRig pos={[0, 0.3, 17.5]} look={[0, 0, 0]} />
      <Phone position={[0, 0, 0]} rotation={[0.06, -0.3, 0.05]} scale={1.15} draw={mapScreen({ noService: true, ring: 0.4 })} frame="#5B6270" />
    </>
  );
};

export const SkyKit: React.FC = () => {
  const f = useCurrentFrame();
  const earth = useTex(staticFileEarth());
  return (
    <AbsoluteFill>
      <ThreeCanvas width={1080} height={1080} camera={{ fov: 30, position: [0, 0, 18] }}>
        <StudioEnv intensity={0.95} />
        <Lights key1="#FFFFFF" rim="#5CF2FF" rim2="#C58BFF" k={2.2} r={60} />
        <Shot f={f} earth={earth} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

import { staticFile } from "remotion";
const staticFileEarth = () => staticFile("videos/skykit/earth.jpg");
