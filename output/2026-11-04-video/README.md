# فيديو 2026-11-04 (أتمتة · مؤسسات): دليل اختيار الأداة المناسبة — «٤ بوابات»

- **التكوين:** `remotion/studio/src/videos/ToolPicker/` (`theme.ts` المقاطع على المازورة والمرشحون والإقصاء · `Scene.tsx` الخلفية والعناوين وشريط البوابات والبطاقات ومشاهد الرسم والخلاصة والختام · `index.tsx` الموسيقى والمؤثرات).
- **المقاطع (فريم):** hook 0–216 · g1 216–504 · g2 504–792 · g3 792–1080 · g4 1080–1368 · verdict 1368–1512 · end 1512–1755 (58.5ث).
- **الموسيقى:** وُلّدت مقطوعة ElevenLabs (900 رصيد، `eleven_music_v2_5`)، لكن رابط تنزيلها على نطاق `elevenlabsusercontent.com` المحجوب بسياسة الشبكة (403)، فاستخدمت البديل `music_bed.py` (100 BPM، الـ drop على 7.2ث = بداية البوابة الأولى). **لو فتحتوا النطاق ممكن نستبدلها بمقطوعة ElevenLabs.**
- **الرندر:**
  ```bash
  cd remotion/studio
  npx remotion render ToolPicker ../../output/2026-11-04-video/video_raw.mp4 --crf=20 --concurrency=3 --timeout=120000
  npx remotion ffmpeg -i video_raw.mp4 -c:v libx264 -crf 23 -preset slow -c:a copy -movflags +faststart video.mp4
  npx remotion still ToolPicker ../../output/2026-11-04-video/cover.jpg --frame=160 --image-format=jpeg
  ```
