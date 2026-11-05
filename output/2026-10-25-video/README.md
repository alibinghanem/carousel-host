# فيديو 2026-10-25: ChatGPT — تحليل Excel («غرفة التحميض»)

- **التكوين:** `remotion/studio/src/videos/Darkroom/` (`theme.ts` الألوان والمحطات · `Stations.tsx` الغرفة والكاميرا والمحطات · `Overlay.tsx` العناوين والختام · `index.tsx` الصوت).
- **الفكرة:** طاولة تحميض تحت ضوء أمان أحمر، والكاميرا (`camX`) تمشي يسار من محطة لمحطة (كل محطة 1200 وحدة): صورة محل حقيقية في الحوض ← ورقة «ملف المبيعات» تطلع لجهاز التكبير (ChatGPT بشعار OpenAI) والجدول التفاعلي ينعرض ← البرومبت ينكتب والرسم يتحمّض (الأعلى أخضر والأضعف أحمر) ← 4 رسوم تفاعلية على حبلين بمشابك وزر «Switch to interactive chart» ← ورقة تلميحات بالملخص (مثال) ← 4 بطاقات حدود ← صورة علي تتحمّض.
- **المقاطع (فريم):** hook 0–120 · upload 120–390 · prompt 390–660 · charts 660–930 · sum 930–1200 · tips 1200–1470 · end 1470–1710 (57ث).
- **الموسيقى:** ElevenLabs رفض الطلب (429 rate limit، والرصيد ناقص من قبل)، فاستخدمت مقطوعة human-loop من ElevenLabs بترتيب [0–20]+[16–20]+[20–53] مقصوصة لـ 56.5ث مع تلاشي 1ث.
- **الخطوط:** Vazirmatn 900 · IBM Plex Sans Arabic · JetBrains Mono · Space Grotesk.
- **الرندر:**
  ```bash
  cd remotion/studio
  npx remotion render Darkroom ../../output/2026-10-25-video/video_raw.mp4 --crf=20
  npx remotion ffmpeg -i video_raw.mp4 -c:v libx264 -crf 23 -preset slow -c:a copy -movflags +faststart video.mp4
  npx remotion still Darkroom ../../output/2026-10-25-video/cover.jpg --frame=60 --image-format=jpeg
  ```
