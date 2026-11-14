import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Check3D, GlitchSlabs } from "../../lib/three3d/Fake";
import { Door3D, SecurityKey, Stopwatch3D, WarnTriangle } from "../../lib/three3d/Door";
import { Laptop, Panel } from "../../lib/three3d/Mail";
import { Shield } from "../../lib/three3d/Parts";
import { Phone, ScreenDraw } from "../../lib/three3d/Phone";
import { Key, Padlock } from "../../lib/three3d/Safety";
import { CameraRig, Lights, StudioEnv } from "../../lib/three3d/Studio";

/**
 * لقطات 3D ثابتة (PNG شفاف) لكاروسيل «حسابك انسرق؟ أول 10 دقايق»: كل فريم لقطة.
 * 0 الغلاف: باب مفتوح بقفل مكسور وشرائح غلتش ومؤقت · 1 تنبيه تسجيل دخول مشبوه ومثلث تحذير
 * 2 كلمة مرور جديدة: قفل أخضر ومفتاح ولوح بنقاط · 3 جهاز غريب: جوال ولابتوب بحلقة حمراء
 * 4 تحقق بخطوتين: جوال برمز ودرع ومفتاح أمان · 5 الخلاصة: باب مقفول بقفل أخضر ودرع
 */
export const SECKIT_FRAMES = 6;
const AR = "'IBM Plex Sans Arabic', 'Space Grotesk'";
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

