import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Phone, ScreenDraw } from "../../lib/three3d/Phone";
import { Camera3D, Eye3D, Mic3D } from "../../lib/three3d/Privacy";
import { Padlock } from "../../lib/three3d/Safety";
import { Pin } from "../../lib/three3d/Sky";
import { CameraRig, Lights, StudioEnv } from "../../lib/three3d/Studio";

/**
 * لقطات 3D ثابتة (PNG شفاف) لكاروسيل «5 إعدادات خصوصية»: كل فريم لقطة.
 * 0 الغلاف: جوال عليه تطبيق مصباح يطلب الموقع، وحوله دبوس وميكروفون وكاميرا بأقفال
 * 1 الموقع: جوال بخيارات الموقع + دبوس وقفل · 2 ميكروفون وكاميرا وقفل · 3 عين تتبّع ممنوعة · 4 جوال بتطبيقات منسية
 */
export const PRIVKIT_FRAMES = 5;
const AR = "'IBM Plex Sans Arabic', 'Space Grotesk'";
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
const status = (g: CanvasRenderingContext2D, w: number, dark = true) => {
  g.fillStyle = dark ? "#fff" : "#111";
  g.font = "700 22px 'Space Grotesk'";
  g.direction = "ltr";
  g.textAlign = "left";
  g.fillText("9:41", 44, 66);
  g.textAlign = "right";
  g.fillText("5G", w - 44, 66);
};

/** تطبيق مصباح (عام) يطلب الموقع */
const flashScreen: ScreenDraw = (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#1B2230");
  gr.addColorStop(1, "#0B0F16");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  status(g, w);
  // زر المصباح
  const cx = w / 2;
  const cy = 330;
  const glow = g.createRadialGradient(cx, cy, 20, cx, cy, 220);
  glow.addColorStop(0, "rgba(255,226,140,.6)");
  glow.addColorStop(1, "rgba(255,226,140,0)");
  g.fillStyle = glow;
  g.fillRect(0, 100, w, 460);
  rr(g, cx - 70, cy - 120, 140, 240, 40, "#F5F1E6");
  rr(g, cx - 50, cy - 100, 100, 70, 20, "#FFD873");
  T(g, "المصباح", cx, 600, `700 40px ${AR}`, "#fff");
  // نافذة الإذن
  g.fillStyle = "rgba(0,0,0,.45)";
  g.fillRect(0, 650, w, h - 650);
  rr(g, 40, 700, w - 80, 400, 34, "#F2F2F5");
  T(g, "«المصباح» يبي يوصل", cx, 780, `700 34px ${AR}`, "#111");
  T(g, "لموقعك؟", cx, 828, `700 34px ${AR}`, "#111");
  T(g, "ليش مصباح يحتاج موقعي؟", cx, 880, `600 24px ${AR}`, "#C2410C");
  g.fillStyle = "#D5D5DB";
  g.fillRect(40, 920, w - 80, 2);
  T(g, "السماح أثناء الاستخدام", cx, 975, `700 28px ${AR}`, "#2563EB");
  g.fillRect(40, 1005, w - 80, 2);
  T(g, "عدم السماح", cx, 1060, `700 30px ${AR}`, "#2563EB");
};

/** خيارات الموقع (عامة) */
const locScreen: ScreenDraw = (g, w, h) => {
  g.fillStyle = "#F2F2F5";
  g.fillRect(0, 0, w, h);
  status(g, w, false);
  T(g, "الموقع", w - 50, 170, `700 46px ${AR}`, "#111", "right");
  T(g, "السماح بالوصول لموقعك:", w - 50, 240, `600 26px ${AR}`, "#6B6B73", "right");
  rr(g, 36, 270, w - 72, 420, 26, "#fff");
  const opts = ["أبداً", "اسأل في المرة القادمة", "أثناء استخدام التطبيق", "دائماً"];
  opts.forEach((t, i) => {
    const y = 330 + i * 102;
    T(g, t, w - 70, y + 12, `700 30px ${AR}`, i === 3 ? "#9A9AA2" : "#111", "right");
    if (i === 2) {
      g.strokeStyle = "#16A34A";
      g.lineWidth = 8;
      g.lineCap = "round";
      g.beginPath();
      g.moveTo(80, y);
      g.lineTo(96, y + 16);
      g.lineTo(124, y - 14);
      g.stroke();
    }
    if (i < 3) {
      g.fillStyle = "#E5E5EA";
      g.fillRect(60, y + 48, w - 120, 2);
    }
  });
  rr(g, 36, 730, w - 72, 110, 26, "#fff");
  T(g, "الموقع الدقيق", w - 70, 798, `700 30px ${AR}`, "#111", "right");
  rr(g, 70, 760, 92, 52, 26, "#D1D1D6");
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(96, 786, 22, 0, Math.PI * 2);
  g.fill();
  T(g, "واجهة توضيحية", w / 2, h - 80, `600 22px ${AR}`, "#9A9AA2");
};

