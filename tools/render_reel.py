#!/usr/bin/env python3
"""مولّد ريلز إنستقرام عربي — فيديو رأسي 1080×1920 بلغة حركة خاصة به.

يستعير الثيمات والرسوم من `render_v2.py` ليبقى الحساب من هوية واحدة، لكن
لغته البصرية مختلفة عمداً عن الكاروسيل: أرضية شبه مسطّحة بدل التوهج، انتقال
بلوح لوني يمسح الكادر، نص يُكشف كلمة كلمة من خلف قناع، ومشهد موجّه يُكتب
أمام المشاهد. الكاروسيل يُقرأ، والريلز يُشاهد.

الحركة مبنية على خط زمني صريح: تُستدعى `setT(seconds)` لكل إطار ثم يُلتقط،
فالنتيجة محسوبة لا مرهونة بسرعة الجهاز — نفس الملف يعطي نفس الفيديو.

الاستخدام:
    python3 tools/render_reel.py reel.json out.mp4
    python3 tools/render_reel.py reel.json out.mp4 --stills 1.5,7,13,19

`--stills` يلتقط لقطات عند ثوانٍ محددة بدل ترميز الفيديو — استخدمه أثناء ضبط
التصميم، فهو أسرع بعشرات المرات.

بنية JSON:
{
  "theme": "emerald",
  "handle": "@al_t506",
  "fps": 30,
  "scenes": [
    {"kind":"hook",   "kicker":"دليل عملي", "title":"...", "sub":"...", "dur":3.8},
    {"kind":"step",   "n":1, "title":"...", "body":"...", "art":"chart", "dur":5.4},
    {"kind":"prompt", "label":"الموجّه", "title":"...", "lines":["...","..."], "dur":6.5},
    {"kind":"cta",    "title":"...", "body":"...", "name":"@al_t506", "dur":4.2}
  ]
}

مشهد `prompt` يظهر بألوان معكوسة — بطاقة يلتقطها المشاهد ويحفظها.
"""
import base64
import json
import pathlib
import subprocess
import sys
import asyncio

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from render_v2 import THEMES, ART, all_faces, esc, _find, ASSET_DIRS  # noqa: E402
from reel_audio import write_bed  # noqa: E402

W, H = 1080, 1920
WIPE = 0.42          # نصف مدة لوح الانتقال بالثواني


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
    """يقسم النص إلى كلمات لكشفها تباعاً من خلف قناع.

    التقسيم على المسافات فقط — تشكيل العربية لا يعبر المسافة، فالحروف
    تبقى متصلة داخل كل كلمة.
    """
    out = []
    for i, w in enumerate(str(text).split()):
        out.append(f'<span class="{cls}" style="--i:{i}">'
                   f'<span class="w">{esc(w)}</span></span>')
    return " ".join(out)


# ─────────────────────────── المشاهد ───────────────────────────

def scene_hook(s, t):
    kicker = s.get("kicker", "")
    k = (f'<div class="eyebrow" data-anim="up" data-delay="0">{esc(kicker)}</div>'
         if kicker else "")
    sub = (f'<div class="sub" data-anim="up" data-delay=".85">{esc(s["sub"])}</div>'
           if s.get("sub") else "")
    return f'''{k}
        <h1 class="hook" data-anim="words" data-delay=".18">{words(s.get("title",""))}</h1>
        <div class="rule" data-anim="grow" data-delay=".9"></div>
        {sub}'''


def scene_step(s, t):
    n = s.get("n", "")
    art = ""
    if s.get("art") and ART.get(s["art"]):
        art = (f'<div class="art" data-anim="draw" data-delay=".55">'
               f'{ART[s["art"]](t["accent"], t["glow"])}</div>')
    return f'''<div class="eyebrow" data-anim="up" data-delay="0">الخطوة {esc(n)}</div>
        <h2 class="title" data-anim="words" data-delay=".16">{words(s.get("title",""))}</h2>
        <p class="body" data-anim="up" data-delay=".62">{esc(s.get("body",""))}</p>
        {art}'''


