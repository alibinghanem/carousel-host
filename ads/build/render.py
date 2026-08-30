# -*- coding: utf-8 -*-
"""يركّب الإعلان النهائي 1080x1920 من الطبقات باستخدام ffmpeg."""
import subprocess, os, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
D = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(D), "tiraz-ad-9x16.mp4")
FPS, XF = 30, 0.45
SHOTS = [(3.2,"in"),(3.2,"out"),(3.2,"in"),(3.2,"out"),
         (3.4,"in"),(3.2,"out"),(3.2,"in"),(4.0,"out")]
END = 5.0

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(r.stderr[-2500:]); raise SystemExit(1)

def zexpr(mode, n):
    return (f"1+0.10*on/{n}" if mode == "in" else f"1.10-0.10*on/{n}")

clips = []
for i, (dur, mode) in enumerate(SHOTS):
    n = int(dur * FPS)
    out = f"{D}/clip{i}.mp4"
    fc = (
        f"[1:v]zoompan=z='{zexpr(mode,n)}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
        f":d={n}:s=1080x1240:fps={FPS}[im];"
        f"[0:v][im]overlay=0:0[b];[b][2:v]overlay=0:0[c];"
        f"[3:v]format=rgba,fade=in:st=0.10:d=0.70:alpha=1[t];"
        f"[c][t]overlay=0:'if(lt(t,0.8),18*(1-t/0.8),0)':format=auto[v]"
    )
    run([FF,"-y","-loop","1","-i",f"{D}/ground.png","-loop","1","-i",f"{D}/base{i}.jpg",
         "-loop","1","-i",f"{D}/chrome.png","-loop","1","-i",f"{D}/text{i}.png",
         "-filter_complex",fc,"-map","[v]","-t",str(dur),"-r",str(FPS),
         "-c:v","libx264","-crf","17","-pix_fmt","yuv420p",out])
    clips.append((out,dur))

# اللقطة الختامية
n = int(END*FPS); out = f"{D}/clip_end.mp4"
fc = (f"[0:v]zoompan=z='1+0.06*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
      f":d={n}:s=1080x1920:fps={FPS}[bg];"
      f"[1:v]format=rgba,fade=in:st=0.15:d=0.9:alpha=1[o];[bg][o]overlay=0:0[v]")
run([FF,"-y","-loop","1","-i",f"{D}/base_end.jpg","-loop","1","-i",f"{D}/overlay_end.png",
     "-filter_complex",fc,"-map","[v]","-t",str(END),"-r",str(FPS),
     "-c:v","libx264","-crf","17","-pix_fmt","yuv420p",out])
clips.append((out,END))

# دمج بانتقالات تلاشٍ
ins, fc, prev = [], [], "0:v"
for p, _ in clips:
    ins += ["-i", p]
cum = 0.0
for i in range(1, len(clips)):
    cum += clips[i-1][1]                 # مجموع مدد اللقطات السابقة
    offset = round(cum - i * XF, 3)      # كل انتقال يقتطع XF من الطول الكلي
    lbl = f"x{i}"
    fc.append(f"[{prev}][{i}:v]xfade=transition=fade:duration={XF}:offset={offset}[{lbl}]")
    prev = lbl
fc.append(f"[{prev}]fade=in:st=0:d=0.5,format=yuv420p[v]")
run([FF,"-y",*ins,"-filter_complex",";".join(fc),"-map","[v]",
     "-c:v","libx264","-crf","19","-preset","slow","-pix_fmt","yuv420p",
     "-movflags","+faststart","-r",str(FPS),OUT])
print("OK ->", OUT)