/** تطبيقات منسية: شبكة أيقونات، وبعضها باهت بعلامة */
const appsScreen: ScreenDraw = (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, "#1E3A5F");
  gr.addColorStop(1, "#0E1B2C");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  status(g, w);
  const cols = ["#F97316", "#22C55E", "#3B82F6", "#E11D48", "#A855F7", "#14B8A6", "#EAB308", "#64748B", "#EC4899", "#0EA5E9", "#84CC16", "#F43F5E"];
  const stale = [2, 5, 9, 10];
  for (let i = 0; i < 16; i++) {
    const c = i % 4;
    const r = Math.floor(i / 4);
    const x = 50 + c * 115;
    const y = 140 + r * 150;
    const s = stale.includes(i);
    g.globalAlpha = s ? 0.35 : 1;
    rr(g, x, y, 92, 92, 24, cols[i % cols.length]);
    g.globalAlpha = 1;
    rr(g, x + 22, y + 104, 48, 8, 4, "rgba(255,255,255,.4)");
    if (s) {
      g.fillStyle = "#FFB020";
      g.beginPath();
      g.arc(x + 84, y + 8, 18, 0, Math.PI * 2);
      g.fill();
      T(g, "!", x + 84, y + 17, `800 26px 'Space Grotesk'`, "#111");
    }
  }
  rr(g, 40, 780, w - 80, 220, 30, "rgba(255,255,255,.12)");
  T(g, "تطبيقات ما فتحتها من شهور", w / 2, 860, `700 30px ${AR}`, "#fff");
  T(g, "وأذوناتها لسا شغّالة؟", w / 2, 910, `700 30px ${AR}`, "#FFB020");
  T(g, "واجهة توضيحية", w / 2, h - 80, `600 22px ${AR}`, "rgba(255,255,255,.5)");
};

const SHOTS: { cam: [number, number, number]; look: [number, number, number]; body: React.ReactNode }[] = [
  {
    cam: [0, 0.6, 21],
    look: [0, 0.3, 0],
    body: (
      <>
        <Phone position={[0, 0, 0]} rotation={[0.04, -0.18, 0.02]} scale={0.95} draw={flashScreen} frame="#3B4250" />
        <group position={[-3.3, 2.0, 0.6]} rotation={[0.1, 0.4, 0.15]} scale={0.95}>
          <Pin />
          <Padlock position={[0.9, -0.2, 0.6]} scale={0.42} color="#E1B653" />
        </group>
        <group position={[3.3, 2.1, 0.4]} rotation={[0.1, -0.5, -0.12]} scale={0.8}>
          <Mic3D />
          <Padlock position={[-0.9, -0.6, 0.8]} scale={0.5} color="#E1B653" />
        </group>
        <group position={[3.1, -2.4, 0.8]} rotation={[0.15, -0.55, 0.1]} scale={0.7}>
          <Camera3D />
          <Padlock position={[-1.3, 0.8, 0.8]} scale={0.55} color="#E1B653" />
        </group>
      </>
    ),
  },
  {
    cam: [0, 0.4, 19],
    look: [0, 0.2, 0],
    body: (
      <>
        <Phone position={[0.9, 0, 0]} rotation={[0.04, -0.3, 0]} scale={0.9} draw={locScreen} frame="#3B4250" />
        <Pin position={[-2.4, 0.2, 1]} rotation={[0, 0.5, 0.15]} scale={1.5} />
        <Padlock position={[-2.1, -2.0, 1.4]} rotation={[0, 0.4, 0]} scale={0.8} color="#E1B653" />
      </>
    ),
  },
  {
    cam: [0, 0.3, 17],
    look: [0, 0.1, 0],
    body: (
      <>
        <Mic3D position={[-1.9, 0.6, 0]} rotation={[0.08, 0.45, 0.06]} scale={1.15} />
        <Camera3D position={[1.9, 0.9, 0]} rotation={[0.12, -0.45, -0.05]} scale={0.95} />
        <Padlock position={[0, -1.6, 1.4]} rotation={[0.05, 0, 0]} scale={1.05} color="#E1B653" open={0} />
      </>
    ),
  },
  {
    cam: [0, 0.2, 15],
    look: [0, 0, 0],
    body: (
      <>
        <Eye3D rotation={[0.08, -0.25, 0]} scale={1.35} ban={1} />
      </>
    ),
  },
  {
    cam: [0, 0.3, 17],
    look: [0, 0.1, 0],
    body: (
      <>
        <Phone position={[0, 0, 0]} rotation={[0.04, 0.22, -0.02]} scale={0.9} draw={appsScreen} frame="#3B4250" />
      </>
    ),
  },
];

export const PrivKit: React.FC = () => {
  const f = useCurrentFrame();
  const s = SHOTS[Math.min(SHOTS.length - 1, f)];
  return (
    <AbsoluteFill>
      <ThreeCanvas width={1080} height={1080} camera={{ fov: 30, position: s.cam }}>
        <StudioEnv intensity={0.9} />
        <Lights key1="#FFF6E6" rim="#E1B653" rim2="#5EEAD4" k={2.2} r={58} />
        <CameraRig pos={s.cam} look={s.look} />
        {s.body}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
