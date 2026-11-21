import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { WarnTriangle } from "../../lib/three3d/Door";
import { Check3D } from "../../lib/three3d/Fake";
import { Panel } from "../../lib/three3d/Mail";
import { Shield } from "../../lib/three3d/Parts";
import { Phone, ScreenDraw } from "../../lib/three3d/Phone";
import { Key, Padlock } from "../../lib/three3d/Safety";
import { CameraRig, Lights, StudioEnv } from "../../lib/three3d/Studio";

/**
 * لقطات 3D ثابتة (PNG شفاف) لكاروسيل «رمز واتساب وصلك؟ لا ترسله لأحد»: كل فريم لقطة.
 * 0 الغلاف: جوال برسالة رمز تحقق ومثلث تحذير · 1 بطاقة الرمز عليها علامة ✕ حمراء
 * 2 جوال بشاشة رمز PIN وقفل أخضر ودرع · 3 جوال «تحقق من رقمك» ومفتاح وعلامة صح
 */
export const WAKIT_FRAMES = 4;
const AR = "'IBM Plex Sans Arabic', 'Space Grotesk'";
const GRN = "#25D366";
const RED = "#F23B3B";
type V3 = [number, number, number];
const T = (g: CanvasRenderingContext2D, t: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "center") => {
  g.font = font;
  g.fillStyle = color;
  g.direction = "rtl";
  g.textAlign = align;
  g.fillText(t, x, y);
};
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, c: string) => {
  g.fillStyle = c;
  g.beginPath();
  g.roundRect(x, y, w, h, r);
  g.fill();
};
const time = (g: CanvasRenderingContext2D, c = "#111") => {
  g.fillStyle = c;
  g.font = "700 22px 'Space Grotesk'";
  g.direction = "ltr";
  g.textAlign = "left";
  g.fillText("9:41", 44, 66);
};
const code = (g: CanvasRenderingContext2D, x: number, y: number, size: number, c: string) => {
  g.font = `800 ${size}px 'Space Grotesk'`;
  g.fillStyle = c;
  g.direction = "ltr";
  g.textAlign = "center";
  g.fillText("482-916", x, y);
};

const smsScreen: ScreenDraw = (g, w, h) => {
  g.fillStyle = "#EEF3F0";
  g.fillRect(0, 0, w, h);
  time(g);
  rr(g, 30, 150, w - 60, 330, 30, "#fff");
  g.fillStyle = GRN;
  g.beginPath();
  g.arc(84, 206, 30, 0, Math.PI * 2);
  g.fill();
  T(g, "رسالة نصية", w - 56, 216, `700 26px ${AR}`, "#777", "right");
  T(g, "رمز واتساب الخاص بك:", w - 56, 290, `800 32px ${AR}`, "#111", "right");
  code(g, w / 2, 380, 72, "#111");
  T(g, "لا تشارك هذا الرمز مع أحد", w / 2, 445, `700 26px ${AR}`, RED);
  T(g, "واجهة توضيحية", w / 2, h - 70, `600 22px ${AR}`, "#999");
};
const pinScreen: ScreenDraw = (g, w, h) => {
  g.fillStyle = "#0E1F1A";
  g.fillRect(0, 0, w, h);
  time(g, "#fff");
  T(g, "التحقق بخطوتين", w / 2, 230, `800 38px ${AR}`, "#fff");
  T(g, "أدخل رمز PIN", w / 2, 290, `600 28px ${AR}`, "rgba(255,255,255,.7)");
  for (let i = 0; i < 6; i++) {
    const x = w / 2 - 175 + i * 70;
    g.fillStyle = GRN;
    g.beginPath();
    g.arc(x, 400, 18, 0, Math.PI * 2);
    g.fill();
  }
  T(g, "واجهة توضيحية", w / 2, h - 70, `600 22px ${AR}`, "rgba(255,255,255,.45)");
};
const verifyScreen: ScreenDraw = (g, w, h) => {
  g.fillStyle = "#fff";
  g.fillRect(0, 0, w, h);
  time(g);
  T(g, "تحقق من رقمك", w / 2, 220, `800 38px ${AR}`, "#111");
  for (let i = 0; i < 6; i++) {
    const x = 60 + i * 72;
    rr(g, x, 300, 56, 76, 12, "#EEF3F0");
    g.font = "800 40px 'Space Grotesk'";
    g.fillStyle = "#111";
    g.direction = "ltr";
    g.textAlign = "center";
    g.fillText("482916"[i], x + 28, 352);
  }
  rr(g, 70, 450, w - 140, 76, 38, GRN);
  T(g, "رجع حسابك", w / 2, 500, `800 32px ${AR}`, "#fff");
  T(g, "واجهة توضيحية", w / 2, h - 70, `600 22px ${AR}`, "#999");
};
const codeCard = (g: CanvasRenderingContext2D, w: number, h: number) => {
  g.fillStyle = "#fff";
  g.fillRect(0, 0, w, h);
  T(g, "رمز التحقق", w / 2, 110, `800 46px ${AR}`, "#555");
  code(g, w / 2, 280, 150, "#111");
};
const cross = (p: V3, s = 1) => (
  <group position={p} scale={s}>
    {[Math.PI / 4, -Math.PI / 4].map((r) => (
      <mesh key={r} rotation={[0, 0, r]}>
        <boxGeometry args={[1.25, 0.24, 0.2]} />
        <meshPhysicalMaterial color={RED} roughness={0.3} clearcoat={1} />
      </mesh>
    ))}
  </group>
);

