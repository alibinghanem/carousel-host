import type { ScreenDraw } from "../../lib/three3d/Phone";
import { OUT, SEG, SegK, ease } from "./theme";

/** شاشات عامة مرسومة (مو لقطات رسمية) — بشعارات Gmail و Docs الحقيقية */
type Ctx = CanvasRenderingContext2D;
type Img = HTMLImageElement | null;
const AR = "'IBM Plex Sans Arabic', 'Space Grotesk'";
const EN = "'Space Grotesk', 'IBM Plex Sans Arabic'";
const lp = (f: number, k: SegK) => f - SEG[k][0];
const cur = (f: number): SegK => (Object.keys(SEG) as SegK[]).find((k) => f >= SEG[k][0] && f < SEG[k][1]) ?? "end";

const txt = (g: Ctx, t: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "left", dir: CanvasDirection = "ltr") => {
  g.font = font;
  g.fillStyle = color;
  g.direction = dir;
  g.textAlign = align;
  g.fillText(t, x, y);
};
/** يلف النص الإنجليزي على أسطر ويرسم أول n حرف بس (للكتابة التدريجية) */
const wrap = (g: Ctx, t: string, x: number, y: number, maxW: number, lh: number, font: string, color: string, n = Infinity) => {
  g.font = font;
  g.fillStyle = color;
  g.direction = "ltr";
  g.textAlign = "left";
  let left = Math.max(0, n);
  let yy = y;
  for (const para of t.split("\n")) {
    let line = "";
    const words = para.split(" ");
    const lines: string[] = [];
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (g.measureText(test).width > maxW && line) {
        lines.push(line);
        line = w;
      } else line = test;
    }
    lines.push(line);
    for (const ln of lines) {
      if (left <= 0) return yy;
      g.fillText(ln.slice(0, left), x, yy);
      left -= ln.length + 1;
      yy += lh;
    }
  }
  return yy;
};
const pill = (g: Ctx, x: number, y: number, w: number, h: number, fill: string | CanvasGradient, stroke?: string) => {
  g.beginPath();
  g.roundRect(x, y, w, h, h / 2);
  g.fillStyle = fill;
  g.fill();
  if (stroke) {
    g.strokeStyle = stroke;
    g.lineWidth = 2;
    g.stroke();
  }
};
const box = (g: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient) => {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
  g.fillStyle = fill;
  g.fill();
};
/** شرارة رباعية بتدرّج */
export const spark = (g: Ctx, x: number, y: number, s: number) => {
  const gr = g.createLinearGradient(x - s, y + s, x + s, y - s);
  gr.addColorStop(0.1, "#4796E3");
  gr.addColorStop(0.55, "#9177C7");
  gr.addColorStop(0.95, "#D96570");
  const c = s * 0.1;
  g.beginPath();
  g.moveTo(x, y - s);
  g.quadraticCurveTo(x + c, y - c, x + s, y);
  g.quadraticCurveTo(x + c, y + c, x, y + s);
  g.quadraticCurveTo(x - c, y + c, x - s, y);
  g.quadraticCurveTo(x - c, y - c, x, y - s);
  g.fillStyle = gr;
  g.fill();
};
const ring = (g: Ctx, x: number, y: number, p: number, color = "rgba(26,115,232,.55)") => {
  if (p <= 0 || p >= 1) return;
  g.beginPath();
  g.arc(x, y, 20 + p * 60, 0, Math.PI * 2);
  g.fillStyle = color.replace(/[\d.]+\)$/, `${0.5 * (1 - p)})`);
  g.fill();
};
const status = (g: Ctx, w: number, c = "#202124") => {
  txt(g, "9:41", 44, 66, `700 22px ${EN}`, c);
  txt(g, "5G", w - 44, 66, `700 22px ${EN}`, c, "right");
};
const avatarDot = (g: Ctx, x: number, y: number, r: number, color: string, ch: string) => {
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fillStyle = color;
  g.fill();
  txt(g, ch, x, y + r * 0.36, `700 ${r}px ${EN}`, "#fff", "center");
};
const shimmer = (g: Ctx, x: number, y: number, w: number, h: number, t: number) => {
  const gr = g.createLinearGradient(x, 0, x + w, 0);
  const p = (t % 1) * 1.6 - 0.3;
  gr.addColorStop(Math.max(0, p - 0.3), "#E3E8F7");
  gr.addColorStop(Math.min(1, Math.max(0, p)), "#C9D6FB");
  gr.addColorStop(Math.min(1, p + 0.3), "#E3E8F7");
  box(g, x, y, w, h, h / 2, gr);
};

