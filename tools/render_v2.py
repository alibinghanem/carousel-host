#!/usr/bin/env python3
"""مولّد كاروسيل إنستقرام عربي — نسخة بتخطيطات متعددة.

يختلف عن render.py الأصلي بأن لكل شريحة "تخطيطاً" (layout) يغيّر التركيب
البصري كاملاً — لا اللون فقط. الهدف أن تبدو المنشورات مختلفة في شبكة
الحساب المصغّرة، حيث يُحكم على التنوّع فعلياً.

الاستخدام:
    python3 render_v2.py slides.json ./out

بنية JSON:
{
  "theme": "indigo",         # indigo|emerald|crimson|amber|violet|steel|paper
  "handle": "@your_handle",
  "slides": [
    {"type":"cover", "layout":"manchette", "kicker":"...", "big":"1B",
     "title":"...", "sub":"..."},
    {"type":"point", "title":"...", "body":"...", "n":1},
    {"type":"stat",  "layout":"ledger", "big":"150M", "title":"...",
     "body":"...", "rows":[{"label":"...","value":"..."}]},
    {"type":"quote", "text":"...", "author":"..."},
    {"type":"cta",   "title":"...", "body":"...", "name":"@handle"}
  ]
}

تخطيطات الغلاف: numeral · manchette · stencil · band · ledger
"""
import json
import sys
import base64
import asyncio
import pathlib

HERE = pathlib.Path(__file__).parent
SKILL = pathlib.Path("/root/.claude/skills/synced/arabic-instagram-carousel")

# الخطوط والصورة الشخصية تعيش مع المهارة؛ نقبل نسخة محلية بديلة.
FONT_DIRS = [SKILL / "fonts", HERE / "fonts", HERE.parent / "fonts"]
ASSET_DIRS = [SKILL / "assets", HERE / "assets", HERE.parent / "assets"]

# ink  = النص الأساسي · ink2 = نص ثانوي · onaccent = النص فوق كتلة اللون
THEMES = {
    "indigo":  {"bg1": "#0B1026", "bg2": "#1B2A6B", "glow": "#4F6BFF",
                "accent": "#7C9BFF", "ink": "#FFFFFF", "ink2": "#FFFFFFB8",
                "onaccent": "#0B1026", "light": False},
    "emerald": {"bg1": "#04140F", "bg2": "#0B4A38", "glow": "#12C48B",
                "accent": "#5EE9B5", "ink": "#FFFFFF", "ink2": "#FFFFFFB8",
                "onaccent": "#04140F", "light": False},
    "crimson": {"bg1": "#160408", "bg2": "#6B0F26", "glow": "#FF3B63",
                "accent": "#FF8FA6", "ink": "#FFFFFF", "ink2": "#FFFFFFB8",
                "onaccent": "#160408", "light": False},
    "amber":   {"bg1": "#170D02", "bg2": "#6B3E06", "glow": "#FFA31A",
                "accent": "#FFD08A", "ink": "#FFFFFF", "ink2": "#FFFFFFB8",
                "onaccent": "#170D02", "light": False},
    "violet":  {"bg1": "#12061F", "bg2": "#4A1173", "glow": "#A855F7",
                "accent": "#D8B4FE", "ink": "#FFFFFF", "ink2": "#FFFFFFB8",
                "onaccent": "#12061F", "light": False},
    # رمادي بارد بذهبي شاحب — نبرة تحريرية رصينة
    "steel":   {"bg1": "#0D1117", "bg2": "#1E2836", "glow": "#5A6B82",
                "accent": "#E3C489", "ink": "#FFFFFF", "ink2": "#FFFFFFB0",
                "onaccent": "#0D1117", "light": False},
    # أرضية فاتحة — أقوى كاسر للتشابه في شبكة داكنة
    "paper":   {"bg1": "#F1EFEA", "bg2": "#DCD7CD", "glow": "#2E4BFF",
                "accent": "#1B3BEF", "ink": "#101318", "ink2": "#101318A6",
                "onaccent": "#FFFFFF", "light": True},
}

