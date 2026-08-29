#!/usr/bin/env python3
"""
مولّد ريلز تيك توك عربي — يحوّل ملف JSON إلى فيديو MP4 عمودي 1080×1920.

الاستخدام:
    python3 render_reel.py scenes.json ./out

المخرجات داخل مجلد out:
    reel.mp4     الفيديو النهائي الجاهز للنشر
    cover.jpg    صورة الغلاف (الإطار الأفضل من المشهد الأول)

يعتمد على Chromium (عبر Playwright) لتشكيل النص العربي بشكل صحيح،
وعلى ffmpeg (عبر imageio-ffmpeg) لترميز الفيديو. لا يحتاج إنترنت.
"""
import json, sys, os, base64, asyncio, pathlib, shutil, subprocess, re, math

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import graphics as G

HERE = pathlib.Path(__file__).parent
FONTS = HERE / "fonts"
ASSETS = HERE / "assets"


def avatar_uri():
    for name in ("avatar.png", "avatar.jpg", "avatar.jpeg"):
        f = ASSETS / name
        if f.exists():
            mime = "png" if name.endswith("png") else "jpeg"
            return f"data:image/{mime};base64," + base64.b64encode(f.read_bytes()).decode()
    return ""

W, H = 1080, 1920

# ————————————————————————————————— الألوان —————————————————————————————————

ACCENTS = {
    "blue":    ("#4F7BFF", "#9DB4FF"),
    "cyan":    ("#22D3EE", "#A5F3FC"),
    "emerald": ("#10D9A0", "#6EE7C0"),
    "amber":   ("#FFB020", "#FFD98A"),
    "violet":  ("#A855F7", "#DDB8FE"),
    "rose":    ("#FF4D6D", "#FFA8B8"),
    "orange":  ("#FF6B35", "#FFB394"),
    "lime":    ("#A3E635", "#D3F58C"),
}

# كل ستايل يرجّع: متغيرات CSS + طبقة الخلفية + هل الخلفية فاتحة
STYLES = ("neon", "mesh", "editorial", "terminal", "blocks", "aurora")


def style_vars(style, a1, a2):
    """متغيرات CSS الأساسية لكل ستايل."""
    soft, dim = a1 + "2B", a1 + "12"
    if style == "neon":
        return dict(bg="#05070F", ink="#FFFFFF", muted="rgba(255,255,255,.62)",
                    panel="rgba(255,255,255,.055)", line="rgba(255,255,255,.10)",
                    a1=a1, a2=a2, soft=soft, dim=dim, dark="1")
    if style == "mesh":
        return dict(bg="#0A0714", ink="#FFFFFF", muted="rgba(255,255,255,.70)",
                    panel="rgba(255,255,255,.10)", line="rgba(255,255,255,.16)",
                    a1=a1, a2=a2, soft=soft, dim=dim, dark="1")
    if style == "editorial":
        return dict(bg="#F4F1EA", ink="#12100C", muted="rgba(18,16,12,.58)",
                    panel="rgba(18,16,12,.045)", line="rgba(18,16,12,.14)",
                    a1=a1, a2=a1, soft=soft, dim=dim, dark="0")
    if style == "terminal":
        return dict(bg="#040A08", ink="#E8FFF6", muted="rgba(232,255,246,.55)",
                    panel="rgba(255,255,255,.04)", line="rgba(255,255,255,.09)",
                    a1=a1, a2=a2, soft=soft, dim=dim, dark="1")
    if style == "blocks":
        return dict(bg="#111111", ink="#FFFFFF", muted="rgba(255,255,255,.70)",
                    panel="#1C1C1C", line="rgba(255,255,255,.18)",
                    a1=a1, a2=a2, soft=soft, dim=dim, dark="1")
    # aurora
    return dict(bg="#060612", ink="#FFFFFF", muted="rgba(255,255,255,.66)",
                panel="rgba(255,255,255,.07)", line="rgba(255,255,255,.12)",
                a1=a1, a2=a2, soft=soft, dim=dim, dark="1")


def bg_layer(style):
    """طبقات الخلفية المتحركة — كل عنصر بـ data-bg يُحرّك من JS."""
    if style == "neon":
        return '''
        <div class="grid"></div>
        <div class="blob b1" data-bg="orbit" data-r="260" data-sp=".055"></div>
        <div class="blob b2" data-bg="orbit" data-r="340" data-sp="-.041" data-ph="2.1"></div>
        <div class="scan" data-bg="scan"></div>'''
    if style == "mesh":
        return '''
        <div class="blob m1" data-bg="orbit" data-r="380" data-sp=".048"></div>
        <div class="blob m2" data-bg="orbit" data-r="300" data-sp="-.062" data-ph="1.7"></div>
        <div class="blob m3" data-bg="orbit" data-r="440" data-sp=".035" data-ph="3.4"></div>'''
    if style == "editorial":
        return '''
        <div class="rules"></div>
        <div class="ecircle" data-bg="drift" data-r="70" data-sp=".05"></div>
        <div class="ebar" data-bg="drift" data-r="40" data-sp="-.037" data-ph="2.2"></div>'''
    if style == "terminal":
        return '''
        <div class="grid tgrid"></div>
        <div class="lines" data-bg="lines"></div>
        <div class="blob t1" data-bg="orbit" data-r="240" data-sp=".05"></div>'''
    if style == "blocks":
        return '''
        <div class="slab s1" data-bg="drift" data-r="60" data-sp=".045"></div>
        <div class="slab s2" data-bg="drift" data-r="90" data-sp="-.033" data-ph="2.6"></div>
        <div class="dots"></div>'''
    return '''
        <div class="aur a1" data-bg="wave" data-sp=".055"></div>
        <div class="aur a2" data-bg="wave" data-sp="-.04" data-ph="1.9"></div>
        <div class="aur a3" data-bg="wave" data-sp=".03" data-ph="3.6"></div>
        <div class="stars"></div>'''


