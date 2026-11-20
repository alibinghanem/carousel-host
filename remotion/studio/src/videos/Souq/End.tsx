import { Img, staticFile } from "remotion";
import { Cam } from "../../lib/camera3d";
import { useMusic } from "../../lib/music";
import { Obj } from "../ClaudeTrio/art";
import { Handles, SIG } from "../ClaudeTrio/parts";
import { BODY, HEAD, P, ramp } from "./parts";
import { S, X } from "./tl";

/** الختام: علي أمام بسطته + سؤال يفتح التعليقات */
export const End: React.FC<{ cam: Cam; f: number }> = ({ cam, f }) => {
  const lf = f - S.end;
  const { kick } = useMusic();
  const x = X.end;
  return (
    <>
      <Obj cam={cam} x={x} y={-290} z={60} opacity={ramp(lf, 8, 18)}>
        <div style={{ width: 400, height: 400, borderRadius: "50%", overflow: "hidden", border: `8px solid ${P.gold}`, boxShadow: `0 0 0 14px ${P.terra}, 0 26px 40px rgba(60,30,10,.4)`, background: P.cream, scale: `${1 + kick * 0.012}` }}>
          <Img src={staticFile("avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%", display: "block" }} />
        </div>
      </Obj>
      <Obj cam={cam} x={x} y={10} z={60} opacity={ramp(lf, 26, 16)}>
        <div style={{ font: `700 132px/1.9 ${SIG}`, color: P.ink, fontFeatureSettings: "'calt' 0", margin: "-30px 0 -40px", direction: "rtl", whiteSpace: "nowrap" }}>علي التميمي</div>
      </Obj>
      <Obj cam={cam} x={x} y={180} z={60} opacity={ramp(lf, 50, 14)}>
        <div style={{ direction: "rtl", textAlign: "center", font: `700 62px/1.35 ${HEAD}`, color: P.ink, width: 980 }}>
          أي خدمة منهم <span style={{ color: P.terra }}>تبدأ فيها؟</span>
        </div>
      </Obj>
      <Obj cam={cam} x={x} y={300} z={60} opacity={ramp(lf, 76, 14)}>
        <Handles size={40} color={P.ink} />
      </Obj>
      <Obj cam={cam} x={x} y={380} z={60} opacity={ramp(lf, 96, 14)}>
        <div style={{ direction: "rtl", font: `700 38px/1.4 ${BODY}`, color: P.mute, whiteSpace: "nowrap" }}>اكتب رقمها بالتعليقات وأقولك كيف تبدأ</div>
      </Obj>
    </>
  );
};
