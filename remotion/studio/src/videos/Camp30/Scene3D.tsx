import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { staticFile } from "remotion";
import * as THREE from "three";
import { useImage } from "../../lib/three3d/Phone";
import { Arrow, Ball, Cone, Figure, FloodLight, Goal, Pitch, Scoreboard, V3, along } from "../../lib/three3d/Sport";
import { CameraRig, StudioEnv } from "../../lib/three3d/Studio";
import { BOARD, C, IN_OUT, OUT, SEG, SegK, V, ZONE, ease } from "./theme";

export const FOV = 38;
const lp = (f: number, k: SegK) => f - SEG[k][0];
const cur = (f: number): SegK => (Object.keys(SEG) as SegK[]).find((k) => f >= SEG[k][0] && f < SEG[k][1]) ?? "end";
const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/* ───── الكاميرا (مشتركة مع طبقة HTML عشان الملصقات تركب على العناصر) ───── */
type Cam = { pos: V3; look: V3 };
const CAMS: [number, Cam][] = [
  [0, { pos: [0, 40, ZONE.w1 + 0.01], look: [0, 0, ZONE.w1] }],
  [SEG.plan[0] + 34, { pos: [0, 86, 85], look: [0, 0, 3] }],
  [SEG.w1[0], { pos: [0, 28, 53], look: [0, 0, 20] }],
  [SEG.w2[0], { pos: [0, 25, 25], look: [0, 0, 7] }],
  [SEG.w3[0], { pos: [0, 54, 14], look: [0, 0, -4] }],
  [SEG.w4[0], { pos: [0, 13, 15], look: [0, 3, -30] }],
  [SEG.tip[0], { pos: [0, 51, 27.5], look: [0, 0, -0.5] }],
  [SEG.end[0], { pos: [0, 9.75, -7.5], look: [0, 6, -35.5] }],
];
export const camAt = (f: number): Cam => {
  let s = CAMS[0][1];
  for (let i = 1; i < CAMS.length; i++) {
    const d = i === 1 ? 90 : 44;
    const t = ease(f, CAMS[i][0] - d / 2, d, IN_OUT);
    if (t <= 0) break;
    s = { pos: lerp3(s.pos, CAMS[i][1].pos, t), look: lerp3(s.look, CAMS[i][1].look, t) };
  }
  // انجراف بطيء يعطي إحساس كاميرا محمولة على رافعة
  const sway = Math.sin(f / 70) * 0.35;
  return { pos: [s.pos[0] + sway, s.pos[1] + Math.sin(f / 90) * 0.15, s.pos[2]], look: s.look };
};
/** إسقاط نقطة 3D على الشاشة (1080×1920) بنفس كاميرا المشهد */
const projCam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 500);
export const project = (f: number, p: V3): [number, number] => {
  const c = camAt(f);
  projCam.position.set(...c.pos);
  projCam.lookAt(...c.look);
  projCam.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(projCam);
  return [((v.x + 1) / 2) * 1080, ((1 - v.y) / 2) * 1920];
};

