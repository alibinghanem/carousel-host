import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Background } from "../components/Background";
import { Chip, Glass, ReasonHead, Words } from "../components/ui";
import { C, F, lerp } from "../theme";

/** السبب ٢: رف أدوات… أداة مربوطة واثنتين ناقصة */
const ROWS = [
  { name: "التقويم", ok: true, at: 26 },
  { name: "الإيميل", ok: false, at: 40 },
  { name: "ملف العملاء", ok: false, at: 54 },
];

const RackArrow: React.FC<{ ok: boolean; draw: number; blink: number }> = ({ ok, draw, blink }) => (
  <svg width={250} height={40} viewBox="0 0 360 60" style={{ flex: "none", direction: "ltr" }}>
    <path
      d="M40 30 H300 M300 30 L270 12 M300 30 L270 48"
      stroke={ok ? "#fff" : C.r}
      strokeOpacity={ok ? 1 : 0.35 + 0.65 * blink}
      strokeWidth={8}
      strokeLinecap="round"
      fill="none"
      strokeDasharray={ok ? 400 : "14 10"}
      strokeDashoffset={ok ? 400 * (1 - draw) : 0}
    />
    <path d="M8 8 L60 30 L8 52 L28 30 Z" fill={ok ? C.y : "none"} stroke={ok ? "none" : C.r} strokeWidth={4} strokeDasharray="8 6" opacity={ok ? draw : 0.35 + 0.65 * blink} />
  </svg>
);

export const Reason2: React.FC = () => {
  const f = useCurrentFrame();
  const blink = Math.floor(f / 5) % 2;
  return (
    <AbsoluteFill>
      <Background tint={C.r} />
      <ReasonHead n="2" title="أدوات ناقصة" color={C.r} textColor="#fff" />

      <Glass style={{ position: "absolute", top: 510, left: 80, right: 80, padding: "22px 30px 10px" }}>
        <div style={{ fontFamily: F.head, fontWeight: 800, fontSize: 38, marginBottom: 6, opacity: lerp(f, [14, 24], [0, 1]) }}>رف أدوات الوكيل</div>
        {ROWS.map((r, i) => (
          <div
            key={r.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "16px 0",
              borderTop: "2px dashed rgba(255,255,255,.14)",
              opacity: lerp(f, [r.at, r.at + 8], [0, 1]),
              translate: `${lerp(f, [r.at, r.at + 12], [-80, 0])}px 0px`,
            }}
          >
            <RackArrow ok={r.ok} draw={lerp(f, [74, 96], [0, 1])} blink={blink} />
            <div style={{ flex: 1, fontFamily: F.body, fontWeight: 700, fontSize: 40 }}>{r.name}</div>
            <Chip at={r.ok ? 96 : 110 + i * 14} bg={r.ok ? C.ok : "rgba(255,59,71,.18)"} color={r.ok ? C.ink : C.r} style={{ fontSize: 30, padding: "8px 18px" }}>
              {r.ok ? "مربوط ✓" : "ناقص ✕"}
            </Chip>
          </div>
        ))}
      </Glass>

      <Words text="طلبت منه يرسل إيميل… وهو ما عنده وصول؟" at={150} stagger={5} style={{ position: "absolute", top: 930, left: 70, right: 70, textAlign: "center", fontFamily: F.body, fontWeight: 700, fontSize: 42, color: "#fff" }} />

      <div style={{ position: "absolute", top: 1010, left: 60, right: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <Chip at={186} style={{ fontSize: 34 }}>يخترع حل من عنده</Chip>
        <Chip at={202} style={{ fontSize: 34 }}>أو يوقف في النص</Chip>
        <Chip at={218} bg={C.r} style={{ fontSize: 34, translate: `${f > 218 && f < 236 && f % 4 < 2 ? 6 : 0}px 0px` }}>
          أو يقول «تم» وهو ما سوى شي
        </Chip>
      </div>

      <div
        style={{
          position: "absolute",
          top: 1318,
          left: 80,
          right: 80,
          direction: "rtl",
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 34,
          textAlign: "center",
          color: C.ink,
          background: C.y,
          borderRadius: 18,
          padding: "14px 20px",
          opacity: lerp(f, [250, 262], [0, 1]),
          scale: `${lerp(f, [250, 264], [0.9, 1])}`,
        }}
      >
        قبل التشغيل: كل أداة مربوطة وفيها صلاحية؟
      </div>

      <Audio from={0} src={staticFile("sfx/whoosh.wav")} volume={0.5} />
      <Audio from={96} src={staticFile("sfx/ding.wav")} volume={0.4} />
      {[124, 138].map((t) => (
        <Audio key={t} from={t} src={staticFile("sfx/blip_lo.wav")} volume={0.5} />
      ))}
      {[186, 202, 218].map((t) => (
        <Audio key={t} from={t} src={staticFile("sfx/pop.wav")} volume={0.45} />
      ))}
      <Audio from={250} src={staticFile("sfx/tick.wav")} volume={0.5} />
    </AbsoluteFill>
  );
};
