import { Cam, smooth } from "../../lib/camera3d";
import { Obj } from "../../lib/world3d";
import { useMusic } from "../../lib/music";
import { HIT, Z } from "./tl";
import { BODY, ClaudeMark, IcoChat, IcoFolder, IcoTerm, KUFI, T, ramp } from "./parts";

/** الهوك (0–120): سؤال يعرفه المشاهد ← وعد ← الثلاث طرق تظهر (الاسم لاحقاً) */
export const Hook: React.FC<{ cam: Cam; f: number }> = ({ cam, f }) => {
  const { kick } = useMusic();
  const out = 1 - smooth((f - (HIT - 4)) / 10);
  const line = (t: string, at: number, st: React.CSSProperties) => {
    const p = ramp(f, at, 12);
    return (
      <div style={{ opacity: p, translate: `0px ${(1 - p) * 34}px`, filter: `blur(${(1 - p) * 10}px)`, whiteSpace: "nowrap", ...st }}>{t}</div>
    );
  };
  const med = (i: number, color: string, Ico: React.FC<{ s?: number; c?: string }>) => {
    const p = ramp(f, 58 + i * 9, 10);
    return (
      <div
        key={i}
        style={{
          width: 190,
          height: 190,
          borderRadius: 52,
          display: "grid",
          placeItems: "center",
          background: `linear-gradient(160deg, ${color}33, ${color}0D)`,
          border: `3px solid ${color}`,
          color,
          boxShadow: `0 0 ${50 + kick * 40}px ${color}55`,
          scale: `${0.4 + 0.6 * p + kick * 0.04}`,
          opacity: p,
        }}
      >
        <Ico s={104} c={color} />
      </div>
    );
  };
  return (
    <Obj cam={cam} z={Z.hook} y={-60} near={700} opacity={out}>
      <div style={{ direction: "rtl", textAlign: "center", width: 1100 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, opacity: ramp(f, 0, 10), scale: `${1 + kick * 0.05}` }}>
          <ClaudeMark size={150} glow={T.chat} />
        </div>
        {line("تستخدم Claude", 4, { font: `900 128px/1.2 ${KUFI}`, color: T.ink })}
        {line("للأسئلة بس؟", 14, { font: `900 128px/1.2 ${KUFI}`, color: T.chat })}
        <div style={{ height: 36 }} />
        {line("عنده طريقتين ثانيتين يشتغلون بدالك", 44, { font: `700 56px/1.4 ${BODY}`, color: T.mute })}
        <div style={{ display: "flex", justifyContent: "center", gap: 36, marginTop: 44 }}>
          {med(0, T.chat, IcoChat)}
          {med(1, T.cowork, IcoFolder)}
          {med(2, T.code, IcoTerm)}
        </div>
      </div>
    </Obj>
  );
};
