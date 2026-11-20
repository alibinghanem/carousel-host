import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { roundedRectGeo } from "./Phone";

type G = ThreeElements["group"];
export type Draw = (g: CanvasRenderingContext2D, w: number, h: number) => void;

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

const rnd = (seed: number, i: number, j: number) => {
  const x = Math.sin(seed * 127.1 + i * 311.7 + j * 74.7) * 43758.5453;
  return x - Math.floor(x);
};

/** يرسم كود QR شكلي (مو قابل للمسح): مربعات الزوايا الثلاثة + وحدات عشوائية ثابتة بحسب seed */
export const drawQr = (g: CanvasRenderingContext2D, x: number, y: number, size: number, seed: number, fg = "#111", bg = "#fff") => {
  const N = 25;
  const c = size / N;
  g.fillStyle = bg;
  g.fillRect(x, y, size, size);
  g.fillStyle = fg;
  const inFinder = (i: number, j: number) => (i < 8 && j < 8) || (i > N - 9 && j < 8) || (i < 8 && j > N - 9);
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      if (inFinder(i, j)) continue;
      if (rnd(seed, i, j) > 0.52) g.fillRect(x + i * c, y + j * c, c * 0.96, c * 0.96);
    }
  [
    [0, 0],
    [N - 7, 0],
    [0, N - 7],
  ].forEach(([i, j]) => {
    g.fillStyle = fg;
    g.fillRect(x + i * c, y + j * c, 7 * c, 7 * c);
    g.fillStyle = bg;
    g.fillRect(x + (i + 1) * c, y + (j + 1) * c, 5 * c, 5 * c);
    g.fillStyle = fg;
    g.fillRect(x + (i + 2) * c, y + (j + 2) * c, 3 * c, 3 * c);
  });
};

/**
 * لوحة QR مثبتة على عمود (عداد مواقف أو إعلان): وجه canvas 600×820، منطقة الكود مربع 480 بمركز اللوحة بالضبط.
 * المقاس 3.0 × 4.1 وحدة، واللوحة تطل على +Z. العمود خلفها.
 */
export const QrPlate: React.FC<{ draw: Draw; pole?: boolean; color?: string } & G> = ({ draw, pole = true, color = "#12315E", ...rest }) => {
  const body = useMemo(() => new RoundedBoxGeometry(3.0, 4.1, 0.16, 5, 0.1), []);
  const face = useMemo(() => roundedRectGeo(2.92, 4.02, 0.08), []);
  const tex = useLiveTex(600, 820, draw);
  return (
    <group {...rest}>
      {pole ? (
        <>
          <mesh position={[0, -4.2, -0.2]}>
            <cylinderGeometry args={[0.13, 0.16, 6.4, 24]} />
            <meshPhysicalMaterial color="#7C8794" metalness={0.9} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, -0.18]}>
            <boxGeometry args={[0.5, 4.2, 0.1]} />
            <meshStandardMaterial color="#59616C" metalness={0.8} roughness={0.4} />
          </mesh>
        </>
      ) : null}
      <mesh geometry={body}>
        <meshPhysicalMaterial color={color} roughness={0.4} clearcoat={0.6} />
      </mesh>
      <mesh geometry={face} position={[0, 0, 0.085]}>
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
};

/**
 * ملصق مزيّف فوق الكود: ورقة بيضاء بكود مختلف (seed)، مفصّلتها بالحافة العليا. peel: 0..1 يقشّرها للأمام (يبان اللي تحتها).
 * الحجم 2.46 × 2.46 (يغطي منطقة الكود). ضعه عند z الوجه ≈ 0.1
 */
export const FakeSticker: React.FC<{ seed?: number; peel?: number; tint?: string } & G> = ({ seed = 7, peel = 0, tint = "#FFFFFF", ...rest }) => {
  const tex = useLiveTex(512, 512, (g, w) => {
    g.fillStyle = tint;
    g.fillRect(0, 0, w, w);
    drawQr(g, 24, 24, w - 48, seed, "#111", tint);
    g.strokeStyle = "rgba(0,0,0,.25)";
    g.lineWidth = 6;
    g.strokeRect(3, 3, w - 6, w - 6);
  });
  const s = 2.46;
  const geo = useMemo(() => roundedRectGeo(s, s, 0.03), []);
  return (
    <group {...rest}>
      <group position={[0, s / 2, 0]} rotation={[-peel * 1.0, 0, 0]}>
        <group position={[0, -s / 2, 0]}>
          <mesh geometry={geo}>
            <meshBasicMaterial map={tex} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh geometry={geo} position={[0, 0, -0.012]}>
            <meshBasicMaterial color="#D9D4C7" side={THREE.BackSide} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

/** شعاع مسح: مستطيل مضيء يمتد من الجوال للكود */
export const ScanSweep: React.FC<{ t?: number; w?: number; h?: number; color?: string } & G> = ({ t = 0, w = 2.5, h = 2.5, color = "#FFC400", ...rest }) => (
  <group {...rest}>
    <mesh position={[0, (t - 0.5) * h, 0]}>
      <planeGeometry args={[w, 0.07]} />
      <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.95} />
    </mesh>
    <mesh position={[0, (t - 0.5) * h - 0.2, -0.01]}>
      <planeGeometry args={[w, 0.4]} />
      <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
    {[
      [-1, 1],
      [1, 1],
      [-1, -1],
      [1, -1],
    ].map(([a, b], i) => (
      <group key={i} position={[(a * w) / 2, (b * h) / 2, 0.01]}>
        <mesh position={[(-a * 0.2) / 1, 0, 0]}>
          <boxGeometry args={[0.4, 0.06, 0.02]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
        <mesh position={[0, -b * 0.2, 0]}>
          <boxGeometry args={[0.06, 0.4, 0.02]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      </group>
    ))}
  </group>
);
