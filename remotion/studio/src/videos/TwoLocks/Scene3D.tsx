import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { staticFile } from "remotion";
import * as THREE from "three";
import { Phone, ScreenDraw, useImage } from "../../lib/three3d/Phone";
import { Key, Padlock, VaultDoor } from "../../lib/three3d/Safety";
import { CameraRig, Lights, StudioEnv } from "../../lib/three3d/Studio";
import { BACK, C, IN_OUT, MONO, OUT, SEG, SegK, ease } from "./theme";

export const FOV = 30;
type V3 = [number, number, number];
const lp = (f: number, k: SegK) => f - SEG[k][0];
export const cur = (f: number): SegK => (Object.keys(SEG) as SegK[]).find((k) => f >= SEG[k][0] && f < SEG[k][1]) ?? "end";
const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const arc = (a: V3, b: V3, t: number, h: number): V3 => {
  const p = lerp3(a, b, t);
  return [p[0], p[1] + Math.sin(t * Math.PI) * h, p[2]];
};

/* ───── الكاميرا (مشتركة مع طبقة HTML) ───── */
type Cam = { pos: V3; look: V3 };
const BASE: Cam = { pos: [0, 0.6, 27], look: [0, 0.2, 0] };
export const camAt = (f: number): Cam => {
  const hookIn = 1 - ease(f, 96, 40, IN_OUT);
  const z = 27 + hookIn * 6;
  const sway = Math.sin(f / 80) * 0.25;
  return { pos: [BASE.pos[0] + sway, BASE.pos[1] + Math.sin(f / 95) * 0.12, z], look: BASE.look };
};
const projCam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 500);
export const project = (f: number, p: V3): [number, number] => {
  const c = camAt(f);
  projCam.position.set(...c.pos);
  projCam.lookAt(...c.look);
  projCam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(projCam);
  return [((v.x + 1) / 2) * 1080, ((1 - v.y) / 2) * 1920];
};

/* ───── أماكن ثابتة ───── */
export const VAULT: V3 = [0, 0.9, -1];
const VAULT_BACK: V3 = [0, 4.4, -16];
export const LOCK1: V3 = [-1.55, -1.3, 1.0];
export const LOCK2: V3 = [1.55, -1.3, 1.0];
export const PHONE_TWO: V3 = [2.55, 2.0, 3.2];
const PHONE_SIDE: V3 = [-1.45, 0.66, 3.5];
const PHONE_END: V3 = [0, 0.6, 3.2];
const KEY_START: V3 = [-4.6, 6.2, 4];
const KEY_AT1: V3 = [-1.55, -0.95, 1.9];
const KEY_AT2: V3 = [1.25, -0.95, 1.9];
const KEY_OFF: V3 = [-4.2, -5.5, 4];
export const KEY_TAG = (f: number): V3 => keyState(f)?.p ?? KEY_START;

