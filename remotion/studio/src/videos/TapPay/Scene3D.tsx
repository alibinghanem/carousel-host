import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { staticFile } from "remotion";
import * as THREE from "three";
import { BankCard, Draw, Packet, PayTerminal, SecureChip } from "../../lib/three3d/Pay";
import { Phone, ScreenDraw, useImage } from "../../lib/three3d/Phone";
import { FishHook } from "../../lib/three3d/Safety";
import { CameraRig, Lights, StudioEnv } from "../../lib/three3d/Studio";
import { BACK, CODES, IN_OUT, OUT, REAL, SEG, SegK, TOKEN_LAST, ease } from "./theme";

type V3 = [number, number, number];
export const FOV = 30;
const lp = (f: number, k: SegK) => f - SEG[k][0];
export const cur = (f: number): SegK => (Object.keys(SEG) as SegK[]).find((k) => f >= SEG[k][0] && f < SEG[k][1]) ?? "end";
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/* ───── الكاميرا (ثابتة تقريباً، مشتركة مع طبقة HTML) ───── */
export const camAt = (f: number): { pos: V3; look: V3 } => {
  const sway = Math.sin(f / 95) * 0.22;
  return { pos: [sway, 0.4 + Math.sin(f / 140) * 0.1, 24], look: [0, 0.4, 0] };
};
const projCam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 500);
export const projectW = (f: number, p: V3): [number, number] => {
  const c = camAt(f);
  projCam.position.set(...c.pos);
  projCam.lookAt(...c.look);
  projCam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(projCam);
  return [((v.x + 1) / 2) * 1080, ((1 - v.y) / 2) * 1920];
};

/* ───── رسومات الوجوه (canvas) ───── */
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
};
const nfcIcon = (g: CanvasRenderingContext2D, x: number, y: number, s: number, color: string, lw = 6) => {
  g.strokeStyle = color;
  g.lineWidth = lw;
  g.lineCap = "round";
  for (let i = 0; i < 4; i++) {
    g.beginPath();
    g.arc(x - s * 0.6, y, s * (0.25 + i * 0.25), -Math.PI / 3.2, Math.PI / 3.2);
    g.stroke();
  }
};
const scramble = (s: string, t: number) => {
  const digits = s.split("");
  let n = 0;
  const total = digits.filter((d) => d !== " ").length;
  return digits
    .map((d) => {
      if (d === " ") return d;
      n++;
      return n / total <= t ? "•" : d;
    })
    .join("");
};

/** وجه البطاقة: hide 0..1 يحوّل الأرقام لنقاط (الرقم الحقيقي يختفي) */
const cardFace =
  (hide: number): Draw =>
  (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, "#5B3FD9");
    gr.addColorStop(0.55, "#3A2C8F");
    gr.addColorStop(1, "#1C1747");
    g.fillStyle = gr;
    rr(g, 0, 0, w, h, 34);
    g.fill();
    g.globalAlpha = 0.18;
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(w * 0.92, h * 0.05, 300, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = 1;
    g.fillStyle = "#fff";
    g.font = "700 40px 'Space Grotesk'";
    g.textAlign = "right";
    g.fillText("BANK", w - 50, 80);
    nfcIcon(g, w - 70, h * 0.47, 60, "rgba(255,255,255,.85)", 7);
    g.textAlign = "left";
    g.font = "700 62px 'Space Grotesk'";
    g.fillStyle = hide > 0 ? `rgba(255,255,255,${1 - hide * 0.35})` : "#fff";
    g.fillText(scramble(REAL, hide), 50, h * 0.72);
    g.font = "700 30px 'Space Grotesk'";
    g.fillStyle = "rgba(255,255,255,.8)";
    g.fillText("ALI ALTAMIMI", 50, h - 50);
    g.textAlign = "right";
    g.fillText("12/29", w - 50, h - 50);
  };

