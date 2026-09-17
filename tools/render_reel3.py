#!/usr/bin/env python3
"""محرّك مونتاج الريلز — ١٢–١٤ ثانية، تصميم هادئ خفيف الحركة، لا موسيقى.

لماذا محرّك ثالث؟ `render_reel2.py` كان كاميرا واحدة تنزلق فوق بطاقات نصية
لثلاثين ثانية: لا قطع، ولا حركة داخل الكادر، ولا إيقاع. العين تفهم الكادر
في ثانية ثم لا يبقى ما يُنتظر، فينهار زمن المشاهدة وينهار معه التوزيع.

هذا المحرّك يقلب البنية — وأُعيد ضبطه في ٢٠٢٦-٠٩-١٣ بطلب صاحب الحساب
صراحةً نحو الهدوء بعد أن شعر أن النسخة السابقة (قطع على ضربة موسيقى مع
نبض متكرر في الخلفية) «توحي بأنها من الذكاء الاصطناعي»:

  ١) **النتيجة أولاً.** المشهد الثاني يُري التحوّل يحدث — جدول يُبنى صفاً
     صفاً، محادثة تُكتب، أعمدة تنمو — بدل أن يصف خطوات بالكلام. الناس
     تشاهد النتائج لا التعليمات.
  ٢) **بلا موسيقى وبلا نبض متكرر.** لا فراش موسيقي ولا صوت قطعات ولا
     خلفية تتنفّس كل ضربة — تلك التفاصيل هي ما يخون المونتاج الآلي.
     الانتقال بين المشاهد مزجٌ هادئ بطيء (`CF` أدناه) لا قطعٌ حادّ، وكل
     حركة تدخل مرّة واحدة ثم تسكن، لا تتكرر إلى الأبد.
  ٣) **تصميم يتكيّف مع الموضوع لا قالباً واحداً بألوان متبدّلة**: الثيم
     ولون الزخرفة وتخطيط الغلاف وقائمة الفائدة تُختار من محتوى المنشور
     نفسه (`_seed_pick`)، ورمز المفهوم المذكور في النص (سيارة، منزل،
     هاتف…) يُستدعى تلقائياً من `reel_art.guess_icon` فيظهر رسماً
     احترافياً لا رقماً مجرّداً — انظر `COVER_LAYOUTS` و`VALUE_LAYOUTS`.
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

`theme` اختياري: إن غاب يُختار ثيمٌ فاتحٌ هادئ تلقائياً من بذرة المحتوى
(`render_v2.CALM_THEMES`) — انظر الطلب الصريح بألوان فاتحة في التوثيق.
"""
import asyncio
import base64
import hashlib
import json
import pathlib
import subprocess
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

from render_v2 import THEMES, CALM_THEMES, esc, ASSET_DIRS, _find   # noqa: E402
from render_reel2 import reel_faces, _chromium, _ffmpeg             # noqa: E402
from reel_art import (icon, icon_plain, brand_chip, decor,          # noqa: E402
                       DECOR_KINDS, guess_icon)

W, H = 1080, 1920

# المنطقة الآمنة: واجهة إنستقرام تغطّي الأسفل واليمين
PAD_X, TOP, BOTTOM = 92, 210, 1580

# لا موسيقى تملي الإيقاع بعد الآن — «نبضة» هنا وحدة توقيت ثابتة هادئة
# لتوزيع ظهور العناصر تباعاً، لا شيء يُسمع عندها. كِلا الثابتين هنا
# (النبضة والمدة الهدف) رُفعا بطلب صاحب الحساب في ٢٠٢٦-٠٩-١٤: الانتقالات
# كانت أسرع من أن يقرأ المشاهد المحتوى قبل تبدّل المشهد.
CALM_BEAT = 0.78

# أوزان نسبية لا أطوالاً ثابتة. مشهد `value` أُضيف بعد العرض لأن الفائدة
# لا تُترك ضمنيةً — عندها يقرّر المشاهد أن الأمر يستحق وقته. وزن `cover`
# رُفع (٣→٥) بطلب صاحب الحساب: المقدمة كانت تُغادَر قبل أن يُقرأ عنوانها
# وبطاقة نتيجتها كاملةً.
WEIGHTS = {"cover": 5, "demo": 11, "value": 7, "prompt": 6, "cta": 5}
ORDER = ["cover", "demo", "value", "prompt", "cta"]
TARGET_SEC = 27.0


def plan_beats(beat, target=TARGET_SEC):
    """يوزّع نبضات المشاهد بحيث تقارب المدة الهدف، والمجموع مضاعف لأربعة
    (إيقاع داخلي متّسق فقط، لا علاقة له بصوت — لا صوت هنا أصلاً).
    """
    total = max(16, int(round(target / beat / 4.0)) * 4)
    wsum = sum(WEIGHTS.values())
    out = {k: max(2, int(round(total * WEIGHTS[k] / wsum))) for k in ORDER}
    # تسوية الفارق الناتج عن التقريب على أكبر المشاهد
    diff = total - sum(out.values())
    order = sorted(ORDER, key=lambda k: -out[k])
    i = 0
    while diff != 0:
        k = order[i % len(order)]
        if diff > 0:
            out[k] += 1
            diff -= 1
        elif out[k] > 2:
            out[k] -= 1
            diff += 1
        i += 1
    return out, total


