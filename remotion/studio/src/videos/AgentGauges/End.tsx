import { Img, staticFile } from "remotion";
import { Cam } from "../../lib/camera3d";
import { useMusic } from "../../lib/music";
import { Obj } from "../ClaudeTrio/art";
import { Handles, SIG } from "../ClaudeTrio/parts";
import { BODY, HEAD, P, ramp } from "./parts";
import { S, X } from "./tl";

/** الختام: علي داخل عدّاد + اسمه + سؤال + الحسابان */
export const End: React.FC<{ cam: Cam; f: number }> = ({ cam, f }) => {
  const lf = f - S.end;
  const { kick } = useMusic();
  const x = X.end;
  return (
    <>
      <Obj cam={cam} x={x} y={-300} z={30} opacity={ramp(lf, 8, 18)}>
        <div style={{ position: "relative", width: 430, height: 430, scale: `${1 + kick * 0.012}` }}>
          <div style={{ position: "absolute", inset: -26, borderRadius: "50%", border: `8px solid ${P.line}`, background: "#0A110E" }} />
          <div style={{ position: "absolute", inset: -26, borderRadius: "50%", background: `conic-gradient(from -135deg, ${P.red} 0deg, ${P.amber} 110deg, ${P.em} 200deg, transparent 270deg, transparent 360deg)`, mask: "radial-gradient(circle, transparent 59%, #000 60%, #000 66%, transparent 67%)", WebkitMask: "radial-gradient(circle, transparent 59%, #000 60%, #000 66%, transparent 67%)" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", border: `5px solid ${P.amber}`, background: P.panel2 }}>
            <Img src={staticFile("avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%", display: "block" }} />
          </div>
        </div>
      </Obj>
      <Obj cam={cam} x={x} y={50} z={30} opacity={ramp(lf, 26, 16)}>
        <div style={{ font: `700 132px/1.9 ${SIG}`, color: P.ink, fontFeatureSettings: "'calt' 0", margin: "-30px 0 -40px", direction: "rtl", whiteSpace: "nowrap" }}>علي التميمي</div>
      </Obj>
      <Obj cam={cam} x={x} y={235} z={30} opacity={ramp(lf, 50, 14)}>
        <div style={{ direction: "rtl", textAlign: "center", font: `900 58px/1.4 ${HEAD}`, color: P.ink, width: 980 }}>
          أي رقم من الأربعة <span style={{ color: P.amber }}>تقيسه الحين؟</span>
        </div>
      </Obj>
      <Obj cam={cam} x={x} y={335} z={30} opacity={ramp(lf, 76, 14)}>
        <Handles size={40} color={P.ink} />
      </Obj>
      <Obj cam={cam} x={x} y={405} z={30} opacity={ramp(lf, 96, 14)}>
        <div style={{ direction: "rtl", font: `700 36px/1.4 ${BODY}`, color: P.mute, whiteSpace: "nowrap" }}>اكتب الرقم بالتعليقات وأقولك كيف تحسّنه</div>
      </Obj>
    </>
  );
};
