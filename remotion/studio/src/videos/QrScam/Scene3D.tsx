import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { staticFile } from "remotion";
import * as THREE from "three";
import { Magnifier } from "../../lib/three3d/Fake";
import { BankCard } from "../../lib/three3d/Pay";
import { Phone, ScreenDraw, useImage } from "../../lib/three3d/Phone";
import { Check3D } from "../../lib/three3d/Fake";
import { Shield } from "../../lib/three3d/Parts";
import { Draw, FakeSticker, QrPlate, ScanSweep, drawQr } from "../../lib/three3d/Qr";
import { FishHook } from "../../lib/three3d/Safety";
import { CameraRig, Lights, StudioEnv } from "../../lib/three3d/Studio";
import { BACK, IN_OUT, OUT, SEG, SegK, ease } from "./theme";

type V3 = [number, number, number];
export const FOV = 30;
const lp = (f: number, k: SegK) => f - SEG[k][0];
export const cur = (f: number): SegK => (Object.keys(SEG) as SegK[]).find((k) => f >= SEG[k][0] && f < SEG[k][1]) ?? "end";
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const AR = "'IBM Plex Sans Arabic', 'Space Grotesk'";

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

/* ───── رسومات الوجوه ───── */
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

/** وجه اللوحة الرسمية: رأس بالعربي، الكود بالمنتصف، وتذييل */
const plateFace: Draw = (g, w, h) => {
  g.fillStyle = "#12315E";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#FFC400";
  g.fillRect(0, 0, w, 16);
  T(g, "ادفع بالجوال", w / 2, 108, `800 56px ${AR}`, "#FFFFFF");
  T(g, "موقف رسمي", w / 2, 150, `700 28px ${AR}`, "#FFC400");
  drawQr(g, 60, 170, 480, 1);
  T(g, "امسح الكود للدفع", w / 2, 730, `700 40px ${AR}`, "#FFFFFF");
  T(g, "مثال توضيحي", w / 2, 786, `600 24px ${AR}`, "rgba(255,255,255,.55)");
};

/** الجوال: viewfinder ثم صفحة دفع مزيّفة */
const phoneScreen =
  (mode: "cam" | "page" | "avatar", t = 0, avatar: HTMLImageElement | null = null): ScreenDraw =>
  (g, w, h) => {
    if (mode === "avatar") {
      const gr = g.createLinearGradient(0, 0, w, h);
      gr.addColorStop(0, "#3A2F12");
      gr.addColorStop(1, "#0C0A06");
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
      if (avatar) {
        g.save();
        g.beginPath();
        g.arc(w / 2, h / 2 - 60, 210, 0, Math.PI * 2);
        g.fillStyle = "#FFC400";
        g.fill();
        g.clip();
        const s = 470 / avatar.width;
        g.drawImage(avatar, w / 2 - (avatar.width * s) / 2, h / 2 - 60 - 210, avatar.width * s, avatar.height * s);
        g.restore();
      }
      T(g, "تأكد قبل ما تصوّر", w / 2, h / 2 + 330, `800 34px ${AR}`, "#FFC400");
      return;
    }
    if (mode === "cam") {
      g.fillStyle = "#101418";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#fff";
      g.font = "700 22px 'Space Grotesk'";
      g.direction = "ltr";
      g.textAlign = "left";
      g.fillText("9:41", 44, 66);
      g.strokeStyle = "#FFC400";
      g.lineWidth = 8;
      const s = 330;
      const x = (w - s) / 2;
      const y = 340;
      [
        [x, y + 70, x, y, x + 70, y],
        [x + s - 70, y, x + s, y, x + s, y + 70],
        [x, y + s - 70, x, y + s, x + 70, y + s],
        [x + s - 70, y + s, x + s, y + s, x + s, y + s - 70],
      ].forEach(([a, b, c, d, e, f]) => {
        g.beginPath();
        g.moveTo(a, b);
        g.lineTo(c, d);
        g.lineTo(e, f);
        g.stroke();
      });
      drawQr(g, x + 30, y + 30, s - 60, 7, "#fff", "#101418");
      T(g, "وجّه الكاميرا للكود", w / 2, 840, `700 30px ${AR}`, "#fff");
      return;
    }
    // صفحة مزيّفة
    g.fillStyle = "#F4F5F7";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#111";
    g.font = "700 22px 'Space Grotesk'";
    g.direction = "ltr";
    g.textAlign = "left";
    g.fillText("9:41", 44, 66);
    rr(g, 30, 96, w - 60, 62, 31, "#fff");
    g.font = "700 26px 'Space Grotesk'";
    g.fillStyle = "#333";
    g.fillText("park", 70, 136);
    const w1 = g.measureText("park").width;
    g.fillStyle = "#E11D2E";
    g.fillText("1", 70 + w1, 136);
    const w2 = g.measureText("1").width;
    g.fillStyle = "#333";
    g.fillText("ng-pay.example", 70 + w1 + w2, 136);
    rr(g, 30, 200, w - 60, 330, 24, "#fff");
    T(g, "ادفع غرامة الموقف الحين", w / 2, 270, `800 32px ${AR}`, "#111");
    rr(g, 60, 310, w - 120, 64, 14, "#EEF0F3");
    T(g, "رقم البطاقة", w - 80, 352, `600 24px ${AR}`, "#777", "right");
    rr(g, 60, 394, (w - 140) / 2, 64, 14, "#EEF0F3");
    rr(g, 80 + (w - 140) / 2, 394, (w - 140) / 2, 64, 14, "#EEF0F3");
    rr(g, 60, 560, w - 120, 84, 18, t > 6 ? "#E11D2E" : "#FFC400");
    T(g, "ادفع", w / 2, 616, `800 36px ${AR}`, "#111");
    T(g, "مثال توضيحي", w / 2, 840, `600 22px ${AR}`, "#999");
  };

