import { AbsoluteFill } from "remotion";
import { PERSPECTIVE, makePath, smooth, worldTransform } from "../../lib/camera3d";
import { DustField, FilmLook, FlashBurst, LightLine } from "../../lib/world3d";
import { MusicProvider, SFX_RISER_PEAK, Sfx } from "../../lib/music";
import { useCurrentFrame } from "remotion";
import { ARR, FRAMES, HIT, LEAVE, Z, camZ } from "./tl";
import { Handles, T } from "./parts";
import { Hook } from "./Hook";
import { Chat } from "./Chat";
import { Cowork } from "./Cowork";
import { Code } from "./Code";
import { Compare } from "./Compare";
import { End } from "./End";

/**
 * «Claude · ٣ طرق» — تدريب 52ث بلقطة واحدة متواصلة (1080×1920 · 30fps).
 * الكاميرا تمر على 4 محطات (المحادثة ← Cowork ← Claude Code ← الفرق) ثم الختام،
 * وكل محطة فيها رسم متحرك يشرح الفكرة بمثال حرفي. الموسيقى: ElevenLabs معاد ترتيبها (drop عند 120).
 * المصادر: support.claude.com (Cowork + المحادثة = Claude واحد · Get started with Cowork) و code.claude.com/docs/en/overview.
 */
export const CLAUDE_TRIO_FRAMES = FRAMES;
const station = (a: number, l: number, z: number, x0: number, x1: number) => [
  { f: a, x: x0, y: 0, z: camZ(z), yaw: x0 / 25, pitch: 0, roll: 0, stop: true },
  { f: l, x: x1, y: 0, z: camZ(z) - 90, yaw: x1 / 25, pitch: 0, roll: 0, stop: true },
];
const path = makePath([
  { f: 0, x: 0, y: 0, z: 1650, yaw: 0, pitch: 0, roll: 0 },
  { f: 96, z: 1250 },
  { f: HIT - 2, z: 1230 },
  ...station(ARR.chat, LEAVE.chat, Z.chat, -25, 25),
  ...station(ARR.cowork, LEAVE.cowork, Z.cowork, 25, -25),
  ...station(ARR.code, LEAVE.code, Z.code, -25, 25),
  ...station(ARR.compare, LEAVE.compare, Z.compare, 25, -25),
  { f: ARR.end, x: 0, y: 0, z: camZ(Z.end), yaw: 0, pitch: 0, roll: 0, stop: true },
  { f: FRAMES, z: camZ(Z.end) - 140, stop: true },
]);

const TINTS: { z: number; c: string }[] = [
  { z: 1500, c: T.chat },
  { z: camZ(Z.chat), c: T.chat },
  { z: camZ(Z.cowork), c: T.cowork },
  { z: camZ(Z.code), c: T.code },
  { z: camZ(Z.compare), c: T.gold },
  { z: camZ(Z.end), c: T.chat },
];

