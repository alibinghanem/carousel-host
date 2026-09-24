#!/usr/bin/env python3
"""
مولّد فيديو «موشن جرافيك» تجريبي: نص يظهر كلمة كلمة، واجهات متحركة
(محادثة، إشعار، قائمة تُنصَّح، شريط تقدّم)، هوية ثابتة، ومؤثرات صوتية.

    python3 render_motion.py spec.json ./out

منفصل عن الكاروسيل اليومي — لا يلمس أي ملف تستخدمه المهمة المجدولة.
"""
import json, sys, math, random, pathlib, asyncio, shutil, subprocess, struct, wave

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import render_reel as R

W, H, FPS = 1080, 1920, 30
OVERLAP = 0.12          # تداخل المشاهد وقت الانتقال
EXIT = 0.32             # مدة خروج المشهد
SFX = []                # (الزمن، نوع المؤثر، الشدة)

THEME = dict(bg="#F6F4EF", ink="#15171C", muted="#6B7280", a="#FF5A1F",
             a2="#FFB38A", dark="#111318", line="#E8E3D8")


def esc(s):
    return R.esc(s)


def attr(k, at, du=0.45, **extra):
    s = f'data-k="{k}" data-at="{at:.3f}" data-du="{du:.3f}"'
    for key, v in extra.items():
        s += f' data-{key}="{esc(v)}"'
    return s


def sfx(t, name, gain=1.0):
    SFX.append((t, name, gain))


# ————————————————————————— نص حركي كلمة كلمة —————————————————————————

def kinetic(lines, t, top, size, hl=(), color=None, stagger=0.11, du=0.42, pop_hl=True):
    hl = set(hl)
    out, at = [], t
    style = f"top:{top}px;font-size:{size}px" + (f";color:{color}" if color else "")
    out.append(f'<div class="kin" style="{style}">')
    for line in lines:
        out.append('<span class="ln">')
        words = []
        for w in line.split(" "):
            if w in hl:
                words.append(f'<span class="w hl" {attr("word", at, du)}>'
                             f'<i class="hlbg" {attr("wipe", at + 0.08, 0.34)}></i><b>{esc(w)}</b></span>')
                if pop_hl:
                    sfx(at + 0.08, "pop", 0.55)
            else:
                words.append(f'<span class="w" {attr("word", at, du)}>{esc(w)}</span>')
            at += stagger
        out.append(" ".join(words) + "</span>")
        at += 0.06
    out.append("</div>")
    return "".join(out), at


def centered_top(n_lines, size, cy=900):
    return int(cy - n_lines * size * 1.3 / 2)


# ————————————————————————— المشاهد —————————————————————————

def sc_kinetic(s, t0, t1, first):
    lines, size = s["lines"], s.get("size", 108)
    start = t0 - 0.28 if first else t0 + 0.05
    html, _ = kinetic(lines, start, centered_top(len(lines), size), size, s.get("hl", []))
    return html


def sc_poll(s, t0, t1):
    title, _ = kinetic(s["title"], t0 + 0.05, 300, 84, s.get("hl", []))
    rounds = s.get("rounds", 3)
    card_at = t0 + 0.45
    sfx(card_at, "pop", 0.8)
    msgs, times, vals = [], [], []
    for i in range(rounds):
        a = t0 + 1.0 + i * 0.95
        msgs.append(f'<div class="b me" {attr("rise", a, 0.38)}>{esc(s["ask"])}</div>')
        msgs.append(f'<div class="b them" {attr("rise", a + 0.42, 0.38)}>{esc(s["reply"])}</div>')
        sfx(a, "blip_hi", 0.7)
        sfx(a + 0.42, "blip_lo", 0.6)
        times.append(f"{a:.3f}")
        vals.append(f"×{i+1}")
    stamp_at = t0 + 1.0 + rounds * 0.95 + 0.05
    sfx(stamp_at + 0.12, "thud", 1.0)
    card = (f'<div class="card" {attr("pop", card_at, 0.5)}>'
            f'<div class="badge" {attr("pop", t0 + 1.0, 0.35)}>'
            f'<span {attr("steps", t0 + 1.0, 0.3, times="|".join(times), vals="|".join(vals))}>×1</span></div>'
            f'<div class="chead"><div class="cav">{esc(s.get("initial") or s["name"].removeprefix("ال")[:1])}</div>'
            f'<div><div class="cname">{esc(s["name"])}</div><div class="cstat">متصل الآن</div></div></div>'
            f'<div class="msgs">{"".join(msgs)}</div></div>')
    stamp = (f'<div class="stampw"><div class="stamp" {attr("stamp", stamp_at, 0.42)}>'
             f'{esc(s["stamp"])}</div></div>')
    return title + card + stamp, [stamp_at + 0.12]