/** شاشة جهاز الدفع: state = idle | wait | ok | deny */
const termScreen =
  (state: "idle" | "wait" | "ok" | "deny", t = 0): Draw =>
  (g, w, h) => {
    g.fillStyle = state === "deny" ? "#2A0D12" : "#0F1418";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#fff";
    g.textAlign = "center";
    g.font = "700 64px 'Space Grotesk'";
    g.fillText("45.00", w / 2, 130);
    g.font = "700 30px 'Space Grotesk'";
    g.fillStyle = "rgba(255,255,255,.6)";
    g.fillText("SAR", w / 2, 180);
    const cy = 360;
    if (state === "ok") {
      g.fillStyle = "#3DDC97";
      g.beginPath();
      g.arc(w / 2, cy, 110, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#0F1418";
      g.lineWidth = 22;
      g.lineCap = "round";
      g.beginPath();
      g.moveTo(w / 2 - 50, cy);
      g.lineTo(w / 2 - 10, cy + 42);
      g.lineTo(w / 2 + 56, cy - 40);
      g.stroke();
    } else if (state === "deny") {
      g.fillStyle = "#FF4D5E";
      g.beginPath();
      g.arc(w / 2, cy, 110, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#2A0D12";
      g.lineWidth = 22;
      g.lineCap = "round";
      g.beginPath();
      g.moveTo(w / 2 - 45, cy - 45);
      g.lineTo(w / 2 + 45, cy + 45);
      g.moveTo(w / 2 + 45, cy - 45);
      g.lineTo(w / 2 - 45, cy + 45);
      g.stroke();
    } else {
      const a = state === "wait" ? 0.6 + 0.4 * Math.sin(t / 4) : 0.85;
      nfcIcon(g, w / 2 + 40, cy, 120, `rgba(61,220,151,${a})`, 12);
    }
    g.fillStyle = "rgba(255,255,255,.14)";
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 3; c++) {
        rr(g, 70 + c * 150, 540 + r * 70, 120, 52, 14);
        g.fill();
      }
  };

/** شاشة المحفظة في الجوال: mode = wallet | face | done */
const walletScreen =
  (mode: "wallet" | "face" | "done", t = 0, avatar: HTMLImageElement | null = null): ScreenDraw =>
  (g, w, h) => {
    g.fillStyle = "#0B1210";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#fff";
    g.font = "700 22px 'Space Grotesk'";
    g.textAlign = "left";
    g.fillText("9:41", 44, 66);
    g.textAlign = "right";
    g.fillText("5G", w - 44, 66);
    if (avatar) {
      const gr = g.createLinearGradient(0, 0, w, h);
      gr.addColorStop(0, "#3A2C8F");
      gr.addColorStop(1, "#0B1210");
      g.fillStyle = gr;
      g.fillRect(0, 90, w, h);
      g.save();
      g.beginPath();
      g.arc(w / 2, h / 2 - 60, 210, 0, Math.PI * 2);
      g.fillStyle = "#F2C14E";
      g.fill();
      g.clip();
      const s = 470 / avatar.width;
      g.drawImage(avatar, w / 2 - (avatar.width * s) / 2, h / 2 - 60 - 210, avatar.width * s, avatar.height * s);
      g.restore();
      nfcIcon(g, w / 2 + 30, h / 2 + 330, 70, "#3DDC97", 9);
      return;
    }
    // البطاقة داخل المحفظة
    const cx = 50;
    const cy = 150;
    const cw = w - 100;
    const ch = cw * 0.63;
    const gr = g.createLinearGradient(cx, cy, cx + cw, cy + ch);
    gr.addColorStop(0, "#5B3FD9");
    gr.addColorStop(1, "#1C1747");
    g.fillStyle = gr;
    rr(g, cx, cy, cw, ch, 22);
    g.fill();
    g.fillStyle = "#fff";
    g.font = "700 24px 'Space Grotesk'";
    g.textAlign = "right";
    g.fillText("BANK", cx + cw - 26, cy + 46);
    g.textAlign = "left";
    g.font = "700 30px 'Space Grotesk'";
    g.fillText("•••• 2261", cx + 26, cy + ch - 30);
    // رقم الجهاز
    g.fillStyle = "rgba(61,220,151,.12)";
    rr(g, cx, cy + ch + 30, cw, 120, 20);
    g.fill();
    g.direction = "rtl";
    g.textAlign = "right";
    g.fillStyle = "rgba(255,255,255,.7)";
    g.font = "700 26px 'IBM Plex Sans Arabic'";
    g.fillText("رقم الجهاز", cx + cw - 24, cy + ch + 78);
    g.direction = "ltr";
    g.textAlign = "left";
    g.fillStyle = "#3DDC97";
    g.font = "700 40px 'Space Grotesk'";
    g.fillText(`•••• ${TOKEN_LAST}`, cx + 24, cy + ch + 116);
    // الحالة
    const y0 = h - 330;
    if (mode === "face") {
      g.strokeStyle = "#fff";
      g.lineWidth = 9;
      g.lineCap = "round";
      const s = 150;
      const x0 = w / 2 - s / 2;
      const yy = y0 - 40;
      [
        [x0, yy + 40, x0, yy, x0 + 40, yy],
        [x0 + s - 40, yy, x0 + s, yy, x0 + s, yy + 40],
        [x0, yy + s - 40, x0, yy + s, x0 + 40, yy + s],
        [x0 + s - 40, yy + s, x0 + s, yy + s, x0 + s, yy + s - 40],
      ].forEach(([a, b, c, d, e, ff]) => {
        g.beginPath();
        g.moveTo(a, b);
        g.lineTo(c, d);
        g.lineTo(e, ff);
        g.stroke();
      });
      const sy = yy + ((t / 30) % 1) * s;
      g.strokeStyle = "#3DDC97";
      g.beginPath();
      g.moveTo(x0 + 10, sy);
      g.lineTo(x0 + s - 10, sy);
      g.stroke();
      g.direction = "rtl";
      g.textAlign = "center";
      g.fillStyle = "#fff";
      g.font = "700 30px 'IBM Plex Sans Arabic'";
      g.fillText("تأكيد بالوجه أو البصمة", w / 2, yy + s + 70);
    } else if (mode === "done") {
      g.fillStyle = "#3DDC97";
      g.beginPath();
      g.arc(w / 2, y0 + 30, 80, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#0B1210";
      g.lineWidth = 16;
      g.lineCap = "round";
      g.beginPath();
      g.moveTo(w / 2 - 36, y0 + 30);
      g.lineTo(w / 2 - 8, y0 + 60);
      g.lineTo(w / 2 + 40, y0);
      g.stroke();
      g.direction = "rtl";
      g.textAlign = "center";
      g.fillStyle = "#fff";
      g.font = "700 34px 'IBM Plex Sans Arabic'";
      g.fillText("قرّب الجوال من الجهاز", w / 2, y0 + 170);
    } else {
      g.direction = "rtl";
      g.textAlign = "center";
      g.fillStyle = "rgba(255,255,255,.75)";
      g.font = "700 28px 'IBM Plex Sans Arabic'";
      g.fillText("رقم بطاقتك الحقيقي مو هنا", w / 2, y0 + 60);
    }
  };

/** وجه حزمة الدفع: رقم بديل + رمز لمرة وحدة */
const packetFace =
  (code: string, stolen: number): Draw =>
  (g, w, h) => {
    g.fillStyle = stolen > 0.5 ? "rgba(58,12,20,.92)" : "rgba(8,30,24,.92)";
    rr(g, 0, 0, w, h, 34);
    g.fill();
    const col = stolen > 0.5 ? "#FF4D5E" : "#3DDC97";
    g.strokeStyle = col;
    g.lineWidth = 6;
    rr(g, 4, 4, w - 8, h - 8, 30);
    g.stroke();
    g.direction = "rtl";
    g.textAlign = "right";
    g.fillStyle = "rgba(255,255,255,.75)";
    g.font = "700 30px 'IBM Plex Sans Arabic'";
    g.fillText("رقم بديل", w - 36, 70);
    g.fillText("رمز لمرة وحدة", w - 36, 210);
    g.direction = "ltr";
    g.textAlign = "left";
    g.fillStyle = "#fff";
    g.font = "700 50px 'Space Grotesk'";
    g.fillText(`•••• ${TOKEN_LAST}`, 36, 76);
    g.fillStyle = col;
    g.font = "700 76px 'Space Grotesk'";
    g.fillText(code, 36, 236);
    g.fillStyle = "rgba(255,255,255,.5)";
    g.font = "700 26px 'Space Grotesk'";
    g.fillText(stolen > 0.5 ? "USED" : "ONE-TIME", 36, 300);
  };

/* ───── مسارات ومفاتيح ───── */
export const TERM_CARD: V3 = [0, -1.95, 0];
export const TAP_TERM: V3 = [1.35, -1.5, 0];
export const THIEF_OK: V3 = [1.55, -1.45, 0];
export const THIEF_BAD: V3 = [-1.55, -1.45, 0];
export const FAIL_AT = 150;
/** موضع الحزمة في مشهد tap (للملصقات) */
export const tapPacket = (l: number): V3 => {
  const t = ease(l, 100, 46, IN_OUT);
  const up = ease(l, 160, 30, OUT);
  const p = lerp3([0.1, 0.5, 1.6], [1.35, -0.2, 1.0], t);
  return lerp3(p, [0.15, 1.75, 2.2], up);
};
export const codeAt = (l: number) => CODES[Math.max(0, Math.min(CODES.length - 1, Math.floor((l - 190) / 26) + 1))];
export const thiefPacket = (l: number): V3 => {
  const grab = ease(l, 70, 50, IN_OUT);
  const drop = ease(l, 120, 26, IN_OUT);
  const a: V3 = [1.55, 1.15, 0.8];
  const b: V3 = [-1.55, 1.4, 0.8];
  const c: V3 = [-1.55, 0.25, 0.9];
  return drop > 0 ? lerp3(b, c, drop) : lerp3(a, b, grab);
};

export const Scene3D: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const k = cur(f);
  const l = lp(f, k);
  const avatar = useImage(staticFile("avatar.png"));
  const cam = camAt(f);

  const nodes: React.ReactNode[] = [];

  /* ── الهوك + البطاقة العادية ── */
  if (k === "hook" && l > 96) {
    const p = ease(l, 96, 40, OUT);
    nodes.push(<BankCard key="hc" draw={cardFace(0)} position={lerp3([7, 1.0, 0], [2.6, 0.8, -1], p)} rotation={[-0.2, -0.6 + l * 0.01, 0.15]} />);
  }
  if (k === "card") {
    const inn = ease(l, 0, 30, OUT);
    const down = ease(l, 76, 30, IN_OUT);
    const out = ease(l, 196, 20, IN_OUT);
    const pos = lerp3(lerp3([2.6, 0.8, -1], [0, 1.15, 0.6], inn), [0, -0.35, 1.2], down);
    const rot: V3 = [lerp(-0.1, -0.85, down) + Math.sin(l / 26) * 0.05 * (1 - down), lerp(Math.sin(l / 30) * 0.35, 0, down), lerp(0.08, 0, down)];
    nodes.push(<BankCard key="c" draw={cardFace(0)} position={[pos[0], pos[1] + out * 6, pos[2]]} rotation={rot} glow={down > 0.95 ? 1 : 0} />);
    const tin = ease(l, 20, 30, BACK) * (1 - out);
    const tapped = l > 106;
    nodes.push(
      <PayTerminal key="t" draw={termScreen(tapped ? "ok" : "wait", f)} position={TERM_CARD} scale={0.62 * tin} rotation={[0.12, Math.sin(l / 60) * 0.1, 0]} ring={l > 96 && l < 150 ? ((l - 96) / 24) % 1 : 0} ringColor="#F2C14E" />,
    );
  }

  /* ── الخزنة: البطاقة تدخل الجوال وتصير رقم بديل ── */
  if (k === "vault") {
    const pin = ease(l, 0, 30, BACK) * (1 - ease(l, 268, 20, IN_OUT));
    const xr = ease(l, 34, 26, OUT) * (1 - ease(l, 196, 30, IN_OUT));
    const PH: V3 = [-1.35, -0.35, 0];
    const chipGlow = ease(l, 104, 26, OUT);
    nodes.push(
      <Phone key="ph" position={[PH[0], PH[1] - (1 - pin) * 7, PH[2]]} rotation={[0.04, 0.25 + Math.sin(l / 50) * 0.08, 0]} scale={0.62} draw={walletScreen("wallet")} xray={xr} frame="#3B3F4A">
        {xr > 0.05 ? <SecureChip position={[0, -0.6, 0]} scale={0.95} glow={chipGlow} /> : null}
      </Phone>,
    );
    const fly = ease(l, 44, 56, IN_OUT);
    if (l < 104) {
      const pos = lerp3([0.8, 2.6, 1.8], [PH[0], PH[1] - 0.35, 0.3], fly);
      nodes.push(<BankCard key="vc" draw={cardFace(ease(l, 60, 40, IN_OUT))} position={pos} rotation={[-0.2 * (1 - fly), 0.6 * (1 - fly), 0.1]} scale={lerp(0.9, 0.22, fly)} opacity={1 - ease(l, 92, 12, OUT)} />);
    }
  }

  /* ── الدفع: تأكيد ثم لمس، وحزمة برقم بديل ورمز لمرة وحدة ── */
  if (k === "tap") {
    const pin = ease(l, 0, 26, OUT);
    const out = ease(l, 262, 24, IN_OUT);
    const move = ease(l, 64, 34, IN_OUT);
    const mode = l < 60 ? "face" : "done";
    const pPos = lerp3([-1.45, -0.2, 0.4], [0.2, -0.05, 1.5], move);
    nodes.push(
      <Phone key="ph" position={[pPos[0] - (1 - pin) * 5, pPos[1] - out * 7, pPos[2]]} rotation={[0.05, lerp(0.3, 0.7, move), lerp(0, -0.12, move)]} scale={0.56} draw={walletScreen(mode, l)} frame="#3B3F4A" />,
    );
    nodes.push(
      <PayTerminal key="t" draw={termScreen(l > 150 ? "ok" : "wait", f)} position={[TAP_TERM[0] + (1 - pin) * 5, TAP_TERM[1] - out * 7, TAP_TERM[2]]} scale={0.7} rotation={[0.12, -0.35, 0]} ring={l > 90 && l < 160 ? ((l - 90) / 22) % 1 : 0} />,
    );
    if (l > 96 && out < 0.99) {
      const pk = tapPacket(l);
      nodes.push(<Packet key="pk" draw={packetFace(l < 190 ? CODES[0] : codeAt(l), 0)} position={[pk[0], pk[1] + out * 6, pk[2]]} scale={lerp(0.45, 1.25, ease(l, 160, 30, OUT))} rotation={[0, Math.sin(l / 40) * 0.1, 0]} />);
    }
  }

  /* ── الحرامي: يسرق نسخة ويحاول يعيدها ── */
  if (k === "thief") {
    const pin = ease(l, 0, 24, OUT);
    const out = ease(l, 264, 22, IN_OUT);
    nodes.push(<PayTerminal key="ok" draw={termScreen("ok")} position={[THIEF_OK[0] + (1 - pin) * 5, THIEF_OK[1] - out * 7, 0]} scale={0.6} rotation={[0.12, -0.3, 0]} />);
    // الحزمة الأصلية فوق الجهاز
    nodes.push(<Packet key="orig" draw={packetFace(CODES[0], 0)} position={[1.55, 1.15 - out * 7, 0.6]} scale={0.62 * pin} />);
    const badIn = ease(l, 58, 26, BACK) * (1 - out);
    const failed = l >= FAIL_AT;
    const shake = failed && l < FAIL_AT + 16 ? Math.sin(f * 2.2) * 0.1 * (1 - (l - FAIL_AT) / 16) : 0;
    nodes.push(<PayTerminal key="bad" draw={termScreen(failed ? "deny" : "wait", f)} body="#4A2A32" position={[THIEF_BAD[0] + shake, THIEF_BAD[1] - out * 7, 0]} scale={0.6 * badIn} rotation={[0.12, 0.3, 0]} ring={l > 128 && l < FAIL_AT ? ((l - 128) / 11) % 1 : 0} ringColor="#FF4D5E" />);
    // الخطّاف الأحمر ينزل ويسحب نسخة
    const down = ease(l, 18, 40, IN_OUT);
    const pk = thiefPacket(l);
    const hookAt: V3 = l < 70 ? lerp3([2.4, 6.5, 0.8], [1.55, 2.7, 0.8], down) : [pk[0], pk[1] + 1.55, pk[2]];
    const hookOut = ease(l, 140, 20, IN_OUT);
    nodes.push(<FishHook key="hk" color="#FF4D5E" line={3.2} position={[hookAt[0], hookAt[1] + hookOut * 6 - out * 7, hookAt[2]]} rotation={[0, 0, 0.1]} scale={0.6} />);
    if (l > 62) nodes.push(<Packet key="copy" draw={packetFace(CODES[0], ease(l, 64, 8, OUT))} color="#FF4D5E" position={[pk[0] + shake, pk[1] - out * 7, pk[2]]} scale={0.62} />);
    if (failed && l < FAIL_AT + 40) {
      const t = (l - FAIL_AT) / 40;
      nodes.push(
        <mesh key="burst" position={[THIEF_BAD[0], 0.3, 1.2]} scale={0.6 + t * 3}>
          <torusGeometry args={[1, 0.05, 8, 64]} />
          <meshBasicMaterial color="#FF4D5E" transparent opacity={1 - t} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>,
      );
    }
  }

  /* ── الحكم: بطاقة باهتة مقابل جوال بخزنة ── */
  if (k === "verdict") {
    const pin = ease(l, 0, 28, BACK) * (1 - ease(l, 266, 20, IN_OUT));
    nodes.push(<BankCard key="vc" draw={cardFace(0)} position={[-1.65, 1.25, 0]} rotation={[-0.15, 0.35 + Math.sin(l / 40) * 0.1, 0.06]} scale={0.66 * pin} opacity={0.9} />);
    nodes.push(
      <Phone key="vp" position={[1.65, 1.15, 0]} rotation={[0.05, -0.3 + Math.sin(l / 46) * 0.08, 0]} scale={0.4 * pin} draw={walletScreen("wallet")} frame="#3B3F4A" />,
    );
    nodes.push(<SecureChip key="ch" position={[1.65 + 0.75, 0.25, 1]} scale={0.38 * pin} glow={0.6 + kick * 0.4} />);
  }

  /* ── الختام: صورة علي على الجوال ── */
  if (k === "end") {
    const phoneIn = ease(f, SEG.end[0] + 6, 40, OUT);
    nodes.push(<Phone key="ep" position={lerp3([0, -7, 3.2], [0, 0.55, 3.2], phoneIn)} rotation={[0.04, Math.sin(l / 50) * 0.12, 0]} scale={0.68} draw={walletScreen("wallet", 0, avatar)} frame="#3B3F4A" />);
  }

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <ThreeCanvas width={1080} height={1920} camera={{ fov: FOV, position: [0, 0.4, 24] }}>
        <StudioEnv intensity={0.8} />
        <Lights key1="#FFF6E6" rim={k === "thief" ? "#FF6B7A" : "#F2C14E"} rim2={k === "card" || k === "hook" ? "#B9A6FF" : "#3DDC97"} k={2.0 + kick * 0.3} r={58} />
        <CameraRig pos={cam.pos} look={cam.look} />
        {nodes}
      </ThreeCanvas>
    </div>
  );
};
