#!/usr/bin/env python3
"""
«وضع المصمم» للفيديو: تصميم HTML/CSS حر ← فيديو 1080×1920 بحركة ومؤثرات صوتية.

    python3 render_video_html.py design.html ./out

التصميم يعلن الحركة فقط، والمحرّك يحسب التوقيت:

  <section class="scene" data-dur="4.2"> … </section>      مشهد بمدته بالثواني
  <img class="kb" data-kb="in|out|left|right" src="assets/x.jpg">   حركة كاميرا بطيئة
  <div data-a="rise" data-at="0.4" data-du="0.5" data-sfx="pop">   حركة عنصر

  الحركات: fade · rise · drop · pop · left · right · wipe · stamp · type · count · grow · blur
  data-at نسبي لبداية المشهد. data-sfx: pop · tick · thud · ding · whoosh · blip_hi · blip_lo
  count: <span data-a="count" data-to="4812">0</span>  ·  type: يكتب النص حرفاً حرفاً
  grow: شريط يتمدد من اليمين (عرضه النهائي من CSS)
  draw: يرسم خط SVG (path/line/circle) · along: يحرك عنصر على مسار data-path="#id"
        (المسار داخل svg بـ viewBox="0 0 1080 1920" يغطي المشهد، والعنصر left:0;top:0)

  حركة مستمرة: data-loop="float|pulse|spin|blink|wave" (+ data-speed · data-amp · data-i للموجة)
  خروج: data-out="fade|rise|blur|shrink" data-ot="2.8" data-od="0.4"
  انتقال المشهد: data-tr="circle|up|zoom|wipe|slide|cut" على section (الافتراضي circle)
  كاميرا: data-cam="push|pull|drift" · صوت الانتقال: data-trsfx="whoosh|swell|none"
  data-sfx="keys" على type = نقرات كيبورد طول الكتابة
  data-fx="اسم_دالة" على section ← window[fn](section, local, t) لأي حركة خاصة
  window.onFrame(t) يُستدعى كل إطار (للطبقات الثابتة فوق كل المشاهد)

الصور والخطوط و{{AVATAR}} و{{HANDLES}} تعمل مثل render_html.py.
موسيقى: --music=120:4.0 (BPM : ثانية الـ drop) ← music_bed.py يولّد موسيقى أصلية بلا حقوق.
المخرجات: video.mp4 (مع المؤثرات) · video_silent.mp4 · cover.jpg · _preview.html
"""
import asyncio, json, pathlib, shutil, sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))
import render_reel as R
import render_motion as M
import render_html as H

OV = 0.35   # تداخل الانتقال بين المشاهد

