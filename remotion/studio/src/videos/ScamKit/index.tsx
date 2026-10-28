import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Phone, ScreenDraw } from "../../lib/three3d/Phone";
import { FishHook, Lifebuoy, Padlock, Parcel } from "../../lib/three3d/Safety";
import { CameraRig, Lights, StudioEnv } from "../../lib/three3d/Studio";

/**
 * لقطات 3D ثابتة (PNG شفاف) لكاروسيل «طردك متوقف»: كل فريم لقطة.
 * 0 الجوال معلّق على خطّاف · 1 الخطّاف لحاله · 2 جوال آمن + قفل · 3 جوال يبلّغ 330330 · 4 طوق نجاة · 5 طرد عليه خطّاف
 */
export const SCAMKIT_FRAMES = 6;

const AR = "'IBM Plex Sans Arabic', 'Space Grotesk'";
/** يلف النص العربي على أسطر بعرض أقصى ويرسمه RTL من الحافة اليمنى */
const wrap = (g: CanvasRenderingContext2D, text: string, right: number, y: number, maxW: number, lh: number) => {
  g.direction = "rtl";
  g.textAlign = "right";
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (g.measureText(t).width > maxW && line) {
      g.fillText(line, right, yy);
      line = w;
      yy += lh;
    } else line = t;
  }
  if (line) g.fillText(line, right, yy);
  return yy + lh;
};
const statusBar = (g: CanvasRenderingContext2D, w: number, dark: boolean) => {
  g.fillStyle = dark ? "#fff" : "#111";
  g.font = `700 22px 'Space Grotesk'`;
  g.direction = "ltr";
  g.textAlign = "left";
  g.fillText("10:42", 44, 70);
  g.textAlign = "right";
  g.fillText("5G", w - 44, 70);
};
const chatHeader = (g: CanvasRenderingContext2D, w: number, name: string, sub: string) => {
  g.fillStyle = "#F2F3F5";
  g.fillRect(0, 0, w, 210);
  statusBar(g, w, false);
  g.fillStyle = "#C9CED6";
  g.beginPath();
  g.arc(w / 2, 128, 34, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#fff";
  g.font = `700 34px ${AR}`;
  g.textAlign = "center";
  g.direction = "ltr";
  g.fillText(name.slice(0, 1), w / 2, 140);
  g.fillStyle = "#111";
  g.font = `700 24px 'Space Grotesk', ${AR}`;
  g.fillText(name, w / 2, 192);
  g.fillStyle = "#8A919C";
  g.font = `600 18px ${AR}`;
  g.direction = "rtl";
  g.fillText(sub, w / 2, 236);
};
const bubble = (g: CanvasRenderingContext2D, x: number, y: number, bw: number, bh: number, color: string) => {
  g.fillStyle = color;
  g.beginPath();
  g.roundRect(x, y, bw, bh, 30);
  g.fill();
};

const scamScreen: ScreenDraw = (g, w, h) => {
  g.fillStyle = "#FFFFFF";
  g.fillRect(0, 0, w, h);
  chatHeader(g, w, "Parcel-Info", "رسالة نصية · اليوم 10:41");
  bubble(g, 34, 290, w - 110, 470, "#E9EAEE");
  g.fillStyle = "#16181C";
  g.font = `600 31px ${AR}`;
  const y = wrap(g, "عميلنا العزيز، طردك متوقف في المستودع بسبب عنوان غير مكتمل. لإعادة جدولة التوصيل ادفع رسوم 9.50 ريال خلال 24 ساعة عبر الرابط:", w - 110, 352, w - 170, 50);
  g.direction = "ltr";
  g.textAlign = "left";
  g.fillStyle = "#1A73E8";
  g.font = `700 27px 'Space Grotesk'`;
  g.fillText("parcel-fee.example/sa", 64, y + 8);
  g.fillRect(64, y + 16, g.measureText("parcel-fee.example/sa").width, 3);
  // شريط الكتابة
  g.fillStyle = "#F2F3F5";
  g.fillRect(0, h - 130, w, 130);
  g.fillStyle = "#fff";
  g.beginPath();
  g.roundRect(40, h - 105, w - 80, 64, 32);
  g.fill();
};
const safeScreen: ScreenDraw = (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#0E7C5A");
  gr.addColorStop(1, "#06382A");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  statusBar(g, w, true);
  g.fillStyle = "rgba(255,255,255,.12)";
  g.beginPath();
  g.arc(w / 2, 400, 150, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#fff";
  g.lineWidth = 22;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.beginPath();
  g.moveTo(w / 2 - 70, 405);
  g.lineTo(w / 2 - 15, 460);
  g.lineTo(w / 2 + 80, 345);
  g.stroke();
  g.fillStyle = "#fff";
  g.font = `700 44px ${AR}`;
  g.textAlign = "center";
  g.direction = "rtl";
  g.fillText("التطبيق الرسمي", w / 2, 660);
  g.font = `600 30px ${AR}`;
  g.fillStyle = "rgba(255,255,255,.8)";
  g.fillText("افتحه أنت بنفسك", w / 2, 720);
  g.fillText("وتتبّع شحنتك من هناك", w / 2, 768);
};
const reportScreen: ScreenDraw = (g, w, h) => {
  g.fillStyle = "#FFFFFF";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#F2F3F5";
  g.fillRect(0, 0, w, 240);
  statusBar(g, w, false);
  g.fillStyle = "#111";
  g.font = `700 30px ${AR}`;
  g.textAlign = "center";
  g.direction = "rtl";
  g.fillText("إعادة توجيه", w / 2, 140);
  g.fillStyle = "#8A919C";
  g.font = `600 26px ${AR}`;
  g.textAlign = "right";
  g.fillText("إلى:", w - 40, 206);
  g.fillStyle = "#1A73E8";
  g.font = `700 34px 'Space Grotesk'`;
  g.direction = "ltr";
  g.textAlign = "right";
  g.fillText("330330", w - 110, 208);
  bubble(g, 90, 300, w - 124, 300, "#1A73E8");
  g.fillStyle = "#fff";
  g.font = `600 29px ${AR}`;
  wrap(g, "عميلنا العزيز، طردك متوقف في المستودع… ادفع رسوم 9.50 ريال خلال 24 ساعة: parcel-fee.example", w - 66, 360, w - 190, 48);
  g.fillStyle = "#12B886";
  g.font = `700 26px ${AR}`;
  g.direction = "rtl";
  g.textAlign = "right";
  g.fillText("تم الإرسال ✓", w - 40, 650);
};

const Shot: React.FC<{ f: number }> = ({ f }) => {
  if (f === 0)
    return (
      <>
        <CameraRig pos={[0, 0.35, 19.6]} look={[0, 0.35, 0]} />
        <FishHook position={[-0.62, 3.95, 0.42]} rotation={[0, -0.12, 0.05]} scale={1.05} line={6} />
        <Phone position={[0, -0.75, 0]} rotation={[0.1, -0.28, -0.13]} draw={scamScreen} frame="#5B6270" />
      </>
    );
  if (f === 1)
    return (
      <>
        <CameraRig pos={[0, 0, 9]} look={[0.2, 0, 0]} />
        <FishHook position={[-0.2, 0, 0]} rotation={[0, -0.4, 0.2]} scale={1.2} />
      </>
    );
  if (f === 2)
    return (
      <>
        <CameraRig pos={[0, 0.2, 19]} look={[0, 0.2, 0]} />
        <Phone position={[-0.7, 0, 0]} rotation={[0.05, 0.35, 0.08]} draw={safeScreen} frame="#6A717E" />
        <Padlock position={[2.15, -1.9, 1.2]} rotation={[0.1, -0.45, -0.08]} scale={0.95} />
      </>
    );
  if (f === 3)
    return (
      <>
        <CameraRig pos={[0, 0, 18]} look={[0, 0, 0]} />
        <Phone position={[0, -0.1, 0]} rotation={[0.06, -0.38, 0.1]} draw={reportScreen} frame="#5B6270" />
      </>
    );
  if (f === 4)
    return (
      <>
        <CameraRig pos={[0, 0.4, 11]} look={[0, 0, 0]} />
        <Lifebuoy rotation={[0.45, -0.35, 0.1]} />
      </>
    );
  return (
    <>
      <CameraRig pos={[3.5, 3.4, 10]} look={[0, 0.3, 0]} />
      <Parcel position={[0, -0.4, 0]} rotation={[0, -0.5, 0]} />
      <FishHook position={[0.45, 2.2, 0.1]} rotation={[0, -0.5, 0.15]} scale={0.7} line={4} />
    </>
  );
};

export const ScamKit: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <ThreeCanvas width={1080} height={1080} camera={{ fov: 30, position: [0, 0, 18] }}>
        <StudioEnv intensity={1} />
        <Lights key1="#FFFFFF" rim="#4FC3FF" rim2="#FF9F1C" k={2.2} r={60} />
        <Shot f={f} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