def scene_prompt(s, t):
    lines = "".join(
        f'<div class="pline" data-anim="type" data-delay="{0.35 + i * 0.9:.2f}" '
        f'data-text="{esc(x)}"></div>' for i, x in enumerate(s.get("lines", []))
    )
    return f'''<div class="plabel" data-anim="up" data-delay="0">{esc(s.get("label","الموجّه"))}</div>
        <h2 class="title inv" data-anim="words" data-delay=".14">{words(s.get("title",""))}</h2>
        <div class="promptcard" data-anim="card" data-delay=".28">{lines}</div>
        <div class="phint" data-anim="up" data-delay="2.6">{esc(s.get("hint", "التقط الشاشة — الموجّه جاهز للنسخ"))}</div>'''


def scene_cta(s, t, avatar_b64, handle):
    name = s.get("name") or handle
    head = (f'<div class="avatar" data-anim="pop" data-delay="0">'
            f'<img src="data:image/png;base64,{avatar_b64}"></div>'
            f'<div class="aname" data-anim="up" data-delay=".28">{esc(name)}</div>'
            if avatar_b64 else "")
    return f'''{head}
        <h2 class="title mid" data-anim="words" data-delay=".42">{words(s.get("title",""))}</h2>
        <p class="body mid" data-anim="up" data-delay=".8">{esc(s.get("body",""))}</p>'''

# ─────────────────────────── أساليب الحركة ───────────────────────────
# كل أسلوب يغيّر البنية لا اللون: الأرضية، عنصر الواجهة، وطريقة الانتقال.
# preflight يختار أسلوباً مختلفاً عن آخر ريلز، فلا يتكرر الشكل.

STYLES = {
    # عمود جانبي يتتبّع المراحل · انتقال بلوح يمسح الكادر صعوداً
    "spine":  {"chrome": "spine",   "trans": "wipe"},
    # بطاقة عائمة وعدّاد علوي · انتقال بدفع أفقي
    "panel":  {"chrome": "counter", "trans": "push"},
    # كتل لونية كاملة تتناوب · قطع خاطف بلا انتقال ناعم
    "poster": {"chrome": "bare",    "trans": "flash"},
    # إطار محدّد بزوايا · انتقال بدائرة تتّسع
    "frame":  {"chrome": "frame",   "trans": "iris"},
}


def style_bg(style, t):
    a, g, b1, b2 = t["accent"], t["glow"], t["bg1"], t["bg2"]
    if style == "panel":
        return f'''.field{{position:absolute;inset:-20%;z-index:1;
  background:radial-gradient({a}26 2px, transparent 2.4px) 0 0/58px 58px;opacity:.75;}}
.beam{{position:absolute;z-index:1;width:1300px;height:1300px;left:-260px;top:220px;
  border-radius:50%;background:radial-gradient(circle,{g}33,transparent 65%);
  filter:blur(60px);}}'''
    if style == "poster":
        return f'''.field{{position:absolute;inset:0;z-index:1;opacity:.5;
  background:repeating-linear-gradient(0deg,{b1}00 0 3px,{b1}59 3px 6px);}}
.beam{{position:absolute;z-index:1;width:0;height:0;}}'''
    if style == "frame":
        return f'''.field{{position:absolute;inset:-40%;z-index:1;opacity:.55;
  background:repeating-radial-gradient(circle at 50% 62%,
    transparent 0 118px,{a}1a 118px 120px);}}
.beam{{position:absolute;z-index:1;inset:0;
  box-shadow:inset 0 0 320px 120px {b1};}}'''
    # spine
    return f'''.field{{position:absolute;inset:-30%;z-index:1;opacity:.5;
  background:repeating-linear-gradient(74deg,{a}0f 0 1px,transparent 1px 96px);}}
.beam{{position:absolute;z-index:1;width:1500px;height:620px;left:-320px;top:280px;
  background:linear-gradient(90deg,transparent,{g}2e,transparent);
  filter:blur(90px);transform:rotate(-18deg);}}'''


