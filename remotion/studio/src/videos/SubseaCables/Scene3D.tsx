import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { staticFile } from "remotion";
import * as THREE from "three";
import { Phone, ScreenDraw, useImage } from "../../lib/three3d/Phone";
import { Anchor, CableSection, Globe, useTex, LL, Node, Route, SeaFloor, Satellite, V3, faceRot, ll } from "../../lib/three3d/Ocean";
import { CameraRig, Lights, StudioEnv } from "../../lib/three3d/Studio";
import { BACK, IN_OUT, OUT, SEG, SegK, V, ease } from "./theme";

export const FOV = 30;
const R = 2.7;
const lp = (f: number, k: SegK) => f - SEG[k][0];
export const cur = (f: number): SegK => (Object.keys(SEG) as SegK[]).find((k) => f >= SEG[k][0] && f < SEG[k][1]) ?? "end";
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/* ───── الكاميرا (مشتركة مع طبقة HTML) ───── */
type Cam = { pos: V3; look: V3 };
export const camAt = (f: number): Cam => {
  const sway = Math.sin(f / 90) * 0.18;
  const hit = ease(f, SEG.hit[0] - 14, 30, IN_OUT) * (1 - ease(f, SEG.reroute[0] - 14, 30, IN_OUT));
  const base: Cam = { pos: [sway, 0.6, 27], look: [0, 0.2, 0] };
  const seabed: Cam = { pos: [0, 5.2, 24], look: [0, -1.3, 0] };
  return { pos: lerp3(base.pos, seabed.pos, hit), look: lerp3(base.look, seabed.look, hit) };
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

/* ───── مسارات الكابلات (توضيحية، مبسّطة) ───── */
export const JEDDAH: LL = [21.5, 39.2];
export const TRIP: LL[] = [JEDDAH, [24.5, 36.6], [27.6, 34.3], [29.9, 32.6], [31.2, 29.9], [35, 20], [38, 12], [43.2, 5.4]];
export const CUT_AT: LL = [22.8, 38.3];
const ALT: LL[] = [JEDDAH, [12.8, 43.4], [11, 51], [-34, 18], [14.7, -17.4], [38.7, -9.1]];
const WORLD: { pts: LL[]; at: number; color: string }[] = [
  { pts: [[43.2, 5.4], [38, 12], [31.2, 29.9], [29.9, 32.6], [21.5, 39.2], [12, 45], [19, 72.8]], at: 0, color: "#37E6FF" },
  { pts: [[40.6, -74], [48, -30], [50, -5]], at: 14, color: "#5CF2D6" },
  { pts: [[34, -118], [38, -165], [35.7, 139.7]], at: 28, color: "#7FB8FF" },
  { pts: [[50, -5], [36, -9], [10, -17], [-34, 18]], at: 42, color: "#37E6FF" },
  { pts: [[-34, 18], [-20, 50], [-6, 70], [19, 72.8]], at: 56, color: "#5CF2D6" },
  { pts: [[19, 72.8], [10, 78], [1.3, 103.8]], at: 70, color: "#7FB8FF" },
  { pts: [[1.3, 103.8], [22, 114], [35.7, 139.7]], at: 84, color: "#37E6FF" },
  { pts: [[1.3, 103.8], [-20, 120], [-33.9, 151.2]], at: 98, color: "#5CF2D6" },
  { pts: [[-23.5, -46.6], [0, -30], [14.7, -17.4], [38.7, -9.1]], at: 112, color: "#7FB8FF" },
];

/* ───── حالة الكرة (مفاتيح) ───── */
type GK = { f: number; p: V3; s: number; lat: number; lon: number };
const GKEYS: GK[] = [
  { f: 70, p: [0, -2.6, 0], s: 0, lat: 25, lon: 10 },
  { f: 144, p: [0, -1.0, 0], s: 1, lat: 25, lon: 15 },
  { f: 352, p: [0, -1.0, 0], s: 1, lat: 22, lon: 58 },
  { f: 408, p: [-1.0, -0.55, 0], s: 1.55, lat: 33, lon: 22 },
  { f: 640, p: [-1.0, -0.55, 0], s: 1.55, lat: 33, lon: 20 },
  { f: 690, p: [-1.0, -0.55, 0], s: 0, lat: 33, lon: 20 },
  { f: 1224, p: [-1.55, -0.55, 0], s: 0, lat: 24, lon: 38 },
  { f: 1276, p: [-1.55, -0.55, 0], s: 1.5, lat: 24, lon: 36 },
  { f: 1500, p: [-1.55, -0.55, 0], s: 1.5, lat: 22, lon: 30 },
  { f: 1570, p: [0, 0.3, -6.5], s: 1.25, lat: 28, lon: 34 },
  { f: 1755, p: [0, 0.3, -6.5], s: 1.25, lat: 28, lon: 60 },
];
const sm = (t: number) => t * t * (3 - 2 * t);
export const gState = (f: number): GK => {
  if (f <= GKEYS[0].f) return GKEYS[0];
  for (let i = 0; i < GKEYS.length - 1; i++) {
    const a = GKEYS[i];
    const b = GKEYS[i + 1];
    if (f <= b.f) {
      const t = sm((f - a.f) / (b.f - a.f));
      return { f, p: lerp3(a.p, b.p, t), s: lerp(a.s, b.s, t), lat: lerp(a.lat, b.lat, t), lon: lerp(a.lon, b.lon, t) };
    }
  }
  return GKEYS[GKEYS.length - 1];
};

/** نقطة (lat, lon) على الكرة بإحداثيات الشاشة، أو null لو كانت على الجهة الخلفية */
export const gProject = (f: number, lat: number, lon: number, lift = 1.0): [number, number] | null => {
  const g = gState(f);
  const { rx, ry } = faceRot(g.lat, g.lon);
  const m = new THREE.Matrix4().compose(new THREE.Vector3(...g.p), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, 0, "XYZ")), new THREE.Vector3(g.s, g.s, g.s));
  const local = new THREE.Vector3(...ll(lat, lon, R * lift));
  const w = local.clone().applyMatrix4(m);
  const nrm = local.clone().normalize().transformDirection(m);
  const c = camAt(f);
  if (nrm.dot(new THREE.Vector3(...c.pos).sub(w).normalize()) < 0.05) return null;
  return projectW(f, [w.x, w.y, w.z]);
};

