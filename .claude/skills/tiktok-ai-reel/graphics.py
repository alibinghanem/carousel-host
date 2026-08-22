#!/usr/bin/env python3
"""
مكتبة الرسومات التوضيحية للريلز — أيقونات SVG ومخططات (مسار، حلقة نسبة،
أعمدة، شبكة وكيل، طبقات، شبكة أيقونات).

كل الرسومات تستخدم متغيرات CSS: var(--a1) var(--a2) var(--ink) var(--line)
var(--muted) — فتتناسق تلقائياً مع ستايل ولون المشهد.
"""

# ————————————————————————— الأيقونات —————————————————————————
# مسارات على شبكة 24×24 · stroke-based · تُرسم بـ currentColor

ICONS = {
    "bolt":     '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
    "gear":     '<circle cx="12" cy="12" r="3.1"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    "bot":      '<rect x="4" y="8" width="16" height="12" rx="3.5"/><path d="M12 4v4M9 14h.01M15 14h.01M9.5 17.2h5"/><circle cx="12" cy="3" r="1.4"/>',
    "doc":      '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    "mail":     '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    "calendar": '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
    "chart":    '<path d="M4 21V3"/><path d="M4 21h17"/><rect x="7.5" y="12" width="3.2" height="6" rx="1"/><rect x="13" y="8" width="3.2" height="10" rx="1"/><rect x="18.5" y="4.5" width="3.2" height="13.5" rx="1" transform="translate(-2 0)"/>',
    "chip":     '<rect x="7" y="7" width="10" height="10" rx="2.2"/><path d="M10 2v3M14 2v3M10 19v3M14 19v3M2 10h3M2 14h3M19 10h3M19 14h3"/>',
    "cloud":    '<path d="M17.5 19.5H7a4.5 4.5 0 0 1-.6-8.96 6 6 0 0 1 11.5 1.6 3.7 3.7 0 0 1-.4 7.36z"/>',
    "clock":    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.4 2"/>',
    "check":    '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.8 2.8L16 9.9"/>',
    "users":    '<circle cx="9" cy="8" r="3.4"/><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0"/><path d="M16.5 5.2a3.4 3.4 0 0 1 0 6.6M17.5 14.4a6.2 6.2 0 0 1 3.7 5.6"/>',
    "search":   '<circle cx="11" cy="11" r="7"/><path d="m16.2 16.2 4.3 4.3"/>',
    "sparkle":  '<path d="M12 3.2 14 9l5.8 2-5.8 2-2 5.8-2-5.8L4.2 11 10 9z"/><path d="M19 3.5v3M17.5 5h3"/>',
    "database": '<ellipse cx="12" cy="6" rx="8" ry="3.2"/><path d="M4 6v12c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2V6"/><path d="M4 12c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2"/>',
    "link":     '<path d="M10 13.5a4 4 0 0 0 5.7.3l3-3a4 4 0 0 0-5.7-5.7l-1.7 1.7"/><path d="M14 10.5a4 4 0 0 0-5.7-.3l-3 3a4 4 0 0 0 5.7 5.7l1.7-1.7"/>',
    "shield":   '<path d="M12 2.5 20 6v6.2c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6z"/><path d="m8.6 12 2.4 2.4 4.4-4.6"/>',
    "target":   '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
    "rocket":   '<path d="M12 2.5c3.4 2.4 5.2 6 5.2 10.2L12 18l-5.2-5.3C6.8 8.5 8.6 4.9 12 2.5z"/><circle cx="12" cy="10" r="2.1"/><path d="M8.4 16.4 5.6 21l4.8-2.2M15.6 16.4 18.4 21l-4.8-2.2"/>',
    "lock":     '<rect x="4.5" y="10" width="15" height="11" rx="2.6"/><path d="M8 10V7.2a4 4 0 0 1 8 0V10"/>',
    "filter":   '<path d="M21.5 3.5h-19l7.6 9v6.2l3.8 1.8V12.5z"/>',
    "refresh":  '<path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M20.8 3.6v5h-5"/>',
    "message":  '<path d="M21 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-5 4V5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5z"/><path d="M8 9h8M8 12.5h5"/>',
    "code":     '<path d="m8.5 8-5 4 5 4M15.5 8l5 4-5 4M13.6 4.5l-3.2 15"/>',
    "money":    '<circle cx="12" cy="12" r="9"/><path d="M14.8 8.6A3.2 3.2 0 0 0 12 7.2c-1.8 0-3.2 1-3.2 2.4 0 3.2 6.4 1.6 6.4 4.8 0 1.4-1.4 2.4-3.2 2.4a3.2 3.2 0 0 1-2.8-1.4M12 5.4v13.2"/>',
    "warn":     '<path d="M12 3.2 22 20H2z"/><path d="M12 9.5v4.2M12 16.6h.01"/>',
    "eye":      '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
}


