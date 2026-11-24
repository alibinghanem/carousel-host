import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Panel } from "../../lib/three3d/Mail";
import { Check3D, FakeMask, GlitchSlabs, HEAD, Head3D, Magnifier, MarkRing, WaveBars } from "../../lib/three3d/Fake";
import { Phone, ScreenDraw } from "../../lib/three3d/Phone";
import { Shield } from "../../lib/three3d/Parts";
import { CameraRig, Lights, StudioEnv } from "../../lib/three3d/Studio";

/**
 * لقطات 3D ثابتة (PNG شفاف) لكاروسيل «فيديو مزيّف بالذكاء الاصطناعي: كيف تكشفه؟»: كل فريم لقطة.
 * 0 الغلاف: رأس يتقشّر عنه قناع شبكي مضيء + شرائح غلتش · 1 الوجه: علامات حمراء على العينين والفم
 * 2 المكالمة: جوال برقم غير معروف وموجة صوت · 3 المصدر: عدسة مكبّرة فوق بطاقة فيديو · 4 الخلاصة: درع وصح ومؤقت
 */
export const FAKEKIT_FRAMES = 5;
const AR = "'IBM Plex Sans Arabic', 'Space Grotesk'";
type V3 = [number, number, number];

const T = (g: CanvasRenderingContext2D, t: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "center") => {
  g.font = font;
  g.fillStyle = color;
  g.direction = "rtl";
  g.textAlign = align;
  g.fillText(t, x, y);
};

