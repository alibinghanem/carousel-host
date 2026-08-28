#!/usr/bin/env python3
"""مكتبة الرسوم والأيقونات والعلامات التجارية للريلز.

المونتاج بلا رسوم يبقى «نصاً يتحرّك». هذه الوحدة تعطي المحرّك ثلاث طبقات
بصرية يركّبها فوق المحتوى:

  ١) `ICONS` — أيقونات دلالية بخطوط SVG تُرسَم أمام العين (stroke-dashoffset)
     بدل أن تظهر دفعةً واحدة. لكل مفهوم أيقونة: قفل، سحابة، ملف، ساعة…
  ٢) `BRANDS` — علامات الأدوات المذكورة: الاسم بلونه ورمزه المبسّط. الاستعمال
     تعريفيّ — نسمّي الأداة التي نشرحها — وهو الاستعمال المسموح للعلامة.
     الرموز مرسومة تبسيطاً لا نسخاً للشعار الرسمي.
  ٣) `decor()` — أشكال زخرفية تتنفّس مع الإيقاع: حلقات، شبكات، أقواس، بقع
     ضوء. تملأ الفراغ وتعطي الكادر عمقاً بلا سرقة الانتباه من النص.

كل الرسوم متجهية ومضمّنة في الصفحة — لا تحميل ولا اعتماد على الشبكة.
"""

# ══════════════════════ الأيقونات ══════════════════════
# كل أيقونة مسارات على شبكة 24×24 برسم بالخطوط لا بالتعبئة، ليمكن
# «رسمها» بالحركة. القيمة دالة تأخذ اللون وتعيد محتوى <svg>.

_I = {
    "lock": '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/>'
            '<path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/><path d="M12 14.5v2.5"/>',
    "cloud_off": '<path d="M6.5 18.5h10a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.9 9.2"/>'
                 '<path d="M3.5 3.5l17 17"/>',
    "file": '<path d="M14 3.5H7.5A2 2 0 0 0 5.5 5.5v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8z"/>'
            '<path d="M14 3.5V8h4.5"/><path d="M9 13h6"/><path d="M9 16.5h4"/>',
    "clock": '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.4 2"/>',
    "bolt": '<path d="M13.5 2.5 5 13.5h6l-.5 8 8.5-11h-6z"/>',
    "chip": '<rect x="7.5" y="7.5" width="9" height="9" rx="1.6"/>'
            '<rect x="4" y="4" width="16" height="16" rx="3"/>'
            '<path d="M9.5 4V1.8M14.5 4V1.8M9.5 22.2V20M14.5 22.2V20'
            'M4 9.5H1.8M4 14.5H1.8M22.2 9.5H20M22.2 14.5H20"/>',
    "chart": '<path d="M4 20h16"/><rect x="6" y="12" width="3.2" height="6" rx="1"/>'
             '<rect x="10.9" y="8" width="3.2" height="10" rx="1"/>'
             '<rect x="15.8" y="4.5" width="3.2" height="13.5" rx="1"/>',
    "wallet": '<rect x="3.5" y="6" width="17" height="13" rx="2.5"/>'
              '<path d="M3.5 10h17"/><circle cx="16.5" cy="14.5" r="1.3"/>',
    "shield": '<path d="M12 3 5 6v5.5c0 4.3 2.9 7.9 7 9.5 4.1-1.6 7-5.2 7-9.5V6z"/>'
              '<path d="M9 12l2.2 2.2L15.5 10"/>',
    "phone": '<rect x="6.5" y="2.5" width="11" height="19" rx="2.6"/>'
             '<path d="M10.5 5.5h3"/><path d="M10.8 18.6h2.4"/>',
    "sparkle": '<path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9z"/>'
               '<path d="M18.5 3v3M20 4.5h-3"/>',
    "search": '<circle cx="11" cy="11" r="6.5"/><path d="M15.8 15.8 20.5 20.5"/>',
    "translate": '<path d="M3.5 5.5h9"/><path d="M8 3.5v2"/>'
                 '<path d="M10.5 5.5c-.6 4-3.2 7.3-7 8.8"/>'
                 '<path d="M5.5 9.5c1.2 2.4 3.2 4.2 5.6 5.1"/>'
                 '<path d="M12.5 20.5l4-9.5 4 9.5"/><path d="M13.9 17.4h5.2"/>',
    "mic": '<rect x="9.5" y="2.5" width="5" height="10.5" rx="2.5"/>'
           '<path d="M5.5 11.5a6.5 6.5 0 0 0 13 0"/><path d="M12 18v3.5"/>',
    "code": '<path d="M8.5 8 4 12l4.5 4"/><path d="M15.5 8 20 12l-4.5 4"/>'
            '<path d="M13.6 4.5 10.4 19.5"/>',
    "download": '<path d="M12 3.5v11"/><path d="M7.5 10.5 12 15l4.5-4.5"/>'
                '<path d="M4 18.5h16"/>',
    "check": '<circle cx="12" cy="12" r="8.5"/><path d="M8.2 12.3 11 15l5-5.6"/>',
    "warn": '<path d="M12 3.5 21 19.5H3z"/><path d="M12 9.5v4.2"/><path d="M12 16.6v.1"/>',
}


