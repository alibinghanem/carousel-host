import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Laptop, Panel } from "../../lib/three3d/Mail";
import { Capsule, Cloud, Tube } from "../../lib/three3d/Net";
import { Phone, ScreenDraw, useImage } from "../../lib/three3d/Phone";
import { Key, Padlock } from "../../lib/three3d/Safety";
import { CameraRig, Lights, StudioEnv } from "../../lib/three3d/Studio";

/**
 * لقطات 3D ثابتة (PNG شفاف) لكاروسيل «الكبسولة المقفولة» (تشفير واتساب): كل فريم لقطة.
 * 0 جوالين بينهم أنبوب وكبسولة مقفولة · 1 الكبسولة ومفتاحين · 2 سيرفر والكبسولة تمر قدامه مقفولة
 * 3 جوال على شاشة رمز الأمان · 4 لابتوب مرتبط + جوال على «الأجهزة المرتبطة» · 5 سحابة عليها قفل
 */
export const SEALKIT_FRAMES = 6;

type Img = HTMLImageElement | null;
const AR = "'IBM Plex Sans Arabic', 'Space Grotesk'";
const G = "#25D366";
const DG = "#0B6E4F";

const txt = (g: CanvasRenderingContext2D, t: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "right", dir: CanvasDirection = "rtl") => {
  g.font = font;
  g.fillStyle = color;
  g.direction = dir;
  g.textAlign = align;
  g.fillText(t, x, y);
};
const status = (g: CanvasRenderingContext2D, w: number, c: string) => {
  txt(g, "9:41", 44, 66, `700 22px 'Space Grotesk'`, c, "left", "ltr");
  txt(g, "5G", w - 44, 66, `700 22px 'Space Grotesk'`, c, "right", "ltr");
};
const lockGlyph = (g: CanvasRenderingContext2D, x: number, y: number, s: number, c: string) => {
  g.fillStyle = c;
  g.beginPath();
  g.roundRect(x - 9 * s, y - 2 * s, 18 * s, 14 * s, 3 * s);
  g.fill();
  g.strokeStyle = c;
  g.lineWidth = 3 * s;
  g.beginPath();
  g.arc(x, y - 3 * s, 6 * s, Math.PI, 0);
  g.stroke();
};
const header = (g: CanvasRenderingContext2D, w: number, title: string, sub: string, logo: Img) => {
  g.fillStyle = DG;
  g.fillRect(0, 0, w, 210);
  status(g, w, "#fff");
  g.beginPath();
  g.arc(w - 90, 150, 38, 0, Math.PI * 2);
  g.fillStyle = "#fff";
  g.fill();
  if (logo) g.drawImage(logo, w - 114, 126, 48, 48);
  txt(g, title, w - 146, 146, `700 32px ${AR}`, "#fff");
  txt(g, sub, w - 146, 184, `600 22px ${AR}`, "rgba(255,255,255,.8)");
};
const bubble = (g: CanvasRenderingContext2D, t: string, y: number, me: boolean, w: number) => {
  g.font = `600 30px ${AR}`;
  const tw = g.measureText(t).width;
  const bw = tw + 60;
  const x = me ? w - 30 - bw : 30;
  g.fillStyle = me ? "#D9FDD3" : "#FFFFFF";
  g.beginPath();
  g.roundRect(x, y, bw, 84, 22);
  g.fill();
  txt(g, t, x + bw - 30, y + 52, `600 30px ${AR}`, "#111B21");
  txt(g, "10:42", x + 14, y + 74, `700 14px 'Space Grotesk'`, "#667781", "left", "ltr");
};
const chatScreen =
  (logo: Img, me: boolean): ScreenDraw =>
  (g, w, h) => {
    g.fillStyle = "#EFE7DC";
    g.fillRect(0, 0, w, h);
    header(g, w, me ? "سارة" : "علي", "متصل الآن", logo);
    // إشعار التشفير
    g.fillStyle = "#FFF3C4";
    g.beginPath();
    g.roundRect(50, 250, w - 100, 120, 18);
    g.fill();
    lockGlyph(g, w - 84, 300, 1.4, "#54656F");
    txt(g, "الرسائل والمكالمات مشفّرة", w - 112, 302, `700 25px ${AR}`, "#54656F");
    txt(g, "من طرف لطرف", w - 112, 340, `700 25px ${AR}`, "#54656F");
    bubble(g, "أرسلت لك رقم الحجز", 420, me, w);
    bubble(g, "وصل، شكراً", 530, !me, w);
    bubble(g, "تمام", 640, me, w);
  };

