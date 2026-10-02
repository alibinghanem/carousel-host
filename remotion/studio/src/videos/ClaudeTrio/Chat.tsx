import { Cam } from "../../lib/camera3d";
import { Obj } from "../../lib/world3d";
import { useMusic } from "../../lib/music";
import { ARR, Z } from "./tl";
import { BODY, ClaudeMark, Foot, Header, IcoChat, KUFI, Panel, T, clamp, ramp, typed } from "./parts";

const ACC = T.chat;

const UserBubble: React.FC<{ text: string; vis: number }> = ({ text, vis }) => (
  <div style={{ display: "flex", justifyContent: "flex-start", opacity: vis > 0 ? 1 : 0, translate: `0px ${(1 - clamp(vis)) * 16}px` }}>
    <div
      style={{
        maxWidth: 780,
        background: "rgba(255,255,255,.10)",
        border: "2px solid rgba(255,255,255,.16)",
        borderRadius: "30px 30px 30px 8px",
        padding: "18px 30px 24px",
        font: `700 44px/1.5 ${BODY}`,
        color: T.ink,
      }}
    >
      {text}
    </div>
  </div>
);

const ClaudeBubble: React.FC<{ text: string; vis: number; reveal: number; think: boolean; f: number }> = ({ text, vis, reveal, think, f }) => {
  const words = text.split(" ");
  const n = Math.round(clamp(reveal) * words.length);
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", opacity: vis > 0 ? 1 : 0, translate: `0px ${(1 - clamp(vis)) * 16}px` }}>
      <div style={{ flex: "none", width: 76, height: 76, borderRadius: 24, background: `${ACC}22`, border: `2px solid ${ACC}`, display: "grid", placeItems: "center" }}>
        <ClaudeMark size={46} />
      </div>
      <div
        style={{
          flex: 1,
          background: `linear-gradient(160deg, ${ACC}26, ${ACC}0F)`,
          border: `2px solid ${ACC}66`,
          borderRadius: "30px 8px 30px 30px",
          padding: "18px 30px 24px",
          font: `700 44px/1.5 ${BODY}`,
          color: T.ink,
          minHeight: 92,
        }}
      >
        {think ? (
          <div style={{ display: "flex", gap: 12, alignItems: "center", height: 56 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", background: ACC, translate: `0px ${Math.sin(f / 4 - i * 1.1) * -8}px`, opacity: 0.6 + 0.4 * Math.sin(f / 4 - i * 1.1) }} />
            ))}
          </div>
        ) : (
          words.slice(0, n).join(" ")
        )}
      </div>
    </div>
  );
};