BELL = ('<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" '
        'stroke-linecap="round" stroke-linejoin="round"><path d="M18 16V11a6 6 0 1 0-12 0v5l-2 2h16z"/>'
        '<path d="M10 20.5a2 2 0 0 0 4 0"/></svg>')


def sc_notify(s, t0, t1):
    title, _ = kinetic(s["title"], t0 + 0.12, 360, 96, s.get("hl", []), color="#fff")
    drop = t0 + 1.05
    sfx(drop + 0.1, "ding", 0.9)
    rings = "".join(f'<i class="ring" {attr("ripple", drop + 0.12 + k * 0.28, 1.0)}></i>' for k in range(3))
    note = (f'<div class="notw"><div class="note" {attr("drop", drop, 0.85)}>'
            f'<div class="nicon">{rings}{BELL}</div>'
            f'<div class="ntext"><div class="nrow"><span class="nttl">{esc(s["app"])}</span>'
            f'<span class="ntime">الآن</span></div>'
            f'<div class="nbody">{esc(s["body"])}</div></div></div></div>')
    chip_at = t0 + 1.9
    sfx(chip_at, "pop", 0.6)
    chip = f'<div class="chipw"><div class="chip" {attr("pop", chip_at, 0.45)}>{esc(s["chip"])}</div></div>'
    return title + note + chip


def sc_bigword(s, t0, t1):
    pre, _ = kinetic([s["pre"]], t0 + 0.05, 540, 66, [], color=THEME["muted"], pop_hl=False)
    letters = []
    for i, ch in enumerate(s["word"]):
        at = t0 + 0.55 + i * 0.065
        letters.append(f'<span class="L" {attr("letter", at, 0.5)}>{esc(ch)}</span>')
        sfx(at, "tick", 0.3)
    big = f'<div class="bigw">{"".join(letters)}</div>'
    ul_at = t0 + 0.55 + len(s["word"]) * 0.065 + 0.1
    sfx(ul_at, "whoosh", 0.35)
    ul = f'<div class="ul" {attr("wipe", ul_at, 0.45)}></div>'
    sub, _ = kinetic([s["sub"]], ul_at + 0.15, 1000, 70, s.get("hl", []))
    return pre + big + ul + sub


CHECK = '<svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9"/></svg>'


def sc_checklist(s, t0, t1):
    title, _ = kinetic(s["title"], t0 + 0.05, 280, 92, s.get("hl", []))
    rows = []
    for i, txt in enumerate(s["rows"]):
        a = t0 + 0.7 + i * 0.7
        sfx(a, "pop", 0.45)
        sfx(a + 0.38, "tick", 0.8)
        rows.append(f'<div class="row" {attr("slide", a, 0.45, dx=-80)}>'
                    f'<div class="box" {attr("tick", a + 0.38, 0.35)}><i class="fill"></i>{CHECK}</div>'
                    f'<div class="rtxt">{esc(txt)}</div></div>')
    b0, b1 = t0 + 0.6, t0 + 0.7 + len(s["rows"]) * 0.7
    prog = (f'<div class="prog" {attr("fade", t0 + 0.5, 0.3)}><div class="prow">'
            f'<span class="plab">{esc(s["bar"])}</span>'
            f'<span class="pct" {attr("count", b0, b1 - b0, **{"from": 0, "to": 100, "suf": "%"})}>0%</span></div>'
            f'<div class="track"><div class="fillbar" {attr("bar", b0, b1 - b0)}></div></div></div>')
    return title + f'<div class="rows">{"".join(rows)}</div>' + prog


