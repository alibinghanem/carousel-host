import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";

type G = ThreeElements["group"];
export type V3 = [number, number, number];

/**
 * ملعب كرة قدم بنقشة عشب وخطوط بيضاء، مسطّح على XZ (الطول على z).
 * w × l بالوحدات، والنقشة canvas تنرسم مرة وحدة.
 */
export const Pitch: React.FC<{ w?: number; l?: number; c1?: string; c2?: string } & G> = ({ w = 30, l = 60, c1 = "#2F8F45", c2 = "#2A8240", ...rest }) => {
  const tex = useMemo(() => {
    const W = 1024;
    const H = Math.round((W * l) / w);
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d")!;
    const stripes = 12;
    for (let i = 0; i < stripes; i++) {
      g.fillStyle = i % 2 ? c1 : c2;
      g.fillRect(0, (i * H) / stripes, W, H / stripes + 1);
    }
    // حبيبات عشب خفيفة
    for (let i = 0; i < 9000; i++) {
      g.fillStyle = `rgba(${i % 2 ? "255,255,255" : "0,0,0"},0.035)`;
      g.fillRect((i * 97.13) % W, (i * 57.71) % H, 2, 2);
    }
    const u = W / w; // بكسل لكل وحدة
    g.strokeStyle = "rgba(255,255,255,.92)";
    g.lineWidth = 0.16 * u;
    const m = 1 * u;
    g.strokeRect(m, m, W - 2 * m, H - 2 * m);
    g.beginPath();
    g.moveTo(m, H / 2);
    g.lineTo(W - m, H / 2);
    g.stroke();
    g.beginPath();
    g.arc(W / 2, H / 2, 4.6 * u, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(W / 2, H / 2, 0.25 * u, 0, Math.PI * 2);
    g.fill();
    for (const top of [true, false]) {
      const y0 = top ? m : H - m;
      const s = top ? 1 : -1;
      g.strokeRect(W / 2 - 10 * u, top ? y0 : y0 - 8 * u, 20 * u, 8 * u);
      g.strokeRect(W / 2 - 4.5 * u, top ? y0 : y0 - 3 * u, 9 * u, 3 * u);
      g.beginPath();
      g.arc(W / 2, y0 + s * 8 * u, 3.2 * u, top ? 0.15 * Math.PI : 1.15 * Math.PI, top ? 0.85 * Math.PI : 1.85 * Math.PI);
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [w, l, c1, c2]);
  return (
    <group {...rest}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, l]} />
        <meshStandardMaterial map={tex} roughness={0.92} metalness={0} />
      </mesh>
      {/* أطراف داكنة حول الملعب */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[w * 4, l * 3]} />
        <meshStandardMaterial color="#14301E" roughness={1} />
      </mesh>
    </group>
  );
};

/** ظل دائري ناعم على الأرض */
const blobTex = (() => {
  let t: THREE.CanvasTexture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(0,0,0,.75)");
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    t = new THREE.CanvasTexture(c);
    return t;
  };
})();
export const Blob: React.FC<{ r?: number; o?: number } & G> = ({ r = 0.7, o = 0.6, ...rest }) => (
  <group {...rest}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
      <planeGeometry args={[r * 2, r * 2]} />
      <meshBasicMaterial map={blobTex()} transparent opacity={o} depthWrite={false} />
    </mesh>
  </group>
);

/**
 * لاعب مجسّم بأسلوب قطع لوحة التكتيك: قاعدة، جسم كبسولة بلون الفريق، رأس، وحلقة لون (للقائد).
 * run: 0..1 يضيف ارتداد الجري · ring: لون حلقة القاعدة
 */
