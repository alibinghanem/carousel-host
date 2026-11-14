# فيديو 2026-10-29 (تقنية 3D): التحقق بخطوتين — «القفل الثاني»

- **التكوين:** `remotion/studio/src/videos/TwoLocks/` (`theme.ts` المقاطع على المازورة والألوان · `Scene3D.tsx` الخزنة والقفلين والمفتاح والجوال وشاشاته، ويصدّر `project()` · `Overlay.tsx` الخلفية والعناوين والملصقات وخطوات واتساب و Google والختام · `index.tsx` الموسيقى والمؤثرات).
- **عناصر 3D جديدة:** `VaultDoor` و `Key` في `remotion/studio/src/lib/three3d/Safety.tsx`.
- **المقاطع (فريم):** hook 0–120 · one 120–408 · two 408–696 · wa 696–984 · google 984–1272 · rule 1272–1488 · end 1488–1754 (58.5ث).
- **الرندر:**
  ```bash
  cd remotion/studio
  npx remotion render TwoLocks ../../output/2026-10-29-video/video_raw.mp4 --gl=angle --crf=20 --concurrency=2 --timeout=120000
  npx remotion ffmpeg -i video_raw.mp4 -c:v libx264 -crf 23 -preset slow -c:a copy -movflags +faststart video.mp4
  npx remotion still TwoLocks ../../output/2026-10-29-video/cover.jpg --frame=60 --gl=angle --image-format=jpeg
  ```