type KS = { p: V3; r: number; glow: number } | null;
const keyState = (f: number): KS => {
  const k = cur(f);
  if (k === "one") {
    const l = lp(f, "one");
    if (l < 24) return null;
    if (l < 96) return { p: arc(KEY_START, KEY_AT1, ease(l, 24, 72, IN_OUT), 0.8), r: 0.5 - ease(l, 24, 72, OUT) * 0.5, glow: 0.6 };
    return { p: KEY_AT1, r: l > 100 ? -ease(l, 100, 12, OUT) * 1.4 : 0, glow: 0.6 };
  }
  if (k === "two") {
    const l = lp(f, "two");
    if (l < 60) return null;
    if (l < 110) return { p: arc(KEY_START, KEY_AT1, ease(l, 60, 50, IN_OUT), 0.6), r: 0, glow: 0.6 };
    if (l < 126) return { p: KEY_AT1, r: -ease(l, 110, 12, OUT) * 1.4, glow: 0.6 };
    if (l < 168) return { p: arc(KEY_AT1, KEY_AT2, ease(l, 126, 42, IN_OUT), 0.9), r: 0, glow: 0.6 };
    if (l < 190) {
      // يرتد: القفل الثاني يرفض
      const b = Math.sin(((l - 168) / 22) * Math.PI);
      return { p: [KEY_AT2[0] - b * 0.5, KEY_AT2[1] + b * 0.35, KEY_AT2[2] + b * 0.3], r: Math.sin(l * 1.6) * 0.25, glow: 0.9 };
    }
    if (l < 240) return { p: arc(KEY_AT2, KEY_OFF, ease(l, 190, 50, IN_OUT), 0.6), r: ease(l, 190, 50, OUT) * 2, glow: 0.6 };
    return null;
  }
  if (k === "rule") {
    const l = lp(f, "rule");
    if (l < 50 || l > 150) return null;
    if (l < 92) return { p: arc(KEY_START, KEY_AT2, ease(l, 50, 42, IN_OUT), 0.6), r: 0, glow: 0.6 };
    const b = Math.sin(((l - 92) / 22) * Math.PI) * (l < 114 ? 1 : 0);
    if (l < 114) return { p: [KEY_AT2[0] - b * 0.5, KEY_AT2[1] + b * 0.35, KEY_AT2[2] + b * 0.3], r: Math.sin(l * 1.6) * 0.25, glow: 0.9 };
    return { p: arc(KEY_AT2, KEY_OFF, ease(l, 114, 36, IN_OUT), 0.6), r: ease(l, 114, 36, OUT) * 2, glow: 0.6 };
  }
  return null;
};