export const Figure: React.FC<{ color?: string; head?: string; ring?: string; run?: number; f?: number; band?: string } & G> = ({ color = "#2F6BFF", head = "#F3E6D8", ring, run = 0, f = 0, band, ...rest }) => {
  const bob = run * Math.abs(Math.sin(f / 3.2)) * 0.16;
  return (
    <group {...rest}>
      <Blob r={0.62} o={0.55} />
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.44, 0.48, 0.12, 40]} />
        <meshStandardMaterial color={ring ?? "#F5F7FA"} roughness={0.35} metalness={0.2} emissive={ring ?? "#000"} emissiveIntensity={ring ? 0.35 : 0} />
      </mesh>
      <group position={[0, bob, 0]}>
        <mesh position={[0, 0.72, 0]}>
          <capsuleGeometry args={[0.3, 0.62, 8, 24]} />
          <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.6} />
        </mesh>
        {band ? (
          <mesh position={[0, 0.98, 0]}>
            <cylinderGeometry args={[0.315, 0.315, 0.1, 32]} />
            <meshStandardMaterial color={band} emissive={band} emissiveIntensity={0.4} />
          </mesh>
        ) : null}
        <mesh position={[0, 1.42, 0]}>
          <sphereGeometry args={[0.24, 32, 24]} />
          <meshStandardMaterial color={head} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
};

/** قمع تدريب برتقالي بحلقة بيضاء */
export const Cone: React.FC<{ color?: string } & G> = ({ color = "#FF7A1A", ...rest }) => (
  <group {...rest}>
    <Blob r={0.38} o={0.45} />
    <mesh position={[0, 0.03, 0]}>
      <boxGeometry args={[0.56, 0.06, 0.56]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.34, 0]}>
      <coneGeometry args={[0.22, 0.62, 32]} />
      <meshStandardMaterial color={color} roughness={0.45} />
    </mesh>
    <mesh position={[0, 0.32, 0]}>
      <cylinderGeometry args={[0.122, 0.142, 0.1, 32, 1, true]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.4} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

/** كرة بنقشة كلاسيكية (بقع داكنة). المجموعة على الأرض، lift ارتفاع الكرة فوقها، spin بالراديان */
export const Ball: React.FC<{ r?: number; spin?: number; lift?: number } & G> = ({ r = 0.32, spin = 0, lift = 0, ...rest }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#F7F7F7";
    g.fillRect(0, 0, 512, 256);
    g.fillStyle = "#1B1F27";
    const pts: [number, number][] = [[64, 128], [192, 128], [320, 128], [448, 128], [0, 40], [128, 40], [256, 40], [384, 40], [512, 40], [0, 216], [128, 216], [256, 216], [384, 216], [512, 216]];
    for (const [x, y] of pts) {
      g.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        g.lineTo(x + Math.cos(a) * 30, y + Math.sin(a) * (y === 128 ? 30 : 20));
      }
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <group {...rest}>
      <Blob r={r * (1.3 + lift * 0.15)} o={0.5 / (1 + lift * 0.6)} />
      <mesh position={[0, r + lift, 0]} rotation={[spin, spin * 0.4, 0]}>
        <sphereGeometry args={[r, 40, 28]} />
        <meshStandardMaterial map={tex} roughness={0.38} />
      </mesh>
    </group>
  );
};

