import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { lerp, shake } from "../../../lib/theme";
import { Words, Flash } from "../../../lib/ui";
import { Sfx } from "../../../lib/music";
import { B, D, H, M, PaperBg, Stamp, hazard } from "../parts";

/** الهوك (0–210): «وكيلك دفع الفاتورة لحاله…» ← على الـ drop (120): «…وطلعت مزوّرة» */
const PAID = 58;
const DROP = 120;

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inv = spring({ frame: f - 10, fps, config: { damping: 13, stiffness: 120 } });
  const bad = f >= DROP;
  const glitch = bad && f < DROP + 12 ? Math.sin(f * 9) * 18 : 0;
  const sx = shake(f, DROP, 20, 26);
  const row = (k: string, v: React.ReactNode, red = false) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "18px 0", borderBottom: `3px dashed ${H.ink}22` }}>
      <span style={{ fontFamily: B, fontWeight: 600, fontSize: 38, color: H.steel }}>{k}</span>
      <span style={{ fontFamily: B, fontWeight: 700, fontSize: 40, color: red ? H.r : H.ink }}>{v}</span>
    </div>
  );
  return (
    <AbsoluteFill style={{ translate: `${sx}px 0px` }}>
      <PaperBg yellow />
      {/* شريطا تحذير يتحركان */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 40, background: hazard(30, H.ink, H.y, -(f * 2) % 60) }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: hazard(30, H.ink, H.y, (f * 2) % 60) }} />

      <div style={{ position: "absolute", top: 340, left: 40, right: 40, textAlign: "center" }}>
        <Words text="وكيلك دفع الفاتورة" at={2} stagger={4} style={{ fontFamily: D, fontWeight: 800, fontSize: 90, color: H.ink, lineHeight: 1.18 }} />
        <Words text="لحاله…" at={20} style={{ fontFamily: D, fontWeight: 800, fontSize: 90, color: H.ink, lineHeight: 1.18 }} />
      </div>

      {/* الفاتورة */}
      <div
        style={{
          position: "absolute",
          top: 640,
          left: 160,
          width: 760,
          direction: "rtl",
          background: "#fff",
          borderRadius: 18,
          padding: "34px 44px 30px",
          boxShadow: "0 40px 70px rgba(19,32,58,.3)",
          rotate: `${-3 + (1 - inv) * -14}deg`,
          translate: `${glitch}px ${(1 - inv) * 900}px`,
          filter: bad && f < DROP + 10 ? `drop-shadow(10px 0 0 ${H.r}) drop-shadow(-10px 0 0 #2E86DE)` : "none",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span style={{ fontFamily: D, fontWeight: 800, fontSize: 64, color: H.ink }}>فاتورة</span>
          <span style={{ fontFamily: M, fontWeight: 800, fontSize: 36, color: H.steel, direction: "ltr" }}>INV-4471</span>
        </div>
        {row("المورّد", "شركة النور للتوريد", bad)}
        {row("المبلغ", <span style={{ fontFamily: M, direction: "ltr", display: "inline-block" }}>18,400 SAR</span>)}
        {row("الحساب", <span style={{ fontFamily: M, direction: "ltr", display: "inline-block", color: bad ? H.r : H.ink }}>SA•• •••• 9917</span>)}
        <div style={{ height: 120 }} />
      </div>
      <Stamp at={PAID} text="تم الدفع" color={H.g} x={560} y={1010} rot={-8} size={84} />
      {bad ? <Stamp at={DROP} text="مزوّرة!" color={H.r} x={540} y={900} rot={10} size={120} /> : null}

      {/* الكشف */}
      <div style={{ position: "absolute", top: 1170, left: 60, right: 60, textAlign: "center" }}>
        {bad ? (
          <div
            style={{
              fontFamily: D,
              fontWeight: 800,
              fontSize: 112,
              color: H.r,
              lineHeight: 1.15,
              direction: "rtl",
              scale: `${1 + Math.max(0, 0.25 - (f - DROP) * 0.03)}`,
              textShadow: f < DROP + 8 ? `6px 0 ${H.ink}` : "none",
            }}
          >
            …وطلعت مزوّرة
          </div>
        ) : null}
        <div
          style={{
            marginTop: 14,
            fontFamily: B,
            fontWeight: 700,
            fontSize: 50,
            color: H.ink,
            direction: "rtl",
            opacity: lerp(f, [150, 160], [0, 1]),
            translate: `0px ${lerp(f, [150, 160], [20, 0])}px`,
          }}
        >
          مين كان لازم يوقفه؟
        </div>
      </div>
      <Flash at={DROP} color={H.r} max={0.45} dur={8} />

      <Sfx name="whoosh_fast" at={8} volume={0.5} />
      <Sfx name="pop" at={20} volume={0.35} />
      <Sfx name="impact" at={PAID} volume={0.2} />
      <Sfx name="success" at={PAID + 2} volume={0.3} />
      <Sfx name="impact" at={DROP} volume={0.42} />
      <Sfx name="glitch" at={DROP} volume={0.42} />
      <Sfx name="error" at={DROP + 4} volume={0.35} />
      <Sfx name="click" at={150} volume={0.3} />
    </AbsoluteFill>
  );
};