/* ───── الفريق: 6 لاعبين، مكان كل واحد حسب المشهد ───── */
const N = 6;
const qx = (i: number) => -3.5 + i * 1.4;
const QZ = 23.6;
const FZ = 12.4;
const CZ = [21.5, 19.75, 18, 16.25, 14.5];
const SLALOM_CONES: V3[] = CZ.map((z) => [0, 0, z]);
const slalomPath = (i: number): V3[] => [[qx(i), 0, QZ], [0, 0, 22.6], ...CZ.map((z, j): V3 => [j % 2 ? -1.1 : 1.1, 0, z]), [0, 0, 13.4], [qx(i), 0, FZ]];
const circle = (i: number): V3 => {
  const a = (i / N) * Math.PI * 2 + Math.PI / 6;
  return [Math.sin(a) * 3.1, 0, ZONE.w2 + Math.cos(a) * 2.6];
};
const PASS_SEQ = [0, 2, 4, 1, 3, 5, 0];
export const PASS_AT = (k: number) => SEG.w2[0] + 46 + k * 34;
const PLAY: { start: V3; pts: V3[] }[] = [
  { start: [-3.2, 0, -2], pts: [[-3.2, 0.03, -2], [-3.8, 0.03, -5], [-1.2, 0.03, -9.2]] },
  { start: [0, 0, -1.2], pts: [[0, 0.03, -1.2], [0.6, 0.03, -5], [0, 0.03, -9]] },
  { start: [3.2, 0, -2], pts: [[3.2, 0.03, -2], [3.9, 0.03, -5.4], [1.2, 0.03, -9.2]] },
];
export const COACH_W3: V3 = [0, 0, -11.2];
const W3_IDLE: V3[] = [[-4.4, 0, -0.6], [4.4, 0, -0.6], [0, 0, 0.2]];
const W4: V3[] = [[-3, 0, -20.6], [0, 0, -17.4], [3, 0, -20.6], [-1.8, 0, -15.8], [1.8, 0, -15.8], [0, 0, -14.2]];
const TIP = (i: number): V3 => {
  const a = (i / N) * Math.PI * 2;
  return [Math.sin(a) * 3.4, 0, Math.cos(a) * 3.4];
};

type P = { p: V3; yaw: number; run: number };
const moveTo = (a: V3, b: V3, t: number): P => {
  const tt = ease(t, 0, 1, IN_OUT);
  const yaw = Math.atan2(b[0] - a[0], b[2] - a[2]);
  return { p: lerp3(a, b, tt), yaw: t > 0 && t < 1 ? yaw : Math.PI, run: t > 0 && t < 1 ? 1 : 0 };
};
const player = (f: number, i: number): P => {
  const k = cur(f);
  if (k === "hook" || k === "plan") {
    const t = ease(f, SEG.plan[0] + 30 + i * 6, 70, (x) => x);
    return moveTo([qx(i) * 1.6, 0, 33], [qx(i), 0, QZ], t);
  }
  if (k === "w1") {
    const t0 = SEG.w1[0] + 22 + i * 24;
    const t = (f - t0) / 118;
    if (t <= 0) return { p: [qx(i), 0, QZ], yaw: Math.PI, run: 0 };
    if (t >= 1) return { p: [qx(i), 0, FZ], yaw: Math.PI, run: 0 };
    const a = along(slalomPath(i), ease(t, 0, 1, (x) => x));
    return { p: a.p, yaw: a.yaw, run: 1 };
  }
  if (k === "w2") return moveTo([qx(i), 0, FZ], circle(i), (f - SEG.w2[0] + 24) / 46);
  if (k === "w3") {
    const lf = lp(f, "w3");
    const st = i < 3 ? PLAY[i].start : W3_IDLE[i - 3];
    if (lf < 30) return moveTo(circle(i), st, (lf + 22) / 50);
    if (i < 3) {
      const t = (lf - 104) / 64;
      if (t <= 0) return { p: st, yaw: Math.PI, run: 0 };
      const end = PLAY[i].pts[2];
      if (t >= 1) return { p: [end[0], 0, end[2]], yaw: Math.PI, run: 0 };
      const a = along(PLAY[i].pts, ease(t, 0, 1, IN_OUT));
      return { p: [a.p[0], 0, a.p[2]], yaw: a.yaw, run: 1 };
    }
    return { p: st, yaw: Math.PI, run: 0 };
  }
  if (k === "w4") {
    const lf = lp(f, "w4");
    const prev: V3 = i < 3 ? [PLAY[i].pts[2][0], 0, PLAY[i].pts[2][2]] : W3_IDLE[i - 3];
    if (lf < 40) return moveTo(prev, W4[i], (lf + 22) / 58);
    if (i === 1) {
      const t = (lf - 44) / 16;
      if (t > 0 && t < 1) return { p: lerp3(W4[1], [0, 0, -18.7], ease(t, 0, 1, IN_OUT)), yaw: Math.PI, run: 1 };
      if (t >= 1) return { p: [0, 0, -18.7], yaw: Math.PI, run: 0 };
    }
    return { p: W4[i], yaw: Math.PI, run: 0 };
  }
  if (k === "tip") return moveTo(i === 1 ? [0, 0, -18.7] : W4[i], TIP(i), (lp(f, "tip") + 22) / 48);
  return { p: TIP(i), yaw: Math.PI, run: 0 };
};