def sc_outro(s, t0, t1):
    av = R.avatar_uri()
    sfx(t0 + 0.15, "pop", 0.9)
    sfx(t0 + 0.2, "ding", 0.45)
    img = f'<img src="{av}">' if av else ""
    avatar = (f'<div class="avw"><div class="avc" {attr("pop", t0 + 0.15, 0.55)}>{img}</div></div>')
    name, _ = kinetic([s.get("name", "علي التميمي")], t0 + 0.55, 1000, 76, [], pop_hl=False)
    handle = f'<div class="ohandle" {attr("rise", t0 + 0.9, 0.45)}>{esc(s.get("handle", ""))}</div>'
    sfx(t0 + 1.25, "pop", 0.5)
    tag = f'<div class="otagw"><div class="otag" {attr("pop", t0 + 1.25, 0.45)}>{esc(s["tag"])}</div></div>'
    return avatar + name + handle + tag


ORB_DEFAULT = {"kinetic": (880, 380, 170), "poll": (930, 560, 120), "notify": (900, 1380, 140),
               "bigword": (880, 1250, 150), "checklist": (960, 240, 100), "outro": (540, 760, 440)}


# ————————————————————————— تجميع الصفحة —————————————————————————

CSS = """
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:var(--bg)}
body{font-family:'Cairo',sans-serif;color:var(--ink);direction:rtl;-webkit-font-smoothing:antialiased}
.stage{position:relative;width:1080px;height:1920px;overflow:hidden;background:var(--bg)}
.dark{position:absolute;inset:0;background:var(--dark);opacity:0}
.shape{position:absolute;left:0;top:0;background:var(--a);border-radius:28%}
.orb{position:absolute;left:0;top:0;border-radius:50%;
  background:radial-gradient(circle at 32% 28%,#FFE3D4 0%,#FF9A6B 20%,var(--a) 52%,#B83A0C 100%);
  box-shadow:0 40px 90px rgba(255,90,31,.33)}
.scene{position:absolute;inset:0;visibility:hidden}
.kin{position:absolute;left:70px;right:70px;text-align:center;font-weight:900;line-height:1.3}
.ln{display:block}
.w{display:inline-block;opacity:0}
.hl{position:relative;isolation:isolate;color:#fff;padding:0 .18em;margin:0 .03em}
.hlbg{position:absolute;left:0;right:0;top:.14em;bottom:.04em;background:var(--a);border-radius:.2em;
  z-index:-1;transform-origin:100% 50%;transform:scaleX(0)}
.hl b{font-weight:900}

.card{position:absolute;left:110px;right:110px;top:640px;height:790px;background:#16181D;border-radius:52px;
  box-shadow:0 40px 90px rgba(17,19,24,.28);padding:36px 42px;color:#fff;opacity:0}
.chead{display:flex;align-items:center;gap:22px;padding-bottom:26px;border-bottom:1.5px solid rgba(255,255,255,.08)}
.cav{width:86px;height:86px;border-radius:50%;background:var(--a);display:flex;align-items:center;
  justify-content:center;font-weight:900;font-size:34px}
.cname{font-size:40px;font-weight:900;line-height:1.2}.cstat{font-size:26px;color:#8B93A1;font-weight:600}
.msgs{display:flex;flex-direction:column;gap:18px;padding-top:30px}
.b{max-width:80%;padding:16px 32px;border-radius:34px;font-size:38px;font-weight:700;opacity:0;line-height:1.35}
.b.me{align-self:flex-start;background:var(--a);border-bottom-right-radius:10px}
.b.them{align-self:flex-end;background:#2A2E37;color:#D7DBE3;border-bottom-left-radius:10px}
.badge{position:absolute;top:-52px;left:-34px;width:140px;height:140px;border-radius:50%;background:var(--a);
  border:8px solid var(--bg);display:flex;align-items:center;justify-content:center;opacity:0;
  font-size:56px;font-weight:900;color:#fff;direction:ltr}
.badge span{display:inline-block}
.stampw{position:absolute;left:0;right:0;top:900px;display:flex;justify-content:center}
.stamp{padding:6px 64px 16px;border:12px solid #E23D28;color:#E23D28;background:#fff;border-radius:30px;
  font-size:140px;font-weight:900;line-height:1.15;opacity:0;box-shadow:0 30px 70px rgba(0,0,0,.28)}

.notw{position:absolute;left:70px;right:70px;top:800px}
.note{display:flex;align-items:center;gap:30px;background:#22252D;
  border:2px solid rgba(255,255,255,.14);border-radius:44px;padding:34px 36px;opacity:0}
.nicon{position:relative;width:116px;height:116px;flex:none;border-radius:30px;background:var(--a);
  display:flex;align-items:center;justify-content:center}
.nicon svg{width:64px;height:64px;position:relative}
.ring{position:absolute;left:0;top:0;width:116px;height:116px;border-radius:30px;border:5px solid var(--a);opacity:0}
.ntext{flex:1;color:#fff}
.nrow{display:flex;justify-content:space-between;align-items:baseline}
.nttl{font-size:42px;font-weight:900}.ntime{font-size:28px;color:#9AA1AD;font-weight:600}
.nbody{font-size:38px;color:#D9DDE4;font-weight:700;margin-top:4px}
.chipw{position:absolute;left:0;right:0;top:1130px;display:flex;justify-content:center}
.chip{padding:14px 46px 20px;border-radius:999px;border:4px solid var(--a);color:#fff;font-size:46px;font-weight:900;opacity:0}

.bigw{position:absolute;left:0;right:0;top:640px;text-align:center;direction:ltr;font-size:196px;font-weight:900;
  color:var(--a);line-height:1.15;letter-spacing:-2px}
.L{display:inline-block;opacity:0}
.ul{position:absolute;left:230px;right:230px;top:900px;height:22px;border-radius:11px;background:var(--ink);
  transform:scaleX(0);transform-origin:50% 50%}

.rows{position:absolute;left:100px;right:100px;top:600px;display:flex;flex-direction:column;gap:26px}
.row{display:flex;align-items:center;gap:30px;background:#fff;border:2px solid var(--line);border-radius:36px;
  padding:28px 34px;box-shadow:0 18px 40px rgba(20,20,20,.06);opacity:0}
.box{position:relative;width:78px;height:78px;flex:none;border-radius:22px;border:4px solid #D6D0C2}
.box .fill{position:absolute;inset:-4px;border-radius:22px;background:var(--a);transform:scale(0)}
.box svg{position:absolute;inset:0;width:100%;height:100%}
.box path{fill:none;stroke:#fff;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round;
  stroke-dasharray:30;stroke-dashoffset:30}
.rtxt{font-size:46px;font-weight:800}
.prog{position:absolute;left:100px;right:100px;top:1130px;opacity:0}
.prow{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:18px}
.plab{font-size:42px;font-weight:800}.pct{font-size:60px;font-weight:900;color:var(--a);direction:ltr}
.track{height:28px;border-radius:14px;background:var(--line);overflow:hidden}
.fillbar{height:100%;background:var(--a);border-radius:14px;transform:scaleX(0);transform-origin:100% 50%}

.avw{position:absolute;left:0;right:0;top:590px;display:flex;justify-content:center}
.avc{width:340px;height:340px;border-radius:50%;overflow:hidden;opacity:0;border:10px solid #fff;
  background:radial-gradient(circle at 35% 30%,#FFB38A,var(--a) 60%,#C2410C);
  box-shadow:0 30px 70px rgba(255,90,31,.35)}
.avc img{width:100%;height:100%;object-fit:cover;object-position:50% 12%}
.ohandle{position:absolute;left:0;right:0;top:1115px;text-align:center;font-size:46px;font-weight:900;
  color:var(--a);direction:ltr;opacity:0}
.otagw{position:absolute;left:0;right:0;top:1225px;display:flex;justify-content:center}
.otag{padding:14px 44px 20px;border-radius:999px;background:var(--ink);color:#fff;font-size:40px;font-weight:800;opacity:0}
"""