def icon(name, size=52, cls="", extra=""):
    """أيقونة SVG بحجم محدد — تأخذ لونها من currentColor."""
    p = ICONS.get(name) or ICONS["sparkle"]
    return (f'<svg class="ic {cls}" width="{size}" height="{size}" viewBox="0 0 24 24" '
            f'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" '
            f'stroke-linejoin="round" {extra}>{p}</svg>')


import math


def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _a(anim, d=0.0, du=0.7, extra=""):
    return f'data-a="{anim}" data-d="{round(d,3)}" data-du="{du}" {extra}'


# ————————————————————————— ١ · مخطط المسار —————————————————————————

CHEV = ('<svg class="chev" width="34" height="34" viewBox="0 0 24 24" fill="none" '
        'stroke="currentColor" stroke-width="2.4" stroke-linecap="round" '
        'stroke-linejoin="round"><path d="M12 5v13M6.5 12.5 12 18l5.5-5.5"/></svg>')


def flow(nodes, d0=0.35):
    """مسار عمودي: صندوق ← سهم ← صندوق … يوضّح تسلسل الأتمتة."""
    out = ['<div class="flow">']
    for i, n in enumerate(nodes[:4]):
        d = d0 + i * 0.34
        out.append(
            f'<div class="fnode" {_a("slide", d, 0.62)}>'
            f'<div class="fic">{icon(n.get("icon","sparkle"), 46)}</div>'
            f'<div class="ftx"><b>{esc(n.get("label",""))}</b>'
            + (f'<span>{esc(n["note"])}</span>' if n.get("note") else "")
            + '</div></div>')
        if i < len(nodes[:4]) - 1:
            out.append(f'<div class="farrow" {_a("fade", d + 0.17, 0.3)}>{CHEV}</div>')
    out.append("</div>")
    return "".join(out)


# ————————————————————————— ٢ · حلقة النسبة —————————————————————————

def ring(pct, label="", d0=0.3):
    r, cx, cy = 150, 220, 220
    L = 2 * math.pi * r
    return f'''<div class="ringwrap">
  <svg class="ringsvg" width="440" height="440" viewBox="0 0 440 440" fill="none">
    <circle cx="{cx}" cy="{cy}" r="{r}" stroke="var(--line)" stroke-width="34"/>
    <circle cx="{cx}" cy="{cy}" r="{r}" stroke="var(--a1)" stroke-width="34"
      stroke-linecap="round" transform="rotate(-90 {cx} {cy})"
      style="stroke-dasharray:{L:.1f};stroke-dashoffset:{L:.1f}"
      {_a("ring", d0, 1.25, f'data-len="{L:.1f}" data-pct="{pct}"')}/>
  </svg>
  <div class="ringmid">
    <div class="ringnum" {_a("count", d0, 1.25, f'data-v="{pct}%"')} dir="ltr">{pct}%</div>
    {f'<div class="ringlab" {_a("fade", d0+0.6, 0.5)}>{esc(label)}</div>' if label else ''}
  </div>
</div>'''


# ————————————————————————— ٣ · أعمدة أفقية —————————————————————————

def bars(items, unit="", d0=0.35):
    mx = max([float(i.get("v", 0)) for i in items] + [1])
    out = ['<div class="bars">']
    for i, it in enumerate(items[:4]):
        v = float(it.get("v", 0))
        w = max(6.0, v / mx * 100)
        d = d0 + i * 0.26
        out.append(
            f'<div class="brow" {_a("fade", d, 0.4)}>'
            f'<div class="blab">{esc(it.get("label",""))}</div>'
            f'<div class="btrack"><i class="bfill{" hi" if it.get("hi") else ""}" '
            f'style="width:{w:.1f}%" {_a("growx", d + 0.08, 0.75)}></i></div>'
            f'<div class="bval" dir="ltr">{esc(it.get("v",""))}<small>{esc(unit)}</small></div>'
            '</div>')
    out.append("</div>")
    return "".join(out)


