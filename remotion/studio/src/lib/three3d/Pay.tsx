import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { roundedRectGeo } from "./Phone";

type G = ThreeElements["group"];
export type Draw = (g: CanvasRenderingContext2D, w: number, h: number) => void;

/** CanvasTexture يُعاد رسمها كل رندر (Remotion يرندر الفريم مرة وحدة) */
const useLiveTex = (W: number, H: number, draw: Draw) => {
  const cv = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    return c;
  }, [W, H]);
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [cv]);
  const g = cv.getContext("2d")!;
  g.save();
  g.clearRect(0, 0, W, H);
  draw(g, W, H);
  g.restore();
  tex.needsUpdate = true;
  return tex;
};

/**
 * بطاقة بنكية بلاستيك (نسبة ISO 85.6×54): جسم بحواف دائرية، وجه canvas ينرسم كل فريم،
 * وشريحة EMV ذهبية بارزة. w = العرض بالوحدات (الافتراضي 3.4). glow يضيء الوجه.
 */
export const BankCard: React.FC<{ draw: Draw; w?: number; color?: string; glow?: number; chip?: boolean; opacity?: number } & G> = ({ draw, w = 3.4, color = "#2B2F4A", glow = 0, chip = true, opacity = 1, ...rest }) => {
  const h = w * (54 / 85.6);
  const d = 0.05;
  const body = useMemo(() => new RoundedBoxGeometry(w, h, d, 4, d / 2), [w, h]);
  const face = useMemo(() => roundedRectGeo(w - 0.02, h - 0.02, 0.16), [w, h]);
  const chipGeo = useMemo(() => new RoundedBoxGeometry(w * 0.13, w * 0.1, 0.03, 3, 0.012), [w]);
  const tex = useLiveTex(856, 540, draw);
  const tr = opacity < 0.999;
  return (
    <group {...rest}>
      <mesh geometry={body}>
        <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={1} clearcoatRoughness={0.1} transparent={tr} opacity={opacity} />
      </mesh>
      <mesh geometry={face} position={[0, 0, d / 2 + 0.002]}>
        <meshBasicMaterial map={tex} toneMapped={false} transparent opacity={opacity * (0.92 + glow * 0.08)} />
      </mesh>
      {chip ? (
        <mesh geometry={chipGeo} position={[-w * 0.3, h * 0.06, d / 2 + 0.012]}>
          <meshStandardMaterial color="#E9C46A" metalness={1} roughness={0.22} transparent={tr} opacity={opacity} />
        </mesh>
      ) : null}
      {glow > 0 ? (
        <mesh position={[0, 0, -0.06]}>
          <circleGeometry args={[h * 0.9, 48]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
};

/**
 * جهاز دفع (نقطة بيع): قاعدة، ذراع، ورأس مائل للخلف بشاشة canvas (المبلغ ورمز اللمس ولوحة أرقام).
 * الارتفاع الكلي تقريباً 3.6 وحدة، ومركز منطقة اللمس عند (0, 1.55, 0.32) محلياً.
 */
export const PayTerminal: React.FC<{ draw: Draw; body?: string; ring?: number; ringColor?: string } & G> = ({ draw, body = "#E9EDF2", ring = 0, ringColor = "#3DDC97", ...rest }) => {
  const head = useMemo(() => new RoundedBoxGeometry(2.1, 3.0, 0.34, 6, 0.16), []);
  const base = useMemo(() => new RoundedBoxGeometry(1.7, 0.26, 1.3, 4, 0.1), []);
  const face = useMemo(() => roundedRectGeo(1.86, 2.76, 0.12), []);
  const tex = useLiveTex(560, 830, draw);
  return (
    <group {...rest}>
      <mesh geometry={base} position={[0, -1.6, 0]}>
        <meshPhysicalMaterial color={body} roughness={0.4} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, -1.25, -0.1]}>
        <boxGeometry args={[0.5, 0.55, 0.3]} />
        <meshPhysicalMaterial color={body} roughness={0.4} clearcoat={0.6} />
      </mesh>
      <group position={[0, 0.35, 0]} rotation={[-0.18, 0, 0]}>
        <mesh geometry={head}>
          <meshPhysicalMaterial color={body} roughness={0.35} clearcoat={0.8} />
        </mesh>
        <mesh geometry={face} position={[0, 0, 0.172]}>
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
        {ring > 0
          ? [0, 1, 2].map((i) => {
              const k = (ring + i / 3) % 1;
              return (
                <mesh key={i} position={[0, 0.75, 0.25 + k * 1.6]} scale={0.4 + k * 1.3}>
                  <torusGeometry args={[0.55, 0.03, 8, 56]} />
                  <meshBasicMaterial color={ringColor} transparent opacity={(1 - k) * 0.9} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
                </mesh>
              );
            })
          : null}
      </group>
    </group>
  );
};

/** شريحة أمان (Secure Element): جسم داكن بأطراف ذهبية، ووجه يتوهج. glow: 0..1 */
export const SecureChip: React.FC<{ glow?: number; color?: string } & G> = ({ glow = 0, color = "#3DDC97", ...rest }) => {
  const body = useMemo(() => new RoundedBoxGeometry(1.1, 1.1, 0.2, 4, 0.06), []);
  const pins = [-0.38, -0.19, 0, 0.19, 0.38];
  return (
    <group {...rest}>
      <mesh geometry={body}>
        <meshPhysicalMaterial color="#141A24" roughness={0.3} clearcoat={1} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.102]}>
        <planeGeometry args={[0.7, 0.7]} />
        <meshBasicMaterial color={color} transparent opacity={0.25 + glow * 0.75} toneMapped={false} />
      </mesh>
      {pins.flatMap((p, i) =>
        [
          [p, 0.62, 0.12, 0.16],
          [p, -0.62, 0.12, 0.16],
          [0.62, p, 0.16, 0.12],
          [-0.62, p, 0.16, 0.12],
        ].map(([x, y, sx, sy], j) => (
          <mesh key={`${i}-${j}`} position={[x, y, 0]}>
            <boxGeometry args={[sx, sy, 0.06]} />
            <meshStandardMaterial color="#E9C46A" metalness={1} roughness={0.25} />
          </mesh>
        )),
      )}
      {glow > 0 ? (
        <mesh position={[0, 0, -0.15]}>
          <circleGeometry args={[1.5, 40]} />
          <meshBasicMaterial color={color} transparent opacity={0.3 * glow} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
};

/** حزمة بيانات صغيرة (بطاقة زجاجية مضيئة بوجه canvas) تنتقل بين الأجهزة */
export const Packet: React.FC<{ draw: Draw; color?: string; w?: number } & G> = ({ draw, color = "#3DDC97", w = 1.9, ...rest }) => {
  const h = w * 0.56;
  const face = useMemo(() => roundedRectGeo(w, h, 0.14), [w, h]);
  const tex = useLiveTex(600, 336, draw);
  return (
    <group {...rest}>
      <mesh position={[0, 0, -0.04]}>
        <circleGeometry args={[w * 0.62, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.05} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh geometry={face}>
        <meshBasicMaterial map={tex} toneMapped={false} transparent />
      </mesh>
    </group>
  );
};