/* ───── 1) سلسلة إيميلات + «Summarize this email» ───── */
export const SUM_STEP = (l: number) => (l < 96 ? 0 : l < 150 ? 1 : 2);
const THREAD = [
  { n: "Ahmed K.", c: "#1A73E8", s: "Updated numbers attached, please check…", t: "9:12" },
  { n: "Sara M.", c: "#E37400", s: "Vendor list is still missing two quotes…", t: "9:40" },
  { n: "Khalid A.", c: "#188038", s: "Can we lock Thursday for the review?", t: "10:05" },
  { n: "Ahmed K.", c: "#1A73E8", s: "Final: budget approved, deck on Thu…", t: "10:31" },
];
const SUMMARY = ["Budget approved at $120K", "Ahmed shares the final deck on Thu", "You: send vendor quotes by Sunday"];
const threadScreen = (l: number): ScreenDraw => (g, w, h) => {
  g.fillStyle = "#fff";
  g.fillRect(0, 0, w, h);
  status(g, w);
  // شريط الأدوات
  txt(g, "←", 40, 150, `700 40px ${EN}`, "#444");
  [w - 200, w - 140, w - 80].forEach((x) => {
    g.strokeStyle = "#5F6368";
    g.lineWidth = 3;
    g.strokeRect(x, 124, 30, 26);
  });
  txt(g, "Q4 budget — final", 40, 238, `700 40px ${EN}`, "#202124");
  pill(g, 40, 258, 92, 36, "#E8EAED");
  txt(g, "Inbox", 86, 284, `700 20px ${EN}`, "#3C4043", "center");
  txt(g, "14 messages", 150, 284, `700 20px ${EN}`, "#80868B");
  const step = SUM_STEP(l);
  let y = 320;
  if (step === 0) {
    const pulse = l > 52 ? 0.5 + 0.5 * Math.sin(l / 4) : 0;
    pill(g, 40, y, 360, 66, pulse > 0 ? `rgba(211,227,253,${0.75 + 0.25 * pulse})` : "#E8F0FE", pulse > 0 ? "#1A73E8" : undefined);
    spark(g, 80, y + 33, 17);
    txt(g, "Summarize this email", 108, y + 42, `700 26px ${EN}`, "#0B57D0");
    ring(g, 220, y + 33, (l - 84) / 14);
    y += 100;
  } else {
    const open = ease(l, 96, 16, OUT);
    const ch = 90 + open * 300;
    const gr = g.createLinearGradient(0, y, w, y + ch);
    gr.addColorStop(0, "#EEF3FE");
    gr.addColorStop(1, "#F5EEFC");
    box(g, 30, y, w - 60, ch, 28, gr);
    spark(g, 72, y + 46, 18);
    txt(g, "Summary", 102, y + 56, `700 30px ${EN}`, "#202124");
    if (step === 1) {
      [0, 1, 2].forEach((i) => shimmer(g, 60, y + 100 + i * 70, w - 140 - i * 60, 30, l / 20 + i * 0.2));
    } else {
      SUMMARY.forEach((s, i) => {
        const p = ease(l, 150 + i * 16, 12, OUT);
        if (p <= 0) return;
        g.globalAlpha = p;
        g.beginPath();
        g.arc(66, y + 118 + i * 86, 7, 0, Math.PI * 2);
        g.fillStyle = "#9177C7";
        g.fill();
        wrap(g, s, 88, y + 128 + i * 86, w - 150, 34, `700 26px ${EN}`, "#202124");
        g.globalAlpha = 1;
      });
    }
    y += ch + 24;
  }
  // الرسائل
  THREAD.forEach((m, i) => {
    const yy = y + i * 118;
    if (yy > h - 60) return;
    avatarDot(g, 76, yy + 44, 30, m.c, m.n[0]);
    txt(g, m.n, 126, yy + 36, `700 26px ${EN}`, "#202124");
    txt(g, m.t, w - 40, yy + 36, `700 20px ${EN}`, "#80868B", "right");
    txt(g, m.s, 126, yy + 72, `700 21px ${EN}`, "#5F6368");
    if (i === 1) {
      g.beginPath();
      g.arc(76, yy + 132, 26, 0, Math.PI * 2);
      g.fillStyle = "#F1F3F4";
      g.fill();
      txt(g, "10", 76, yy + 140, `700 22px ${EN}`, "#5F6368", "center");
      g.fillStyle = "#E8EAED";
      g.fillRect(126, yy + 132, w - 170, 2);
    }
  });
};