/* ───── شاشات الجوال ───── */
const AR = "'IBM Plex Sans Arabic', 'Space Grotesk'";
const status = (g: CanvasRenderingContext2D, w: number, c: string) => {
  g.fillStyle = c;
  g.font = `700 22px 'Space Grotesk'`;
  g.direction = "ltr";
  g.textAlign = "left";
  g.fillText("10:42", 44, 70);
  g.textAlign = "right";
  g.fillText("5G", w - 44, 70);
};
const rtl = (g: CanvasRenderingContext2D, t: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "right") => {
  g.font = font;
  g.fillStyle = color;
  g.direction = "rtl";
  g.textAlign = align;
  g.fillText(t, x, y);
};
const lockIcon = (g: CanvasRenderingContext2D, x: number, y: number, s: number, c: string) => {
  g.fillStyle = c;
  g.beginPath();
  g.roundRect(x - 40 * s, y - 10 * s, 80 * s, 64 * s, 12 * s);
  g.fill();
  g.strokeStyle = c;
  g.lineWidth = 12 * s;
  g.beginPath();
  g.arc(x, y - 12 * s, 26 * s, Math.PI, 0);
  g.stroke();
};
const codeScreen: ScreenDraw = (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#14304A");
  gr.addColorStop(1, "#071422");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  status(g, w, "#fff");
  g.fillStyle = "#fff";
  g.font = `700 120px 'Space Grotesk'`;
  g.textAlign = "center";
  g.direction = "ltr";
  g.fillText("10:42", w / 2, 300);
  g.fillStyle = "rgba(255,255,255,.92)";
  g.beginPath();
  g.roundRect(30, 420, w - 60, 300, 34);
  g.fill();
  lockIcon(g, w - 90, 490, 0.55, "#1F9D55");
  rtl(g, "رمز التحقق", w - 140, 500, `700 34px ${AR}`, "#111");
  rtl(g, "رمز الدخول لحسابك:", w - 60, 580, `600 30px ${AR}`, "#333");
  g.fillStyle = "#0B6E3A";
  g.font = `800 72px ${MONO}`;
  g.direction = "ltr";
  g.textAlign = "center";
  g.fillText("482 917", w / 2, 670);
  rtl(g, "لا تعطيه أحد", w / 2, 790, `700 32px ${AR}`, "#FF6B6B", "center");
};
const row = (g: CanvasRenderingContext2D, w: number, y: number, t: string, on: boolean, sub?: string) => {
  if (on) {
    g.fillStyle = "rgba(37,211,102,.18)";
    g.fillRect(0, y - 52, w, 104);
    g.fillStyle = C.green;
    g.fillRect(w - 10, y - 52, 10, 104);
  }
  rtl(g, t, w - 50, y + (sub ? -4 : 12), `${on ? 700 : 600} 32px ${AR}`, "#111");
  if (sub) rtl(g, sub, w - 50, y + 36, `600 22px ${AR}`, "#667");
  g.fillStyle = "#E3E6EA";
  g.fillRect(40, y + 52, w - 80, 2);
};
const waScreen = (step: number): ScreenDraw => (g, w, h) => {
  g.fillStyle = "#fff";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#0B6E4F";
  g.fillRect(0, 0, w, 210);
  status(g, w, "#fff");
  const title = step === 0 ? "الإعدادات" : step === 1 ? "الحساب" : "التحقق بخطوتين";
  rtl(g, title, w - 50, 170, `700 40px ${AR}`, "#fff");
  if (step === 0) {
    ["الحساب", "الخصوصية", "الدردشات", "الإشعارات", "التخزين والبيانات"].forEach((t, i) => row(g, w, 300 + i * 112, t, i === 0));
  } else if (step === 1) {
    ["مفاتيح المرور", "عنوان البريد الإلكتروني", "التحقق بخطوتين", "تغيير الرقم"].forEach((t, i) => row(g, w, 300 + i * 112, t, i === 2));
  } else {
    lockIcon(g, w / 2, 400, 1.6, "#0B6E4F");
    rtl(g, step === 3 ? "مُفعّل ✓" : "زيادة أمان لحسابك", w / 2, 560, `700 36px ${AR}`, step === 3 ? "#0B6E4F" : "#111", "center");
    rtl(g, "كلمة مرور تطلبها عند التسجيل", w / 2, 620, `600 26px ${AR}`, "#556", "center");
    rtl(g, "برقمك على جوال جديد", w / 2, 660, `600 26px ${AR}`, "#556", "center");
    g.fillStyle = step === 3 ? "#CFEFDF" : C.green;
    g.beginPath();
    g.roundRect(120, 760, w - 240, 90, 45);
    g.fill();
    rtl(g, step === 3 ? "تم" : "تفعيل", w / 2, 820, `700 36px ${AR}`, step === 3 ? "#0B6E4F" : "#fff", "center");
  }
};
const toggle = (g: CanvasRenderingContext2D, x: number, y: number, on: number) => {
  g.fillStyle = on > 0.5 ? "#1A73E8" : "#C3C7CF";
  g.beginPath();
  g.roundRect(x, y, 96, 52, 26);
  g.fill();
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(x + 26 + on * 44, y + 26, 20, 0, Math.PI * 2);
  g.fill();
};
const googleScreen = (step: number, on: number): ScreenDraw => (g, w, h) => {
  g.fillStyle = "#fff";
  g.fillRect(0, 0, w, h);
  status(g, w, "#111");
  rtl(g, step === 0 ? "حسابك في Google" : "الأمان وتسجيل الدخول", w - 50, 170, `700 38px ${AR}`, "#202124");
  g.fillStyle = "#E8EAED";
  g.fillRect(0, 210, w, 2);
  if (step === 0) {
    ["الصفحة الرئيسية", "المعلومات الشخصية", "الأمان وتسجيل الدخول", "البيانات والخصوصية"].forEach((t, i) => {
      if (i === 2) {
        g.fillStyle = "rgba(26,115,232,.12)";
        g.beginPath();
        g.roundRect(20, 250 + i * 110, w - 40, 90, 45);
        g.fill();
      }
      rtl(g, t, w - 60, 308 + i * 110, `${i === 2 ? 700 : 600} 30px ${AR}`, i === 2 ? "#1A73E8" : "#202124");
    });
  } else {
    rtl(g, "كيف تسجّل الدخول إلى Google", w - 50, 290, `700 30px ${AR}`, "#202124");
    g.fillStyle = "rgba(26,115,232,.08)";
    g.beginPath();
    g.roundRect(20, 340, w - 40, 150, 24);
    g.fill();
    rtl(g, "التحقق بخطوتين", w - 60, 405, `700 32px ${AR}`, "#202124");
    rtl(g, on > 0.5 ? "مُفعّل" : "غير مُفعّل", w - 60, 455, `600 24px ${AR}`, on > 0.5 ? "#188038" : "#5F6368");
    toggle(g, 50, 389, on);
    ["مفاتيح المرور", "كلمة المرور", "رقم الجوال"].forEach((t, i) => {
      rtl(g, t, w - 60, 580 + i * 100, `600 28px ${AR}`, "#3C4043");
      g.fillStyle = "#E8EAED";
      g.fillRect(40, 610 + i * 100, w - 80, 2);
    });
  }
};
const avatarScreen = (img: HTMLImageElement | null): ScreenDraw => (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#0FA37F");
  gr.addColorStop(1, "#06261F");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  status(g, w, "#fff");
  if (img) {
    g.save();
    g.beginPath();
    g.arc(w / 2, h / 2 - 60, 210, 0, Math.PI * 2);
    g.fillStyle = C.gold;
    g.fill();
    g.clip();
    const s = 470 / img.width;
    g.drawImage(img, w / 2 - (img.width * s) / 2, h / 2 - 60 - 210, img.width * s, img.height * s);
    g.restore();
  }
  lockIcon(g, w / 2, h / 2 + 280, 0.9, "#fff");
};

