# فيديو 2026-10-23: Perplexity — البحث بالمصادر («لوحة التحقيق»)

- **التكوين:** `remotion/studio/src/videos/Sources/` (`theme.ts` الألوان والمقاطع وأماكن العناصر · `Board.tsx` اللوحة والكاميرا والعناصر · `Overlay.tsx` العناوين والختام · `index.tsx` الصوت).
- **الفكرة:** لوحة فلّين كبيرة (2200×5800) والكاميرا (`camAt`) تمشي عليها من فوق لتحت: ورقة لاصقة «الدراسات تقول إن…» بختم «المصدر؟» ← ورقة جواب فيها شعار Perplexity وأرقام [1][2][3] ← خيوط حمراء لثلاث مصادر (موقع رسمي، جريدة بصورة حقيقية، منتدى) ← المكبّر يزور كل مصدر وينسحب قبل الختم ← بطاقات سؤال المتابعة وSearch وResearch ← برومبت يُكتب على بطاقة فهرسة ← ملف القضية بصورة علي.
- **المقاطع (فريم):** hook 0–120 · ans 120–360 · strings 360–600 · check 600–1005 (زيارات عند 600 و735 و870) · more 1005–1245 · prompt 1245–1485 · end 1485–1710 (57ث).
- **الموسيقى:** ElevenLabs رفض التوليد («Insufficient funds»)، فاستخدمت مقطوعة cowork-film من ElevenLabs، مقصوصة لـ 56.5ث مع تلاشي 0.8ث.
- **المؤثرات:** impact على ختم الهوك وعلى كل قطع، وwhoosh_fast مع كل خيط، وimpact لكل ختم تحقق (success مع «موثّق» وerror خفيف مع «تأكد مرتين»)، وtyping مع البرومبت.
- **الخطوط:** Noto Kufi Arabic 900 · Aref Ruqaa · IBM Plex Sans Arabic · JetBrains Mono · Space Grotesk.
- **الرندر:**
  ```bash
  cd remotion/studio
  npx remotion render Sources ../../output/2026-10-23-video/video_raw.mp4 --crf=20
  npx remotion ffmpeg -i video_raw.mp4 -c:v libx264 -crf 23 -preset slow -c:a copy -movflags +faststart video.mp4
  npx remotion still Sources ../../output/2026-10-23-video/cover.jpg --frame=70 --image-format=jpeg
  ```