COVER_LAYOUTS = ("numeral", "manchette", "stencil", "band", "ledger")


def _find(dirs, name):
    for d in dirs:
        p = d / name
        if p.exists():
            return p
    return None


def font_face(family, weight, subset):
    f = _find(FONT_DIRS, f"{family.lower()}-{subset}-{weight}-normal.woff2")
    if not f:
        return ""
    b64 = base64.b64encode(f.read_bytes()).decode()
    uni = ("U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0898-08E1,U+08E3-08FF,"
           "U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC") \
        if subset == "arabic" else "U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+2074,U+20AC,U+2212"
    return (f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{weight};"
            f"font-display:block;src:url(data:font/woff2;base64,{b64}) format('woff2');"
            f"unicode-range:{uni};}}")


def all_faces():
    css = []
    for fam, weights in (("Cairo", [400, 600, 700, 900]), ("Tajawal", [400, 700, 900])):
        for w in weights:
            for sub in ("arabic", "latin"):
                css.append(font_face(fam, w, sub))
    return "\n".join(css)


AVATAR_B64 = ""


def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _rows_html(rows, cls="ledrow"):
    out = []
    for r in rows or []:
        out.append(
            f'<div class="{cls}">'
            f'<span class="ledval">{esc(r.get("value", ""))}</span>'
            f'<span class="ledlab">{esc(r.get("label", ""))}</span>'
            f'</div>'
        )
    return "".join(out)


# ─────────────────────────── تخطيطات الغلاف ───────────────────────────

def cover_numeral(s):
    """رقم ضخم متدرّج في الوسط — للأخبار التي يكون الرقم فيها هو القصة."""
    kicker = s.get("kicker") or s.get("badge")
    k = f'<div class="chip">{esc(kicker)}</div>' if kicker else ""
    big = f'<div class="mega">{esc(s["big"])}</div>' if s.get("big") else ""
    sub = f'<div class="sub">{esc(s["sub"])}</div>' if s.get("sub") else ""
    return f'''<div class="wrap center">
        {k}{big}
        <h1 class="disp">{esc(s.get("title", ""))}</h1>
        {sub}
    </div>'''


def cover_manchette(s):
    """مانشيت: العنوان نفسه هو الصورة — بلا رقم، على خط عريض."""
    kicker = s.get("kicker") or s.get("badge")
    k = f'<div class="eyebrow">{esc(kicker)}</div>' if kicker else ""
    tag = f'<div class="mantag">{esc(s["big"])}</div>' if s.get("big") else ""
    sub = f'<div class="sub man">{esc(s["sub"])}</div>' if s.get("sub") else ""
    return f'''<div class="wrap man">
        {k}
        <h1 class="manhead">{esc(s.get("title", ""))}</h1>
        <div class="manrule"></div>
        {sub}{tag}
    </div>'''


def cover_stencil(s):
    """رقم مفرّغ عملاق ينزف خارج الكادر، والعنوان صلب فوقه."""
    kicker = s.get("kicker") or s.get("badge")
    k = f'<div class="chip">{esc(kicker)}</div>' if kicker else ""
    ghost = f'<div class="ghost">{esc(s["big"])}</div>' if s.get("big") else ""
    sub = f'<div class="sub">{esc(s["sub"])}</div>' if s.get("sub") else ""
    return f'''{ghost}
    <div class="wrap sten">
        {k}
        <h1 class="stenhead">{esc(s.get("title", ""))}</h1>
        {sub}
    </div>'''


def cover_band(s):
    """شريط لوني صريح يقطع الكادر — أعلى تباين في الشبكة المصغّرة."""
    kicker = s.get("kicker") or s.get("badge")
    k = f'<div class="eyebrow">{esc(kicker)}</div>' if kicker else ""
    big = f'<div class="bandnum">{esc(s["big"])}</div>' if s.get("big") else ""
    sub = f'<div class="sub band">{esc(s["sub"])}</div>' if s.get("sub") else ""
    return f'''<div class="wrap bandwrap">
        <div class="bandtop">{k}{big}</div>
        <div class="bandblock"><h1 class="bandhead">{esc(s.get("title", ""))}</h1></div>
        {sub}
    </div>'''