def icon(name, color, w=2.1):
    """<svg> لأيقونة، بخطوط قابلة لأن تُرسَم بالحركة."""
    body = _I.get(name)
    if not body:
        return ""
    return (f'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round">'
            f'{body}</svg>')


ICON_NAMES = tuple(_I)


# ══════════════════════ العلامات التجارية ══════════════════════
# رمز مبسّط + لون العلامة. الاستعمال تعريفيّ: نسمّي الأداة التي يشرحها
# الريلز. الرموز مرسومة تبسيطاً على شبكة 24×24، لا شعارات رسمية منسوخة.

BRANDS = {
    "chatgpt":  {"label": "ChatGPT",  "color": "#10A37F",
                 "mark": '<circle cx="12" cy="12" r="8.4"/>'
                         '<path d="M12 6.4v11.2M7.2 9.2l9.6 5.6M16.8 9.2l-9.6 5.6"/>'},
    "gemini":   {"label": "Gemini",   "color": "#4285F4",
                 "mark": '<path d="M12 2.6c.7 5 3.7 8 8.7 8.7-5 .7-8 3.7-8.7 8.7'
                         '-.7-5-3.7-8-8.7-8.7 5-.7 8-3.7 8.7-8.7z"/>'},
    "claude":   {"label": "Claude",   "color": "#D97757",
                 "mark": '<path d="M7.6 18 12 5.6 16.4 18"/><path d="M9.3 14.2h5.4"/>'},
    "copilot":  {"label": "Copilot",  "color": "#2F7DF6",
                 "mark": '<path d="M4.5 13.5c0-3.6 3.4-6.4 7.5-6.4s7.5 2.8 7.5 6.4'
                         'c0 2.4-2 3.9-4.2 3.9H8.7c-2.2 0-4.2-1.5-4.2-3.9z"/>'
                         '<path d="M9.4 12.6v1.6M14.6 12.6v1.6"/>'},
    "ollama":   {"label": "Ollama",   "color": "#B8B8B8",
                 "mark": '<ellipse cx="12" cy="14.6" rx="6.6" ry="5.6"/>'
                         '<path d="M7.4 9.6C6.6 6.2 7.4 3.6 8.6 3.6c1.1 0 1.9 2 1.9 4.6"/>'
                         '<path d="M16.6 9.6c.8-3.4 0-6-1.2-6-1.1 0-1.9 2-1.9 4.6"/>'},
    "notebooklm": {"label": "NotebookLM", "color": "#4285F4",
                   "mark": '<rect x="4.5" y="3.5" width="15" height="17" rx="2.4"/>'
                           '<path d="M8.6 3.5v17"/><path d="M12 8.4h4.2M12 12h4.2M12 15.6h2.6"/>'},
    "perplexity": {"label": "Perplexity", "color": "#20A5B5",
                   "mark": '<path d="M12 3.4v17.2"/>'
                           '<path d="M12 8.2 5.6 3.8v7.4h12.8V3.8L12 8.2z"/>'
                           '<path d="M5.6 12.8v7.4L12 15.8l6.4 4.4v-7.4"/>'},
    "canva":    {"label": "Canva",    "color": "#00C4CC",
                 "mark": '<circle cx="12" cy="12" r="8.6"/>'
                         '<path d="M14.6 9.4a3.4 3.4 0 0 0-5.1 1.2c-.9 2.1-.2 4.3 1.6 4.8'
                         '1.3.4 2.6-.3 3.3-1.5"/>'},
    "whisper":  {"label": "Whisper",  "color": "#8B5CF6",
                 "mark": '<rect x="9.5" y="2.6" width="5" height="10.4" rx="2.5"/>'
                         '<path d="M5.6 11.6a6.4 6.4 0 0 0 12.8 0"/><path d="M12 18v3.4"/>'},
}

