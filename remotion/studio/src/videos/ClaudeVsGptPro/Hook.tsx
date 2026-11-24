import { useMusic } from "../../lib/music";
import { BODY, DISPLAY, EN, OUT, RED, W, ease } from "./theme";
import { Reveal, SplitLayer } from "./kit";
import { SEG } from "./tl";

/** الهوك (0–120): السؤال الشائع ← يُشطب ← السؤال الصح */
export const Hook: React.FC<{ f: number }> = ({ f }) => {
  const { kick } = useMusic();
  const end = SEG.hook[1];
  const out = end - 12;
  if (f > end + 2) return null;
  const strike = ease(f, 42, 14, OUT);
  const vs = ease(f, 0, 30, OUT) * (1 - ease(f, out, 12));
  return (
    <>
      <SplitLayer y={560} h={720} style={{ opacity: vs }}>
        <div style={{ width: W, textAlign: "center", font: `700 600px/1 ${EN}`, color: "transparent", WebkitTextStroke: "3px var(--line)", transform: `translateY(${(1 - vs) * 80}px) scale(${1 + f * 0.0012})`, letterSpacing: -30 }}>
          VS
        </div>
      </SplitLayer>
      <SplitLayer y={640} h={180}>
        <div style={{ width: W, display: "flex", justifyContent: "center", direction: "rtl" }}>
          <Reveal f={f} at={1} out={out}>
            <div style={{ font: `700 92px/1.3 ${DISPLAY}`, color: "var(--ink)", whiteSpace: "nowrap", position: "relative" }}>
              <span style={{ color: "var(--acc)" }}>Claude</span> ولا <span style={{ color: "var(--acc)" }}>ChatGPT</span>؟
              <div
                style={{
                  position: "absolute",
                  right: -16,
                  top: "56%",
                  height: 10,
                  borderRadius: 5,
                  width: `calc(${strike * 100}% + 32px)`,
                  background: RED,
                  boxShadow: `0 0 18px ${RED}88`,
                  opacity: strike > 0 ? 1 : 0,
                }}
              />
            </div>
          </Reveal>
        </div>
      </SplitLayer>
      <SplitLayer y={840} h={110}>
        <div style={{ width: W, display: "flex", justifyContent: "center" }}>
          <Reveal f={f} at={54} out={out}>
            <div style={{ font: `600 52px/1.4 ${BODY}`, color: "var(--sub)", whiteSpace: "nowrap" }}>السؤال الصح:</div>
          </Reveal>
        </div>
      </SplitLayer>
      <SplitLayer y={930} h={230}>
        <div style={{ width: W, display: "flex", justifyContent: "center" }}>
          <Reveal f={f} at={62} d={22} out={out}>
            <div style={{ font: `700 112px/1.3 ${DISPLAY}`, color: "var(--acc)", whiteSpace: "nowrap", transform: `scale(${1 + kick * 0.02})` }}>أفضل في وش؟</div>
          </Reveal>
        </div>
      </SplitLayer>
      <SplitLayer y={1200} h={80}>
        <div style={{ width: W, display: "flex", justifyContent: "center" }}>
          <Reveal f={f} at={86} out={out}>
            <div style={{ font: `600 34px ${BODY}`, color: "var(--sub)", whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: EN, fontWeight: 700 }}>4</span> جولات · بمصادر رسمية
            </div>
          </Reveal>
        </div>
      </SplitLayer>
    </>
  );
};