const Tint: React.FC<{ camZv: number }> = ({ camZv }) => (
  <>
    {TINTS.map((t, i) => {
      const w = Math.max(0, 1 - Math.abs(camZv - t.z) / 1500);
      if (w <= 0) return null;
      return <AbsoluteFill key={i} style={{ background: `radial-gradient(90% 55% at 50% 42%, ${t.c}38, transparent 72%)`, opacity: w }} />;
    })}
  </>
);

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const cam = path(f);
  const footer = smooth(f / 12) * (1 - smooth((f - (ARR.end - 40)) / 14));
  const fadeOut = smooth((f - (FRAMES - 34)) / 26);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 70% at 50% 40%, #121B33 0%, ${T.bg} 70%)`, overflow: "hidden" }}>
      <Tint camZv={cam.z} />
      <AbsoluteFill style={{ perspective: `${PERSPECTIVE}px`, perspectiveOrigin: "50% 50%" }}>
        <div style={{ position: "absolute", left: 540, top: 960, width: 0, height: 0, transformStyle: "preserve-3d", transform: worldTransform(cam) }}>
          <DustField cam={cam} f={f} colors={[T.gold, T.chat, T.cowork, T.code]} zFrom={2200} zTo={Z.end - 500} count={170} />
          <Hook cam={cam} f={f} />
          <Chat cam={cam} f={f} />
          <Cowork cam={cam} f={f} />
          <Code cam={cam} f={f} />
          <Compare cam={cam} f={f} />
          <End cam={cam} f={f} />
        </div>
      </AbsoluteFill>
      <LightLine f={f} hit={HIT} end={FRAMES - 40} color={T.chat} accent={T.code} />
      <FlashBurst f={f} at={HIT} color={T.chat} max={0.7} />
      <FlashBurst f={f} at={ARR.end} color={T.gold} max={0.25} dur={16} />
      <FilmLook f={f} />
      {footer > 0 ? (
        <div style={{ position: "absolute", top: 1462, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: footer * 0.85 }}>
          <Handles size={28} color={T.mute} />
        </div>
      ) : null}
      {fadeOut > 0 ? <AbsoluteFill style={{ background: T.bg, opacity: fadeOut }} /> : null}
    </AbsoluteFill>
  );
};

export const ClaudeTrio: React.FC = () => (
  <MusicProvider src="videos/claude-trio/music.mp3" volume={0.72}>
    <Scene />
    {/* افتتاحية */}
    <Sfx name="whoosh_soft" at={0} volume={0.22} />
    {[58, 67, 76].map((t) => (
      <Sfx key={t} name="pop" at={t} volume={0.22} />
    ))}
    <Sfx name="riser" at={HIT - SFX_RISER_PEAK} volume={0.24} />
    <Sfx name="impact" at={HIT} volume={0.3} />
    <Sfx name="whoosh_fast" at={HIT - 4} volume={0.28} />
    {/* السفر بين المحطات */}
    {[LEAVE.chat, LEAVE.cowork, LEAVE.code, LEAVE.compare].map((t) => (
      <Sfx key={t} name="whoosh_soft" at={t - 4} volume={0.3} />
    ))}
    {/* المحادثة */}
    <Sfx name="pop" at={ARR.chat + 6} volume={0.25} />
    <Sfx name="typing" at={ARR.chat + 20} volume={0.14} />
    <Sfx name="pop" at={ARR.chat + 76} volume={0.2} />
    <Sfx name="success" at={ARR.chat + 108} volume={0.12} />
    <Sfx name="typing" at={ARR.chat + 152} volume={0.1} />
    <Sfx name="pop" at={ARR.chat + 182} volume={0.2} />
    {/* Cowork */}
    <Sfx name="pop" at={ARR.cowork + 28} volume={0.25} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <Sfx key={i} name="click" at={ARR.cowork + 50 + i * 18} volume={0.14} />
    ))}
    {[44, 118, 196].map((t) => (
      <Sfx key={t} name="pop" at={ARR.cowork + t} volume={0.14} />
    ))}
    <Sfx name="success" at={ARR.cowork + 196} volume={0.22} />
    {/* Code */}
    <Sfx name="typing" at={ARR.code + 22} volume={0.16} />
    {[86, 116, 146].map((t) => (
      <Sfx key={t} name="click" at={ARR.code + t} volume={0.16} />
    ))}
    <Sfx name="success" at={ARR.code + 174} volume={0.2} />
    <Sfx name="click" at={ARR.code + 206} volume={0.18} />
    {/* الفرق */}
    {[20, 64, 108].map((t) => (
      <Sfx key={t} name="pop" at={ARR.compare + t} volume={0.24} />
    ))}
    {[160, 196].map((t) => (
      <Sfx key={t} name="click" at={ARR.compare + t} volume={0.14} />
    ))}
    {/* الختام */}
    <Sfx name="impact" at={ARR.end} volume={0.26} />
    <Sfx name="success" at={ARR.end + 8} volume={0.18} />
  </MusicProvider>
);
