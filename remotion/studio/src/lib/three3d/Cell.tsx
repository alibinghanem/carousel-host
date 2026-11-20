import type { ThreeElements } from "@react-three/fiber";
import React from "react";

type G = ThreeElements["group"];

/**
 * برج اتصالات: ثلاث أرجل شبكية مائلة بحلقات أفقية، ثلاث لوحات هوائي في القمة، وضوء تحذير أحمر.
 * H الارتفاع (القاعدة عند y=0 والقمة عند y=H). نقطة البث تقريباً عند (0, H-0.15, 0).
 */
export const CellTower3D: React.FC<{ H?: number; beacon?: number } & G> = ({ H = 2.6, beacon = 1, ...rest }) => {
  const R0 = 0.3;
  const R1 = 0.09;
  const tilt = Math.atan((R0 - R1) / H);
  const legs = [0, 1, 2].map((i) => (i * Math.PI * 2) / 3 + Math.PI / 6);
  const rings = [0.18, 0.4, 0.62, 0.84];
  return (
    <group {...rest}>
      {legs.map((a, i) => {
        const cx = Math.cos(a) * (R0 + R1) * 0.5;
        const cz = Math.sin(a) * (R0 + R1) * 0.5;
        return (
          <mesh key={i} position={[cx, H / 2, cz]} rotation={[Math.sin(a) * tilt, 0, -Math.cos(a) * tilt]}>
            <cylinderGeometry args={[0.022, 0.034, H / Math.cos(tilt), 10]} />
            <meshStandardMaterial color="#C7CFD8" metalness={0.8} roughness={0.35} />
          </mesh>
        );
      })}
      {rings.map((t) => {
        const r = R0 + (R1 - R0) * t;
        return (
          <mesh key={t} position={[0, H * t, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r, 0.012, 6, 3]} />
            <meshStandardMaterial color="#AEB8C4" metalness={0.8} roughness={0.4} />
          </mesh>
        );
      })}
      {legs.map((a, i) => (
        <mesh key={i} position={[Math.cos(a + 0.52) * 0.15, H - 0.2, Math.sin(a + 0.52) * 0.15]} rotation={[0, -(a + 0.52), 0]}>
          <boxGeometry args={[0.07, 0.5, 0.12]} />
          <meshPhysicalMaterial color="#EEF1F5" roughness={0.35} clearcoat={0.6} />
        </mesh>
      ))}
      <mesh position={[0, H + 0.06, 0]}>
        <sphereGeometry args={[0.07, 16, 12]} />
        <meshBasicMaterial color="#FF3B30" transparent opacity={0.5 + 0.5 * beacon} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.45, 0.5, 0.08, 24]} />
        <meshStandardMaterial color="#5A6470" roughness={0.6} />
      </mesh>
    </group>
  );
};

/** لوح أرض داكن بحافة (لمشاهد البرج والمباني) */
export const GroundSlab: React.FC<{ w?: number; d?: number; color?: string } & G> = ({ w = 8.4, d = 2.6, color = "#2A2038", ...rest }) => (
  <group {...rest}>
    <mesh position={[0, -0.1, 0]}>
      <boxGeometry args={[w, 0.2, d]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.002, d / 2 - 0.05]}>
      <boxGeometry args={[w, 0.01, 0.05]} />
      <meshBasicMaterial color="#6E5C90" toneMapped={false} />
    </mesh>
  </group>
);
