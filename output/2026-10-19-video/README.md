# فيديو 2026-10-19: حملة تسويق كاملة في ساعة
- التركيب: `remotion/studio/src/videos/CampaignHour` (56.8ث، 1705 فريم): `theme.ts` · `Timer.tsx` (مؤقت المطبخ وشرائح الدقائق) · `Steps.tsx` (الهوك، عناوين الخطوات، الخمس خطوات، الختام) · `index.tsx` (البلاط، حركة المؤقت، المؤثرات).
- الرندر: `npx remotion render CampaignHour ../../output/2026-10-19-video/video_raw.mp4 --crf=20`، ثم ضغط `-crf 23 -preset slow` (5.9MB). الغلاف: الفريم 104 (الهوك).
- الموسيقى: `public/videos/campaign-hour/music.mp3`، وهي مقطوعة souq من ElevenLabs بترتيب [0–40]+[38–40]+[40–55.8] → 56.9ث، الضربة الأولى عند 4ث. الذروة بعد الرندر 0.50، وعدد العينات فوق 0.98 = 0.
- القطع على المازورات: 4ث، 12، 22، 30، 40، 48.
- المصدر: إرشادات Anthropic لكتابة الطلبات (platform.claude.com، «Be clear and direct»).
