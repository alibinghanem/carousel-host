import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";

type G = ThreeElements["group"];

/**
 * رأس مجسّم (مانيكان) بملامح مبسّطة: بيضة، عينان، حاجبان، أنف، فم، أذنان، رقبة.
 * إحداثيات المحلية: الوجه يطل على +Z، نصف قطر الرأس تقريباً 1 (ارتفاع ~2.3 مع الرقبة).
 * مواقع الملامح (للدوائر الحمراء): العين اليمنى (−0.36, 0.2, 0.86)، اليسرى (0.36, 0.2, 0.86)، الفم (0, −0.42, 0.88).
 */
export const HEAD = { eyeL: [-0.36, 0.2, 0.9] as [number, number, number], eyeR: [0.36, 0.2, 0.9] as [number, number, number], mouth: [0, -0.42, 0.9] as [number, number, number] };

export const Head3D: React.FC<{ skin?: string; blink?: number } & G> = ({ skin = "#D9D3CA", blink = 0, ...rest }) => {
  const mat = <meshPhysicalMaterial color={skin} roughness={0.55} clearcoat={0.25} />;
  return (
    <group {...rest}>
      <mesh scale={[0.88, 1.08, 0.95]}>
        <sphereGeometry args={[1, 64, 48]} />
        {mat}
      </mesh>
      <mesh position={[0, -1.35, -0.1]}>
        <cylinderGeometry args={[0.38, 0.46, 0.9, 32]} />
        {mat}
      </mesh>
      {[HEAD.eyeL, HEAD.eyeR].map((p, i) => (
        <group key={i} position={[p[0], p[1], p[2] - 0.12]}>
          <mesh scale={[1, Math.max(0.12, 1 - blink), 1]}>
            <sphereGeometry args={[0.14, 24, 18]} />
            <meshPhysicalMaterial color="#F8F8F6" roughness={0.2} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0, 0.13]} scale={[1, Math.max(0.12, 1 - blink), 1]}>
            <circleGeometry args={[0.07, 24]} />
            <meshBasicMaterial color="#1B2230" />
          </mesh>
        </group>
      ))}
      {[-0.36, 0.36].map((x) => (
        <mesh key={x} position={[x, 0.46, 0.78]} rotation={[0.1, 0, x > 0 ? -0.08 : 0.08]}>
          <boxGeometry args={[0.36, 0.05, 0.08]} />
          <meshStandardMaterial color="#6B5F55" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, -0.06, 0.95]} rotation={[0.25, 0, 0]}>
        <coneGeometry args={[0.1, 0.34, 20]} />
        {mat}
      </mesh>
      <mesh position={[0, HEAD.mouth[1], HEAD.mouth[2] - 0.04]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.2, 0.026, 12, 32, Math.PI]} />
        <meshStandardMaterial color="#9A6B63" roughness={0.6} />
      </mesh>
      {[-0.86, 0.86].map((x) => (
        <mesh key={x} position={[x, 0.1, -0.05]} scale={[0.4, 1, 0.6]}>
          <sphereGeometry args={[0.2, 20, 16]} />
          {mat}
        </mesh>
      ))}
    </group>
  );
};

/**
 * قناع مزيّف: قشرة نصف كروية أمامية بشبكة سلكية مضيئة وتعبئة شبه شفافة.
 * layers: عدد القشور المتراصّة (كل قشرة أبعد وأخفّ). peel: 0..1 يرفع القناع للأمام ويقلبه عن الرأس.
 */
export const FakeMask: React.FC<{ color?: string; layers?: number; peel?: number; glow?: number; fill?: number } & G> = ({ color = "#FFD23F", layers = 3, peel = 0, glow = 1, fill = 1, ...rest }) => (
  <group {...rest}>
    {Array.from({ length: layers }, (_, i) => {
      const k = i / Math.max(1, layers - 1);
      const lift = peel * (0.35 + i * 0.5);
      return (
        <group key={i} position={[peel * i * 0.14, peel * i * 0.1, lift]} rotation={[-peel * 0.12 * (i + 1), peel * 0.18 * (i + 1), peel * 0.06 * i]}>
          <mesh scale={[0.88 * (1.05 + i * 0.02), 1.08 * (1.05 + i * 0.02), 0.95 * (1.05 + i * 0.02)]} rotation={[0, 0, 0]}>
            <sphereGeometry args={[1, 40, 28, 0, Math.PI, 0.18, Math.PI - 0.5]} />
            <meshBasicMaterial color={color} wireframe transparent opacity={(0.9 - k * 0.45) * glow} toneMapped={false} />
          </mesh>
          <mesh scale={[0.88 * (1.05 + i * 0.02), 1.08 * (1.05 + i * 0.02), 0.95 * (1.05 + i * 0.02)]}>
            <sphereGeometry args={[1, 40, 28, 0, Math.PI, 0.18, Math.PI - 0.5]} />
            <meshBasicMaterial color={color} transparent opacity={(0.13 - k * 0.05) * glow * fill} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      );
    })}
  </group>
);

