#!/usr/bin/env python3
"""مولّد ريلز عربي — لغة «اللوحة الواحدة»: كاميرا تطير فوق مساحة متصلة.

الفرق الجوهري عن `render_reel.py`: لا توجد شرائح تتبدّل. كل المشاهد موضوعة
على لوحة واحدة كبيرة في إحداثيات عالمية، والكاميرا تنتقل بينها بحركة
مُبطّئة مع دولي بسيط (تراجع في منتصف الطيران ثم استقرار). الانتقال ليس
مؤثّراً يُركَّب فوق الصورة — الانتقال هو حركة الكاميرا نفسها، فيبدو
الفيديو مكاناً واحداً يُستكشف لا عرضاً تقديمياً يُقلَّب.

يترتّب على ذلك ثلاثة أشياء لا يمكن الحصول عليها في تصميم الشرائح:
  · عمق — طبقتان خلفيتان تتحرّكان بسرعة أقل من اللوحة (بارالاكس).
  · سياق — المشهد التالي مرئي باهتاً قبل الوصول إليه، فيُشدّ النظر إليه.
  · مسار — خط يربط محطات الرحلة ويُرسم تدريجياً، فيعرف المشاهد أين هو.

الاستخدام:
    python3 tools/render_reel2.py reel.json out.mp4
    python3 tools/render_reel2.py reel.json out.mp4 --stills 2,9,16,23

بنية JSON — نفس عقد المولّد السابق، فالمحتوى منقول بلا تعديل:
{
  "theme": "amber", "style": "flight", "handle": "@al_t506", "fps": 30,
  "scenes": [
    {"kind":"hook",   "kicker":"...", "title":"...", "sub":"...", "dur":3.8},
    {"kind":"step",   "n":1, "title":"...", "body":"...", "art":"device", "dur":5.2},
    {"kind":"prompt", "label":"...", "title":"...", "lines":["..."], "dur":6.2},
    {"kind":"cta",    "title":"...", "body":"...", "keyword":"أداة", "dur":4.6}
  ]
}
"""
import base64
import json
import math
import pathlib
import subprocess
import sys
import asyncio

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from render_v2 import (THEMES, ART, all_faces, esc, _find, ASSET_DIRS,  # noqa: E402
                       FONT_DIRS, font_face)
from reel_audio import write_bed  # noqa: E402

# خطّان مخصّصان للريلز، لا يستعملهما الكاروسيل، فتختلف نبرة الفيديو عن الشبكة:
#   Readex Pro — عناوين. رسم عربي حديث بعيون واسعة، يُقرأ من مسافة الهاتف.
#   IBM Plex Sans Arabic — متن. وجه نصّي حقيقي، أوضح من Tajawal في الفقرات.
# اسم العائلة فيه مسافة بينما اسم الملف بشرطة، فالبحث يحتاج «slug» صريحاً.
REEL_FONTS = (
    ("Readex Pro", "readex-pro", [400, 500, 600, 700]),
    ("Plex Arabic", "ibm-plex-sans-arabic", [400, 500, 600]),
)


def reel_faces():
    """@font-face لخطوط الريلز، مع الإبقاء على Cairo/Tajawal كشبكة أمان."""
    css = [all_faces()]
    for family, slug, weights in REEL_FONTS:
        for w in weights:
            for sub in ("arabic", "latin"):
                f = _find(FONT_DIRS, f"{slug}-{sub}-{w}-normal.woff2")
                if not f:
                    continue
                b64 = base64.b64encode(f.read_bytes()).decode()
                uni = ("U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,"
                       "U+0898-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,"
                       "U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC"
                       if sub == "arabic" else
                       "U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+2074,"
                       "U+20AC,U+2212")
                css.append(
                    f"@font-face{{font-family:'{family}';font-style:normal;"
                    f"font-weight:{w};font-display:block;"
                    f"src:url(data:font/woff2;base64,{b64}) format('woff2');"
                    f"unicode-range:{uni};}}")
    return "\n".join(css)

