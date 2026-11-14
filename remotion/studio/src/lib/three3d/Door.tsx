import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

type G = ThreeElements["group"];

/**
 * باب بإطار: إطار خشبي (3 قطع)، ولوح باب بمفصلة على الحافة اليسرى، ومقبض، وقطعة قفل.
 * open: 0..1 يفتح الباب للأمام (حتى ~70°) · الفتحة الداخلية 2.4 × 4.2 والمركز عند الأصل.
 * الباب يطل على +Z.
 */
export const Door3D: React.FC<{ open?: number; wood?: string; panel?: string; children?: React.ReactNode } & G> = ({ open = 0, wood = "#5A3A22", panel = "#8B5E3C", children, ...rest }) => {
  const leaf = useMemo(() => new RoundedBoxGeometry(2.36, 4.14, 0.16, 4, 0.05), []);
  const inset = useMemo(() => new RoundedBoxGeometry(1.7, 1.55, 0.05, 3, 0.04), []);
  const woodMat = <meshPhysicalMaterial color={wood} roughness={0.55} clearcoat={0.3} />;
  return (
    <group {...rest}>
      <mesh position={[-1.4, 0, 0]}>
        <boxGeometry args={[0.4, 4.9, 0.36]} />
        {woodMat}
      </mesh>
      <mesh position={[1.4, 0, 0]}>
        <boxGeometry args={[0.4, 4.9, 0.36]} />
        {woodMat}
      </mesh>
      <mesh position={[0, 2.35, 0]}>
        <boxGeometry args={[3.2, 0.4, 0.36]} />
        {woodMat}
      </mesh>
      <mesh position={[0, 0, -0.14]}>
        <planeGeometry args={[2.4, 4.2]} />
        <meshBasicMaterial color="#0B1220" />
      </mesh>
      <group position={[-1.18, 0, 0.02]} rotation={[0, -open * 1.2, 0]}>
        <group position={[1.18, 0, 0]}>
          <mesh geometry={leaf}>
            <meshPhysicalMaterial color={panel} roughness={0.5} clearcoat={0.4} />
          </mesh>
          <mesh geometry={inset} position={[0, 1.05, 0.1]}>
            <meshPhysicalMaterial color={wood} roughness={0.6} />
          </mesh>
          <mesh geometry={inset} position={[0, -1.1, 0.1]}>
            <meshPhysicalMaterial color={wood} roughness={0.6} />
          </mesh>
          <mesh position={[0.82, -0.1, 0.16]}>
            <sphereGeometry args={[0.13, 24, 18]} />
            <meshStandardMaterial color="#E2C46A" metalness={1} roughness={0.25} />
          </mesh>
          <mesh position={[0.82, -0.1, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.16, 12]} />
            <meshStandardMaterial color="#E2C46A" metalness={1} roughness={0.25} />
          </mesh>
          <mesh position={[0.78, -0.55, 0.09]}>
            <boxGeometry args={[0.4, 0.5, 0.05]} />
            <meshStandardMaterial color="#AEB6C2" metalness={0.9} roughness={0.3} />
          </mesh>
          {children}
        </group>
      </group>
    </group>
  );
};

/** مؤقت (ستوب ووتش) بحلقة صفراء ومينا وعقرب أحمر. rot: دوران العقرب (راديان) */
export const Stopwatch3D: React.FC<{ rot?: number; ring?: string } & G> = ({ rot = -0.5, ring = "#FFC933", ...rest }) => (
  <group {...rest}>
    <mesh>
      <torusGeometry args={[0.9, 0.1, 20, 56]} />
      <meshPhysicalMaterial color={ring} metalness={0.5} roughness={0.25} clearcoat={0.8} />
    </mesh>
    <mesh position={[0, 0, -0.02]}>
      <circleGeometry args={[0.9, 56]} />
      <meshStandardMaterial color="#F6F3EC" />
    </mesh>
    <mesh position={[0, 1.08, 0]}>
      <cylinderGeometry args={[0.14, 0.14, 0.22, 20]} />
      <meshStandardMaterial color={ring} metalness={0.5} roughness={0.3} />
    </mesh>
    <group rotation={[0, 0, rot]}>
      <mesh position={[0, 0.28, 0.02]}>
        <boxGeometry args={[0.07, 0.62, 0.04]} />
        <meshBasicMaterial color="#FF3B30" />
      </mesh>
    </group>
    <mesh position={[0, 0, 0.03]}>
      <circleGeometry args={[0.08, 16]} />
      <meshBasicMaterial color="#14161C" />
    </mesh>
    {Array.from({ length: 12 }, (_, i) => (
      <mesh key={i} position={[Math.sin((i / 12) * Math.PI * 2) * 0.74, Math.cos((i / 12) * Math.PI * 2) * 0.74, 0.01]} rotation={[0, 0, -(i / 12) * Math.PI * 2]}>
        <boxGeometry args={[0.04, i % 3 === 0 ? 0.16 : 0.08, 0.02]} />
        <meshBasicMaterial color="#14161C" />
      </mesh>
    ))}
  </group>
);

/** مثلث تحذير ثلاثي الأبعاد بعلامة تعجب */
export const WarnTriangle: React.FC<{ color?: string } & G> = ({ color = "#FFC933", ...rest }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 1.0);
    s.lineTo(1.0, -0.7);
    s.lineTo(-1.0, -0.7);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.08, bevelSegments: 4 });
  }, []);
  return (
    <group {...rest}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.9} />
      </mesh>
      <mesh position={[0, 0.05, 0.22]}>
        <boxGeometry args={[0.16, 0.7, 0.06]} />
        <meshBasicMaterial color="#14161C" />
      </mesh>
      <mesh position={[0, -0.5, 0.22]}>
        <sphereGeometry args={[0.1, 16, 12]} />
        <meshBasicMaterial color="#14161C" />
      </mesh>
    </group>
  );
};

/** مفتاح أمان USB: جسم أبيض بحلقة، لسان ذهبي، وزر دائري */
export const SecurityKey: React.FC<{ glow?: number } & G> = ({ glow = 0, ...rest }) => {
  const body = useMemo(() => new RoundedBoxGeometry(0.9, 1.7, 0.16, 5, 0.1), []);
  return (
    <group {...rest}>
      <mesh geometry={body}>
        <meshPhysicalMaterial color="#F2F4F7" roughness={0.3} clearcoat={0.8} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[0.62, 0.5, 0.08]} />
        <meshStandardMaterial color="#D8B456" metalness={1} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.05, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.03, 32]} />
        <meshStandardMaterial color="#2B6CF0" emissive="#2B6CF0" emissiveIntensity={0.3 + glow} />
      </mesh>
      <mesh position={[0, -0.62, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.04, 12, 28]} />
        <meshStandardMaterial color="#AEB6C2" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
};
