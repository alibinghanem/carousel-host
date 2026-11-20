import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { staticFile } from "remotion";
import * as THREE from "three";
import { CellTower3D, GroundSlab } from "../../lib/three3d/Cell";
import { Stopwatch3D } from "../../lib/three3d/Door";
import { Phone, ScreenDraw, useImage } from "../../lib/three3d/Phone";
import { Building } from "../../lib/three3d/Sky";
import { Arc, WifiArcs } from "../../lib/three3d/Wifi";
import { CameraRig, Lights, StudioEnv } from "../../lib/three3d/Studio";
import { C, SEG, SegK, ease, OUT } from "./theme";

type V3 = [number, number, number];
export const FOV = 30;
const AR = "'IBM Plex Sans Arabic', 'Space Grotesk'";

export const camAt = (f: number): { pos: V3; look: V3 } => ({ pos: [Math.sin(f / 110) * 0.2, 0.35 + Math.sin(f / 160) * 0.08, 22], look: [0, 0.35, 0] });
const projCam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 500);
export const projectW = (f: number, p: V3): [number, number] => {
  const c = camAt(f);
  projCam.position.set(...c.pos);
  projCam.lookAt(...c.look);
  projCam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(projCam);
  return [((v.x + 1) / 2) * 1080, ((1 - v.y) / 2) * 1920];
};
/** ظهور عنصر خلال مقاطع محددة: يدخل قبل البداية بقليل ويخرج قبل النهاية */
export const vis = (f: number, a: SegK, b: SegK = a) => ease(f, SEG[a][0] - 14, 24, OUT) * (1 - ease(f, SEG[b][1] - 22, 18));

/* ───── ثوابت المشاهد ───── */
export const GROUND_Y = -0.75;
export const TOWER_X = -2.7;
export const TOWER_H = 2.2;
export const ANT: V3 = [TOWER_X, GROUND_Y + TOWER_H - 0.1, 0.4];
export const BUILD_X = 0.95;
export const PHONE_X = 2.75;
const sFor = (r: number, h: number) => Math.min(Math.PI * 0.62, 2 * Math.asin(Math.min(1, h / r)));

/* ───── رسومات الشاشة ───── */
const T = (g: CanvasRenderingContext2D, t: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "center") => {
  g.font = font;
  g.fillStyle = color;
  g.direction = "rtl";
  g.textAlign = align;
  g.fillText(t, x, y);
};
const status = (g: CanvasRenderingContext2D) => {
  g.fillStyle = "#fff";
  g.font = "700 22px 'Space Grotesk'";
  g.direction = "ltr";
  g.textAlign = "left";
  g.fillText("9:41", 44, 66);
};
const pill = (g: CanvasRenderingContext2D, w: number, color: string) => {
  g.fillStyle = color;
  g.beginPath();
  g.roundRect(w - 150, 40, 100, 40, 14);
  g.fill();
  g.fillStyle = "#0C0713";
  g.font = "800 26px 'Space Grotesk'";
  g.direction = "ltr";
  g.textAlign = "center";
  g.fillText("5G", w - 100, 69);
};
const hookScreen = (f: number): ScreenDraw => (g, w, h) => {
  g.fillStyle = "#0E0A18";
  g.fillRect(0, 0, w, h);
  status(g);
  pill(g, w, C.mint);
  const a = f * 0.1;
  g.strokeStyle = "rgba(255,255,255,.18)";
  g.lineWidth = 16;
  g.lineCap = "round";
  g.beginPath();
  g.arc(w / 2, 520, 86, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = C.amb;
  g.beginPath();
  g.arc(w / 2, 520, 86, a, a + 1.5);
  g.stroke();
  T(g, "يحمّل…", w / 2, 700, `800 44px ${AR}`, "#fff");
  T(g, "واجهة توضيحية", w / 2, h - 70, `600 22px ${AR}`, "rgba(255,255,255,.4)");
};
const bandScreen = (color: string, level: number, label: string): ScreenDraw => (g, w, h) => {
  g.fillStyle = "#0E0A18";
  g.fillRect(0, 0, w, h);
  status(g);
  pill(g, w, color);
  const cx = w / 2;
  g.lineCap = "round";
  [3, 2, 1].forEach((i) => {
    g.strokeStyle = i <= level ? color : "rgba(255,255,255,.2)";
    g.lineWidth = 34;
    g.beginPath();
    g.arc(cx, 560, 90 * i, -Math.PI * 0.82, -Math.PI * 0.18);
    g.stroke();
  });
  g.fillStyle = level >= 1 ? color : "rgba(255,255,255,.2)";
  g.beginPath();
  g.arc(cx, 560, 28, 0, Math.PI * 2);
  g.fill();
  T(g, label, cx, 800, `800 52px ${AR}`, color);
  T(g, "واجهة توضيحية", cx, h - 70, `600 22px ${AR}`, "rgba(255,255,255,.4)");
};
const avatarScreen = (avatar: HTMLImageElement | null): ScreenDraw => (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, "#2A1A3D");
  gr.addColorStop(1, "#0C0713");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  if (avatar) {
    g.save();
    g.beginPath();
    g.arc(w / 2, h / 2 - 60, 210, 0, Math.PI * 2);
    g.fillStyle = C.mint;
    g.fill();
    g.clip();
    const s = 470 / avatar.width;
    g.drawImage(avatar, w / 2 - (avatar.width * s) / 2, h / 2 - 60 - 210, avatar.width * s, avatar.height * s);
    g.restore();
  }
  T(g, "إشارة تفرق", w / 2, h / 2 + 330, `800 38px ${AR}`, C.mint);
};

