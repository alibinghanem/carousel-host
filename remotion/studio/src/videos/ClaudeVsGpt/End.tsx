import { Img, staticFile } from "remotion";
import { Cam } from "../../lib/camera3d";
import { Obj } from "../ClaudeTrio/art";
import { useMusic } from "../../lib/music";
import { S, Z } from "./tl";
import { BODY, Handles, KUFI, P, SIG, ramp } from "./parts";

/** الختام: علي + الحسابان + سؤال يفتح التعليقات */
export const End: React.FC<{ cam: Cam; f: number }> = ({ cam, f }) => {
  const lf = f - S.end;
  const { kick } = useMusic();
  return (
    <>
      <Obj cam={cam} z={Z.end - 500} y={-300} far={9000}>
        <div style={{ width: 2200, height: 2200, borderRadius: "50%", background: `radial-gradient(circle, ${P.cl}33 0%, ${P.gp}22 32%, transparent 62%)`, scale: `${1 + kick * 0.05}` }} />
      </Obj>
      <Obj cam={cam} z={Z.end} y={-500} far={9000} opacity={ramp(lf, 4, 18)}>
        <div style={{ width: 460, height: 460, borderRadius: "50%", overflow: "hidden", border: `4px solid ${P.gold}`, boxShadow: `0 0 0 14px ${P.gold}22, 0 0 120px ${P.cl}66`, background: P.bg }}>
          <Img src={staticFile("avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%", display: "block" }} />
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
              backgroundImage: `linear-gradient(100deg, #C9A55C 0%, ${P.gold} 30%, #FFF6DC 42%, ${P.gold} 54%, #C9A55C 100%)`,
              backgroundSize: "300% 100%",
              backgroundPosition: `${100 - (((lf * 1.6) % 160) / 160) * 100}% 0%`,
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
          <div style={{ marginTop: 40, font: `900 60px/1.35 ${KUFI}`, color: P.ink, opacity: ramp(lf, 34, 14), translate: `0px ${(1 - ramp(lf, 34, 14)) * 20}px`, textShadow: `0 4px 30px ${P.bg}` }}>
            وش أكثر مهمة تسوّيها<br />
            <span style={{ color: P.cl }}>بالذكاء الاصطناعي؟</span>
          </div>
          <div style={{ marginTop: 36, opacity: ramp(lf, 60, 14) }}>
            <Handles size={42} />
          </div>
          <div style={{ marginTop: 32, font: `700 40px/1.45 ${BODY}`, color: P.mute, opacity: ramp(lf, 84, 14), textShadow: `0 4px 24px ${P.bg}` }}>
            اكتبها بالتعليقات… وأقولك وين تجرّبها
          </div>
        </div>
      </Obj>
    </>
  );
};
