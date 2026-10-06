import { AbsoluteFill, useCurrentFrame } from "remotion";
import { PERSPECTIVE, smooth, worldTransformEye } from "../../lib/camera3d";
import { FilmLook, FlashBurst } from "../../lib/world3d";
import { MusicProvider, SFX_RISER_PEAK, Sfx } from "../../lib/music";
import { Handles } from "../ClaudeTrio/parts";
import { FRAMES, HIT, S, TABLE_Y, Z, camAt } from "./tl";
import { P } from "./parts";
import { AvoidScene, BriefScene, CostScene, Hook, SingleScene, TeamScene } from "./Scenes";
import { End } from "./End";

/**
 * «وكيل واحد ولا فريق وكلاء؟» — تدريب 53.5ث بلقطة واحدة متواصلة (1080×1920 · 30fps).
 * الاستعارة: طاولة عمل ورقية طويلة بمنظر علوي مائل؛ الوكلاء قطع على الطاولة والمهام بطاقات عليها،
 * والكاميرا تطير فوقها بلا توقف: وكيل واحد ← فريق ← ماذا نعطي كل متخصص ← الكلفة ← متى لا نحتاج فريقاً.
 * المصادر: anthropic.com/engineering/multi-agent-research-system (٩٠٫٢٪ · ٤× · ١٥× · متى لا) و /building-effective-agents (الأبسط أولاً).
 */
export const AGENT_TEAM_FRAMES = FRAMES;

/** الطاولة: رقع ورق بشبكة محاذاة لإحداثيات العالم (فتبدو لوحاً واحداً طويلاً) تُرسم قبل كل القطع */
const PATCH_D = 1700;
const Patches: React.FC = () => (
  <>
    {Object.values(Z).map((zs, i) => {
      const off = (((-(zs - PATCH_D / 2)) % 160) + 160) % 160;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 3400,
            height: PATCH_D,
            transform: `translate3d(0px, ${TABLE_Y}px, ${zs}px) rotateX(90deg) translate(-50%, -50%)`,
            // eslint-disable-next-line @remotion/no-background-image
            backgroundImage: `linear-gradient(${P.grid}99 2px, transparent 2px), linear-gradient(90deg, ${P.grid}99 2px, transparent 2px), linear-gradient(${P.paper}, ${P.paper})`,
            backgroundSize: "160px 160px, 160px 160px, 100% 100%",
            backgroundPosition: `0px ${off}px, 0px 0px, 0 0`,
          }}
        />
      );
    })}
  </>
);

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(f);
  const footer = smooth(f / 12) * (1 - smooth((f - (S.end - 40)) / 14));
  const fadeOut = smooth((f - (FRAMES - 34)) / 26);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${P.bg} 0%, #E9DEC9 100%)`, overflow: "hidden" }}>
      <AbsoluteFill style={{ perspective: `${PERSPECTIVE}px`, perspectiveOrigin: "50% 50%" }}>
        <div style={{ position: "absolute", left: 540, top: 960, width: 0, height: 0, transformStyle: "preserve-3d", transform: worldTransformEye(cam) }}>
          <Patches />
          <Hook cam={cam} f={f} />
          <SingleScene cam={cam} f={f} />
          <TeamScene cam={cam} f={f} />
          <BriefScene cam={cam} f={f} />
          <CostScene cam={cam} f={f} />
          <AvoidScene cam={cam} f={f} />
          <End cam={cam} f={f} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${P.bg} 0%, ${P.bg}CC 6%, transparent 17%)` }} />
      <FlashBurst f={f} at={HIT} color={P.single} max={0.55} />
      <FlashBurst f={f} at={S.end} color={P.gold} max={0.25} dur={16} />
      <FilmLook f={f} vignette={0.28} />
      {footer > 0 ? (
        <div style={{ position: "absolute", top: 1780, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: footer * 0.8 }}>
          <Handles size={28} color={P.mute} />
        </div>
      ) : null}
      {fadeOut > 0 ? <AbsoluteFill style={{ background: P.bg, opacity: fadeOut }} /> : null}
    </AbsoluteFill>
  );
};

export const AgentTeam: React.FC = () => (
  <MusicProvider src="videos/agent-team/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={0} volume={0.2} />
    {[30, 44, 58, 72, 86].map((t) => (
      <Sfx key={t} name="pop" at={t} volume={0.18} />
    ))}
    <Sfx name="riser" at={HIT - SFX_RISER_PEAK} volume={0.24} />
    <Sfx name="impact" at={HIT} volume={0.3} />
    <Sfx name="whoosh_fast" at={HIT - 4} volume={0.26} />
    {[S.single, S.team, S.brief, S.cost, S.avoid, S.end].map((t) => (
      <Sfx key={t} name="whoosh_soft" at={t - 20} volume={0.26} />
    ))}
    {/* وكيل واحد: ✓ لكل مهمة */}
    {Array.from({ length: 6 }, (_, i) => (
      <Sfx key={i} name="click" at={S.single + 22 + i * 20 + 14} volume={0.14} />
    ))}
    <Sfx name="success" at={S.single + 140} volume={0.16} />
    {/* فريق */}
    <Sfx name="pop" at={S.team + 30} volume={0.22} />
    <Sfx name="click" at={S.team + 56} volume={0.14} />
    <Sfx name="success" at={S.team + 140} volume={0.22} />
    {/* تعليمات */}
    {[0, 1, 2, 3].map((i) => (
      <Sfx key={i} name="pop" at={S.brief + 12 + i * 22 + 16} volume={0.2} />
    ))}
    <Sfx name="success" at={S.brief + 112} volume={0.18} />
    {/* كلفة */}
    {[14, 24, 34].map((t) => (
      <Sfx key={t} name="click" at={S.cost + t} volume={0.14} />
    ))}
    <Sfx name="pop" at={S.cost + 100} volume={0.22} />
    {/* متى لا */}
    {[36, 52, 68, 84].map((t) => (
      <Sfx key={t} name="error" at={S.avoid + t} volume={0.1} />
    ))}
    <Sfx name="success" at={S.avoid + 104} volume={0.2} />
    <Sfx name="impact" at={S.end} volume={0.26} />
    <Sfx name="success" at={S.end + 8} volume={0.16} />
  </MusicProvider>
);