# ————————————————————————————————— الخطوط —————————————————————————————————

AR_RANGE = ("U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0898-08E1,U+08E3-08FF,"
            "U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC")
LA_RANGE = "U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+2074,U+20AC,U+2212"


def font_face(family, weight, subset):
    f = FONTS / f"{family.lower()}-{subset}-{weight}-normal.woff2"
    if not f.exists():
        return ""
    b64 = base64.b64encode(f.read_bytes()).decode()
    uni = AR_RANGE if subset == "arabic" else LA_RANGE
    return (f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{weight};"
            f"font-display:block;src:url(data:font/woff2;base64,{b64}) format('woff2');"
            f"unicode-range:{uni};}}")


def all_faces():
    out = []
    for fam, weights in (("Cairo", [400, 600, 700, 900]), ("Tajawal", [400, 700, 900])):
        for w in weights:
            for sub in ("arabic", "latin"):
                out.append(font_face(fam, w, sub))
    return "\n".join(x for x in out if x)


def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


# ————————————————————————————————— CSS —————————————————————————————————

BASE_CSS = """
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:var(--bg)}
body{font-family:'Cairo','Tajawal',sans-serif;color:var(--ink);
     -webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.stage{position:relative;width:1080px;height:1920px;overflow:hidden;background:var(--bg)}
.bglayer{position:absolute;inset:0;overflow:hidden}
.grain{position:absolute;inset:0;opacity:.05;pointer-events:none;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>");
  mix-blend-mode:overlay}
.vig{position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(120% 78% at 50% 42%,transparent 38%,rgba(0,0,0,.55) 100%)}
.stage[data-light="1"] .vig{background:radial-gradient(120% 78% at 50% 42%,transparent 45%,rgba(0,0,0,.10) 100%)}

/* منطقة آمنة من واجهة تيك توك: أعلى ٢٤٠ / أسفل ٤٥٠ / جانبي ٩٦ */
.content{position:absolute;top:250px;bottom:455px;left:96px;right:96px;
  display:flex;flex-direction:column;justify-content:center;gap:34px;
  transform-origin:50% 45%;will-change:transform,opacity}
.stage{direction:rtl}

/* ————— عناصر نصية ————— */
.kicker{display:inline-flex;align-items:center;gap:14px;align-self:flex-start;
  padding:16px 30px;border-radius:999px;background:var(--panel);
  border:2px solid var(--line);font-weight:700;font-size:34px;letter-spacing:.2px;
  color:var(--ink)}
.kicker i{width:16px;height:16px;border-radius:50%;background:var(--a1);
  box-shadow:0 0 22px var(--a1);display:block}
.h1{font-weight:900;font-size:104px;line-height:1.20;letter-spacing:-1.6px}
.h2{font-weight:900;font-size:80px;line-height:1.24;letter-spacing:-1.2px}
.h3{font-weight:800;font-size:60px;line-height:1.25}
.body{font-weight:500;font-size:42px;line-height:1.62;color:var(--muted)}
.h1 b,.h2 b,.h3 b,.body b,.qtext b,.step .tx b,.cmp .tx b,.ftx b b{color:var(--a1);font-weight:900}
.mega{font-family:'Tajawal','Cairo',sans-serif;font-weight:900;font-size:230px;
  line-height:.98;letter-spacing:-6px;direction:ltr;text-align:right;
  background:linear-gradient(160deg,var(--ink) 12%,var(--a1) 96%);
  -webkit-background-clip:text;background-clip:text;color:transparent}
.stage[data-style="blocks"] .mega{background:none;color:var(--ink)}
.hair{height:4px;width:150px;background:var(--a1);border-radius:4px;align-self:flex-start}

/* ————— بطاقة زجاجية ————— */
.card{background:var(--panel);border:2px solid var(--line);border-radius:44px;
  padding:52px 56px;display:flex;flex-direction:column;gap:22px;
  backdrop-filter:blur(26px)}
.stage[data-style="blocks"] .card{border-radius:0;border:5px solid var(--ink);
  background:transparent;box-shadow:16px 16px 0 var(--a1)}
.stage[data-style="blocks"] .fnode,.stage[data-style="blocks"] .icard,
.stage[data-style="blocks"] .lyr,.stage[data-style="blocks"] .col{border-radius:8px;
  border-width:3px}
.stage[data-style="blocks"] .fic{border-radius:8px;background:var(--a1);color:#111}
.stage[data-style="blocks"] .iconchip{border-radius:10px;background:var(--a1);color:#111}
.stage[data-style="editorial"] .card{border-radius:10px;background:#fff;
  border:2px solid var(--line);box-shadow:0 24px 60px rgba(0,0,0,.07)}

/* ————— الخطوات ————— */
.step{display:flex;align-items:flex-start;gap:28px}
.step .num{flex:0 0 auto;width:78px;height:78px;border-radius:24px;display:grid;
  place-items:center;font-weight:900;font-size:40px;direction:ltr;
  background:var(--a1);color:#08070C}
.stage[data-light="1"] .step .num{color:#fff}
.step .tx{font-weight:700;font-size:44px;line-height:1.42;padding-top:8px}

/* ————— مقارنة ————— */
.cmp{display:flex;flex-direction:column;gap:26px}
.cmp .col{border-radius:36px;padding:42px 46px;border:2px solid var(--line);
  background:var(--panel);display:flex;flex-direction:column;gap:14px}
.cmp .lab{font-weight:900;font-size:34px;letter-spacing:.4px}
.cmp .bad .lab{color:#FF7A8A}
.cmp .good .lab{color:var(--a1)}
.stage[data-light="1"] .cmp .bad .lab{color:#C81E43}
.cmp .tx{font-weight:600;font-size:40px;line-height:1.5;color:var(--muted)}

/* ————— اقتباس ————— */
.qmark{font-family:'Tajawal',serif;font-size:190px;font-weight:900;line-height:.6;
  color:var(--a1);opacity:.5;direction:ltr}
.qtext{font-weight:800;font-size:72px;line-height:1.36;letter-spacing:-.6px}
.qauth{font-weight:600;font-size:38px;color:var(--muted)}

/* ————— الرسومات التوضيحية ————— */
svg [data-a],.icard,.ic{transform-box:fill-box;transform-origin:50% 50%}
.ic{flex:0 0 auto}
.dgm{display:flex;flex-direction:column;gap:28px}

/* مسار */
.flow{display:flex;flex-direction:column;gap:8px}
.fnode{display:flex;align-items:center;gap:26px;background:var(--panel);
  border:2px solid var(--line);border-radius:30px;padding:24px 30px}
.fic{flex:0 0 auto;width:88px;height:88px;border-radius:26px;display:grid;
  place-items:center;background:var(--soft);color:var(--a1)}
.ftx{display:flex;flex-direction:column;gap:5px}
.ftx b{font-weight:800;font-size:40px;line-height:1.28}
.ftx span{font-weight:500;font-size:29px;color:var(--muted);line-height:1.4}
.farrow{align-self:center;color:var(--a1);height:34px;opacity:.9}

/* حلقة نسبة */
.ringwrap{position:relative;align-self:center;width:440px;height:440px}
.ringsvg{position:absolute;inset:0}
.ringmid{position:absolute;inset:0;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:6px}
.ringnum{font-family:'Tajawal','Cairo',sans-serif;font-weight:900;font-size:118px;
  direction:ltr;color:var(--ink);line-height:1}
.ringlab{font-weight:700;font-size:31px;color:var(--muted)}

/* أعمدة */
.bars{display:flex;flex-direction:column;gap:22px}
.brow{display:flex;align-items:center;gap:20px}
.blab{flex:0 0 230px;font-weight:700;font-size:34px}
.btrack{flex:1;height:46px;border-radius:15px;background:var(--panel);
  border:2px solid var(--line);overflow:hidden;display:flex}
.bfill{display:block;height:100%;border-radius:13px;background:var(--a1);opacity:.40}
.bfill.hi{opacity:1;box-shadow:0 0 34px var(--a1)}
.bval{flex:0 0 auto;min-width:130px;font-weight:800;font-size:34px;direction:ltr;
  text-align:left}
.bval small{font-size:22px;color:var(--muted);margin-inline-start:7px;font-weight:600}

/* شبكة الوكيل */
.hubsvg{width:100%;height:auto;align-self:center}

/* طبقات */
.layers{display:flex;flex-direction:column;gap:15px}
.lyr{display:flex;align-items:center;gap:20px;padding:28px 34px;border-radius:26px;
  background:var(--panel);border:2px solid var(--line);
  margin-inline-start:calc(var(--i) * 46px)}
.lyr b{font-weight:800;font-size:39px}
.lyr .lnote{font-weight:500;font-size:27px;color:var(--muted)}
.ldot{flex:0 0 auto;width:16px;height:16px;border-radius:50%;background:var(--a1);
  box-shadow:0 0 22px var(--a1)}

/* شبكة أيقونات */
.igrid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.icard{background:var(--panel);border:2px solid var(--line);border-radius:32px;
  padding:32px 30px;display:flex;flex-direction:column;gap:11px;color:var(--a1)}
.icard b{font-weight:800;font-size:35px;color:var(--ink);line-height:1.3}
.icard span{font-weight:500;font-size:26px;color:var(--muted);line-height:1.45}

.prow{display:flex;align-items:center;gap:20px;align-self:flex-start}
.prow .kicker,.prow .iconchip{align-self:auto}

/* أيقونة داخل بطاقة/نقطة */
.iconchip{width:104px;height:104px;border-radius:30px;display:grid;place-items:center;
  background:var(--soft);color:var(--a1);align-self:flex-start}

/* التوقيع بالصورة الشخصية (خلفية مصمّمة + صورة مقصوصة) */
.sig{display:flex;flex-direction:column;align-items:center;gap:14px;margin-top:6px}
.avwrap{position:relative;width:320px;height:320px}
.avhalo{position:absolute;inset:-46px;border-radius:50%;
  background:radial-gradient(circle,var(--soft) 0%,transparent 68%)}
.avdisc{position:absolute;inset:0;border-radius:50%;overflow:hidden;
  background:radial-gradient(120% 110% at 50% 12%,var(--a2) 0%,var(--a1) 46%,
             var(--bg) 128%);
  border:7px solid var(--a1);
  box-shadow:0 26px 70px rgba(0,0,0,.45),inset 0 -30px 60px rgba(0,0,0,.28)}
.avdisc::after{content:"";position:absolute;inset:0;border-radius:50%;
  background:linear-gradient(180deg,rgba(255,255,255,.16),transparent 46%)}
.avcut{position:absolute;left:50%;bottom:-8px;width:auto;height:112%;
  transform:translateX(-50%);display:block;
  filter:drop-shadow(0 10px 26px rgba(0,0,0,.35))}
.avspark{position:absolute;border-radius:50%;background:var(--a1);
  box-shadow:0 0 18px var(--a1)}
.sig .nm{font-weight:800;font-size:40px;color:var(--ink)}
.sig .hd{font-weight:800;font-size:36px;color:var(--a1);direction:ltr}

/* ————— كروم ثابت ————— */
.chrome{position:absolute;inset:0;pointer-events:none}
.pbar{position:absolute;top:158px;left:96px;right:96px;height:8px;
  border-radius:99px;background:var(--line);overflow:hidden}
.pbar i{display:block;height:100%;width:0;border-radius:99px;
  background:linear-gradient(90deg,var(--a2),var(--a1))}
.handle{position:absolute;bottom:352px;left:0;right:0;text-align:center;
  font-weight:700;font-size:34px;letter-spacing:.6px;color:var(--muted);direction:ltr}
.idx{position:absolute;top:140px;right:96px;font-weight:800;font-size:30px;
  color:var(--muted);direction:ltr;display:none}

/* ————— خلفيات ————— */
.blob{position:absolute;border-radius:50%;filter:blur(120px);will-change:transform}
.b1{width:820px;height:820px;left:-160px;top:120px;background:var(--a1);opacity:.42}
.b2{width:700px;height:700px;right:-180px;bottom:140px;background:var(--a2);opacity:.30}
.m1{width:900px;height:900px;left:-200px;top:-80px;background:var(--a1);opacity:.62}
.m2{width:760px;height:760px;right:-220px;top:520px;background:var(--a2);opacity:.52}
.m3{width:840px;height:840px;left:120px;bottom:-260px;background:var(--a1);opacity:.40}
.t1{width:760px;height:760px;left:-200px;bottom:-100px;background:var(--a1);opacity:.26}
.grid{position:absolute;inset:-2px;opacity:.5;
  background-image:linear-gradient(var(--line) 2px,transparent 2px),
                   linear-gradient(90deg,var(--line) 2px,transparent 2px);
  background-size:120px 120px;
  -webkit-mask-image:radial-gradient(90% 60% at 50% 40%,#000 20%,transparent 78%)}
.tgrid{background-size:54px 54px;opacity:.7}
.scan{position:absolute;left:0;right:0;height:420px;
  background:linear-gradient(180deg,transparent,var(--a1),transparent);opacity:.10}
.lines{position:absolute;inset:0;opacity:.30;
  background:repeating-linear-gradient(180deg,transparent 0 5px,var(--line) 5px 6px)}
.rules{position:absolute;inset:0;opacity:.55;
  background:repeating-linear-gradient(90deg,transparent 0 179px,var(--line) 179px 180px)}
.ecircle{position:absolute;width:560px;height:560px;border-radius:50%;
  border:70px solid var(--a1);opacity:.16;right:-200px;top:180px}
.ebar{position:absolute;width:520px;height:520px;background:var(--a1);opacity:.12;
  left:-180px;bottom:120px;border-radius:60px;transform:rotate(-14deg)}
.slab{position:absolute;border-radius:0}
.s1{width:1000px;height:520px;background:var(--a1);left:-260px;top:-120px;
  transform:rotate(-8deg);opacity:.95}
.s2{width:900px;height:460px;background:var(--a2);right:-300px;bottom:-140px;
  transform:rotate(7deg);opacity:.9}
.dots{position:absolute;inset:0;opacity:.35;
  background-image:radial-gradient(var(--line) 3px,transparent 3px);background-size:46px 46px}
.aur{position:absolute;left:-25%;width:150%;height:560px;filter:blur(90px);
  border-radius:50%;will-change:transform}
.a1{background:linear-gradient(90deg,transparent,var(--a1),transparent);top:180px;opacity:.55}
.a2{background:linear-gradient(90deg,transparent,var(--a2),transparent);top:760px;opacity:.42}
.a3{background:linear-gradient(90deg,transparent,var(--a1),transparent);top:1340px;opacity:.34}
.stars{position:absolute;inset:0;opacity:.5;
  background-image:radial-gradient(1.6px 1.6px at 20% 12%,#fff,transparent),
    radial-gradient(1.6px 1.6px at 72% 26%,#fff,transparent),
    radial-gradient(1.4px 1.4px at 38% 58%,#fff,transparent),
    radial-gradient(1.8px 1.8px at 86% 68%,#fff,transparent),
    radial-gradient(1.4px 1.4px at 12% 82%,#fff,transparent),
    radial-gradient(1.6px 1.6px at 58% 90%,#fff,transparent)}
"""


