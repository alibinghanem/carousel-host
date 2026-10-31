import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { staticFile } from "remotion";
import * as THREE from "three";
import { Envelope, Laptop, Panel, Sparkle } from "../../lib/three3d/Mail";
import { Phone, useImage } from "../../lib/three3d/Phone";
import { CameraRig, Lights, StudioEnv } from "../../lib/three3d/Studio";
import { cardDraw, docsScreen, phoneScreen } from "./screens";
import { BACK, IN_OUT, OUT, SEG, SegK, V, ease } from "./theme";

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
export const camAt = (f: number): Cam => {
  const push = 1 - ease(f, 0, 150, OUT);
  const sway = Math.sin(f / 80) * 0.22;
  return { pos: [sway, 0.6 + Math.sin(f / 95) * 0.1, 27 + push * 5], look: [0, 0.2, 0] };
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
const CLOUD: V3 = [0, -0.9, 0];
export const SPARK_INTRO: V3 = [0, 1.0, 0.4];
const SPARK_PHONE: V3 = [0.2, 2.9, 4.2];
export const CARD: V3 = [0, -1.75, 3.2];
export const PHONE_SIDE: V3 = [-1.6, 0.55, 3.6];
const PHONE_END: V3 = [0, 0.55, 3.2];
export const LAPTOP: V3 = [0, -0.62, 5.6];
const N = 18;

/* ───── سحابة الظروف: تنطلق من الصورة في الهوك وتنسحب للشرارة في المقدمة ───── */
const envState = (f: number, i: number): { p: V3; r: V3; s: number; flap: number } | null => {
  const k = cur(f);
  if (k !== "hook" && k !== "intro") return null;
  const th0 = i * 2.39996;
  const rad = 1.9 + (i % 4) * 0.48;
  const yo = (((i * 37) % 9) / 9) * 3.0 - 1.5;
  const th = th0 + f * 0.014 * (1 + (i % 3) * 0.25);
  const orbit: V3 = [CLOUD[0] + Math.cos(th) * rad, CLOUD[1] + yo + Math.sin(f / 40 + i) * 0.15, CLOUD[2] + Math.sin(th) * rad * 0.8];
  const rot: V3 = [Math.sin(f / 30 + i) * 0.35, Math.sin(th) * 0.6, Math.sin(f / 26 + i * 1.7) * 0.35];
  const flap = i % 5 === 0 ? 0.5 + 0.5 * Math.sin(f / 18 + i) : 0;
  if (k === "hook") {
    const t = ease(f, 2 + i * 3.2, 42, OUT);
    if (t <= 0) return null;
    const from: V3 = [orbit[0] * 2.4, orbit[1] * 1.6 + 1.5, -38];
    return { p: lerp3(from, orbit, t), r: [rot[0] + (1 - t) * 3, rot[1] + (1 - t) * 2, rot[2]], s: 0.62 * (0.4 + 0.6 * t), flap };
  }
  const l = lp(f, "intro");
  const t = ease(l, 26 + i * 5.5, 34, (x) => x * x);
  if (t >= 1) return null;
  return { p: lerp3(orbit, SPARK_INTRO, t), r: [rot[0], rot[1] + t * 6, rot[2] + t * 3], s: 0.62 * (1 - t * 0.9), flap };
};
export const ABSORB_AT = (i: number) => SEG.intro[0] + 26 + i * 5.5 + 34;

/** ظرف صغير يدخل/يطلع من الجوال */
const miniEnv = (f: number): { p: V3; s: number; flap: number; r: number }[] => {
  const k = cur(f);
  const out: { p: V3; s: number; flap: number; r: number }[] = [];
  if (k === "sum") {
    const l = lp(f, "sum");
    for (let i = 0; i < 3; i++) {
      const t = ease(l, 14 + i * 9, 30, IN_OUT);
      if (t <= 0 || t >= 1) continue;
      out.push({ p: arc([4.6 - i * 0.3, 4.4 + i * 0.6, 2.5], [PHONE_SIDE[0], PHONE_SIDE[1] + 0.4, PHONE_SIDE[2] + 0.3], t, 0.8), s: 0.42 * (1 - t * 0.85), flap: 0, r: (1 - t) * 1.2 });
    }
  }
  if (k === "write") {
    const l = lp(f, "write");
    if (l >= 226 && l < 280) {
      const a: V3 = [PHONE_SIDE[0], PHONE_SIDE[1] - 0.2, PHONE_SIDE[2] + 0.5];
      const pop = ease(l, 226, 14, BACK);
      const fly = ease(l, 248, 30, IN_OUT);
      out.push({ p: arc(a, [5.2, 5.6, 1.5], fly, 0.6), s: 0.5 * pop * (1 - fly * 0.5), flap: 1 - ease(l, 232, 14, OUT), r: fly * 0.8 });
    }
  }
  return out;
};

/** الشرارة: تنزل في المقدمة، تبلع الظروف، وبعدها تصير مؤشر صغير جنب الجوال */
const sparkState = (f: number, kick: number): { p: V3; s: number; ry: number; glow: number } | null => {
  const k = cur(f);
  const spin = Math.sin(f / 22) * 0.55;
  if (k === "hook") return null;
  if (k === "intro") {
    const l = lp(f, "intro");
    const d = ease(l, 0, 30, BACK);
    const lastAbsorb = ABSORB_AT(N - 1) - SEG.intro[0];
    const gulp = l > 26 && l < lastAbsorb + 4 ? 0.12 * Math.abs(Math.sin(l / 2.75)) : 0;
    const out = ease(l, 196, 20, IN_OUT);
    return { p: lerp3(lerp3([0, 8, 0.4], SPARK_INTRO, d), SPARK_PHONE, out), s: 1.25 * d * (1 + gulp) * (1 - out * 0.74), ry: spin, glow: 0.6 + gulp * 4 + kick * 0.4 };
  }
  if (k === "sum" || k === "ask" || k === "write") {
    const l = lp(f, k);
    const busy = k === "sum" ? ease(l, 104, 10, OUT) * (1 - ease(l, 170, 14, OUT)) : k === "ask" ? ease(l, 150, 10, OUT) * (1 - ease(l, 210, 14, OUT)) : ease(l, 150, 10, OUT) * (1 - ease(l, 205, 14, OUT));
    return { p: [SPARK_PHONE[0], SPARK_PHONE[1] + Math.sin(f / 16) * 0.08, SPARK_PHONE[2]], s: 0.325 * (1 + busy * 0.25 * Math.abs(Math.sin(f / 4))), ry: spin * (1 + busy * 0.6), glow: 0.6 + busy + kick * 0.3 };
  }
  if (k === "docs") {
    const l = lp(f, "docs");
    const to = ease(l, 0, 30, IN_OUT);
    const busy = ease(l, 96, 10, OUT) * (1 - ease(l, 160, 14, OUT));
    const p = lerp3(SPARK_PHONE, [2.15, 2.15, 6.6], to);
    return { p: [p[0], p[1] + Math.sin(f / 16) * 0.06, p[2]], s: 0.325 * (1 - to * 0.2) * (1 + busy * 0.25 * Math.abs(Math.sin(f / 4))), ry: spin * (1 + busy * 0.6), glow: 0.6 + busy + kick * 0.3 };
  }
  // الختام: تدور حول الجوال
  const l = lp(f, "end");
  const a = l / 34;
  const t = ease(l, 0, 30, IN_OUT);
  const orbit: V3 = [PHONE_END[0] + Math.cos(a) * 1.9, PHONE_END[1] + 1.4 + Math.sin(a * 0.7) * 0.4, PHONE_END[2] + Math.sin(a) * 1.2];
  return { p: lerp3([2.15, 2.15, 6.6], orbit, t), s: 0.36, ry: spin, glow: 0.8 + kick * 0.3 };
};

const phoneState = (f: number): { p: V3; s: number; ry: number } | null => {
  const k = cur(f);
  if (k === "sum") return { p: lerp3([-6.5, 0.2, 3.5], PHONE_SIDE, ease(lp(f, "sum"), 0, 28, OUT)), s: 0.84, ry: 0.28 + (1 - ease(lp(f, "sum"), 0, 28, OUT)) * 0.8 };
  if (k === "ask" || k === "write") return { p: PHONE_SIDE, s: 0.84, ry: 0.28 + Math.sin(f / 60) * 0.03 };
  if (k === "docs") {
    const t = ease(lp(f, "docs"), 0, 24, IN_OUT);
    return t >= 1 ? null : { p: lerp3(PHONE_SIDE, [-7, 0.2, 3.5], t), s: 0.84, ry: 0.28 - t * 0.6 };
  }
  if (k === "end") return { p: lerp3([0, -7, 3.2], PHONE_END, ease(lp(f, "end"), 6, 40, OUT)), s: 0.68, ry: Math.sin(lp(f, "end") / 50) * 0.12 };
  return null;
};

const laptopState = (f: number): { p: V3; open: number; ry: number } | null => {
  const k = cur(f);
  if (k === "docs") {
    const l = lp(f, "docs");
    const rise = ease(l, 8, 30, OUT);
    return { p: lerp3([0, -8, 5.6], LAPTOP, rise), open: ease(l, 22, 30, OUT), ry: Math.sin(f / 70) * 0.05 };
  }
  if (k === "end") {
    const l = lp(f, "end");
    const t = ease(l, 0, 26, IN_OUT);
    return t >= 1 ? null : { p: lerp3(LAPTOP, [0, -9, 5.6], ease(l, 6, 22, IN_OUT)), open: 1 - t, ry: 0 };
  }
  return null;
};

export const Scene3D: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const k = cur(f);
  const avatar = useImage(staticFile("avatar.png"));
  const gmail = useImage(V("gmail-color.svg"));
  const docs = useImage(V("googledocs-color.svg"));
  const gem = useImage(V("gemini-color.svg"));
  const cam = camAt(f);
  const sp = sparkState(f, kick);
  const ph = phoneState(f);
  const lt = laptopState(f);
  const il = lp(f, "intro");
  const card = k === "intro" ? ease(il, 150, 18, BACK) : k === "sum" ? 1 - ease(lp(f, "sum"), 0, 18, IN_OUT) : 0;
  const cardPos: V3 = k === "intro" ? lerp3(SPARK_INTRO, CARD, ease(il, 150, 22, OUT)) : lerp3(CARD, [3.6, 3.5, 2], ease(lp(f, "sum"), 0, 18, IN_OUT));

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <ThreeCanvas width={1080} height={1920} camera={{ fov: FOV, position: [0, 0.6, 27] }}>
        <StudioEnv intensity={0.95} />
        <Lights key1="#FFFFFF" rim={k === "write" ? "#E77A93" : "#7FA8FF"} rim2={k === "docs" ? "#4C8DF6" : "#B48CFF"} k={2.0 + kick * 0.3} r={62} />
        <CameraRig pos={cam.pos} look={cam.look} />

        {Array.from({ length: N }, (_, i) => {
          const e = envState(f, i);
          return e ? <Envelope key={i} position={e.p} rotation={e.r} scale={e.s} flap={e.flap} seal={i % 3 === 1 ? "#4C8DF6" : "#EA4335"} /> : null;
        })}
        {miniEnv(f).map((e, i) => (
          <Envelope key={`m${i}`} position={e.p} rotation={[0.2, -0.3 + e.r, e.r * 0.4]} scale={e.s} flap={e.flap} />
        ))}

        {sp && sp.s > 0.01 ? <Sparkle position={sp.p} rotation={[0, sp.ry, 0]} scale={sp.s} glow={sp.glow} halo={k === "intro" ? 1 : 0.7} /> : null}

        {card > 0.01 ? <Panel position={cardPos} rotation={[-0.08, 0, 0]} scale={card} draw={cardDraw(k === "intro" ? il - 166 : 200)} W={800} H={520} w={3.6} h={2.34} /> : null}

        {ph ? <Phone position={ph.p} rotation={[0.04, ph.ry, 0]} scale={ph.s} draw={phoneScreen(f, { avatar, gmail, gem })} frame="#4A4F5C" /> : null}

        {lt ? <Laptop position={lt.p} rotation={[0.2, lt.ry, 0]} scale={0.9} open={lt.open} draw={docsScreen(lp(f, "docs"), docs)} /> : null}
      </ThreeCanvas>
    </div>
  );
};