/** رمز QR عام (نقش عشوائي ثابت بثلاث مربعات تحديد) — مو رمز حقيقي */
const fakeQR = (g: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  const n = 25;
  const c = size / n;
  g.fillStyle = "#fff";
  g.fillRect(x - c, y - c, size + 2 * c, size + 2 * c);
  g.fillStyle = "#111B21";
  let s = 7;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      s = (s * 9301 + 49297) % 233280;
      const inFinder = (i < 8 && j < 8) || (i < 8 && j > n - 9) || (i > n - 9 && j < 8);
      if (!inFinder && s / 233280 > 0.52) g.fillRect(x + i * c, y + j * c, c, c);
    }
  const finder = (fx: number, fy: number) => {
    g.fillStyle = "#111B21";
    g.fillRect(x + fx * c, y + fy * c, 7 * c, 7 * c);
    g.fillStyle = "#fff";
    g.fillRect(x + (fx + 1) * c, y + (fy + 1) * c, 5 * c, 5 * c);
    g.fillStyle = "#111B21";
    g.fillRect(x + (fx + 2) * c, y + (fy + 2) * c, 3 * c, 3 * c);
  };
  finder(0, 0);
  finder(n - 7, 0);
  finder(0, n - 7);
};
const verifyScreen =
  (logo: Img): ScreenDraw =>
  (g, w, h) => {
    g.fillStyle = "#FFFFFF";
    g.fillRect(0, 0, w, h);
    header(g, w, "التشفير", "رمز الأمان مع سارة", logo);
    fakeQR(g, w / 2 - 150, 270, 300);
    let s = 11;
    for (let r = 0; r < 4; r++)
      for (let cI = 0; cI < 3; cI++) {
        let d = "";
        for (let k = 0; k < 5; k++) {
          s = (s * 9301 + 49297) % 233280;
          d += Math.floor((s / 233280) * 10);
        }
        txt(g, d, 52 + cI * 160, 680 + r * 56, `800 30px 'JetBrains Mono'`, "#111B21", "left", "ltr");
      }
    txt(g, "قارن الرمز مع صاحبك", w / 2, 960, `700 28px ${AR}`, "#54656F", "center");
    g.fillStyle = G;
    g.beginPath();
    g.roundRect(110, 1000, w - 220, 80, 40);
    g.fill();
    txt(g, "مسح الرمز", w / 2, 1052, `700 30px ${AR}`, "#fff", "center");
  };
const linkedScreen =
  (logo: Img): ScreenDraw =>
  (g, w, h) => {
    g.fillStyle = "#FFFFFF";
    g.fillRect(0, 0, w, h);
    header(g, w, "الأجهزة المرتبطة", "Linked devices", logo);
    g.fillStyle = G;
    g.beginPath();
    g.roundRect(60, 250, w - 120, 84, 42);
    g.fill();
    txt(g, "ربط جهاز", w / 2, 304, `700 30px ${AR}`, "#fff", "center");
    txt(g, "حالة الأجهزة", w - 50, 400, `700 24px ${AR}`, "#667781");
    const row = (y: number, t: string, sub: string, warn: boolean) => {
      if (warn) {
        g.fillStyle = "rgba(234,67,53,.1)";
        g.fillRect(0, y - 50, w, 120);
      }
      g.strokeStyle = warn ? "#D93025" : "#54656F";
      g.lineWidth = 4;
      g.strokeRect(w - 120, y - 24, 64, 42);
      g.fillStyle = warn ? "#D93025" : "#54656F";
      g.fillRect(w - 132, y + 22, 88, 6);
      txt(g, t, w - 150, y, `700 28px ${AR}`, "#111B21");
      txt(g, sub, w - 150, y + 40, `600 22px ${AR}`, warn ? "#D93025" : "#667781");
    };
    row(480, "Chrome · Windows", "نشط الآن", false);
    row(620, "Safari · Mac", "آخر نشاط: قبل 9 أيام", true);
    txt(g, "تسجيل الخروج", w / 2, 790, `700 30px ${AR}`, "#D93025", "center");
  };