const callScreen: ScreenDraw = (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#222838");
  gr.addColorStop(1, "#0B0E16");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#fff";
  g.font = "700 22px 'Space Grotesk'";
  g.direction = "ltr";
  g.textAlign = "left";
  g.fillText("9:41", 44, 66);
  g.textAlign = "right";
  g.fillText("5G", w - 44, 66);
  T(g, "اتصال وارد", w / 2, 190, `600 30px ${AR}`, "rgba(255,255,255,.65)");
  g.fillStyle = "rgba(255,255,255,.12)";
  g.beginPath();
  g.arc(w / 2, 330, 90, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgba(255,255,255,.35)";
  g.beginPath();
  g.arc(w / 2, 305, 30, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(w / 2, 385, 52, 34, 0, Math.PI, 0);
  g.fill();
  T(g, "رقم غير معروف", w / 2, 500, `700 44px ${AR}`, "#fff");
  g.fillStyle = "#FFD23F";
  g.beginPath();
  g.roundRect(60, 560, w - 120, 150, 26);
  g.fill();
  T(g, "«أنا بورطة… حوّل لي الحين،", w / 2, 618, `700 28px ${AR}`, "#14161C");
  T(g, "وما تقول لأحد!»", w / 2, 664, `700 28px ${AR}`, "#14161C");
  T(g, "مثال توضيحي", w / 2, 740, `600 22px ${AR}`, "rgba(255,255,255,.5)");
  g.fillStyle = "#EF4444";
  g.beginPath();
  g.arc(150, 980, 70, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#22C55E";
  g.beginPath();
  g.arc(w - 150, 980, 70, 0, Math.PI * 2);
  g.fill();
  T(g, "رفض", 150, 1090, `600 24px ${AR}`, "rgba(255,255,255,.7)");
  T(g, "رد", w - 150, 1090, `600 24px ${AR}`, "rgba(255,255,255,.7)");
};

/** بطاقة منشور فيديو عامة: مقطع داكن، زر تشغيل، اسم حساب مجهول */
const postCard = (g: CanvasRenderingContext2D, w: number, h: number) => {
  g.fillStyle = "#1A1F2C";
  g.fillRect(0, 0, w, h);
  const gr = g.createLinearGradient(0, 0, w, h * 0.7);
  gr.addColorStop(0, "#394058");
  gr.addColorStop(1, "#171B26");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h * 0.72);
  g.fillStyle = "rgba(255,255,255,.88)";
  g.beginPath();
  g.moveTo(w / 2 - 36, h * 0.36 - 50);
  g.lineTo(w / 2 + 52, h * 0.36);
  g.lineTo(w / 2 - 36, h * 0.36 + 50);
  g.closePath();
  g.fill();
  g.fillStyle = "#FF3B57";
  g.beginPath();
  g.roundRect(30, 30, 130, 46, 12);
  g.fill();
  g.fillStyle = "#fff";
  g.font = "700 26px 'Space Grotesk'";
  g.direction = "ltr";
  g.textAlign = "center";
  g.fillText("عاجل", 95, 64);
  g.fillStyle = "rgba(255,255,255,.28)";
  g.beginPath();
  g.arc(70, h * 0.72 + 70, 38, 0, Math.PI * 2);
  g.fill();
  T(g, "حساب جديد؟ مجهول؟", w - 40, h * 0.72 + 62, `700 32px ${AR}`, "#fff", "right");
  T(g, "مين نشره أول؟", w - 40, h * 0.72 + 112, `600 26px ${AR}`, "#FFD23F", "right");
  g.fillStyle = "#FFD23F";
  g.fillRect(0, h * 0.72 - 6, w * 0.38, 6);
};

const Stopwatch: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <group scale={s}>
    <mesh>
      <torusGeometry args={[0.9, 0.1, 20, 56]} />
      <meshPhysicalMaterial color="#FFD23F" metalness={0.5} roughness={0.25} clearcoat={0.8} />
    </mesh>
    <mesh position={[0, 0, -0.02]}>
      <circleGeometry args={[0.9, 56]} />
      <meshStandardMaterial color="#F6F3EC" />
    </mesh>
    <mesh position={[0, 1.08, 0]}>
      <cylinderGeometry args={[0.14, 0.14, 0.22, 20]} />
      <meshStandardMaterial color="#FFD23F" metalness={0.5} roughness={0.3} />
    </mesh>
    <mesh position={[0.18, 0.2, 0.02]} rotation={[0, 0, -0.5]}>
      <boxGeometry args={[0.07, 0.62, 0.04]} />
      <meshBasicMaterial color="#FF3B57" />
    </mesh>
    <mesh position={[0, 0, 0.03]}>
      <circleGeometry args={[0.08, 16]} />
      <meshBasicMaterial color="#14161C" />
    </mesh>
    {Array.from({ length: 12 }, (_, i) => (
      <mesh key={i} position={[Math.sin((i / 12) * Math.PI * 2) * 0.74, Math.cos((i / 12) * Math.PI * 2) * 0.74, 0.01]} rotation={[0, 0, -(i / 12) * Math.PI * 2]}>
        <boxGeometry args={[0.04, i % 3 === 0 ? 0.16 : 0.08, 0.02]} />
        <meshBasicMaterial color="#14161C" />
      </mesh>
    ))}
  </group>
);

const HS = 1.35; // مقياس الرأس في لقطات الوجه

const SHOTS: { cam: V3; look: V3; body: React.ReactNode }[] = [
  {
    cam: [0, 0.5, 14],
    look: [0, 0.2, 0],
    body: (
      <>
        <GlitchSlabs position={[-0.2, 0.2, -1.6]} seed={3} w={4.4} h={4.4} color="#FF3B57" />
        <group rotation={[0.04, 0.45, 0.02]} position={[-0.2, 0.15, 0]} scale={HS * 0.98}>
          <Head3D />
          <FakeMask peel={0.95} layers={3} fill={0.3} />
        </group>
      </>
    ),
  },
  {
    cam: [0, 0.2, 12.5],
    look: [0, 0, 0],
    body: (
      <>
        <group rotation={[0.03, -0.16, 0]} scale={HS * 1.1} position={[0, 0.1, 0]}>
          <Head3D blink={0.2} />
          <FakeMask peel={0.1} layers={1} glow={0.7} />
          <MarkRing position={HEAD.eyeL} r={0.24} />
          <MarkRing position={HEAD.eyeR} r={0.24} />
          <mesh position={[0, HEAD.mouth[1], HEAD.mouth[2] + 0.02]} scale={[1.4, 0.8, 1]}>
            <torusGeometry args={[0.28, 0.026, 12, 56]} />
            <meshBasicMaterial color="#FF3B57" toneMapped={false} />
          </mesh>
        </group>
      </>
    ),
  },
  {
    cam: [0, 0.3, 17],
    look: [0, 0.1, 0],
    body: (
      <>
        <Phone position={[-0.6, 0, 0]} rotation={[0.04, 0.28, -0.03]} scale={0.95} draw={callScreen} frame="#3B4250" />
        <WaveBars position={[3.2, 0.9, 0.8]} rotation={[0, -0.3, 0]} t={1.2} n={9} h={1.9} color="#FFD23F" />
        <WaveBars position={[3.2, -0.9, 0.8]} rotation={[0, -0.3, 0]} t={2.7} n={9} h={1.3} color="#FF3B57" />
      </>
    ),
  },
  {
    cam: [0, 0.3, 16],
    look: [0, 0.1, 0],
    body: (
      <>
        <Panel position={[0, 0.2, 0]} rotation={[0.05, -0.22, 0.02]} draw={postCard} W={900} H={620} w={4.6} h={3.17} d={0.12} r={0.2} color="#2A3042" />
        <Magnifier position={[1.0, -0.2, 1.2]} rotation={[0, -0.22, 0]} scale={1.15} />
      </>
    ),
  },
  {
    cam: [0, 0.2, 16],
    look: [0, 0, 0],
    body: (
      <>
        <Shield position={[-0.9, 0.3, 0]} rotation={[0.04, 0.3, 0]} scale={1.7} color="#2BD47D" />
        <Check3D position={[-0.9, 0.25, 0.6]} rotation={[0.04, 0.3, 0]} scale={1.5} color="#FFFFFF" />
        <group position={[2.6, -1.6, 0.8]} rotation={[0.1, -0.35, 0.05]}>
          <Stopwatch s={0.95} />
        </group>
      </>
    ),
  },
];

export const FakeKit: React.FC = () => {
  const f = useCurrentFrame();
  const s = SHOTS[Math.min(SHOTS.length - 1, f)];
  return (
    <AbsoluteFill>
      <ThreeCanvas width={1080} height={1080} camera={{ fov: 30, position: s.cam }}>
        <StudioEnv intensity={0.9} />
        <Lights key1="#FFF3E6" rim="#FF3B57" rim2="#FFD23F" k={2.2} r={58} />
        <CameraRig pos={s.cam} look={s.look} />
        {s.body}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
