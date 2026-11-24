import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

type G = ThreeElements["group"];

/** ميكروفون: رأس كبسولة بشبك، حامل U، وساق وقاعدة. الارتفاع ~3 وحدات */
export const Mic3D: React.FC<{ color?: string } & G> = ({ color = "#2F3A48", ...rest }) => (
  <group {...rest}>
    <mesh position={[0, 0.75, 0]}>
      <capsuleGeometry args={[0.55, 0.9, 12, 32]} />
      <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.8} metalness={0.3} />
    </mesh>
    {[0.35, 0.65, 0.95, 1.25].map((y) => (
      <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.56, 0.025, 8, 48]} />
        <meshStandardMaterial color="#C9D1DA" metalness={1} roughness={0.25} />
      </mesh>
    ))}
    <mesh position={[0, 0.45, 0]} rotation={[0, 0, Math.PI]}>
      <torusGeometry args={[0.82, 0.07, 12, 40, Math.PI]} />
      <meshStandardMaterial color="#C9D1DA" metalness={1} roughness={0.25} />
    </mesh>
    <mesh position={[0, -0.75, 0]}>
      <cylinderGeometry args={[0.07, 0.07, 0.8, 16]} />
      <meshStandardMaterial color="#C9D1DA" metalness={1} roughness={0.25} />
    </mesh>
    <mesh position={[0, -1.2, 0]}>
      <cylinderGeometry args={[0.6, 0.7, 0.14, 40]} />
      <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.8} />
    </mesh>
  </group>
);

/** كاميرا: جسم بزوايا دائرية، عدسة بارزة بزجاج، وزر وفلاش */
export const Camera3D: React.FC<{ color?: string } & G> = ({ color = "#2F3A48", ...rest }) => {
  const body = useMemo(() => new RoundedBoxGeometry(2.6, 1.7, 0.9, 6, 0.22), []);
  const top = useMemo(() => new RoundedBoxGeometry(0.9, 0.36, 0.7, 4, 0.1), []);
  return (
    <group {...rest}>
      <mesh geometry={body}>
        <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.8} metalness={0.2} />
      </mesh>
      <mesh geometry={top} position={[-0.6, 0.95, 0]}>
        <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.8} />
      </mesh>
      <group position={[0.15, -0.05, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.62, 0.66, 0.36, 48]} />
          <meshStandardMaterial color="#C9D1DA" metalness={1} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0.19, 0]}>
          <cylinderGeometry args={[0.46, 0.46, 0.04, 48]} />
          <meshPhysicalMaterial color="#0B1A33" roughness={0.05} clearcoat={1} metalness={0.4} />
        </mesh>
        <mesh position={[0.15, 0.22, -0.15]}>
          <sphereGeometry args={[0.09, 16, 12]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
        </mesh>
      </group>
      <mesh position={[0.95, 0.6, 0.46]}>
        <boxGeometry args={[0.4, 0.22, 0.04]} />
        <meshStandardMaterial color="#F4F7FA" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
};

/** عين (للتتبّع): كرة بيضاء بقزحية وبؤبؤ، وحلقة منع اختيارية. ban: 0..1 */
export const Eye3D: React.FC<{ iris?: string; ban?: number } & G> = ({ iris = "#3B82F6", ban = 0, ...rest }) => (
  <group {...rest}>
    <mesh scale={[1.25, 0.8, 0.8]}>
      <sphereGeometry args={[1, 48, 32]} />
      <meshPhysicalMaterial color="#F7F8FA" roughness={0.2} clearcoat={1} />
    </mesh>
    <mesh position={[0, 0, 0.72]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.42, 0.42, 0.06, 40]} />
      <meshPhysicalMaterial color={iris} roughness={0.3} clearcoat={1} />
    </mesh>
    <mesh position={[0, 0, 0.76]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.2, 0.2, 0.06, 32]} />
      <meshBasicMaterial color="#0A0F18" />
    </mesh>
    {ban > 0 ? (
      <group position={[0, 0, 0.9]} scale={ban}>
        <mesh>
          <torusGeometry args={[1.45, 0.12, 16, 64]} />
          <meshPhysicalMaterial color="#E5484D" roughness={0.3} clearcoat={1} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[2.8, 0.24, 0.2]} />
          <meshPhysicalMaterial color="#E5484D" roughness={0.3} clearcoat={1} />
        </mesh>
      </group>
    ) : null}
  </group>
);

/** هالة ناعمة خلف عنصر (دائرة مضيئة) */
export const Halo: React.FC<{ color?: string; r?: number; o?: number } & G> = ({ color = "#E1B653", r = 2, o = 0.25, ...rest }) => (
  <mesh {...rest}>
    <circleGeometry args={[r, 48]} />
    <meshBasicMaterial color={color} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
  </mesh>
);