/* أقواس الموجات لكل نطاق */
const lowArcs = (k: number): Arc[] =>
  [1.0, 2.0, 3.0, 4.0, 5.1].map((r, i) => ({ r, o: Math.min(1, k * 3 - i * 0.55) * (0.95 - i * 0.12), c: C.amb, w: 0.1, s: sFor(r, 0.8) }));
const midArcs = (k: number): Arc[] =>
  [0.8, 1.45, 2.1, 2.75, 3.4].map((r, i) => ({ r, o: Math.min(1, k * 3 - i * 0.5) * (0.95 - i * 0.12), c: C.mint, w: 0.07, s: sFor(r, 0.8) }));
const highArcs = (k: number): Arc[] =>
  [0.5, 0.8, 1.1, 1.4, 1.7, 2.0, 2.3].map((r, i) => ({ r, o: Math.min(1, k * 3 - i * 0.4) * (0.95 - i * 0.06), c: C.pink, w: 0.04, s: sFor(r, 0.8) }));
/** ما بعد المبنى: خافتة جداً */
const highBlocked = (k: number): Arc[] => [3.3, 3.9].map((r, i) => ({ r, o: Math.min(1, k * 3 - 2.2) * 0.18, c: "#7A3A6B", w: 0.03, s: sFor(r, 0.9) + i * 0 }));

export const dialPhase = (f: number, k: SegK) => ease(f - SEG[k][0], 20, 70, OUT);

