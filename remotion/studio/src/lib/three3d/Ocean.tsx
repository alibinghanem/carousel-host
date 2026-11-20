import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { useImage } from "./Phone";

type G = ThreeElements["group"];
export type V3 = [number, number, number];
export type LL = [number, number]; // [lat, lon] بالدرجات

const D2R = Math.PI / 180;

/** تحميل خامة (صورة) مع انتظار الرندر */
export const useTex = (src: string) => {
  const img = useImage(src);
  return useMemo(() => {
    if (!img) return null;
    const t = new THREE.Texture(img);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    t.needsUpdate = true;
    return t;
  }, [img]);
};

/** (lat, lon) ← نقطة على الكرة (lon=0 يقابل منتصف الخريطة المسطّحة في SphereGeometry) */
export const ll = (lat: number, lon: number, r: number): V3 => [r * Math.cos(lat * D2R) * Math.cos(lon * D2R), r * Math.sin(lat * D2R), -r * Math.cos(lat * D2R) * Math.sin(lon * D2R)];

/** تدوير الكرة بحيث (lat, lon) تواجه الكاميرا: rotX = lat، rotY = -90° - lon */
export const faceRot = (lat: number, lon: number): { rx: number; ry: number } => ({ rx: lat * D2R, ry: (-90 - lon) * D2R });

/** قوس دائرة عظمى بين نقطتين (لو الدرج أكثر من نقطتين يمر بكلها) */
export const greatPath = (pts: LL[], r: number, per = 22): V3[] => {
  const out: V3[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = new THREE.Vector3(...ll(pts[i][0], pts[i][1], 1));
    const b = new THREE.Vector3(...ll(pts[i + 1][0], pts[i + 1][1], 1));
    const om = Math.acos(Math.min(1, a.dot(b)));
    for (let k = 0; k < per; k++) {
      const t = k / per;
      const s = om < 1e-4 ? a.clone() : a.clone().multiplyScalar(Math.sin((1 - t) * om) / Math.sin(om)).add(b.clone().multiplyScalar(Math.sin(t * om) / Math.sin(om)));
      out.push([s.x * r, s.y * r, s.z * r]);
    }
  }
  const e = ll(pts[pts.length - 1][0], pts[pts.length - 1][1], r);
  out.push(e);
  return out;
};

/** الكرة الأرضية: خريطة NASA Blue Marble + هالة جوية. اللي بداخلها (children) يدور معها */
export const Globe: React.FC<{ tex: THREE.Texture | null; r?: number; ry?: number; rx?: number; children?: React.ReactNode } & G> = ({ tex, r = 2.7, ry = 0, rx = 0, children, ...rest }) => {
  return (
    <group {...rest}>
      <group rotation={[rx, 0, 0]}>
        {/* الهالة */}
        <mesh scale={1.07}>
          <sphereGeometry args={[r, 64, 48]} />
          <meshBasicMaterial color="#4FC3FF" transparent opacity={0.14} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh scale={1.025}>
          <sphereGeometry args={[r, 64, 48]} />
          <meshBasicMaterial color="#7FD8FF" transparent opacity={0.1} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
        <group rotation={[0, ry, 0]}>
          <mesh>
            <sphereGeometry args={[r, 96, 64]} />
            <meshStandardMaterial key={tex ? "t" : "n"} map={tex ?? undefined} emissiveMap={tex ?? undefined} emissive="#ffffff" emissiveIntensity={0.55} roughness={0.8} metalness={0} />
          </mesh>
          {children}
        </group>
      </group>
    </group>
  );
};

/**
 * كابل مضيء على سطح الكرة: يرسم نفسه بنسبة draw (0..1) ويطلع نبض ضوء بنسبة pulse (null = بدون)
 * glow: شدة التوهج · color: لون الكابل · cut: نقطة (0..1) ينقطع عندها الكابل (يرسم بس لين هنا)
 */