const alertScreen: ScreenDraw = (g, w, h) => {
  g.fillStyle = "#F5F7FA";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#111";
  g.font = "700 22px 'Space Grotesk'";
  g.direction = "ltr";
  g.textAlign = "left";
  g.fillText("9:41", 44, 66);
  rr(g, 36, 130, w - 72, 560, 30, "#fff");
  g.fillStyle = "#FF3B30";
  g.beginPath();
  g.arc(w / 2, 230, 56, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#fff";
  g.font = "800 64px 'Space Grotesk'";
  g.textAlign = "center";
  g.fillText("!", w / 2, 252);
  T(g, "تسجيل دخول جديد", w / 2, 350, `800 36px ${AR}`, "#111");
  T(g, "من جهاز لا تعرفه", w / 2, 400, `700 30px ${AR}`, "#FF3B30");
  T(g, "قبل قليل · مدينة بعيدة", w / 2, 452, `600 24px ${AR}`, "#777");
  rr(g, 70, 500, w - 140, 74, 18, "#FF3B30");
  T(g, "ليس أنا", w / 2, 550, `800 32px ${AR}`, "#fff");
  rr(g, 70, 596, w - 140, 62, 18, "#E8ECF1");
  T(g, "نعم، أنا", w / 2, 640, `700 28px ${AR}`, "#444");
  T(g, "واجهة توضيحية", w / 2, h - 80, `600 22px ${AR}`, "#999");
};
const codeScreen: ScreenDraw = (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#14233F");
  gr.addColorStop(1, "#0A1224");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#fff";
  g.font = "700 22px 'Space Grotesk'";
  g.direction = "ltr";
  g.textAlign = "left";
  g.fillText("9:41", 44, 66);
  T(g, "رمز التحقق", w / 2, 250, `700 36px ${AR}`, "#fff");
  g.font = "800 90px 'Space Grotesk'";
  g.fillStyle = "#26D07C";
  g.textAlign = "center";
  g.direction = "ltr";
  g.fillText("482 916", w / 2, 400);
  rr(g, 90, 450, w - 180, 12, 6, "rgba(255,255,255,.18)");
  rr(g, 90, 450, (w - 180) * 0.6, 12, 6, "#26D07C");
  T(g, "ينتهي خلال ثوانٍ", w / 2, 520, `600 26px ${AR}`, "rgba(255,255,255,.65)");
  T(g, "واجهة توضيحية", w / 2, h - 80, `600 22px ${AR}`, "rgba(255,255,255,.45)");
};
const pwDraw = (g: CanvasRenderingContext2D, w: number, h: number) => {
  g.fillStyle = "#fff";
  g.fillRect(0, 0, w, h);
  T(g, "كلمة المرور الجديدة", w - 40, 70, `700 34px ${AR}`, "#111", "right");
  rr(g, 40, 110, w - 80, 90, 18, "#EEF1F5");
  g.fillStyle = "#111";
  for (let i = 0; i < 14; i++) {
    g.beginPath();
    g.arc(w - 90 - i * 44, 155, 12, 0, Math.PI * 2);
    g.fill();
  }
  rr(g, 40, 250, w - 80, 22, 11, "#E3E7ED");
  rr(g, 40, 250, (w - 80) * 0.92, 22, 11, "#26D07C");
  T(g, "قوية وفريدة", w - 40, 330, `700 30px ${AR}`, "#1B9A58", "right");
};
const laptopDraw = (g: CanvasRenderingContext2D, w: number, h: number) => {
  g.fillStyle = "#EEF1F5";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#14233F";
  g.fillRect(0, 0, w, 70);
  g.fillStyle = "#fff";
  g.font = "700 30px 'IBM Plex Sans Arabic'";
  g.direction = "rtl";
  g.textAlign = "right";
  g.fillText("أجهزتك", w - 40, 46);
  [
    ["هذا الجوال", "#26D07C"],
    ["جهاز غير معروف", "#FF3B30"],
  ].forEach(([t, c], i) => {
    rr(g, 60, 130 + i * 150, w - 120, 110, 22, "#fff");
    g.fillStyle = c;
    g.beginPath();
    g.arc(w - 120, 185 + i * 150, 18, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#111";
    g.font = "700 34px 'IBM Plex Sans Arabic'";
    g.fillText(t, w - 170, 198 + i * 150);
  });
};

const SHOTS: { cam: V3; look: V3; body: React.ReactNode }[] = [
  {
    cam: [0, 0.4, 15],
    look: [0, 0.1, 0],
    body: (
      <>
        <GlitchSlabs position={[0.2, 0.2, -1.4]} seed={5} w={4.4} h={5.2} color="#FF3B30" />
        <Door3D open={0.55} position={[-0.6, 0, 0]} rotation={[0, 0.25, 0]} scale={0.95}>
          <group position={[0.7, -0.05, 0.3]} rotation={[0, 0, 0.35]} scale={0.5}>
            <Padlock color="#FF3B30" open={1} />
          </group>
        </Door3D>
        <Stopwatch3D position={[2.2, -1.9, 0.9]} rotation={[0.1, -0.35, 0.05]} scale={0.95} rot={-1.4} />
      </>
    ),
  },
  {
    cam: [0, 0.3, 17],
    look: [0, 0.1, 0],
    body: (
      <>
        <Phone position={[-0.5, -0.2, 0]} rotation={[0.04, 0.3, -0.03]} scale={0.92} draw={alertScreen} frame="#3B4250" />
        <WarnTriangle position={[2.4, 1.6, 1.2]} rotation={[0.1, -0.4, 0.12]} scale={1.15} />
      </>
    ),
  },
  {
    cam: [0, 0.3, 15],
    look: [0, 0.1, 0],
    body: (
      <>
        <Panel position={[0, 1.7, 0]} rotation={[0.05, -0.12, 0]} draw={pwDraw} W={800} H={400} w={4.4} h={2.2} d={0.12} r={0.2} />
        <Padlock position={[-1.2, -1.5, 0.6]} rotation={[0.05, 0.3, 0]} scale={1.25} color="#26D07C" open={0} />
        <Key position={[1.6, -1.5, 0.8]} rotation={[0, 0.2, 1.1]} scale={1.4} color="#E8C15A" glow={0.2} />
      </>
    ),
  },
  {
    cam: [0, 0.4, 17],
    look: [0, 0.1, 0],
    body: (
      <>
        <Phone position={[-2.0, -0.5, 0.8]} rotation={[0.04, 0.3, 0]} scale={0.62} draw={codeScreen} frame="#3B4250" />
        <group position={[1.3, 0.2, 0]} rotation={[0.04, -0.3, 0]} scale={0.78}>
          <Laptop draw={laptopDraw} open={1} />
        </group>
        <group position={[3.0, 1.9, 1.0]} rotation={[0.1, -0.3, 0.1]}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[1.5, 0.26, 0.2]} />
            <meshPhysicalMaterial color="#FF3B30" roughness={0.3} clearcoat={1} />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[1.5, 0.26, 0.2]} />
            <meshPhysicalMaterial color="#FF3B30" roughness={0.3} clearcoat={1} />
          </mesh>
        </group>
      </>
    ),
  },
  {
    cam: [0, 0.3, 16],
    look: [0, 0.1, 0],
    body: (
      <>
        <Phone position={[-1.3, -0.1, 0]} rotation={[0.04, 0.3, -0.02]} scale={0.8} draw={codeScreen} frame="#3B4250" />
        <Shield position={[2.5, 1.2, 0.8]} rotation={[0.05, -0.35, 0]} scale={0.8} color="#26D07C" />
        <SecurityKey position={[2.6, -1.7, 0.9]} rotation={[0.1, -0.3, 0.35]} scale={0.95} glow={0.3} />
      </>
    ),
  },
  {
    cam: [0, 0.4, 15],
    look: [0, 0.1, 0],
    body: (
      <>
        <Door3D open={0} position={[-0.8, 0, 0]} rotation={[0, 0.2, 0]} scale={0.95}>
          <group position={[0.7, -0.15, 0.3]} scale={0.55}>
            <Padlock color="#26D07C" open={0} />
          </group>
        </Door3D>
        <Shield position={[2.6, 0.4, 0.8]} rotation={[0.05, -0.35, 0]} scale={0.8} color="#26D07C" />
        <Check3D position={[2.6, 0.45, 1.4]} rotation={[0.05, -0.35, 0]} scale={0.8} color="#FFFFFF" />
      </>
    ),
  },
];

export const SecKit: React.FC = () => {
  const f = useCurrentFrame();
  const s = SHOTS[Math.min(SHOTS.length - 1, f)];
  return (
    <AbsoluteFill>
      <ThreeCanvas width={1080} height={1080} camera={{ fov: 30, position: s.cam }}>
        <StudioEnv intensity={0.9} />
        <Lights key1="#FFF3E6" rim="#FF3B30" rim2="#26D07C" k={2.2} r={58} />
        <CameraRig pos={s.cam} look={s.look} />
        {s.body}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