export const WA_STEP = (f: number) => {
  const l = lp(f, "wa");
  return l < 92 ? 0 : l < 144 ? 1 : l < 196 ? 2 : 3;
};
export const G_STEP = (f: number) => (lp(f, "google") < 96 ? 0 : 1);

const screenFor = (f: number, avatar: HTMLImageElement | null): ScreenDraw => {
  const k = cur(f);
  if (k === "wa") return waScreen(WA_STEP(f));
  if (k === "google") return googleScreen(G_STEP(f), ease(lp(f, "google"), 150, 14, OUT));
  if (k === "end" || k === "rule") return avatarScreen(avatar);
  return codeScreen;
};

/* ───── جزيئات الرمز من الجوال للقفل الثاني ───── */
const Code: React.FC<{ f: number }> = ({ f }) => {
  if (cur(f) !== "two") return null;
  const l = lp(f, "two");
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => {
        const t = (l - 200 - i * 5) / 40;
        if (t <= 0 || t >= 1) return null;
        const p = arc([PHONE_TWO[0] - 0.4, PHONE_TWO[1] - 0.8, PHONE_TWO[2]], [LOCK2[0], LOCK2[1] + 0.2, LOCK2[2] + 0.4], ease(t, 0, 1, IN_OUT), 0.8);
        return (
          <mesh key={i} position={p} rotation={[t * 5, t * 4, 0]}>
            <boxGeometry args={[0.22, 0.22, 0.22]} />
            <meshStandardMaterial color={C.ok} emissive={C.ok} emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
        );
      })}
    </>
  );
};