/* ───── القمر الصناعي (مقدمة) ───── */
export const satPos = (f: number): V3 => {
  const a = (f - SEG.intro[0]) / 46;
  return [Math.cos(a) * 4.9, 1.2 + Math.sin(a * 0.8) * 0.3, Math.sin(a) * 3.6 + 0.8];
};

/* ───── مقطع الكابل (مشهد cable) ───── */
export const SEC_POS: V3 = [-0.2, -0.1, 0];
export const SEC_ROT: V3 = [0.14, -0.58, 0];
const sectionW = (p: V3): V3 => {
  const m = new THREE.Matrix4().compose(new THREE.Vector3(...SEC_POS), new THREE.Quaternion().setFromEuler(new THREE.Euler(...SEC_ROT, "XYZ")), new THREE.Vector3(1.22, 1.22, 1.22));
  const v = new THREE.Vector3(...p).applyMatrix4(m);
  return [v.x, v.y, v.z];
};
export const secPoint = (p: V3): V3 => sectionW(p);

/* ───── قاع البحر والمرساة (مشهد hit) ───── */
export const SEA_Y = -1.55;
const ANCHOR_Y0 = 0.24;
const anchorY = (f: number) => {
  const l = lp(f, "hit");
  const t = ease(l, 30, 54, (x) => x * x);
  return lerp(2.6, ANCHOR_Y0, t);
};
export const HIT_AT = 84; // فريم الارتطام داخل المشهد

/* ───── الجوال (الختام) ───── */
const avatarScreen =
  (img: HTMLImageElement | null): ScreenDraw =>
  (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, "#0E7490");
    gr.addColorStop(0.6, "#0B4A66");
    gr.addColorStop(1, "#04202E");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#fff";
    g.font = `700 22px 'Space Grotesk'`;
    g.textAlign = "left";
    g.direction = "ltr";
    g.fillText("9:41", 44, 66);
    g.textAlign = "right";
    g.fillText("5G", w - 44, 66);
    if (img) {
      g.save();
      g.beginPath();
      g.arc(w / 2, h / 2 - 60, 210, 0, Math.PI * 2);
      g.fillStyle = "#BFF3FF";
      g.fill();
      g.clip();
      const s = 470 / img.width;
      g.drawImage(img, w / 2 - (img.width * s) / 2, h / 2 - 60 - 210, img.width * s, img.height * s);
      g.restore();
    }
    g.strokeStyle = "#37E6FF";
    g.lineWidth = 6;
    for (let i = 0; i < 3; i++) {
      g.beginPath();
      g.arc(w / 2, h / 2 + 330, 30 + i * 28, Math.PI * 1.15, Math.PI * 1.85);
      g.stroke();
    }
    g.fillStyle = "#37E6FF";
    g.beginPath();
    g.arc(w / 2, h / 2 + 330, 8, 0, Math.PI * 2);
    g.fill();
  };

