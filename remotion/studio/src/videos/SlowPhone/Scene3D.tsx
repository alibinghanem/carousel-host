import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { staticFile } from "remotion";
import * as THREE from "three";
import { Heat, Thermometer } from "../../lib/three3d/Parts";
import { Phone, ScreenDraw, useImage } from "../../lib/three3d/Phone";
import { CycleArrow, DownArrow, SpeedDial, StorageTank } from "../../lib/three3d/Speed";
import { CameraRig, Lights, StudioEnv } from "../../lib/three3d/Studio";
import { SEG, SegK, ease, IN_OUT, OUT } from "./theme";

type V3 = [number, number, number];
export const FOV = 30;
const KEYS = Object.keys(SEG) as SegK[];
export const lp = (f: number, k: SegK) => f - SEG[k][0];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const AR = "'IBM Plex Sans Arabic', 'Space Grotesk'";

/** مفاتيح لكل مقطع: القيمة تنتقل من مقطع للتالي بسلاسة قبل بدايته بـ 18 فريم */
const track = <T,>(f: number, vals: Record<SegK, T>, mix: (a: T, b: T, t: number) => T): T => {
  let v = vals[KEYS[0]];
  for (let i = 1; i < KEYS.length; i++) {
    const t = ease(f, SEG[KEYS[i]][0] - 18, 32, IN_OUT);
    if (t <= 0) break;
    v = mix(vals[KEYS[i - 1]], vals[KEYS[i]], t);
  }
  return v;
};
const n1 = (f: number, vals: Record<SegK, number>) => track(f, vals, lerp);
const v3 = (f: number, vals: Record<SegK, V3>) => track(f, vals, lerp3);

/* ───── الكاميرا (مشتركة مع طبقة HTML) ───── */
export const camAt = (f: number): { pos: V3; look: V3 } => ({ pos: [Math.sin(f / 100) * 0.25, 0.3 + Math.sin(f / 150) * 0.1, 22], look: [0, 0, 0] });
const projCam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 500);
export const projectW = (f: number, p: V3): [number, number] => {
  const c = camAt(f);
  projCam.position.set(...c.pos);
  projCam.lookAt(...c.look);
  projCam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(projCam);
  return [((v.x + 1) / 2) * 1080, ((1 - v.y) / 2) * 1920];
};

/* ───── مواقع العناصر ───── */
export const PHONE_P: Record<SegK, V3> = {
  hook: [-1.55, -0.25, 0.6],
  storage: [-2.4, -0.2, 0.6],
  restart: [-1.55, -0.2, 0.6],
  update: [-1.55, -0.2, 0.6],
  heat: [-2.45, -0.15, 0.6],
  sum: [-1.55, -3.4, 0.6],
  end: [0, -0.05, 1.3],
};
const PHONE_S: Record<SegK, number> = { hook: 0.62, storage: 0.46, restart: 0.62, update: 0.62, heat: 0.52, sum: 0.0001, end: 0.66 };
export const DIAL_P: Record<SegK, V3> = {
  hook: [1.55, -0.15, 0.3],
  storage: [4.5, -0.15, 0.3],
  restart: [4.5, -0.15, 0.3],
  update: [4.5, -0.15, 0.3],
  heat: [4.5, -0.15, 0.3],
  sum: [0, 0.55, 0.8],
  end: [0, -4, 0.3],
};
const DIAL_S: Record<SegK, number> = { hook: 0.92, storage: 0.0001, restart: 0.0001, update: 0.0001, heat: 0.0001, sum: 1.25, end: 0.0001 };

/* ───── رسومات الشاشة ───── */
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
const status = (g: CanvasRenderingContext2D, color = "#fff") => {
  g.fillStyle = color;
  g.font = "700 22px 'Space Grotesk'";
  g.direction = "ltr";
  g.textAlign = "left";
  g.fillText("9:41", 44, 66);
};
const APPS = ["#3DD6F5", "#FF5C8A", "#B6F24A", "#FFA23A", "#8B6CFF", "#2BD47D", "#FF4B3E", "#4F8BFF", "#E9EEF2", "#F5C518", "#3DD6F5", "#FF5C8A"];
const homeGrid = (g: CanvasRenderingContext2D, w: number, y0: number, dim = 1) => {
  APPS.forEach((c, i) => {
    const x = 50 + (i % 3) * 160;
    const y = y0 + Math.floor(i / 3) * 150;
    g.globalAlpha = dim;
    rr(g, x, y, 120, 120, 30, c);
    g.globalAlpha = 1;
  });
  void w;
};