W, H = 1080, 1920
BOX = 880          # عرض صندوق المشهد في إحداثيات اللوحة
MOVE = 0.92        # مدة طيران الكاميرا بين محطتين بالثواني
INTRO = 0.95       # تراجع الكاميرا الافتتاحي عن العنوان، بالثواني

# كل أسلوب يغيّر شكل الرحلة نفسها: توزيع المحطات، الأرضية، والميل.
# `preflight` يختار أسلوباً مختلفاً عن آخر ريلز فلا تتكرر الحركة.
STYLES = {
    # رحلة متعرّجة قُطرية فوق شبكة نقاط · مسار مرسوم يربط المحطات
    "flight": {"bg": "dots",  "route": True,  "rot": 0.0, "sway": 640},
    # هبوط عمودي مستقيم فوق مسطرة أفقية · بلا مسار، الشعور شعور تمرير طويل
    "column": {"bg": "rules", "route": False, "rot": 0.0, "sway": 0},
    # رحلة واسعة مع ميل خفيف للوحة · الكادر نفسه يتنفّس مع كل محطة
    "tilt":   {"bg": "mesh",  "route": True,  "rot": 2.6, "sway": 780},
}

# انزياح أفقي لكل محطة كنسبة من `sway` — نمط غير دوري فلا يبدو التعرّج آلياً
SWAY = [0.0, 1.0, -0.55, 0.82, -0.34, 0.68, -0.9, 0.45]
ZOOM = {"hook": 1.02, "step": 1.0, "prompt": 1.06, "cta": 0.94}


def _chromium():
    for pat in ("chromium-*/chrome-linux/chrome",
                "chromium_headless_shell-*/chrome-linux/headless_shell",
                "chromium/chrome"):
        found = sorted(pathlib.Path("/opt/pw-browsers").glob(pat))
        if found:
            return str(found[-1])
    return None


def _ffmpeg():
    try:
        import imageio_ffmpeg
    except ImportError:
        subprocess.run([sys.executable, "-m", "pip", "install", "imageio-ffmpeg",
                        "--break-system-packages", "-q"], check=False)
        import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def words(text, cls="wm"):
    """يقسم النص كلمةً كلمة لكشفها من خلف قناع.

    التقسيم على المسافات فقط — تشكيل العربية لا يعبر المسافة، فتبقى
    حروف كل كلمة متصلة.
    """
    out = []
    for i, w in enumerate(str(text).split()):
        out.append(f'<span class="{cls}" style="--i:{i}">'
                   f'<span class="w">{esc(w)}</span></span>')
    return " ".join(out)


# ─────────────────────────── محطات الرحلة ───────────────────────────

def anchors(scenes, style):
    """يحسب موضع كل مشهد على اللوحة: (x, y, zoom, rotation)."""
    m = STYLES[style]
    pts = []
    y = 0.0
    for i, s in enumerate(scenes):
        x = m["sway"] * SWAY[i % len(SWAY)]
        z = ZOOM.get(s.get("kind", "step"), 1.0)
        # ميل تبادلي بمقدار غير ثابت — يمنع إحساس التأرجح المنتظم
        r = m["rot"] * (1 if i % 2 == 0 else -1) * (0.55 + 0.45 * ((i * 5) % 3) / 2)
        pts.append({"x": round(x, 1), "y": round(y, 1),
                    "z": round(z, 3), "r": round(r, 2)})
        # المسافة بين المحطتين أكبر من ارتفاع الكادر، فلا يزدحم مشهدان
        y += 2120 + (140 if i % 2 else 0)
    return pts


