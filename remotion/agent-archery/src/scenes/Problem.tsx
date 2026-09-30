import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { Background } from "../components/Background";
import { Chip, Glass, Typer, Words } from "../components/ui";
import { C, F, lerp, shake } from "../theme";

/** 8–12ث: المهمة تنكتب… والتقويم يتلخبط */
const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];
const EVENTS: { d: number; top: number; c: string; at: number }[] = [
  { d: 0, top: 70, c: C.r, at: 56 },
  { d: 0, top: 96, c: C.b, at: 65 },
  { d: 0, top: 122, c: C.r, at: 68 },
  { d: 0, top: 148, c: C.b, at: 71 },
  { d: 1, top: 80, c: C.r, at: 66 },
  { d: 1, top: 104, c: C.r, at: 70 },
  { d: 1, top: 128, c: C.b, at: 74 },
  { d: 3, top: 210, c: C.b, at: 72 },
  { d: 3, top: 236, c: C.r, at: 76 },
];

export const Problem: React.FC = () => {
  const f = useCurrentFrame();
  const sx = shake(f, 80, 14, 10);
  return (
    <AbsoluteFill>
      <Background tint={C.r} floor={false} />
      <Words text="طلبت شي…" at={4} style={{ position: "absolute", top: 320, right: 80, left: 80, fontFamily: F.head, fontWeight: 800, fontSize: 100, color: "#fff" }} />
      <Words text="ورجع لك شي ثاني" at={12} color={C.r} style={{ position: "absolute", top: 440, right: 80, left: 80, fontFamily: F.head, fontWeight: 800, fontSize: 100 }} />

      <Glass style={{ position: "absolute", top: 600, left: 80, right: 80, padding: "22px 30px", opacity: lerp(f, [18, 28], [0, 1]), translate: `0px ${lerp(f, [18, 30], [40, 0])}px` }}>
        <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 28, color: C.mute }}>المهمة اللي أعطيته</div>
        <Typer text="«رتّب لي اجتماعات الأسبوع»" at={26} dur={26} style={{ fontFamily: F.body, fontWeight: 700, fontSize: 44, marginTop: 6 }} />
      </Glass>

      <div
        style={{
          position: "absolute",
          top: 790,
          left: 80,
          right: 80,
          height: 400,
          display: "flex",
          flexDirection: "row-reverse",
          gap: 12,
          padding: 18,
          borderRadius: 28,
          background: "rgba(255,255,255,.06)",
          border: "2px solid rgba(255,255,255,.12)",
          translate: `${sx}px 0px`,
          opacity: lerp(f, [50, 60], [0, 1]),
        }}
      >
        {DAYS.map((d, i) => (
          <div key={d} style={{ flex: 1, position: "relative", borderRadius: 14, background: "rgba(255,255,255,.05)" }}>
            <div style={{ textAlign: "center", fontFamily: F.body, fontWeight: 700, fontSize: 24, color: C.mute, marginTop: 12 }}>{d}</div>
            {EVENTS.filter((e) => e.d === i).map((e, k) => (
              <div
                key={k}
                style={{
                  position: "absolute",
                  left: 8,
                  right: 8,
                  top: e.top,
                  height: 62,
                  borderRadius: 10,
                  background: e.c,
                  boxShadow: `0 0 24px ${e.c}aa`,
                  border: "2px solid rgba(255,255,255,.7)",
                  opacity: lerp(f, [e.at, e.at + 4], [0, 0.9]),
                  translate: `0px ${lerp(f, [e.at, e.at + 8], [-120, 0])}px`,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <Chip at={74} bg={C.r} style={{ position: "absolute", top: 860, right: 60, rotate: "-3deg" }}>✕ 9 اجتماعات فوق بعض</Chip>
      <Chip at={80} bg={C.r} style={{ position: "absolute", top: 1010, left: 70, rotate: "2deg" }}>✕ دعوة لعميل غلط</Chip>
      <Chip at={86} bg={C.r} style={{ position: "absolute", top: 1130, right: 160, rotate: "-2deg" }}>✕ ألغى اجتماع المدير</Chip>

      <Words
        text="المشكلة مو في النموذج… في تجهيز المهمة"
        at={88}
        stagger={1}
        style={{ position: "absolute", top: 1255, left: 60, right: 60, textAlign: "center", fontFamily: F.body, fontWeight: 700, fontSize: 42, color: C.y }}
      />

      {[26, 32, 38, 44, 50].map((t) => (
        <Audio key={t} from={t} src={staticFile("sfx/click.wav")} volume={0.35} />
      ))}
      {[74, 80, 86].map((t) => (
        <Audio key={t} from={t} src={staticFile("sfx/blip_lo.wav")} volume={0.5} />
      ))}
      <Audio from={108} src={staticFile("sfx/swell.wav")} volume={0.6} />
    </AbsoluteFill>
  );
};
