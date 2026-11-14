import { AbsoluteFill, useCurrentFrame } from "remotion";
import { PERSPECTIVE, smooth, worldTransform } from "../../lib/camera3d";
import { FilmLook, FlashBurst } from "../../lib/world3d";
import { MusicProvider, SFX_RISER_PEAK, Sfx } from "../../lib/music";
import { Handles } from "../ClaudeTrio/parts";
import { FRAMES, HIT, S, X, camAt } from "./tl";
import { P } from "./parts";
import { End } from "./End";
import { How, Hook, S1, S2, S3, S4, S5 } from "./Scenes";

/**
 * «خمس خدمات تبيعها اليوم بالذكاء الاصطناعي» — تدريب 57ث بلقطة واحدة متواصلة (1080×1920 · 30fps).
 * الاستعارة: سوق شعبي نهاري؛ الكاميرا تنزلق على صف بسطات (كل بسطة خدمة) بلا توقف، والأشياء تتحرك على الطاولة.
 * الخدمات: ردود واتساب · تقارير أسبوعية · فرز البريد · جدول محتوى · تحليل مبيعات (خدمات يقدمها مزوّدو الأتمتة في السعودية).
 */
export const SOUQ_FRAMES = FRAMES;

/** خلفية السوق: سماء دافئة + مبانٍ بعيدة بحركة منظورية بطيئة */
const Backdrop: React.FC<{ camX: number }> = ({ camX }) => {
  const W = 2400;
  const far = -((camX * 0.08) % W);
  const mid = -((camX * 0.2) % W);
  const roof = (seed: number, color: string, base: number, hMax: number) => {
    const r = (n: number) => {
      const v = Math.sin(seed * 91.7 + n * 37.3) * 43758.5453;
      return v - Math.floor(v);
    };
    const bs = Array.from({ length: 16 }, (_, i) => ({ x: i * 150 + r(i) * 30, w: 110 + r(i + 20) * 70, h: 80 + r(i + 40) * hMax, dome: r(i + 60) > 0.65 }));
    return (
      <svg width={W} height={base + 40} viewBox={`0 0 ${W} ${base + 40}`} style={{ position: "absolute", left: 0, top: 0 }}>
        {bs.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={base - b.h} width={b.w} height={b.h + 40} fill={color} />
            {b.dome ? <ellipse cx={b.x + b.w / 2} cy={base - b.h} rx={b.w / 2.4} ry={b.w / 3} fill={color} /> : null}
          </g>
        ))}
      </svg>
    );
  };
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, #FFD9B0 0%, #FFE9CF 42%, #F3D7AE 70%, ${P.sand} 100%)` }} />
      <div style={{ position: "absolute", left: 640, top: 150, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, #FFF6DC, #FFD58A 55%, transparent 72%)" }} />
      {[0, 1].map((k) => (
        <div key={`f${k}`} style={{ position: "absolute", left: far + k * W, top: 520, width: W, height: 500, opacity: 0.55 }}>
          {roof(3, "#E0B58A", 400, 200)}
        </div>
      ))}
      {[0, 1].map((k) => (
        <div key={`m${k}`} style={{ position: "absolute", left: mid + k * W, top: 640, width: W, height: 500, opacity: 0.8 }}>
          {roof(9, "#C99568", 380, 140)}
        </div>
      ))}
    </AbsoluteFill>
  );
};