def route_svg(pts, t):
    """خط يربط المحطات، يُرسم تدريجياً مع تقدّم الرحلة."""
    if len(pts) < 2:
        return ""
    pad = 900
    xs = [p["x"] for p in pts]
    ys = [p["y"] for p in pts]
    x0, y0 = min(xs) - pad, min(ys) - pad
    w, h = (max(xs) - min(xs)) + pad * 2, (max(ys) - min(ys)) + pad * 2
    # نقاط المسار مزاحة إلى يسار الصندوق قليلاً حتى لا تمرّ خلف النص
    d = []
    for i, p in enumerate(pts):
        px, py = p["x"] - x0 - BOX * 0.62, p["y"] - y0
        d.append(("M" if i == 0 else "L") + f"{px:.0f} {py:.0f}")
    stops = "".join(
        f'<circle cx="{p["x"] - x0 - BOX * 0.62:.0f}" cy="{p["y"] - y0:.0f}" '
        f'r="13" fill="{t["accent"]}" opacity=".5"/>' for p in pts)
    return (f'<svg class="route" width="{w}" height="{h}" '
            f'style="left:{x0}px;top:{y0}px">'
            f'{stops}'
            f'<path id="routeline" d="{" ".join(d)}" fill="none" '
            f'stroke="{t["accent"]}" stroke-width="5" stroke-opacity=".42" '
            f'stroke-linecap="round" stroke-linejoin="round"/></svg>')


# ─────────────────────────── المشاهد ───────────────────────────

def scene_hook(s, t):
    kicker = s.get("kicker", "")
    k = (f'<div class="tag" data-anim="up" data-delay="0">{esc(kicker)}</div>'
         if kicker else "")
    sub = (f'<div class="sub" data-anim="up" data-delay=".95">{esc(s["sub"])}</div>'
           if s.get("sub") else "")
    return f'''{k}
        <h1 class="hook" data-anim="words" data-delay=".2">{words(s.get("title",""))}</h1>
        <div class="rule" data-anim="grow" data-delay=".98"></div>
        {sub}'''


def scene_step(s, t):
    art = ""
    if s.get("art") and ART.get(s["art"]):
        art = (f'<div class="art" data-anim="draw" data-delay=".62">'
               f'{ART[s["art"]](t["accent"], t["glow"])}</div>')
    return f'''<div class="tag" data-anim="up" data-delay="0">الخطوة {esc(s.get("n",""))}</div>
        <h2 class="title" data-anim="words" data-delay=".18">{words(s.get("title",""))}</h2>
        <p class="body" data-anim="up" data-delay=".66">{esc(s.get("body",""))}</p>
        {art}'''


def scene_prompt(s, t):
    lines = "".join(
        f'<div class="pline" data-anim="type" data-delay="{0.45 + i * 0.95:.2f}" '
        f'data-text="{esc(x)}"></div>' for i, x in enumerate(s.get("lines", []))
    )
    return f'''<div class="tag" data-anim="up" data-delay="0">{esc(s.get("label","الموجّه"))}</div>
        <h2 class="title sm" data-anim="words" data-delay=".16">{words(s.get("title",""))}</h2>
        <div class="card" data-anim="card" data-delay=".3">{lines}</div>
        <div class="hint" data-anim="up" data-delay="2.8">{esc(s.get("hint","التقط الشاشة — انسخه كما هو"))}</div>'''


def scene_cta(s, t, avatar_b64, handle):
    name = s.get("name") or handle
    head = (f'<div class="avatar" data-anim="pop" data-delay="0">'
            f'<img src="data:image/png;base64,{avatar_b64}"></div>'
            f'<div class="aname" data-anim="up" data-delay=".3">{esc(name)}</div>'
            if avatar_b64 else "")
    kw = s.get("keyword")
    key = (f'<div class="keyword" data-anim="pop" data-delay="1.0">'
           f'<span class="kwlab">اكتب في التعليقات</span>'
           f'<span class="kwword">{esc(kw)}</span></div>' if kw else "")
    return f'''{head}
        <h2 class="title mid" data-anim="words" data-delay=".45">{words(s.get("title",""))}</h2>
        <p class="body mid" data-anim="up" data-delay=".85">{esc(s.get("body",""))}</p>
        {key}'''


def landmark(s, i, pt):
    """رقم عملاق يقف بجانب المحطة كمَعلَم — يُقتطع طرفه خارج الكادر عمداً."""
    n = s.get("n")
    if not n:
        return ""
    # يقف يسار عمود النص فيُقتطع نصفه خارج الكادر — يقرأه العين كعلامة مكان
    x = pt["x"] - 790
    y = pt["y"] + 150
    return (f'<div class="lm" style="left:{x:.0f}px;top:{y:.0f}px" '
            f'data-scene="{i}">{esc(str(n).zfill(2))}</div>')