export const Route: React.FC<{ pts: LL[]; r?: number; draw?: number; pulse?: number | null; color?: string; width?: number; glow?: number; pulseColor?: string }> = ({ pts, r = 2.7, draw = 1, pulse = null, color = "#37E6FF", width = 0.022, glow = 1, pulseColor = "#FFFFFF" }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(greatPath(pts, r * 1.006).map((p) => new THREE.Vector3(...p))), [pts, r]);
  const SEG = 160;
  const RS = 6;
  const geo = useMemo(() => new THREE.TubeGeometry(curve, SEG, width, RS, false), [curve, width]);
  const halo = useMemo(() => new THREE.TubeGeometry(curve, SEG, width * 3.2, RS, false), [curve, width]);
  const cnt = Math.max(0, Math.min(SEG, Math.floor(draw * SEG))) * RS * 6;
  geo.setDrawRange(0, cnt);
  halo.setDrawRange(0, cnt);
  const pp = pulse !== null ? curve.getPointAt(Math.min(0.999, Math.max(0, pulse))) : null;
  return (
    <group>
      <mesh geometry={geo}>
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh geometry={halo}>
        <meshBasicMaterial color={color} transparent opacity={0.22 * glow} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {pp ? (
        <group position={[pp.x, pp.y, pp.z]}>
          <mesh>
            <sphereGeometry args={[0.07, 16, 12]} />
            <meshBasicMaterial color={pulseColor} toneMapped={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.2, 16, 12]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

/** نقطة (مدينة/محطة إنزال) على الكرة مع حلقة تنبض */
export const Node: React.FC<{ at: LL; r?: number; color?: string; s?: number; ping?: number }> = ({ at, r = 2.7, color = "#FFD166", s = 1, ping = 0 }) => {
  const p = ll(at[0], at[1], r * 1.008);
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...p).normalize()), [p[0], p[1], p[2]]);
  return (
    <group position={p} quaternion={q} scale={s}>
      <mesh>
        <sphereGeometry args={[0.07, 16, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {ping > 0 && ping < 1 ? (
        <mesh>
          <ringGeometry args={[0.1 + ping * 0.35, 0.13 + ping * 0.38, 40]} />
          <meshBasicMaterial color={color} transparent opacity={0.8 * (1 - ping)} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
};

/** مرساة سفينة (للأعطال): ساق، حلقة، عارضة، ذراعين منحنيين */
export const Anchor: React.FC<{ color?: string } & G> = ({ color = "#59616C", ...rest }) => {
  const mat = <meshStandardMaterial color={color} metalness={0.85} roughness={0.38} />;
  return (
    <group {...rest}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 2.5, 20]} />
        {mat}
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <torusGeometry args={[0.25, 0.07, 14, 36]} />
        {mat}
      </mesh>
      <mesh position={[0, 0.95, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 1.2, 14]} />
        {mat}
      </mesh>
      <mesh position={[0, -0.85, 0]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.95, 0.12, 16, 40, Math.PI]} />
        {mat}
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.95, -0.75, 0]} rotation={[0, 0, s * -0.45]}>
          <coneGeometry args={[0.24, 0.55, 4]} />
          {mat}
        </mesh>
      ))}
    </group>
  );
};

/**
 * مقطع كابل بحري على المحور X (طوله 6): غلاف بولي إيثيلين ← أسلاك فولاذ ← أنبوب نحاس ← ألياف زجاجية.
 * كل طبقة أقصر من اللي داخلها عشان تنكشف. ghost: 0 صلب → 1 شبه شفاف (تبان الألياف ونبضات الضوء)
 * pulse: موضع نبضات الضوء (يتكرر)، reveal: 0..1 طول الكشف عن الطبقات
 */