JS = r"""
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const outExpo=p=>p>=1?1:1-Math.pow(2,-10*p);
const outCubic=p=>1-Math.pow(1-p,3);
const inCubic=p=>p*p*p;
const inOut=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
const outBack=(p,c=1.7)=>1+(c+1)*Math.pow(p-1,3)+c*Math.pow(p-1,2);
const spring=p=>p>=1?1:1-Math.exp(-6*p)*Math.cos(10*p);

const ITEMS=[...document.querySelectorAll('[data-k]')].map(el=>({el,k:el.dataset.k,
  at:+el.dataset.at,du:+el.dataset.du,d:el.dataset}));
const SCENES=[...document.querySelectorAll('.scene')].map(el=>({el,t0:+el.dataset.t0,t1:+el.dataset.t1,
  exit:el.dataset.exit!=='0',shakes:(el.dataset.shake||'').split(',').filter(Boolean).map(Number)}));
const SHAPES=[...document.querySelectorAll('.shape')].map(el=>({el,...JSON.parse(el.dataset.p)}));
const ORB=document.querySelector('.orb'), DARK=document.querySelector('.dark');

function orbAt(t){const K=window.ORBK; if(t<=K[0][0]) return K[0];
  for(let i=0;i<K.length-1;i++){const a=K[i],b=K[i+1]; if(t<=b[0]){const q=inOut(clamp((t-a[0])/Math.max(1e-6,b[0]-a[0]),0,1));
    return [t,a[1]+(b[1]-a[1])*q,a[2]+(b[2]-a[2])*q,a[3]+(b[3]-a[3])*q];}}
  return K[K.length-1];}

function apply(it,t){
  const p=clamp((t-it.at)/it.du,0,1), el=it.el, d=it.d;
  switch(it.k){
    case 'word':{const e=outExpo(p);el.style.opacity=Math.min(1,p*2.4);
      el.style.transform=`translateY(${(1-e)*48}px) scale(${.9+.1*e})`;
      el.style.filter=p<1?`blur(${(1-outCubic(p))*10}px)`:'none';break;}
    case 'fade': el.style.opacity=p;break;
    case 'pop':{const e=outBack(p);el.style.opacity=Math.min(1,p*3);el.style.transform=`scale(${.55+.45*e})`;break;}
    case 'rise':{const e=outExpo(p);el.style.opacity=Math.min(1,p*2.5);el.style.transform=`translateY(${(1-e)*70}px) scale(${.94+.06*e})`;break;}
    case 'slide':{const e=outExpo(p);el.style.opacity=Math.min(1,p*2.5);el.style.transform=`translateX(${(1-e)*(+d.dx)}px)`;break;}
    case 'drop':{const e=spring(p);el.style.opacity=Math.min(1,p*4);el.style.transform=`translateY(${(1-e)*-300}px)`;break;}
    case 'stamp':{const e=outBack(p,2.6);el.style.opacity=Math.min(1,p*5);el.style.transform=`rotate(-9deg) scale(${2.3-1.3*e})`;break;}
    case 'wipe': el.style.transform=`scaleX(${outExpo(p)})`;break;
    case 'bar': el.style.transform=`scaleX(${inOut(p)})`;break;
    case 'count':{const a=+d.from,b=+d.to;el.textContent=Math.round(a+(b-a)*inOut(p))+(d.suf||'');break;}
    case 'steps':{const ts=d.times.split('|').map(Number),vs=d.vals.split('|');let i=0,last=-9;
      for(let j=0;j<ts.length;j++) if(t>=ts[j]){i=j;last=ts[j];}
      el.textContent=vs[i];const u=t-last;el.style.transform=`scale(${1+(u>=0&&u<.3?Math.sin(u/.3*Math.PI)*.35:0)})`;break;}
    case 'tick':{const e=outBack(p);el.querySelector('.fill').style.transform=`scale(${clamp(e,0,1.2)})`;
      el.querySelector('path').style.strokeDashoffset=30*(1-clamp((t-it.at-.08)/.25,0,1));
      el.style.borderColor=p>0?'transparent':'';break;}
    case 'ripple':{const lt=t-it.at;if(lt<0){el.style.opacity=0;break;}const q=clamp(lt/it.du,0,1);
      el.style.opacity=(1-q)*.7;el.style.transform=`scale(${1+q*1.9})`;break;}
    case 'letter':{const e=outBack(p,2.2);el.style.opacity=Math.min(1,p*3);
      el.style.transform=`translateY(${(1-e)*-150}px) rotate(${(1-e)*-14}deg)`;break;}
  }
}

window.render=function(t){
  let dk=0; for(const [a,b] of window.DARKI){ if(t>=a&&t<=b){dk=Math.max(dk,Math.min(clamp((t-a)/.35,0,1),clamp((b-t)/.35,0,1)));} }
  DARK.style.opacity=dk;
  for(const s of SHAPES){const x=s.x+Math.sin(t*s.sp+s.ph)*s.amp, y=s.y+Math.cos(t*s.sp*.8+s.ph)*s.amp*1.3;
    s.el.style.transform=`translate(${x}px,${y}px) rotate(${s.r0+t*s.rs}deg)`;}
  const o=orbAt(t), sz=o[3];
  ORB.style.width=ORB.style.height=sz+'px';
  ORB.style.transform=`translate(${o[1]-sz/2}px,${o[2]-sz/2+Math.sin(t*1.7)*12}px)`;
  for(const s of SCENES){
    const vis=t>=s.t0-1e-3&&t<=s.t1+.02; s.el.style.visibility=vis?'visible':'hidden'; if(!vis) continue;
    const e=s.exit?inCubic(clamp((t-(s.t1-.32))/.32,0,1)):0; let sx=0,sy=0;
    for(const st of s.shakes){const u=t-st;if(u>=0&&u<.35){const a=(1-u/.35)*20;sx+=Math.sin(u*95)*a;sy+=Math.cos(u*70)*a*.6;}}
    s.el.style.opacity=1-e; s.el.style.transform=`translate(${sx}px,${sy-e*90}px) scale(${1-e*.05})`;
    s.el.style.filter=e>0?`blur(${e*10}px)`:'none';
  }
  for(const it of ITEMS) apply(it,t);
};
"""