/* ───── 2) الوارد + «اسأل Gemini» ───── */
export const ASK_STEP = (l: number) => (l < 96 ? 0 : l < 150 ? 1 : 2);
const Q = "What did Ahmed ask me to do this week?";
const A = ["Review the Q4 deck", "Book a room for Thu 10am", "Send vendor quotes by Sunday"];
const INBOX = [
  { n: "Ahmed K.", c: "#1A73E8", s: "Q4 budget — final", b: "Budget approved, deck on Thu…", t: "10:31" },
  { n: "Noura S.", c: "#A142F4", s: "Offsite agenda", b: "Sharing the draft schedule for…", t: "9:58" },
  { n: "Sara M.", c: "#E37400", s: "Vendor quotes", b: "Still waiting on two suppliers…", t: "9:40" },
  { n: "IT Desk", c: "#5F6368", s: "Password expiry", b: "Your password expires in 7 days…", t: "8:15" },
  { n: "Khalid A.", c: "#188038", s: "Thursday review", b: "Can we lock Thursday for the…", t: "Oct 30" },
  { n: "Ahmed K.", c: "#1A73E8", s: "Room booking", b: "Please book the big room for…", t: "Oct 29" },
];
const inboxScreen = (l: number, gmail: Img): ScreenDraw => (g, w, h) => {
  g.fillStyle = "#fff";
  g.fillRect(0, 0, w, h);
  status(g, w);
  pill(g, 24, 104, w - 48, 84, "#EEF2F9");
  if (gmail) g.drawImage(gmail, 50, 128, 48, 36);
  txt(g, "Search in mail", 118, 156, `700 24px ${EN}`, "#5F6368");
  // أيقونة Gemini فوق يمين
  const step = ASK_STEP(l);
  const pulse = step === 0 && l > 46 ? 0.5 + 0.5 * Math.sin(l / 4) : 0;
  if (pulse > 0) {
    g.beginPath();
    g.arc(w - 140, 146, 30, 0, Math.PI * 2);
    g.fillStyle = `rgba(145,119,199,${0.2 + 0.25 * pulse})`;
    g.fill();
  }
  spark(g, w - 140, 146, 20);
  ring(g, w - 140, 146, (l - 84) / 14, "rgba(145,119,199,.6)");
  avatarDot(g, w - 70, 146, 24, "#0F9D58", "A");
  txt(g, "Primary", 40, 244, `700 22px ${EN}`, "#5F6368");
  INBOX.forEach((m, i) => {
    const y = 270 + i * 128;
    avatarDot(g, 70, y + 50, 30, m.c, m.n[0]);
    txt(g, m.n, 120, y + 34, `700 25px ${EN}`, "#202124");
    txt(g, m.t, w - 36, y + 34, `700 19px ${EN}`, "#5F6368", "right");
    txt(g, m.s, 120, y + 68, `700 22px ${EN}`, "#202124");
    txt(g, m.b, 120, y + 100, `700 20px ${EN}`, "#80868B");
  });
  if (step === 0) return;
  // لوحة Gemini من تحت
  const up = ease(l, 96, 18, OUT);
  g.fillStyle = `rgba(0,0,0,${0.35 * up})`;
  g.fillRect(0, 0, w, h);
  const top = h - up * (h - 250);
  box(g, 0, top, w, h - top + 40, 40, "#fff");
  g.fillStyle = "#DADCE0";
  g.fillRect(w / 2 - 36, top + 16, 72, 8);
  spark(g, 56, top + 76, 20);
  txt(g, "Gemini", 88, top + 88, `700 32px ${EN}`, "#202124");
  // سؤال المستخدم
  const n = Math.round(ease(l, 112, 34) * Q.length);
  if (n > 0) {
    box(g, 120, top + 130, w - 150, 120, 28, "#E8F0FE");
    wrap(g, Q, 146, top + 178, w - 200, 36, `700 26px ${EN}`, "#0B57D0", n);
  }
  if (step < 2) return;
  if (l < 166) {
    [0, 1, 2].forEach((i) => {
      g.beginPath();
      g.arc(60 + i * 30, top + 300, 8, 0, Math.PI * 2);
      g.fillStyle = `rgba(145,119,199,${0.4 + 0.6 * Math.abs(Math.sin(l / 5 + i))})`;
      g.fill();
    });
    return;
  }
  spark(g, 50, top + 300, 14);
  txt(g, "Ahmed asked you to:", 76, top + 310, `700 26px ${EN}`, "#202124");
  A.forEach((a, i) => {
    const p = ease(l, 172 + i * 14, 10, OUT);
    if (p <= 0) return;
    g.globalAlpha = p;
    box(g, 40, top + 340 + i * 84, w - 80, 70, 18, "#F6F2FC");
    txt(g, `${i + 1}`, 72, top + 385 + i * 84, `700 26px ${EN}`, "#9177C7", "center");
    txt(g, a, 100, top + 385 + i * 84, `700 25px ${EN}`, "#202124");
    g.globalAlpha = 1;
  });
  const ps = ease(l, 216, 12, OUT);
  if (ps > 0) {
    g.globalAlpha = ps;
    txt(g, "Sources", 40, top + 620, `700 21px ${EN}`, "#5F6368");
    [0, 1, 2].forEach((i) => {
      pill(g, 40 + i * 150, top + 640, 136, 48, "#F1F3F4");
      if (gmail) g.drawImage(gmail, 56 + i * 150, top + 653, 28, 21);
      txt(g, ["Q4 budget", "Room", "Quotes"][i], 92 + i * 150, top + 673, `700 18px ${EN}`, "#3C4043");
    });
    g.globalAlpha = 1;
  }
};