def scene_windows(beat, BEATS):
    """بداية كل مشهد ومدته بالثواني — يستعملها HTML/JS وأيضاً `run()` عند
    حساب نافذة لقطة فيديو حقيقي (`shot_windows`) لأن المزج النهائي بـffmpeg
    يحتاج أرقاماً حرفية لا حالة متصفّح حيّة."""
    scenes, acc = [], 0.0
    for k in ORDER:
        d = BEATS[k] * beat
        scenes.append({"k": k, "start": round(acc, 5), "dur": round(d, 5)})
        acc += d
    return scenes, round(acc, 5)


def shot_windows(demo_spec, demo_start, demo_dur, beat):
    """نافذة كل لقطة (بدايتها ونهايتها المطلقتان بالثواني) — نسخة بايثون
    من نفس حساب التوقيت في `sceneDemo` بجافاسكربت (`lead`/`each`)، لازمة
    لتحديد متى يظهر فيديو حقيقي فوق الإطار عبر ffmpeg overlay."""
    shots = demo_spec.get("shots", [])
    n = len(shots)
    if not n:
        return []
    lead = 0.34
    each = max(beat * 2, (demo_dur - lead) / n)
    out = []
    for i in range(n):
        t0 = demo_start + lead + i * each
        t1 = (demo_start + demo_dur) if i == n - 1 else (t0 + each)
        out.append((t0, t1))
    return out


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


# التصميم يتكيّف مع محتوى المنشور لا يتكرّر بقالب واحد: كل عنصر متغيّر
# (الثيم، تخطيط الغلاف، تخطيط قائمة الفائدة، الزخرفة) يُختار من بذرة
# مبنيّة على نص المنشور نفسه، فيختلف الشكل تلقائياً بين موضوع وآخر بلا
# أي إعداد يدوي، ويبقى ثابتاً لنفس المنشور إن أُعيد توليده.
COVER_LAYOUTS = ("classic", "spotlight", "geo")
VALUE_LAYOUTS = ("list", "grid")


def _seed_pick(seed, options, salt=""):
    h = hashlib.sha256(f"{salt}:{seed}".encode()).digest()
    return options[h[0] % len(options)]


def content_seed(spec):
    """بذرة مشتقّة من محتوى المنشور نفسه — لا من الوقت ولا عشوائياً — كي
    يخرج نفس المنشور بنفس الشكل دوماً، وموضوعٌ مختلف بشكل مختلف تلقائياً."""
    return json.dumps([spec.get("cover", {}), spec.get("value", {})],
                       ensure_ascii=False, sort_keys=True)


def pick_theme(spec):
    return spec.get("theme") or _seed_pick(content_seed(spec), CALM_THEMES, "theme")


# ═══════════════════════════ المشاهد ═══════════════════════════

def _cell(x):
    """خلية جدول أو قيمة داخل حاوية RTL: تُلفّ بـ<bdi> فتُعزَل بيدياً عن
    جاراتها. بلا هذا، أرقام متعددة المجموعات مثل بطاقة ائتمان أو رقم
    جوال في خلية بجوار نص عربي تُعاد ترتيب مجموعاتها بصرياً — شوهد فعلاً:
    «4111 1111 1111 1111» يخرج «1111 1111 1111 4111». bdi يحلّ اتجاهها
    من محتواها هي وحدها لا من الفقرة المحيطة."""
    return f'<bdi>{esc(x)}</bdi>'


def cover_html(c, tool, accent, on_accent, layout):
    result = c.get("result", "")
    card = ""
    if result:
        lines = "".join(f'<div class="rl">{esc(x)}</div>'
                        for x in (result if isinstance(result, list) else [result]))
        card = f'<div class="rcard" id="rcard">{lines}</div>'
    # شارة الأداة على الغلاف: المشاهد يعرف عن أي أداة نتكلّم قبل أن يقرأ،
    # واللون هو لون العلامة لا لون الثيم — فيُتعرَّف عليها فوراً.
    chip = brand_chip(tool.get("brand") or tool.get("name", ""),
                      tool.get("name", ""), accent, on_accent)
    brandrow = f'<div class="brandrow" id="cbrand">{chip}</div>' if chip else ""

    # رمز المفهوم المذكور في العنوان (سيارة، منزل، هاتف…) إن وُجد — رسمٌ
    # يشرح الموضوع بصرياً بدل نصٍّ فقط. ساكن منذ الإطار الأول، بلا نبض.
    concept = c.get("icon") or guess_icon(c.get("kicker", ""), c.get("title", ""))

    if layout == "spotlight" and concept:
        # تخطيط ثانٍ: بطاقة رسومية كبيرة أعلى العنوان بدل بطاقة النتيجة —
        # الرسم نفسه هو الدليل البصري الأول، لا سطر نتيجة نصّي.
        art = (f'<div class="cart" id="cart"><div class="cartic">'
               f'{icon_plain(concept, accent, 1.15)}</div></div>')
        return (
            '<div class="wrap cov spot">'
            f'{art}'
            f'<div class="kick" id="ckick">{esc(c.get("kicker", ""))}</div>'
            f'<h1 class="big" id="ctitle">{words(c.get("title", ""))}</h1>'
            + (f'<div class="rcard" id="rcard">'
               + "".join(f'<div class="rl">{esc(x)}</div>'
                         for x in (result if isinstance(result, list) else [result]))
               + '</div>' if result else "")
            + brandrow + '</div>')

    if layout == "geo":
        # تخطيط ثالث: شريط ملوّن ممتلئ (بطاقة عنوان) يحمل الكلمة الدالّة
        # ورمز المفهوم بلون مضاد، ثم العنوان الكبير تحته — تركيب "لافتة"
        # لا عمودان نصّيان، وهو ما يكسر تكرار الشكل بين الغلافين الآخرين.
        band_icon = (f'<div class="gicon">{icon_plain(concept, on_accent, 1.3)}</div>'
                     if concept else "")
        return (
            '<div class="wrap cov geo">'
            '<div class="gband" id="gband">'
            f'<div class="gkick">{esc(c.get("kicker", ""))}</div>'
            f'{band_icon}</div>'
            f'<h1 class="big" id="ctitle">{words(c.get("title", ""))}</h1>'
            f'{card}'
            + brandrow + '</div>')

    water = (f'<div class="cwater">{icon_plain(concept, accent, 1.3)}</div>'
             if concept else "")
    return (
        '<div class="wrap cov">'
        f'{water}'
        f'<div class="kick" id="ckick">{esc(c.get("kicker", ""))}</div>'
        f'<h1 class="big" id="ctitle">{words(c.get("title", ""))}</h1>'
        '<div class="rule" id="crule"></div>'
        f'{card}'
        + brandrow + '</div>')