# ————————————————————————— بناء محتوى المشهد —————————————————————————

def A(anim, delay=0.0, dur=0.75):
    return f'data-a="{anim}" data-d="{delay}" data-du="{dur}"'


def rich(txt):
    """تمييز *كلمة* بلون التمييز + ضبط اتجاه الأرقام والنِسَب."""
    out = esc(txt)
    out = re.sub(r"(\d[\d.,]*\s*%)", r'<span dir="ltr">\1</span>', out)
    return re.sub(r"\*(.+?)\*", r"<b>\1</b>", out)


def num_split(v):
    m = re.match(r"^\s*([\d.,]+)\s*(.*)$", str(v))
    if not m:
        return None
    return m.group(1), m.group(2)


AVATAR = ""


def head(s, big=False, d=0.05):
    """عنوان المشهد + الخط المميّز تحته."""
    tag = "h2" if big else "div"
    cls = "h2" if big else "h3"
    out = f'<{tag} class="{cls}" {A("slide", d, 0.72)}>{rich(s.get("title",""))}</{tag}>'
    return out + f'<div class="hair" {A("wipe", d + 0.22, 0.5)}></div>'


def foot(s, d):
    return (f'<div class="body" {A("rise", d, 0.7)}>{rich(s["body"])}</div>'
            if s.get("body") else "")