def build(spec):
    SFX.clear()
    scenes = spec["scenes"]
    t, timed = 0.0, []
    for i, s in enumerate(scenes):
        t0 = 0.0 if i == 0 else t - OVERLAP
        t1 = t0 + float(s["dur"])
        timed.append((s, t0, t1))
        t = t1
    total = t

    parts, dark, orbk = [], [], []
    for i, (s, t0, t1) in enumerate(timed):
        typ, shakes = s["type"], []
        if i > 0:
            sfx(t0 - 0.05, "whoosh", 0.45)
        if typ == "kinetic":
            body = sc_kinetic(s, t0, t1, i == 0)
        elif typ == "poll":
            body, shakes = sc_poll(s, t0, t1)
        elif typ == "notify":
            body = sc_notify(s, t0, t1)
            dark.append([t0, t1])
        elif typ == "bigword":
            body = sc_bigword(s, t0, t1)
        elif typ == "checklist":
            body = sc_checklist(s, t0, t1)
        elif typ == "outro":
            body = sc_outro(dict(s, handle=spec.get("handle", ""), name=spec.get("name", "")), t0, t1)
        else:
            raise SystemExit(f"نوع مشهد غير معروف: {typ}")
        last = i == len(timed) - 1
        parts.append(f'<section class="scene" data-t0="{t0:.3f}" data-t1="{t1 + (0.5 if last else 0):.3f}" '
                     f'data-exit="{0 if last else 1}" data-shake="{",".join(f"{x:.3f}" for x in shakes)}">'
                     f'{body}</section>')
        x, y, sz = s.get("orb") or ORB_DEFAULT.get(typ, (880, 380, 150))
        orbk.append([t0 + (0.3 if i else 0.0), x, y, sz])
        orbk.append([max(t0 + 0.31, t1 - 0.3), x, y, sz])

    rnd = random.Random(7)
    shapes = []
    for i in range(16):
        # على الأطراف فقط — عشان ما تتداخل مع النص الرئيسي
        if i % 2:
            x, y = rnd.choice([rnd.uniform(30, 120), rnd.uniform(960, 1050)]), rnd.uniform(160, 1800)
        else:
            x, y = rnd.uniform(40, 1040), rnd.choice([rnd.uniform(150, 240), rnd.uniform(1480, 1820)])
        p = dict(x=x, y=y, sp=rnd.uniform(.25, .7),
                 ph=rnd.uniform(0, 6.28), amp=rnd.uniform(10, 24), r0=rnd.uniform(0, 90), rs=rnd.uniform(-25, 25))
        sz, op = rnd.uniform(14, 40), rnd.uniform(.14, .3)
        shapes.append(f'<i class="shape" style="width:{sz:.0f}px;height:{sz:.0f}px;opacity:{op:.2f}" '
                      f"data-p='{json.dumps(p)}'></i>")

    vars_ = ";".join(f"--{k}:{v}" for k, v in THEME.items())
    html = (f'<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>{R.all_faces()}'
            f':root{{{vars_}}}{CSS}</style></head><body><div class="stage"><div class="dark"></div>'
            f'{"".join(shapes)}<div class="orb"></div>{"".join(parts)}</div>'
            f'<script>window.DARKI={json.dumps(dark)};window.ORBK={json.dumps(orbk)};{JS}</script></body></html>')
    return html, total