ENGINE = r"""
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const oE=p=>p>=1?1:1-Math.pow(2,-10*p), oC=p=>1-Math.pow(1-p,3), oB=p=>{const c=1.7;return 1+(c+1)*Math.pow(p-1,3)+c*Math.pow(p-1,2)};
const io=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
const SC=[...document.querySelectorAll('section.scene')];
const OV=%OV%;
let T=0; const TIMES=[];
SC.forEach((s,i)=>{const d=+s.dataset.dur||4; s._t0=T; s._t1=T+d; TIMES.push([T,T+d]); T+=d-OV;});
window.TOTAL=SC.length?SC[SC.length-1]._t1:0;
document.querySelectorAll('[data-a="type"]').forEach(e=>{e._full=e.textContent; e.textContent='';});
window.SFX_LIST=()=>{const L=[];SC.forEach((s,i)=>{ const ts=s.dataset.trsfx||'whoosh'; if(i&&ts!=='none') L.push([s._t0,ts,0.4]);
  s.querySelectorAll('[data-sfx]').forEach(e=>{const at=s._t0+(+e.dataset.at||0),g=+(e.dataset.gain||0.7);
    if(e.dataset.sfx==='keys'){const du=+e.dataset.du||0.5,n=Math.min(40,Math.max(4,Math.round(du/0.07)));
      for(let j=0;j<n;j++) L.push([at+du*j/n,'click',g*(0.6+0.4*((j*7)%3)/2)]);}
    else L.push([at,e.dataset.sfx,g]);});});return L;};
function A(e,local){
  const k=e.dataset.a||'', at=+e.dataset.at||0, du=+e.dataset.du||0.5, p=clamp((local-at)/du,0,1);
  let o=1,tf='',f='';
  if(k==='fade'){o=oC(p);}
  else if(k==='rise'){o=oC(p);tf=`translateY(${(1-oE(p))*60}px)`;}
  else if(k==='drop'){o=oC(p);tf=`translateY(${(oE(p)-1)*80}px)`;}
  else if(k==='left'){o=oC(p);tf=`translateX(${(oE(p)-1)*120}px)`;}
  else if(k==='right'){o=oC(p);tf=`translateX(${(1-oE(p))*120}px)`;}
  else if(k==='pop'){o=clamp(p*3,0,1);tf=`scale(${.4+.6*oB(p)})`;}
  else if(k==='stamp'){o=clamp(p*4,0,1);tf=`scale(${2.4-1.4*oE(p)}) rotate(${e.dataset.rot||-8}deg)`;}
  else if(k==='blur'){o=oC(p);f=`blur(${(1-oE(p))*18}px)`;}
  else if(k==='wipe'){e.style.clipPath=`inset(0 0 0 ${(1-io(p))*100}%)`;}
  else if(k==='grow'){e.style.transformOrigin='100% 50%';tf=`scaleX(${oE(p)})`;}
  else if(k==='type'){const n=Math.round(e._full.length*p);e.textContent=e._full.slice(0,n);}
  else if(k==='count'){const to=+e.dataset.to;e.textContent=Math.round(to*oE(p)).toLocaleString('en-US');}
  else if(k==='draw'){if(e._len==null){e._len=e.getTotalLength?e.getTotalLength():1000;e.style.strokeDasharray=e._len;}
    e.style.strokeDashoffset=e._len*(1-io(p));}
  else if(k==='along'){const P=document.querySelector(e.dataset.path),L=P.getTotalLength(),q=P.getPointAtLength(L*io(p));
    o=local>=at?1:0;tf=`translate(${q.x}px,${q.y}px)`;}
  const lp=e.dataset.loop;
  if(lp){const sp=+e.dataset.speed||1,am=+e.dataset.amp||1,w=local*sp*2*Math.PI;
    if(lp==='float') tf+=` translateY(${Math.sin(w)*10*am}px)`;
    else if(lp==='pulse') tf+=` scale(${1+Math.sin(w)*0.04*am})`;
    else if(lp==='spin') tf+=` rotate(${local*sp*360}deg)`;
    else if(lp==='blink') o*=Math.sin(w)>-0.2?1:0.25;
    else if(lp==='wave'){const i=+e.dataset.i||0,v=Math.abs(Math.sin(w+i*0.73))*0.6+Math.abs(Math.sin(w*1.7+i*1.31))*0.4;
      e.style.transformOrigin='50% 50%';tf+=` scaleY(${0.14+0.86*v*am})`;}}
  const ou=e.dataset.out;
  if(ou){const q=clamp((local-(+e.dataset.ot||99))/(+e.dataset.od||0.4),0,1),z=io(q);
    o*=1-z; if(ou==='rise') tf+=` translateY(${-60*z}px)`; else if(ou==='shrink') tf+=` scale(${1-0.3*z})`;
    else if(ou==='blur') f+=` blur(${z*16}px)`;}
  e.style.opacity=o; if(tf) e.style.transform=tf; if(f) e.style.filter=f;
}
window.render=function(t){
  SC.forEach((s,i)=>{
    const local=t-s._t0, last=i===SC.length-1, end=s._t1+(last?1:0);
    const vis=t>=s._t0-0.001&&t<end;
    s.style.visibility=vis?'visible':'hidden'; if(!vis) return;
    const pin=i?clamp(local/OV,0,1):1, tr=s.dataset.tr||'circle', z=io(pin);
    let clip='none', ttf='', op=1;
    if(pin<1){
      if(tr==='circle') clip=`circle(${z*150}% at 50% 55%)`;
      else if(tr==='wipe') clip=`inset(0 0 0 ${(1-z)*100}%)`;
      else if(tr==='up') ttf=`translateY(${(1-z)*1920}px)`;
      else if(tr==='slide') ttf=`translateX(${(z-1)*1080}px)`;
      else if(tr==='zoom'){op=oC(pin);ttf=`scale(${1.25-0.25*oE(pin)})`;}}
    const cm=s.dataset.cam, cq=clamp(local/(s._t1-s._t0),0,1);
    if(cm==='push') ttf+=` scale(${1+0.06*cq})`; else if(cm==='pull') ttf+=` scale(${1.07-0.06*cq})`;
    else if(cm==='drift') ttf+=` translateX(${(cq-.5)*-40}px) scale(1.04)`;
    s.style.clipPath=clip; s.style.transform=ttf; s.style.opacity=op;
    s.style.zIndex=i+1;
    s.querySelectorAll('.kb').forEach(im=>{
      const q=clamp(local/(s._t1-s._t0+OV),0,1), m=im.dataset.kb||'in';
      const sc=m==='out'?1.18-.14*q:1.04+.14*q, x=m==='left'?(q-.5)*-60:m==='right'?(q-.5)*60:0;
      im.style.transform=`scale(${sc}) translateX(${x}px)`;});
    s.querySelectorAll('[data-a],[data-loop],[data-out]').forEach(e=>A(e,local));
    if(s.dataset.fx&&window[s.dataset.fx]) window[s.dataset.fx](s,local,t);
  });
  if(window.onFrame) window.onFrame(t);
};
"""