/* ───── 3) رسالة جديدة + «Help me write» ───── */
export const WRITE_STEP = (l: number) => (l < 96 ? 0 : l < 150 ? 1 : 2);
const PROMPT = "Confirm Thursday 10am and ask for the agenda";
const DRAFT = "Hi Ahmed,\nThursday at 10am works for me. Could you share the agenda beforehand so I can prepare?\nThanks,\nAli";
const composeScreen = (l: number): ScreenDraw => (g, w, h) => {
  g.fillStyle = "#fff";
  g.fillRect(0, 0, w, h);
  status(g, w);
  txt(g, "✕", 40, 150, `700 32px ${EN}`, "#444");
  txt(g, "Compose", 90, 150, `700 30px ${EN}`, "#202124");
  // زر الإرسال
  const sendOn = ease(l, 218, 8, OUT);
  g.save();
  g.translate(w - 70, 138);
  g.beginPath();
  g.moveTo(-18, -16);
  g.lineTo(22, 0);
  g.lineTo(-18, 16);
  g.lineTo(-10, 0);
  g.closePath();
  g.fillStyle = sendOn > 0 ? "#1A73E8" : "#5F6368";
  g.fill();
  g.restore();
  ring(g, w - 70, 138, (l - 214) / 14);
  [
    ["From", "ali@gmail.com"],
    ["To", "Ahmed K."],
    ["Subject", "Re: Thursday review"],
  ].forEach(([a, b], i) => {
    const y = 230 + i * 76;
    txt(g, a, 40, y, `700 23px ${EN}`, "#80868B");
    txt(g, b, 160, y, `700 25px ${EN}`, "#202124");
    g.fillStyle = "#E8EAED";
    g.fillRect(30, y + 26, w - 60, 2);
  });
  const step = WRITE_STEP(l);
  const y0 = 470;
  if (step === 0) {
    const pulse = l > 46 ? 0.5 + 0.5 * Math.sin(l / 4) : 0;
    pill(g, 40, y0, 280, 64, pulse > 0 ? `rgba(211,227,253,${0.75 + 0.25 * pulse})` : "#E8F0FE", pulse > 0 ? "#1A73E8" : undefined);
    spark(g, 78, y0 + 32, 16);
    txt(g, "Help me write", 104, y0 + 41, `700 26px ${EN}`, "#0B57D0");
    ring(g, 180, y0 + 32, (l - 84) / 14);
    return;
  }
  if (step === 1) {
    const p = ease(l, 96, 14, OUT);
    g.globalAlpha = p;
    box(g, 24, y0 - 10, w - 48, 340, 28, "#F3F6FC");
    spark(g, 62, y0 + 34, 16);
    txt(g, "Help me write", 88, y0 + 44, `700 26px ${EN}`, "#202124");
    box(g, 44, y0 + 76, w - 88, 150, 18, "#fff");
    const n = Math.round(ease(l, 104, 34) * PROMPT.length);
    wrap(g, PROMPT, 64, y0 + 120, w - 140, 36, `700 26px ${EN}`, "#202124", n);
    const press = ease(l, 140, 6, OUT);
    pill(g, w - 200, y0 + 250, 150, 58, press > 0 ? "#0B57D0" : "#1A73E8");
    txt(g, "Create", w - 125, y0 + 288, `700 25px ${EN}`, "#fff", "center");
    g.globalAlpha = 1;
    return;
  }
  const n = Math.round(ease(l, 150, 48) * DRAFT.length);
  const yEnd = wrap(g, DRAFT, 40, y0 + 20, w - 80, 40, `700 27px ${EN}`, "#202124", n);
  const pc = ease(l, 196, 12, OUT);
  if (pc > 0) {
    g.globalAlpha = pc;
    const yc = Math.max(yEnd, y0 + 300) + 24;
    ["Formalize", "Elaborate", "Shorten"].forEach((c, i) => {
      const on = i === 0 && l > 204 && l < 222;
      const x = 40 + [0, 168, 330][i];
      pill(g, x, yc, [154, 150, 140][i], 54, on ? "#D3E3FD" : "#F1F3F4", on ? "#1A73E8" : undefined);
      txt(g, c, x + [154, 150, 140][i] / 2, yc + 36, `700 22px ${EN}`, on ? "#0B57D0" : "#3C4043", "center");
    });
    g.globalAlpha = 1;
  }
};

