# فيديو 2026-10-21: تعلّم الذكاء الاصطناعي من الصفر في 30 يوم — «البذرة»

- **التكوين:** `remotion/studio/src/videos/Learn30/` (`theme.ts` · `Tree.tsx` العالم والكاميرا · `Overlay.tsx` العناوين والهوك والختام · `index.tsx` الصوت).
- **الفكرة:** مقطع عرضي لأرض وسما. صورة نبتة حقيقية تنكمش لدائرة وتصير البذرة على أول ضربة (4ث)، وبعدها كل أسبوع جزء من النبتة: جذور (الأساسيات) ← ساق و4 أوراق (خانات البرومبت) ← أغصان بأربع أزهار فيها الشعارات (الأدوات) ← زهرة وثمار (أفكار مشروع). الكاميرا تطلع مع النبتة (`camAt`)، وفي الخلاصة تبتعد لـ 0.36 وتطلع شارات الأسابيع الأربعة على الشجرة، وفي الختام الشمس تكبر وتصير صورة علي.
- **المقاطع (فريم):** hook 0–120 · w1 120–390 · w2 390–660 · w3 660–930 · w4 930–1200 · sum 1200–1410 · end 1410–1710 (57ث).
- **الموسيقى:** `public/videos/learn-30/music.mp3`. ElevenLabs رفض التوليد («Insufficient funds»)، فهي مقطوعة claude-trio من ElevenLabs بترتيب [0–20]+[14–20]+[20–51.5] بتلاشي 20ms، مقصوصة لـ 56.5ث مع تلاشي 0.8ث، والضربة الأولى عند 4ث.
- **المؤثرات:** impact على نزول البذرة (4ث) وعلى بداية كل أسبوع، whoosh_soft مع حركة الكاميرا، pop لكل تعليق وورقة وزهرة وثمرة، click لشارات الخلاصة، success للزهرة والختام.
- **الخطوط:** Lemonada 700 (جديد، مضاف في `src/lib/theme.ts`) · IBM Plex Sans Arabic · Space Grotesk.
- **الرندر:**
  ```bash
  cd remotion/studio
  npx remotion render Learn30 ../../output/2026-10-21-video/video_raw.mp4 --crf=20
  npx remotion ffmpeg -i video_raw.mp4 -c:v libx264 -crf 23 -preset slow -c:a copy -movflags +faststart video.mp4
  npx remotion still Learn30 ../../output/2026-10-21-video/cover.jpg --frame=60 --image-format=jpeg
  ```
