# فيديو 2026-11-02 (تقنية): الإنترنت يمشي تحت البحر — «تغوص»

- **التكوين:** `remotion/studio/src/videos/SubseaCables/` (`theme.ts` المقاطع على المازورة والألوان · `Scene3D.tsx` الكرة والكابلات ومقطع الكابل والمرساة والجوال، ويصدّر `gProject()` و `projectW()` · `Overlay.tsx` الخلفية والعناوين والملصقات والبطاقات والختام · `index.tsx` الموسيقى والمؤثرات).
- **عناصر 3D جديدة:** `Globe` و `Route` و `Node` و `CableSection` و `Anchor` و `Satellite` و `SeaFloor` في `remotion/studio/src/lib/three3d/Ocean.tsx`.
- **المقاطع (فريم):** hook 0–144 · intro 144–360 · trip 360–648 · cable 648–936 · hit 936–1224 · reroute 1224–1512 · end 1512–1755 (58.5ث).
- **الرندر:**
  ```bash
  cd remotion/studio
  npx remotion render SubseaCables ../../output/2026-11-02-video/video_raw.mp4 --gl=angle --crf=18 --concurrency=2 --timeout=120000
  npx remotion ffmpeg -i video_raw.mp4 -c:v libx264 -crf 23 -preset slow -c:a copy -movflags +faststart video.mp4
  npx remotion still SubseaCables ../../output/2026-11-02-video/cover.jpg --frame=122 --gl=angle --image-format=jpeg
  ```
