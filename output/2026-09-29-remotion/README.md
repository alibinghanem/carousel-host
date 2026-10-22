# فيديو Remotion: ليش وكيلك يطيش؟ (أتمتة · الوكلاء)

- **المشروع:** `remotion/studio/` (React + Remotion 4.0.530). المشاهد في `src/videos/AgentArchery/scenes/`.
- **المدة:** 60 ثانية · 1080×1920 · 30fps (أُبطئت بطلب المستخدم لتكون أوضح للقراءة؛ نسخة 40ث في سجل git).
- **الموسيقى:** ElevenLabs Music (`eleven_music_v2_5`)، آلية بدون غناء (تأكدت عبر Scribe).
  - مُدّت لـ 60ث بقص على النبض من نفس المقطوعة (`public/videos/agent-archery/music_40s.mp3` الأصلية).
  - ضربة عند ث4، والسهم يطيش عليها.
  - drop عند ث16، ويبدأ عليه السبب الأول. وإصابة الهدف على ركلة ث48.
  - ركلات قوية كل 4 ثواني، وتلاشي بعد ث57.
- **المؤثرات:** مولّدة محلياً (`public/sfx-synth/`): whoosh، thud، pop، tick، click، ding، swell، sub.
- **التشغيل:**
  ```bash
  cd remotion/studio && npm i
  npx remotion studio                                  # معاينة وتعديل
  npx remotion render AgentArchery out/video.mp4       # تصدير
  ```
