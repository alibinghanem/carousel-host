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

الصور والخطوط و{{AVATAR}} و{{HANDLES}} تعمل مثل render_html.py.
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
window.SFX_LIST=()=>{const L=[];SC.forEach((s,i)=>{ if(i) L.push([s._t0,'whoosh',0.4]);
  s.querySelectorAll('[data-sfx]').forEach(e=>L.push([s._t0+(+e.dataset.at||0),e.dataset.sfx,+(e.dataset.gain||0.7)]));});return L;};
function A(e,local){
  const k=e.dataset.a, at=+e.dataset.at||0, du=+e.dataset.du||0.5, p=clamp((local-at)/du,0,1);
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
  e.style.opacity=o; if(tf) e.style.transform=tf; if(f) e.style.filter=f;
}
window.render=function(t){
  SC.forEach((s,i)=>{
    const local=t-s._t0, last=i===SC.length-1, end=s._t1+(last?1:0);
    const vis=t>=s._t0-0.001&&t<end;
    s.style.visibility=vis?'visible':'hidden'; if(!vis) return;
    const pin=i?clamp(local/OV,0,1):1;
    s.style.clipPath=pin<1?`circle(${io(pin)*150}% at 50% 55%)`:'none';
    s.style.zIndex=i+1;
    s.querySelectorAll('.kb').forEach(im=>{
      const q=clamp(local/(s._t1-s._t0+OV),0,1), m=im.dataset.kb||'in';
      const sc=m==='out'?1.18-.14*q:1.04+.14*q, x=m==='left'?(q-.5)*-60:m==='right'?(q-.5)*60:0;
      im.style.transform=`scale(${sc}) translateX(${x}px)`;});
    s.querySelectorAll('[data-a]').forEach(e=>A(e,local));
  });
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
    M.encode(frames, out / "_sfx.wav", out / "video.mp4", total)
    M.encode(frames, None, out / "video_silent.mp4", total)
    shutil.rmtree(frames, ignore_errors=True)
    (out / "_sfx.wav").unlink(missing_ok=True)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
