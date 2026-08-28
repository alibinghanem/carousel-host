#!/usr/bin/env python3
"""محرّك مونتاج الريلز — ١٢–١٤ ثانية، قطع على النبضة، حركة داخل الكادر.

لماذا محرّك ثالث؟ `render_reel2.py` كان كاميرا واحدة تنزلق فوق بطاقات نصية
لثلاثين ثانية: لا قطع، ولا حركة داخل الكادر، ولا إيقاع. العين تفهم الكادر
في ثانية ثم لا يبقى ما يُنتظر، فينهار زمن المشاهدة وينهار معه التوزيع.

هذا المحرّك يقلب البنية:

  ١) **النتيجة أولاً.** المشهد الثاني يُري التحوّل يحدث — جدول يُبنى صفاً
     صفاً، محادثة تُكتب، أعمدة تنمو — بدل أن يصف خطوات بالكلام. الناس
     تشاهد النتائج لا التعليمات.
  ٢) **القطع على النبضة.** المدد تُحسب من إيقاع الموسيقى التي نؤلّفها،
     فكل قطعة تقع على ضربة، ويقع عندها صوت يسندها (نقرة وضربة باص وصعود
     يمهّد). هذا وحده يصنع أغلب إحساس «الاحترافية».
  ٣) **المدة مضاعف صحيح للنبضة**، فتُعاد الحلقة على الإيقاع بلا خياطة
     مسموعة. والمشهد الأخير يُشبه الأول تركيبياً فتُعاد بصرياً كذلك.
  ٤) **الإطار صفر غلافٌ مكتمل.** لا بناء من العدم في البداية: التركيب
     كامل منذ أول إطار ثم يستقر. إنستقرام يلتقط الغلاف من الفيديو، فأي
     إطار افتتاحي فارغ يعني مستطيلاً فارغاً في الشبكة.
  ٥) **منطقة آمنة**: لا شيء مهم تحت y=1580 ولا يمين x=980 — هناك تجلس
     واجهة إنستقرام (التعليق، الاسم، الأزرار).

الاستخدام:
    python3 tools/render_reel3.py reel.json out.mp4
    python3 tools/render_reel3.py reel.json out.mp4 --stills 0,2.4,5,9,12

بنية الملف:
    {"theme":"indigo","handle":"@al_t506","keyword":"أداة",
     "cover":{"kicker":"…","title":"…","result":"…"},
     "demo":{"type":"table","label":"…","head":[…],"rows":[[…]],"total":[…]},
     "prompt":{"label":"…","lines":[…]},
     "cta":{"title":"…","sub":"…"},
     "tool":{"name":"…","url":"…"},"reply":"…"}
"""
import asyncio
import base64
import json
import pathlib
import subprocess
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

from render_v2 import THEMES, esc, ASSET_DIRS, _find          # noqa: E402
from render_reel2 import reel_faces, _chromium, _ffmpeg       # noqa: E402
from reel_audio3 import grid, write_bed                       # noqa: E402

W, H = 1080, 1920

# المنطقة الآمنة: واجهة إنستقرام تغطّي الأسفل واليمين
PAD_X, TOP, BOTTOM = 92, 210, 1580

# طول كل مشهد بالنبضات. المجموع ٣٢ نبضة ⇒ ١٨٫٥–٢٠٫٩ ثانية حسب الإيقاع.
# مشهد `value` أُضيف بعد العرض: الفائدة لا تُترك ضمنيةً في العرض، بل تُقال
# صريحةً في ثلاثة أسطر تهبط على النبضة — وهو ما يقرّر المشاهد عليه المتابعة.
BEATS = {"cover": 3, "demo": 11, "value": 7, "prompt": 6, "cta": 5}
ORDER = ["cover", "demo", "value", "prompt", "cta"]


def words(text, cls="w"):
    """كل كلمة في غلاف مقصوص، ليُكشف النص بمسح لا بتلاشٍ."""
    out = []
    for i, wrd in enumerate(str(text).split()):
        out.append(f'<span class="{cls}" data-i="{i}"><i>{esc(wrd)}</i></span>')
    return " ".join(out)


def avatar_b64():
    p = _find(ASSET_DIRS, "avatar.png")
    if not p:
        return ""
    return base64.b64encode(p.read_bytes()).decode()


# ═══════════════════════════ المشاهد ═══════════════════════════

def cover_html(c):
    result = c.get("result", "")
    card = ""
    if result:
        lines = "".join(f'<div class="rl">{esc(x)}</div>'
                        for x in (result if isinstance(result, list) else [result]))
        card = f'<div class="rcard" id="rcard">{lines}</div>'
    return (
        '<div class="wrap cov">'
        f'<div class="kick" id="ckick">{esc(c.get("kicker", ""))}</div>'
        f'<h1 class="big" id="ctitle">{words(c.get("title", ""))}</h1>'
        '<div class="rule" id="crule"></div>'
        f'{card}</div>')