export const Scene3D: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const k = cur(f);
  const avatar = useImage(staticFile("avatar.png"));
  const cam = camAt(f);
  const show = ease(f, SEG.hook[1] - 28, 30, OUT);

  // الخزنة: تبتعد للخلف في مشاهد الجوال وترجع في القاعدة
  const back = Math.max(ease(f, SEG.wa[0] - 22, 44, IN_OUT) * (1 - ease(f, SEG.rule[0] - 22, 44, IN_OUT)), ease(f, SEG.end[0] - 22, 44, IN_OUT));
  const vault = lerp3(VAULT, VAULT_BACK, back);
  const one = lp(f, "one");
  const two = lp(f, "two");
  const doorOpen = k === "one" ? ease(one, 132, 46, OUT) * 0.58 : k === "two" ? 0.58 * (1 - ease(two, 0, 30, IN_OUT)) : 0;
  const alarm = k === "one" ? ease(one, 120, 20, OUT) * (0.65 + 0.35 * Math.sin(one / 4)) : k === "two" ? 1 - ease(two, 0, 24, OUT) : 0;
  const spin = k === "one" ? ease(one, 120, 30, OUT) * 2.2 : f * 0.002;

  // القفل الأول: ينفتح ويطيح في «one»، يرجع ويفتحه المفتاح مرة ثانية في «two»، ومقفول في «rule»
  const l1Vis = k === "hook" ? 0 : k === "one" ? ease(one, 6, 16, BACK) : k === "two" ? ease(two, 8, 16, BACK) : k === "rule" ? ease(lp(f, "rule"), 10, 16, BACK) : 0;
  const l1Open = k === "one" ? ease(one, 100, 10, OUT) : k === "two" ? ease(two, 112, 10, OUT) : 0;
  const l1Fall = k === "one" ? ease(one, 116, 22, (x) => x * x) : 0;
  const l2Vis = k === "two" ? ease(two, 22, 16, BACK) : k === "rule" ? ease(lp(f, "rule"), 18, 16, BACK) : 0;
  const shake = (k === "two" && two > 168 && two < 192) || (k === "rule" && lp(f, "rule") > 92 && lp(f, "rule") < 114) ? Math.sin(f * 2.2) * 0.12 : 0;
  const l2Glow = k === "two" ? ease(two, 240, 12, OUT) * (1 - ease(two, 270, 14, OUT)) : k === "rule" ? 0.5 + 0.5 * Math.sin(f / 6) : 0;
  const lockScale = 0.8 * (1 - back);

  // الجوال
  const ph = (() => {
    if (k === "two") return { p: lerp3([5.5, 3.5, 3.2], PHONE_TWO, ease(two, 36, 30, OUT)), s: 0.42, ry: -0.35 };
    if (k === "wa" || k === "google") return { p: lerp3(PHONE_TWO, PHONE_SIDE, ease(lp(f, "wa"), -10, 40, IN_OUT)), s: 0.42 + 0.32 * ease(lp(f, "wa"), -10, 40, IN_OUT), ry: 0.28 };
    if (k === "rule") return { p: lerp3(PHONE_SIDE, [6, -1, 3.5], ease(lp(f, "rule"), -12, 34, IN_OUT)), s: 0.74, ry: 0.28 };
    if (k === "end") return { p: lerp3([0, -7, 3.2], PHONE_END, ease(lp(f, "end"), 0, 40, OUT)), s: 0.68, ry: Math.sin(lp(f, "end") / 50) * 0.12 };
    return null;
  })();
  const ks = keyState(f);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: show }}>
      <ThreeCanvas width={1080} height={1920} camera={{ fov: FOV, position: [0, 0.6, 27] }}>
        <StudioEnv intensity={0.9} />
        <Lights key1="#FFFFFF" rim={k === "one" ? "#FF3B3B" : k === "google" ? "#4C8DF6" : "#2BD47D"} rim2={k === "rule" ? "#FFC23D" : "#7C9CFF"} k={2.0 + kick * 0.3} r={65} />
        <CameraRig pos={cam.pos} look={cam.look} />

        {back < 0.995 ? <VaultDoor position={vault} scale={1 - back} open={doorOpen} spin={spin} alarm={alarm} /> : null}

        {l1Vis > 0.01 && lockScale > 0.01 ? (
          <Padlock
            position={[LOCK1[0], LOCK1[1] - l1Fall * 6, LOCK1[2]]}
            rotation={[0, 0.15, l1Fall * 1.2]}
            scale={l1Vis * lockScale}
            color="#B8C0CA"
            open={l1Open}
          />
        ) : null}
        {l2Vis > 0.01 && lockScale > 0.01 ? (
          <group position={[LOCK2[0] + shake, LOCK2[1], LOCK2[2]]} scale={l2Vis * lockScale}>
            <Padlock rotation={[0, -0.15, 0]} color="#12B886" />
            {l2Glow > 0 ? (
              <mesh position={[0, 0, -0.1]}>
                <circleGeometry args={[1.5, 48]} />
                <meshBasicMaterial color={C.ok} transparent opacity={0.25 * l2Glow} toneMapped={false} depthWrite={false} />
              </mesh>
            ) : null}
          </group>
        ) : null}

        {ks ? <Key position={ks.p} rotation={[0, 0.3, 0.5 + ks.r]} color={C.red} glow={ks.glow} scale={1.1} /> : null}
        <Code f={f} />

        {ph ? (
          <Phone position={ph.p} rotation={[0.04, ph.ry, 0]} scale={ph.s} draw={screenFor(f, avatar)} frame="#5B6270" />
        ) : null}
      </ThreeCanvas>
    </div>
  );
};
