import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { lerp } from "../../../lib/theme";
import { Words } from "../../../lib/ui";
import { Sfx, useMusic } from "../../../lib/music";
import { B, Bot, D, H, Person, PaperBg, Stamp, hazard } from "../parts";

/**
 * الفكرة (210–510 مطلق): سير إنتاج — الشغل العادي يمر ✓، وصندوق «دفع» ينزل عليه
 * الحاجز (120 = نبضة) وينتظر ختم الإنسان (180 = نبضة) ثم يكمل.
 */
const BELT_Y = 960;
const GATE_X = 420;
const SPEED = 14;
const SLAM = 120;
const STAMP = 180;
const LIFT = 194;

type Box = { label: string; enter: number; gate?: boolean };
const BOXES: Box[] = [
  { label: "فرز", enter: 12 },
  { label: "تلخيص", enter: 32 },
  { label: "تقرير", enter: 52 },
  { label: "دفع", enter: 74, gate: true },
];
const W = 200;
const START = 1100;

const boxX = (f: number, b: Box) => {
  if (!b.gate) return START - SPEED * (f - b.enter);
  const stopX = GATE_X + 34;
  const free = START - SPEED * (f - b.enter);
  if (f < SLAM) return Math.max(free, stopX);
  if (f < LIFT + 6) return stopX;
  return stopX - SPEED * 1.2 * (f - LIFT - 6);
};

