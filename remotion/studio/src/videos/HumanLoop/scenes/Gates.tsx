import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { lerp } from "../../../lib/theme";
import { Sfx } from "../../../lib/music";
import { ApprovalCard, B, Bot, Cursor, D, GateHead, H, M, PaperBg, Photo, Stamp, V } from "../parts";

/**
 * البوابات الثلاث (كل وحدة 270 إطار، تبدأ على نبضة):
 * 0 ذراع الحاجز ينزل (يضرب 15) · 30 الأمثلة · 40 صورة حقيقية · 75 البطاقة
 * 100–170 تفاعل الواجهة · 180 الختم «معتمد» على نبضة · حتى 270
 */
const STAMP = 180;
const CARD_TOP = 930;

const Shell: React.FC<{
  n: string;
  title: string;
  titleSize?: number;
  sub: string;
  photo: string;
  photoPos?: string;
  caption: string;
  stamp: [number, number];
  children: React.ReactNode;
}> = ({ n, title, titleSize, sub, photo, photoPos, caption, stamp, children }) => (
  <AbsoluteFill>
    <PaperBg />
    <GateHead n={n} title={title} sub={sub} size={titleSize} />
    <div style={{ position: "absolute", top: 690, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <Photo src={V(photo)} at={40} w={640} h={300} rot={-2.5} pos={photoPos} caption={caption} />
    </div>
    <div style={{ position: "absolute", top: CARD_TOP, left: 0, right: 0, display: "flex", justifyContent: "center" }}>{children}</div>
    <Stamp at={STAMP} text="معتمد" x={stamp[0]} y={stamp[1]} rot={-13} size={74} />
    <Sfx name="whoosh_soft" at={0} volume={0.4} />
    <Sfx name="impact" at={15} volume={0.29} />
    <Sfx name="whoosh_fast" at={40} volume={0.3} />
    <Sfx name="pop" at={75} volume={0.35} />
    <Sfx name="impact" at={STAMP} volume={0.46} />
    <Sfx name="success" at={STAMP + 4} volume={0.35} />
  </AbsoluteFill>
);

const Amount: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: H.r, fontFamily: M, fontWeight: 800, direction: "ltr", display: "inline-block" }}>{children}</span>
);

export const GateMoney: React.FC = () => (
  <Shell
    n="1"
    title="المال"
    sub="دفع · تحويل · استرجاع مبلغ"
    photo="money.jpg"
    photoPos="50% 40%"
    caption="أي ريال يطلع… يمر عليك"
    stamp={[300, CARD_TOP + 70]}
  >
    <ApprovalCard at={75} title="طلب موافقة" okLabel="اعتماد" noLabel="رفض" doneLabel="اعتمدت" clickAt={150}>
      أعتمد استرجاع <Amount>240 SAR</Amount> للطلب <Amount>1182</Amount>؟
    </ApprovalCard>
    <Cursor from={[980, 1560]} to={[650, CARD_TOP + 300]} at={108} click={150} />
    <Sfx name="click" at={150} volume={0.6} />
  </Shell>
);

