import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { staticFile } from "remotion";
import * as THREE from "three";
import { BatteryCell, Cable, Heat, Shield, Thermometer, levelColor } from "../../lib/three3d/Parts";
import { Phone, ScreenDraw, useImage } from "../../lib/three3d/Phone";
import { CameraRig, Lights, StudioEnv } from "../../lib/three3d/Studio";
import { BACK, BODY, C, EN, IN_OUT, OUT, SEG, SegK, ease } from "./theme";

const lp = (f: number, k: SegK) => f - SEG[k][0];
/** ظهور العنصر خلال مقطعه */
const vis = (f: number, k: SegK, pre = 6, post = 10) => ease(f, SEG[k][0] - pre, 16, OUT) * (1 - ease(f, SEG[k][1] - post, 14, OUT));
const cur = (f: number): SegK => (Object.keys(SEG) as SegK[]).find((k) => f >= SEG[k][0] && f < SEG[k][1]) ?? "end";

type V3 = [number, number, number];
type St = { p: V3; r: V3; s: number };
const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
/** حالات ثابتة تتنقل بينها بتسهيل IN_OUT خلال d فريم قبل بداية الحالة التالية */
const track = (f: number, keys: [number, St][], d = 30): St => {
  let s = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const t = ease(f, keys[i][0] - d / 2, d, IN_OUT);
    if (t <= 0) break;
    const n = keys[i][1];
    s = { p: lerp3(s.p, n.p, t), r: lerp3(s.r, n.r, t), s: s.s + (n.s - s.s) * t };
  }
  return s;
};