# ————————————————————————— ٤ · شبكة الوكيل —————————————————————————

def hub(center, nodes, d0=0.3):
    """شبكة وكيل: عقدة مركزية + أدوات حولها موصولة بخطوط."""
    W, H = 888, 790
    cx, cy, R, SQ = W / 2, 392.0, 262.0, 0.84
    n = max(1, min(len(nodes), 6))
    pts = []
    for i in range(n):
        ang = -math.pi / 2 + i * (2 * math.pi / n)
        pts.append((cx + math.cos(ang) * R, cy + math.sin(ang) * R * SQ))

    parts = [f'<svg class="hubsvg" viewBox="0 0 {W} {H}" fill="none" direction="rtl">']
    for i, (x, y) in enumerate(pts):
        parts.append(f'<line x1="{cx}" y1="{cy}" x2="{x:.1f}" y2="{y:.1f}" '
                     f'stroke="var(--line)" stroke-width="3" stroke-dasharray="10 10" '
                     f'{_a("fade", d0 + 0.24 + i * 0.09, 0.35)}/>')
    parts.append(f'<circle cx="{cx}" cy="{cy}" r="134" fill="var(--a1)" opacity=".13" '
                 f'{_a("pop", d0, 0.7)}/>')
    parts.append(f'<circle cx="{cx}" cy="{cy}" r="110" fill="var(--bg)" stroke="var(--a1)" '
                 f'stroke-width="5" {_a("pop", d0 + 0.06, 0.7)}/>')
    parts.append(f'<text x="{cx}" y="{cy+13}" text-anchor="middle" fill="var(--ink)" '
                 f'font-size="38" font-weight="800" font-family="Cairo,sans-serif" '
                 f'{_a("fade", d0 + 0.22, 0.5)}>{esc(center)}</text>')

    for i, (x, y) in enumerate(pts):
        it = nodes[i]
        lab = it if isinstance(it, str) else it.get("label", "")
        ic = "sparkle" if isinstance(it, str) else it.get("icon", "sparkle")
        ly = y - 92 if y < cy - 20 else y + 96       # التسمية دائماً بعيداً عن المركز
        d = d0 + 0.44 + i * 0.11
        parts.append(
            f'<g {_a("pop", d, 0.6)}>'
            f'<circle cx="{x:.1f}" cy="{y:.1f}" r="64" fill="var(--panel)" '
            f'stroke="var(--line)" stroke-width="3"/>'
            f'<g transform="translate({x-18.6:.1f} {y-18.6:.1f}) scale(1.55)" '
            f'stroke="var(--a1)" stroke-width="1.7" fill="none" '
            f'stroke-linecap="round" stroke-linejoin="round">'
            f'{ICONS.get(ic, ICONS["sparkle"])}</g>'
            f'<text x="{x:.1f}" y="{ly:.1f}" text-anchor="middle" fill="var(--muted)" '
            f'font-size="29" font-weight="700" font-family="Cairo,sans-serif">'
            f'{esc(lab)}</text></g>')
    parts.append("</svg>")
    return "".join(parts)


# ————————————————————————— ٥ · الطبقات —————————————————————————

def layers(items, d0=0.35):
    out = ['<div class="layers">']
    for i, it in enumerate(items[:5]):
        lab = it if isinstance(it, str) else it.get("label", "")
        note = "" if isinstance(it, str) else it.get("note", "")
        d = d0 + i * 0.22
        out.append(f'<div class="lyr" style="--i:{i}" {_a("slide", d, 0.6)}>'
                   f'<span class="ldot"></span><b>{esc(lab)}</b>'
                   + (f'<span class="lnote">{esc(note)}</span>' if note else "")
                   + '</div>')
    out.append("</div>")
    return "".join(out)


# ————————————————————————— ٦ · شبكة أيقونات —————————————————————————

def icongrid(items, d0=0.35):
    out = ['<div class="igrid">']
    for i, it in enumerate(items[:6]):
        d = d0 + i * 0.14
        out.append(f'<div class="icard" {_a("pop", d, 0.6)}>'
                   f'{icon(it.get("icon","sparkle"), 54)}'
                   f'<b>{esc(it.get("label",""))}</b>'
                   + (f'<span>{esc(it["note"])}</span>' if it.get("note") else "")
                   + '</div>')
    out.append("</div>")
    return "".join(out)
