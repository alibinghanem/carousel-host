import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";

type G = ThreeElements["group"];
type V3 = [number, number, number];

/** شعاع مضيء بين نقطتين (إشارة قمر ← جوال). progress: 0..1 لرسمه تدريجياً · dash: متقطّع */
export const Beam: React.FC<{ from: V3; to: V3; color?: string; r?: number; progress?: number; glow?: number; dash?: boolean }> = ({ from, to, color = "#5CF2FF", r = 0.035, progress = 1, glow = 1, dash = false }) => {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const dir = b.clone().sub(a);
  const len = dir.length() * Math.max(0.001, progress);
  const mid = a.clone().add(dir.clone().normalize().multiplyScalar(len / 2));
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  const n = dash ? Math.floor(len / 0.5) : 1;
  return (
    <group>
      {dash ? (
        Array.from({ length: n }, (_, i) => {
          const p = a.clone().add(dir.clone().normalize().multiplyScalar(0.25 + i * 0.5));
          return (
            <mesh key={i} position={p} quaternion={q}>
              <cylinderGeometry args={[r, r, 0.28, 8]} />
              <meshBasicMaterial color={color} toneMapped={false} />
            </mesh>
          );
        })
      ) : (
        <>
          <mesh position={mid} quaternion={q}>
            <cylinderGeometry args={[r, r, len, 10]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
          <mesh position={mid} quaternion={q}>
            <cylinderGeometry args={[r * 4, r * 4, len, 12]} />
            <meshBasicMaterial color={color} transparent opacity={0.16 * glow} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        </>
      )}
    </group>
  );
};

/** موجات إشارة متتالية (حلقات تكبر وتخفت) باتجاه محور -Y افتراضياً */
export const SignalRings: React.FC<{ n?: number; t?: number; color?: string; max?: number } & G> = ({ n = 5, t = 0, color = "#5CF2FF", max = 3.2, ...rest }) => (
  <group {...rest}>
    {Array.from({ length: n }, (_, i) => {
      const k = (t + i / n) % 1;
      return (
        <mesh key={i} position={[0, -k * max * 0.9, 0]} rotation={[Math.PI / 2, 0, 0]} scale={0.3 + k * 1.4}>
          <torusGeometry args={[1, 0.035, 8, 64]} />
          <meshBasicMaterial color={color} transparent opacity={(1 - k) * 0.85} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      );
    })}
  </group>
);

/** كرة مسافة شبه شفافة مع شبكة سلكية، تتقاطع مع غيرها بتوهج */
export const DistSphere: React.FC<{ r: number; color?: string; opacity?: number } & G> = ({ r, color = "#5CF2FF", opacity = 0.14, ...rest }) => (
  <group {...rest}>
    <mesh>
      <sphereGeometry args={[r, 64, 48]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
    <mesh>
      <sphereGeometry args={[r * 1.002, 28, 20]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  </group>
);

/** مبنى بنوافذ مضيئة (canvas) */
export const Building: React.FC<{ w?: number; h?: number; d?: number; color?: string; seed?: number } & G> = ({ w = 2, h = 6, d = 2, color = "#2A3346", seed = 1, ...rest }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 512;
    const g = c.getContext("2d")!;
    g.fillStyle = color;
    g.fillRect(0, 0, 256, 512);
    let s = seed * 97;
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 6; x++) {
        s = (s * 9301 + 49297) % 233280;
        const on = s / 233280 > 0.45;
        g.fillStyle = on ? "#FFD98A" : "#1A2132";
        g.fillRect(14 + x * 40, 16 + y * 30, 26, 18);
      }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [color, seed]);
  return (
    <group {...rest}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.55} roughness={0.7} />
      </mesh>
    </group>
  );
};

/** دبوس خريطة 3D (قطرة بلون مع كرة) */
export const Pin: React.FC<{ color?: string } & G> = ({ color = "#E5484D", ...rest }) => (
  <group {...rest}>
    <mesh position={[0, 0.9, 0]}>
      <sphereGeometry args={[0.62, 32, 24]} />
      <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={1} />
    </mesh>
    <mesh position={[0, 0.3, 0]} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[0.55, 1.1, 32]} />
      <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={1} />
    </mesh>
    <mesh position={[0, 0.95, 0.5]}>
      <sphereGeometry args={[0.2, 20, 16]} />
      <meshBasicMaterial color="#fff" />
    </mesh>
  </group>
);

/** ساعة ذرّية مبسّطة: قرص بميناء وعقارب (للقمر) */
export const ClockDial: React.FC<{ t?: number } & G> = ({ t = 0, ...rest }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d")!;
    g.fillStyle = "#0B1730";
    g.beginPath();
    g.arc(256, 256, 250, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#5CF2FF";
    g.lineWidth = 10;
    g.beginPath();
    g.arc(256, 256, 236, 0, Math.PI * 2);
    g.stroke();
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const l = i % 5 === 0 ? 34 : 14;
      g.strokeStyle = i % 5 === 0 ? "#fff" : "#7FA3C8";
      g.lineWidth = i % 5 === 0 ? 8 : 4;
      g.beginPath();
      g.moveTo(256 + Math.sin(a) * 214, 256 - Math.cos(a) * 214);
      g.lineTo(256 + Math.sin(a) * (214 - l), 256 - Math.cos(a) * (214 - l));
      g.stroke();
    }
    const tt = new THREE.CanvasTexture(c);
    tt.colorSpace = THREE.SRGBColorSpace;
    return tt;
  }, []);
  return (
    <group {...rest}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.22, 64]} />
        <meshStandardMaterial color="#C9D1DA" metalness={0.9} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0, 0.12]}>
        <circleGeometry args={[1.42, 64]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <group position={[0, 0, 0.16]} rotation={[0, 0, -t * Math.PI * 2]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.1, 1.0, 0.04]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
      </group>
      <group position={[0, 0, 0.17]} rotation={[0, 0, -t * Math.PI * 24 * 0.25]}>
        <mesh position={[0, 0.62, 0]}>
          <boxGeometry args={[0.06, 1.24, 0.04]} />
          <meshBasicMaterial color="#5CF2FF" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};
