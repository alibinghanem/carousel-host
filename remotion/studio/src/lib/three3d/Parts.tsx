import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

type G = ThreeElements["group"];

/** لون حسب نسبة الشحن: أخضر ← أصفر ← أحمر */
export const levelColor = (l: number) => {
  const c = new THREE.Color();
  if (l > 0.5) c.lerpColors(new THREE.Color("#FFD23F"), new THREE.Color("#2BD47D"), (l - 0.5) / 0.5);
  else c.lerpColors(new THREE.Color("#FF3B30"), new THREE.Color("#FFD23F"), l / 0.5);
  return c;
};

/**
 * خلية بطارية زجاجية: غلاف شفاف، سائل مضيء بارتفاع يمثّل النسبة، أغطية معدنية وقطب موجب.
 * level: 0..1 · glow: شدة التوهج
 */
export const BatteryCell: React.FC<{ level: number; glow?: number; r?: number; h?: number; color?: THREE.Color } & G> = ({ level, glow = 1, r = 0.9, h = 3.2, color, ...rest }) => {
  const c = color ?? levelColor(level);
  const inner = Math.max(0.001, level) * (h - 0.36);
  return (
    <group {...rest}>
      <mesh>
        <cylinderGeometry args={[r, r, h, 64, 1, true]} />
        <meshPhysicalMaterial color="#DDE6F0" transmission={0.92} thickness={0.4} roughness={0.06} metalness={0} ior={1.4} transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, -h / 2 + 0.18 + inner / 2, 0]}>
        <cylinderGeometry args={[r * 0.84, r * 0.84, inner, 64]} />
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.55 * glow} roughness={0.35} toneMapped={false} />
      </mesh>
      <mesh position={[0, h / 2 + 0.05, 0]}>
        <cylinderGeometry args={[r * 1.01, r * 1.01, 0.18, 64]} />
        <meshStandardMaterial color="#C9CED6" metalness={1} roughness={0.22} />
      </mesh>
      <mesh position={[0, h / 2 + 0.24, 0]}>
        <cylinderGeometry args={[r * 0.32, r * 0.36, 0.22, 48]} />
        <meshStandardMaterial color="#E7EBF0" metalness={1} roughness={0.18} />
      </mesh>
      <mesh position={[0, -h / 2 - 0.05, 0]}>
        <cylinderGeometry args={[r * 1.01, r * 1.01, 0.18, 64]} />
        <meshStandardMaterial color="#C9CED6" metalness={1} roughness={0.22} />
      </mesh>
    </group>
  );
};

/** ميزان حرارة زجاجي: أنبوب وبصلة وعمود أحمر */
export const Thermometer: React.FC<{ level: number; color?: string } & G> = ({ level, color = "#FF3B30", ...rest }) => {
  const H = 4.2;
  const col = Math.max(0.02, level) * (H - 0.6);
  return (
    <group {...rest}>
      <mesh>
        <capsuleGeometry args={[0.26, H, 8, 32]} />
        <meshPhysicalMaterial color="#E8F0F8" transmission={0.9} roughness={0.05} thickness={0.3} transparent opacity={0.5} depthWrite={false} />
      </mesh>
      <mesh position={[0, -H / 2 - 0.32, 0]}>
        <sphereGeometry args={[0.52, 48, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, -H / 2 + col / 2, 0]}>
        <cylinderGeometry args={[0.13, 0.13, col, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.3} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[0.36, -H / 2 + 0.3 + i * ((H - 0.6) / 8), 0]}>
          <boxGeometry args={[i % 2 ? 0.12 : 0.22, 0.03, 0.03]} />
          <meshStandardMaterial color="#C9D2DC" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
};

/** سلك شحن بمنحنى وفيش USB-C */
export const Cable: React.FC<{ pts: [number, number, number][]; color?: string } & G> = ({ pts, color = "#F2F2F2", ...rest }) => {
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 64, 0.09, 16, false), [pts]);
  const plug = useMemo(() => new RoundedBoxGeometry(0.42, 0.7, 0.2, 4, 0.08), []);
  return (
    <group {...rest}>
      <mesh geometry={geo}>
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <mesh geometry={plug} position={[pts[0][0], pts[0][1] - 0.3, pts[0][2]]}>
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
    </group>
  );
};

/** جزيئات حرارة تطلع لفوق وتختفي */
export const Heat: React.FC<{ f: number; on: number; n?: number; w?: number; base?: number; height?: number; color?: string }> = ({ f, on, n = 40, w = 3.4, base = -2, height = 6, color = "#FF7A2F" }) => {
  const seeds = useMemo(() => Array.from({ length: n }, (_, i) => ({ x: Math.sin(i * 12.9898) * 0.5 * w, z: Math.cos(i * 78.233) * 0.6, s: 0.05 + ((i * 37) % 10) / 100, sp: 0.03 + ((i * 53) % 10) / 300, o: ((i * 97) % 100) / 100 })), [n, w]);
  if (on <= 0) return null;
  return (
    <>
      {seeds.map((p, i) => {
        const t = (p.o + f * p.sp) % 1;
        return (
          <mesh key={i} position={[p.x + Math.sin(f / 15 + i) * 0.15, base + t * height, p.z]}>
            <sphereGeometry args={[p.s, 10, 8]} />
            <meshBasicMaterial color={color} transparent opacity={on * Math.sin(t * Math.PI) * 0.85} toneMapped={false} />
          </mesh>
        );
      })}
    </>
  );
};

/** درع بقفل (حماية البطارية) */
export const Shield: React.FC<{ color?: string } & G> = ({ color = "#2BD47D", ...rest }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 1.2);
    s.bezierCurveTo(0.6, 1.0, 0.9, 0.95, 1.0, 0.9);
    s.bezierCurveTo(1.0, -0.2, 0.6, -0.9, 0, -1.25);
    s.bezierCurveTo(-0.6, -0.9, -1.0, -0.2, -1.0, 0.9);
    s.bezierCurveTo(-0.9, 0.95, -0.6, 1.0, 0, 1.2);
    return new THREE.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 6, curveSegments: 32 });
  }, []);
  return (
    <group {...rest}>
      <mesh geometry={geo} position={[0, 0, -0.15]}>
        <meshPhysicalMaterial color={color} metalness={0.3} roughness={0.25} clearcoat={1} emissive={color} emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
};