def scene_html(s):
    t = s.get("type", "point")

    # ————— مشاهد الرسومات التوضيحية —————
    if t == "flow":
        n = s.get("nodes", [])
        return (f'<div class="dgm">{head(s)}{G.flow(n, 0.38)}</div>'
                + foot(s, 0.38 + 0.34 * len(n[:4])))

    if t == "ring":
        return (f'<div class="dgm">{head(s)}'
                f'{G.ring(s.get("pct", 50), s.get("label", ""), 0.34)}</div>'
                + foot(s, 1.15))

    if t == "bars":
        it = s.get("items", [])
        return (f'<div class="dgm">{head(s)}'
                f'{G.bars(it, s.get("unit", ""), 0.38)}</div>'
                + foot(s, 0.38 + 0.26 * len(it[:4]) + 0.2))

    if t == "hub":
        return (f'<div class="dgm">{head(s)}'
                f'{G.hub(s.get("center", "وكيل ذكي"), s.get("nodes", []), 0.32)}</div>'
                + foot(s, 1.5))

    if t == "layers":
        it = s.get("items", [])
        return (f'<div class="dgm">{head(s)}{G.layers(it, 0.38)}</div>'
                + foot(s, 0.38 + 0.22 * len(it[:5]) + 0.2))

    if t == "icons":
        it = s.get("items", [])
        return (f'<div class="dgm">{head(s)}{G.icongrid(it, 0.38)}</div>'
                + foot(s, 0.38 + 0.14 * len(it[:6]) + 0.3))

    if t == "hook":
        p = []
        if s.get("kicker"):
            p.append(f'<div class="kicker" {A("pop",0.05)}><i></i>{esc(s["kicker"])}</div>')
        if s.get("big"):
            p.append(f'<div class="mega" {A("count",0.18,1.15)} data-v="{esc(s["big"])}">{esc(s["big"])}</div>')
        p.append(f'<h1 class="h1" {A("rise",0.30,0.85)}>{rich(s.get("title",""))}</h1>')
        if s.get("sub"):
            p.append(f'<div class="body" {A("rise",0.52)}>{rich(s["sub"])}</div>')
        return "".join(p)

    if t == "stat":
        p = [f'<div class="mega" {A("count",0.10,1.25)} data-v="{esc(s.get("big",""))}">{esc(s.get("big",""))}</div>',
             f'<h2 class="h2" {A("rise",0.42)}>{rich(s.get("title",""))}</h2>']
        if s.get("body"):
            p.append(f'<div class="body" {A("rise",0.60)}>{rich(s["body"])}</div>')
        return "".join(p)

    if t == "point":
        p = []
        badges = []
        if s.get("icon"):
            badges.append(f'<div class="iconchip">{G.icon(s["icon"], 58)}</div>')
        if s.get("n"):
            badges.append(f'<div class="kicker"><i></i>'
                          f'<span dir="ltr">{esc(s["n"])}</span></div>')
        if badges:
            p.append(f'<div class="prow" {A("pop",0.05)}>' + "".join(badges) + '</div>')
        p.append(f'<h2 class="h2" {A("slide",0.20,0.80)}>{rich(s.get("title",""))}</h2>')
        p.append(f'<div class="hair" {A("wipe",0.42,0.55)}></div>')
        if s.get("body"):
            p.append(f'<div class="body" {A("rise",0.52)}>{rich(s["body"])}</div>')
        return "".join(p)

    if t == "tip":
        ic = (f'<div class="iconchip" {A("pop",0.05)}>{G.icon(s["icon"], 58)}</div>'
              if s.get("icon") else
              f'<div class="kicker" {A("pop",0.05)}><i></i>{esc(s.get("kicker","نصيحة"))}</div>')
        return (ic + f'<div class="card" {A("rise",0.22,0.85)}>'
                f'<div class="h3">{rich(s.get("title",""))}</div>'
                f'<div class="body">{rich(s.get("body",""))}</div></div>')

    if t == "steps":
        p = [f'<h2 class="h2" {A("slide",0.05,0.75)}>{rich(s.get("title",""))}</h2>',
             f'<div class="hair" {A("wipe",0.28,0.5)}></div>']
        for i, it in enumerate(s.get("items", [])[:4]):
            d = 0.44 + i * 0.30
            p.append(f'<div class="step" {A("slide", d, 0.65)}>'
                     f'<div class="num" dir="ltr">{i+1}</div>'
                     f'<div class="tx">{rich(it)}</div></div>')
        return "".join(p)

    if t == "compare":
        bad, good = s.get("bad", {}), s.get("good", {})
        return ("".join([
            f'<h2 class="h2" {A("slide",0.05,0.75)}>{rich(s.get("title",""))}</h2>',
            '<div class="cmp">',
            f'<div class="col bad" {A("rise",0.34,0.7)}>'
            f'<div class="lab">✕ {esc(bad.get("label","بدون أتمتة"))}</div>'
            f'<div class="tx">{rich(bad.get("text",""))}</div></div>',
            f'<div class="col good" {A("rise",0.60,0.7)}>'
            f'<div class="lab">✓ {esc(good.get("label","مع الأتمتة"))}</div>'
            f'<div class="tx">{rich(good.get("text",""))}</div></div>',
            '</div>']))

    if t == "quote":
        p = [f'<div class="qmark" {A("pop",0.05)}>&ldquo;</div>',
             f'<div class="qtext" {A("rise",0.20,0.85)}>{rich(s.get("text",""))}</div>']
        if s.get("author"):
            p.append(f'<div class="qauth" {A("rise",0.52)}>— {esc(s["author"])}</div>')
        return "".join(p)

    # cta
    p = [f'<div class="kicker" {A("pop",0.05)}><i></i>{esc(s.get("kicker","تابع للمزيد"))}</div>',
         f'<h1 class="h1" {A("rise",0.20,0.85)}>{rich(s.get("title",""))}</h1>']
    if s.get("body"):
        p.append(f'<div class="body" {A("rise",0.46)}>{rich(s["body"])}</div>')
    if AVATAR and s.get("avatar", True):
        sig = [f'<div class="avwrap" {A("pop",0.62,0.85)}>'
               f'<div class="avhalo"></div>'
               f'<div class="avspark" style="width:16px;height:16px;top:14px;right:-6px"></div>'
               f'<div class="avspark" style="width:10px;height:10px;bottom:44px;left:-14px;'
               f'opacity:.75"></div>'
               f'<div class="avdisc"><img class="avcut" src="{AVATAR}"></div></div>']
        if s.get("name"):
            sig.append(f'<div class="nm" {A("rise",0.80,0.6)}>{esc(s["name"])}</div>')
        if s.get("handle"):
            sig.append(f'<div class="hd" {A("rise",0.90,0.6)} dir="ltr">{esc(s["handle"])}</div>')
        p.append('<div class="sig">' + "".join(sig) + "</div>")
    elif s.get("handle"):
        p.append(f'<div class="h3" {A("pop",0.68)} dir="ltr" '
                 f'style="color:var(--a1);align-self:flex-start">{esc(s["handle"])}</div>')
    return "".join(p)