def bg_css(kind, t):
    a, g, b1 = t["accent"], t["glow"], t["bg1"]
    if kind == "rules":
        return (f'background:repeating-linear-gradient(0deg,transparent 0 128px,'
                f'{t["ink"]}12 128px 130px);')
    if kind == "mesh":
        return (f'background:repeating-linear-gradient(64deg,{a}12 0 1px,transparent 1px 108px),'
                f'repeating-linear-gradient(-64deg,{a}0d 0 1px,transparent 1px 108px);')
    return f'background:radial-gradient({a}2b 2.6px,transparent 3px) 0 0/76px 76px;'


def build_html(spec, t, avatar_b64):
    handle = spec.get("handle", "")
    scenes = spec.get("scenes", [])
    style = spec.get("style", "flight")
    if style not in STYLES:
        print(f"⚠ أسلوب غير معروف: {style} — المتاح: {' · '.join(STYLES)}")
        style = "flight"
    st = STYLES[style]

    ink, ink2, a, g = t["ink"], t["ink2"], t["accent"], t["glow"]
    b1, b2, onacc = t["bg1"], t["bg2"], t["onaccent"]

    pts = anchors(scenes, style)
    blocks, marks, meta = [], [], []
    start = 0.0
    for i, s in enumerate(scenes):
        kind = s.get("kind", "step")
        if kind == "hook":
            inner = scene_hook(s, t)
        elif kind == "prompt":
            inner = scene_prompt(s, t)
        elif kind == "cta":
            inner = scene_cta(s, t, avatar_b64, handle)
        else:
            inner = scene_step(s, t)
        dur = float(s.get("dur", 5.0))
        p = pts[i]
        cls = f"scene k-{kind}"
        blocks.append(
            f'<section class="{cls}" data-i="{i}" '
            f'style="left:{p["x"] - BOX / 2:.0f}px;top:{p["y"] - 640:.0f}px">'
            f'{inner}</section>')
        marks.append(landmark(s, i, p))
        meta.append({"start": round(start, 3), "dur": dur, "kind": kind})
        start += dur
    total = round(start, 3)

    # الثانية الأولى تحسم البقاء أو التمرير، فلا تُنفَق على لقطة عامة:
    # الكاميرا تبدأ قريبة من العنوان ثم تتراجع قليلاً إلى وضع الراحة.
    # النتيجة أن أول إطار هو الهوك نفسه، والحركة تُحسّ ولا تؤخّر القراءة.
    over = {"x": pts[0]["x"], "y": pts[0]["y"] - 46,
            "z": round(pts[0]["z"] * 1.16, 4), "r": round(pts[0]["r"] * 1.6, 2)}

    # غيوم لونية ثابتة في اللوحة الوسطى: تتحرّك أبطأ من النص فيظهر العمق،
    # وتُبدّل نبرة اللون من محطة لأخرى فلا تبقى الأرضية لوناً واحداً طوال الفيديو
    blobs = "".join(
        f'<div class="blob {"b2" if i % 2 else "bg"}" '
        f'style="left:{pts[i]["x"] - 780 + (300 if i % 2 else -340):.0f}px;'
        f'top:{pts[i]["y"] - 640 + (i % 3) * 180:.0f}px"></div>'
        for i in range(len(pts)))

    return f'''<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<style>
{reel_faces()}
*{{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}}
html,body{{width:{W}px;height:{H}px;overflow:hidden;background:{b1};}}
body{{font-family:'Readex Pro','Cairo',sans-serif;color:{ink};position:relative;}}

/* الطبقات الثلاث تتحرّك بنسب مختلفة من إزاحة الكاميرا فيظهر العمق */
.layer{{position:absolute;inset:0;transform-origin:0 0;will-change:transform;}}
.far{{z-index:1;}}
.far .plane{{position:absolute;left:-9000px;top:-9000px;width:22000px;height:26000px;
  opacity:.55;{bg_css(st["bg"], t)}}}
.mid{{z-index:2;}}
.blob{{position:absolute;width:1560px;height:1560px;border-radius:50%;filter:blur(80px);}}
.blob.bg{{background:radial-gradient(circle,{g}3d,transparent 66%);}}
.blob.b2{{background:radial-gradient(circle,{b2}b3,transparent 68%);}}
.world{{z-index:3;}}
.vign{{position:absolute;inset:0;z-index:6;pointer-events:none;
  background:radial-gradient(126% 66% at 50% 46%,transparent 52%,{b1}8c 100%);}}
.grain{{position:absolute;inset:0;z-index:7;opacity:.05;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");}}

.route{{position:absolute;z-index:0;}}
.lm{{position:absolute;z-index:1;font-family:'Plex Arabic',sans-serif;
  font-size:560px;font-weight:600;line-height:.78;
  color:transparent;-webkit-text-stroke:5px {a}4d;letter-spacing:-10px;
  direction:ltr;unicode-bidi:isolate;pointer-events:none;}}

.scene{{position:absolute;width:{BOX}px;min-height:1280px;z-index:2;
  display:flex;flex-direction:column;justify-content:center;text-align:right;}}
.scene.k-cta{{text-align:center;align-items:center;}}

/* السلّم الطباعي: عنوان عريض قصير، ومتن بوجه نصّي أصغر وأوسع تباعداً.
   الفارق بين الحجمين كبير عمداً — على الهاتف يُقرأ العنوان أولاً بلا منافس. */
.tag{{font-size:30px;font-weight:600;color:{a};letter-spacing:4px;
  margin-bottom:26px;}}
.hook{{font-size:100px;font-weight:700;line-height:1.18;letter-spacing:-2px;}}
.title{{font-size:78px;font-weight:700;line-height:1.26;letter-spacing:-1.5px;}}
.title.sm{{font-size:66px;}}
.rule{{height:16px;width:0;background:{a};border-radius:3px;margin:48px 0 0 auto;}}
.sub{{margin-top:40px;font-family:'Plex Arabic','Tajawal',sans-serif;
  font-size:46px;font-weight:400;color:{ink2};line-height:1.62;}}
.body{{margin-top:38px;font-family:'Plex Arabic','Tajawal',sans-serif;
  font-size:45px;font-weight:400;line-height:1.82;color:{ink2};}}
.wm{{display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:.08em;}}
.wm .w{{display:inline-block;transform:translateY(105%);}}

.art{{margin-top:52px;width:270px;height:270px;opacity:0;}}
.art svg{{width:100%;height:100%;display:block;}}

/* بطاقة الموجّه جسم مادي على اللوحة: لون صريح، ميل خفيف، وظل يفصلها */
.card{{margin-top:44px;padding:52px 46px;border-radius:34px;background:{a};
  transform:rotate(-1.4deg) scale(.94);opacity:0;
  box-shadow:0 46px 110px {b1}66,0 0 0 1px {a};}}
.pline{{font-family:'Plex Arabic','Tajawal',sans-serif;font-size:43px;font-weight:500;
  line-height:1.62;color:{onacc};margin-bottom:18px;min-height:1.62em;}}
.pline:last-child{{margin-bottom:0;}}
.caret{{display:inline-block;width:4px;height:.95em;background:{onacc};
  vertical-align:-.12em;margin-right:6px;}}
.hint{{margin-top:34px;font-family:'Plex Arabic','Tajawal',sans-serif;
  font-size:32px;font-weight:500;color:{ink2};}}

.avatar{{width:290px;height:290px;border-radius:50%;overflow:hidden;flex:none;
  border:6px solid {a};box-shadow:0 0 0 16px {a}17,0 30px 80px {g}59;}}
.avatar img{{width:100%;height:100%;object-fit:cover;object-position:50% 34%;}}
.aname{{margin-top:24px;font-size:40px;font-weight:600;color:{a};
  letter-spacing:.5px;direction:ltr;unicode-bidi:isolate;}}
.title.mid{{margin-top:40px;}}
.body.mid{{max-width:760px;}}
.keyword{{margin-top:50px;display:inline-flex;flex-direction:column;align-items:center;
  flex:none;gap:14px;padding:32px 60px;border-radius:34px;background:{a};
  box-shadow:0 26px 70px {g}59;}}
.kwlab{{font-family:'Plex Arabic','Tajawal',sans-serif;font-size:31px;font-weight:500;
  color:{onacc}cc;letter-spacing:2px;}}
.kwword{{font-size:88px;font-weight:700;color:{onacc};line-height:1.12;
  letter-spacing:-1px;}}

.hdl{{position:absolute;top:116px;right:150px;z-index:8;font-size:31px;
  font-weight:500;letter-spacing:1px;color:{ink}9e;
  direction:ltr;unicode-bidi:isolate;}}
.prog{{position:absolute;top:196px;left:150px;right:150px;height:3px;z-index:8;
  background:{ink}1a;border-radius:99px;overflow:hidden;}}
.prog i{{display:block;height:100%;width:0;background:{a};}}
</style></head><body>
<div class="layer far" id="far"><div class="plane"></div></div>
<div class="layer mid" id="mid">{blobs}</div>
<div class="layer world" id="world">
  {route_svg(pts, t) if st["route"] else ""}
  {"".join(marks)}
  {"".join(blocks)}
</div>
<div class="vign"></div><div class="grain"></div>
<div class="hdl">{esc(handle)}</div>
<div class="prog"><i id="prog"></i></div>
<script>
const META = {json.dumps(meta)};
const ANCH = {json.dumps(pts)};
const TOTAL = {total};
const MOVE = {MOVE};
const INTRO = {INTRO};
const OVER = {json.dumps(over)};
const LEAD = 0.46;
const scenes = [...document.querySelectorAll('.scene')];
const lms    = [...document.querySelectorAll('.lm')];
const world  = document.getElementById('world');
const far    = document.getElementById('far');
const mid    = document.getElementById('mid');
const prog   = document.getElementById('prog');
const rline  = document.getElementById('routeline');

document.querySelectorAll('.art svg *').forEach(el => {{
  if (typeof el.getTotalLength === 'function') {{
    try {{ const L = el.getTotalLength();
      if (L > 0) {{ el.dataset.len = L; el.style.strokeDasharray = L; }} }} catch (e) {{}}
  }}
}});
if (rline) {{
  const L = rline.getTotalLength();
  rline.dataset.len = L; rline.style.strokeDasharray = L;
}}

const clamp = (v,a,b) => Math.min(b, Math.max(a, v));
const outCubic = p => 1 - Math.pow(1 - p, 3);
const outExpo  = p => p >= 1 ? 1 : 1 - Math.pow(2, -9 * p);
// تسارع ثم تباطؤ — منحنى طيران الكاميرا، لا يبدأ ولا ينتهي بصدمة
const inOut = p => p < 0.5 ? 4*p*p*p : 1 - Math.pow(-2*p + 2, 3) / 2;

function apply(el, local) {{
  const kind = el.dataset.anim;
  const d = parseFloat(el.dataset.delay || 0);
  if (kind === 'words') {{
    el.querySelectorAll('.wm').forEach((wm, i) => {{
      const p = clamp((local - d - i * 0.055) / 0.62, 0, 1);
      wm.querySelector('.w').style.transform = `translateY(${{(1 - outExpo(p)) * 105}}%)`;
    }});
    return;
  }}
  const p = clamp((local - d) / 0.7, 0, 1);
  if (kind === 'up') {{
    el.style.opacity = p;
    el.style.transform = `translateY(${{(1 - outCubic(p)) * 40}}px)`;
  }} else if (kind === 'grow') {{
    el.style.width = (outExpo(p) * 320) + 'px';
  }} else if (kind === 'pop') {{
    el.style.opacity = clamp(p * 1.7, 0, 1);
    el.style.transform = `scale(${{0.74 + outExpo(p) * 0.26}})`;
  }} else if (kind === 'card') {{
    el.style.opacity = clamp(p * 1.6, 0, 1);
    el.style.transform = `rotate(-1.4deg) scale(${{0.94 + outExpo(p) * 0.06}})`;
  }} else if (kind === 'draw') {{
    el.style.opacity = clamp(p * 2.2, 0, 1);
    el.querySelectorAll('svg *').forEach(s => {{
      if (s.dataset.len) s.style.strokeDashoffset = (1 - outCubic(p)) * s.dataset.len;
    }});
  }} else if (kind === 'type') {{
    const txt = el.dataset.text || '';
    const q = clamp((local - d) / (0.05 + txt.length * 0.028), 0, 1);
    el.textContent = txt.slice(0, Math.floor(q * txt.length));
    if (q > 0 && q < 1) {{
      const c = document.createElement('span'); c.className = 'caret'; el.appendChild(c);
    }}
  }}
}}

// وضع المحطة في لحظة t مع الانجراف البطيء أثناء الوقوف عندها.
// الانجراف يبدأ من صفر عند الوصول، فيبقى مسار الكاميرا متصلاً بلا قفزة.
function anchorAt(i, t) {{
  const m = META[i], p = ANCH[i];
  const k = m.dur > 0 ? clamp((t - m.start) / m.dur, 0, 1) : 0;
  return {{x: p.x, y: p.y + k * 42, z: p.z * (1 + 0.024 * k), r: p.r}};
}}

function camera(t) {{
  let i = 0;
  META.forEach((m, k) => {{ if (t >= m.start) i = k; }});
  let c = anchorAt(i, t);
  if (t < INTRO) {{
    const q = outCubic(clamp(t / INTRO, 0, 1));
    c = {{x: OVER.x + (c.x - OVER.x) * q, y: OVER.y + (c.y - OVER.y) * q,
          z: OVER.z + (c.z - OVER.z) * q, r: OVER.r + (c.r - OVER.r) * q}};
    return c;
  }}
  if (i + 1 < ANCH.length) {{
    const s = META[i + 1].start;
    if (t > s - MOVE) {{
      const q = inOut(clamp((t - (s - MOVE)) / MOVE, 0, 1));
      const n = anchorAt(i + 1, t);
      c = {{x: c.x + (n.x - c.x) * q, y: c.y + (n.y - c.y) * q,
            z: c.z + (n.z - c.z) * q, r: c.r + (n.r - c.r) * q}};
      // دولي: تراجع طفيف في منتصف الطيران يجعل الحركة سينمائية لا انزلاقاً
      c.z *= 1 - 0.11 * Math.sin(Math.PI * q);
    }}
  }}
  return c;
}}

function place(el, c, k) {{
  el.style.transform =
    `translate(${{{W} / 2}}px, ${{{H} / 2}}px) rotate(${{c.r * k}}deg) ` +
    `scale(${{1 + (c.z - 1) * k}}) translate(${{-c.x * k}}px, ${{-c.y * k}}px)`;
}}

window.setT = function (t) {{
  t = clamp(t, 0, TOTAL);
  const c = camera(t);
  place(world, c, 1);
  place(mid, c, 0.72);
  place(far, c, 0.42);
  prog.style.width = (t / TOTAL * 100) + '%';
  if (rline) rline.style.strokeDashoffset =
    (1 - clamp(t / TOTAL * 1.06, 0, 1)) * rline.dataset.len;

  let active = 0;
  META.forEach((m, k) => {{ if (t >= m.start) active = k; }});

  scenes.forEach((sc, i) => {{
    const p = ANCH[i];
    // الشفافية تتبع بُعد المشهد عن الكاميرا: المشهد التالي يظهر باهتاً
    // قبل الوصول إليه ثم يتّضح، والسابق ينسحب — عمق ميداني بلا تمويه
    const dx = p.x - c.x, dy = p.y - c.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    sc.style.opacity = clamp(1.3 - dist / 1250, 0.08, 1).toFixed(3);
    // الكشف يبدأ قبل وصول الكاميرا بقليل، فيصل النظر والنص قد بدأ يتشكّل
    // بدل أن يجد كادراً فارغاً ثم يبدأ كل شيء من الصفر
    const local = t - META[i].start + LEAD;
    sc.querySelectorAll('[data-anim]').forEach(el => apply(el, local));
  }});
  lms.forEach(lm => {{
    const i = +lm.dataset.scene, p = ANCH[i];
    const dist = Math.hypot(p.x - c.x, p.y - c.y);
    lm.style.opacity = clamp(1.2 - dist / 1500, 0, 1).toFixed(3);
  }});
}};
window.setT(0);
window.REEL_TOTAL = TOTAL;
</script></body></html>'''


