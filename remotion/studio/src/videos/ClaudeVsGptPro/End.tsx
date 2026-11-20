import { Img } from "remotion";
import { useMusic } from "../../lib/music";
import { BODY, CL, DISPLAY, GP, OUT, BACK, W, ease } from "./theme";
import { Reveal } from "./kit";
import { AVATAR, HandlesRow } from "./World";

/** الختام: الستارة تنفتح وعلي في المنتصف بين العالمين */
export const End: React.FC<{ f: number }> = ({ f }) => {
  const { kick } = useMusic();
  if (f < 0) return null;
  const av = ease(f, 14, 26, OUT);
  const ring = ease(f, 8, 30, OUT);
  const center = (y: number, node: React.ReactNode) => (
    <div style={{ position: "absolute", top: y, left: 0, width: W, display: "flex", justifyContent: "center", direction: "rtl" }}>{node}</div>
  );
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: W / 2 - 230,
          top: 470,
          width: 460,
          height: 460,
          borderRadius: "50%",
          padding: 10,
          background: `conic-gradient(from 0deg, ${CL.acc} 0deg ${180 * ring}deg, transparent ${180 * ring}deg 180deg, ${GP.acc} 180deg ${180 + 180 * ring}deg, transparent ${180 + 180 * ring}deg)`,
          boxShadow: `0 0 ${60 + kick * 40}px rgba(217,119,87,.25), 0 0 ${80 + kick * 40}px rgba(16,163,127,.2)`,
          transform: `scale(${0.92 + 0.08 * ease(f, 8, 20, BACK)})`,
        }}
      >
        <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#1E1C1A" }}>
          <div style={{ width: "100%", height: "100%", clipPath: `circle(${av * 52}% at 50% 50%)` }}>
            <Img src={AVATAR} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 15%", transform: `scale(${1.15 - 0.15 * av})` }} />
          </div>
        </div>
      </div>
      {center(
        970,
        <Reveal f={f} at={30} d={22}>
          <div style={{ font: `700 96px/1.3 ${DISPLAY}`, color: "#FFFFFF", whiteSpace: "nowrap" }}>علي التميمي</div>
        </Reveal>,
      )}
      {center(
        1110,
        <Reveal f={f} at={46} d={22}>
          <div
            style={{
              font: `700 56px/1.4 ${DISPLAY}`,
              whiteSpace: "nowrap",
              backgroundImage: `linear-gradient(90deg, ${GP.acc2}, #F2E6D9 50%, ${CL.acc})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            أي مقارنة تبغاها الجاية؟
          </div>
        </Reveal>,
      )}
      {center(
        1200,
        <Reveal f={f} at={58} d={18}>
          <div style={{ font: `600 38px ${BODY}`, color: "#B9B4A9", whiteSpace: "nowrap" }}>اكتبها بالتعليقات</div>
        </Reveal>,
      )}
      {center(
        1300,
        <div style={{ opacity: ease(f, 72, 16), transform: `translateY(${(1 - ease(f, 72, 16)) * 16}px)` }}>
          <HandlesRow size={38} color="#F4F1EA" />
        </div>,
      )}
    </>
  );
};