def demo_table(d):
    head = "".join(f'<span>{esc(x)}</span>' for x in d.get("head", []))
    rows = []
    for i, r in enumerate(d.get("rows", [])):
        cells = "".join(f'<span>{esc(x)}</span>' for x in r)
        rows.append(f'<div class="tr" data-i="{i}">{cells}</div>')
    tot = d.get("total")
    totrow = ""
    if tot:
        cells = "".join(f'<span>{esc(x)}</span>' for x in tot)
        totrow = f'<div class="tr tot" id="totrow">{cells}</div>'
    return (f'<div class="tbl" style="--cols:{len(d.get("head", [])) or 3}">'
            f'<div class="tr th">{head}</div>{"".join(rows)}{totrow}</div>')


def demo_chat(d):
    you = esc(d.get("you", ""))
    lines = "".join(f'<div class="al" data-i="{i}">{words(x, "aw")}</div>'
                    for i, x in enumerate(d.get("reply", [])))
    status = esc(d.get("status", "يعمل داخل جهازك · بلا اتصال"))
    return (f'<div class="devbar"><i class="dot"></i><span>{status}</span></div>'
            '<div class="chat">'
            f'<div class="bub you"><span id="typed"></span>'
            f'<span class="car" id="car"></span></div>'
            f'<div class="bub ai" id="aibub">'
            f'<div class="dots" id="dots"><i></i><i></i><i></i></div>'
            f'<div class="atext" id="atext">{lines}</div></div>'
            f'<div class="src" data-raw="{you}"></div></div>')


def demo_bars(d):
    bars = []
    for i, b in enumerate(d.get("bars", [])):
        bars.append(
            f'<div class="bar" data-i="{i}" data-p="{b.get("pct", 50)}">'
            f'<div class="blab">{esc(b.get("label", ""))}</div>'
            f'<div class="btrk"><div class="bfil"></div></div>'
            f'<div class="bval">{esc(b.get("value", ""))}</div></div>')
    return f'<div class="bars">{"".join(bars)}</div>'


DEMOS = {"table": demo_table, "chat": demo_chat, "bars": demo_bars}


def demo_html(d):
    body = DEMOS.get(d.get("type", "table"), demo_table)(d)
    return ('<div class="wrap dem">'
            f'<div class="kick" id="dkick">{esc(d.get("label", ""))}</div>'
            f'<div class="dev" id="dev">{body}</div></div>')


def _has_arabic(s):
    return any("؀" <= ch <= "ۿ" for ch in str(s))


def prompt_html(p):
    src = p.get("lines", [])
    # أوامر الطرفية تُعرض في نافذة طرفية حقيقية لا في بطاقة نص: الشكل نفسه
    # يقول «هذا تقني وقابل للتنفيذ»، ويملأ الكادر بدل سطر يتيم وسط فراغ.
    # وسطر بلا حرف عربي يُجبَر على LTR وإلا انقلب ترتيبه داخل الحاوية RTL.
    term = src and not any(_has_arabic(x) for x in src)

    if term:
        cmd = "".join(
            f'<div class="tl" data-i="{i}"><b>$</b>&nbsp;{esc(x)}</div>'
            for i, x in enumerate(src))
        # الخط الأحادي لا يشكّل العربية: الحروف تنفصل وتتباعد. أي سطر مخرجات
        # فيه عربية يُنقل إلى الخط العربي واتجاه RTL بدل أن يخرج مشوّهاً.
        out = "".join(
            f'<div class="tl out{" ar" if _has_arabic(x) else ""}" '
            f'data-i="{len(src) + i}">{esc(x)}</div>'
            for i, x in enumerate(p.get("out", [])))
        body = ('<div class="term" id="panel">'
                '<div class="tbar"><i></i><i></i><i></i><span>Terminal</span></div>'
                f'<div class="tbody">{cmd}{out}'
                '<span class="tcar" id="tcar"></span></div></div>')
    else:
        body = ('<div class="panel" id="panel">'
                + "".join(f'<div class="pl" data-i="{i}">{esc(x)}</div>'
                          for i, x in enumerate(src))
                + '</div>')

    return ('<div class="wrap pro">'
            f'<div class="kick alt" id="pkick">{esc(p.get("label", "اكتب هذا"))}</div>'
            f'{body}'
            f'<div class="hint" id="phint">{esc(p.get("hint", "التقط الشاشة"))}</div>'
            '</div>')