def build(src):
    html = pathlib.Path(src).read_text(encoding="utf-8")
    html = H.inline_local(html, pathlib.Path(src).parent)
    html = html.replace("{{AVATAR}}", R.avatar_uri() or "").replace("{{HANDLES}}", H.handles_html())
    base = (".hf-so{display:inline-flex;align-items:center;gap:.4em;direction:ltr;unicode-bidi:isolate;"
            "white-space:nowrap}.hf-so svg{width:1em;height:1em;flex:none}.hf-so b{font-weight:inherit}"
            "html,body{margin:0;width:1080px;height:1920px;overflow:hidden}"
            "section.scene{position:absolute;inset:0;width:1080px;height:1920px;overflow:hidden;visibility:hidden}"
            ".kb{will-change:transform}")
    html = html.replace("</head>", f"<style>{R.all_faces()}\n{H.extra_faces()}\n{base}</style></head>", 1)
    js = f"<script>{ENGINE.replace('%OV%', str(OV))}</script>"
    return html.replace("</body>", js + "</body>", 1)


async def timeline(html):
    from playwright.async_api import async_playwright
    kw = {"executable_path": R.chromium_path()} if R.chromium_path() else {}
    async with async_playwright() as pw:
        b = await pw.chromium.launch(**kw)
        p = await b.new_page(viewport={"width": 1080, "height": 1920})
        await p.set_content(html, wait_until="load")
        total = await p.evaluate("window.TOTAL")
        sfx = await p.evaluate("window.SFX_LIST()")
        await b.close()
    return total, sfx


def main(src, out):
    out = pathlib.Path(out)
    out.mkdir(parents=True, exist_ok=True)
    html = build(src)
    (out / "_preview.html").write_text(html, encoding="utf-8")
    total, sfx = asyncio.run(timeline(html))
    M.SFX.clear()
    for t, name, g in sfx:
        M.sfx(t, name, g)
    frames = out / "_frames"
    shutil.rmtree(frames, ignore_errors=True)
    frames.mkdir()
    print(f"▶ فيديو المصمم: {total:.1f}ث · {int(total * M.FPS)} إطار")
    asyncio.run(M.capture(html, total, frames))
    shutil.copy(frames / f"{int(1.2 * M.FPS):05d}.jpg", out / "cover.jpg")
    M.write_sfx(out / "_sfx.wav", total)
    audio = out / "_sfx.wav"
    if MUSIC:   # موسيقى خلفية مولّدة + المؤثرات فوقها (بدون تعليق صوتي)
        import music_bed, subprocess
        music_bed.make(out / "_music.wav", total, MUSIC["bpm"], MUSIC["drop"], MUSIC.get("outro"))
        fc = ("[0:a]volume=0.62[m];[1:a]volume=1.0[s];[m][s]amix=inputs=2:normalize=0,"
              "alimiter=limit=0.95")
        subprocess.run([R.ffmpeg_bin(), "-y", "-loglevel", "error", "-i", str(out / "_music.wav"),
                        "-i", str(audio), "-filter_complex", fc, "-ar", "44100", str(out / "_mix.wav")], check=True)
        audio = out / "_mix.wav"
    M.encode(frames, audio, out / "video.mp4", total)
    M.encode(frames, None, out / "video_silent.mp4", total)
    shutil.rmtree(frames, ignore_errors=True)
    for f in ("_sfx.wav", "_music.wav", "_mix.wav"):
        (out / f).unlink(missing_ok=True)


MUSIC = None

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) < 2:
        print(__doc__)
        sys.exit(1)
    # --music=120:4.0[:outro]  ← موسيقى خلفية بـ BPM ولحظة drop (ثواني)
    for a in sys.argv[1:]:
        if a.startswith("--music"):
            v = (a.split("=", 1)[1] if "=" in a else "120:4").split(":")
            MUSIC = {"bpm": float(v[0]), "drop": float(v[1]), "outro": float(v[2]) if len(v) > 2 else None}
    main(args[0], args[1])
