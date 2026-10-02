import { Img, staticFile } from "remotion";
import { Cam } from "../../lib/camera3d";
import { Obj } from "../../lib/world3d";
import { useMusic } from "../../lib/music";
import { ARR, Z } from "./tl";
import { BODY, Handles, KUFI, SIG, T, ramp } from "./parts";

/** الختام: علي + الحسابان + سؤال يفتح التعليقات */
export const End: React.FC<{ cam: Cam; f: number }> = ({ cam, f }) => {
  const lf = f - ARR.end;
  const { kick } = useMusic();
  return (
    <>
      <Obj cam={cam} z={Z.end - 500} y={-300} far={9000}>
        <div style={{ width: 2200, height: 2200, borderRadius: "50%", background: `radial-gradient(circle, ${T.chat}33 0%, ${T.code}22 32%, transparent 62%)`, scale: `${1 + kick * 0.05}` }} />
      </Obj>
      <Obj cam={cam} z={Z.end} y={-500} far={9000} opacity={ramp(lf, 4, 18)}>
        <div
          style={{
            width: 460,
            height: 460,
            borderRadius: "50%",
            overflow: "hidden",
            border: `4px solid ${T.gold}`,
            boxShadow: `0 0 0 14px ${T.gold}22, 0 0 120px ${T.chat}66`,
            background: `radial-gradient(circle at 50% 35%, #1B2547, ${T.bg})`,
          }}
        >
          <Img src={staticFile("videos/ali-ad/ali.png")} style={{ width: "112%", marginLeft: "-6%", marginTop: "-2%", display: "block" }} />
        </div>
      </Obj>
      <Obj cam={cam} z={Z.end} y={150} far={9000}>
        <div style={{ direction: "rtl", textAlign: "center", width: 1100 }}>
          <div
            style={{
              fontFamily: SIG,
              fontWeight: 700,
              fontSize: 140,
              lineHeight: 1.25,
              opacity: ramp(lf, 14, 16),
              backgroundImage: `linear-gradient(100deg, #C9A55C 0%, ${T.gold} 30%, #FFF6DC 42%, ${T.gold} 54%, #C9A55C 100%)`,
              backgroundSize: "300% 100%",
              backgroundPosition: `${100 - ((lf * 1.6) % 160) / 160 * 100}% 0%`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              fontFeatureSettings: "'calt' 0",
              padding: "0.9em 0.25em 0.35em",
              margin: "-0.9em -0.25em -0.35em",
            }}
          >
            علي التميمي
          </div>
          <div style={{ marginTop: 40, font: `900 62px/1.35 ${KUFI}`, color: T.ink, opacity: ramp(lf, 34, 14), translate: `0px ${(1 - ramp(lf, 34, 14)) * 20}px` }}>
            وش أول مهمة <span style={{ color: T.cowork }}>بتوكّل</span><br /><span style={{ color: T.chat }}>Claude</span> فيها؟
          </div>
          <div style={{ marginTop: 36, opacity: ramp(lf, 60, 14) }}>
            <Handles size={42} />
          </div>
          <div style={{ marginTop: 32, font: `700 40px/1.45 ${BODY}`, color: T.mute, opacity: ramp(lf, 84, 14) }}>
            اكتب مهمتك بالتعليقات… وأقولك أي طريقة تناسبها
          </div>
        </div>
      </Obj>
    </>
  );
};