# ————————————————————————— محرّك الحركة (JS) —————————————————————————

ENGINE_JS = r"""
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const outExpo=p=>p>=1?1:1-Math.pow(2,-10*p);
const outCubic=p=>1-Math.pow(1-p,3);
const outBack=p=>{const c=1.70158+1;return 1+(c+1)*Math.pow(p-1,3)+c*Math.pow(p-1,2);};

const ITEMS=[...document.querySelectorAll('[data-a]')].map(el=>({
  el, a:el.dataset.a, d:parseFloat(el.dataset.d||0), du:parseFloat(el.dataset.du||0.75),
  v:el.dataset.v||''
}));
const BGS=[...document.querySelectorAll('[data-bg]')].map(el=>{
  const b=getComputedStyle(el).transform;
  return { el, k:el.dataset.bg, r:parseFloat(el.dataset.r||0),
           sp:parseFloat(el.dataset.sp||0.04), ph:parseFloat(el.dataset.ph||0),
           base:(b&&b!=='none')?b:'' };
});
const CONTENT=document.querySelector('.content');
const PBAR=document.querySelector('.pbar i');

function fmtCount(v,p){
  const m=String(v).match(/^\s*([\d.,]+)\s*(.*)$/);
  if(!m) return v;
  const raw=m[1], suf=m[2];
  const dec=(raw.split('.')[1]||'').length;
  const target=parseFloat(raw.replace(/,/g,''));
  if(!isFinite(target)) return v;
  const cur=target*outExpo(p);
  let s=dec?cur.toFixed(dec):Math.round(cur).toString();
  if(raw.includes(',')) s=s.replace(/\B(?=(\d{3})+(?!\d))/g,',');
  return s+suf;
}

function setT(t,dur,T,gp){
  for(const it of ITEMS){
    const p=clamp((t-it.d)/it.du,0,1);
    const e=outExpo(p), c=outCubic(p);
    let tr='', op=p<=0?0:Math.min(1,p*2.6), fl='';
    if(it.a==='rise'){ tr='translateY('+((1-e)*72)+'px)'; fl='blur('+((1-c)*9)+'px)'; }
    else if(it.a==='slide'){ tr='translateX('+((1-e)*95)+'px)'; fl='blur('+((1-c)*7)+'px)'; }
    else if(it.a==='pop'){ tr='scale('+(0.74+outBack(p)*0.26)+')'; }
    else if(it.a==='wipe'){ tr='scaleX('+e+')'; it.el.style.transformOrigin='100% 50%'; op=1; }
    else if(it.a==='count'){ tr='translateY('+((1-e)*46)+'px)'; it.el.textContent=fmtCount(it.v,p); }
    else if(it.a==='fade'){ tr=''; }
    else if(it.a==='growx'){ tr='scaleX('+e+')'; it.el.style.transformOrigin='100% 50%'; op=1; }
    else if(it.a==='grow'){ tr='scaleY('+e+')'; it.el.style.transformOrigin='50% 100%'; op=1; }
    else if(it.a==='ring'){
      const L=parseFloat(it.el.dataset.len||0), pc=parseFloat(it.el.dataset.pct||0)/100;
      it.el.style.strokeDashoffset=L*(1-pc*e); op=1; tr='';
    }
    it.el.style.opacity=op;
    it.el.style.transform=tr;
    it.el.style.filter=fl||'';
  }
  const o=clamp((t-(dur-0.40))/0.40,0,1), oe=outCubic(o);
  const i=clamp(t/0.55,0,1), ie=outExpo(i);
  CONTENT.style.opacity=(1-oe)*Math.min(1,0.15+i*3);
  CONTENT.style.transform='scale('+((0.985+0.015*ie)-0.05*oe)+') translateY('+((1-ie)*18-26*oe)+'px)';
  if(PBAR) PBAR.style.width=(clamp(gp,0,1)*100)+'%';

  for(const b of BGS){
    let tr='';
    if(b.k==='orbit'){
      const w=T*b.sp*2*Math.PI+b.ph;
      tr='translate('+(Math.cos(w)*b.r)+'px,'+(Math.sin(w*1.3)*b.r*0.62)+'px)';
    } else if(b.k==='drift'){
      const w=T*b.sp*2*Math.PI+b.ph;
      tr='translate('+(Math.sin(w)*b.r)+'px,'+(Math.cos(w*0.8)*b.r)+'px)';
    } else if(b.k==='wave'){
      const w=T*b.sp*2*Math.PI+b.ph;
      tr='translate('+(Math.sin(w)*180)+'px,'+(Math.cos(w*0.7)*70)+'px) rotate('+(Math.sin(w)*5)+'deg)';
    } else if(b.k==='scan'){
      tr='translateY('+((((T*0.22+b.ph)%1)+1)%1*2340-420)+'px)';
    } else if(b.k==='lines'){
      tr='translateY('+((T*22)%6)+'px)';
    }
    b.el.style.transform=(b.base?b.base+' ':'')+tr;
  }
}
window.setT=setT;
window.__ready=true;
"""


