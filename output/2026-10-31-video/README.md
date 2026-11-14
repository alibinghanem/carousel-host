# فيديو 2026-10-31 (أدوات): Gemini داخل Gmail و Docs — «مكتب البريد الذكي»

- **التكوين:** `remotion/studio/src/videos/GeminiMail/` (`theme.ts` المقاطع على المازورة والألوان · `screens.ts` شاشات Gmail و Docs المرسومة وكرت «الزبدة» · `Scene3D.tsx` سحابة الظروف والشرارة والجوال واللابتوب، ويصدّر `project()` · `Overlay.tsx` الخلفية والعناوين والخطوات والختام · `index.tsx` الموسيقى والمؤثرات).
- **عناصر 3D جديدة:** `Envelope` و `Sparkle` و `Panel` و `Laptop` في `remotion/studio/src/lib/three3d/Mail.tsx`.
- **المقاطع (فريم):** hook 0–144 · intro 144–360 · sum 360–648 · ask 648–936 · write 936–1224 · docs 1224–1512 · end 1512–1755 (58.5ث).
- **الرندر:**
  ```bash
  cd remotion/studio
  npx remotion render GeminiMail ../../output/2026-10-31-video/video_raw.mp4 --gl=angle --crf=18 --concurrency=2 --timeout=120000
  npx remotion ffmpeg -i video_raw.mp4 -c:v libx264 -crf 23 -preset slow -c:a copy -movflags +faststart video.mp4
  npx remotion still GeminiMail ../../output/2026-10-31-video/cover.jpg --frame=100 --gl=angle --image-format=jpeg
  ```