GENERIC_BRAND = {"label": "", "color": "", "mark": _I["sparkle"]}


def brand_chip(key, label, accent, on_accent):
    """شارة الأداة: رمزها ولونها واسمها. تُذكر الأداة بصرياً لا نصّاً فقط."""
    b = BRANDS.get((key or "").lower().replace(" ", ""))
    if b:
        color, mark, text = b["color"], b["mark"], (label or b["label"])
    else:
        color, mark, text = accent, GENERIC_BRAND["mark"], (label or key or "")
    if not text:
        return ""
    return (f'<div class="brand" style="--bc:{color}">'
            f'<svg viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="1.9" '
            f'stroke-linecap="round" stroke-linejoin="round">{mark}</svg>'
            f'<span>{text}</span></div>')


# ══════════════════════ الزخرفة الخلفية ══════════════════════

def decor(kind, accent, glow):
    """طبقة أشكال خلف المحتوى. تتحرّك مع الإيقاع في setT."""
    if kind == "rings":
        return ('<svg class="dec" viewBox="0 0 1080 1920" fill="none" '
                f'stroke="{accent}" stroke-width="2">'
                '<circle class="d1" cx="880" cy="320" r="210" opacity=".22"/>'
                '<circle class="d2" cx="880" cy="320" r="320" opacity=".13"/>'
                '<circle class="d3" cx="150" cy="1500" r="260" opacity=".16"/>'
                '</svg>')
    if kind == "grid":
        return ('<svg class="dec" viewBox="0 0 1080 1920" fill="none" '
                f'stroke="{accent}" stroke-width="1.4" opacity=".18">'
                + "".join(f'<path class="d{i%3+1}" d="M0 {y} H1080"/>'
                          for i, y in enumerate(range(160, 1920, 190)))
                + "".join(f'<path class="d{i%3+1}" d="M{x} 0 V1920"/>'
                          for i, x in enumerate(range(140, 1080, 190)))
                + '</svg>')
    if kind == "arcs":
        return ('<svg class="dec" viewBox="0 0 1080 1920" fill="none" '
                f'stroke="{accent}" stroke-width="2.6">'
                '<path class="d1" d="M-60 640 Q 380 300 1140 560" opacity=".26"/>'
                '<path class="d2" d="M-60 780 Q 420 420 1140 700" opacity=".16"/>'
                '<path class="d3" d="M-60 1420 Q 500 1120 1140 1360" opacity=".2"/>'
                '</svg>')
    if kind == "dots":
        pts = []
        for r in range(9):
            for c in range(7):
                pts.append(f'<circle class="d{(r+c)%3+1}" cx="{110+c*145}" '
                           f'cy="{230+r*185}" r="5"/>')
        return ('<svg class="dec" viewBox="0 0 1080 1920" '
                f'fill="{accent}" opacity=".26">{"".join(pts)}</svg>')
    if kind == "beams":
        return ('<svg class="dec" viewBox="0 0 1080 1920" fill="none">'
                f'<defs><linearGradient id="bm" x1="0" y1="0" x2="1" y2="1">'
                f'<stop offset="0" stop-color="{glow}" stop-opacity=".30"/>'
                f'<stop offset="1" stop-color="{glow}" stop-opacity="0"/>'
                '</linearGradient></defs>'
                '<path class="d1" d="M-200 0 L420 0 L120 1920 L-500 1920z" fill="url(#bm)"/>'
                '<path class="d2" d="M700 0 L1180 0 L1480 1920 L1000 1920z" fill="url(#bm)"/>'
                '</svg>')
    return ""


DECOR_KINDS = ("rings", "grid", "arcs", "dots", "beams")