async def run(spec_path, out_path, stills=None):
    spec = json.loads(pathlib.Path(spec_path).read_text(encoding="utf-8"))
    tname = spec.get("theme", "indigo")
    if tname not in THEMES:
        print(f"⚠ ثيم غير معروف: {tname} — سيُستخدم indigo")
        tname = "indigo"
    t = THEMES[tname]
    fps = int(spec.get("fps", 30))

    avatar_b64 = ""
    av = _find(ASSET_DIRS, "avatar.png")
    if av:
        avatar_b64 = base64.b64encode(av.read_bytes()).decode()

    out = pathlib.Path(out_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = out.parent / "_reel2.html"
    tmp.write_text(build_html(spec, t, avatar_b64), encoding="utf-8")

    from playwright.async_api import async_playwright
    args = ["--force-color-profile=srgb", "--font-render-hinting=none",
            "--hide-scrollbars"]
    async with async_playwright() as p:
        try:
            browser = await p.chromium.launch(args=args)
        except Exception:
            exe = _chromium()
            if not exe:
                raise
            browser = await p.chromium.launch(executable_path=exe, args=args)
        page = await browser.new_page(viewport={"width": W, "height": H},
                                      device_scale_factor=1)
        await page.goto(tmp.resolve().as_uri())
        await page.wait_for_timeout(420)
        total = await page.evaluate("window.REEL_TOTAL")

        if stills:
            for s in stills:
                await page.evaluate(f"window.setT({s})")
                await page.wait_for_timeout(60)
                dest = out.parent / f"s2_{str(s).replace('.', '_')}.png"
                await page.screenshot(path=str(dest))
                print(f"✓ {dest}")
            await browser.close()
            tmp.unlink()
            return

        n = int(total * fps)
        bed = out.parent / "_bed.wav"
        seed = spec.get("audio_seed") or json.dumps(
            [s.get("title", "") for s in spec.get("scenes", [])], ensure_ascii=False)
        info = write_bed(bed, total, seed=seed)
        print(f"موسيقى هادئة: {info['scale']} · {info['bpm']} نبضة/د · جذر {info['root']}")

        cmd = [
            _ffmpeg(), "-y", "-loglevel", "error",
            "-f", "image2pipe", "-framerate", str(fps), "-i", "-",
            "-i", str(bed),
            # حد أدنى لمعدل البت: التصاميم المسطّحة تُضغط لأقل من 400 كيلوبت/ث
            # فيرفض إنستقرام تحويلها أو يطيله
            "-c:v", "libx264", "-preset", "medium",
            "-b:v", "6M", "-minrate", "4M", "-maxrate", "8M", "-bufsize", "12M",
            "-pix_fmt", "yuv420p", "-r", str(fps),
            "-c:a", "aac", "-b:a", "128k", "-shortest",
            "-movflags", "+faststart", str(out),
        ]
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
        print(f"ترميز {n} إطاراً ({total:.1f}ث عند {fps} إطار/ث)…")
        for i in range(n):
            await page.evaluate(f"window.setT({i / fps})")
            proc.stdin.write(await page.screenshot(type="jpeg", quality=94))
            if i and i % 120 == 0:
                print(f"  … {i}/{n}")
        proc.stdin.close()
        err = proc.stderr.read().decode()
        proc.wait()
        await browser.close()
        tmp.unlink()
        bed.unlink(missing_ok=True)
        if proc.returncode != 0:
            print(err)
            sys.exit(1)
        print(f"\n✓ {out} — {total:.1f}ث · "
              f"{out.stat().st_size / 1e6:.1f} ميغابايت · ثيم {tname} · أسلوب "
              f"{spec.get('style','flight')}")


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    stills = None
    if "--stills" in sys.argv:
        stills = [float(x) for x in sys.argv[sys.argv.index("--stills") + 1].split(",")]
    asyncio.run(run(sys.argv[1], sys.argv[2], stills))


if __name__ == "__main__":
    main()