def value_html(v):
    rows = []
    for i, r in enumerate(v.get("rows", [])):
        if isinstance(r, str):
            r = {"title": r}
        big = r.get("big", "")
        rows.append(
            f'<div class="vr" data-i="{i}">'
            f'<div class="vn">{esc(big) if big else "◆"}</div>'
            f'<div class="vt"><b>{esc(r.get("title", ""))}</b>'
            + (f'<span>{esc(r["sub"])}</span>' if r.get("sub") else "")
            + '</div></div>')
    return ('<div class="wrap val">'
            f'<div class="kick" id="vkick">{esc(v.get("label", "لماذا يهمّك"))}</div>'
            f'<div class="vlist">{"".join(rows)}</div></div>')


def cta_html(c, keyword, av):
    # صورة صاحب الحساب مقصوصة الخلفية: حضور شخصي في آخر مشهد يرفع التذكّر
    # ويربط الأداة بوجه. تجلس يساراً لأن النص عربي يصطفّ يميناً.
    face = (f'<div class="fring" id="face">'
            f'<img src="data:image/png;base64,{av}"></div>' if av else "")
    return ('<div class="wrap cta">'
            f'{face}'
            f'<div class="xname" id="xname">{esc(c.get("name", ""))}</div>'
            f'<h1 class="big" id="xtitle">{words(c.get("title", ""))}</h1>'
            f'<div class="chip" id="chip"><em>اكتب في التعليقات</em>'
            f'<b>{esc(keyword)}</b></div>'
            f'<div class="xsub" id="xsub">{esc(c.get("sub", ""))}</div>'
            '</div>')


# ═══════════════════════════ الصفحة ═══════════════════════════