def style_chrome_css(chrome, t):
    ink, a, b1, onacc = t["ink"], t["accent"], t["bg1"], t["onaccent"]
    if chrome == "counter":
        return f'''.counter{{position:absolute;top:170px;right:110px;z-index:7;
  font-size:56px;font-weight:900;color:{ink}59;direction:ltr;unicode-bidi:isolate;
  letter-spacing:2px;}}
.counter b{{color:{a};}}
.topbar{{position:absolute;top:250px;left:110px;right:110px;height:4px;z-index:7;
  background:{ink}1a;border-radius:99px;overflow:hidden;}}
.topbar i{{display:block;height:100%;width:0;background:{a};}}'''
    if chrome == "frame":
        return f'''.fr{{position:absolute;inset:206px 110px 380px;z-index:7;
  border:2px solid {a}47;border-radius:14px;pointer-events:none;}}
.fr::before,.fr::after{{content:'';position:absolute;width:56px;height:56px;
  border:5px solid {a};}}
.fr::before{{top:-3px;right:-3px;border-left:0;border-bottom:0;border-radius:0 14px 0 0;}}
.fr::after{{bottom:-3px;left:-3px;border-right:0;border-top:0;border-radius:0 0 0 14px;}}
.fdots{{position:absolute;bottom:410px;right:132px;z-index:8;display:flex;gap:12px;}}
.fdot{{width:12px;height:12px;border-radius:50%;background:{ink}2e;}}
.fdot.on{{background:{a};}}'''
    if chrome == "bare":
        return ".spine,.marks{{display:none;}}"
    # spine
    return f'''.spine{{position:absolute;left:56px;top:300px;bottom:430px;width:4px;z-index:6;
  background:{ink}1a;border-radius:99px;overflow:hidden;}}
.spine i{{display:block;width:100%;height:0;background:{a};}}
.marks{{position:absolute;left:44px;top:300px;bottom:430px;width:28px;z-index:7;
  display:flex;flex-direction:column;justify-content:space-between;align-items:center;}}
.mark{{width:14px;height:14px;border-radius:50%;background:{b1};
  border:3px solid {ink}2e;}}
.mark.on{{border-color:{a};background:{a};}}'''


def style_chrome_html(chrome, n):
    if chrome == "counter":
        return ('<div class="counter"><b id="cnum">01</b>/'
                + f'{n:02d}</div><div class="topbar"><i id="topbar"></i></div>')
    if chrome == "frame":
        dots = "".join(f'<span class="fdot" data-i="{i}"></span>' for i in range(n))
        return f'<div class="fr"></div><div class="fdots">{dots}</div>'
    if chrome == "bare":
        return ""
    marks = "".join(f'<span class="mark" data-i="{i}"></span>' for i in range(n))
    return f'<div class="spine"><i id="spine"></i></div><div class="marks">{marks}</div>'