/* ───── رسم الشاشة لكل مشهد ───── */
const bgGrad = (g: CanvasRenderingContext2D, w: number, h: number, a: string, b: string) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, a);
  gr.addColorStop(1, b);
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
};
const thermoIcon = (g: CanvasRenderingContext2D, x: number, y: number, s: number, c: string) => {
  g.fillStyle = c;
  g.beginPath();
  g.arc(x, y + 70 * s, 34 * s, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.roundRect(x - 16 * s, y - 90 * s, 32 * s, 160 * s, 16 * s);
  g.fill();
};
/** نص عربي ومعه رقم لاتيني بالترتيب الصحيح (العربي يمين والرقم يساره) */
const mixed = (g: CanvasRenderingContext2D, ar: string, num: string, cx: number, y: number, fa: string, fn: string, ca: string, cn: string) => {
  g.font = fa;
  const wa = g.measureText(ar).width;
  g.font = fn;
  const wn = g.measureText(num).width;
  const gap = 16;
  const right = cx + (wa + gap + wn) / 2;
  g.direction = "rtl";
  g.textAlign = "right";
  g.font = fa;
  g.fillStyle = ca;
  g.fillText(ar, right, y);
  g.direction = "ltr";
  g.textAlign = "left";
  g.font = fn;
  g.fillStyle = cn;
  g.fillText(num, right - wa - gap - wn, y);
  g.textAlign = "center";
  g.direction = "rtl";
};
const screenFor = (f: number, avatar: HTMLImageElement | null): ScreenDraw => (g, w, h) => {
  const k = cur(f);
  g.textAlign = "center";
  g.direction = "rtl";
  if (k === "hook") {
    bgGrad(g, w, h, "#5A0F08", "#1A0503");
    const pulse = 0.7 + 0.3 * Math.sin(f / 4);
    g.globalAlpha = pulse;
    thermoIcon(g, w / 2, 420, 1.6, "#FF5A3C");
    g.globalAlpha = 1;
    g.fillStyle = "#fff";
    g.font = "700 64px 'IBM Plex Sans Arabic'";
    g.fillText("حرارة عالية", w / 2, 720);
    g.fillStyle = "#FFB4A6";
    g.font = "600 40px 'IBM Plex Sans Arabic'";
    g.fillText("الجوال يحتاج يبرد", w / 2, 800);
  } else if (k === "case") {
    const cool = ease(lp(f, "case"), 160, 30, OUT);
    bgGrad(g, w, h, "#16181E", "#07080B");
    g.fillStyle = "#FFD23F";
    g.beginPath();
    g.moveTo(w / 2 + 30, 300);
    g.lineTo(w / 2 - 70, 520);
    g.lineTo(w / 2 + 5, 520);
    g.lineTo(w / 2 - 30, 720);
    g.lineTo(w / 2 + 80, 470);
    g.lineTo(w / 2 + 5, 470);
    g.closePath();
    g.fill();
    g.fillStyle = "#fff";
    g.font = "700 56px 'IBM Plex Sans Arabic'";
    g.fillText("يشحن", w / 2, 860);
    const c = new THREE.Color(C.hot).lerp(new THREE.Color(C.cool), cool);
    g.fillStyle = `#${c.getHexString()}`;
    g.beginPath();
    g.roundRect(w / 2 - 150, 920, 300, 84, 42);
    g.fill();
    g.fillStyle = "#fff";
    g.font = "700 44px 'IBM Plex Sans Arabic'";
    g.fillText(cool > 0.5 ? "حرارة طبيعية" : "حار", w / 2, 976);
  } else if (k === "limit") {
    bgGrad(g, w, h, "#0B1E4A", "#03081A");
    const p = ease(lp(f, "limit"), 40, 90, OUT) * 0.8;
    g.lineWidth = 34;
    g.strokeStyle = "rgba(255,255,255,.12)";
    g.beginPath();
    g.arc(w / 2, 520, 180, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = C.ok;
    g.lineCap = "round";
    g.beginPath();
    g.arc(w / 2, 520, 180, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p);
    g.stroke();
    g.fillStyle = "#fff";
    g.font = "700 110px 'Space Grotesk'";
    g.direction = "ltr";
    g.fillText(`${Math.round(p * 100)}%`, w / 2, 560);
    g.direction = "rtl";
    g.font = "700 46px 'IBM Plex Sans Arabic'";
    g.fillStyle = C.ok;
    g.fillText("حد الشحن مفعّل", w / 2, 820);
    mixed(g, "يوقف عند", "80%", w / 2, 885, "600 38px 'IBM Plex Sans Arabic'", "700 38px 'Space Grotesk'", "rgba(255,255,255,.65)", "rgba(255,255,255,.9)");
  } else if (k === "end" || k === "sum") {
    bgGrad(g, w, h, "#0E3A3A", "#04100F");
    if (avatar) {
      const s = Math.max(w / avatar.width, h / avatar.height);
      const iw = avatar.width * s;
      const ih = avatar.height * s;
      g.drawImage(avatar, (w - iw) / 2, (h - ih) * 0.15, iw, ih);
      const gr = g.createLinearGradient(0, h * 0.6, 0, h);
      gr.addColorStop(0, "rgba(4,16,15,0)");
      gr.addColorStop(1, "rgba(4,16,15,.85)");
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
    }
  } else {
    bgGrad(g, w, h, "#111", "#050505");
  }
};

/* ───── المشهد ───── */
export const Scene3D: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const avatar = useImage(staticFile("avatar.png"));
  const k = cur(f);
  // الكاميرا: قريبة ومن فوق في الهوك، بعدها ثابتة مع دوران خفيف
  const hookCam = 1 - ease(f, SEG.hook[1] - 14, 32, IN_OUT);
  const sway = ease(f, SEG.heat[0] - 10, 30, OUT) * (1 - ease(f, SEG.zero[0] - 15, 30, OUT));
  const orbit = Math.sin(f / 140) * 1.4 * sway;
  const camPos: [number, number, number] = [orbit * (1 - hookCam) + 0.6 * hookCam, 0.8 + 4.2 * hookCam, 27 - 7 * hookCam];
  const camLook: [number, number, number] = [0, -0.2 - 1.2 * hookCam, 0];

  // الجوال الرئيسي
  const ph = track(f, [
    [0, { p: [0, -1.6, 1.2], r: [-1.12, 0.3, 0.12], s: 1 }],
    [SEG.heat[0], { p: [-1.6, -0.35, 0], r: [0.04, 0.38, 0], s: 1 }],
    [SEG.case[0], { p: [0, -0.15, 0], r: [0.05, -0.32, 0.02], s: 1 }],
    [SEG.zero[0], { p: [-9, -0.15, -2], r: [0.05, -1.2, 0.02], s: 1 }],
    [SEG.limit[0], { p: [-1.3, 0.55, 0], r: [0.04, 0.42, 0], s: 0.86 }],
    [SEG.sum[0], { p: [-9, -0.25, -2], r: [0.04, 1.2, 0], s: 1 }],
    [SEG.end[0], { p: [0, 1.3, 0], r: [0.02, 0, 0], s: 0.78 }],
  ]);
  const endTurn = (1 - ease(f, SEG.end[0] - 6, 40, OUT)) * -1.4;
  const xray = ease(lp(f, "heat"), 16, 30, IN_OUT) * (1 - ease(f, SEG.heat[1] - 24, 20, OUT));
  const caseOn = k === "case" ? 1 - ease(lp(f, "case"), 140, 34, IN_OUT) : 0;
  const heatCell = 1 - ease(lp(f, "heat"), 60, 150, OUT) * 0.24;
  const thermo = 0.32 + ease(lp(f, "heat"), 40, 160, OUT) * 0.62;
  const heatOn = Math.max(vis(f, "hook", 0, 6) * 1, vis(f, "heat"), k === "case" ? 1 - ease(lp(f, "case"), 150, 30, OUT) : 0);

  // البطارية الكبيرة في مشهد الصفر
  const zl = lp(f, "zero");
  const bigV = vis(f, "zero") * (1 - ease(zl, 118, 22, IN_OUT));
  const drain = 1 - ease(zl, 14, 84, IN_OUT);
  const pair = ease(zl, 128, 20, BACK) * (1 - ease(f, SEG.zero[1] - 10, 12, OUT));
  const merge = ease(zl, 170, 28, IN_OUT);
  const ring = ease(zl, 190, 22, BACK) * (1 - ease(f, SEG.zero[1] - 10, 12, OUT));

  // الخلاصة
  const sl = lp(f, "sum");
  const sumOn = (i: number) => ease(sl, 14 + i * 14, 18, BACK) * (1 - ease(f, SEG.sum[1] - 10, 12, OUT));

  const warm = k === "hook" || k === "heat" || k === "case";
  const night = k === "limit";
  return (
    <ThreeCanvas width={1080} height={1920} camera={{ fov: 30, position: [0, 0.8, 27] }}>
      <StudioEnv intensity={night ? 0.7 : 1} />
      <Lights key1={warm ? "#FFD2B0" : night ? "#B8CCFF" : "#FFFFFF"} rim={night ? "#3D7BFF" : warm ? "#FF5A2E" : "#4FC3FF"} rim2={warm ? "#FFB347" : "#7C4DFF"} k={2.1 + kick * 0.3} r={70} />
      <CameraRig pos={camPos} look={camLook} />

      {/* الجوال */}
      <Phone
        position={ph.p}
        rotation={[ph.r[0], ph.r[1] + (k === "end" ? endTurn : 0), ph.r[2]]}
        scale={ph.s}
        xray={xray}
        caseOn={caseOn}
        frame={night ? "#3C4456" : "#6A717E"}
        draw={screenFor(f, avatar)}
      >
        {xray > 0.05 ? <BatteryCell level={heatCell} r={0.78} h={3.6} position={[0, -0.45, 0]} scale={0.6 + 0.4 * xray} /> : null}
        {k === "case" || k === "limit" ? <Cable pts={[[0, -3.25, 0], [0, -4.3, 0.2], [1.1, -5.1, 1.0], [2.9, -5.4, 1.6]]} /> : null}
      </Phone>

      {/* ميزان الحرارة */}
      {vis(f, "heat") > 0 ? <Thermometer level={thermo} position={[2.5, -0.3 + (1 - vis(f, "heat")) * -6, 0.3]} rotation={[0, -0.3, -0.06]} /> : null}
      <Heat f={f} on={heatOn} base={k === "hook" ? -2.6 : -3.4} height={6} w={k === "heat" ? 7 : 3.6} />

      {/* مشهد الصفر */}
      {bigV > 0 ? <BatteryCell level={drain} r={1.05} h={5.2} position={[0, 0.0, 0]} rotation={[0.25, 0.3, -Math.PI / 2]} scale={bigV} glow={1.2} /> : null}
      {pair > 0 ? (
        <>
          <BatteryCell level={0.75} r={0.7} h={2.6} position={[1.9 * (1 - merge), 0.3, 0]} rotation={[0.15, 0.4, 0]} scale={pair * (1 - merge)} />
          <BatteryCell level={0.25} r={0.7} h={2.6} position={[-1.9 * (1 - merge), 0.3, 0]} rotation={[0.15, -0.4, 0]} scale={pair * (1 - merge)} />
        </>
      ) : null}
      {ring > 0 ? (
        <mesh position={[0, 0.3, 0]} rotation={[0.35 + f * 0.01, f * 0.02, 0]} scale={ring}>
          <torusGeometry args={[1.8, 0.16, 32, 128]} />
          <meshStandardMaterial color={C.ok} emissive={C.ok} emissiveIntensity={0.8} toneMapped={false} />
        </mesh>
      ) : null}

      {/* حد الشحن */}
      {vis(f, "limit") > 0 ? <Shield position={[2.3, 1.0, 0.6]} rotation={[0.1, -0.5 + Math.sin(f / 30) * 0.25, 0]} scale={1.15 * ease(lp(f, "limit"), 50, 20, BACK) * (1 - ease(f, SEG.limit[1] - 10, 12, OUT))} /> : null}

      {/* الخلاصة: 4 عناصر */}
      {sumOn(0) > 0 ? <Thermometer level={0.25} color={C.cool} position={[2.25, 1.45, 0]} rotation={[0, f * 0.02, 0]} scale={0.42 * sumOn(0)} /> : null}
      {sumOn(1) > 0 ? (
        <Phone position={[-2.25, 1.35, 0]} rotation={[0.1, 0.5 + Math.sin(f / 25) * 0.2, 0.05]} scale={0.36 * sumOn(1)} caseOn={0.55} draw={(g, w, h) => bgGrad(g, w, h, "#16181E", "#07080B")} />
      ) : null}
      {sumOn(2) > 0 ? <BatteryCell level={0.6} r={0.55} h={1.9} position={[2.25, -1.75, 0]} rotation={[0.2, f * 0.02, 0]} scale={sumOn(2)} /> : null}
      {sumOn(3) > 0 ? <Shield position={[-2.25, -1.7, 0]} rotation={[0.1, f * 0.02, 0]} scale={0.68 * sumOn(3)} /> : null}

      {/* حلقة خلف الجوال في الختام */}
      {k === "end" ? (
        <mesh position={[0, 1.3, -1.5]} rotation={[0, 0, f * 0.01]} scale={ease(lp(f, "end"), 20, 30, OUT)}>
          <torusGeometry args={[3.0, 0.05, 16, 160]} />
          <meshBasicMaterial color={new THREE.Color("#2BD4C4")} toneMapped={false} />
        </mesh>
      ) : null}
    </ThreeCanvas>
  );
};

export { BODY, EN, levelColor };