def build_html(spec, beat):
    t = THEMES[spec.get("theme", "indigo")]
    a, ink, ink2 = t["accent"], t["ink"], t["ink2"]
    glow, on = t["glow"], t["onaccent"]
    light = t.get("light")
    panel_bg = a
    line = f"{ink}1f" if light else f"{ink}24"

    scenes, acc = [], 0.0
    for k in ORDER:
        d = BEATS[k] * beat
        scenes.append({"k": k, "start": round(acc, 5), "dur": round(d, 5)})
        acc += d
    total = round(acc, 5)

    av = avatar_b64()
    layers = "".join(
        f'<div class="layer" id="L{i}">{h}</div>' for i, h in enumerate([
            cover_html(spec.get("cover", {})),
            demo_html(spec.get("demo", {})),
            value_html(spec.get("value", {})),
            prompt_html(spec.get("prompt", {})),
            cta_html(spec.get("cta", {}), spec.get("keyword", "أداة"), av),
        ]))
    badge = (f'<img class="av" src="data:image/png;base64,{av}">' if av else "")

    return f"""<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8">
<style>
{reel_faces()}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:{W}px;height:{H}px;overflow:hidden;background:{t['bg1']}}}
body{{font-family:'Readex Pro','Cairo',sans-serif;color:{ink};
  -webkit-font-smoothing:antialiased}}

#stage{{position:absolute;inset:0;overflow:hidden}}
#bg{{position:absolute;inset:-14%;
  background:
    radial-gradient(58% 42% at 78% 16%, {glow}2e 0%, transparent 62%),
    radial-gradient(64% 46% at 16% 82%, {glow}1c 0%, transparent 66%),
    linear-gradient(168deg, {t['bg1']} 0%, {t['bg2']} 100%);
  will-change:transform}}
/* حبيبات خفيفة: تكسر التدرّج وتمنع التحزيم، وتعطي المرمّز تفاصيل يشتغل عليها */
#grain{{position:absolute;inset:0;opacity:.055;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml;utf8,\
<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>\
<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/></filter>\
<rect width='180' height='180' filter='url(%23n)'/></svg>")}}

.layer{{position:absolute;inset:0;opacity:0;visibility:hidden;
  transform-origin:50% 46%;will-change:transform,opacity,filter}}
.wrap{{position:absolute;left:{PAD_X}px;right:{PAD_X}px;
  top:{TOP}px;bottom:{H - BOTTOM}px;display:flex;flex-direction:column;
  justify-content:center}}

/* ── قائمة الفائدة ── */
.vlist{{display:flex;flex-direction:column;gap:26px}}
.vr{{display:flex;align-items:center;gap:28px;background:{ink}0c;
  border:2px solid {line};border-radius:24px;padding:30px 34px;
  will-change:transform,opacity}}
.vn{{flex:0 0 128px;height:112px;display:flex;align-items:center;
  justify-content:center;background:{a};color:{on};border-radius:20px;
  font-size:46px;font-weight:700;letter-spacing:-1px;direction:ltr}}
.vt b{{display:block;font-size:47px;font-weight:600;line-height:1.28}}
.vt span{{display:block;margin-top:8px;font-family:'Plex Arabic',sans-serif;
  font-size:33px;line-height:1.5;color:{ink2}}}

.kick{{font-size:32px;font-weight:600;letter-spacing:3.5px;color:{a};
  margin-bottom:28px}}
.kick.alt{{color:{a}}}
.big{{font-size:108px;font-weight:700;line-height:1.13;letter-spacing:-2.8px}}
.w,.aw{{display:inline-block;overflow:hidden;vertical-align:top}}
.w>i,.aw>i{{display:inline-block;font-style:normal;will-change:transform}}
.rule{{height:9px;width:210px;background:{a};border-radius:9px;margin-top:34px}}

/* بطاقة النتيجة: تطلّ من الأسفل مائلة، فيبدأ الكادر بعمق لا بسطح */
.rcard{{margin-top:54px;background:{ink}0d;border:2px solid {line};
  border-radius:26px;padding:30px 34px;backdrop-filter:blur(2px);
  transform-origin:50% 0}}
.rl{{font-family:'Plex Arabic',sans-serif;font-size:42px;line-height:1.72;
  color:{ink2}}}
.rl+.rl{{border-top:1px solid {line};margin-top:12px;padding-top:12px}}

/* ── إطار الجهاز ── */
.dev{{background:{ink}0a;border:2px solid {line};border-radius:34px;
  padding:30px;overflow:hidden}}
.tbl{{display:flex;flex-direction:column;gap:3px}}
.tr{{display:grid;grid-template-columns:repeat(var(--cols),1fr);gap:12px;
  padding:19px 20px;border-radius:14px;background:{ink}08;
  font-family:'Plex Arabic',sans-serif;font-size:35px;color:{ink};
  will-change:transform,opacity}}
.tr span{{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}
.tr span:last-child{{text-align:left;direction:ltr;font-variant-numeric:tabular-nums}}
.tr.th{{background:transparent;color:{a};font-size:27px;font-weight:600;
  letter-spacing:1.5px;padding-bottom:6px}}
.tr.tot{{background:{a};color:{on};font-weight:600;margin-top:10px}}

/* ── محادثة ── */
.devbar{{display:flex;align-items:center;gap:14px;padding:0 6px 24px;
  font-size:27px;color:{ink2};border-bottom:1px solid {line};margin-bottom:26px}}
.dot{{width:14px;height:14px;border-radius:50%;background:#2ecc71;
  box-shadow:0 0 0 6px #2ecc7126}}
.chat{{display:flex;flex-direction:column;gap:22px}}
.bub{{border-radius:28px;padding:30px 34px;font-family:'Plex Arabic',sans-serif;
  font-size:43px;line-height:1.6;max-width:92%}}
.bub.you{{background:{a};color:{on};align-self:flex-start;
  border-bottom-right-radius:8px}}
.bub.ai{{background:{ink}0f;border:2px solid {line};color:{ink};
  align-self:flex-end;border-bottom-left-radius:8px;min-height:96px}}
.car{{display:inline-block;width:4px;height:34px;background:{on};
  vertical-align:-6px;margin-right:4px}}
.dots{{display:flex;gap:10px;padding:14px 0}}
.dots i{{width:14px;height:14px;border-radius:50%;background:{ink2}}}
.atext{{display:none}}
.al{{margin:2px 0}}
.src{{display:none}}

/* ── أعمدة المقارنة ── */
.bars{{display:flex;flex-direction:column;gap:34px}}
.blab{{font-size:31px;color:{ink2};margin-bottom:12px}}
.btrk{{height:34px;background:{ink}12;border-radius:17px;overflow:hidden}}
.bfil{{height:100%;width:0;background:{a};border-radius:17px}}
.bval{{font-size:29px;color:{a};margin-top:10px;font-weight:600}}

/* ── الموجّه ── */
.panel{{background:{panel_bg};color:{on};border-radius:30px;padding:50px 44px;
  font-family:'Plex Arabic',sans-serif;font-size:52px;line-height:1.62;
  will-change:clip-path}}
.pl{{will-change:transform,opacity}}

/* نافذة طرفية: شريط علوي بثلاث نقاط، ثم الأمر ومخرجاته */
.term{{border-radius:26px;overflow:hidden;border:2px solid {line};
  background:{"#0E1117" if light else "#070B14"};will-change:clip-path}}
.tbar{{display:flex;align-items:center;gap:11px;padding:22px 26px;
  background:#FFFFFF0E;direction:ltr}}
.tbar i{{width:16px;height:16px;border-radius:50%;background:#FFFFFF2E}}
.tbar i:first-child{{background:#FF5F57}}
.tbar i:nth-child(2){{background:#FEBC2E}}
.tbar i:nth-child(3){{background:#28C840}}
.tbar span{{margin-left:auto;font-size:25px;color:#FFFFFF66;letter-spacing:1px}}
.tbody{{padding:38px 34px 44px;direction:ltr;text-align:left;
  font-family:'SFMono-Regular',Menlo,Consolas,monospace;
  font-size:47px;line-height:1.62;color:#E9EEF8;letter-spacing:-1px}}
.tl{{will-change:transform,opacity;white-space:nowrap}}
.tl b{{color:#28C840;font-weight:400}}
.tl.out{{color:#9FB2CE;font-size:41px}}
.tl.out.ar{{font-family:'Plex Arabic',sans-serif;direction:rtl;text-align:right;
  letter-spacing:0;font-size:38px}}
.tcar{{display:inline-block;width:20px;height:44px;background:#E9EEF8;
  vertical-align:-8px}}

.hint{{margin-top:28px;font-size:33px;color:{ink2};
  font-family:'Plex Arabic',sans-serif}}

/* ── الدعوة ── */
/* مشهد الدعوة تركيبه مركزيّ لا يمينيّ: الصورة الكبيرة في الوسط والمعرّف
   تحتها ثم العنوان — هذا ما يصنع «توقيعاً» يُتذكّر، والوجه في المنتصف
   يوقف الإبهام أكثر من أي صندوق نص. */
.cta{{align-items:center;text-align:center}}
.chip{{margin-top:38px;align-self:center;background:{a};color:{on};
  border-radius:26px;padding:22px 52px 28px;text-align:center;
  box-shadow:0 0 0 0 {glow}66;will-change:transform,box-shadow}}
.chip em{{display:block;font-style:normal;font-size:27px;opacity:.82;
  margin-bottom:6px}}
.chip b{{display:block;font-size:74px;font-weight:700;line-height:1.16}}
.xsub{{margin-top:30px;font-family:'Plex Arabic',sans-serif;font-size:37px;
  line-height:1.58;color:{ink2};max-width:820px}}
.xname{{margin-top:24px;font-size:56px;font-weight:600;color:{a};direction:ltr;
  letter-spacing:1px}}
.cta .big{{font-size:88px;margin-top:26px;letter-spacing:-2px}}

/* الصورة الأصلية مقطوعة بحدّ حادّ من الأسفل واليمين (الجذع والذراع يصلان
   حافة الملف)، فوضعها كقصاصة يُظهر خطاً مستقيماً في الكتف. القرص يلغي
   المشكلة من أصلها. */
.fring{{position:relative;width:430px;height:430px;border-radius:50%;
  overflow:hidden;border:7px solid {a};
  background:linear-gradient(158deg,{glow}3d,{ink}2e);
  box-shadow:0 26px 60px rgba(0,0,0,.46);flex:0 0 auto;
  will-change:transform,opacity;pointer-events:none}}
/* الوضع المطلق مقصود: داخل حاوية RTL يبدأ الموضع الساكن للصورة من الحافة
   اليمنى، فتنزلق خارج القرص.
   المقاس محسوب من قناع الشفافية لا بالتجربة: الجسم في الملف يمتد
   y=130..760، وبمقاس عرض 470 داخل قرص داخليّ 416 يظهر الرأس والكتفان
   والثوب معاً — لا الوجه وحده — وتقع حافتا الملف الحادّتان (اليمنى
   والسفلى) خارج القرص فيقصّ القرصُ الصورةَ لا حافةُ الملف. */
.fring img{{position:absolute;width:470px;height:470px;object-fit:contain;
  left:-30px;top:-25px;display:block}}

/* ── الثابت ── */
#chrome{{position:absolute;inset:0;pointer-events:none}}
.hd{{position:absolute;top:96px;right:{PAD_X}px;display:flex;align-items:center;
  gap:14px;font-size:31px;color:{ink2};direction:ltr}}
.av{{width:52px;height:52px;border-radius:50%;object-fit:cover}}
#prog{{position:absolute;top:0;left:0;height:5px;background:{a};width:0}}
</style>
<div id="stage">
  <div id="bg"></div><div id="grain"></div>
  {layers}
  <div id="chrome"><div id="prog"></div>
    <div class="hd">{badge}<span>{esc(spec.get('handle', ''))}</span></div></div>
</div>
<script>
const SCENES = {json.dumps(scenes)};
const TOTAL = {total};
const BEAT = {beat};
const L = [0,1,2,3,4].map(i => document.getElementById('L'+i));
const cl = (v,a,b) => Math.max(a, Math.min(b, v));

// منحنيات التخفيف: الحركة الخطية هي ما يفضح القوالب
const outC = t => 1 - Math.pow(1-t, 3);
const outQ = t => 1 - Math.pow(1-t, 5);
const back = t => {{ const c1=1.62, c3=c1+1;
  return 1 + c3*Math.pow(t-1,3) + c1*Math.pow(t-1,2); }};

// كشف متدرّج: عنصر كل STEP ثانية، كلٌّ يستغرق DUR
function stagger(nodes, lt, delay, step, dur, fn) {{
  nodes.forEach((el, i) => {{
    const p = cl((lt - delay - i*step) / dur, 0, 1);
    fn(el, p, i);
  }});
}}

const Q = s => document.querySelectorAll(s);
const G = id => document.getElementById(id);
const CHAT_SRC = (document.querySelector('.src')||{{dataset:{{raw:''}}}}).dataset.raw||'';

// الغلاف لا «يُبنى من العدم»: إنستقرام يلتقط غلاف الريلز من الفيديو، وأي
// إطار افتتاحي ناقص يصير مستطيلاً فارغاً في شبكة الحساب. لذلك كل شيء هنا
// مكتملٌ عند lt=0، والحركة استقرارٌ لا ظهور.
function sceneCover(lt) {{
  [...Q('#ctitle .w>i')].forEach((el,i) => {{
    const p = cl((lt - i*0.045) / 0.60, 0, 1);
    el.style.transform = `translateY(${{(1-outQ(p))*-7}}%)`;   // يستقر نازلاً
  }});
  const r = G('crule');
  if (r) {{ const p = cl(lt/0.55,0,1);
    r.style.transform = `scaleX(${{0.72+0.28*outQ(p)}})`;
    r.style.transformOrigin='100% 50%'; }}
  const c = G('rcard');
  if (c) {{ const p = cl(lt/0.72,0,1);
    c.style.transform =
      `translateY(${{(1-outQ(p))*26}}px) rotate(${{(1-outQ(p))*-1.1}}deg)`; }}
}}

function sceneDemo(lt, dur) {{
  const k = G('dkick');
  if (k) {{ const p = cl(lt/0.30,0,1);
    k.style.opacity = p; k.style.transform = `translateX(${{(1-outC(p))*26}}px)`; }}
  const dev = G('dev');
  if (dev) {{ const p = cl(lt/0.40,0,1);
    dev.style.opacity = p;
    dev.style.transform = `translateY(${{(1-outC(p))*34}}px) scale(${{0.985+0.015*outC(p)}})`; }}

  // جدول: صف كل نصف نبضة، ثم يهبط المجموع بضربة
  const rows = [...Q('#L1 .tr:not(.th):not(.tot)')];
  stagger(rows, lt, 0.34, BEAT*0.5, 0.42, (el,p) => {{
    el.style.opacity = p;
    el.style.transform = `translateY(${{(1-back(p))*30}}px)`;
  }});
  const tot = G('totrow');
  if (tot) {{
    const at = 0.34 + rows.length*BEAT*0.5 + 0.15;
    const p = cl((lt-at)/0.40,0,1);
    tot.style.opacity = p;
    tot.style.transform = `translateY(${{(1-back(p))*34}}px) scale(${{1+0.05*(1-outQ(p))}})`;
  }}

  // محادثة: يُكتب السؤال حرفاً حرفاً، ثم نقاط انتظار، ثم يتدفّق الجواب
  const typed = G('typed');
  if (typed) {{
    const tw = Math.min(dur*0.34, 2.4);
    const p = cl(lt/tw, 0, 1);
    typed.textContent = CHAT_SRC.slice(0, Math.round(CHAT_SRC.length*p));
    const car = G('car');
    if (car) car.style.opacity = (p<1 && Math.floor(lt*2.6)%2===0) ? 1 : (p<1?0.15:0);
    const ai = G('aibub'), dots = G('dots'), at = G('atext');
    const ap = cl((lt - tw - 0.18)/0.30, 0, 1);
    if (ai) {{ ai.style.opacity = ap;
      ai.style.transform = `translateY(${{(1-back(ap))*24}}px)`; }}
    const think = cl((lt - tw - 0.48)/0.36, 0, 1);
    if (dots) dots.style.display = think>=1 ? 'none' : 'flex';
    if (at) at.style.display = think>=1 ? 'block' : 'none';
    if (think >= 1) {{
      stagger([...Q('#atext .aw>i')], lt, tw+0.84, 0.035, 0.30,
        (el,p2) => {{ el.style.transform = `translateY(${{(1-outQ(p2))*100}}%)`; }});
    }}
  }}

  // أعمدة: تنمو بترتيب، وقيمها تظهر بعد اكتمال العمود
  [...Q('#L1 .bar')].forEach((b,i) => {{
    const p = cl((lt - 0.40 - i*BEAT*0.75)/0.62, 0, 1);
    const fil = b.querySelector('.bfil');
    if (fil) fil.style.width = (outQ(p) * parseFloat(b.dataset.p)) + '%';
    const v = b.querySelector('.bval');
    if (v) v.style.opacity = cl((p-0.55)/0.35,0,1);
  }});
}}

function scenePrompt(lt) {{
  const k = G('pkick');
  if (k) {{ const p = cl(lt/0.28,0,1);
    k.style.opacity = p; k.style.transform = `translateX(${{(1-outC(p))*26}}px)`; }}
  const pn = G('panel');
  const isTerm = pn && pn.classList.contains('term');
  if (pn) {{
    const p = outQ(cl(lt/0.40,0,1));
    if (isTerm) {{
      // النافذة تُفتح بارتفاعها لا بمسح جانبي: هكذا تُفتح نافذة حقيقية
      pn.style.clipPath = `inset(0 0 ${{(1-p)*100}}% 0)`;
      pn.style.transform = `translateY(${{(1-p)*18}}px)`;
    }} else {{
      // مسح من اليمين: اتجاه القراءة العربية
      pn.style.clipPath = `inset(0 0 0 ${{(1-p)*100}}%)`;
      pn.style.transform = `scale(${{0.99+0.01*p}})`;
    }}
  }}
  stagger([...Q('#L3 .pl')], lt, 0.34, 0.085, 0.40, (el,p) => {{
    el.style.opacity = p;
    el.style.transform = `translateY(${{(1-outQ(p))*22}}px)`;
  }});
  // أسطر الطرفية تظهر سطراً سطراً على نصف نبضة، والمؤشّر يومض بعد آخرها
  const tls = [...Q('#L3 .tl')];
  stagger(tls, lt, 0.42, BEAT*0.5, 0.26, (el,p) => {{
    el.style.opacity = p; el.style.transform = `translateX(${{(1-outQ(p))*-16}}px)`;
  }});
  const car = G('tcar');
  if (car) {{
    const at = 0.42 + tls.length*BEAT*0.5;
    car.style.opacity = (lt > at && Math.floor((lt-at)*2.4)%2===0) ? 1 : 0;
  }}
  const h = G('phint');
  if (h) {{ const p = cl((lt-0.85)/0.35,0,1);
    // نبض على النبضة يلفت للفعل المطلوب
    const b = 1 + 0.045*Math.max(0, Math.sin(lt/BEAT*Math.PI*2));
    h.style.opacity = p*0.95; h.style.transform = `scale(${{b}})`;
    h.style.transformOrigin = '100% 50%'; }}
}}

// كل سطر فائدة يهبط على نصف نبضة، فتقع الأسطر مع الموسيقى لا بجوارها
function sceneValue(lt) {{
  const k = G('vkick');
  if (k) {{ const p = cl(lt/0.30,0,1);
    k.style.opacity = p; k.style.transform = `translateX(${{(1-outC(p))*26}}px)`; }}
  stagger([...Q('#L2 .vr')], lt, 0.26, BEAT*0.62, 0.44, (el,p) => {{
    el.style.opacity = p;
    el.style.transform =
      `translateX(${{(1-back(p))*46}}px) scale(${{0.985+0.015*outQ(p)}})`;
  }});
}}

function sceneCta(lt) {{
  stagger([...Q('#xtitle .w>i')], lt, 0.30, 0.05, 0.46,
    (el,p) => {{ el.style.transform = `translateY(${{(1-back(p))*105}}%)`; }});
  const c = G('chip');
  if (c) {{
    const p = cl((lt-0.34)/0.46,0,1);
    // هالة تتنفّس على النبضة: العين تعود للطلب كل ضربة
    const b = Math.max(0, Math.sin((lt-0.34)/BEAT*Math.PI*2));
    c.style.opacity = p;
    c.style.transform = `translateY(${{(1-back(p))*36}}px) scale(${{1+0.022*b}})`;
    c.style.boxShadow = `0 0 0 ${{6+22*b}}px rgba(0,0,0,0)`;
    c.style.filter = `drop-shadow(0 10px ${{18+26*b}}px rgba(0,0,0,.18))`;
  }}
  const s = G('xsub');
  if (s) {{ const p = cl((lt-0.62)/0.42,0,1);
    s.style.opacity = p; s.style.transform = `translateY(${{(1-outC(p))*20}}px)`; }}
  const nm = G('xname');
  if (nm) {{ const p = cl((lt-0.26)/0.34,0,1);
    nm.style.opacity = p; nm.style.transform = `translateY(${{(1-outC(p))*16}}px)`; }}
  // الصورة أول ما يظهر: تكبر من ٨٨٪ مع تجاوز خفيف، وهالتها تتنفّس على النبضة
  const f = G('face');
  if (f) {{
    const p = cl(lt/0.52,0,1);
    const b = Math.max(0, Math.sin(lt/BEAT*Math.PI*2));
    f.style.opacity = cl(p*1.6,0,1);
    f.style.transform = `scale(${{0.88+0.12*back(p)}})`;
    f.style.boxShadow =
      `0 26px 60px rgba(0,0,0,.46), 0 0 ${{18+30*b}}px ${{4+9*b}}px {glow}4d`;
  }}
}}

const RUN = [sceneCover, sceneDemo, sceneValue, scenePrompt, sceneCta];

window.setT = function (t) {{
  t = cl(t, 0, TOTAL);
  let cur = 0;
  for (let i = 0; i < SCENES.length; i++)
    if (t >= SCENES[i].start - 1e-6) cur = i;
  const sc = SCENES[cur];
  const lt = t - sc.start;

  for (let i = 0; i < L.length; i++) {{
    const on = (i === cur);
    L[i].style.opacity = on ? 1 : 0;
    L[i].style.visibility = on ? 'visible' : 'hidden';
  }}

  // نبضة القطع: دخول بمقياس أكبر قليلاً وضبابة تنحسر خلال ٠٫٢٦ث.
  // تُستثنى منها لقطة الغلاف: أول إطار يجب أن يكون حاداً ومقروءاً تماماً.
  if (cur === 0) {{
    L[0].style.transform = `scale(${{1 + 0.020 * outQ(cl(lt/sc.dur,0,1))}})`;
    L[0].style.filter = 'none';
  }} else {{
    const e = cl(lt / 0.26, 0, 1);
    L[cur].style.transform = `scale(${{1 + 0.030 * (1 - outQ(e))}})`;
    L[cur].style.filter = e < 1 ? `blur(${{(1 - e) * 5}}px)` : 'none';
  }}

  RUN[cur](lt, sc.dur);

  // انجراف الخلفية: بطيء ومستمر، يمنع سكون الكادر بين الحركات
  const bg = document.getElementById('bg');
  bg.style.transform =
    `translate(${{Math.sin(t*0.30)*26}}px, ${{-t*7}}px) scale(${{1.04+0.012*Math.sin(t*0.42)}})`;
  document.getElementById('prog').style.width = (t/TOTAL*100) + '%';
}};
window.REEL_TOTAL = TOTAL;
window.REEL_CUTS = SCENES.slice(1).map(s => s.start);
window.setT(0);
</script></html>"""


