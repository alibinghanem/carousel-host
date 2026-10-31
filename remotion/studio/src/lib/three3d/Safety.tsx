import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

type G = ThreeElements["group"];

/**
 * خطّاف صيد معدني: عين فوق، ساق، انحناءة J، ورأس بشوكة. line: طول خيط الصيد فوق العين (0 = بدون خيط).
 * الطول الكلي تقريباً 3.2 وحدة، ونقطة الخطّاف عند (0.75, -1.1).
 */
export const FishHook: React.FC<{ line?: number; color?: string } & G> = ({ line = 0, color = "#C9D1DA", ...rest }) => {
  const geo = useMemo(() => {
    const pts = [
      new THREE.Vector3(0, 1.6, 0),
      new THREE.Vector3(0, 0.2, 0),
      new THREE.Vector3(-0.05, -1.0, 0),
      new THREE.Vector3(0.2, -1.55, 0),
      new THREE.Vector3(0.62, -1.62, 0),
      new THREE.Vector3(0.95, -1.3, 0),
      new THREE.Vector3(0.98, -0.75, 0),
    ];
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.075, 16, false);
  }, []);
  const metal = <meshStandardMaterial color={color} metalness={1} roughness={0.18} />;
  return (
    <group {...rest}>
      {line > 0 ? (
        <mesh position={[0, 1.95 + line / 2, 0]}>
          <cylinderGeometry args={[0.012, 0.012, line, 8]} />
          <meshStandardMaterial color="#F4F7FA" roughness={0.4} transparent opacity={0.85} />
        </mesh>
      ) : null}
      <mesh position={[0, 1.78, 0]}>
        <torusGeometry args={[0.17, 0.06, 16, 40]} />
        {metal}
      </mesh>
      <mesh geometry={geo}>{metal}</mesh>
      {/* الرأس المدبب */}
      <mesh position={[0.98, -0.62, 0]}>
        <coneGeometry args={[0.075, 0.3, 16]} />
        {metal}
      </mesh>
      {/* الشوكة الراجعة */}
      <mesh position={[0.88, -0.78, 0]} rotation={[0, 0, 0.75]}>
        <coneGeometry args={[0.05, 0.24, 12]} />
        {metal}
      </mesh>
    </group>
  );
};

/** طوق نجاة: حلقة بأربع قطع أحمر/أبيض وحبل حواليها */
export const Lifebuoy: React.FC<{ r?: number; t?: number } & G> = ({ r = 1.4, t = 0.42, ...rest }) => (
  <group {...rest}>
    {Array.from({ length: 8 }, (_, i) => (
      <mesh key={i} rotation={[0, 0, (i * Math.PI) / 4]}>
        <torusGeometry args={[r, t, 32, 48, Math.PI / 4 + 0.002]} />
        <meshPhysicalMaterial color={i % 2 ? "#F5F7FA" : "#E5383B"} roughness={0.35} clearcoat={0.8} />
      </mesh>
    ))}
    {Array.from({ length: 4 }, (_, i) => (
      <mesh key={`r${i}`} rotation={[0, 0, (i * Math.PI) / 2 + Math.PI / 4]}>
        <torusGeometry args={[r + t * 0.92, 0.045, 10, 24, Math.PI / 4]} />
        <meshStandardMaterial color="#E9D8A6" roughness={0.8} />
      </mesh>
    ))}
  </group>
);

/** طرد كرتون بشريط لاصق وملصق شحن */
export const Parcel: React.FC<{ w?: number; h?: number; d?: number; label?: string } & G> = ({ w = 2.4, h = 1.6, d = 1.8, label = "#FFFFFF", ...rest }) => {
  const box = useMemo(() => new RoundedBoxGeometry(w, h, d, 4, 0.06), [w, h, d]);
  return (
    <group {...rest}>
      <mesh geometry={box}>
        <meshStandardMaterial color="#C8955C" roughness={0.85} />
      </mesh>
      {/* شريط لاصق فوق ونازل على الوجه */}
      <mesh position={[0, h / 2 + 0.006, 0]}>
        <boxGeometry args={[0.36, 0.012, d + 0.01]} />
        <meshStandardMaterial color="#B98446" roughness={0.4} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, h / 2 - 0.3, d / 2 + 0.006]}>
        <boxGeometry args={[0.36, 0.6, 0.012]} />
        <meshStandardMaterial color="#B98446" roughness={0.4} transparent opacity={0.9} />
      </mesh>
      <mesh position={[w * 0.22, -h * 0.12, d / 2 + 0.008]}>
        <boxGeometry args={[w * 0.34, h * 0.36, 0.01]} />
        <meshStandardMaterial color={label} roughness={0.6} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[w * 0.22, -h * 0.03 - i * 0.12, d / 2 + 0.015]}>
          <boxGeometry args={[w * 0.26, 0.04, 0.005]} />
          <meshStandardMaterial color="#3A3F48" />
        </mesh>
      ))}
    </group>
  );
};

