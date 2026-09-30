import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { Audio } from "@remotion/media";
import { Background } from "../../../lib/Background";
import { Arrow, Target } from "../Target";
import { Burst, Chip, Flash, Words } from "../../../lib/ui";
import { C, F, IN_OUT, lerp, shake } from "../../../lib/theme";

/** 0–8ث: القوس يُشد، السهم ينطلق على ضربة الموسيقى (ث4) ويطيش، ثم العنوان */
const HIT = 124; // لحظة ارتطام السهم خارج الهدف
const FIRE = 116;
const IMPACT = { x: 905, y: 792 };

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sx = shake(f, HIT, 20, 22);
  const sy = shake(f + 3, HIT, 20, 14);

  // شدّ القوس ثم الطيران
  const pull = lerp(f, [60, FIRE], [0, 70], IN_OUT);
  const jitter = f > 80 && f < FIRE ? Math.sin(f * 3.1) * 2.5 : 0;
  const fly = lerp(f, [FIRE, HIT], [0, 1], (t) => t * t);
  const ax = lerp(fly, [0, 1], [540, IMPACT.x], (t) => t);
  const ay = f < FIRE ? 1640 + pull : lerp(fly, [0, 1], [1640 + 70, IMPACT.y], (t) => t);
  const aScale = f < FIRE ? 1 : lerp(fly, [0, 1], [1, 0.62], (t) => t);
  const aRot = f < FIRE ? 0 : 22;
  const wobble = f > HIT ? Math.sin((f - HIT) * 1.6) * 7 * Math.max(0, 1 - (f - HIT) / 30) : 0;

  const titleS = spring({ frame: f - (HIT + 4), fps, config: { damping: 12, stiffness: 160 } });
  const ab = lerp(f, [HIT + 4, HIT + 26], [16, 0]);
  const hookOut = lerp(f, [FIRE - 6, FIRE + 2], [1, 0]);
  const tgtIn = spring({ frame: f - 4, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ translate: `${sx}px ${sy}px` }}>
      <Background tint={C.b} />

      {/* الهدف بمنظور ثلاثي */}
      <div
        style={{
          position: "absolute",
          left: 540 - 290,
          top: 1080 - 290,
          width: 580,
          height: 580,
          transform: `perspective(1400px) rotateX(${lerp(f, [0, 110], [28, 12])}deg)`,
          opacity: tgtIn,
          scale: `${0.8 + 0.2 * tgtIn + Math.sin(f / 12) * 0.008}`,
        }}
      >
        <Target size={580} draw={lerp(f, [4, 50], [0, 1])} glow={1 + Math.sin(f / 9) * 0.3} />
      </div>

      {/* نص الهوك */}
      <div style={{ opacity: hookOut, filter: `blur(${(1 - hookOut) * 14}px)` }}>
        <Words
          text="شغّلت وكيل ذكاء اصطناعي…"
          at={8}
          style={{ position: "absolute", top: 360, left: 40, right: 40, textAlign: "center", fontFamily: F.head, fontWeight: 800, fontSize: 74, color: "#fff", whiteSpace: "nowrap" }}
        />
        <Words
          text="ورجع لك بشي ما طلبته؟"
          at={36}
          color={C.y}
          style={{ position: "absolute", top: 470, left: 40, right: 40, textAlign: "center", fontFamily: F.head, fontWeight: 800, fontSize: 90, whiteSpace: "nowrap" }}
        />
      </div>

      {/* أثر حركة السهم */}
      {f >= FIRE && f <= HIT + 2
        ? [3, 2, 1].map((k) => {
            const fl = lerp(f - k, [FIRE, HIT], [0, 1], (t) => t * t);
            return (
              <div
                key={k}
                style={{
                  position: "absolute",
                  left: lerp(fl, [0, 1], [540, IMPACT.x], (t) => t) - 30,
                  top: lerp(fl, [0, 1], [1710, IMPACT.y], (t) => t),
                  opacity: 0.18 * (4 - k),
                  scale: `${aScale}`,
                  rotate: `${aRot}deg`,
                  transformOrigin: "30px 0px",
                }}
              >
                <Arrow len={360} color={C.cyan} />
              </div>
            );
          })
        : null}
      <div
        style={{
          position: "absolute",
          left: ax - 30 + jitter,
          top: ay,
          scale: `${aScale}`,
          rotate: `${aRot + wobble}deg`,
          transformOrigin: "30px 0px",
          filter: `drop-shadow(0 0 16px ${C.cyan}88)`,
        }}
      >
        <Arrow len={360} />
      </div>

      <Burst at={HIT} x={IMPACT.x} y={IMPACT.y} color={C.r} />
      <Flash at={HIT} color={C.r} max={0.35} />

      {/* العنوان */}
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 40,
          right: 40,
          textAlign: "center",
          direction: "rtl",
          fontFamily: F.head,
          fontWeight: 800,
          opacity: Math.min(1, titleS * 1.6),
          scale: `${1.6 - 0.6 * titleS}`,
        }}
      >
        <div style={{ fontSize: 124, color: "#fff", lineHeight: 1.1 }}>ليش وكيلك</div>
        <div
          style={{
            fontSize: 250,
            lineHeight: 1,
            color: C.y,
            textShadow: `${ab}px 0 ${C.r}, ${-ab}px 0 ${C.cyan}, 0 0 60px ${C.y}66`,
          }}
        >
          يطيش؟
        </div>
      </div>

      <Chip at={168} bg="rgba(11,14,20,.75)" style={{ position: "absolute", top: 860, left: 40 }}>
        <b style={{ background: C.y, color: C.ink, borderRadius: "50%", width: 50, height: 50, display: "grid", placeItems: "center", fontFamily: F.head }}>1</b>
        هدف غامض
      </Chip>
      <Chip at={182} bg="rgba(11,14,20,.75)" style={{ position: "absolute", top: 1130, right: 30 }}>
        <b style={{ background: C.r, color: "#fff", borderRadius: "50%", width: 50, height: 50, display: "grid", placeItems: "center", fontFamily: F.head }}>2</b>
        أدوات ناقصة
      </Chip>
      <Chip at={196} bg="rgba(11,14,20,.75)" style={{ position: "absolute", top: 1300, left: 60 }}>
        <b style={{ background: C.b, color: "#fff", borderRadius: "50%", width: 50, height: 50, display: "grid", placeItems: "center", fontFamily: F.head }}>3</b>
        بلا معيار نجاح
      </Chip>

      {/* مؤثرات */}
      <Audio from={FIRE - 2} src={staticFile("sfx-synth/whoosh.wav")} volume={0.9} />
      <Audio from={HIT} src={staticFile("sfx-synth/thud.wav")} volume={0.8} />
      {[168, 182, 196].map((t) => (
        <Audio key={t} from={t} src={staticFile("sfx-synth/pop.wav")} volume={0.45} />
      ))}
      {[8, 36].map((t) => (
        <Audio key={t} from={t} src={staticFile("sfx-synth/tick.wav")} volume={0.4} />
      ))}
    </AbsoluteFill>
  );
};