/* ───── الختام: صورة علي ───── */
const avatarScreen = (img: Img): ScreenDraw => (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, "#3B5BD6");
  gr.addColorStop(0.6, "#6B4FC0");
  gr.addColorStop(1, "#2A1752");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  status(g, w, "#fff");
  if (img) {
    g.save();
    g.beginPath();
    g.arc(w / 2, h / 2 - 60, 210, 0, Math.PI * 2);
    g.fillStyle = "#F4EFE6";
    g.fill();
    g.clip();
    const s = 470 / img.width;
    g.drawImage(img, w / 2 - (img.width * s) / 2, h / 2 - 60 - 210, img.width * s, img.height * s);
    g.restore();
  }
  spark(g, w / 2, h / 2 + 270, 44);
};

export const phoneScreen = (f: number, im: { avatar: Img; gmail: Img; gem: Img }): ScreenDraw => {
  const k = cur(f);
  if (k === "ask") return inboxScreen(lp(f, "ask"), im.gmail);
  if (k === "write") return composeScreen(lp(f, "write"));
  if (k === "end") return avatarScreen(im.avatar);
  if (k === "docs") return composeScreen(288);
  return threadScreen(lp(f, "sum"));
};

/* ───── كرت «الزبدة» في المقدمة (عربي، مجاز مو واجهة) ───── */
const CARD_LINES = ["الميزانية اعتُمدت", "العرض النهائي يوم الخميس", "المطلوب منك: عروض الأسعار"];
export const cardDraw =
  (l: number): ScreenDraw =>
  (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, "#FFFFFF");
    gr.addColorStop(1, "#F1ECFB");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    spark(g, w - 70, 78, 30);
    txt(g, "الزبدة", w - 120, 98, `700 52px ${AR}`, "#1B1440", "right", "rtl");
    g.fillStyle = "#E4DDF6";
    g.fillRect(50, 140, w - 100, 3);
    CARD_LINES.forEach((t, i) => {
      const p = ease(l, i * 12, 12, OUT);
      if (p <= 0) return;
      g.globalAlpha = p;
      g.beginPath();
      g.arc(w - 72, 214 + i * 104, 10, 0, Math.PI * 2);
      g.fillStyle = ["#4796E3", "#9177C7", "#D96570"][i];
      g.fill();
      txt(g, t, w - 100, 228 + i * 104, `700 42px ${AR}`, "#241B4A", "right", "rtl");
      g.globalAlpha = 1;
    });
  };