/** مرمى: قائمين وعارضة وشبكة. w عرض، h ارتفاع، d عمق. ripple: اهتزاز الشبكة */
export const Goal: React.FC<{ w?: number; h?: number; d?: number; ripple?: number } & G> = ({ w = 6, h = 2.2, d = 1.8, ripple = 0, ...rest }) => {
  const net = useMemo(() => {
    const seg: number[] = [];
    const step = 0.3;
    const back = (x: number, y: number): V3 => [x, y, -d];
    for (let x = -w / 2; x <= w / 2 + 1e-6; x += step) seg.push(...back(x, 0), ...back(x, h));
    for (let y = 0; y <= h + 1e-6; y += step) seg.push(...back(-w / 2, y), ...back(w / 2, y));
    for (let x = -w / 2; x <= w / 2 + 1e-6; x += step) seg.push(x, h, 0, x, h, -d);
    for (const sx of [-w / 2, w / 2]) {
      for (let y = 0; y <= h + 1e-6; y += step) seg.push(sx, y, 0, sx, y, -d);
      for (let z = 0; z <= d + 1e-6; z += step) seg.push(sx, 0, -z, sx, h, -z);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));
    return geo;
  }, [w, h, d]);
  const post = (x: number) => (
    <mesh position={[x, h / 2, 0]}>
      <cylinderGeometry args={[0.09, 0.09, h, 20]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
    </mesh>
  );
  return (
    <group {...rest}>
      {post(-w / 2)}
      {post(w / 2)}
      <mesh position={[0, h, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, w + 0.18, 20]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>
      <lineSegments geometry={net} scale={[1, 1, 1 + ripple * 0.35]}>
        <lineBasicMaterial color="#FFFFFF" transparent opacity={0.55} />
      </lineSegments>
    </group>
  );
};

/** سهم تكتيك مضيء على الأرض يترسم تدريجياً (t: 0..1) */
export const Arrow: React.FC<{ pts: V3[]; t: number; color?: string; r?: number } & G> = ({ pts, t, color = "#FFC23D", r = 0.08, ...rest }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), [pts]);
  const tt = Math.max(0, Math.min(1, t));
  const geo = useMemo(() => {
    if (tt <= 0.01) return null;
    const n = Math.max(2, Math.round(60 * tt));
    const sub = Array.from({ length: n + 1 }, (_, i) => curve.getPointAt((i / n) * tt));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sub), n * 2, r, 10, false);
  }, [curve, tt, r]);
  if (!geo) return null;
  const end = curve.getPointAt(tt);
  const tan = curve.getTangentAt(tt);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan.clone().normalize());
  return (
    <group {...rest}>
      <mesh geometry={geo}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      <mesh position={end} quaternion={q}>
        <coneGeometry args={[r * 3.2, r * 7, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
    </group>
  );
};

/** نقطة على منحنى (لمسار لاعب) مع اتجاهه */
export const along = (pts: V3[], t: number): { p: V3; yaw: number } => {
  const c = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  const tt = Math.max(0, Math.min(1, t));
  const p = c.getPointAt(tt);
  const tan = c.getTangentAt(tt);
  return { p: [p.x, p.y, p.z], yaw: Math.atan2(tan.x, tan.z) };
};

/** برج كشافات: عمود ولوحة إضاءة متوهجة */
export const FloodLight: React.FC<{ h?: number; glow?: number } & G> = ({ h = 14, glow = 1, ...rest }) => (
  <group {...rest}>
    <mesh position={[0, h / 2, 0]}>
      <cylinderGeometry args={[0.18, 0.28, h, 16]} />
      <meshStandardMaterial color="#3A4250" metalness={0.6} roughness={0.4} />
    </mesh>
    <mesh position={[0, h + 0.9, 0]}>
      <boxGeometry args={[3.2, 1.8, 0.3]} />
      <meshStandardMaterial color="#2A303A" metalness={0.5} roughness={0.4} />
    </mesh>
    {[-1, 0, 1].map((i) =>
      [-0.45, 0.45].map((j) => (
        <mesh key={`${i}${j}`} position={[i * 1.0, h + 0.9 + j, 0.17]}>
          <circleGeometry args={[0.36, 24]} />
          <meshBasicMaterial color="#FFF6DD" toneMapped={false} transparent opacity={0.6 + 0.4 * glow} />
        </mesh>
      )),
    )}
  </group>
);

/**
 * لوحة نتائج/شاشة ملعب بشاشة canvas تنرسم كل فريم (draw) — W×H بكسل.
 * size: عرض الشاشة بالوحدات (الارتفاع بنفس نسبة W/H)
 */
export const Scoreboard: React.FC<{ draw: (g: CanvasRenderingContext2D, w: number, h: number) => void; W?: number; H?: number; size?: number; legs?: number } & G> = ({ draw, W = 1000, H = 560, size = 9, legs = 4, ...rest }) => {
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    return c;
  }, [W, H]);
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [canvas]);
  const g = canvas.getContext("2d")!;
  g.clearRect(0, 0, W, H);
  draw(g, W, H);
  tex.needsUpdate = true;
  const sh = (size * H) / W;
  return (
    <group {...rest}>
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[size + 0.5, sh + 0.5, 0.35]} />
        <meshStandardMaterial color="#1C222C" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[size, sh]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {legs > 0
        ? [-size / 3, size / 3].map((x) => (
            <mesh key={x} position={[x, -sh / 2 - legs / 2, -0.25]}>
              <boxGeometry args={[0.35, legs, 0.35]} />
              <meshStandardMaterial color="#2A303A" metalness={0.6} roughness={0.4} />
            </mesh>
          ))
        : null}
    </group>
  );
};