# ————————————————————————— تجميع الصفحة —————————————————————————

DEFAULT_DUR = {"hook": 3.6, "point": 4.6, "stat": 4.4, "steps": 6.6,
               "compare": 5.8, "quote": 4.4, "tip": 5.0, "cta": 4.2}


def page_html(scene, style, vars_, handle, faces):
    css_vars = ";".join(f"--{k}:{v}" for k, v in vars_.items() if k != "dark")
    light = "0" if vars_["dark"] == "1" else "1"
    hd = (f'<div class="handle">{esc(handle)}</div>') if handle else ""
    return f"""<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<style>{faces}
:root{{{css_vars}}}
{BASE_CSS}</style></head><body>
<div class="stage" data-style="{style}" data-light="{light}">
  <div class="bglayer">{bg_layer(style)}</div>
  <div class="vig"></div><div class="grain"></div>
  <div class="content">{scene_html(scene)}</div>
  <div class="chrome"><div class="pbar"><i></i></div>{hd}</div>
</div>
<script>{ENGINE_JS}</script></body></html>"""


# ————————————————————————— التصيير —————————————————————————

def chromium_path():
    """يعثر على Chromium المثبّت مسبقاً حتى لو اختلف رقم البِلد عن نسخة playwright."""
    import glob
    for pat in ("/opt/pw-browsers/chromium-*/chrome-linux/chrome",
                "/opt/pw-browsers/chromium/chrome-linux/chrome",
                "/opt/pw-browsers/chromium*/chrome-linux*/chrome",
                os.path.expanduser("~/.cache/ms-playwright/chromium-*/chrome-linux/chrome")):
        hits = sorted(glob.glob(pat))
        if hits:
            return hits[-1]
    return None


