import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { roundedRectGeo } from "./Phone";

type G = ThreeElements["group"];
type Draw = (g: CanvasRenderingContext2D, w: number, h: number) => void;

/** CanvasTexture ينرسم كل رندر (Remotion يرندر كل فريم مرة) */
const useCanvasTex = (W: number, H: number, draw: Draw) => {
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    return c;
  }, [W, H]);
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [canvas]);
  const g = canvas.getContext("2d")!;
  g.save();
  g.clearRect(0, 0, W, H);
  draw(g, W, H);
  g.restore();
  tex.needsUpdate = true;
  return tex;
};

/**
 * ظرف رسالة من الخلف: ورق بخطوط الطيّ، غطاء مثلث ينفتح على مفصله (flap 0..1) وختم دائري.
 * المقاس 2.4 × 1.56
 */
export const Envelope: React.FC<{ flap?: number; paper?: string; seal?: string } & G> = ({ flap = 0, paper = "#F4EFE6", seal = "#EA4335", ...rest }) => {
  const body = useMemo(() => new RoundedBoxGeometry(2.4, 1.56, 0.05, 2, 0.025), []);
  const flapGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.18, 0);
    s.lineTo(1.18, 0);
    s.quadraticCurveTo(0.12, -0.9, 0, -0.92);
    s.quadraticCurveTo(-0.12, -0.9, -1.18, 0);
    return new THREE.ShapeGeometry(s, 8);
  }, []);
  const folds = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 480;
    c.height = 312;
    const g = c.getContext("2d")!;
    g.strokeStyle = "rgba(90,70,40,.22)";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(4, 308);
    g.lineTo(240, 150);
    g.lineTo(476, 308);
    g.stroke();
    g.strokeStyle = "rgba(90,70,40,.12)";
    g.beginPath();
    g.moveTo(4, 4);
    g.lineTo(200, 170);
    g.moveTo(476, 4);
    g.lineTo(280, 170);
    g.stroke();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <group {...rest}>
      <mesh geometry={body}>
        <meshStandardMaterial color={paper} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0, 0.0265]}>
        <planeGeometry args={[2.36, 1.52]} />
        <meshBasicMaterial map={folds} transparent toneMapped={false} depthWrite={false} />
      </mesh>
      <group position={[0, 0.77, 0.03]} rotation={[-flap * Math.PI * 0.92, 0, 0]}>
        <mesh geometry={flapGeo}>
          <meshStandardMaterial color={paper} roughness={0.8} side={THREE.DoubleSide} emissive="#000" />
        </mesh>
        <mesh geometry={flapGeo} position={[0, 0, -0.002]} scale={[1.002, 1.01, 1]}>
          <meshBasicMaterial color="#9C8F7C" side={THREE.BackSide} />
        </mesh>
        <group position={[0, -0.8, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.2, 0.2, 0.05, 32]} />
            <meshPhysicalMaterial color={seal} roughness={0.35} clearcoat={0.8} />
          </mesh>
          <mesh position={[0, 0.03, 0]}>
            <torusGeometry args={[0.13, 0.018, 8, 32]} />
            <meshPhysicalMaterial color={seal} roughness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

/** نجمة رباعية بحواف مقعّرة (شرارة الذكاء الاصطناعي) بتدرّج أزرق ← بنفسجي ← وردي، وهالة خلفها */
export const Sparkle: React.FC<{ glow?: number; halo?: number; colors?: [string, string, string] } & G> = ({ glow = 1, halo = 1, colors = ["#4796E3", "#9177C7", "#D96570"], ...rest }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    const c = 0.1;
    s.moveTo(0, 1);
    s.quadraticCurveTo(c, c, 1, 0);
    s.quadraticCurveTo(c, -c, 0, -1);
    s.quadraticCurveTo(-c, -c, -1, 0);
    s.quadraticCurveTo(-c, c, 0, 1);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.045, bevelSegments: 5, curveSegments: 24 });
    g.translate(0, 0, -0.08);
    return g;
  }, []);
  const tex = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const g = cv.getContext("2d")!;
    const gr = g.createLinearGradient(0, 256, 256, 0);
    gr.addColorStop(0.15, colors[0]);
    gr.addColorStop(0.55, colors[1]);
    gr.addColorStop(0.9, colors[2]);
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.repeat.set(0.5, 0.5);
    t.offset.set(0.5, 0.5);
    return t;
  }, [colors]);
  const haloTex = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const g = cv.getContext("2d")!;
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, "rgba(160,140,255,.85)");
    gr.addColorStop(0.35, "rgba(110,120,255,.3)");
    gr.addColorStop(1, "rgba(80,90,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <group {...rest}>
      {halo > 0 ? (
        <mesh position={[0, 0, -0.3]}>
          <planeGeometry args={[4.2, 4.2]} />
          <meshBasicMaterial map={haloTex} transparent opacity={halo * 0.9} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ) : null}
      <mesh geometry={geo}>
        <meshPhysicalMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.35 + glow * 0.45} metalness={0.25} roughness={0.22} clearcoat={1} clearcoatRoughness={0.15} />
      </mesh>
    </group>
  );
};

