import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { Padlock } from "./Safety";

type G = ThreeElements["group"];
type V3 = [number, number, number];

/** أنبوب زجاجي (بريد هوائي/شبكة) على مسار ناعم، بحلقات معدنية عند الأطراف */
export const Tube: React.FC<{ pts: V3[]; r?: number; color?: string; opacity?: number; rings?: number } & G> = ({ pts, r = 0.62, color = "#E6FFF3", opacity = 0.2, rings = 0, ...rest }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), [pts]);
  const geo = useMemo(() => new THREE.TubeGeometry(curve, 96, r, 32, false), [curve, r]);
  const ringAt = (t: number) => {
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan);
    return { p: [p.x, p.y, p.z] as V3, q };
  };
  const ts = [0.004, 0.996, ...Array.from({ length: rings }, (_, i) => (i + 1) / (rings + 1))];
  return (
    <group {...rest}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color={color} transparent opacity={opacity} roughness={0.05} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* لمعة الزجاج */}
      <mesh geometry={geo} scale={1.002}>
        <meshPhysicalMaterial color="#FFFFFF" transparent opacity={0.08} roughness={0} metalness={0.6} clearcoat={1} side={THREE.FrontSide} depthWrite={false} />
      </mesh>
      {ts.map((t, i) => {
        const { p, q } = ringAt(t);
        return (
          <mesh key={i} position={p} quaternion={q}>
            <torusGeometry args={[r + 0.02, 0.07, 12, 48]} />
            <meshPhysicalMaterial color="#C9D1DA" metalness={0.9} roughness={0.25} />
          </mesh>
        );
      })}
    </group>
  );
};

/**
 * كبسولة بريد هوائي مقفولة (على محور X): زجاج بداخله رسالة ملفوفة، طرفين معدنيين،
 * وحزام قفل مضيء بالنص مع قفل صغير. glow: توهج الحزام · open: 0..1 الحزام يبعد والقفل ينفتح
 */
export const Capsule: React.FC<{ glow?: number; band?: string; open?: number; lock?: boolean } & G> = ({ glow = 1, band = "#25D366", open = 0, lock = true, ...rest }) => {
  const note = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#FBFAF6";
    g.fillRect(0, 0, 512, 256);
    g.fillStyle = "#B9C2BE";
    for (let i = 0; i < 7; i++) g.fillRect(40, 30 + i * 32, 300 + ((i * 53) % 140), 10);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <group {...rest}>
      <group rotation={[0, 0, Math.PI / 2]}>
        {/* الزجاج */}
        <mesh>
          <cylinderGeometry args={[0.46, 0.46, 1.5, 48, 1, true]} />
          <meshPhysicalMaterial color="#E9FFF4" transparent opacity={0.3} roughness={0.04} clearcoat={1} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {/* الرسالة الملفوفة */}
        <mesh rotation={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 1.2, 40]} />
          <meshStandardMaterial map={note} roughness={0.8} />
        </mesh>
        {/* الطرفين */}
        {[-1, 1].map((s) => (
          <group key={s} position={[0, s * 0.82, 0]}>
            <mesh>
              <cylinderGeometry args={[0.5, 0.5, 0.2, 48]} />
              <meshPhysicalMaterial color="#B8C1CB" metalness={0.95} roughness={0.22} clearcoat={0.5} />
            </mesh>
            <mesh position={[0, s * 0.1, 0]} scale={[1, 0.62, 1]}>
              <sphereGeometry args={[0.5, 40, 20, 0, Math.PI * 2, s > 0 ? 0 : Math.PI / 2, Math.PI / 2]} />
              <meshPhysicalMaterial color="#9AA4AF" metalness={0.95} roughness={0.25} />
            </mesh>
          </group>
        ))}
        {/* حزام القفل */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.5 + open * 0.15, 0.5 + open * 0.15, 0.26, 48, 1, true]} />
          <meshStandardMaterial color={band} emissive={band} emissiveIntensity={0.35 + glow * 0.6} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {lock ? <Padlock position={[0, -0.12, 0.6 + open * 0.15]} scale={0.3} color={band} open={open} /> : null}
    </group>
  );
};

/** سحابة منفوخة من كرات ناعمة */
export const Cloud: React.FC<{ color?: string } & G> = ({ color = "#F7FAFC", ...rest }) => {
  const balls: [V3, number][] = [
    [[-1.15, -0.1, 0], 0.85],
    [[-0.35, 0.45, 0], 1.08],
    [[0.75, 0.35, -0.05], 1.0],
    [[1.55, -0.1, 0], 0.72],
    [[-0.6, -0.42, 0.3], 0.78],
    [[0.5, -0.45, 0.3], 0.8],
    [[0.1, 0.0, 0.55], 0.75],
  ];
  return (
    <group {...rest}>
      {balls.map(([p, r], i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[r, 48, 32]} />
          <meshPhysicalMaterial color={color} roughness={0.55} sheen={1} sheenColor="#DDEBFF" clearcoat={0.2} />
        </mesh>
      ))}
    </group>
  );
};