# ————————————————————————— المؤثرات الصوتية —————————————————————————

SR = 44100


def _synth(name):
    rnd = random.Random(hash(name) & 0xffff)
    out = []
    if name in ("pop", "blip_hi", "blip_lo"):
        f0, f1, d, k = {"pop": (760, 380, .12, 32), "blip_hi": (1046, 1244, .09, 42),
                        "blip_lo": (620, 540, .09, 42)}[name]
        ph = 0.0
        for i in range(int(d * SR)):
            x = i / SR
            f = f0 + (f1 - f0) * (x / d)
            ph += 2 * math.pi * f / SR
            a = min(1, x / .004) * math.exp(-x * k)
            out.append(a * (math.sin(ph) + .25 * math.sin(2 * ph)) * .55)
    elif name == "tick":
        for i in range(int(.04 * SR)):
            x = i / SR
            out.append(math.exp(-x * 160) * (math.sin(2 * math.pi * 2900 * x) * .5 + rnd.uniform(-.25, .25)))
    elif name == "thud":
        lp = 0.0
        for i in range(int(.4 * SR)):
            x = i / SR
            lp += .08 * (rnd.uniform(-1, 1) - lp)
            s = math.sin(2 * math.pi * 62 * x) + .5 * math.sin(2 * math.pi * 124 * x)
            out.append(math.exp(-x * 11) * s * .9 + math.exp(-x * 90) * lp * 2.2)
    elif name == "ding":
        for i in range(int(1.2 * SR)):
            x = i / SR
            a = min(1, x / .005) * math.exp(-x * 4.2)
            out.append(a * (.5 * math.sin(2 * math.pi * 1318.5 * x) + .26 * math.sin(2 * math.pi * 1975.5 * x)
                            + .1 * math.sin(2 * math.pi * 2637 * x)))
    elif name == "whoosh":
        d, lp = .34, 0.0
        for i in range(int(d * SR)):
            x = i / SR
            q = x / d
            lp += (.02 + .25 * math.sin(math.pi * q) ** 2) * (rnd.uniform(-1, 1) - lp)
            out.append(math.sin(math.pi * q) ** 2 * lp * 1.6)
    return out