def cover_ledger(s):
    """عنوان علوي وصف بيانات بخطوط شعرية — للمقارنات والأرقام المتعددة."""
    kicker = s.get("kicker") or s.get("badge")
    k = f'<div class="eyebrow">{esc(kicker)}</div>' if kicker else ""
    rows = s.get("rows")
    if not rows and s.get("big"):
        rows = [{"value": s["big"], "label": s.get("sub", "")}]
    return f'''<div class="wrap led">
        {k}
        <h1 class="ledhead">{esc(s.get("title", ""))}</h1>
        <div class="ledtable">{_rows_html(rows)}</div>
    </div>'''


COVER_FN = {
    "numeral": cover_numeral,
    "manchette": cover_manchette,
    "stencil": cover_stencil,
    "band": cover_band,
    "ledger": cover_ledger,
}


# ─────────────────────────── الشرائح الداخلية ───────────────────────────

def slide_body(s, handle):
    typ = s.get("type", "point")
    layout = s.get("layout")

    if typ == "cover":
        layout = layout if layout in COVER_FN else "numeral"
        return COVER_FN[layout](s), layout

    if typ == "stat":
        if layout == "ledger" and s.get("rows"):
            tight = " tight" if (len(s["rows"]) >= 3 and s.get("body")) else ""
            return f'''<div class="wrap led{tight}">
                <h1 class="ledhead">{esc(s.get("title", ""))}</h1>
                <div class="ledtable">{_rows_html(s["rows"])}</div>
                <p class="body">{esc(s.get("body", ""))}</p>
            </div>''', "ledger"
        return f'''<div class="wrap center">
            <div class="mega">{esc(s.get("big", ""))}</div>
            <h1 class="h2">{esc(s.get("title", ""))}</h1>
            <p class="body">{esc(s.get("body", ""))}</p>
        </div>''', "numeral"

    if typ == "quote":
        return f'''<div class="wrap quotewrap">
            <div class="qmark">”</div>
            <h1 class="quote">{esc(s.get("text", ""))}</h1>
            <div class="qauthor">— {esc(s.get("author", ""))}</div>
        </div>''', "manchette"

    if typ == "cta":
        if AVATAR_B64:
            name = s.get("name") or handle
            head = (f'<div class="avatar"><img src="data:image/png;base64,{AVATAR_B64}"></div>'
                    f'<div class="avaname">{esc(name)}</div>')
        else:
            head = '<div class="ctaring"></div>'
        return f'''<div class="wrap center">
            {head}
            <h1 class="disp small">{esc(s.get("title", ""))}</h1>
            <p class="body">{esc(s.get("body", ""))}</p>
        </div>''', "numeral"

    # point
    n = f'<div class="num">{esc(s["n"])}</div>' if s.get("n") else ""
    return f'''<div class="wrap point">
        {n}
        <h1 class="h2">{esc(s.get("title", ""))}</h1>
        <p class="body">{esc(s.get("body", ""))}</p>
    </div>''', "point"


# ─────────────────────────── الخلفيات ───────────────────────────

