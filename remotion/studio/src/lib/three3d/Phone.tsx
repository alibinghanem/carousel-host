import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo, useState } from "react";
import { continueRender, delayRender } from "remotion";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/** شكل مستطيل بزوايا دائرية مع UV من 0 لـ 1 (للشاشة) */
export const roundedRectGeo = (w: number, h: number, r: number) => {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ShapeGeometry(s, 12);
  const pos = g.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) + w / 2) / w;
    uv[i * 2 + 1] = (pos.getY(i) + h / 2) / h;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
};

/** تحميل صورة لاستخدامها في رسم الشاشة (ينتظر الرندر لين تتحمّل) */
export const useImage = (src?: string) => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [handle] = useState(() => (src ? delayRender("img " + src) : null));
  useMemo(() => {
    if (!src) return;
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => {
      setImg(im);
      if (handle !== null) continueRender(handle);
    };
    im.onerror = () => {
      if (handle !== null) continueRender(handle);
    };
    im.src = src;
  }, [src, handle]);
  return img;
};

export type ScreenDraw = (g: CanvasRenderingContext2D, w: number, h: number) => void;

export const SCREEN_W = 540;
export const SCREEN_H = 1170;

/**
 * جوال حديث: إطار معدني بزوايا دائرية، زجاج أمامي، شاشة تُرسم كل فريم (CanvasTexture)،
 * جزيرة الكاميرا، وحدة كاميرات خلفية بثلاث عدسات، وأزرار جانبية.
 * xray: 0..1 يخلي الجسم شفاف عشان يبان اللي داخله · glow: إضاءة الشاشة.
 */
export const Phone: React.FC<{
  draw: ScreenDraw;
  frame?: string;
  xray?: number;
  glow?: number;
  caseColor?: string;
  caseOn?: number;
  children?: React.ReactNode;
} & ThreeElements["group"]> = ({ draw, frame = "#5B6270", xray = 0, glow = 1, caseColor = "#E8692C", caseOn = 0, children, ...rest }) => {
  const body = useMemo(() => new RoundedBoxGeometry(3, 6.3, 0.34, 8, 0.42), []);
  const glass = useMemo(() => new RoundedBoxGeometry(2.94, 6.24, 0.02, 4, 0.4), []);
  const screenGeo = useMemo(() => roundedRectGeo(2.74, 6.02, 0.3), []);
  const caseGeo = useMemo(() => new RoundedBoxGeometry(3.26, 6.56, 0.44, 8, 0.54), []);
  const camGeo = useMemo(() => new RoundedBoxGeometry(1.36, 1.36, 0.12, 6, 0.32), []);
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = SCREEN_W;
    c.height = SCREEN_H;
    return c;
  }, []);
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [canvas]);
  // نرسم الشاشة في كل رندر (Remotion يرندر كل فريم مرة)
  const g = canvas.getContext("2d")!;
  g.save();
  g.clearRect(0, 0, SCREEN_W, SCREEN_H);
  draw(g, SCREEN_W, SCREEN_H);
  g.restore();
  tex.needsUpdate = true;

  const op = 1 - 0.82 * xray;
  const tr = xray > 0.001;
  return (
    <group {...rest}>
      <mesh geometry={body}>
        <meshPhysicalMaterial color={frame} metalness={0.9} roughness={0.26} clearcoat={0.6} transparent={tr} opacity={op} depthWrite={!tr} />
      </mesh>
      <mesh geometry={glass} position={[0, 0, 0.171]}>
        <meshPhysicalMaterial color="#05060A" metalness={0.2} roughness={0.08} clearcoat={1} transparent={tr} opacity={op} depthWrite={!tr} />
      </mesh>
      <mesh geometry={screenGeo} position={[0, 0, 0.183]}>
        <meshBasicMaterial map={tex} toneMapped={false} transparent opacity={(1 - xray) * glow} />
      </mesh>
      {/* الجزيرة */}
      <mesh position={[0, 2.72, 0.186]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.13, 0.5, 4, 12]} />
        <meshBasicMaterial color="#000" transparent={tr} opacity={op} />
      </mesh>
      {/* الكاميرات الخلفية */}
      <group position={[-0.62, 2.2, -0.2]}>
        <mesh geometry={camGeo}>
          <meshPhysicalMaterial color={frame} metalness={0.85} roughness={0.2} transparent={tr} opacity={op} />
        </mesh>
        {[
          [-0.3, 0.3],
          [-0.3, -0.3],
          [0.3, 0],
        ].map(([x, y], i) => (
          <group key={i} position={[x, y, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.24, 0.24, 0.1, 32]} />
              <meshPhysicalMaterial color="#1A1C22" metalness={0.9} roughness={0.2} transparent={tr} opacity={op} />
            </mesh>
            <mesh position={[0, -0.051, 0]}>
              <cylinderGeometry args={[0.16, 0.16, 0.01, 32]} />
              <meshPhysicalMaterial color="#0A0F2A" metalness={0.3} roughness={0.05} clearcoat={1} transparent={tr} opacity={op} />
            </mesh>
          </group>
        ))}
      </group>
      {/* الأزرار */}
      {[
        [1.52, 1.4, 0.9],
        [-1.52, 1.7, 0.45],
        [-1.52, 1.0, 0.45],
      ].map(([x, y, h], i) => (
        <mesh key={i} position={[x, y, 0]}>
          <boxGeometry args={[0.06, h, 0.16]} />
          <meshStandardMaterial color={frame} metalness={0.9} roughness={0.3} transparent={tr} opacity={op} />
        </mesh>
      ))}
      {/* الكفر */}
      {caseOn > 0.001 ? (
        <mesh geometry={caseGeo} position={[0, -(1 - caseOn) * 1.2, -0.06 - (1 - caseOn) * 3]}>
          <meshPhysicalMaterial color={caseColor} roughness={0.55} sheen={1} transparent opacity={Math.min(1, caseOn * 1.4)} />
        </mesh>
      ) : null}
      {children}
    </group>
  );
};