def write_sfx(path, total):
    n = int((total + 0.5) * SR)
    buf = [0.0] * n
    cache = {}
    for t, name, g in SFX:
        s = cache.setdefault(name, _synth(name))
        o = int(max(0, t) * SR)
        for i, v in enumerate(s):
            if o + i >= n:
                break
            buf[o + i] += v * g * .5
    peak = max(1e-6, max(abs(v) for v in buf))
    scale = min(1.0, .85 / peak)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(math.tanh(v * scale) * 32767)) for v in buf))


# ————————————————————————— التصيير —————————————————————————

async def capture(html, total, frames):
    from playwright.async_api import async_playwright
    launch = dict(args=["--force-color-profile=srgb", "--font-render-hinting=none",
                        "--disable-lcd-text", "--hide-scrollbars"])
    exe = R.chromium_path()
    if exe:
        launch["executable_path"] = exe
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(**launch)
        page = await browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        await page.set_content(html, wait_until="load")
        await page.evaluate("document.fonts.ready")
        nf = int(round(total * FPS))
        for f in range(nf):
            await page.evaluate("t=>render(t)", f / FPS)
            await page.screenshot(path=str(frames / f"{f+1:05d}.jpg"), type="jpeg", quality=92)
            if f % 150 == 0:
                print(f"  … إطار {f}/{nf}")
        await browser.close()
    return nf