/** المحطة ١: المحادثة — «تفكّر معاه». حوار على دورين يوضح فكرة الأخذ والرد */
export const Chat: React.FC<{ cam: Cam; f: number }> = ({ cam, f }) => {
  const lf = f - ARR.chat;
  const { kick } = useMusic();
  const u1 = "اكتب لي رد مهذب لعميل تأخر طلبه";
  const c1 = "أهلاً أستاذ فهد، نعتذر عن تأخر طلبك. يوصلك خلال يومين إن شاء الله.";
  const u2 = "خلّه أقصر وأدفأ";
  const c2 = "أستاذ فهد، آسفين على التأخير. طلبك في الطريق إليك.";
  const u1t = typed(u1, lf, 18, 34);
  const u2t = typed(u2, lf, 128, 20);
  return (
    <>
      <Obj cam={cam} z={Z.chat} y={-600} near={1000} far={2600} farSoft={700}>
        <Header n="1" title="المحادثة" sub="تفكّر معاه… جواب بعد جواب" accent={ACC} lf={lf} icon={<IcoChat s={58} c="#0A0F1D" />} />
      </Obj>
      <Obj cam={cam} z={Z.chat} y={-50} near={1000} far={2600} farSoft={700}>
        <Panel accent={ACC} lf={lf}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 84, display: "flex", alignItems: "center", gap: 16, padding: "0 36px", borderBottom: "2px solid rgba(255,255,255,.08)" }}>
            <ClaudeMark size={44} />
            <div style={{ font: `900 36px ${KUFI}`, color: T.ink }}>محادثة جديدة</div>
            <div style={{ marginRight: "auto", width: 14, height: 14, borderRadius: "50%", background: T.ok, boxShadow: `0 0 ${12 + kick * 16}px ${T.ok}` }} />
          </div>
          <div style={{ position: "absolute", top: 108, left: 36, right: 36, display: "flex", flexDirection: "column", gap: 24 }}>
            <UserBubble text={u1t} vis={lf - 18} />
            <ClaudeBubble text={c1} vis={lf - 58} think={lf >= 58 && lf < 76} reveal={(lf - 76) / 34} f={f} />
            <UserBubble text={u2t} vis={lf - 128} />
            <ClaudeBubble text={c2} vis={lf - 154} think={lf >= 154 && lf < 168} reveal={(lf - 168) / 26} f={f} />
          </div>
          <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center", font: `700 26px ${BODY}`, color: T.mute, opacity: 0.6 }}>رسم توضيحي</div>
        </Panel>
      </Obj>
      <Obj cam={cam} z={Z.chat} y={420} near={1000} far={2600} farSoft={700}>
        <Foot lf={lf} at={176} accent={ACC}>
          سؤال، فكرة، كتابة، تحليل… كلّمه عادي
        </Foot>
      </Obj>
      {/* أشكال تطفو حول المحطة (عمق مختلف = بارالكس) */}
      <Float cam={cam} f={f} z={Z.chat + 420} x={-560} y={-300} color={ACC} kind="bulb" ph={0} at={20} />
      <Float cam={cam} f={f} z={Z.chat + 260} x={590} y={120} color={ACC} kind="q" ph={2} at={44} />
      <Float cam={cam} f={f} z={Z.chat + 520} x={-600} y={420} color={ACC} kind="spark" ph={4} at={64} />
      <Float cam={cam} f={f} z={Z.chat + 360} x={560} y={-420} color={ACC} kind="bubble" ph={1} at={30} />
    </>
  );
};

/** شكل عائم: لمبة فكرة / علامة سؤال / شرارة / فقاعة */
export const Float: React.FC<{ cam: Cam; f: number; z: number; x: number; y: number; color: string; kind: "bulb" | "q" | "spark" | "bubble" | "file" | "brace" | "gear"; ph: number; at: number }> = ({
  cam,
  f,
  z,
  x,
  y,
  color,
  kind,
  ph,
  at,
}) => {
  const p = ramp(f, at + 0, 14);
  const bob = Math.sin(f / 22 + ph) * 18;
  const rot = Math.sin(f / 30 + ph) * 8;
  const paths: Record<string, React.ReactNode> = {
    bulb: (
      <g fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z" />
      </g>
    ),
    q: <text x="12" y="19" textAnchor="middle" fontFamily={KUFI} fontWeight={900} fontSize="22" fill={color}>؟</text>,
    spark: <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" fill={color} />,
    bubble: (
      <g fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round">
        <path d="M4 5h16a1 1 0 011 1v9a1 1 0 01-1 1h-9l-5 4v-4H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
      </g>
    ),
    file: (
      <g fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round">
        <path d="M6 2h8l5 5v15H6zM14 2v5h5" />
      </g>
    ),
    brace: <text x="12" y="18" textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={800} fontSize="20" fill={color}>{"{ }"}</text>,
    gear: (
      <g fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
      </g>
    ),
  };
  return (
    <Obj cam={cam} z={z} x={x} y={y + bob} rz={rot} near={300} far={3000} opacity={p * 0.9}>
      <svg width="190" height="190" viewBox="0 0 24 24" style={{ filter: `drop-shadow(0 0 22px ${color}88)` }}>
        {paths[kind]}
      </svg>
    </Obj>
  );
};
