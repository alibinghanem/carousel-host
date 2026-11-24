# فيديو 2026-10-27: أتمتة · تدريب الفريق — «معسكر الإعداد» (3D)

- **التكوين:** `remotion/studio/src/videos/Camp30/` (`theme.ts` المقاطع والألوان والمناطق · `Scene3D.tsx` الملعب والكاميرا واللاعبين والكرة ولوحة النتائج، ويصدّر `project()` لإسقاط النقاط على الشاشة · `Overlay.tsx` الخلفية والعناوين والبطاقات والختام · `index.tsx` الموسيقى والمؤثرات).
- **مكتبة 3D الجديدة:** `remotion/studio/src/lib/three3d/Sport.tsx` (Pitch · Figure · Cone · Ball · Goal · Arrow · along · FloodLight · Scoreboard · Blob).
- **المقاطع (فريم):** hook 0–120 · plan 120–293 · w1 293–570 · w2 570–847 · w3 847–1106 · w4 1106–1383 · tip 1383–1539 · end 1539–1740 (58ث).
- **الرندر:**
  ```bash
  cd remotion/studio
  npx remotion render Camp30 ../../output/2026-10-27-video/video_raw.mp4 --gl=angle --crf=20
  npx remotion ffmpeg -i video_raw.mp4 -c:v libx264 -crf 23 -preset slow -c:a copy -movflags +faststart video.mp4
  npx remotion still Camp30 ../../output/2026-10-27-video/cover.jpg --frame=60 --gl=angle --image-format=jpeg
  ```