# ═══════════════════════════ التشغيل ═══════════════════════════

async def run(spec_path, out_path, stills=None):
    from playwright.async_api import async_playwright

    spec = json.loads(pathlib.Path(spec_path).read_text(encoding="utf-8"))
    out = pathlib.Path(out_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    fps = int(spec.get("fps", 30))

    seed = spec.get("audio_seed") or json.dumps(
        [spec.get("cover", {}).get("title", ""),
         spec.get("cta", {}).get("title", "")], ensure_ascii=False)
    bpm, beat = grid(seed)

    html = build_html(spec, beat)
    tmp = out.parent / "_reel3.html"
    tmp.write_text(html, encoding="utf-8")

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
        cuts = await page.evaluate("window.REEL_CUTS")

        if stills:
            for s in stills:
                await page.evaluate(f"window.setT({s})")
                await page.wait_for_timeout(60)
                dest = out.parent / f"s3_{str(s).replace('.', '_')}.png"
                await page.screenshot(path=str(dest))
                print(f"✓ {dest}")
            await browser.close()
            tmp.unlink()
            return

        bed = out.parent / "_bed3.wav"
        info = write_bed(bed, total, seed=seed, cuts=cuts)
        print(f"موسيقى {info['scale']} · {info['bpm']} نبضة/د · جذر {info['root']} "
              f"· {info['cuts']} قطعات مُصوَّتة")

        n = int(total * fps)
        cmd = [
            _ffmpeg(), "-y", "-loglevel", "error",
            "-f", "image2pipe", "-framerate", str(fps), "-i", "-",
            "-i", str(bed),
            "-c:v", "libx264", "-preset", "medium",
            "-b:v", "7M", "-minrate", "5M", "-maxrate", "9M", "-bufsize", "14M",
            "-pix_fmt", "yuv420p", "-r", str(fps),
            "-c:a", "aac", "-b:a", "160k", "-shortest",
            "-movflags", "+faststart", str(out),
        ]
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
        print(f"ترميز {n} إطاراً ({total:.1f}ث عند {fps} إطار/ث)…")
        for i in range(n):
            await page.evaluate(f"window.setT({i / fps})")
            proc.stdin.write(await page.screenshot(type="jpeg", quality=94))
            if i and i % 90 == 0:
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
        cutstr = " · ".join(f"{c:.2f}" for c in cuts)
        print(f"\n✓ {out} — {total:.2f}ث ({sum(BEATS.values())} نبضة) · "
              f"{out.stat().st_size / 1e6:.1f} ميغابايت · ثيم "
              f"{spec.get('theme', 'indigo')}\n  قطعات عند: {cutstr}")


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