const webScreen =
  (logo: Img): ScreenDraw =>
  (g, w, h) => {
    g.fillStyle = "#EFE7DC";
    g.fillRect(0, 0, w, h);
    // قائمة الدردشات يمين
    g.fillStyle = "#FFFFFF";
    g.fillRect(w - 420, 0, 420, h);
    g.fillStyle = "#F0F2F5";
    g.fillRect(w - 420, 0, 420, 90);
    if (logo) g.drawImage(logo, w - 80, 22, 48, 48);
    txt(g, "واتساب", w - 100, 58, `700 28px ${AR}`, "#111B21");
    ["سارة", "العائلة", "الشغل", "أحمد", "نورة"].forEach((n, i) => {
      const y = 140 + i * 110;
      g.beginPath();
      g.arc(w - 60, y + 10, 30, 0, Math.PI * 2);
      g.fillStyle = ["#9FC5B8", "#C9B8E8", "#F2C48D", "#9DB7E8", "#E8A9B5"][i];
      g.fill();
      txt(g, n, w - 110, y + 4, `700 28px ${AR}`, "#111B21");
      g.fillStyle = "#D1D7DB";
      g.fillRect(w - 380, y + 26, 260, 10);
      g.fillStyle = "#E9EDEF";
      g.fillRect(w - 400, y + 58, 380, 2);
    });
    // الدردشة يسار
    g.fillStyle = "#F0F2F5";
    g.fillRect(0, 0, w - 420, 90);
    txt(g, "سارة", w - 460, 58, `700 28px ${AR}`, "#111B21");
    [
      [180, true, 300],
      [290, false, 240],
      [400, true, 360],
      [510, false, 200],
    ].forEach(([y, me, bw]) => {
      g.fillStyle = me ? "#D9FDD3" : "#FFFFFF";
      g.beginPath();
      g.roundRect(me ? w - 460 - (bw as number) : 40, y as number, bw as number, 70, 16);
      g.fill();
    });
  };

const RACK: ScreenDraw = (g, w, h) => {
  g.fillStyle = "#1E232B";
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 9; i++) {
    const y = 150 + i * 90;
    g.fillStyle = "#2B323C";
    g.fillRect(30, y, w - 60, 72);
    g.fillStyle = "#151920";
    for (let k = 0; k < 10; k++) g.fillRect(60 + k * 22, y + 20, 10, 32);
    g.fillStyle = i % 3 === 1 ? "#FFC23D" : G;
    g.beginPath();
    g.arc(w - 80, y + 36, 8, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.arc(w - 56, y + 36, 8, 0, Math.PI * 2);
    g.fill();
  }
};

