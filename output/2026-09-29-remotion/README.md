# فيديو Remotion: ليش وكيلك يطيش؟ (أتمتة · الوكلاء)

- **المشروع:** `remotion/agent-archery/` (React + Remotion 4.0.530). المشاهد في `src/scenes/`.
- **المدة:** 40 ثانية · 1080×1920 · 30fps.
- **الموسيقى:** ElevenLabs Music (`eleven_music_v2_5`)، آلية بدون غناء (تأكدت عبر Scribe).
  - ضربة عند ث4، والسهم يطيش عليها.
  - drop عند ث12، ويبدأ عليه السبب الأول.
  - ركلات قوية كل 4 ثواني، وتلاشي بعد ث36.
- **المؤثرات:** مولّدة محلياً (`public/sfx/`): whoosh، thud، pop، tick، click، ding، swell، sub.
- **التشغيل:**
  ```bash
  cd remotion/agent-archery && npm i
  npx remotion studio                                  # معاينة وتعديل
  npx remotion render AgentArchery out/video.mp4       # تصدير
  ```