export const Concept: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { kick } = useMusic();
  const moving = f < SLAM || f > LIFT + 6;
  const beltOff = (moving ? f : f < LIFT ? SLAM : f) * SPEED;
  const bar = f < SLAM - 8 ? 0 : f >= LIFT ? lerp(f, [LIFT, LIFT + 10], [1, 0]) : spring({ frame: f - SLAM + 8, fps, config: { damping: 10, stiffness: 220 } });
  const waiting = f >= SLAM + 18;
  const approved = f >= STAMP;
  const card = spring({ frame: f - SLAM - 18, fps, config: { damping: 13, stiffness: 170 } });
  return (
    <AbsoluteFill>
      <PaperBg />
      <div style={{ position: "absolute", top: 330, left: 60, right: 60, textAlign: "center" }}>
        <Words text="الحل: بوابة" at={6} style={{ fontFamily: D, fontWeight: 800, fontSize: 116, color: H.ink, lineHeight: 1.12 }} />
        <Words text="يوقف عندها الوكيل" at={18} style={{ fontFamily: D, fontWeight: 800, fontSize: 80, color: H.ink, lineHeight: 1.25 }} />
        <div
          style={{
            display: "inline-flex",
            gap: 14,
            alignItems: "center",
            marginTop: 26,
            padding: "12px 30px",
            borderRadius: 999,
            background: H.ink,
            color: "#fff",
            direction: "rtl",
            fontFamily: B,
            fontWeight: 700,
            fontSize: 36,
            opacity: lerp(f, [42, 52], [0, 1]),
            scale: `${lerp(f, [42, 52], [0.7, 1])}`,
          }}
        >
          <span style={{ fontFamily: "Space Grotesk", color: H.y }}>Human in the Loop</span>
          <span>= الإنسان في الحلقة</span>
        </div>
      </div>

      {/* البوابة: قوس + حاجز ينزل */}
      <div style={{ position: "absolute", left: GATE_X - 70, top: BELT_Y - 270, width: 140, height: 270 }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 26, height: 270, background: hazard(16), border: `3px solid ${H.ink}`, borderRadius: 6 }} />
        <div style={{ position: "absolute", right: 0, top: 0, width: 26, height: 270, background: hazard(16), border: `3px solid ${H.ink}`, borderRadius: 6 }} />
        <div style={{ position: "absolute", left: -10, right: -10, top: -16, height: 40, background: H.ink, borderRadius: 10 }} />
        <div
          style={{
            position: "absolute",
            left: 54,
            top: -54,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: f >= SLAM && f < LIFT && Math.floor(f / 8) % 2 === 0 ? H.r : approved && f >= LIFT ? H.g : "#6B3034",
            boxShadow: f >= SLAM && f < LIFT ? `0 0 30px ${H.r}` : approved && f >= LIFT ? `0 0 30px ${H.g}` : "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 36,
            width: 68,
            top: 24,
            height: 220 * bar,
            background: hazard(18, H.r, "#fff"),
            border: bar > 0.02 ? `4px solid ${H.ink}` : "none",
            borderRadius: 8,
          }}
        />
      </div>

      {/* الصناديق */}
      {BOXES.map((b, i) => {
        const x = boxX(f, b);
        if (f < b.enter || x < -W - 40) return null;
        const passed = x + W / 2 < GATE_X - 40;
        const pop = spring({ frame: f - (b.enter + Math.ceil((START + W / 2 - (GATE_X - 40)) / SPEED)), fps, config: { damping: 10, stiffness: 220 } });
        return (
          <div key={i} style={{ position: "absolute", left: x, top: BELT_Y - 160 - kick * 6, width: W, height: 160 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 12,
                background: b.gate ? "#E9B172" : H.kraft,
                border: `4px solid ${H.ink}`,
                boxShadow: "inset 0 -14px 0 rgba(0,0,0,.08)",
              }}
            />
            <div style={{ position: "absolute", left: W / 2 - 18, top: 0, width: 36, height: 160, background: "rgba(255,255,255,.35)" }} />
            <div
              style={{
                position: "absolute",
                left: 18,
                right: 18,
                top: 46,
                padding: "8px 0",
                background: "#fff",
                border: `3px solid ${H.ink}`,
                borderRadius: 10,
                textAlign: "center",
                fontFamily: B,
                fontWeight: 700,
                fontSize: b.gate ? 38 : 36,
                color: b.gate ? H.r : H.ink,
                direction: "rtl",
              }}
            >
              {b.label}
            </div>
            {(b.gate ? f >= LIFT + 8 : passed) ? (
              <div
                style={{
                  position: "absolute",
                  left: W / 2 - 34,
                  top: -84,
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  background: H.g,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 44,
                  fontWeight: 800,
                  scale: `${b.gate ? spring({ frame: f - LIFT - 8, fps, config: { damping: 10 } }) : pop}`,
                }}
              >
                ✓
              </div>
            ) : null}
          </div>
        );
      })}
      {f >= STAMP - 8 && f < LIFT + 40 ? <Stamp at={STAMP} text="معتمد" x={GATE_X + 34 + W / 2 - Math.max(0, f - LIFT - 6) * SPEED * 1.2} y={BELT_Y - 96} rot={-14} size={58} /> : null}

      {/* السير */}
      <div
        style={{
          position: "absolute",
          left: -20,
          right: -20,
          top: BELT_Y,
          height: 76,
          borderRadius: 38,
          background: H.belt,
          border: `5px solid ${H.ink}`,
          backgroundImage: `repeating-linear-gradient(90deg, transparent 0 46px, rgba(255,255,255,.18) 46px 54px)`,
          backgroundPosition: `${-beltOff}px 0px`,
        }}
      />
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: BELT_Y + 92,
            left: 30 + i * 128,
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: `6px solid ${H.ink}`,
            background: `conic-gradient(${H.steel} 0 25%, ${H.paper2} 0 50%, ${H.steel} 0 75%, ${H.paper2} 0)`,
            rotate: `${-beltOff * 1.2}deg`,
          }}
        />
      ))}

      {/* الوكيل: آلة على يمين السير */}
      <div
        style={{
          position: "absolute",
          right: -10,
          top: BELT_Y - 230,
          width: 190,
          height: 240,
          borderRadius: "28px 0 0 0",
          background: H.ink,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <Bot size={96} color={H.y} eye={H.ink} />
        <div style={{ fontFamily: B, fontWeight: 700, fontSize: 34, color: H.y }}>الوكيل</div>
      </div>

      {/* بطاقة الانتظار */}
      <div
        style={{
          position: "absolute",
          top: BELT_Y + 150,
          left: 140,
          right: 140,
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "22px 30px",
          borderRadius: 26,
          direction: "rtl",
          background: approved ? H.g : "#fff",
          border: `4px solid ${approved ? H.g : H.ink}`,
          boxShadow: "0 20px 40px rgba(19,32,58,.18)",
          opacity: waiting ? Math.min(1, card * 2) : 0,
          scale: `${0.7 + 0.3 * card}`,
        }}
      >
        <div style={{ width: 76, height: 76, borderRadius: "50%", background: approved ? "#fff" : H.y, display: "grid", placeItems: "center", flex: "none" }}>
          <Person size={52} color={H.ink} />
        </div>
        <div style={{ fontFamily: B, fontWeight: 700, fontSize: 44, color: approved ? "#fff" : H.ink }}>
          {approved ? "اعتمدتها أنت — يكمل" : `بانتظار موافقتك${".".repeat(1 + (Math.floor(f / 10) % 3))}`}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 1262,
          left: 60,
          right: 60,
          textAlign: "center",
          direction: "rtl",
          fontFamily: D,
          fontWeight: 800,
          fontSize: 52,
          color: H.ink,
          whiteSpace: "nowrap",
          opacity: lerp(f, [212, 224], [0, 1]),
          translate: `0px ${lerp(f, [212, 224], [30, 0])}px`,
        }}
      >
        <span style={{ color: H.r }}>3</span> بوابات بس… والباقي يمشي لحاله
      </div>

      <Sfx name="whoosh_soft" at={0} volume={0.4} />
      <Sfx name="pop" at={44} volume={0.3} />
      {[71, 91, 111].map((t) => (
        <Sfx key={t} name="click" at={t} volume={0.25} />
      ))}
      <Sfx name="impact" at={SLAM} volume={0.41} />
      <Sfx name="error" at={SLAM + 2} volume={0.25} />
      <Sfx name="pop" at={SLAM + 18} volume={0.35} />
      <Sfx name="impact" at={STAMP} volume={0.43} />
      <Sfx name="success" at={LIFT + 8} volume={0.4} />
      <Sfx name="whoosh_fast" at={212} volume={0.35} />
    </AbsoluteFill>
  );
};