/* ───── الكرة ───── */
const ballAt = (f: number): { p: V3; lift: number; spin: number } | null => {
  const k = cur(f);
  if (k === "w2") {
    for (let s = 0; s < PASS_SEQ.length - 1; s++) {
      const t = (f - PASS_AT(s)) / 22;
      if (t >= 0 && t < 1) {
        const a = circle(PASS_SEQ[s]);
        const b = circle(PASS_SEQ[s + 1]);
        const tt = ease(t, 0, 1, (x) => x);
        return { p: lerp3(a, b, tt), lift: Math.sin(tt * Math.PI) * 0.9, spin: f / 3 };
      }
    }
    let last = 0;
    for (let s = 0; s < PASS_SEQ.length - 1; s++) if (f >= PASS_AT(s) + 22) last = s + 1;
    const p = circle(PASS_SEQ[last]);
    return { p: [p[0], 0, p[2] - 0.5], lift: 0, spin: 0 };
  }
  if (k === "w4") {
    const lf = lp(f, "w4");
    const start: V3 = [0, 0, -19.4];
    if (lf < 60) return { p: start, lift: 0, spin: 0 };
    const t = (lf - 60) / 16;
    if (t < 1) {
      const tt = ease(t, 0, 1, (x) => x);
      return { p: lerp3(start, [1.1, 0, -30.4], tt), lift: Math.sin(tt * Math.PI * 0.62) * 1.9, spin: f / 2 };
    }
    const d = Math.min(1, (lf - 76) / 14);
    return { p: [1.1, 0, -30.4 - d * 0.6], lift: Math.max(0, 1.7 * (1 - d) - 0.02), spin: 0 };
  }
  return null;
};