async def render(spec, outdir):
    from playwright.async_api import async_playwright

    fps = int(spec.get("fps", 30))
    style = spec.get("style", "neon")
    if style not in STYLES:
        style = "neon"
    accent = spec.get("accent", "blue")
    a1, a2 = ACCENTS.get(accent, ACCENTS["blue"])
    vars_ = style_vars(style, a1, a2)
    handle = spec.get("handle", "")
    faces = all_faces()
    globals()["AVATAR"] = "" if spec.get("avatar") is False else avatar_uri()

    scenes = spec.get("scenes", [])
    if not scenes:
        raise SystemExit("لا توجد مشاهد في ملف JSON")
    durs = [float(s.get("dur") or DEFAULT_DUR.get(s.get("type", "point"), 4.5)) for s in scenes]
    total = sum(durs)

    outdir = pathlib.Path(outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    frames = outdir / "_frames"
    if frames.exists():
        shutil.rmtree(frames)
    frames.mkdir()

    print(f"▶ ستايل: {style} · لون: {accent} · مشاهد: {len(scenes)} · مدة: {total:.1f}ث "
          f"· إطارات: {int(total*fps)}")

    n = 0
    elapsed = 0.0
    cover_src = None
    async with async_playwright() as pw:
        launch = dict(args=["--force-color-profile=srgb", "--font-render-hinting=none",
                            "--disable-lcd-text", "--hide-scrollbars"])
        exe = chromium_path()
        if exe:
            launch["executable_path"] = exe
        browser = await pw.chromium.launch(**launch)
        page = await browser.new_page(viewport={"width": W, "height": H},
                                      device_scale_factor=1)
        for si, sc in enumerate(scenes):
            dur = durs[si]
            await page.set_content(page_html(sc, style, vars_, handle, faces),
                                   wait_until="load")
            await page.evaluate("document.fonts.ready")
            nf = max(1, int(round(dur * fps)))
            cover_f = min(int(1.8 * fps), nf - 1)
            for f in range(nf):
                t = f / fps
                T = elapsed + t
                await page.evaluate("([t,d,T,g])=>setT(t,d,T,g)",
                                    [t, dur, T, (T + 1e-6) / total])
                n += 1
                p = frames / f"{n:05d}.jpg"
                await page.screenshot(path=str(p), type="jpeg", quality=92)
                if si == 0 and f == cover_f:
                    cover_src = p
            elapsed += dur
            print(f"  ✓ مشهد {si+1}/{len(scenes)} ({sc.get('type')}) — {nf} إطار")
        await browser.close()

    if cover_src and cover_src.exists():
        shutil.copy(cover_src, outdir / "cover.jpg")

    encode(frames, outdir / "reel.mp4", fps, total)
    shutil.rmtree(frames, ignore_errors=True)
    return outdir / "reel.mp4"


def ffmpeg_bin():
    for c in ("ffmpeg", "/usr/bin/ffmpeg"):
        if shutil.which(c):
            return shutil.which(c)
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def encode(frames, out, fps, dur):
    ff = ffmpeg_bin()
    cmd = [ff, "-y", "-loglevel", "error",
           "-framerate", str(fps), "-i", str(frames / "%05d.jpg"),
           "-f", "lavfi", "-t", f"{dur:.3f}", "-i", "anullsrc=r=44100:cl=stereo",
           "-c:v", "libx264", "-profile:v", "high", "-level", "4.1",
           "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium",
           "-r", str(fps), "-c:a", "aac", "-b:a", "96k", "-shortest",
           "-movflags", "+faststart", str(out)]
    subprocess.run(cmd, check=True)
    mb = out.stat().st_size / 1048576
    print(f"✓ {out}  ({mb:.1f} MB · {dur:.1f}ث · {fps}fps · 1080×1920)")


async def stills(spec, outdir):
    """لقطة ثابتة واحدة لكل مشهد (سريعة) — للفحص البصري قبل تصيير الفيديو."""
    from playwright.async_api import async_playwright
    style = spec.get("style", "neon")
    if style not in STYLES:
        style = "neon"
    a1, a2 = ACCENTS.get(spec.get("accent", "blue"), ACCENTS["blue"])
    vars_ = style_vars(style, a1, a2)
    faces = all_faces()
    globals()["AVATAR"] = "" if spec.get("avatar") is False else avatar_uri()
    outdir = pathlib.Path(outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    scenes = spec.get("scenes", [])
    async with async_playwright() as pw:
        launch = dict(args=["--force-color-profile=srgb", "--font-render-hinting=none",
                            "--disable-lcd-text", "--hide-scrollbars"])
        exe = chromium_path()
        if exe:
            launch["executable_path"] = exe
        browser = await pw.chromium.launch(**launch)
        page = await browser.new_page(viewport={"width": W, "height": H},
                                      device_scale_factor=1)
        for i, sc in enumerate(scenes):
            dur = float(sc.get("dur") or DEFAULT_DUR.get(sc.get("type", "point"), 4.5))
            await page.set_content(page_html(sc, style, vars_, spec.get("handle", ""), faces),
                                   wait_until="load")
            await page.evaluate("document.fonts.ready")
            t = max(0.0, dur - 0.9)
            await page.evaluate("([t,d,T,g])=>setT(t,d,T,g)",
                                [t, dur, t, (i + 1) / max(1, len(scenes))])
            f = outdir / f"still_{i+1:02d}_{sc.get('type','x')}.png"
            await page.screenshot(path=str(f))
            print(f"  ✓ {f.name}")
        await browser.close()


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = {a for a in sys.argv[1:] if a.startswith("--")}
    if len(args) < 2:
        print(__doc__)
        sys.exit(1)
    spec = json.loads(pathlib.Path(args[0]).read_text(encoding="utf-8"))
    if "--stills" in flags:
        asyncio.run(stills(spec, args[1]))
    else:
        asyncio.run(render(spec, args[1]))


if __name__ == "__main__":
    main()