/** شرائح «غلتش»: ألواح رقيقة مزاحة أفقياً بألوان مضيئة، تبدو كخلل في الفيديو */
export const GlitchSlabs: React.FC<{ color?: string; seed?: number; w?: number; h?: number } & G> = ({ color = "#FF3B57", seed = 1, w = 2.6, h = 3, ...rest }) => {
  const slabs = useMemo(() => {
    const r = (n: number) => {
      const x = Math.sin(n * 91.7 + seed * 13.1) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: 7 }, (_, i) => ({ y: (r(i) - 0.5) * h, hh: 0.05 + r(i + 9) * 0.16, x: (r(i + 3) - 0.5) * 0.9, ww: w * (0.45 + r(i + 5) * 0.5) }));
  }, [seed, w, h]);
  return (
    <group {...rest}>
      {slabs.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, 0]}>
          <boxGeometry args={[s.ww, s.hh, 0.02]} />
          <meshBasicMaterial color={color} transparent opacity={0.55} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

/** عدسة مكبّرة: حلقة معدنية، زجاج شبه شفاف بتوهج، ومقبض. القطر ~2.4 والمقبض لأسفل يسار */
export const Magnifier: React.FC<{ ring?: string; glass?: string } & G> = ({ ring = "#1B1F2A", glass = "#BFE9FF", ...rest }) => (
  <group {...rest}>
    <mesh>
      <torusGeometry args={[1.15, 0.12, 24, 64]} />
      <meshPhysicalMaterial color={ring} metalness={0.8} roughness={0.25} clearcoat={0.8} />
    </mesh>
    <mesh position={[0, 0, -0.02]}>
      <circleGeometry args={[1.15, 64]} />
      <meshPhysicalMaterial color={glass} transparent opacity={0.16} roughness={0.05} clearcoat={1} depthWrite={false} />
    </mesh>
    <mesh position={[-0.55, 0.55, 0.01]} rotation={[0, 0, 0]}>
      <ringGeometry args={[0.62, 0.7, 24, 1, 0.3, 1.0]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.7} toneMapped={false} />
    </mesh>
    <mesh position={[1.1, -1.45, 0]} rotation={[0, 0, Math.PI / 4]}>
      <cylinderGeometry args={[0.16, 0.2, 1.6, 20]} />
      <meshPhysicalMaterial color="#C03A4B" roughness={0.4} clearcoat={0.8} />
    </mesh>
    <mesh position={[0.62, -0.98, 0]} rotation={[0, 0, Math.PI / 4]}>
      <cylinderGeometry args={[0.2, 0.2, 0.3, 20]} />
      <meshStandardMaterial color="#C9D1DA" metalness={1} roughness={0.25} />
    </mesh>
  </group>
);

/** حلقة تحديد مسطّحة بلون (علامة قلم أحمر) تواجه الكاميرا */
export const MarkRing: React.FC<{ r?: number; color?: string; o?: number } & G> = ({ r = 0.3, color = "#FF3B57", o = 1, ...rest }) => (
  <mesh {...rest}>
    <torusGeometry args={[r, r * 0.09, 12, 56]} />
    <meshBasicMaterial color={color} transparent opacity={o} toneMapped={false} />
  </mesh>
);

/** أعمدة موجة صوتية (واجهة مكالمة 3D): n أعمدة بارتفاعات من t */
export const WaveBars: React.FC<{ n?: number; t?: number; color?: string; h?: number } & G> = ({ n = 15, t = 0, color = "#FFD23F", h = 1.2, ...rest }) => (
  <group {...rest}>
    {Array.from({ length: n }, (_, i) => {
      const v = 0.25 + 0.75 * Math.abs(Math.sin(i * 1.3 + t * 2) * Math.cos(i * 0.7 + t));
      return (
        <mesh key={i} position={[(i - (n - 1) / 2) * 0.17, 0, 0]}>
          <boxGeometry args={[0.09, h * v, 0.06]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      );
    })}
  </group>
);

/** علامة صح مجسّمة */
export const Check3D: React.FC<{ color?: string } & G> = ({ color = "#2BD47D", ...rest }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.6, 0.05);
    s.lineTo(-0.38, -0.17);
    s.lineTo(-0.1, -0.45);
    s.lineTo(0.6, 0.35);
    s.lineTo(0.38, 0.55);
    s.lineTo(-0.1, 0.0);
    s.lineTo(-0.4, 0.3);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 4 });
  }, []);
  return (
    <group {...rest}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={1} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
};