/** الطاولة الطويلة + رايات الزينة: رقع محاذية لإحداثيات العالم */
const Market: React.FC = () => (
  <>
    {Object.values(X).map((x, i) => {
      const w = 1900;
      const xr = Math.round(x);
      const off = ((((-(xr - w / 2)) % 120) + 120) % 120);
      const flagOff = ((((-(xr - w / 2)) % 160) + 160) % 160);
      return (
        <div key={i}>
          {/* واجهة الطاولة */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: w,
              height: 700,
              transform: `translate3d(${xr}px, 560px, 20px) translate(-50%, -50%)`,
              // eslint-disable-next-line @remotion/no-background-image
              backgroundImage: `linear-gradient(180deg, #C58B52 0px, #C58B52 22px, ${P.wood2} 22px, ${P.wood} 40px, ${P.wood3} 100%), repeating-linear-gradient(90deg, rgba(0,0,0,.12) 0 3px, transparent 3px 120px)`,
              backgroundPosition: `0 0, ${off}px 0`,
              boxShadow: "0 -14px 30px rgba(60,30,10,.3)",
            }}
          />
          {/* حبل رايات */}
          <svg style={{ position: "absolute", left: 0, top: 0, transform: `translate3d(${xr}px, -800px, 0px) translate(-50%, -50%)`, overflow: "visible" }} width={w} height={90} viewBox={`0 0 ${w} 90`}>
            <line x1={0} y1={10} x2={w} y2={10} stroke="#6B4A2E" strokeWidth={4} />
            {Array.from({ length: Math.ceil(w / 80) + 3 }, (_, k) => {
              const cx = k * 80 - flagOff + 40 - 80;
              return <polygon key={k} points={`${cx - 28},10 ${cx + 28},10 ${cx},70`} fill={[P.terra, P.gold, P.teal, P.plum, P.blue][k % 5]} />;
            })}
          </svg>
        </div>
      );
    })}
  </>
);

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(f);
  const footer = smooth(f / 12) * (1 - smooth((f - (S.end - 30)) / 14));
  const fadeOut = smooth((f - (FRAMES - 30)) / 24);
  return (
    <AbsoluteFill style={{ background: P.sand, overflow: "hidden" }}>
      <Backdrop camX={cam.x} />
      <AbsoluteFill style={{ perspective: `${PERSPECTIVE}px`, perspectiveOrigin: "50% 50%" }}>
        <div style={{ position: "absolute", left: 540, top: 960, width: 0, height: 0, transformStyle: "preserve-3d", transform: worldTransform(cam) }}>
          <Market />
          <Hook cam={cam} f={f} />
          <S1 cam={cam} f={f} />
          <S2 cam={cam} f={f} />
          <S3 cam={cam} f={f} />
          <S4 cam={cam} f={f} />
          <S5 cam={cam} f={f} />
          <How cam={cam} f={f} />
          <End cam={cam} f={f} />
        </div>
      </AbsoluteFill>
      <FlashBurst f={f} at={HIT} color="#FFD58A" max={0.5} />
      <FilmLook f={f} vignette={0.3} />
      {footer > 0 ? (
        <div style={{ position: "absolute", top: 1780, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: footer * 0.85 }}>
          <Handles size={28} color={P.mute} />
        </div>
      ) : null}
      {fadeOut > 0 ? <AbsoluteFill style={{ background: P.sand, opacity: fadeOut }} /> : null}
    </AbsoluteFill>
  );
};

export const Souq: React.FC = () => (
  <MusicProvider src="videos/souq/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={0} volume={0.2} />
    {[38, 46, 54, 62, 70].map((t) => (
      <Sfx key={t} name="pop" at={t} volume={0.16} />
    ))}
    <Sfx name="riser" at={HIT - SFX_RISER_PEAK} volume={0.24} />
    <Sfx name="impact" at={HIT} volume={0.3} />
    <Sfx name="whoosh_fast" at={HIT - 4} volume={0.26} />
    {[S.s1, S.s2, S.s3, S.s4, S.s5, S.how, S.end].map((t) => (
      <Sfx key={t} name="whoosh_soft" at={t - 16} volume={0.24} />
    ))}
    {/* واتساب */}
    {[26, 52, 92, 118].map((t) => (
      <Sfx key={t} name="pop" at={S.s1 + t} volume={0.2} />
    ))}
    {/* تقارير */}
    <Sfx name="typing" at={S.s2 + 30} volume={0.14} />
    <Sfx name="success" at={S.s2 + 70} volume={0.16} />
    {/* فرز */}
    {Array.from({ length: 8 }, (_, i) => (
      <Sfx key={i} name="click" at={S.s3 + 24 + i * 10 + 20} volume={0.12} />
    ))}
    {/* محتوى */}
    {Array.from({ length: 7 }, (_, i) => (
      <Sfx key={i} name="click" at={S.s4 + 24 + i * 14} volume={0.1} />
    ))}
    {/* مبيعات */}
    {Array.from({ length: 6 }, (_, i) => (
      <Sfx key={i} name="click" at={S.s5 + 34 + i * 7} volume={0.1} />
    ))}
    <Sfx name="success" at={S.s5 + 84} volume={0.18} />
    {/* كيف تبدأ */}
    {[20, 42, 64].map((t) => (
      <Sfx key={t} name="pop" at={S.how + t} volume={0.2} />
    ))}
    <Sfx name="impact" at={S.end} volume={0.26} />
    <Sfx name="success" at={S.end + 8} volume={0.16} />
  </MusicProvider>
);