const cardFace: Draw = (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, "#FFC400");
  gr.addColorStop(1, "#B8860B");
  g.fillStyle = gr;
  g.beginPath();
  g.roundRect(0, 0, w, h, 34);
  g.fill();
  g.fillStyle = "#14161A";
  g.font = "700 62px 'Space Grotesk'";
  g.direction = "ltr";
  g.textAlign = "left";
  g.fillText("•••• •••• •••• 2261", 50, h * 0.72);
  g.font = "700 34px 'Space Grotesk'";
  g.fillText("BANK", 50, 90);
};

/* ───── مواضع ثابتة (للملصقات) ───── */
export const PLATE_S: Partial<Record<SegK, { p: V3; s: number }>> = {
  real: { p: [0, -0.1, 0], s: 1.0 },
  sticker: { p: [-1.5, 0.1, 0], s: 0.85 },
  scan: { p: [-1.8, 0.3, 0], s: 0.72 },
  check: { p: [-1.55, 0.1, 0], s: 0.85 },
};
export const PHONE_P: V3 = [1.7, -1.0, 0.6];
export const HOOK_P: V3 = [1.7, 1.6, 0.6];

export const Scene3D: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const k = cur(f);
  const l = lp(f, k);
  const avatar = useImage(staticFile("avatar.png"));
  const cam = camAt(f);
  const nodes: React.ReactNode[] = [];
  const key = (n: string) => n;

  /* ── hook + real ── */
  if (k === "hook" && l > 70) {
    const p = ease(l, 70, 50, OUT);
    nodes.push(
      <group key={key("hp")} position={[0, -6 + p * 6, 0.5]} rotation={[0, -0.25 + p * 0.25, 0]} scale={0.9}>
        <QrPlate draw={plateFace} />
      </group>,
    );
  }
  if (k === "real") {
    const s = PLATE_S.real!;
    const inn = ease(l, 0, 24, OUT);
    const out = ease(l, 196, 20, IN_OUT);
    nodes.push(
      <group key={key("rp")} position={[s.p[0], s.p[1] + out * -7, s.p[2]]} rotation={[0.02, Math.sin(l / 55) * 0.2 - 0.05, 0]} scale={s.s * (0.9 + 0.1 * inn)}>
        <QrPlate draw={plateFace} />
      </group>,
    );
  }

  /* ── sticker: الملصق المزيّف يطير ويلصق ── */
  if (k === "sticker" || k === "scan" || k === "check") {
    const s = PLATE_S[k]!;
    const inn = ease(l, 0, 24, OUT);
    const wob = Math.sin(l / 60) * 0.1;
    let stickerPos: V3 = [0, 0, 0.095];
    let stickerRot: V3 = [0, 0, 0];
    let peel = 0;
    let stickerScale = 1;
    if (k === "sticker") {
      const fly = ease(l, 40, 56, IN_OUT);
      stickerPos = lerp3([4.2, 2.6, 3.4], [0, 0, 0.095], fly);
      stickerRot = [lerp(0.5, 0, fly), lerp(-0.9, 0, fly), lerp(0.7, 0, fly)];
      stickerScale = lerp(1.5, 1, fly);
    }
    if (k === "check") peel = ease(l, 70, 60, IN_OUT);
    const out = ease(l, 262, 22, IN_OUT);
    nodes.push(
      <group key={key("pl")} position={[s.p[0] - (1 - inn) * 5, s.p[1] - out * 7, s.p[2]]} rotation={[0.02, 0.12 + wob * (k === "check" ? 0.4 : 1), 0]} scale={s.s}>
        <QrPlate draw={plateFace} />
        <group position={stickerPos} rotation={stickerRot} scale={stickerScale}>
          <FakeSticker seed={7} peel={peel} />
        </group>
        {k === "scan" && l > 20 && l < 150 ? <ScanSweep position={[0, 0, 0.2]} t={((l - 20) / 40) % 1} w={2.5} h={2.5} /> : null}
      </group>,
    );
  }

  /* ── scan: الجوال + البطاقة + الخطّاف ── */
  if (k === "scan") {
    const inn = ease(l, 0, 26, OUT);
    const out = ease(l, 262, 22, IN_OUT);
    const page = l >= 110;
    nodes.push(
      <Phone key={key("ph")} position={[PHONE_P[0] + (1 - inn) * 5, PHONE_P[1] - out * 7, PHONE_P[2]]} rotation={[0.04, -0.35, 0]} scale={0.58} draw={phoneScreen(page ? "page" : "cam", l - 110)} frame="#3B3F4A" />,
    );
    const hookIn = ease(l, 130, 40, IN_OUT);
    const grab = ease(l, 176, 40, IN_OUT);
    const hookAt = HOOK_P;
    if (l > 120) {
      const cardP = lerp3([PHONE_P[0], PHONE_P[1] + 0.5, PHONE_P[2] + 0.5], [HOOK_P[0], HOOK_P[1] - 1.0, HOOK_P[2]], ease(l, 150, 50, IN_OUT));
      const cardOn = ease(l, 144, 14, OUT) * (1 - out);
      nodes.push(
        <group key={key("cd")} position={[cardP[0], cardP[1] - out * 7, cardP[2]]} rotation={[0, -0.2, 0.2 - grab * 0.3]} scale={0.5 * cardOn}>
          <BankCard draw={cardFace} chip={false} />
        </group>,
      );
      nodes.push(
        <group key={key("hk")} position={[hookAt[0], hookAt[1] - out * 7, hookAt[2]]} scale={0.55 * hookIn}>
          <FishHook color="#FF4136" line={0.5} />
        </group>,
      );
    }
  }

  /* ── check: عدسة مكبّرة ── */
  if (k === "check") {
    const s = PLATE_S.check!;
    const mIn = ease(l, 20, 26, BACK);
    const out = ease(l, 262, 22, IN_OUT);
    const mp = lerp3([s.p[0] + 1.3, s.p[1] - 0.2, 1.8], [s.p[0] + 1.1, s.p[1] - 1.0, 1.9], ease(l, 50, 60, IN_OUT));
    nodes.push(
      <group key={key("mg")} position={[mp[0], mp[1] - out * 7, mp[2]]} rotation={[0, 0.1, 0]} scale={0.7 * mIn}>
        <Magnifier />
      </group>,
    );
  }

  /* ── act: درع وصح ── */
  if (k === "act") {
    const inn = ease(l, 0, 30, BACK);
    const out = ease(l, 262, 22, IN_OUT);
    nodes.push(
      <group key={key("sh")} position={[-1.7, 0.1 - out * 7, 0]} rotation={[0.04, 0.3 + Math.sin(l / 60) * 0.08, 0]} scale={0.8 * inn}>
        <Shield color="#19C37D" scale={1.4} />
        <Check3D position={[0, 0.05, 0.6]} scale={1.3} color="#FFFFFF" />
      </group>,
    );
  }

  /* ── end: صورة علي ── */
  if (k === "end") {
    const phoneIn = ease(f, SEG.end[0] + 6, 40, OUT);
    nodes.push(
      <Phone key={key("ep")} position={lerp3([0, -7, 3.2], [0, 0.15, 3.2], phoneIn)} rotation={[0.04, Math.sin(l / 50) * 0.12, 0]} scale={0.68} draw={phoneScreen("avatar", 0, avatar)} frame="#3B3F4A" />,
    );
  }

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <ThreeCanvas width={1080} height={1920} camera={{ fov: FOV, position: [0, 0.3, 22] }}>
        <StudioEnv intensity={0.8} />
        <Lights key1="#FFF3D6" rim={k === "scan" ? "#FF5A4E" : "#FFC400"} rim2={k === "act" ? "#19C37D" : "#5FA8FF"} k={2.0 + kick * 0.3} r={58} />
        <CameraRig pos={cam.pos} look={cam.look} />
        {nodes}
      </ThreeCanvas>
    </div>
  );
};