def background_css(t, layout):
    """لكل تخطيط معالجة خلفية مختلفة حتى لا تتشابه الشرائح."""
    a, g, b1, b2 = t["accent"], t["glow"], t["bg1"], t["bg2"]

    if layout == "manchette":
        # أرضية مسطّحة وخطوط شعرية أفقية — نبرة صحيفة
        line = f"{a}14"
        return f'''
        body::before{{
          background:
            linear-gradient(180deg,{b2}59 0%,{b1} 46%,{b1} 100%),
            repeating-linear-gradient(180deg,{line} 0 1px,transparent 1px 76px);
        }}'''

    if layout == "stencil":
        # ضوء خارج المركز + تعتيم حاد عند الحواف
        return f'''
        body::before{{
          background:
            radial-gradient(760px 640px at 84% 8%, {g}66 0%, transparent 60%),
            radial-gradient(1100px 900px at 10% 106%, {b2}cc 0%, transparent 70%),
            linear-gradient(150deg,{b1} 0%,{b2}4d 52%,{b1} 100%);
        }}
        body::after{{box-shadow:inset 0 0 240px 90px {b1}cc;}}'''

    if layout == "band":
        # أرضية شبه مسطّحة — الشريط اللوني هو الحدث
        return f'''
        body::before{{
          background:linear-gradient(175deg,{b1} 0%,{b2}80 58%,{b1} 100%);
        }}'''

    if layout == "ledger":
        # شبكة نقطية خفيفة
        dot = f"{a}1f"
        return f'''
        body::before{{
          background:
            radial-gradient({dot} 1.6px, transparent 1.7px) 0 0/46px 46px,
            linear-gradient(165deg,{b1} 0%,{b2}59 60%,{b1} 100%);
        }}'''

    # numeral / point — التوهج الإشعاعي
    return f'''
    body::before{{
      background:
        radial-gradient(900px 700px at 78% 12%, {g}55 0%, transparent 62%),
        radial-gradient(760px 620px at 14% 88%, {b2}dd 0%, transparent 66%),
        linear-gradient(160deg,{b1} 0%,{b2}66 55%,{b1} 100%);
    }}'''


