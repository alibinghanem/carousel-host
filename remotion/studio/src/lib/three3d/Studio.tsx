import { useThree } from "@react-three/fiber";
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * بيئة استوديو للانعكاسات (بدون تحميل من النت): RoomEnvironment → PMREM → scene.environment.
 * بدونها المعادن تطلع سوداء. الخلفية تبقى شفافة عشان تبان خلفية HTML تحت الـ Canvas.
 */
export const StudioEnv: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const { gl, scene } = useThree();
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return tex;
  }, [gl]);
  useLayoutEffect(() => {
    scene.environment = env;
    scene.background = null;
    scene.environmentIntensity = intensity;
    gl.toneMapping = THREE.NeutralToneMapping;
    gl.toneMappingExposure = 1.05;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [env, scene, gl, intensity]);
  return null;
};

/** كاميرا يتحكم فيها الفريم: مكان ونقطة نظر */
export const CameraRig: React.FC<{ pos: [number, number, number]; look: [number, number, number]; fov?: number }> = ({ pos, look, fov }) => {
  const { camera } = useThree();
  camera.position.set(...pos);
  camera.lookAt(...look);
  if (fov && (camera as THREE.PerspectiveCamera).fov !== fov) {
    (camera as THREE.PerspectiveCamera).fov = fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }
  return null;
};

/** إضاءة ثلاثية: رئيسي دافئ أو بارد، حافة ملوّنة، وتعبئة ناعمة */
export const Lights: React.FC<{ key1?: string; rim?: string; rim2?: string; k?: number; r?: number }> = ({ key1 = "#ffffff", rim = "#4FA3FF", rim2 = "#FF6A3D", k = 2.2, r = 60 }) => (
  <>
    <ambientLight intensity={0.25} />
    <directionalLight position={[4, 7, 9]} intensity={k} color={key1} />
    <pointLight position={[-7, 3, -3]} intensity={r} color={rim} distance={40} />
    <pointLight position={[7, -2, -2]} intensity={r * 0.7} color={rim2} distance={40} />
  </>
);

/** ظل ناعم مزيّف تحت الجسم (دائرة بتدرّج) */
export const SoftShadow: React.FC<{ y: number; w?: number; d?: number; o?: number }> = ({ y, w = 5, d = 2.4, o = 0.55 }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, "rgba(0,0,0,1)");
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
      <planeGeometry args={[w, d]} />
      <meshBasicMaterial map={tex} transparent opacity={o} depthWrite={false} />
    </mesh>
  );
};