def demo_table(d):
    head = "".join(f'<span>{_cell(x)}</span>' for x in d.get("head", []))
    rows = []
    for i, r in enumerate(d.get("rows", [])):
        cells = "".join(f'<span>{_cell(x)}</span>' for x in r)
        rows.append(f'<div class="tr" data-i="{i}">{cells}</div>')
    tot = d.get("total")
    totrow = ""
    if tot:
        cells = "".join(f'<span>{_cell(x)}</span>' for x in tot)
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
            f'<div class="bval">{_cell(b.get("value", ""))}</div></div>')
    return f'<div class="bars">{"".join(bars)}</div>'


def _img_b64(path):
    """الصورة تُضمَّن في الصفحة: لا تحميل ولا اعتماد على الشبكة وقت الترميز."""
    p = pathlib.Path(path)
    if not p.is_absolute():
        p = pathlib.Path.cwd() / p
    if not p.exists():
        raise FileNotFoundError(f"صورة غير موجودة: {path}")
    ext = p.suffix.lower().lstrip(".")
    mime = {"jpg": "jpeg", "jpeg": "jpeg", "png": "png",
            "webp": "webp", "gif": "gif", "svg": "svg+xml"}.get(ext, "png")
    return f"data:image/{mime};base64,{base64.b64encode(p.read_bytes()).decode()}"


def demo_shots(d):
    """لقطات حقيقية من التجربة — أقوى ما يمكن عرضه: دليل لا وصف.

    كل لقطة تدخل على ضربة، وتتحرّك ببطء وهي معروضة (كين بيرنز) فلا يجمد
    الكادر، ويمكن وضع علامة على نقطة فيها (`focus`) بإحداثيات نسبية
    فيظهر خاتم يشير إليها مع سطر شرح — هذا ما يحوّل لقطة شاشة إلى مونتاج.

    لقطة بمفتاح `video` بدل `src`: مقطع فيديو حقيقي (تسجيل شاشة) يُركَّب
    فوق هذا المكان تحديداً في المرحلة النهائية بـffmpeg (انظر `run()` —
    `shot_windows` يحسب متى، و`bounding_box` يحسب أين). هنا لا نضع سوى
    حاوية فارغة بنفس القياس؛ الفيديو نفسه ليس جزءاً من صفحة Playwright."""
    frame = d.get("frame", "browser")
    shots = []
    for i, s in enumerate(d.get("shots", [])):
        if isinstance(s, str):
            s = {"src": s}
        fx, fy = (s.get("focus") or [None, None])[:2] if s.get("focus") else (None, None)
        mark = ""
        if fx is not None:
            mark = (f'<div class="mk" style="left:{float(fx)*100:.2f}%;'
                    f'top:{float(fy)*100:.2f}%"><i></i>'
                    + (f'<b>{esc(s["note"])}</b>' if s.get("note") else "")
                    + '</div>')
        cap = (f'<div class="shotcap">{esc(s["note"])}</div>'
               if s.get("note") and fx is None else "")
        if s.get("video"):
            body = f'<div class="vidph"></div>{mark}'
        else:
            body = f'<img src="{_img_b64(s["src"])}">{mark}'
        shots.append(f'<div class="shot" data-i="{i}">{body}</div>{cap}')

    chrome = ""
    if frame == "browser":
        chrome = ('<div class="tbar"><i></i><i></i><i></i>'
                  f'<span>{esc(d.get("url", ""))}</span></div>')
    return (f'<div class="shots {frame}">{chrome}'
            f'<div class="shotwrap">{"".join(shots)}</div></div>')


DEMOS = {"table": demo_table, "chat": demo_chat, "bars": demo_bars,
         "shots": demo_shots}