def page_html(s, t, handle, idx, total):
    body, layout = slide_body(s, handle)
    light = t["light"]
    ink, ink2, a, g, b1 = t["ink"], t["ink2"], t["accent"], t["glow"], t["bg1"]
    onacc = t["onaccent"]
    noise_op = ".035" if light else ".05"
    # الإطار يظهر في بعض التخطيطات فقط — اختلاف إضافي في الشبكة
    frame = "" if layout in ("manchette", "band") else '<div class="frame"></div>'
    footc = f"{ink}80" if not light else f"{ink}73"

    return f'''<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<style>
{all_faces()}
*{{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}}
html,body{{width:1080px;height:1080px;overflow:hidden;}}
body{{
  font-family:'Cairo','Tajawal',sans-serif; color:{ink};
  background:{b1};
  display:flex; align-items:center; justify-content:center;
  position:relative;
}}
body::before{{content:'';position:absolute;inset:0;}}
body::after{{
  content:''; position:absolute; inset:0; opacity:{noise_op}; mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
}}
{background_css(t, layout)}
.frame{{position:absolute;inset:34px;border:1px solid {a}26;border-radius:34px;}}
.wrap{{position:relative;z-index:3;width:850px;padding:0 10px;}}
.wrap.center{{text-align:center;}}
.wrap.point{{text-align:right;}}

/* ── مشتركات ── */
.chip{{
  display:inline-block;padding:13px 30px;border-radius:100px;
  background:{a}1f;border:1px solid {a}59;color:{a};
  font-size:30px;font-weight:700;margin-bottom:40px;
}}
.eyebrow{{
  font-size:27px;font-weight:700;color:{a};letter-spacing:2px;
  margin-bottom:26px;text-transform:uppercase;
}}
.mega{{
  font-size:210px;font-weight:900;line-height:.92;letter-spacing:-4px;
  background:linear-gradient(180deg,{ink} 25%,{a} 115%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  margin-bottom:26px;filter:drop-shadow(0 16px 46px {g}59);
  direction:ltr;unicode-bidi:isolate;
}}
.disp{{font-size:76px;font-weight:900;line-height:1.32;letter-spacing:-.5px;}}
.disp.small{{font-size:66px;}}
.h2{{font-size:62px;font-weight:800;line-height:1.4;letter-spacing:-.3px;}}
.sub{{margin-top:30px;font-size:38px;font-weight:500;color:{a};line-height:1.5;}}
.body{{
  margin-top:34px;font-family:'Tajawal','Cairo',sans-serif;
  font-size:41px;font-weight:400;line-height:1.78;color:{ink2};
}}
.num{{
  width:104px;height:104px;border-radius:28px;display:flex;
  align-items:center;justify-content:center;
  background:linear-gradient(145deg,{g},{a});
  color:{onacc};font-size:56px;font-weight:900;margin-bottom:38px;
  box-shadow:0 14px 40px {g}4d;
}}

/* ── مانشيت ── */
.wrap.man{{text-align:right;width:900px;}}
.manhead{{
  font-size:104px;font-weight:900;line-height:1.16;letter-spacing:-3px;
}}
.manrule{{
  width:290px;height:15px;margin:44px 0 0 auto;border-radius:2px;
  background:{a};box-shadow:0 10px 34px {g}4d;
}}
.sub.man{{margin-top:32px;font-size:37px;color:{ink2};font-weight:500;}}
.mantag{{
  display:inline-block;margin-top:34px;padding:9px 26px;border-radius:8px;
  background:{a};color:{onacc};font-size:34px;font-weight:900;
  direction:ltr;unicode-bidi:isolate;
}}

/* ── ستنسل ── */
.ghost{{
  position:absolute;z-index:1;left:-92px;top:50%;transform:translateY(-52%);
  font-size:430px;font-weight:900;line-height:.8;letter-spacing:-14px;
  color:transparent;-webkit-text-stroke:4px {a}b3;
  direction:ltr;unicode-bidi:isolate;pointer-events:none;
}}
.wrap.sten{{text-align:right;width:880px;}}
.stenhead{{
  font-size:88px;font-weight:900;line-height:1.24;letter-spacing:-2px;
  text-shadow:0 10px 44px {b1};
}}
.wrap.sten .sub{{color:{ink2};}}

/* ── الشريط ── */
.wrap.bandwrap{{width:1080px;padding:0;text-align:right;}}
.bandtop{{
  display:flex;align-items:baseline;justify-content:space-between;
  padding:0 92px;margin-bottom:44px;
}}
.bandtop .eyebrow{{margin-bottom:0;}}
.bandnum{{
  font-size:96px;font-weight:900;color:{a};letter-spacing:-3px;
  direction:ltr;unicode-bidi:isolate;
}}
.bandblock{{
  background:{a};padding:58px 92px;
  box-shadow:0 26px 80px {g}40;
}}
.bandhead{{
  font-size:86px;font-weight:900;line-height:1.24;letter-spacing:-2.4px;
  color:{onacc};
}}
.sub.band{{padding:0 92px;margin-top:44px;color:{ink2};}}

/* ── دفتر البيانات ── */
.wrap.led{{text-align:right;width:880px;}}
.ledhead{{font-size:72px;font-weight:900;line-height:1.3;letter-spacing:-1.4px;}}
.ledtable{{margin-top:42px;border-top:2px solid {a}4d;}}
.ledrow{{
  display:flex;align-items:baseline;justify-content:space-between;
  padding:24px 4px;border-bottom:1px solid {a}2e;
}}
.ledval{{
  font-size:64px;font-weight:900;color:{a};letter-spacing:-2px;
  direction:ltr;unicode-bidi:isolate;
}}
.ledlab{{font-size:35px;font-weight:600;color:{ink2};}}
.wrap.led .body{{margin-top:34px;}}
/* جدول بثلاثة صفوف مع حاشية يتجاوز ارتفاع الكادر — شدّ المقاسات */
.wrap.led.tight .ledhead{{font-size:62px;}}
.wrap.led.tight .ledtable{{margin-top:32px;}}
.wrap.led.tight .ledrow{{padding:17px 4px;}}
.wrap.led.tight .ledval{{font-size:52px;}}
.wrap.led.tight .ledlab{{font-size:30px;}}
.wrap.led.tight .body{{margin-top:24px;font-size:34px;line-height:1.58;}}

/* ── اقتباس ── */
.wrap.quotewrap{{text-align:right;width:880px;}}
.qmark{{
  font-size:150px;font-weight:900;color:{a}59;line-height:.6;
  margin-bottom:34px;font-family:Georgia,serif;
}}
.quote{{font-size:60px;font-weight:700;line-height:1.5;}}
.qauthor{{margin-top:36px;font-size:36px;font-weight:600;color:{a};}}

/* ── دعوة ── */
.avatar{{
  width:310px;height:310px;border-radius:50%;margin:0 auto 22px;
  position:relative;overflow:hidden;
  background:radial-gradient(circle at 50% 34%, {a}3d 0%, {g}26 46%, {b1}00 74%);
  border:5px solid {a};
  box-shadow:0 0 0 13px {a}17, 0 22px 62px {g}66;
}}
.avatar img{{width:100%;height:100%;object-fit:cover;object-position:50% 34%;display:block;}}
.avaname{{
  font-size:32px;font-weight:700;color:{a};margin-bottom:34px;
  direction:ltr;unicode-bidi:isolate;letter-spacing:.4px;
}}
.ctaring{{
  width:120px;height:120px;border-radius:50%;margin:0 auto 42px;
  border:5px solid {a};box-shadow:0 0 0 14px {a}1a, 0 18px 54px {g}59;
}}

/* ── التذييل ── */
.foot{{
  position:absolute;left:80px;right:80px;bottom:62px;z-index:4;
  display:flex;justify-content:space-between;align-items:center;
  font-size:27px;font-weight:600;color:{footc};letter-spacing:.4px;
}}
.pager{{
  padding:7px 20px;border-radius:100px;background:{ink}14;
  border:1px solid {ink}1f;font-variant-numeric:tabular-nums;
  direction:ltr;unicode-bidi:isolate;
}}
.handle{{direction:ltr;unicode-bidi:isolate;}}
</style></head><body>
{frame}
{body}
<div class="foot">
  <span class="pager">{idx}/{total}</span>
  <span class="handle">{esc(handle) if handle else ""}</span>
</div>
</body></html>'''