const SHOTS: { cam: V3; look: V3; body: React.ReactNode }[] = [
  {
    cam: [0, 0.3, 15],
    look: [0, 0.1, 0],
    body: (
      <>
        <Phone position={[-0.5, -0.1, 0]} rotation={[0.05, 0.32, -0.04]} scale={0.95} draw={smsScreen} frame="#3B4250" />
        <WarnTriangle position={[2.25, 1.6, 1.0]} rotation={[0.1, -0.4, 0.12]} scale={1.05} color="#FFC933" />
      </>
    ),
  },
  {
    cam: [0, 0.3, 13],
    look: [0, 0.1, 0],
    body: (
      <>
        <Panel position={[0, 0, 0]} rotation={[0.06, -0.18, 0.03]} draw={codeCard} W={900} H={360} w={4.6} h={1.84} d={0.14} r={0.24} />
        {cross([1.2, 0.35, 0.9], 1.3)}
      </>
    ),
  },
  {
    cam: [0, 0.3, 15],
    look: [0, 0.1, 0],
    body: (
      <>
        <Phone position={[-0.9, -0.1, 0]} rotation={[0.05, 0.3, -0.03]} scale={0.88} draw={pinScreen} frame="#3B4250" />
        <Padlock position={[1.9, -1.2, 0.8]} rotation={[0.05, -0.3, 0]} scale={1.05} color={GRN} open={0} />
        <Shield position={[2.0, 1.5, 0.6]} rotation={[0.05, -0.35, 0]} scale={0.75} color={GRN} />
      </>
    ),
  },
  {
    cam: [0, 0.3, 15],
    look: [0, 0.1, 0],
    body: (
      <>
        <Phone position={[-0.8, -0.1, 0]} rotation={[0.05, 0.3, -0.03]} scale={0.88} draw={verifyScreen} frame="#3B4250" />
        <Key position={[2.0, -1.4, 0.8]} rotation={[0, 0.2, 1.0]} scale={1.3} color="#E8C15A" glow={0.15} />
        <Check3D position={[2.0, 1.4, 0.8]} rotation={[0.05, -0.3, 0]} scale={1.1} color={GRN} />
      </>
    ),
  },
];

export const WaKit: React.FC = () => {
  const f = useCurrentFrame();
  const s = SHOTS[Math.min(SHOTS.length - 1, f)];
  return (
    <AbsoluteFill>
      <ThreeCanvas width={1080} height={1080} camera={{ fov: 30, position: s.cam }}>
        <StudioEnv intensity={0.9} />
        <Lights key1="#FFF8EC" rim="#25D366" rim2="#F23B3B" k={2.2} r={58} />
        <CameraRig pos={s.cam} look={s.look} />
        {s.body}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