def demo_html(d):
    body = DEMOS.get(d.get("type", "table"), demo_table)(d)
    # لقطات التجربة تملأ إطارها بنفسها فلا تحتاج بطاقة حولها
    cls = "dev bare" if d.get("type") == "shots" else "dev"
    return ('<div class="wrap dem">'
            f'<div class="kick" id="dkick">{esc(d.get("label", ""))}</div>'
            f'<div class="{cls}" id="dev">{body}</div></div>')


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
        # الأسطر لا تلتفّ في الطرفية (white-space:nowrap)، فالسطر الطويل
        # يُقصّ صامتاً. نقيس أطول سطر ونصغّر الخط ليتّسع بدل أن يضيع نصّه.
        longest = max((len(x) for x in list(src) + list(p.get("out", []))),
                      default=1) + 2          # +2 لبادئة «$ »
        fs = max(26, min(46, int(820 / (0.60 * longest))))
        body = ('<div class="term" id="panel">'
                '<div class="tbar"><i></i><i></i><i></i><span>Terminal</span></div>'
                f'<div class="tbody" style="font-size:{fs}px">{cmd}{out}'
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


def value_html(v, accent, layout="list"):
    items = []
    src = v.get("rows", [])
    for i, r in enumerate(src):
        if isinstance(r, str):
            r = {"title": r}
        # `icon` أولوية على `big`؛ وإن غاب الاثنان يُخمَّن رمزٌ من نص
        # السطر نفسه — سيارة في العنوان تستدعي رسم سيارة لا رقماً مجرّداً.
        ic_name = r.get("icon") or guess_icon(r.get("title", ""), r.get("sub", ""))
        ic = icon(ic_name, accent, 2.2) if ic_name else ""
        cell = ic or (esc(r.get("big", "")) or "◆")
        if layout == "grid":
            items.append(
                f'<div class="vc" data-i="{i}">'
                f'<div class="vn{" ico" if ic else ""}">{cell}</div>'
                f'<b>{esc(r.get("title", ""))}</b>'
                + (f'<span>{esc(r["sub"])}</span>' if r.get("sub") else "")
                + '</div>')
        else:
            items.append(
                f'<div class="vr" data-i="{i}">'
                f'<div class="vn{" ico" if ic else ""}">{cell}</div>'
                f'<div class="vt"><b>{esc(r.get("title", ""))}</b>'
                + (f'<span>{esc(r["sub"])}</span>' if r.get("sub") else "")
                + '</div></div>')
    cls = "vgrid" if layout == "grid" else "vlist"
    if layout == "grid" and len(items) % 2:
        cls += " odd"
    return ('<div class="wrap val">'
            f'<div class="kick" id="vkick">{esc(v.get("label", "لماذا يهمّك"))}</div>'
            f'<div class="{cls}">{"".join(items)}</div></div>')


def cta_html(c, keyword, av, tool, accent, on_accent):
    # صورة صاحب الحساب مقصوصة الخلفية: حضور شخصي في آخر مشهد يرفع التذكّر
    # ويربط الأداة بوجه. تجلس يساراً لأن النص عربي يصطفّ يميناً.
    face = (f'<div class="fring" id="face">'
            f'<img src="data:image/png;base64,{av}"></div>' if av else "")
    if keyword:
        chip = (f'<div class="chip" id="chip"><em>اكتب في التعليقات</em>'
                f'<b>{esc(keyword)}</b></div>')
    else:
        # بلا وعد رد تلقائي على تعليق (النظام لا يملك هذه القدرة حالياً):
        # الشارة الختامية تُري اسم الأداة وعلامتها بدل طلب كتابة كلمة.
        b = brand_chip((tool or {}).get("brand") or (tool or {}).get("name", ""),
                       (tool or {}).get("name", ""), accent, on_accent)
        chip = f'<div class="chip toolchip" id="chip">{b}</div>' if b else ""
    return ('<div class="wrap cta">'
            f'{face}'
            f'<div class="xname" id="xname">{esc(c.get("name", ""))}</div>'
            f'<h1 class="big" id="xtitle">{words(c.get("title", ""))}</h1>'
            f'{chip}'
            f'<div class="xsub" id="xsub">{esc(c.get("sub", ""))}</div>'
            '</div>')


# ═══════════════════════════ الصفحة ═══════════════════════════

def build_html(spec, beat, BEATS):
    # بذرة المحتوى: كل ما يتغيّر تلقائياً (الثيم، تخطيط الغلاف، تخطيط
    # الفائدة، الزخرفة) يُشتقّ منها، فالمنشور نفسه يُعاد بنفس الشكل دوماً
    # لكن موضوعاً مختلفاً يخرج بشكل مختلف بلا أي إعداد يدوي — هذا ما
    # يحقّق «تصميم متغيّر لا قالباً ثابتاً».
    seed = content_seed(spec)

    theme_name = pick_theme(spec)
    t = THEMES[theme_name]
    a, ink, ink2 = t["accent"], t["ink"], t["ink2"]
    glow, on = t["glow"], t["onaccent"]
    light = t.get("light")
    panel_bg = a
    line = f"{ink}1f" if light else f"{ink}24"

    cover_layout = spec.get("cover", {}).get("layout") \
        or _seed_pick(seed, COVER_LAYOUTS, "cover")
    value_layout = spec.get("value", {}).get("layout") \
        or _seed_pick(seed, VALUE_LAYOUTS, "value")

    scenes, total = scene_windows(beat, BEATS)

    av = avatar_b64()
    tool = spec.get("tool", {}) or {}
    layers = "".join(
        f'<div class="layer" id="L{i}">{h}</div>' for i, h in enumerate([
            cover_html(spec.get("cover", {}), tool, a, on, cover_layout),
            demo_html(spec.get("demo", {})),
            value_html(spec.get("value", {}), a, value_layout),
            prompt_html(spec.get("prompt", {})),
            cta_html(spec.get("cta", {}), spec.get("keyword"), av, tool, a, on),
        ]))
    badge = (f'<img class="av" src="data:image/png;base64,{av}">' if av else "")

    # الزخرفة تُختار من بذرة المحتوى لا يدوياً، فيختلف الشكل بين منشور وآخر
    dk = spec.get("decor")
    if dk not in DECOR_KINDS:
        dk = _seed_pick(seed, DECOR_KINDS, "decor")
    dec = decor(dk, a, glow)

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

/* طبقة الزخرفة بين الخلفية والمحتوى: ساكنة بعد ظهورها — لا تنبض ولا
   تتكرّر حركتها، فقط تكسر فراغ الخلفية بشكل هادئ ثابت. */
#dec{{position:absolute;inset:0;pointer-events:none;opacity:.5}}
#dec svg{{position:absolute;inset:0;width:100%;height:100%}}

/* شارة الأداة: لونها لون العلامة لا لون الثيم، فتُعرَف من نظرة */
.brandrow{{margin-top:34px}}
.brand{{display:inline-flex;align-items:center;gap:16px;
  border:2.5px solid var(--bc);border-radius:999px;padding:14px 30px 14px 22px;
  background:color-mix(in srgb, var(--bc) 14%, transparent);
  will-change:transform,opacity}}
.brand svg{{width:44px;height:44px;flex:0 0 auto}}
.brand span{{font-size:36px;font-weight:600;color:var(--bc);direction:ltr;
  letter-spacing:-.5px}}

.ic{{width:62px;height:62px}}
/* الأيقونة تُرسَم أمام العين بدل أن تظهر دفعة واحدة */
.ic path,.ic circle,.ic rect,.ic ellipse{{stroke-dasharray:var(--len,200);
  stroke-dashoffset:var(--off,0)}}

.layer{{position:absolute;inset:0;opacity:0;visibility:hidden}}
.wrap{{position:absolute;left:{PAD_X}px;right:{PAD_X}px;
  top:{TOP}px;bottom:{H - BOTTOM}px;display:flex;flex-direction:column;
  justify-content:center}}

/* ── قائمة الفائدة: تخطيطان — قائمة رأسية، أو بطاقات في شبكة ── */
.vlist{{display:flex;flex-direction:column;gap:26px}}
.vr{{display:flex;align-items:center;gap:28px;background:{ink}0c;
  border:2px solid {line};border-radius:24px;padding:30px 34px;
  will-change:transform,opacity}}
.vn{{flex:0 0 128px;height:112px;display:flex;align-items:center;
  justify-content:center;background:{a};color:{on};border-radius:20px;
  font-size:46px;font-weight:600;letter-spacing:-1px;direction:ltr}}
.vn.ico{{background:{a}1e;border:2.5px solid {a}}}
.vt b{{display:block;font-size:45px;font-weight:600;line-height:1.3}}
.vt span{{display:block;margin-top:8px;font-family:'Plex Arabic',sans-serif;
  font-size:32px;line-height:1.5;color:{ink2}}}

.vgrid{{display:grid;grid-template-columns:1fr 1fr;gap:24px}}
.vgrid.odd .vc:last-child{{grid-column:1 / -1}}
.vc{{display:flex;flex-direction:column;align-items:center;text-align:center;
  gap:14px;background:{ink}0c;border:2px solid {line};border-radius:24px;
  padding:38px 24px;will-change:transform,opacity}}
.vc .vn{{flex:none;width:104px;height:104px}}
.vc b{{display:block;font-size:38px;font-weight:600;line-height:1.32}}
.vc span{{display:block;font-family:'Plex Arabic',sans-serif;font-size:28px;
  line-height:1.5;color:{ink2}}}

.kick{{font-size:31px;font-weight:600;letter-spacing:2.5px;color:{a};
  margin-bottom:28px}}
.kick.alt{{color:{a}}}
.big{{font-size:104px;font-weight:600;line-height:1.2;letter-spacing:-1.2px}}
.w,.aw{{display:inline-block;overflow:hidden;vertical-align:top}}
.w>i,.aw>i{{display:inline-block;font-style:normal;will-change:transform}}
.rule{{height:8px;width:190px;background:{a};border-radius:8px;margin-top:34px}}

/* بطاقة النتيجة: تطلّ من الأسفل، هدوءاً لا ميلاً حاداً */
.rcard{{margin-top:54px;background:{ink}0d;border:2px solid {line};
  border-radius:26px;padding:30px 34px}}
.rl{{font-family:'Plex Arabic',sans-serif;font-size:41px;line-height:1.74;
  color:{ink2}}}
.rl+.rl{{border-top:1px solid {line};margin-top:12px;padding-top:12px}}

/* رسم توضيحي ساكن خلف نص الغلاف — يشرح الموضوع بلا حركة تلفت عنه */
.icplain{{width:100%;height:100%;display:block}}
.cwater{{position:absolute;top:20px;left:-70px;width:300px;height:300px;
  opacity:.09;pointer-events:none}}

/* تخطيط الغلاف الثاني: بطاقة رسومية أعلى العنوان بدل بطاقة نتيجة نصية */
.cov.spot{{justify-content:flex-start;padding-top:8px}}
.cart{{align-self:center;margin-bottom:40px}}
.cartic{{width:220px;height:220px;border-radius:50%;background:{a}16;
  border:2.5px solid {a}40;display:flex;align-items:center;
  justify-content:center;padding:52px}}
.cov.spot .kick,.cov.spot .big{{text-align:center}}
.cov.spot .rcard{{align-self:stretch}}

/* تخطيط الغلاف الثالث: شريط ملوّن ممتلئ كلافتة، لا عمود نصّي بحت */
.cov.geo{{justify-content:flex-start}}
.gband{{background:{a};border-radius:34px;padding:32px 38px;
  display:flex;align-items:center;justify-content:space-between;
  gap:24px;margin-bottom:44px;box-shadow:0 20px 46px {glow}30}}
.gkick{{color:{on};font-size:31px;font-weight:600;letter-spacing:1.5px;
  line-height:1.4}}
.gicon{{width:84px;height:84px;flex:0 0 auto}}
.cov.geo .rcard{{background:{ink}0d;margin-top:8px}}

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

/* ── لقطات التجربة الحقيقية ── */
.dev.bare{{background:transparent;border:0;padding:0;overflow:visible}}
.shots{{border-radius:26px;overflow:hidden;border:2px solid {line};
  background:{"#0E1117" if light else "#070B14"};
  box-shadow:0 24px 60px rgba(0,0,0,.42)}}
.shots.phone{{border-radius:44px;border-width:10px;max-width:660px;
  margin-inline:auto}}
.shots.none{{border:0;box-shadow:none;background:transparent}}
.shotwrap{{position:relative;width:100%;aspect-ratio:4/3;overflow:hidden}}
.shots.phone .shotwrap{{aspect-ratio:9/16}}
.shot{{position:absolute;inset:0;opacity:0;will-change:opacity}}
.shot img{{width:100%;height:100%;object-fit:cover;object-position:50% 0;
  will-change:transform;display:block}}
/* مكان فيديو حقيقي — يُركَّب فوقه لاحقاً بـffmpeg، فلونه هنا لا يظهر أبداً */
.vidph{{width:100%;height:100%;background:#0A0D13}}
/* علامة تشير إلى نقطة في اللقطة: خاتم ينبض وسطر شرح بجانبه */
.mk{{position:absolute;transform:translate(-50%,-50%);
  display:flex;align-items:center;gap:14px;direction:rtl;
  will-change:transform,opacity}}
.mk i{{width:38px;height:38px;border-radius:50%;flex:0 0 auto;
  border:5px solid {a};background:{a}26;box-shadow:0 0 0 8px {glow}30}}
.mk b{{background:{a};color:{on};font-size:29px;font-weight:600;
  padding:12px 22px;border-radius:14px;white-space:nowrap;
  font-family:'Plex Arabic',sans-serif}}
.shotcap{{margin-top:22px;font-family:'Plex Arabic',sans-serif;font-size:33px;
  color:{ink2};text-align:center}}

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
.tl.out{{color:#9FB2CE;font-size:.89em}}
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
/* بديل الشارة حين لا وعد رد تلقائي: اسم الأداة وعلامتها بدل طلب تعليق */
.chip.toolchip{{background:transparent;padding:0;box-shadow:none}}
.chip.toolchip .brand{{padding:24px 46px;border-width:3px}}
.chip.toolchip .brand svg{{width:58px;height:58px}}
.chip.toolchip .brand span{{font-size:46px}}
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
  <div id="bg"></div><div id="dec">{dec}</div><div id="grain"></div>
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

// طول كل مسار أيقونة يُقاس مرّة واحدة، ليُرسَم بعدها بتحريك dashoffset
const ICP = [...Q('.ic')].map(sv => {{
  const ps = [...sv.querySelectorAll('path,circle,rect,ellipse')];
  ps.forEach(p => {{ let L = 200;
    try {{ L = p.getTotalLength() || 200; }} catch (e) {{}}
    p.style.setProperty('--len', L); p.dataset.len = L; }});
  return ps;
}});
function drawIcon(i, p) {{
  const ps = ICP[i]; if (!ps) return;
  ps.forEach((el, k) => {{
    const q = cl((p - k*0.08) / 0.72, 0, 1);
    el.style.setProperty('--off', (1 - outQ(q)) * (+el.dataset.len));
  }});
}}
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
  // شارة الأداة تدخل متأخّرة قليلاً، ثم تسكن — بلا نبض متكرر
  const bd = G('cbrand');
  if (bd) {{ const p = cl((lt-0.34)/0.52,0,1);
    bd.style.opacity = p;
    bd.style.transform = `translateY(${{(1-back(p))*22}}px) scale(${{0.94+0.06*back(p)}})`; }}
  // تخطيط "spotlight": بطاقة الرسم الدائرية ظاهرة كاملةً منذ الإطار صفر
  // (كما يلزم لغلاف إنستقرام) وتستقرّ بتمدّد خفيف لا بظهور من عدم. والرسم
  // التوضيحي الساكن (.cwater) شفافيته ثابتة من CSS مباشرة للسبب نفسه.
  const ca = G('cart');
  if (ca) {{ const p = cl(lt/0.5,0,1);
    ca.style.transform = `scale(${{0.94+0.06*outQ(p)}})`; }}
  // تخطيط "geo": الشريط الملوّن كامل منذ الإطار صفر أيضاً، يستقرّ بتمدّد فقط
  const gb = G('gband');
  if (gb) {{ const p = cl(lt/0.48,0,1);
    gb.style.transform = `scale(${{0.96+0.04*outQ(p)}})`; }}
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

  // لقطات التجربة: كل لقطة تُعرض عدداً صحيحاً من النبضات، وتتحرّك ببطء
  // وهي معروضة (كين بيرنز) فلا يجمد الكادر، والانتقال قطعٌ على الضربة.
  const shots = [...Q('#L1 .shot')];
  if (shots.length) {{
    const lead = 0.34;
    const each = Math.max(BEAT*2, (dur - lead) / shots.length);
    shots.forEach((el, i) => {{
      const t0 = lead + i*each;
      const on = (lt >= t0 - 0.001) && (lt < t0 + each || i === shots.length-1);
      el.style.opacity = on ? 1 : 0;
      if (!on) return;
      const k = cl((lt - t0) / each, 0, 1);           // تقدّم داخل اللقطة
      const img = el.querySelector('img');
      if (img) {{
        // تكبير بطيء مع انجراف: اتجاه الانجراف يتبادل بين لقطة وأخرى
        const dir = i % 2 ? -1 : 1;
        img.style.transform =
          `scale(${{1.06 + 0.05*k}}) translate(${{dir*k*2.0}}%, ${{-k*1.6}}%)`;
      }}
      const mk = el.querySelector('.mk');
      if (mk) {{
        const p = cl((lt - t0 - 0.30) / 0.42, 0, 1);
        mk.style.opacity = p;
        mk.style.transform = `translate(-50%,-50%) scale(${{0.82+0.18*back(p)}})`;
      }}
    }});
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
    h.style.opacity = p*0.95; }}
}}

// كل سطر فائدة يظهر تباعاً بمهلة هادئة — قائمة أو بطاقات شبكة
function sceneValue(lt) {{
  const k = G('vkick');
  if (k) {{ const p = cl(lt/0.30,0,1);
    k.style.opacity = p; k.style.transform = `translateX(${{(1-outC(p))*26}}px)`; }}
  stagger([...Q('#L2 .vr,#L2 .vc')], lt, 0.26, BEAT*0.62, 0.5, (el,p,i) => {{
    el.style.opacity = p;
    el.style.transform =
      `translateY(${{(1-back(p))*30}}px) scale(${{0.985+0.015*outQ(p)}})`;
    // الأيقونة تُرسَم بعد ظهور البطاقة بقليل: الحركة تتتابع ولا تتزاحم
    drawIcon(i, cl((p - 0.30) / 0.70, 0, 1));
  }});
}}

function sceneCta(lt) {{
  stagger([...Q('#xtitle .w>i')], lt, 0.30, 0.05, 0.46,
    (el,p) => {{ el.style.transform = `translateY(${{(1-back(p))*105}}%)`; }});
  const c = G('chip');
  if (c) {{
    const p = cl((lt-0.34)/0.46,0,1);
    c.style.opacity = p;
    c.style.transform = `translateY(${{(1-back(p))*36}}px)`;
    c.style.filter = 'drop-shadow(0 10px 24px rgba(0,0,0,.18))';
  }}
  const s = G('xsub');
  if (s) {{ const p = cl((lt-0.62)/0.42,0,1);
    s.style.opacity = p; s.style.transform = `translateY(${{(1-outC(p))*20}}px)`; }}
  const nm = G('xname');
  if (nm) {{ const p = cl((lt-0.26)/0.34,0,1);
    nm.style.opacity = p; nm.style.transform = `translateY(${{(1-outC(p))*16}}px)`; }}
  // الصورة أول ما يظهر: تكبر من ٨٨٪ مع تجاوز خفيف، ثم تسكن — بلا نبض
  const f = G('face');
  if (f) {{
    const p = cl(lt/0.52,0,1);
    f.style.opacity = cl(p*1.6,0,1);
    f.style.transform = `scale(${{0.88+0.12*back(p)}})`;
    f.style.boxShadow = `0 26px 60px rgba(0,0,0,.46), 0 0 26px 6px {glow}4d`;
  }}
}}

const RUN = [sceneCover, sceneDemo, sceneValue, scenePrompt, sceneCta];

// مدة المزج بين مشهدين: انتقال هادئ بلا قطع حادّ ولا تكبير مفاجئ —
// هذا ما يستبدل «القطع على الضربة» في النسخة السابقة. رُفعت إلى ~ثانية
// بطلب صاحب الحساب: تعطي المشاهد وقتاً يحسّ فيه بتبدّل المشهد لا يفاجَأ به.
const CF = 0.95;

window.setT = function (t) {{
  t = cl(t, 0, TOTAL);
  let cur = 0;
  for (let i = 0; i < SCENES.length; i++)
    if (t >= SCENES[i].start - 1e-6) cur = i;
  const sc = SCENES[cur];
  const lt = t - sc.start;
  const prev = cur > 0 ? cur - 1 : -1;
  const fading = prev >= 0 && lt < CF;
  const mix = fading ? outC(lt / CF) : 1;   // 0 → مشهد سابق فقط، 1 → مشهد حالي فقط

  for (let i = 0; i < L.length; i++) {{
    let op = 0;
    if (i === cur) op = mix;
    else if (i === prev && fading) op = 1 - mix;
    L[i].style.opacity = op;
    L[i].style.visibility = op > 0.002 ? 'visible' : 'hidden';
    L[i].style.transform = 'none';
    L[i].style.filter = 'none';
  }}

  RUN[cur](lt, sc.dur);

  // انجراف خلفية بطيء جداً واحد الاتجاه — يمنع سكون الكادر التام بلا أن
  // يتكرّر بنمط ملحوظ يشي بأنه آلي.
  const bg = document.getElementById('bg');
  bg.style.transform = `translate(${{Math.sin(t*0.045)*10}}px, ${{-t*2.6}}px) scale(1.03)`;
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

    # بلا موسيقى بطلب صريح من صاحب الحساب (٢٠٢٦-٠٩-١٣): «نبضة» توقيت
    # ثابتة هادئة توزّع ظهور العناصر تباعاً، لا صلة لها بصوت — الفيديو
    # يُصدَّر بصوت صامت (انظر أسفله) لتوافقه مع منصّات تتوقّع مسار صوت.
    beat = CALM_BEAT
    BEATS, nbeats = plan_beats(beat)

    html = build_html(spec, beat, BEATS)
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

        n = int(total * fps)

        # لقطات فيديو حقيقي (`shots[].video`): تُركَّب فوق مكان اللقطة في
        # مرحلة التركيب النهائي بـffmpeg، لا داخل صفحة Playwright — أدق
        # وأسرع من محاولة تشغيل <video> وتصويره إطاراً إطاراً. المكان
        # (نفس المربّع لكل اللقطات، تتبادل الظهور بالشفافية فقط) يُقاس من
        # الصفحة الحيّة لا يُحسب يدوياً، والزمن من `shot_windows` بايثون
        # نسخةً طبق الأصل عن حساب التوقيت في JS.
        demo = spec.get("demo", {}) or {}
        vshots = [(i, s) for i, s in enumerate(demo.get("shots", []))
                  if isinstance(s, dict) and s.get("video")]
        overlay_inputs, filter_parts = [], []
        if vshots and demo.get("type", "table") == "shots":
            scenes, _ = scene_windows(beat, BEATS)
            demo_scene = next(sc for sc in scenes if sc["k"] == "demo")
            windows = shot_windows(demo, demo_scene["start"], demo_scene["dur"], beat)
            box = await page.evaluate(
                "() => { const el = document.querySelector('.shotwrap');"
                " if (!el) return null; const r = el.getBoundingClientRect();"
                " return {x:r.x, y:r.y, w:r.width, h:r.height}; }")
            if not box:
                print("⚠ لا يوجد .shotwrap — تُتجاهَل لقطات الفيديو.")
            else:
                bx, by = int(round(box["x"])), int(round(box["y"]))
                bw = int(round(box["w"])) // 2 * 2
                bh = int(round(box["h"])) // 2 * 2
                for i, s in vshots:
                    vp = pathlib.Path(s["video"])
                    if not vp.is_absolute():
                        vp = pathlib.Path.cwd() / vp
                    if not vp.exists():
                        print(f"⚠ فيديو غير موجود، تُتجاهَل هذه اللقطة: {vp}")
                        continue
                    t0, t1 = windows[i]
                    dur = max(0.1, t1 - t0)
                    # 0=الإطارات 1=anullsrc، وبعدها مدخل لكل لقطة فيديو بالترتيب
                    idx = 2 + sum(1 for p in filter_parts)
                    src_start = float(s.get("start", 0) or 0)
                    overlay_inputs += ["-ss", f"{src_start:.3f}", "-stream_loop", "-1",
                                        "-t", f"{dur:.3f}", "-i", str(vp)]
                    filter_parts.append(
                        (idx, bw, bh, bx, by, t0, t1))
                    print(f"  لقطة فيديو {i}: {vp.name} من {src_start:.1f}ث في "
                          f"المصدر، تُعرض {t0:.2f}–{t1:.2f}ث في {bw}x{bh}+{bx}+{by}")

        # صوت صامت لا موسيقى: مسار صوت فارغ فقط لتوافق الحاوية مع منصّات
        # تتوقّع مساراً صوتياً في كل فيديو (بعضها يرفض ملفاً بلا صوت إطلاقاً).
        cmd = [
            _ffmpeg(), "-y", "-loglevel", "error",
            "-f", "image2pipe", "-framerate", str(fps), "-i", "-",
            "-f", "lavfi", "-i", f"anullsrc=r=44100:cl=stereo",
            *overlay_inputs,
        ]
        if filter_parts:
            chain, label = [], "0:v"
            for n_, (idx, bw, bh, bx, by, t0, t1) in enumerate(filter_parts):
                chain.append(
                    f"[{idx}:v]scale={bw}:{bh}:force_original_aspect_ratio=increase,"
                    f"crop={bw}:{bh},setpts=PTS-STARTPTS+{t0:.3f}/TB[ov{n_}]")
                nxt = f"vout{n_}"
                chain.append(
                    f"[{label}][ov{n_}]overlay=x={bx}:y={by}:"
                    f"enable='between(t,{t0:.3f},{t1:.3f})'[{nxt}]")
                label = nxt
            cmd += ["-filter_complex", ";".join(chain), "-map", f"[{label}]", "-map", "1:a"]
        cmd += [
            "-c:v", "libx264", "-preset", "medium",
            "-b:v", "7M", "-minrate", "5M", "-maxrate", "9M", "-bufsize", "14M",
            "-pix_fmt", "yuv420p", "-r", str(fps),
            "-c:a", "aac", "-b:a", "48k", "-shortest",
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
        if proc.returncode != 0:
            print(err)
            sys.exit(1)
        cutstr = " · ".join(f"{c:.2f}" for c in cuts)
        beats = " · ".join(f"{k}:{BEATS[k]}" for k in ORDER)
        print(f"\n✓ {out} — {total:.2f}ث ({nbeats} نبضة · {beats}) · "
              f"{out.stat().st_size / 1e6:.1f} ميغابايت · ثيم "
              f"{pick_theme(spec)} (بلا موسيقى)"
              f"\n  انتقالات عند: {cutstr}")


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
