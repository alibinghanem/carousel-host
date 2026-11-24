import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Check3D } from "../../lib/three3d/Fake";
import { Panel } from "../../lib/three3d/Mail";
import { BankCard } from "../../lib/three3d/Pay";
import { Shield } from "../../lib/three3d/Parts";
import { Phone, ScreenDraw } from "../../lib/three3d/Phone";
import { Padlock } from "../../lib/three3d/Safety";
import { CameraRig, Lights, StudioEnv } from "../../lib/three3d/Studio";

/**
 * لقطات 3D ثابتة (PNG شفاف) لكاروسيل «اتصال من البنك يطلب الرمز؟ سكّر الخط»: كل فريم لقطة.
 * 0 الغلاف: جوال باتصال وارد وزر إنهاء المكالمة الأحمر الكبير · 1 فقاعة كلام المحتال الضاغطة
 * 2 بطاقة رمز التحقق عليها ✕ · 3 جوال يتصل بالبنك + بطاقة بنكية خلفها الرقم الرسمي + ✓
 * 4 بطاقة مجمّدة بقفل ودرع
 */
export const BANKKIT_FRAMES = 5;
const AR = "'IBM Plex Sans Arabic', 'Space Grotesk'";
const NAVY = "#0F1B3D";
const RED = "#F23B3B";
const GRN = "#22B573";
type V3 = [number, number, number];
const T = (g: CanvasRenderingContext2D, t: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "center") => {
  g.font = font;
  g.fillStyle = color;
  g.direction = "rtl";
  g.textAlign = align;
  g.fillText(t, x, y);
};
const time = (g: CanvasRenderingContext2D, c = "#fff") => {
  g.fillStyle = c;
  g.font = "700 22px 'Space Grotesk'";
  g.direction = "ltr";
  g.textAlign = "left";
  g.fillText("9:41", 44, 66);
};
const circle = (g: CanvasRenderingContext2D, x: number, y: number, r: number, c: string) => {
  g.fillStyle = c;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
};
const bankIcon = (g: CanvasRenderingContext2D, x: number, y: number, c: string) => {
  g.fillStyle = c;
  g.beginPath();
  g.moveTo(x - 46, y - 14);
  g.lineTo(x, y - 48);
  g.lineTo(x + 46, y - 14);
  g.closePath();
  g.fill();
  for (let i = -1; i <= 1; i++) g.fillRect(x + i * 28 - 7, y - 6, 14, 40);
  g.fillRect(x - 50, y + 40, 100, 10);
};