/* ───── لوحة النتائج (canvas) ───── */
const mixed = (g: CanvasRenderingContext2D, ar: string, num: string, cx: number, y: number, fa: string, fn: string, ca: string, cn: string) => {
  g.font = fa;
  const wa = g.measureText(ar).width;
  g.font = fn;
  const wn = g.measureText(num).width;
  const gap = 18;
  const right = cx + (wa + gap + wn) / 2;
  g.direction = "rtl";
  g.textAlign = "right";
  g.font = fa;
  g.fillStyle = ca;
  g.fillText(ar, right, y);
  // القيمة فيها كلمة عربية (مثل «3 ساعات») فتنرسم RTL كاملة عشان الرقم يجي أول
  g.direction = "rtl";
  g.textAlign = "left";
  g.font = fn;
  g.fillStyle = cn;
  g.fillText(num, right - wa - gap - wn, y);
  g.textAlign = "center";
  g.direction = "rtl";
};
const cover = (g: CanvasRenderingContext2D, im: HTMLImageElement, x: number, y: number, w: number, h: number) => {
  const s = Math.max(w / im.width, h / im.height);
  const sw = w / s;
  const sh = h / s;
  g.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, x, y, w, h);
};
const boardDraw = (f: number, team: HTMLImageElement | null, avatar: HTMLImageElement | null) => (g: CanvasRenderingContext2D, w: number, h: number) => {
  const k = cur(f);
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#0E1A2E");
  bg.addColorStop(1, "#060B14");
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.textAlign = "center";
  g.direction = "rtl";
  if (k === "end") {
    const gr = g.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w / 1.4);
    gr.addColorStop(0, "#0FA37F");
    gr.addColorStop(1, "#06261F");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    if (avatar) {
      g.save();
      g.beginPath();
      g.arc(w / 2, h / 2 + 10, 230, 0, Math.PI * 2);
      g.fillStyle = C.gold;
      g.fill();
      g.clip();
      const s = 520 / avatar.width;
      g.drawImage(avatar, w / 2 - (avatar.width * s) / 2, h / 2 + 10 - 230, avatar.width * s, avatar.height * s);
      g.restore();
      g.lineWidth = 10;
      g.strokeStyle = "#fff";
      g.beginPath();
      g.arc(w / 2, h / 2 + 10, 232, 0, Math.PI * 2);
      g.stroke();
    }
    return;
  }
  if (k === "w4" && lp(f, "w4") >= 84) {
    const p = ease(lp(f, "w4"), 84, 14, OUT);
    g.globalAlpha = p;
    if (team) {
      cover(g, team, 0, 0, w * 0.38, h);
      const sh = g.createLinearGradient(w * 0.24, 0, w * 0.38, 0);
      sh.addColorStop(0, "rgba(6,11,20,0)");
      sh.addColorStop(1, "rgba(6,11,20,1)");
      g.fillStyle = sh;
      g.fillRect(w * 0.24, 0, w * 0.14 + 1, h);
    }
    const cx = w * 0.69;
    g.fillStyle = C.gold;
    g.font = `700 46px 'IBM Plex Sans Arabic'`;
    g.fillText("الوقت الموفّر · مثال", cx, 86);
    g.font = `700 40px 'IBM Plex Sans Arabic'`;
    g.fillStyle = "rgba(255,255,255,.7)";
    g.fillText("تقرير المبيعات الأسبوعي", cx, 150);
    mixed(g, "قبل:", "3 ساعات", cx, 262, `700 56px 'IBM Plex Sans Arabic'`, `700 92px ${BOARD}`, "#fff", "#FF6B6B");
    mixed(g, "بعد:", "40 دقيقة", cx, 392, `700 56px 'IBM Plex Sans Arabic'`, `700 92px ${BOARD}`, "#fff", C.ok);
    g.fillStyle = C.ok;
    g.font = `700 44px 'IBM Plex Sans Arabic'`;
    g.fillText("مشروع حقيقي ✓", cx, 500);
    g.globalAlpha = 1;
    return;
  }
  // الوضع الافتراضي: مؤشّر الأسابيع
  g.fillStyle = "#fff";
  g.font = `700 54px 'IBM Plex Sans Arabic'`;
  g.fillText("معسكر الإعداد", w / 2, 92);
  const active = k === "w1" ? 0 : k === "w2" ? 1 : k === "w3" ? 2 : k === "w4" ? 3 : -1;
  const cols = [C.w1, C.w2, C.w3, C.w4];
  const names = ["أساسيات", "تطبيق", "أتمتة", "مشروع"];
  for (let i = 0; i < 4; i++) {
    const bx = w - 60 - (i + 1) * 205 - i * 14 + 14;
    const on = i === active;
    g.fillStyle = on ? cols[i] : "rgba(255,255,255,.08)";
    g.beginPath();
    g.roundRect(bx, 160, 205, 300, 22);
    g.fill();
    g.fillStyle = on ? "#06101C" : cols[i];
    g.font = `700 190px ${BOARD}`;
    g.fillText(String(i + 1), bx + 102, 350);
    g.font = `700 40px 'IBM Plex Sans Arabic'`;
    g.fillText(names[i], bx + 102, 425);
  }
  g.fillStyle = "rgba(255,255,255,.55)";
  g.font = `700 34px 'IBM Plex Sans Arabic'`;
  g.direction = "rtl";
  g.font = `700 40px ${BOARD}`;
  g.fillStyle = C.gold;
  g.fillText("30 يوم · 4 أسابيع", w / 2, 525);
};