const hookScreen = (f: number): ScreenDraw => (g, w, h) => {
  g.fillStyle = "#0B1A1D";
  g.fillRect(0, 0, w, h);
  status(g);
  homeGrid(g, w, 130, 0.55);
  g.fillStyle = "rgba(0,0,0,.55)";
  g.fillRect(0, 0, w, h);
  // دوّامة تحميل متقطّعة
  const a = Math.floor(f / 5) * 0.9;
  g.strokeStyle = "rgba(255,255,255,.2)";
  g.lineWidth = 16;
  g.beginPath();
  g.arc(w / 2, 560, 90, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = "#FF4B3E";
  g.lineCap = "round";
  g.beginPath();
  g.arc(w / 2, 560, 90, a, a + 1.6);
  g.stroke();
  T(g, "يعلّق…", w / 2, 760, "800 44px 'IBM Plex Sans Arabic'", "#fff");
};
const storageScreen = (fill: number): ScreenDraw => (g, w, h) => {
  g.fillStyle = "#0B1A22";
  g.fillRect(0, 0, w, h);
  status(g);
  T(g, "التخزين", w - 40, 150, `800 46px ${AR}`, "#fff", "right");
  rr(g, 40, 210, w - 80, 56, 28, "rgba(255,255,255,.14)");
  const full = fill > 0.8;
  const segs = ["#FF5C8A", "#8B6CFF", "#3DD6F5", "#FFA23A"];
  let x = 40;
  const tot = (w - 80) * fill;
  segs.forEach((c, i) => {
    const sw = (tot * [0.34, 0.3, 0.22, 0.14][i]);
    rr(g, x, 210, Math.max(0, sw), 56, 28, c);
    x += sw;
  });
  T(g, full ? "ممتلئ تقريباً" : "فيه مساحة", w - 40, 340, `800 40px ${AR}`, full ? "#FF4B3E" : "#B6F24A", "right");
  [
    ["صور", "#FF5C8A"],
    ["فيديو", "#8B6CFF"],
    ["تطبيقات", "#3DD6F5"],
    ["ملفات مؤقتة", "#FFA23A"],
  ].forEach(([t, c], i) => {
    g.fillStyle = c;
    g.beginPath();
    g.arc(w - 56, 440 + i * 90, 16, 0, Math.PI * 2);
    g.fill();
    T(g, t, w - 90, 452 + i * 90, `700 34px ${AR}`, "#E7F0F2", "right");
  });
  T(g, "واجهة توضيحية", w / 2, h - 70, `600 22px ${AR}`, "rgba(255,255,255,.4)");
};
/** l: فريمات منذ بداية المقطع: تشغيل ← شاشة سوداء ← حلقة إقلاع ← الرئيسية */
const restartScreen = (l: number): ScreenDraw => (g, w, h) => {
  const phase = l < 60 ? 0 : l < 120 ? 1 : l < 190 ? 2 : 3;
  if (phase === 3) {
    g.fillStyle = "#0B1A1D";
    g.fillRect(0, 0, w, h);
    status(g);
    homeGrid(g, w, 130, 1);
    T(g, "جاهز", w / 2, 860, `800 44px ${AR}`, "#B6F24A");
    return;
  }
  g.fillStyle = "#020506";
  g.fillRect(0, 0, w, h);
  if (phase === 0) {
    T(g, "إطفاء", w / 2, 560, `800 52px ${AR}`, "#fff");
  }
  if (phase === 2) {
    const a = (l - 120) * 0.14;
    g.strokeStyle = "rgba(255,255,255,.18)";
    g.lineWidth = 14;
    g.beginPath();
    g.arc(w / 2, 560, 80, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = "#B6F24A";
    g.lineCap = "round";
    g.beginPath();
    g.arc(w / 2, 560, 80, a, a + 1.8);
    g.stroke();
  }
};
const updateScreen = (p: number): ScreenDraw => (g, w, h) => {
  g.fillStyle = "#08121F";
  g.fillRect(0, 0, w, h);
  status(g);
  T(g, "تحديث النظام", w / 2, 360, `800 46px ${AR}`, "#fff");
  rr(g, 70, 470, w - 140, 26, 13, "rgba(255,255,255,.16)");
  rr(g, 70, 470, (w - 140) * p, 26, 13, "#3DD6F5");
  g.font = "800 80px 'Space Grotesk'";
  g.fillStyle = p >= 1 ? "#B6F24A" : "#fff";
  g.textAlign = "center";
  g.direction = "ltr";
  g.fillText(`${Math.round(p * 100)}%`, w / 2, 640);
  T(g, p >= 1 ? "آخر إصدار ✓" : "جاري التنزيل", w / 2, 730, `700 34px ${AR}`, p >= 1 ? "#B6F24A" : "#9FB8C6");
  T(g, "واجهة توضيحية", w / 2, h - 70, `600 22px ${AR}`, "rgba(255,255,255,.4)");
};
const heatScreen = (t: number): ScreenDraw => (g, w, h) => {
  g.fillStyle = t > 0.5 ? "#2A0E08" : "#0B1D1B";
  g.fillRect(0, 0, w, h);
  status(g);
  T(g, t > 0.5 ? "الجوال سخن" : "حرارة طبيعية", w / 2, 380, `800 46px ${AR}`, t > 0.5 ? "#FF9F1C" : "#B6F24A");
  rr(g, 70, 470, w - 140, 26, 13, "rgba(255,255,255,.16)");
  rr(g, 70, 470, (w - 140) * Math.max(0.05, t), 26, 13, t > 0.5 ? "#FF4B3E" : "#B6F24A");
  T(g, "البطارية", w - 70, 640, `700 34px ${AR}`, "#E7F0F2", "right");
  rr(g, 70, 670, w - 140, 26, 13, "rgba(255,255,255,.16)");
  rr(g, 70, 670, (w - 140) * 0.62, 26, 13, "#FFA23A");
  T(g, "واجهة توضيحية", w / 2, h - 70, `600 22px ${AR}`, "rgba(255,255,255,.4)");
};
const avatarScreen = (avatar: HTMLImageElement | null): ScreenDraw => (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, "#1D3A3D");
  gr.addColorStop(1, "#061214");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  if (avatar) {
    g.save();
    g.beginPath();
    g.arc(w / 2, h / 2 - 60, 210, 0, Math.PI * 2);
    g.fillStyle = "#B6F24A";
    g.fill();
    g.clip();
    const s = 470 / avatar.width;
    g.drawImage(avatar, w / 2 - (avatar.width * s) / 2, h / 2 - 60 - 210, avatar.width * s, avatar.height * s);
    g.restore();
  }
  T(g, "جوال سريع", w / 2, h / 2 + 330, `800 38px ${AR}`, "#B6F24A");
};

export const dialV = (f: number) => {
  if (f < SEG.sum[0]) return 0.1 + (f > 140 ? 0.05 * ease(f, 140, 40) : 0) + Math.sin(f * 1.7) * 0.015 * (f < 100 ? 1 : 0.3);
  return lerp(0.12, 0.93, ease(f, SEG.sum[0] + 6, 70, OUT));
};
export const tankFill = (f: number) => {
  const l = f - SEG.storage[0];
  if (f < SEG.storage[0] - 20) return 0.97;
  if (l < 120) return 0.97;
  return lerp(0.97, 0.34, ease(l, 150, 110, IN_OUT));
};

const Sphere: React.FC<{ f: number; avatar: HTMLImageElement | null }> = ({ f, avatar }) => {
  const [aS, aE] = SEG.restart;
  const lr = f - aS;
  const upd = ease(f - SEG.update[0], 40, 130, IN_OUT);
  const heatT = f < SEG.heat[0] ? 0.8 : lerp(0.9, 0.12, ease(f - SEG.heat[0], 120, 100, IN_OUT));
  const key = f >= SEG.end[0] - 10 ? "end" : f >= SEG.heat[0] - 10 ? "heat" : f >= SEG.update[0] - 10 ? "update" : f >= aS - 10 ? "restart" : f >= SEG.storage[0] - 10 ? "storage" : "hook";
  void aE;
  let draw: ScreenDraw = hookScreen(f);
  if (key === "storage") draw = storageScreen(tankFill(f));
  if (key === "restart") draw = restartScreen(lr);
  if (key === "update") draw = updateScreen(upd);
  if (key === "heat") draw = heatScreen(heatT);
  if (key === "end") draw = avatarScreen(avatar);
  const pp = v3(f, PHONE_P);
  const ps = n1(f, PHONE_S);
  const dp = v3(f, DIAL_P);
  const ds = n1(f, DIAL_S);
  const sway = Math.sin(f / 70) * 0.06;
  const tankS = f >= SEG.storage[0] - 40 && f < SEG.restart[0] + 10 ? ease(f, SEG.storage[0] - 24, 26, OUT) * (1 - ease(f, SEG.storage[1] - 20, 20)) : 0;
  const cycS = ease(f, SEG.restart[0] + 80, 20, OUT) * (1 - ease(f, SEG.restart[1] - 24, 20));
  const downS = ease(f, SEG.update[0] + 20, 24, OUT) * (1 - ease(f, SEG.update[1] - 24, 20));
  const thS = ease(f, SEG.heat[0] + 20, 26, OUT) * (1 - ease(f, SEG.heat[1] - 24, 20));
  const heatOn = thS * (f < SEG.heat[0] + 220 ? 1 : 1 - ease(f, SEG.heat[0] + 220, 40));
  return (
    <>
      <group position={pp} scale={ps} rotation={[0.03, 0.22 + sway - (key === "end" ? 0.22 : 0), 0.02]}>
        <Phone draw={draw} frame="#4A5A5D" />
      </group>
      <group position={dp} scale={ds}>
        <SpeedDial v={dialV(f)} />
      </group>
      {tankS > 0.001 ? (
        <group position={[-0.7, -0.15, 0.3]} scale={0.85 * tankS} rotation={[0, 0.2, 0]}>
          <StorageTank fill={tankFill(f)} f={f} shake={f < SEG.storage[0] + 120 ? 1 : 0} />
        </group>
      ) : null}
      {cycS > 0.001 ? (
        <group position={[pp[0], pp[1] + 0.1, pp[2] + 0.9]} scale={cycS}>
          <group rotation={[0, 0, -(lr - 80) * 0.11]}>
            <CycleArrow arc={Math.PI * 1.55} R={0.85} />
          </group>
        </group>
      ) : null}
      {downS > 0.001 ? (
        <group position={[-0.62, 0.45 + Math.sin(f / 12) * 0.12, 0.6]} scale={0.5 * downS}>
          <DownArrow />
        </group>
      ) : null}
      {thS > 0.001 ? (
        <>
          <group position={[-0.55, -0.2, 0.5]} scale={0.62 * thS}>
            <Thermometer level={heatT} color={heatT > 0.5 ? "#FF4B3E" : "#B6F24A"} />
          </group>
          <group position={[pp[0] - 0.2, pp[1] - 0.6, pp[2]]}>
            <Heat f={f} on={heatOn * (heatT > 0.5 ? 1 : 0.3)} w={1.6} base={0} height={2.6} n={22} />
          </group>
        </>
      ) : null}
    </>
  );
};

export const Scene3D: React.FC<{ f: number; kick: number }> = ({ f }) => {
  const avatar = useImage(staticFile("avatar.png"));
  const c = camAt(f);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <ThreeCanvas width={1080} height={1920} camera={{ fov: FOV, position: c.pos }}>
        <StudioEnv intensity={0.9} />
        <Lights key1="#F3FFF0" rim="#3DD6F5" rim2="#B6F24A" k={2.2} r={58} />
        <CameraRig pos={c.pos} look={c.look} />
        <Sphere f={f} avatar={avatar} />
      </ThreeCanvas>
    </div>
  );
};
