import type { ThreeElements } from "@react-three/fiber";
import React, { useMemo } from "react";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

type G = ThreeElements["group"];

/** راوتر: جسم أبيض بحواف ناعمة، هوائيان، وأضواء حالة. يواجه +Z */
export const Router3D: React.FC<{ led?: string; antenna?: number } & G> = ({ led = "#2BE38B", antenna = 1, ...rest }) => {
  const body = useMemo(() => new RoundedBoxGeometry(1.5, 0.3, 0.9, 5, 0.1), []);
  return (
    <group {...rest}>
      <mesh geometry={body} position={[0, 0.15, 0]}>
        <meshPhysicalMaterial color="#F3F5F8" roughness={0.35} clearcoat={0.7} />
      </mesh>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.3 + 0.45 * antenna, -0.25]}>
          <cylinderGeometry args={[0.045, 0.06, 0.9 * antenna, 14]} />
          <meshStandardMaterial color="#2B2F3A" roughness={0.45} />
        </mesh>
      ))}
      {[-0.3, 0, 0.3].map((x, i) => (
        <mesh key={i} position={[x, 0.18, 0.46]}>
          <sphereGeometry args={[0.045, 12, 10]} />
          <meshBasicMaterial color={i === 1 ? led : "#2BE38B"} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

/** نقطة شبكة إضافية (Mesh): أسطوانة بيضاء قصيرة بحلقة ضوء */
export const MeshPoint: React.FC<{ led?: string } & G> = ({ led = "#2BE38B", ...rest }) => (
  <group {...rest}>
    <mesh position={[0, 0.5, 0]}>
      <cylinderGeometry args={[0.38, 0.45, 1.0, 40]} />
      <meshPhysicalMaterial color="#F3F5F8" roughness={0.3} clearcoat={0.8} />
    </mesh>
    <mesh position={[0, 0.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.39, 0.03, 10, 40]} />
      <meshBasicMaterial color={led} toneMapped={false} />
    </mesh>
  </group>
);

/** أقواس إشارة (رمز Wi-Fi) تنتشر يميناً (dir=1) أو يساراً (dir=-1). كل قوس: نصف قطر، شفافية، لون */
export type Arc = { r: number; o: number; c?: string; w?: number; s?: number };
export const WifiArcs: React.FC<{ arcs: Arc[]; dir?: 1 | -1; span?: number } & G> = ({ arcs, dir = 1, span = Math.PI * 0.62, ...rest }) => (
  <group {...rest} scale={[dir, 1, 1]}>
    {arcs.map((a, i) => (
      <mesh key={i} rotation={[0, 0, -(a.s ?? span) / 2]}>
        <torusGeometry args={[a.r, a.w ?? 0.045, 8, 64, a.s ?? span]} />
        <meshBasicMaterial color={a.c ?? "#27E89A"} transparent opacity={a.o} toneMapped={false} depthWrite={false} />
      </mesh>
    ))}
  </group>
);

/**
 * بيت بمقطع عرضي (دوليّ): أرضية، جدار خلفي، جداران فاصلان بين ثلاث غرف، ومنظر مفتوح للكاميرا.
 * W عرض البيت، والغرف الثلاث متساوية. يمتد من y=0 إلى y=3.2.
 */
export const HouseCut: React.FC<{ W?: number; roof?: boolean } & G> = ({ W = 7.2, roof = true, ...rest }) => {
  const rw = W / 3;
  const wall = "#F6EEDF";
  const back = "#D6E4EE";
  return (
    <group {...rest}>
      <mesh position={[0, -0.14, 0]}>
        <boxGeometry args={[W + 0.4, 0.28, 3.4]} />
        <meshStandardMaterial color="#B98B57" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.6, -1.6]}>
        <boxGeometry args={[W, 3.2, 0.2]} />
        <meshStandardMaterial color={back} roughness={0.9} />
      </mesh>
      {[-rw / 2, rw / 2].map((x) => (
        <mesh key={x} position={[x, 1.6, -0.1]}>
          <boxGeometry args={[0.22, 3.2, 3.0]} />
          <meshStandardMaterial color={wall} roughness={0.85} />
        </mesh>
      ))}
      {[-W / 2, W / 2].map((x) => (
        <mesh key={x} position={[x, 1.6, -0.1]}>
          <boxGeometry args={[0.2, 3.2, 3.0]} />
          <meshStandardMaterial color={wall} roughness={0.85} />
        </mesh>
      ))}
      {roof ? (
        <mesh position={[0, 3.32, -0.1]}>
          <boxGeometry args={[W + 0.5, 0.2, 3.3]} />
          <meshStandardMaterial color="#6F5A4B" roughness={0.7} transparent opacity={0.16} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
};

/** خزانة بباب مفتوح: صندوق خشبي ثلاثة جوانب + سقف + أرفف */
export const Cabinet: React.FC<{ w?: number; h?: number; d?: number } & G> = ({ w = 2.6, h = 2.4, d = 1.5, ...rest }) => {
  const wood = "#7A5535";
  return (
    <group {...rest}>
      <mesh position={[0, 0.1, 0]}><boxGeometry args={[w, 0.2, d]} /><meshStandardMaterial color={wood} roughness={0.6} /></mesh>
      <mesh position={[0, h, 0]}><boxGeometry args={[w, 0.2, d]} /><meshStandardMaterial color={wood} roughness={0.6} /></mesh>
      <mesh position={[-w / 2 + 0.1, h / 2 + 0.1, 0]}><boxGeometry args={[0.2, h, d]} /><meshStandardMaterial color={wood} roughness={0.6} /></mesh>
      <mesh position={[w / 2 - 0.1, h / 2 + 0.1, 0]}><boxGeometry args={[0.2, h, d]} /><meshStandardMaterial color={wood} roughness={0.6} /></mesh>
      <mesh position={[0, h / 2 + 0.1, -d / 2 + 0.06]}><boxGeometry args={[w, h, 0.12]} /><meshStandardMaterial color="#5E4128" roughness={0.7} /></mesh>
    </group>
  );
};

/** رف خشبي بسيط */
export const Shelf: React.FC<{ w?: number } & G> = ({ w = 2.4, ...rest }) => (
  <group {...rest}>
    <mesh><boxGeometry args={[w, 0.14, 1.1]} /><meshStandardMaterial color="#8A6238" roughness={0.6} /></mesh>
    {[-w / 2 + 0.2, w / 2 - 0.2].map((x) => (
      <mesh key={x} position={[x, -0.35, -0.3]}><boxGeometry args={[0.1, 0.6, 0.4]} /><meshStandardMaterial color="#6F4C2A" roughness={0.6} /></mesh>
    ))}
  </group>
);

/** عوائق للإشارة: concrete جدار خرساني · metal خزانة معدنية · water خزان ماء */
export const Obstacle: React.FC<{ kind: "concrete" | "metal" | "water" } & G> = ({ kind, ...rest }) => (
  <group {...rest}>
    {kind === "concrete" ? (
      <>
        <mesh position={[0, 1.4, 0]}><boxGeometry args={[0.7, 2.8, 2.2]} /><meshStandardMaterial color="#9A9A96" roughness={0.95} /></mesh>
        {[0.4, 1.1, 1.8, 2.5].map((y) => (
          <mesh key={y} position={[0.36, y, 0]}><boxGeometry args={[0.02, 0.05, 2.2]} /><meshStandardMaterial color="#7C7C78" /></mesh>
        ))}
      </>
    ) : null}
    {kind === "metal" ? (
      <>
        <mesh position={[0, 1.4, 0]}><boxGeometry args={[1.0, 2.8, 2.0]} /><meshStandardMaterial color="#B9C2CC" metalness={1} roughness={0.28} /></mesh>
        {[0.7, 1.4, 2.1].map((y) => (
          <mesh key={y} position={[0.52, y, 0]}><boxGeometry args={[0.02, 0.06, 1.7]} /><meshStandardMaterial color="#5A6470" /></mesh>
        ))}
      </>
    ) : null}
    {kind === "water" ? (
      <>
        <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.9, 0.9, 2.4, 48]} /><meshPhysicalMaterial color="#6CC6FF" transmission={0.7} thickness={0.8} roughness={0.1} transparent opacity={0.55} /></mesh>
        <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.95, 0.95, 0.06, 48]} /><meshStandardMaterial color="#44505C" metalness={0.8} roughness={0.3} /></mesh>
      </>
    ) : null}
  </group>
);