const callScreen: ScreenDraw = (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#1D2B52");
  gr.addColorStop(1, "#0A1126");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  time(g);
  T(g, "اتصال وارد", w / 2, 190, `600 30px ${AR}`, "rgba(255,255,255,.65)");
  circle(g, w / 2, 340, 96, "rgba(255,255,255,.14)");
  bankIcon(g, w / 2, 340, "#fff");
  T(g, "«البنك»", w / 2, 500, `800 54px ${AR}`, "#fff");
  T(g, "رقم يشبه رقم البنك", w / 2, 560, `600 28px ${AR}`, "#FFC933");
  circle(g, 150, 980, 70, RED);
  circle(g, w - 150, 980, 70, GRN);
  T(g, "رفض", 150, 1090, `600 24px ${AR}`, "rgba(255,255,255,.7)");
  T(g, "رد", w - 150, 1090, `600 24px ${AR}`, "rgba(255,255,255,.7)");
  T(g, "واجهة توضيحية", w / 2, h - 70, `600 22px ${AR}`, "rgba(255,255,255,.45)");
};
const dialScreen: ScreenDraw = (g, w, h) => {
  g.fillStyle = "#F4F7FB";
  g.fillRect(0, 0, w, h);
  time(g, "#111");
  T(g, "اتصال صادر", w / 2, 190, `600 30px ${AR}`, "#667");
  circle(g, w / 2, 340, 96, NAVY);
  bankIcon(g, w / 2, 340, "#fff");
  T(g, "بنكك", w / 2, 500, `800 54px ${AR}`, NAVY);
  T(g, "من الرقم الرسمي", w / 2, 560, `700 30px ${AR}`, GRN);
  circle(g, w / 2, 980, 76, RED);
  T(g, "واجهة توضيحية", w / 2, h - 70, `600 22px ${AR}`, "#99A");
};
const endCall = (g: CanvasRenderingContext2D, w: number, h: number) => {
  g.fillStyle = RED;
  g.fillRect(0, 0, w, h);
  g.save();
  g.translate(w / 2, h / 2 + 10);
  g.strokeStyle = "#fff";
  g.lineCap = "round";
  g.lineWidth = 52;
  g.beginPath();
  g.arc(0, 90, 130, Math.PI * 1.17, Math.PI * 1.83);
  g.stroke();
  g.fillStyle = "#fff";
  for (const s of [-1, 1]) {
    g.save();
    g.translate(s * 112, 8);
    g.rotate(s * 0.35);
    g.beginPath();
    g.roundRect(-34, -10, 68, 78, 20);
    g.fill();
    g.restore();
  }
  g.restore();
};
const bubble = (g: CanvasRenderingContext2D, w: number, h: number) => {
  g.fillStyle = "#fff";
  g.fillRect(0, 0, w, h);
  g.fillStyle = RED;
  g.fillRect(w - 18, 0, 18, h);
  T(g, "«حسابك مهدد!", w - 60, 120, `800 64px ${AR}`, NAVY, "right");
  T(g, "أعطنا الرمز الحين»", w - 60, 220, `800 64px ${AR}`, RED, "right");
  T(g, "مثال توضيحي", w - 60, 290, `600 30px ${AR}`, "#889", "right");
};
const codeCard = (g: CanvasRenderingContext2D, w: number, h: number) => {
  g.fillStyle = NAVY;
  g.fillRect(0, 0, w, h);
  T(g, "رمز التحقق (OTP)", w / 2, 100, `700 44px ${AR}`, "rgba(255,255,255,.7)");
  g.font = "800 130px 'Space Grotesk'";
  g.fillStyle = "#fff";
  g.direction = "ltr";
  g.textAlign = "center";
  g.fillText("5 2 7 1 9 3", w / 2, 270);
};
const cardBack: (g: CanvasRenderingContext2D, w: number, h: number) => void = (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, "#2B3B6B");
  gr.addColorStop(1, "#0F1B3D");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#0A0F22";
  g.fillRect(0, 70, w, 90);
  T(g, "للتواصل مع البنك", w / 2, 270, `700 40px ${AR}`, "rgba(255,255,255,.75)");
  g.fillStyle = "#fff";
  g.beginPath();
  g.roundRect(80, 310, w - 160, 120, 22);
  g.fill();
  T(g, "الرقم الرسمي خلف بطاقتك", w / 2, 388, `800 44px ${AR}`, NAVY);
};
const frozenCard: (g: CanvasRenderingContext2D, w: number, h: number) => void = (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, "#9FD8F5");
  gr.addColorStop(1, "#3C7FB8");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  T(g, "بطاقة مجمّدة", w / 2, 270, `800 76px ${AR}`, "#fff");
  g.fillStyle = "rgba(255,255,255,.8)";
  g.font = "700 40px 'Space Grotesk'";
  g.direction = "ltr";
  g.textAlign = "center";
  g.fillText("•••• •••• •••• 0000", w / 2, 430);
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
        <Phone position={[-0.7, 0, 0]} rotation={[0.05, 0.3, -0.04]} scale={0.95} draw={callScreen} frame="#2A3350" />
        <Panel position={[2.0, -1.5, 1.2]} rotation={[0.05, -0.3, 0.1]} draw={endCall} W={400} H={400} w={2.0} h={2.0} d={0.2} r={1.0} color="#F23B3B" />
      </>
    ),
  },
  {
    cam: [0, 0.3, 14],
    look: [0, 0.1, 0],
    body: (
      <>
        <Phone position={[-1.9, -0.3, 0]} rotation={[0.05, 0.3, -0.04]} scale={0.8} draw={callScreen} frame="#2A3350" />
        <Panel position={[1.3, 0.9, 0.8]} rotation={[0.05, -0.2, 0.04]} draw={bubble} W={900} H={360} w={4.2} h={1.7} d={0.14} r={0.3} />
      </>
    ),
  },
  {
    cam: [0, 0.3, 13],
    look: [0, 0.1, 0],
    body: (
      <>
        <Panel position={[0, 0, 0]} rotation={[0.06, -0.18, 0.03]} draw={codeCard} W={1000} H={340} w={4.8} h={1.63} d={0.14} r={0.24} />
        {cross([1.85, 0.6, 0.9], 1.3)}
      </>
    ),
  },
  {
    cam: [0, 0.3, 15],
    look: [0, 0.1, 0],
    body: (
      <>
        <Phone position={[-1.8, -0.1, 0]} rotation={[0.05, 0.3, -0.03]} scale={0.85} draw={dialScreen} frame="#2A3350" />
        <BankCard position={[1.4, -0.9, 0.6]} rotation={[0.05, -0.35, 0.1]} w={3.6} draw={cardBack} color="#0F1B3D" chip={false} />
        <Check3D position={[2.2, 1.5, 0.8]} rotation={[0.05, -0.3, 0]} scale={1.1} color={GRN} />
      </>
    ),
  },
  {
    cam: [0, 0.3, 13],
    look: [0, 0.1, 0],
    body: (
      <>
        <BankCard position={[-0.3, 0, 0]} rotation={[0.08, -0.25, 0.08]} w={4.2} draw={frozenCard} color="#3C7FB8" chip={false} />
        <Padlock position={[1.7, -1.0, 1.0]} rotation={[0.05, -0.3, 0]} scale={1.0} color={GRN} open={0} />
        <Shield position={[-1.9, 1.35, 0.8]} rotation={[0.05, 0.3, 0]} scale={0.7} color={GRN} />
      </>
    ),
  },
];

export const BankKit: React.FC = () => {
  const f = useCurrentFrame();
  const s = SHOTS[Math.min(SHOTS.length - 1, f)];
  return (
    <AbsoluteFill>
      <ThreeCanvas width={1080} height={1080} camera={{ fov: 30, position: s.cam }}>
        <StudioEnv intensity={0.9} />
        <Lights key1="#FFF8EC" rim="#4C7BFF" rim2="#F23B3B" k={2.2} r={58} />
        <CameraRig pos={s.cam} look={s.look} />
        {s.body}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