/* ───── Docs على اللابتوب (1280×800) ───── */
export const DOCS_STEP = (l: number) => (l < 96 ? 0 : l < 170 ? 1 : 2);
const DOC_SUM = ["Goal: grow sign-ups 20% in Q4", "3 channels: email, events, partners", "Budget: $120K, review on Thu"];
export const docsScreen =
  (l: number, logo: Img): ScreenDraw =>
  (g, w, h) => {
    g.fillStyle = "#F9FBFD";
    g.fillRect(0, 0, w, h);
    // الشريط العلوي
    if (logo) g.drawImage(logo, 30, 18, 40, 55);
    txt(g, "Q4 Plan", 90, 52, `700 32px ${EN}`, "#202124");
    txt(g, "File   Edit   View   Insert   Format   Tools", 90, 84, `700 19px ${EN}`, "#5F6368");
    const step = DOCS_STEP(l);
    const pulse = step === 0 && l > 56 ? 0.5 + 0.5 * Math.sin(l / 4) : 0;
    pill(g, w - 400, 26, 200, 54, pulse > 0 ? `rgba(211,227,253,${0.75 + 0.25 * pulse})` : "#E8F0FE", pulse > 0 ? "#1A73E8" : undefined);
    spark(g, w - 368, 53, 14);
    txt(g, "Ask Gemini", w - 346, 62, `700 22px ${EN}`, "#0B57D0");
    ring(g, w - 300, 53, (l - 84) / 14);
    pill(g, w - 180, 26, 140, 54, "#C2E7FF");
    txt(g, "Share", w - 110, 62, `700 22px ${EN}`, "#001D35", "center");
    g.fillStyle = "#E1E3E6";
    g.fillRect(0, 104, w, 2);
    // الصفحة
    const panel = step === 0 ? 0 : ease(l, 96, 14, OUT);
    const pw = 760 - panel * 160;
    const px = 60 + (1 - panel) * 140;
    g.fillStyle = "#EEF1F4";
    g.fillRect(0, 106, w, h);
    box(g, px, 130, pw, h, 6, "#FFFFFF");
    txt(g, "Q4 Marketing Plan", px + 50, 200, `700 36px ${EN}`, "#202124");
    const para = (y: number, n: number, sel: boolean) => {
      for (let i = 0; i < n; i++) {
        const lw = (pw - 100) * (i === n - 1 ? 0.6 : 0.92 + ((i * 7) % 5) * 0.015);
        if (sel) {
          g.fillStyle = "rgba(26,115,232,.22)";
          g.fillRect(px + 46, y + i * 38 - 6, lw + 8, 34);
        }
        g.fillStyle = "#BDC1C6";
        g.fillRect(px + 50, y + i * 38 + 6, lw, 12);
      }
    };
    const sel = step === 2 && l > 172;
    para(240, 4, false);
    para(420, 4, sel);
    para(600, 4, false);
    // قائمة التحرير على النص المظلّل
    if (step === 2) {
      const pm = ease(l, 180, 12, OUT);
      g.globalAlpha = pm;
      const mx = px + pw - 300;
      const my = 380;
      g.shadowColor = "rgba(0,0,0,.18)";
      g.shadowBlur = 24;
      box(g, mx, my - 210, 260, 260, 16, "#fff");
      g.shadowBlur = 0;
      ["Rephrase", "Shorten", "Elaborate", "Bulletize", "Summarize"].forEach((o, i) => {
        const on = i === 1 && l > 200;
        if (on) box(g, mx + 8, my - 202 + i * 50, 244, 46, 10, "#E8F0FE");
        txt(g, o, mx + 30, my - 170 + i * 50, `700 22px ${EN}`, on ? "#0B57D0" : "#3C4043");
      });
      g.globalAlpha = 1;
    }
    // لوحة Gemini الجانبية
    if (panel > 0) {
      const x = w - panel * 420;
      box(g, x, 120, 420, h, 20, "#FFFFFF");
      g.fillStyle = "#E1E3E6";
      g.fillRect(x, 120, 2, h);
      spark(g, x + 40, 166, 16);
      txt(g, "Gemini", x + 66, 176, `700 28px ${EN}`, "#202124");
      const gr = g.createLinearGradient(x, 210, x + 400, 520);
      gr.addColorStop(0, "#EEF3FE");
      gr.addColorStop(1, "#F5EEFC");
      box(g, x + 20, 210, 380, 340, 18, gr);
      txt(g, "Summary of this doc", x + 40, 254, `700 23px ${EN}`, "#202124");
      DOC_SUM.forEach((s, i) => {
        const p = ease(l, 112 + i * 14, 12, OUT);
        if (p <= 0) return;
        g.globalAlpha = p;
        g.beginPath();
        g.arc(x + 46, 300 + i * 86, 6, 0, Math.PI * 2);
        g.fillStyle = "#9177C7";
        g.fill();
        wrap(g, s, x + 62, 308 + i * 86, 320, 30, `700 21px ${EN}`, "#202124");
        g.globalAlpha = 1;
      });
    }
  };