def build_html(spec, t, avatar_b64):
    handle = spec.get("handle", "")
    scenes = spec.get("scenes", [])
    style = spec.get("style", "spine")
    if style not in STYLES:
        print(f"⚠ أسلوب غير معروف: {style} — المتاح: {' · '.join(STYLES)}")
        style = "spine"
    chrome, trans = STYLES[style]["chrome"], STYLES[style]["trans"]

    ink, ink2, a, g = t["ink"], t["ink2"], t["accent"], t["glow"]
    b1, b2, onacc = t["bg1"], t["bg2"], t["onaccent"]

    blocks, meta = [], []
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
        cls = "scene"
        # مشهد الموجّه معكوس دائماً؛ وفي أسلوب الملصق تتناوب الكتل اللونية
        if kind == "prompt" or (style == "poster" and i % 2 == 1):
            cls += " inverted"
        if kind == "cta":
            cls += " middle"
        blocks.append(f'<section class="{cls}" data-i="{i}">{inner}</section>')
        meta.append({"start": round(start, 3), "dur": dur, "kind": kind,
                     "inv": "inverted" in cls})
        start += dur

    total = round(start, 3)
    pad = ("300px 150px 430px 110px" if chrome == "spine"
           else "330px 150px 430px 110px" if chrome == "counter"
           else "300px 180px 470px 150px" if chrome == "frame"
           else "300px 150px 430px 110px")

    return f'''<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<style>
{all_faces()}
*{{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}}
html,body{{width:{W}px;height:{H}px;overflow:hidden;background:{b1};}}
body{{font-family:'Cairo','Tajawal',sans-serif;color:{ink};position:relative;}}

.ground{{position:absolute;inset:0;z-index:0;background:{b1};}}
{style_bg(style, t)}
.grain{{position:absolute;inset:0;z-index:2;opacity:.05;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");}}

/* الحشو يتجنّب واجهة إنستقرام: الأزرار يميناً والكابشن أسفل */
.scene{{position:absolute;inset:0;z-index:4;padding:{pad};
  display:flex;flex-direction:column;justify-content:center;
  text-align:right;opacity:0;}}
.scene.middle{{text-align:center;align-items:center;}}
.scene.inverted{{background:{a};color:{onacc};}}
.scene.inverted .body,.scene.inverted .sub{{color:{onacc}c7;}}
.scene.inverted .title,.scene.inverted .hook{{color:{onacc};}}

{style_chrome_css(chrome, t)}
.hdl{{position:absolute;top:118px;right:150px;z-index:6;
  font-size:34px;font-weight:700;color:{ink}9e;direction:ltr;unicode-bidi:isolate;}}

/* الواجهة تعلو المشهد؛ فوق الأرضية المعكوسة تصير بلون الثيم فتختفي */
body.inv .hdl{{color:{onacc}ad;}}
body.inv .counter{{color:{onacc}66;}}
body.inv .counter b{{color:{onacc};}}
body.inv .topbar{{background:{onacc}33;}}
body.inv .topbar i{{background:{onacc};}}
body.inv .spine{{background:{onacc}33;}}
body.inv .spine i{{background:{onacc};}}
body.inv .mark{{background:transparent;border-color:{onacc}66;}}
body.inv .mark.on{{background:{onacc};border-color:{onacc};}}
body.inv .fr{{border-color:{onacc}59;}}
body.inv .fr::before,body.inv .fr::after{{border-color:{onacc};}}
body.inv .fdot{{background:{onacc}4d;}}
body.inv .fdot.on{{background:{onacc};}}

/* طبقة الانتقال */
.wipe{{position:absolute;inset:0;z-index:20;background:{a};transform:translateY(100%);}}
.flash{{position:absolute;inset:0;z-index:20;background:{a};opacity:0;}}

.eyebrow{{font-size:34px;font-weight:800;color:{a};letter-spacing:3px;margin-bottom:32px;}}
.scene.inverted .eyebrow,.plabel{{color:{onacc}b3;}}
.hook{{font-size:126px;font-weight:900;line-height:1.1;letter-spacing:-5px;}}
.title{{font-size:92px;font-weight:900;line-height:1.2;letter-spacing:-3px;}}
.title.inv{{color:{onacc};font-size:78px;}}
.rule{{height:20px;width:0;background:{a};border-radius:3px;margin:56px 0 0 auto;}}
.scene.inverted .rule{{background:{onacc};}}
.sub{{margin-top:48px;font-size:52px;font-weight:500;color:{ink2};line-height:1.5;}}
.body{{margin-top:44px;font-family:'Tajawal','Cairo',sans-serif;
  font-size:52px;font-weight:400;line-height:1.7;color:{ink2};}}

.wm{{display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:.08em;}}
.wm .w{{display:inline-block;transform:translateY(105%);}}

.art{{position:absolute;left:118px;bottom:452px;width:290px;height:290px;opacity:0;}}
/* على الأرضية المعكوسة يختفي الرسم بلون الثيم — اقلبه إلى لون النص */
.scene.inverted .art svg{{stroke:{onacc};}}
.scene.inverted .art svg [fill]{{fill:{onacc};}}
.art svg{{width:100%;height:100%;display:block;}}

.plabel{{font-size:34px;font-weight:800;letter-spacing:3px;margin-bottom:26px;}}
.promptcard{{margin-top:46px;padding:52px 44px;border-radius:30px;
  background:{onacc};border:3px solid {onacc};transform:scale(.94);opacity:0;
  box-shadow:0 40px 90px {b1}40;}}
.pline{{font-family:'Tajawal','Cairo',sans-serif;font-size:46px;line-height:1.55;
  color:{a};margin-bottom:16px;min-height:1.55em;}}
.pline:last-child{{margin-bottom:0;}}
.caret{{display:inline-block;width:4px;height:.95em;background:{a};
  vertical-align:-.12em;margin-right:6px;}}
.phint{{margin-top:38px;font-size:34px;font-weight:600;color:{onacc}c7;}}

.avatar{{width:300px;height:300px;border-radius:50%;overflow:hidden;
  border:6px solid {a};box-shadow:0 0 0 16px {a}17,0 30px 80px {g}59;}}
.avatar img{{width:100%;height:100%;object-fit:cover;object-position:50% 34%;}}
.aname{{margin-top:26px;font-size:44px;font-weight:700;color:{a};
  direction:ltr;unicode-bidi:isolate;}}
.title.mid{{margin-top:44px;}}
.body.mid{{max-width:760px;}}
</style></head><body>
<div class="ground"></div><div class="field" id="field"></div>
<div class="beam" id="beam"></div><div class="grain"></div>
{style_chrome_html(chrome, len(scenes))}
<div class="hdl">{esc(handle)}</div>
{"".join(blocks)}
<div class="wipe" id="wipe"></div><div class="flash" id="flash"></div>
<script>
const META = {json.dumps(meta)};
const TOTAL = {total};
const HALF = {WIPE};
const TRANS = "{trans}";
const CHROME = "{chrome}";
const scenes = [...document.querySelectorAll('.scene')];
const marks  = [...document.querySelectorAll('.mark, .fdot')];
const spine  = document.getElementById('spine');
const topbar = document.getElementById('topbar');
const cnum   = document.getElementById('cnum');
const wipe   = document.getElementById('wipe');
const flash  = document.getElementById('flash');
const field  = document.getElementById('field');
const beam   = document.getElementById('beam');

document.querySelectorAll('.art svg *').forEach(el => {{
  if (typeof el.getTotalLength === 'function') {{
    try {{ const L = el.getTotalLength();
      if (L > 0) {{ el.dataset.len = L; el.style.strokeDasharray = L; }} }} catch (e) {{}}
  }}
}});

const clamp = (v,a,b) => Math.min(b, Math.max(a, v));
const outCubic = p => 1 - Math.pow(1 - p, 3);
const outExpo  = p => p >= 1 ? 1 : 1 - Math.pow(2, -9 * p);

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
    el.style.transform = `scale(${{0.94 + outExpo(p) * 0.06}})`;
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

// يعيد {{active, next, q}} حيث q تقدّم الانتقال بين 0 و1 (أو null خارجه)
function phase(t) {{
  let active = 0;
  META.forEach((m, i) => {{ if (t >= m.start) active = i; }});
  for (let i = 1; i < META.length; i++) {{
    const edge = META[i].start;
    if (t > edge - HALF && t < edge + HALF) {{
      return {{active, from: i - 1, to: i, q: (t - (edge - HALF)) / (HALF * 2)}};
    }}
  }}
  return {{active, from: null, to: null, q: null}};
}}

window.setT = function (t) {{
  t = clamp(t, 0, TOTAL);
  const prog = t / TOTAL * 100;
  if (spine)  spine.style.height = prog + '%';
  if (topbar) topbar.style.width = prog + '%';
  field.style.transform = `translate(${{-t * 9}}px, ${{-t * 5}}px)`;
  if (beam) beam.style.transform =
    (TRANS === 'wipe' ? `rotate(-18deg) translateX(${{t * 26 - 120}}px)`
                      : `translate(${{t * 14}}px, ${{-t * 8}}px)`);

  const ph = phase(t);
  const active = ph.active;
  wipe.style.transform = 'translateY(100%)';
  flash.style.opacity = 0;

  scenes.forEach((sc, i) => {{
    sc.style.display = 'none';
    sc.style.transform = '';
    sc.style.clipPath = '';
    sc.style.opacity = 0;
  }});

  const show = (i) => {{
    const sc = scenes[i];
    sc.style.display = 'flex';
    sc.style.opacity = 1;
    const local = t - META[i].start;
    sc.querySelectorAll('[data-anim]').forEach(el => apply(el, local));
  }};

  if (ph.q === null) {{
    show(active);
  }} else if (TRANS === 'wipe') {{
    show(t < META[ph.to].start ? ph.from : ph.to);
    const q = ph.q;
    const y = 100 - outExpo(clamp(q * 2, 0, 1)) * 100
                  - (q > 0.5 ? outExpo(clamp((q - 0.5) * 2, 0, 1)) * 100 : 0);
    wipe.style.transform = `translateY(${{y}}%)`;
  }} else if (TRANS === 'push') {{
    // المشهدان يتحركان معاً أفقياً — الخارج يخرج يساراً والداخل يأتي يميناً
    const e = outExpo(ph.q);
    show(ph.from); show(ph.to);
    scenes[ph.from].style.transform = `translateX(${{-e * 100}}%)`;
    scenes[ph.to].style.transform = `translateX(${{(1 - e) * 100}}%)`;
  }} else if (TRANS === 'flash') {{
    show(t < META[ph.to].start ? ph.from : ph.to);
    flash.style.opacity = 1 - Math.abs(ph.q - 0.5) * 2;
  }} else if (TRANS === 'iris') {{
    // دائرة تتّسع فتكشف المشهد الداخل فوق الخارج
    show(ph.from); show(ph.to);
    const r = outExpo(ph.q) * 130;
    scenes[ph.to].style.clipPath = `circle(${{r}}% at 50% 46%)`;
  }}

  marks.forEach((m, i) => m.classList.toggle('on', i <= active));
  if (cnum) cnum.textContent = String(active + 1).padStart(2, '0');
  document.body.classList.toggle('inv', !!META[active].inv);
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
    tmp = out.parent / "_reel.html"
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
                dest = out.parent / f"still_{str(s).replace('.', '_')}.png"
                await page.screenshot(path=str(dest))
                print(f"✓ {dest}")
            await browser.close()
            tmp.unlink()
            return

        n = int(total * fps)

        # فراش موسيقي مركّب برمجياً، مضبوط على لحظات الانتقال.
        # البذرة من الملف نفسه، فنفس المحتوى يعطي نفس الموسيقى
        # ومحتوى مختلف يعطي مفتاحاً وإيقاعاً مختلفين.
        bed = out.parent / "_bed.wav"
        seed = spec.get("audio_seed") or json.dumps(
            [s.get("title", "") for s in spec.get("scenes", [])], ensure_ascii=False)
        info = write_bed(bed, total, seed=seed)
        print(f"موسيقى هادئة: {info['scale']} · {info['bpm']} نبضة/د · "
              f"جذر {info['root']}")

        cmd = [
            _ffmpeg(), "-y", "-loglevel", "error",
            "-f", "image2pipe", "-framerate", str(fps), "-i", "-",
            "-i", str(bed),
            "-c:v", "libx264", "-preset", "medium", "-crf", "20",
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
              f"{out.stat().st_size / 1e6:.1f} ميغابايت · ثيم {tname}")


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
