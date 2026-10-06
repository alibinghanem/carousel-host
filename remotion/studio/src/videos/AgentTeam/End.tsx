import { Img, staticFile } from "remotion";
import { Cam } from "../../lib/camera3d";
import { useMusic } from "../../lib/music";
import { Obj } from "../ClaudeTrio/art";
import { BODY, Handles, KUFI, SIG, ramp } from "../ClaudeTrio/parts";
import { P } from "./parts";
import { PITCH, S, Z } from "./tl";

/** الختام: القاعدة الذهبية + علي + الحسابان + سؤال */
export const End: React.FC<{ cam: Cam; f: number }> = ({ cam, f }) => {
  const lf = f - S.end;
  const { kick } = useMusic();
  return (
    <>
      <Obj cam={cam} z={Z.end - 120} y={-380} rx={PITCH} far={9000} opacity={ramp(lf, 4, 16)}>
        <div style={{ direction: "rtl", textAlign: "center", width: 1000, font: `900 70px/1.35 ${KUFI}`, color: P.ink }}>
          ابدأ <span style={{ color: P.single }}>بالأبسط</span>
          <br />
          وزِد التعقيد <span style={{ color: P.team }}>لما تحتاج</span>
        </div>
      </Obj>
      <Obj cam={cam} z={Z.end - 200} y={-60} rx={PITCH} far={9000} opacity={ramp(lf, 30, 18)}>
        <div style={{ width: 400, height: 400, borderRadius: "50%", overflow: "hidden", border: `6px solid ${P.gold}`, boxShadow: `0 0 0 14px ${P.gold}33, 0 24px 60px rgba(40,30,10,.35)`, background: `radial-gradient(circle at 50% 35%, #fff, ${P.paper})`, scale: `${1 + kick * 0.015}` }}>
          <Img src={staticFile("avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%", display: "block" }} />
        </div>
      </Obj>
      <Obj cam={cam} z={Z.end + 220} y={300} rx={PITCH} far={9000} opacity={ramp(lf, 44, 16)}>
        <div style={{ direction: "rtl", textAlign: "center", width: 1060 }}>
          <div style={{ font: `700 132px/1.9 ${SIG}`, color: P.ink, fontFeatureSettings: "'calt' 0", margin: "-30px 0 -40px" }}>علي التميمي</div>
          <div style={{ marginTop: 28, font: `900 54px/1.4 ${KUFI}`, color: P.ink, opacity: ramp(lf, 70, 14) }}>
            وش مهمتك اللي <span style={{ color: P.team }}>توزّعها</span> على فريق؟
          </div>
          <div style={{ marginTop: 26, opacity: ramp(lf, 94, 14) }}>
            <Handles size={40} color={P.ink} />
          </div>
          <div style={{ marginTop: 22, font: `700 38px/1.45 ${BODY}`, color: P.mute, opacity: ramp(lf, 110, 14) }}>اكتبها بالتعليقات وأقولك: وكيل واحد ولا فريق</div>
        </div>
      </Obj>
    </>
  );
};