/** قفل: جسم بزوايا دائرية وقوس معدني. open: 0..1 يرفع القوس */
export const Padlock: React.FC<{ color?: string; open?: number } & G> = ({ color = "#12B886", open = 0, ...rest }) => {
  const body = useMemo(() => new RoundedBoxGeometry(1.6, 1.3, 0.6, 6, 0.18), []);
  return (
    <group {...rest}>
      <mesh geometry={body}>
        <meshPhysicalMaterial color={color} roughness={0.3} clearcoat={1} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.65 + open * 0.4, 0]}>
        <torusGeometry args={[0.5, 0.12, 20, 40, Math.PI]} />
        <meshStandardMaterial color="#D3D9E0" metalness={1} roughness={0.2} />
      </mesh>
      {[-0.5, 0.5].map((x) => (
        <mesh key={x} position={[x, 0.6 + open * 0.2 * (x > 0 ? 2 : 1), 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.3, 20]} />
          <meshStandardMaterial color="#D3D9E0" metalness={1} roughness={0.2} />
        </mesh>
      ))}
      {/* ثقب المفتاح: دائرة ومثلث ضيق باتجاه الكاميرا */}
      <mesh position={[0, 0.08, 0.31]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.04, 28]} />
        <meshStandardMaterial color="#0A2A36" />
      </mesh>
      <mesh position={[0, -0.16, 0.31]} rotation={[0, 0, Math.PI]}>
        <cylinderGeometry args={[0.03, 0.11, 0.36, 3]} />
        <meshStandardMaterial color="#0A2A36" />
      </mesh>
    </group>
  );
};

/**
 * باب خزنة دائري: إطار، وجه معدني، مسامير حواليه، ومقبض عجلة بثلاث أذرع وقرص أرقام.
 * open: 0..1 يفتح الباب على مفصّلة يسار · spin: دوران العجلة (راديان) · r: نصف القطر
 */
export const VaultDoor: React.FC<{ r?: number; open?: number; spin?: number; alarm?: number } & G> = ({ r = 3, open = 0, spin = 0, alarm = 0, ...rest }) => {
  const steel = <meshStandardMaterial color="#A9B2BD" metalness={1} roughness={0.28} />;
  const dark = <meshStandardMaterial color="#59616C" metalness={1} roughness={0.35} />;
  return (
    <group {...rest}>
      {/* الإطار الثابت في الجدار */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.25]}>
        <cylinderGeometry args={[r + 0.55, r + 0.55, 0.5, 96, 1, true]} />
        <meshStandardMaterial color="#3E454F" metalness={0.9} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <torusGeometry args={[r + 0.4, 0.2, 24, 96]} />
        {dark}
      </mesh>
      {/* فتحة الخزنة (داخل مضيء أحمر لو فيه إنذار) */}
      <mesh position={[0, 0, -0.45]}>
        <circleGeometry args={[r + 0.1, 64]} />
        <meshBasicMaterial color={alarm > 0 ? new THREE.Color("#1A0506").lerp(new THREE.Color("#FF2E3A"), alarm) : "#0B0F14"} toneMapped={false} />
      </mesh>
      {/* الباب: يدور حول مفصّلة على يسار الإطار */}
      <group position={[-r, 0, 0]} rotation={[0, -open * 1.25, 0]}>
        <group position={[r, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.2]}>
            <cylinderGeometry args={[r, r, 0.5, 96]} />
            {steel}
          </mesh>
          <mesh position={[0, 0, 0.46]}>
            <torusGeometry args={[r * 0.82, 0.07, 16, 96]} />
            {dark}
          </mesh>
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * r * 0.91, Math.sin(a) * r * 0.91, 0.47]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.11, 0.11, 0.08, 20]} />
                {dark}
              </mesh>
            );
          })}
          {/* عجلة المقبض */}
          <group position={[0, 0, 0.6]} rotation={[0, 0, spin]}>
            <mesh>
              <torusGeometry args={[r * 0.38, 0.07, 16, 64]} />
              {steel}
            </mesh>
            {[0, 1, 2].map((i) => (
              <group key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
                <mesh position={[0, r * 0.25, 0]}>
                  <cylinderGeometry args={[0.06, 0.06, r * 0.75, 12]} />
                  {steel}
                </mesh>
                <mesh position={[0, r * 0.62, 0]}>
                  <sphereGeometry args={[0.14, 20, 16]} />
                  {dark}
                </mesh>
              </group>
            ))}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.32, 0.32, 0.2, 40]} />
              {dark}
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};

/** مفتاح: حلقة وساق وأسنان. glow: توهج (للمفتاح «المسروق» بالأحمر) */
export const Key: React.FC<{ color?: string; glow?: number } & G> = ({ color = "#E8C15A", glow = 0, ...rest }) => {
  const mat = <meshStandardMaterial color={color} metalness={0.85} roughness={0.25} emissive={color} emissiveIntensity={glow} />;
  return (
    <group {...rest}>
      <mesh position={[0, 0.75, 0]}>
        <torusGeometry args={[0.36, 0.11, 16, 40]} />
        {mat}
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.25, 16]} />
        {mat}
      </mesh>
      {[-0.42, -0.25, -0.62].map((y, i) => (
        <mesh key={i} position={[0.14, y, 0]}>
          <boxGeometry args={[0.2, 0.09 + i * 0.03, 0.08]} />
          {mat}
        </mesh>
      ))}
    </group>
  );
};