/** مسودة عقد + توقيع يُرسم */
const ContractCard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 75, fps, config: { damping: 13, stiffness: 170 } });
  const draw = lerp(f, [118, 160], [0, 1], (t) => t);
  const bar = (w: string, at: number) => (
    <div style={{ height: 18, width: w, borderRadius: 9, background: `${H.ink}1F`, marginBottom: 16, opacity: lerp(f, [at, at + 8], [0, 1]) }} />
  );
  return (
    <div
      style={{
        width: 860,
        direction: "rtl",
        background: "#fff",
        borderRadius: 26,
        padding: "30px 40px",
        border: `3px solid ${H.ink}`,
        boxShadow: "0 30px 60px rgba(19,32,58,.25)",
        scale: `${0.6 + 0.4 * s}`,
        opacity: Math.min(1, s * 2),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
        <span style={{ fontFamily: D, fontWeight: 800, fontSize: 50, color: H.ink }}>عقد توريد</span>
        <span
          style={{
            marginRight: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 18px",
            borderRadius: 999,
            background: `${H.y}55`,
            fontFamily: B,
            fontWeight: 700,
            fontSize: 30,
            color: H.ink,
          }}
        >
          <Bot size={36} eye={H.y} /> الوكيل جهّز المسودة
        </span>
      </div>
      {bar("100%", 82)}
      {bar("88%", 86)}
      {bar("94%", 90)}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginTop: 18 }}>
        <span style={{ fontFamily: B, fontWeight: 700, fontSize: 38, color: H.ink, whiteSpace: "nowrap" }}>التوقيع: أنت</span>
        <div style={{ flex: 1, position: "relative", height: 100, borderBottom: `3px dashed ${H.ink}55` }}>
          <svg viewBox="0 0 400 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <path
              d="M20 70 C 60 10, 80 90, 110 50 S 160 20, 170 60 S 220 80, 240 40 C 255 15, 270 70, 300 55 S 360 40, 385 48"
              fill="none"
              stroke="#1D4ED8"
              strokeWidth="6"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const GateContract: React.FC = () => (
  <Shell
    n="2"
    title="العقود"
    sub="توقيع · موافقة على شروط · عرض سعر ملزم"
    photo="contract.jpg"
    photoPos="50% 55%"
    caption="الوكيل يكتب… والتوقيع عليك"
    stamp={[330, CARD_TOP + 150]}
  >
    <ContractCard />
    <Sfx name="typing" at={118} volume={0.25} />
  </Shell>
);

/** مسودة رد على عميل تنكتب ثم تُرسل بعد المراجعة */
const EmailCard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 75, fps, config: { damping: 13, stiffness: 170 } });
  const text = "نعتذر عن التأخير، وطلبك يوصلك بكرة.";
  const n = Math.round(lerp(f, [95, 140], [0, text.length], (t) => t));
  const sent = f >= 196;
  const press = f >= 194 && f < 200;
  return (
    <div
      style={{
        width: 860,
        direction: "rtl",
        background: "#fff",
        borderRadius: 26,
        padding: "28px 38px 32px",
        border: `3px solid ${H.ink}`,
        boxShadow: "0 30px 60px rgba(19,32,58,.25)",
        scale: `${0.6 + 0.4 * s}`,
        opacity: Math.min(1, s * 2),
      }}
    >
      <div style={{ display: "flex", gap: 14, alignItems: "center", fontFamily: B, fontWeight: 700, fontSize: 34, color: H.steel, marginBottom: 8 }}>
        <span>إلى:</span>
        <span style={{ color: H.ink }}>سارة · عميلة</span>
        <span style={{ marginRight: "auto", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 28 }}>
          <Bot size={34} eye={H.y} /> مسودة الوكيل
        </span>
      </div>
      <div style={{ fontFamily: B, fontWeight: 700, fontSize: 34, color: H.steel, marginBottom: 14 }}>
        الموضوع: <span style={{ color: H.ink }}>تأخير طلبك</span>
      </div>
      <div style={{ minHeight: 132, fontFamily: B, fontWeight: 700, fontSize: 44, lineHeight: 1.5, color: H.ink, borderTop: `3px dashed ${H.ink}22`, paddingTop: 14 }}>
        {text.slice(0, n)}
        <span style={{ display: "inline-block", width: 5, height: "1em", background: H.r, marginRight: 4, verticalAlign: "-0.12em", opacity: Math.floor(f / 8) % 2 === 0 ? 1 : 0 }} />
      </div>
      <div style={{ display: "flex", gap: 18, marginTop: 18 }}>
        <div
          style={{
            flex: 1.3,
            textAlign: "center",
            padding: "18px 0",
            borderRadius: 22,
            background: sent ? H.g : H.ink,
            color: "#fff",
            fontFamily: B,
            fontWeight: 700,
            fontSize: 38,
            scale: press ? "0.94" : "1",
          }}
        >
          {sent ? "✓ انرسل بعد مراجعتك" : "إرسال"}
        </div>
        <div style={{ flex: 1, textAlign: "center", padding: "18px 0", borderRadius: 22, border: `3px solid ${H.ink}33`, color: H.steel, fontFamily: B, fontWeight: 700, fontSize: 38 }}>
          تعديل
        </div>
      </div>
    </div>
  );
};

export const GateExternal: React.FC = () => (
  <Shell
    n="3"
    title="التواصل الخارجي"
    titleSize={88}
    sub="أي رسالة لعميل · مورّد · جهة رسمية"
    photo="email.jpg"
    photoPos="50% 45%"
    caption="اللي يطلع برا الشركة… تراجعه أنت"
    stamp={[320, CARD_TOP + 112]}
  >
    <EmailCard />
    <Sfx name="typing" at={95} volume={0.3} />
    <Cursor from={[980, 1560]} to={[640, CARD_TOP + 330]} at={150} click={196} />
    <Sfx name="click" at={196} volume={0.6} />
    <Sfx name="whoosh_fast" at={200} volume={0.3} />
  </Shell>
);