def encode(frames, audio, out, total):
    ff = R.ffmpeg_bin()
    a_in = ["-i", str(audio)] if audio else ["-f", "lavfi", "-t", f"{total:.3f}", "-i", "anullsrc=r=44100:cl=stereo"]
    cmd = [ff, "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", str(frames / "%05d.jpg"), *a_in,
           "-c:v", "libx264", "-profile:v", "high", "-level", "4.1", "-pix_fmt", "yuv420p", "-crf", "19",
           "-preset", "medium", "-r", str(FPS), "-c:a", "aac", "-b:a", "128k", "-t", f"{total:.3f}",
           "-movflags", "+faststart", str(out)]
    subprocess.run(cmd, check=True)
    print(f"✓ {out.name}  ({out.stat().st_size / 1048576:.1f} MB)")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) < 2:
        print(__doc__)
        sys.exit(1)
    spec = json.loads(pathlib.Path(args[0]).read_text(encoding="utf-8"))
    out = pathlib.Path(args[1])
    out.mkdir(parents=True, exist_ok=True)
    html, total = build(spec)
    (out / "_preview.html").write_text(html, encoding="utf-8")
    frames = out / "_frames"
    shutil.rmtree(frames, ignore_errors=True)
    frames.mkdir()
    print(f"▶ موشن: {len(spec['scenes'])} مشاهد · {total:.1f}ث · {int(total*FPS)} إطار")
    asyncio.run(capture(html, total, frames))
    shutil.copy(frames / f"{int(1.6*FPS):05d}.jpg", out / "cover.jpg")
    write_sfx(out / "_sfx.wav", total)
    encode(frames, out / "_sfx.wav", out / "motion.mp4", total)
    encode(frames, None, out / "motion_silent.mp4", total)
    shutil.rmtree(frames, ignore_errors=True)


if __name__ == "__main__":
    main()
