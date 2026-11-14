import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

type G = ThreeElements["group"];
const D = Math.PI / 180;
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/** زاوية العقرب: v=0 يسار-أسفل (210°) ← v=1 يمين-أسفل (-30°) */
const ang = (v: number) => (210 - 240 * v) * D;

/**
 * عدّاد سرعة: قرص داكن بحلقة معدنية، ثلاث مناطق (أحمر · برتقالي · أخضر)، علامات، وعقرب.
 * v: 0..1 موضع العقرب · يواجه +Z.
 */
export const SpeedDial: React.FC<{ v: number; r?: number } & G> = ({ v, r = 1.5, ...rest }) => {
  const zones: [number, number, string][] = [
    [0, 0.34, "#FF4136"],
    [0.34, 0.67, "#FF9F1C"],
    [0.67, 1, "#9BE564"],
  ];
  const a = ang(clamp(v));
  return (
    <group {...rest}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 0.3, 64]} />
        <meshPhysicalMaterial color="#0E1A1D" metalness={0.4} roughness={0.35} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.0]}>
        <torusGeometry args={[r * 1.02, r * 0.07, 24, 72]} />
        <meshStandardMaterial color="#C9D2DA" metalness={1} roughness={0.22} />
      </mesh>
      {zones.map(([v0, v1, c], i) => (
        <mesh key={i} position={[0, 0, 0.17]}>
          <ringGeometry args={[r * 0.72, r * 0.88, 40, 1, ang(v1), ang(v0) - ang(v1)]} />
          <meshBasicMaterial color={c} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {Array.from({ length: 11 }, (_, i) => {
        const t = ang(i / 10);
        return (
          <mesh key={i} position={[Math.cos(t) * r * 0.62, Math.sin(t) * r * 0.62, 0.17]} rotation={[0, 0, t]}>
            <boxGeometry args={[r * (i % 5 === 0 ? 0.16 : 0.09), r * 0.035, 0.02]} />
            <meshBasicMaterial color="#DCE6EA" toneMapped={false} />
          </mesh>
        );
      })}
      <group rotation={[0, 0, a]}>
        <mesh position={[r * 0.3, 0, 0.22]}>
          <boxGeometry args={[r * 0.72, r * 0.075, 0.05]} />
          <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r * 0.11, r * 0.11, 0.1, 24]} />
        <meshStandardMaterial color="#E9EEF2" metalness={1} roughness={0.2} />
      </mesh>
    </group>
  );
};

const BLOCK_COLORS = ["#FF5C8A", "#8B6CFF", "#3DD6F5", "#FFA23A"]; // صور · فيديو · تطبيقات · ملفات مؤقتة

/**
 * خزّان التخزين: أسطوانة زجاجية مفتوحة فيها مكعبات (صور/فيديو/تطبيقات/كاش) تتكدّس طبقات.
 * fill: 0..1 كم من المكعبات موجودة (تختفي من فوق وتطلع لفوق وهي تروح).
 */
export const StorageTank: React.FC<{ fill: number; f?: number; shake?: number } & G> = ({ fill, f = 0, shake = 0, ...rest }) => {
  const N = 32;
  const H = 3.9;
  const R = 0.82;
  const geo = useMemo(() => new RoundedBoxGeometry(0.4, 0.4, 0.4, 3, 0.07), []);
  const blocks = useMemo(
    () =>
      Array.from({ length: N }, (_, i) => {
        const layer = Math.floor(i / 4);
        const k = i % 4;
        const rot = layer % 2 ? Math.PI / 4 : 0;
        const bx = (k % 2 ? 1 : -1) * 0.24;
        const bz = (k < 2 ? 1 : -1) * 0.24;
        return { x: bx * Math.cos(rot) - bz * Math.sin(rot), z: bx * Math.sin(rot) + bz * Math.cos(rot), layer, c: BLOCK_COLORS[(i * 7 + layer) % 4], rot: rot + ((i * 13) % 10) * 0.05 };
      }),
    [],
  );
  const level = fill * N;
  return (
    <group {...rest}>
      <mesh>
        <cylinderGeometry args={[R, R, H, 64, 1, true]} />
        <meshPhysicalMaterial color="#DDE6F0" transmission={0.92} thickness={0.4} roughness={0.06} ior={1.4} transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {blocks.map((b, i) => {
        const p = clamp(level - i);
        if (p <= 0.001) return null;
        const jx = shake * Math.sin(f * 0.9 + i) * 0.015;
        return (
          <mesh key={i} geometry={geo} position={[b.x + jx, -H / 2 + 0.26 + b.layer * 0.43, b.z]} rotation={[0, b.rot, 0]} scale={p}>
            <meshStandardMaterial color={b.c} emissive={b.c} emissiveIntensity={0.28} roughness={0.4} toneMapped={false} />
          </mesh>
        );
      })}
      <mesh position={[0, H / 2 + 0.05, 0]}>
        <cylinderGeometry args={[R * 1.02, R * 1.02, 0.16, 64]} />
        <meshStandardMaterial color="#C9CED6" metalness={1} roughness={0.22} />
      </mesh>
      <mesh position={[0, -H / 2 - 0.05, 0]}>
        <cylinderGeometry args={[R * 1.02, R * 1.02, 0.16, 64]} />
        <meshStandardMaterial color="#C9CED6" metalness={1} roughness={0.22} />
      </mesh>
    </group>
  );
};

/** سهم دائري (إعادة تشغيل): قوس torus مع رأس سهم. arc بالراديان */
export const CycleArrow: React.FC<{ arc?: number; color?: string; R?: number } & G> = ({ arc = Math.PI * 1.5, color = "#9BE564", R = 1.0, ...rest }) => (
  <group {...rest}>
    <mesh>
      <torusGeometry args={[R, 0.11, 18, 64, Math.max(0.01, arc)]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} roughness={0.35} toneMapped={false} />
    </mesh>
    <group rotation={[0, 0, arc]}>
      <mesh position={[R, 0, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.3, 0.5, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} roughness={0.35} toneMapped={false} />
      </mesh>
    </group>
  </group>
);

/** سهم تنزيل (تحديث): ساق وراس مخروطي وقاعدة صندوق */
export const DownArrow: React.FC<{ color?: string } & G> = ({ color = "#3DD6F5", ...rest }) => (
  <group {...rest}>
    <mesh position={[0, 0.5, 0]}>
      <cylinderGeometry args={[0.28, 0.28, 1.2, 28]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.35} toneMapped={false} />
    </mesh>
    <mesh position={[0, -0.45, 0]} rotation={[0, 0, Math.PI]}>
      <coneGeometry args={[0.65, 0.9, 28]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.35} toneMapped={false} />
    </mesh>
    <mesh position={[0, -1.05, 0]}>
      <boxGeometry args={[1.5, 0.14, 0.5]} />
      <meshStandardMaterial color="#C9D2DA" metalness={0.9} roughness={0.3} />
    </mesh>
  </group>
);