const World: React.FC<{ f: number; avatar: HTMLImageElement | null }> = ({ f, avatar }) => {
  const hookV = vis(f, "hook");
  const speedV = vis(f, "speed");
  const bandV = (k: SegK) => vis(f, k);
  const sumV = vis(f, "sum");
  const endV = ease(f, SEG.end[0] - 14, 26, OUT);
  const towerV = Math.max(bandV("low"), bandV("mid"), bandV("high"));
  const lowK = dialPhase(f, "low");
  const midK = dialPhase(f, "mid");
  const highK = dialPhase(f, "high");
  const barT = ease(f - SEG.speed[0], 24, 60, OUT);
  const sway = Math.sin(f / 70) * 0.05;
  return (
    <>
      {/* الهوك: جوال بـ 5G يحمّل */}
      {hookV > 0.001 ? (
        <group position={[0, -0.2, 0.6]} scale={0.64 * hookV} rotation={[0.03, 0.22 + sway, 0.02]}>
          <Phone draw={hookScreen(f)} frame="#4A4560" />
        </group>
      ) : null}
      {/* السرعة: أعمدة 4G مقابل 5G (أهداف على الورق) وساعة توقيت */}
      {speedV > 0.001 ? (
        <group scale={speedV} position={[0, GROUND_Y, 0.2]}>
          <GroundSlab w={7.6} d={2.4} />
          <mesh position={[-1.9, 0.075 * barT + 0.0, 0.6]}>
            <boxGeometry args={[0.9, 0.15 * barT + 0.001, 0.9]} />
            <meshStandardMaterial color="#9A8FB5" roughness={0.45} />
          </mesh>
          <mesh position={[-0.55, 1.5 * barT, 0.6]}>
            <boxGeometry args={[0.9, 3.0 * barT + 0.001, 0.9]} />
            <meshStandardMaterial color={C.mint} emissive={C.mint} emissiveIntensity={0.35} roughness={0.35} toneMapped={false} />
          </mesh>
          <group position={[2.0, 1.3, 0.6]} rotation={[0.05, -0.2, 0]} scale={1.15}>
            <Stopwatch3D rot={-1.3 + ease(f - SEG.speed[0], 120, 60, OUT) * 4.2} ring={C.amb} />
          </group>
        </group>
      ) : null}
      {/* أبراج النطاقات */}
      {towerV > 0.001 ? (
        <group scale={towerV} position={[0, 0, 0]}>
          <GroundSlab position={[0, GROUND_Y, 0.2]} w={8.2} d={2.4} />
          <CellTower3D position={[TOWER_X, GROUND_Y, 0.2]} H={TOWER_H} beacon={0.5 + 0.5 * Math.sin(f / 8)} />
          {bandV("low") > 0.001 ? <WifiArcs position={ANT} arcs={lowArcs(lowK)} /> : null}
          {bandV("mid") > 0.001 ? <WifiArcs position={ANT} arcs={midArcs(midK)} /> : null}
          {bandV("high") > 0.001 ? (
            <>
              <WifiArcs position={ANT} arcs={highArcs(highK)} />
              <WifiArcs position={ANT} arcs={highBlocked(highK)} />
            </>
          ) : null}
          {bandV("high") > 0.001 ? <Building position={[BUILD_X, GROUND_Y, 0.2]} w={1.3} h={2.6} d={1.4} color="#2A3346" seed={3} /> : null}
          {bandV("low") > 0.001 ? (
            <group position={[PHONE_X, GROUND_Y + 0.9, 0.5]} rotation={[0.03, -0.3, 0]} scale={0.3}>
              <Phone draw={bandScreen(C.amb, 2, "نطاق منخفض")} frame="#4A4560" />
            </group>
          ) : null}
          {bandV("mid") > 0.001 ? (
            <group position={[PHONE_X, GROUND_Y + 0.9, 0.5]} rotation={[0.03, -0.3, 0]} scale={0.3}>
              <Phone draw={bandScreen(C.mint, 3, "نطاق متوسط")} frame="#4A4560" />
            </group>
          ) : null}
          {bandV("high") > 0.001 ? (
            <group position={[PHONE_X, GROUND_Y + 0.9, 0.5]} rotation={[0.03, -0.3, 0]} scale={0.3}>
              <Phone draw={bandScreen(C.pink, 0, "خلف المبنى")} frame="#4A4560" />
            </group>
          ) : null}
        </group>
      ) : null}
      {/* الخلاصة: جوال بثلاثة أقواس */}
      {sumV > 0.001 ? (
        <group position={[0, -0.1, 0.6]} scale={0.6 * sumV} rotation={[0.03, 0.2 + sway, 0.02]}>
          <Phone draw={bandScreen(C.mint, 3, "الأنسب لك")} frame="#4A4560" />
        </group>
      ) : null}
      {endV > 0.001 ? (
        <group position={[0, -0.05, 1.3]} scale={0.66 * endV} rotation={[0.03, sway, 0.02]}>
          <Phone draw={avatarScreen(avatar)} frame="#4A4560" />
        </group>
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
        <Lights key1="#FFF1E6" rim="#B79CFF" rim2="#2BD9A4" k={2.2} r={58} />
        <CameraRig pos={c.pos} look={c.look} />
        <World f={f} avatar={avatar} />
      </ThreeCanvas>
    </div>
  );
};