/* ───── إبراز منطقة الأسبوع على العشب ───── */
const Zone: React.FC<{ z: number; color: string; o: number }> = ({ z, color, o }) =>
  o <= 0.01 ? null : (
    <group position={[0, 0.02, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[27, 11.4]} />
        <meshBasicMaterial color={color} transparent opacity={0.16 * o} depthWrite={false} toneMapped={false} />
      </mesh>
      {[-5.7, 5.7].map((dz) => (
        <mesh key={dz} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, dz]}>
          <planeGeometry args={[27, 0.14]} />
          <meshBasicMaterial color={color} transparent opacity={0.9 * o} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );

export const Scene3D: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const k = cur(f);
  const team = useImage(V("team.jpg"));
  const avatar = useImage(staticFile("avatar.png"));
  const cam = camAt(f);
  const show = ease(f, SEG.hook[1] - 26, 30, OUT);
  const plf = lp(f, "plan");
  const zoneO = (i: number, kk: SegK) => {
    const inPlan = k === "plan" ? ease(plf, 52 + i * 16, 14, OUT) : 0;
    const active = k === kk ? ease(lp(f, kk), 0, 20, OUT) * (1 - ease(f, SEG[kk][1] - 16, 14, OUT)) : 0;
    return Math.max(inPlan * (1 - ease(f, SEG.plan[1] - 14, 14, OUT)), active * 0.8);
  };
  const ball = ballAt(f);
  const w3 = lp(f, "w3");
  const w4 = lp(f, "w4");
  const ripple = k === "w4" ? Math.max(0, Math.sin((w4 - 76) / 3) * Math.exp(-(w4 - 76) / 14)) * (w4 > 76 ? 1 : 0) : 0;
  const coachShow = k === "w3" ? ease(w3, 150, 16, OUT) : k === "tip" ? ease(lp(f, "tip"), 20, 16, OUT) : 0;
  const coachPos: V3 = k === "tip" ? [0, 0, 0] : COACH_W3;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: show }}>
      <ThreeCanvas width={1080} height={1920} camera={{ fov: FOV, position: [0, 40, 18] }}>
        <StudioEnv intensity={0.5} />
        <fog attach="fog" args={[C.night, 150, 290]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[8, 30, 25]} intensity={1.9 + kick * 0.2} color="#FFF1DC" />
        <directionalLight position={[-12, 18, -30]} intensity={0.9} color="#8FB8FF" />
        <CameraRig pos={cam.pos} look={cam.look} />

        <Pitch w={30} l={62} c1="#226B36" c2="#1E6131" />
        <Zone z={ZONE.w1} color={C.w1} o={zoneO(0, "w1")} />
        <Zone z={ZONE.w2} color={C.w2} o={zoneO(1, "w2")} />
        <Zone z={ZONE.w3} color={C.w3} o={zoneO(2, "w3")} />
        <Zone z={ZONE.w4} color={C.w4} o={zoneO(3, "w4")} />

        {SLALOM_CONES.map((p, i) => (
          <Cone key={i} position={p} />
        ))}
        {/* أقماع حدود دائرة التمرير */}
        {[-4.6, 4.6].map((x) => [ZONE.w2 - 3.4, ZONE.w2 + 3.4].map((z) => <Cone key={`${x}${z}`} position={[x, 0, z]} color="#FFD23F" />))}

        {/* أسهم الخطة الثابتة (الأتمتة) */}
        {k === "w3" || k === "w4"
          ? PLAY.map((pl, i) => <Arrow key={i} pts={pl.pts} t={ease(w3, 34 + i * 14, 46, OUT) * (k === "w4" ? 1 - ease(w4, 10, 20, OUT) : 1)} color={C.w3} />)
          : null}

        {Array.from({ length: N }, (_, i) => {
          const s = player(f, i);
          return <Figure key={i} position={s.p} rotation={[0, s.yaw, 0]} run={s.run} f={f + i * 7} color={C.team} />;
        })}
        {coachShow > 0 ? <Figure position={coachPos} scale={coachShow * 1.08} color="#1D2633" ring={C.gold} band={C.gold} rotation={[0, 0, 0]} /> : null}

        {ball ? <Ball position={ball.p} lift={ball.lift} spin={ball.spin} /> : null}

        <Goal position={[0, 0, -30.4]} w={6.4} h={2.3} d={1.6} ripple={ripple} />
        <Scoreboard position={[0, 6.6, -35.5]} size={10} legs={4.6} draw={boardDraw(f, team, avatar)} />
        <FloodLight position={[-16, 0, -38]} glow={0.8 + kick * 0.2} />
        <FloodLight position={[16, 0, -38]} glow={0.8 + kick * 0.2} />
      </ThreeCanvas>
    </div>
  );
};