const Shot: React.FC<{ f: number; logo: Img }> = ({ f, logo }) => {
  if (f === 0) {
    const arcPts: [number, number, number][] = [
      [-3.0, 2.35, 0],
      [-2.7, 3.9, 0],
      [-1.3, 4.75, 0],
      [0, 4.95, 0],
      [1.3, 4.75, 0],
      [2.7, 3.9, 0],
      [3.0, 2.35, 0],
    ];
    return (
      <>
        <CameraRig pos={[0, 1.1, 23.5]} look={[0, 1.0, 0]} />
        <Phone position={[-3.0, -0.9, 0]} rotation={[0.04, 0.42, 0]} scale={0.95} draw={chatScreen(logo, true)} frame="#5B6270" />
        <Phone position={[3.0, -0.9, 0]} rotation={[0.04, -0.42, 0]} scale={0.95} draw={chatScreen(logo, false)} frame="#5B6270" />
        <Tube pts={arcPts} r={0.72} rings={2} />
        <Capsule position={[0, 4.95, 0]} scale={1.18} glow={1} />
        <Key position={[-4.45, 1.2, 1.2]} rotation={[0, 0.3, 0.5]} scale={0.85} color={G} glow={0.35} />
        <Key position={[4.45, 1.2, 1.2]} rotation={[0, -0.3, -0.5]} scale={0.85} color={G} glow={0.35} />
      </>
    );
  }
  if (f === 1)
    return (
      <>
        <CameraRig pos={[0, 0.2, 15.5]} look={[0, -0.3, 0]} />
        <Capsule position={[0, 0.2, 0]} rotation={[0.12, -0.32, 0.06]} scale={2.1} glow={1} />
        <Key position={[-2.25, -1.85, 1]} rotation={[0, 0.3, 0.9]} scale={1.05} color={G} glow={0.35} />
        <Key position={[2.25, -1.85, 1]} rotation={[0, -0.3, -0.9]} scale={1.05} color={G} glow={0.35} />
      </>
    );
  if (f === 2)
    return (
      <>
        <CameraRig pos={[4.2, 2.6, 15]} look={[0, 0.2, 0]} />
        <Panel position={[0, 0.6, -1.4]} draw={RACK} W={400} H={1000} w={2.6} h={5.2} d={1.8} r={0.1} color="#2A2F38" />
        <Panel position={[0, 2.55, -0.45]} draw={(g, w, h) => {
          g.fillStyle = "#fff";
          g.fillRect(0, 0, w, h);
          if (logo) g.drawImage(logo, w / 2 - 70, h / 2 - 70, 140, 140);
        }} W={320} H={320} w={0.9} h={0.9} d={0.08} r={0.2} />
        <Tube pts={[[-5.5, -0.9, 1.0], [-2, -1.0, 1.2], [0, -1.0, 1.2], [2, -1.0, 1.2], [5.5, -0.9, 1.0]]} r={0.68} rings={2} />
        <Capsule position={[0.2, -1.0, 1.2]} scale={1.05} glow={1} />
      </>
    );
  if (f === 3)
    return (
      <>
        <CameraRig pos={[0, 0, 17]} look={[0, 0, 0]} />
        <Phone position={[0, 0, 0]} rotation={[0.06, -0.3, 0.06]} draw={verifyScreen(logo)} frame="#5B6270" />
      </>
    );
  if (f === 4)
    return (
      <>
        <CameraRig pos={[0, 2.4, 17]} look={[0.3, 0.2, 0]} />
        <Laptop position={[-0.9, -1.3, -0.6]} rotation={[0.08, 0.32, 0]} open={1} draw={webScreen(logo)} />
        <Phone position={[2.45, -0.6, 1.6]} rotation={[0.05, -0.3, 0]} scale={0.72} draw={linkedScreen(logo)} frame="#5B6270" />
      </>
    );
  return (
    <>
      <CameraRig pos={[0, 0.3, 13.5]} look={[0, 0.1, 0]} />
      <Cloud position={[0, 0.5, -0.4]} scale={1.45} />
      <Padlock position={[0, -0.75, 1.4]} rotation={[0.08, -0.25, 0]} scale={1.1} color={G} />
    </>
  );
};

export const SealKit: React.FC = () => {
  const f = useCurrentFrame();
  const logo = useImage(staticFile("videos/sealkit/whatsapp-color.svg"));
  return (
    <AbsoluteFill>
      <ThreeCanvas width={1080} height={1080} camera={{ fov: 30, position: [0, 0, 18] }}>
        <StudioEnv intensity={1} />
        <Lights key1="#FFFFFF" rim="#6FE3A8" rim2="#7FB8FF" k={2.2} r={60} />
        <Shot f={f} logo={logo} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