/** لوح/كرت بوجه canvas ينرسم كل فريم — w×h بالوحدات و W×H بالبكسل */
export const Panel: React.FC<{ draw: Draw; W?: number; H?: number; w?: number; h?: number; d?: number; r?: number; color?: string } & G> = ({ draw, W = 800, H = 520, w = 3.6, h = 2.34, d = 0.08, r = 0.16, color = "#FFFFFF", ...rest }) => {
  const body = useMemo(() => new RoundedBoxGeometry(w, h, d, 4, Math.min(r, d / 2)), [w, h, d, r]);
  const face = useMemo(() => roundedRectGeo(w - 0.06, h - 0.06, r), [w, h, r]);
  const tex = useCanvasTex(W, H, draw);
  return (
    <group {...rest}>
      <mesh geometry={body}>
        <meshPhysicalMaterial color={color} roughness={0.4} clearcoat={0.5} />
      </mesh>
      <mesh geometry={face} position={[0, 0, d / 2 + 0.003]}>
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
};

export const LAPTOP_W = 1280;
export const LAPTOP_H = 800;

/**
 * لابتوب: قاعدة معدنية بلوحة مفاتيح ولوحة لمس، وغطاء على مفصل (open 0 = مقفول، 1 = مفتوح ~105°)
 * الشاشة canvas بمقاس LAPTOP_W×LAPTOP_H. نقطة الأصل = منتصف القاعدة
 */
export const Laptop: React.FC<{ draw: Draw; open?: number; metal?: string } & G> = ({ draw, open = 1, metal = "#C3C8D0", ...rest }) => {
  const base = useMemo(() => new RoundedBoxGeometry(5.4, 0.16, 3.6, 4, 0.07), []);
  const lid = useMemo(() => new RoundedBoxGeometry(5.4, 3.55, 0.1, 4, 0.045), []);
  const screen = useMemo(() => roundedRectGeo(5.12, 3.2, 0.05), []);
  const tex = useCanvasTex(LAPTOP_W, LAPTOP_H, draw);
  const rot = Math.PI / 2 - open * (Math.PI / 2 + 0.26);
  return (
    <group {...rest}>
      <mesh geometry={base}>
        <meshPhysicalMaterial color={metal} metalness={0.85} roughness={0.32} clearcoat={0.3} />
      </mesh>
      <mesh position={[0, 0.082, -0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.7, 1.75]} />
        <meshStandardMaterial color="#1B1E24" roughness={0.6} />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[0, 0.084, -1.05 + i * 0.36]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4.5, 0.02]} />
          <meshBasicMaterial color="#3A3F48" />
        </mesh>
      ))}
      <mesh position={[0, 0.082, 1.12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.9, 1.05]} />
        <meshPhysicalMaterial color={metal} metalness={0.7} roughness={0.22} />
      </mesh>
      <group position={[0, 0.08, -1.76]} rotation={[rot, 0, 0]}>
        <mesh geometry={lid} position={[0, 1.775, 0]}>
          <meshPhysicalMaterial color={metal} metalness={0.85} roughness={0.32} clearcoat={0.3} />
        </mesh>
        <mesh position={[0, 1.775, 0.052]}>
          <planeGeometry args={[5.3, 3.45]} />
          <meshPhysicalMaterial color="#07080B" roughness={0.1} clearcoat={1} />
        </mesh>
        <mesh geometry={screen} position={[0, 1.83, 0.056]}>
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};