export const Scene3D: React.FC<{ f: number; kick: number }> = ({ f, kick }) => {
  const k = cur(f);
  const avatar = useImage(staticFile("avatar.png"));
  const earthTex = useTex(V("earth.jpg"));
  const cam = camAt(f);
  const g = gState(f);
  const { rx, ry } = faceRot(g.lat, g.lon);
  const l = lp(f, k);
  const spin = f * 0.0;

  /* الكابلات على الكرة */
  const routes: React.ReactNode[] = [];
  if (g.s > 0.01) {
    if (k === "hook" || k === "intro" || k === "end") {
      WORLD.forEach((w, i) => {
        const base = k === "hook" ? 1e9 : k === "intro" ? SEG.intro[0] + 12 + w.at : 0;
        const d = k === "end" ? 1 : ease(f, base, 46, OUT);
        const p = (((f - base) / 120 + i * 0.17) % 1 + 1) % 1;
        routes.push(<Route key={`w${i}`} pts={w.pts} r={R} draw={d} color={w.color} pulse={d >= 1 ? p : null} width={0.02} />);
      });
      if (k !== "hook") {
        const nodes: LL[] = [JEDDAH, [43.2, 5.4], [40.6, -74], [35.7, 139.7], [1.3, 103.8], [19, 72.8], [-34, 18], [50, -5]];
        nodes.forEach((n, i) => routes.push(<Node key={`n${i}`} at={n} r={R} s={1} ping={((f / 40 + i * 0.3) % 1)} color={i === 0 ? "#FFD166" : "#9FF3FF"} />));
      }
    }
    if (k === "trip") {
      const d = ease(l, 24, 190, IN_OUT);
      const p = ease(l, 40, 190, IN_OUT);
      routes.push(<Route key="trip" pts={TRIP} r={R} draw={d} color="#37E6FF" pulse={p < 0.995 ? p : null} width={0.026} />);
      routes.push(<Node key="j" at={JEDDAH} r={R} s={1.3} ping={(f / 36) % 1} color="#FFD166" />);
      routes.push(<Node key="m" at={TRIP[TRIP.length - 1]} r={R} s={1.3} ping={ease(l, 215, 40) < 1 && l > 215 ? ease(l, 215, 40) : 0} color="#9FF3FF" />);
    }
    if (k === "reroute") {
      const cutT = ease(l, 40, 14, OUT);
      const alt = ease(l, 120, 70, IN_OUT);
      routes.push(<Route key="r0" pts={TRIP} r={R} draw={1} color={cutT > 0.5 ? "#6B7A86" : "#37E6FF"} glow={cutT > 0.5 ? 0.2 : 1} width={0.022} />);
      if (l < 40) routes.push(<Route key="rp" pts={TRIP} r={R} draw={0} pulse={(l / 40) * 0.12} />);
      routes.push(<Route key="alt" pts={ALT} r={R} draw={alt} pulse={l > 140 ? Math.min(0.99, ease(l, 140, 110, IN_OUT)) : null} color="#FFB020" pulseColor="#FFFFFF" width={0.026} />);
      routes.push(<Node key="cut" at={CUT_AT} r={R} s={1.7} ping={cutT > 0 ? (f / 22) % 1 : 0} color="#FF5252" />);
      routes.push(<Node key="j2" at={JEDDAH} r={R} s={1.2} color="#FFD166" />);
    }
  }

  /* مقطع الكابل */
  const secVis = k === "cable";
  const secIn = ease(l, 0, 30, BACK);
  const secOut = 1 - ease(l, 262, 22, IN_OUT);
  const secS = secIn * secOut;
  const ghost = ease(l, 150, 30, OUT);
  const reveal = ease(l, 24, 70, IN_OUT);

  /* مشهد المرساة */
  const hitVis = k === "hit";
  const hitIn = ease(l, 0, 26, OUT) * (1 - ease(l, 264, 22, IN_OUT));
  const landed = l >= HIT_AT;
  const since = Math.max(0, l - HIT_AT);
  const cutGap = ease(since, 6, 40, OUT) * 0.7;
  const shake = landed && since < 18 ? Math.sin(f * 2.4) * 0.12 * (1 - since / 18) : 0;
  const ay = landed ? ANCHOR_Y0 - ease(since, 0, 12, OUT) * 0.12 : anchorY(f);

  const phoneIn = ease(f, SEG.end[0] + 6, 40, OUT);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <ThreeCanvas width={1080} height={1920} camera={{ fov: FOV, position: [0, 0.6, 27] }}>
        <StudioEnv intensity={0.8} />
        <Lights key1="#EAF6FF" rim={k === "reroute" ? "#FF7A7A" : "#37E6FF"} rim2={k === "hit" ? "#FFB020" : "#7FB8FF"} k={2.0 + kick * 0.3} r={58} />
        <CameraRig pos={cam.pos} look={cam.look} />

        {g.s > 0.01 ? (
          <Globe tex={earthTex} r={R} position={g.p} scale={g.s} rx={rx} ry={ry + spin}>
            {routes}
          </Globe>
        ) : null}

        {k === "intro" && l > 40 && l < 340 ? <Satellite position={satPos(f)} scale={0.55} rotation={[0.3, f / 50, 0.2]} /> : null}

        {secVis && secS > 0.01 ? (
          <group position={SEC_POS} rotation={SEC_ROT} scale={secS * 1.22}>
            <CableSection ghost={ghost} reveal={reveal} pulse={(l / 90) % 1} glow={1} />
          </group>
        ) : null}

        {hitVis && hitIn > 0.01 ? (
          <group scale={hitIn}>
            <SeaFloor position={[0, SEA_Y - 0.28, 0]} w={18} d={9} />
            {/* الكابل: نصفين */}
            {[-1, 1].map((s) => {
              const len = 9;
              const x = s * (len / 2 + cutGap);
              return (
                <group key={s} position={[x + (landed ? shake * s : 0), SEA_Y, 0]}>
                  <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.26, 0.26, len, 32]} />
                    <meshPhysicalMaterial color="#2B3138" roughness={0.5} clearcoat={0.4} />
                  </mesh>
                  {landed ? (
                    <mesh position={[-s * len / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                      <cylinderGeometry args={[0.2, 0.2, 0.04, 24]} />
                      <meshBasicMaterial color="#FF5252" toneMapped={false} />
                    </mesh>
                  ) : null}
                </group>
              );
            })}
            {/* نبضات الضوء فوق الكابل: قبل القطع تعبر كله، وبعده تتكدس عند القطع وتختفي والنص الثاني ينطفئ */}
            {Array.from({ length: 5 }, (_, i) => {
              const t = (l / 80 + i * 0.2) % 1;
              const x = landed ? -7 + t * (7 - cutGap - 0.5) : -7 + t * 14;
              return (
                <mesh key={i} position={[x - (landed ? cutGap : 0) * 0, SEA_Y + 0.29, 0]}>
                  <sphereGeometry args={[0.1, 14, 10]} />
                  <meshBasicMaterial color="#9FF3FF" toneMapped={false} />
                </mesh>
              );
            })}
            {/* شرر عند القطع */}
            {landed && since < 30
              ? Array.from({ length: 10 }, (_, i) => {
                  const a = (i / 10) * Math.PI * 2;
                  const t = since / 30;
                  return (
                    <mesh key={i} position={[Math.cos(a) * t * 1.6, SEA_Y + 0.2 + Math.sin(a) * t * 1.4, 0.2]}>
                      <sphereGeometry args={[0.07 * (1 - t), 8, 6]} />
                      <meshBasicMaterial color={i % 2 ? "#FFB020" : "#FF5252"} toneMapped={false} />
                    </mesh>
                  );
                })
              : null}
            {landed ? (
              <mesh position={[0, SEA_Y, 0.25]}>
                <circleGeometry args={[1.2 + since * 0.02, 40]} />
                <meshBasicMaterial color="#FF5252" transparent opacity={0.28 * (1 - ease(since, 30, 60))} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
              </mesh>
            ) : null}
            <Anchor position={[landed ? shake : 0, ay, 0.1]} rotation={[0, 0.5 + Math.sin(f / 30) * 0.1, landed ? 0.06 : Math.sin(f / 18) * 0.12]} scale={0.85} />
          </group>
        ) : null}

        {k === "end" && phoneIn > 0 ? <Phone position={lerp3([0, -7, 3.2], [0, 0.55, 3.2], phoneIn)} rotation={[0.04, Math.sin(l / 50) * 0.12, 0]} scale={0.68} draw={avatarScreen(avatar)} frame="#4A5560" /> : null}
      </ThreeCanvas>
    </div>
  );
};