export const CableSection: React.FC<{ ghost?: number; pulse?: number; reveal?: number; glow?: number; tint?: string } & G> = ({ ghost = 0, pulse = 0, reveal = 1, glow = 1, tint = "#37E6FF", ...rest }) => {
  const L = 6;
  const x0 = -L / 2;
  const cyl = (rad: number, len: number, from: number) => ({ rad, len, cx: from + len / 2 });
  const jacket = cyl(0.95, 3.0 * (1 - 0.35 * reveal) + 0.6 * (1 - reveal), x0);
  const steel = cyl(0.76, jacket.len + 0.9 * reveal, x0);
  const copper = cyl(0.5, steel.len + 0.9 * reveal, x0);
  const fiber = cyl(0.3, copper.len + 0.9 * reveal, x0);
  const op = 1 - 0.62 * ghost;
  const wires = Array.from({ length: 18 }, (_, i) => i);
  const fx = x0 + fiber.len;
  const pulses = [0, 0.33, 0.66].map((o) => ((pulse + o) % 1) * (fx - x0) + x0);
  return (
    <group {...rest}>
      {/* الغلاف الخارجي */}
      <mesh position={[jacket.cx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[jacket.rad, jacket.rad, jacket.len, 56]} />
        <meshPhysicalMaterial color="#20262E" roughness={0.55} clearcoat={0.4} transparent={ghost > 0} opacity={op * 0.9} depthWrite={ghost === 0} />
      </mesh>
      {/* أسلاك الفولاذ */}
      {wires.map((i) => {
        const a = (i / wires.length) * Math.PI * 2;
        return (
          <mesh key={i} position={[steel.cx, Math.cos(a) * 0.63, Math.sin(a) * 0.63]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.095, 0.095, steel.len, 12]} />
            <meshStandardMaterial color="#B9C2CC" metalness={0.95} roughness={0.3} transparent={ghost > 0} opacity={Math.min(1, op + 0.2)} />
          </mesh>
        );
      })}
      {/* أنبوب النحاس */}
      <mesh position={[copper.cx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[copper.rad, copper.rad, copper.len, 40]} />
        <meshStandardMaterial color="#D9822B" metalness={0.9} roughness={0.28} transparent={ghost > 0} opacity={Math.min(1, op + 0.15)} />
      </mesh>
      {/* حزمة الألياف */}
      <mesh position={[fiber.cx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[fiber.rad, fiber.rad, fiber.len, 32]} />
        <meshPhysicalMaterial color="#BFEFFF" emissive={tint} emissiveIntensity={0.25 + 0.45 * glow} transmission={0} roughness={0.15} clearcoat={1} toneMapped={false} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[fiber.cx + 0.001, Math.cos(a) * 0.14, Math.sin(a) * 0.14]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, fiber.len + 0.02, 10]} />
            <meshBasicMaterial color={tint} toneMapped={false} />
          </mesh>
        );
      })}
      {/* نبضات الضوء داخل الألياف */}
      {ghost > 0.3 || reveal > 0.5
        ? pulses.map((x, i) => (
            <group key={i} position={[x, 0, 0]}>
              <mesh>
                <sphereGeometry args={[0.12, 16, 12]} />
                <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
              </mesh>
              <mesh>
                <sphereGeometry args={[0.38, 16, 12]} />
                <meshBasicMaterial color={tint} transparent opacity={0.35 * glow} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
              </mesh>
            </group>
          ))
        : null}
    </group>
  );
};

/** قمر صناعي صغير (جسم ولوحين شمسية) */
export const Satellite: React.FC<G> = (props) => (
  <group {...props}>
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.6]} />
      <meshStandardMaterial color="#C9D0D8" metalness={0.8} roughness={0.35} />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 0.95, 0, 0]}>
        <boxGeometry args={[1.1, 0.04, 0.55]} />
        <meshStandardMaterial color="#1D4FA8" metalness={0.5} roughness={0.25} emissive="#0B2A66" emissiveIntensity={0.4} />
      </mesh>
    ))}
    <mesh position={[0, 0.4, 0]}>
      <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
      <meshStandardMaterial color="#C9D0D8" metalness={0.8} />
    </mesh>
  </group>
);

/** قاع البحر: لوح بنقش رمل وحبيبات */
export const SeaFloor: React.FC<{ w?: number; d?: number } & G> = ({ w = 14, d = 8, ...rest }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const g = c.getContext("2d")!;
    const gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, "#0B3A44");
    gr.addColorStop(1, "#06222B");
    g.fillStyle = gr;
    g.fillRect(0, 0, 512, 512);
    let s = 3;
    for (let i = 0; i < 900; i++) {
      s = (s * 9301 + 49297) % 233280;
      const x = (s / 233280) * 512;
      s = (s * 9301 + 49297) % 233280;
      const y = (s / 233280) * 512;
      g.fillStyle = `rgba(150,220,235,${0.04 + (s % 7) * 0.012})`;
      g.beginPath();
      g.arc(x, y, 1 + (s % 4), 0, Math.PI * 2);
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <group {...rest}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial map={tex} roughness={1} />
      </mesh>
    </group>
  );
};