async def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    spec = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
    out = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else "./out")
    out.mkdir(parents=True, exist_ok=True)

    tname = spec.get("theme", "indigo")
    if tname not in THEMES:
        print(f"⚠ ثيم غير معروف: {tname} — سيُستخدم indigo")
        tname = "indigo"
    t = THEMES[tname]
    handle = spec.get("handle", "")
    slides = spec.get("slides", [])

    global AVATAR_B64
    av = _find(ASSET_DIRS, "avatar.png")
    if av:
        AVATAR_B64 = base64.b64encode(av.read_bytes()).decode()

    from playwright.async_api import async_playwright
    launch_args = ["--force-color-profile=srgb", "--font-render-hinting=none"]
    made = []
    async with async_playwright() as p:
        try:
            browser = await p.chromium.launch(args=launch_args)
        except Exception:
            exe = None
            for pat in ("chromium-*/chrome-linux/chrome",
                        "chromium_headless_shell-*/chrome-linux/headless_shell",
                        "chromium/chrome"):
                found = sorted(pathlib.Path("/opt/pw-browsers").glob(pat))
                if found:
                    exe = str(found[-1])
                    break
            if not exe:
                raise
            browser = await p.chromium.launch(executable_path=exe, args=launch_args)

        page = await browser.new_page(viewport={"width": 1080, "height": 1080},
                                      device_scale_factor=1)
        for i, s in enumerate(slides, 1):
            html = page_html(s, t, handle, i, len(slides))
            tmp = out / f"_slide{i}.html"
            tmp.write_text(html, encoding="utf-8")
            await page.goto(tmp.resolve().as_uri())
            await page.wait_for_timeout(320)
            dest = out / f"slide_{i:02d}.png"
            await page.screenshot(path=str(dest))
            tmp.unlink()
            made.append(str(dest))
            print(f"✓ {dest}")
        await browser.close()

    print(f"\nتم إنشاء {len(made)} شريحة في {out} — ثيم {tname}")


if __name__ == "__main__":
    asyncio.run(main())
