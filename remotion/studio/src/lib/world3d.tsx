import { AbsoluteFill, staticFile } from "remotion";
import { Cam, depth, fade, smooth } from "./camera3d";
import { useMusic } from "./music";

/**
 * أدوات «اللقطة الواحدة المتواصلة»: عناصر في فضاء ثلاثي الأبعاد + كاميرا تتحرك بينها (camera3d.ts).
 * استخدمها هكذا:
 *   <AbsoluteFill style={{ perspective: `${PERSPECTIVE}px` }}>
 *     <div style={{ position:"absolute", left:540, top:960, width:0, height:0, transformStyle:"preserve-3d", transform: worldTransform(cam) }}>
 *       <Obj cam={cam} z={-1800}>…</Obj>
 *     </div>
 *   </AbsoluteFill>
 * الإحداثيات من مركز الشاشة (540,960). العنصر على مسافة d=1200 من الكاميرا يظهر بحجمه الطبيعي.
 */

/** عنصر في الفضاء: يتلاشى قرب الكاميرا (near) وفي البعيد (far) تلقائياً */
export const Obj: React.FC<{
  cam: Cam;
  x?: number;
  y?: number;
  z: number;
  ry?: number;
  rx?: number;
  rz?: number;
  near?: number;
  far?: number;
  farSoft?: number;
  opacity?: number;
  children: React.ReactNode;
}> = ({ cam, x = 0, y = 0, z, ry = 0, rx = 0, rz = 0, near = 380, far = 5200, farSoft = 1600, opacity = 1, children }) => {
  const o = fade(depth(cam, z), near, 260, far, farSoft) * opacity;
  if (o <= 0.002) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) translate(-50%, -50%)`,
        opacity: o,
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
};

const rnd = (i: number, n: number) => {
  const v = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** غبار ضوئي ثابت في العالم، يلمع ويتفاعل مع الكيك. colors = ألوان الحبيبات */
export const DustField: React.FC<{ cam: Cam; f: number; colors: string[]; zFrom: number; zTo: number; count?: number }> = ({
  cam,
  f,
  colors,
  zFrom,
  zTo,
  count = 150,
}) => {
  const { kick, high } = useMusic();
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const z = zFrom - rnd(i, 3) * (zFrom - zTo);
        const dd = depth(cam, z);
        if (dd < 260 || dd > 4200) return null;
        const x = (rnd(i, 1) - 0.5) * 2600;
        const y = (rnd(i, 2) - 0.5) * 3600;
        const s = 3 + rnd(i, 4) * 7;
        const c = colors[Math.floor(rnd(i, 5) * colors.length)];
        const tw0 = rnd(i, 6) * 6.28;
        const o = Math.min(1, (dd - 260) / 300) * Math.min(1, (4200 - dd) / 1200);
        const tw = 0.45 + 0.35 * Math.sin(f / 9 + tw0) + kick * 0.5 + high * 0.15;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: s,
              height: s,
              borderRadius: "50%",
              background: c,
              boxShadow: `0 0 ${s * 3}px ${c}`,
              transform: `translate3d(${x + Math.sin(f / 50 + tw0) * 30}px, ${y - f * 0.4}px, ${z}px)`,
              opacity: Math.max(0, Math.min(1, tw)) * o,
            }}
          />
        );
      })}
    </>
  );
};

/** مظهر فيلم: تعتيم أطراف + حبيبات (ملف grain.png بلاطة 256px) */
export const FilmLook: React.FC<{ f: number; grain?: string; vignette?: number }> = ({
  f,
  grain = staticFile("videos/ali-ad/grain.png"),
  vignette = 0.7,
}) => (
  <>
    <AbsoluteFill style={{ background: `radial-gradient(130% 90% at 50% 50%, transparent 45%, rgba(0,0,0,${vignette}) 100%)` }} />
    <AbsoluteFill
      style={{
        // حبيبات فيلم متكررة (بلاطة 256px) — Img ما يكرر البلاطة، فهنا الخلفية مقصودة
        // eslint-disable-next-line @remotion/no-background-image
        backgroundImage: `url(${grain})`,
        backgroundPosition: `${(f * 37) % 256}px ${(f * 91) % 256}px`,
        opacity: 0.06,
        mixBlendMode: "overlay",
      }}
    />
  </>
);

/** وميض لحظة الضربة (شاشة كاملة) */
export const FlashBurst: React.FC<{ f: number; at: number; color: string; max?: number; dur?: number }> = ({
  f,
  at,
  color,
  max = 0.8,
  dur = 14,
}) => {
  const o = f < at - 2 ? 0 : f < at ? ((f - at + 2) / 2) * max : Math.max(0, max * (1 - (f - at) / dur));
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, #FFFFFF, ${color}AA 30%, ${color}33 60%, transparent 85%)`, opacity: o }} />;
};

/** خط ضوء أفقي: يكبر في البداية، ينفجر عند الـ drop، ويرجع في النهاية (حلقة) */
export const LightLine: React.FC<{ f: number; hit: number; end: number; color: string; accent: string; y0?: number }> = ({
  f,
  hit,
  end,
  color,
  accent,
  y0 = 1290,
}) => {
  const { kick } = useMusic();
  const intro = f < hit ? 0.25 + 0.75 * smooth(f / (hit - 10)) : 0;
  const burst = f >= hit - 4 && f < hit + 18 ? 1 - Math.abs(f - hit) / 18 : 0;
  const outro = smooth((f - end) / 20);
  const w = Math.max(intro * 820, burst * 2400, outro * 820);
  const o = Math.max(intro * 0.9, burst, outro);
  if (o <= 0.01) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - w / 2,
        top: f < hit + 20 ? y0 : 960,
        width: w,
        height: 3 + burst * 10,
        borderRadius: 4,
        background: `linear-gradient(90deg, transparent, ${color} 30%, #FFFFFF 50%, ${color} 70%, transparent)`,
        boxShadow: `0 0 ${30 + burst * 120 + kick * 20}px ${color}, 0 0 ${80 + burst * 300}px ${accent}88`,
        opacity: o,
      }}
    />
  );
};
