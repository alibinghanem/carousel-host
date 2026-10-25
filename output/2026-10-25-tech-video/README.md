# فيديو 3D تجريبي 2026-10-25: تقنية · بطارية الجوال («استوديو البطارية»)

> طلب المستخدم: مواضيع تقنية تهم عامة الناس بموشن 3D احترافي. هذا أول فيديو من بنك `tech` (k001).

- **التكوين:** `remotion/studio/src/videos/Battery3D/` (`theme.ts` المقاطع والألوان · `Scene3D.tsx` المشهد 3D الكامل بكانفس واحد · `Overlay.tsx` الخلفية والعناوين والملصقات · `index.tsx` الموسيقى والمؤثرات).
- **مكتبة 3D:** `remotion/studio/src/lib/three3d/` (Studio · Phone · Parts)، والمعرض `Test3D`.
- **المقاطع (فريم):** hook 0–120 · heat 120–420 · case 420–690 · zero 690–960 · limit 960–1260 · sum 1260–1470 · end 1470–1710 (57ث).
- **الرندر:**
  ```bash
  cd remotion/studio
  npx remotion render Battery3D ../../output/2026-10-25-tech-video/video_raw.mp4 --gl=angle --crf=20
  npx remotion ffmpeg -i video_raw.mp4 -c:v libx264 -crf 23 -preset slow -c:a copy -movflags +faststart video.mp4
  npx remotion still Battery3D ../../output/2026-10-25-tech-video/cover.jpg --frame=60 --gl=angle --image-format=jpeg
  ```
