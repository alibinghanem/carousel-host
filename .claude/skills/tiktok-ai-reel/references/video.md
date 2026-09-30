# يوم الفيديو — موشن قرافيك احترافي (Remotion)

> **الجدول (طلب المستخدم):** يوم فيديو ويوم كاروسيل. `pick_topic.py` يرجّع `"format": "video"`
> أو `"carousel"`. هذا الدليل ليوم الفيديو. يوم الكاروسيل يمشي على `SKILL.md` §٤ و `design.md` كالمعتاد.
>
> **بدون تعليق صوتي أبداً** (طلب المستخدم). الصوت = موسيقى تفاعلية + مؤثرات احترافية فقط،
> وكل المعلومة تنقرأ على الشاشة.

الموضوع والدرس نفس يوم الكاروسيل: اقرأ `content.md`، واكتب `lesson.md` أولاً. وفي يوم الأدوات
تأكد من `source` (§٤-ب في `design.md`). الفرق في طريقة التقديم فقط.

---

## ١ · المشروع: `remotion/studio/` (استوديو واحد، فيديو لكل يوم)

```
remotion/studio/
  src/lib/          ← مكتبة مشتركة: لا تنسخها، استوردها
    theme.ts        C (ألوان) · F (خطوط) · fontsReady · OUT/IN_OUT · lerp · shake
    Background.tsx  خلفية حيّة (أضواء + أرضية شبكية + حبيبات) تنبض مع الموسيقى تلقائياً
    ui.tsx          Words · Typer · usePop · Chip · Glass · ReasonHead · Flash · Burst
    Hud.tsx         Hud (شريط تقدم + وسم + الحسابين) · Handles
    music.tsx       MusicProvider · useMusic · Spectrum · Sfx
  src/videos/<Name>/   ← فيديو اليوم: index.tsx + scenes/
  src/tools/MusicMeter.tsx   ← أداة فحص طاقة الموسيقى
  public/sfx/       ← مكتبة مؤثرات ElevenLabs (جاهزة، لا تولّد من جديد)
  public/videos/<name>/music.mp3 · شعارات · صور اليوم
```

- اقرأ مهارة `remotion-best-practices` (وخاصةً `remotion-markup/audio-visualization.md` و
  `transitions`) قبل ما تبدأ.
- مثال كامل: `src/videos/AgentArchery/` (القطع على الإيقاع، انتقالات متنوعة، هدف وسهم بالـ SVG).
- **صمّم كل فيديو من الصفر حسب استعارته**. لا تكرر مشاهد AgentArchery. `lib/` للأساسيات فقط.
  سجّل الاستعارة والألوان والخط في `state/designs.json` مع `"format": "video"`، ونفس قاعدة
  عدم التكرار مع آخر ١٠ تصاميم.
- سجّل التكوين في `src/Root.tsx`: `<Composition id="<Name>" … width={1080} height={1920} fps={30}>`
  ومجلد `Folder` لمشاهده، عشان تقدر ترندر كل مشهد لوحده وأنت تفحص.

## ٢ · الإيقاع والبنية (٥٥–٦٠ ثانية)

**المستخدم اشتكى إن النسخة الأولى «سريعة وما راح يفهمه المشاهد».** القاعدة:

| | |
|---|---|
| الهوك | ٠–٤ث: جملة/رقم صادم + حركة قوية من **أول فريم** (لا شاشة فاضية) |
| كل مشهد | **٨–١٠ ثواني**. وكل نص يبقى ثابت على الشاشة ≥ (عدد الكلمات ÷ ٣) + ١.٥ ثانية بعد ما يكتمل ظهوره |
| الأفكار | فكرة وحدة لكل مشهد، ≤ ١٢ كلمة كبيرة (≥ ٦٤px) + عنصر بصري يشرحها |
| البنية | هوك ← المشكلة ← ٣ خطوات/أسباب ← الخلاصة ← الختام (علي + الحسابين) |
| الختام | آخر ~٨ث: `avatar.png` + الاسم + `<Handles/>` + دعوة متابعة |

- الحسابان ظاهران طول الفيديو (`<Hud kicker="الأداة · الميزة" hideFrom={…}/>`) وفي الختام. **لا ترقيم يوم.**
- المنطقة الآمنة: لا نص مهم فوق y≈180 ولا تحت y≈1500، ولا في آخر ~140px يمين الشاشة (أزرار تيك توك).
- العربية RTL: اتجاه الأسهم والتسلسل من اليمين. لا تحرّك قسم كامل بـ translateX سالب (يزيح الصفحة).

## ٣ · أصول حقيقية (إلزامي، نفس قاعدة الكاروسيل)

- **الشعار الرسمي** من `.claude/skills/tiktok-ai-reel/assets/logos/` → انسخه لـ `public/videos/<name>/`
  واعرضه بـ `<Img src={staticFile(...)}/>`.
- **صورة حقيقية وحدة على الأقل** من `find_photo.py` (مثلاً خلفية مشهد المشكلة، أو داخل إطار جوال/شاشة).
- لقطة رسمية أو مقطع رسمي للأداة **فقط إذا قدرت تنزّله فعلاً**. لا تصمم لقطة وتنسبها للمصدر الرسمي أبداً.

## ٤ · الموسيقى التفاعلية (ElevenLabs Music)

1. ولّد بـ `creative_generate_in_flow` · `node_type: music` · `eleven_music_v2_5` بمدة الفيديو (~60ث).
   التكلفة ~٩٠٠ رصيد لكل ٤٠ث، فولّد **مرة وحدة** بوصف دقيق:
   > Instrumental only, no vocals. Modern tech/motion-graphics track, 60 seconds.
   > Quiet tense intro 0–4s, punchy hit at 4s, build 4–15s, big drop at 16s with steady kicks,
   > short breakdown at ~44s, final hit at 48s, fade out after 57s.

   عدّل المزاج حسب استعارة اليوم (دافئ، إلكتروني، سينمائي…).
2. نزّل من الرابط الموقّع **فوراً** (ينتهي بعد ساعتين، وإن انتهى أعد جلبه بـ `creative_get_flow_run_status`)
   إلى `public/videos/<name>/music.mp3`.
3. تأكد إنها **بدون غناء**: Scribe (`creative_transcribe_audio`) لازم يرجّع نص فاضي.
   (تنبيه: كلّف ٥٥٥ رصيد مرة، ففحصه مرة وحدة فقط.)
4. حلّل الإيقاع:
   ```bash
   python3 .claude/skills/tiktok-ai-reel/beats.py remotion/studio/public/videos/<name>/music.mp3
   ```
   يطبع منحنى الشدة كل ثانية وأقوى الضربات برقم الفريم. **ضع القطع والكشف على الضربات بالضبط.**
   كل `TransitionSeries.Sequence` = (المدة حتى القطع التالي) + T (فريمات الانتقال).
5. غلّف الفيديو كامل بـ `MusicProvider` (هو اللي يشغّل الموسيقى، فلا تضيف `<Audio>` ثاني لها):
   ```tsx
   <MusicProvider src="videos/<name>/music.mp3" volume={0.85}>
     <TransitionSeries>…</TransitionSeries>
     <Hud kicker="…" hideFrom={…} />
   </MusicProvider>
   ```
   بعدها أي مكوّن يقدر يتفاعل مع الموسيقى:
   ```tsx
   const { kick, bass, mid, high, spectrum } = useMusic();
   // kick: لحظة الضربة (0..1 وتخفت خلال ~8 فريمات): للنبض الحاد (scale 1+kick*.06، وميض، اهتزاز خفيف)
   // bass: مستوى الباص المستمر: للتوهج العام
   // high: للمعان والجزيئات · spectrum: 32 عمود للطيف
   ```
   - `<Background/>` ينبض تلقائياً (`react={0}` يطفّيه لمشهد هادئ).
   - `<Spectrum width={800} height={120} color={…}/>` للختام أو كتوقيع بصري.
   - **لا تبالغ:** النبض يدعم الإيقاع ولا يهزّ النص المقروء. طبّقه على الخلفية والإطارات والأيقونات، مو على فقرات النص.
6. افحص الطاقة بصرياً إذا احتجت:
   `npx remotion render MusicMeter out/meter --sequence --frames=470-490 --props='{"src":"videos/<name>/music.mp3"}'`

## ٥ · المؤثرات الصوتية (مكتبة ElevenLabs جاهزة)

```tsx
import { Sfx, SFX_RISER_PEAK } from "../../lib/music";
<Sfx name="impact" at={HIT} volume={0.8} />
<Sfx name="riser" at={HIT - SFX_RISER_PEAK} volume={0.5} />
```

| الاسم | الاستخدام |
|---|---|
| `whoosh_fast` | انتقال سريع / دخول عنوان |
| `whoosh_soft` | انزلاق مشهد (wipe/slide) |
| `impact` | كشف رقم أو عنوان على ضربة الموسيقى |
| `pop` | ظهور عنصر/أيقونة/شريحة |
| `click` | نقرة زر أو اختيار في واجهة |
| `typing` | كتابة برومبت (1.8ث) |
| `riser` | تصاعد قبل الـ drop (2.45ث ينتهي بالذروة، ابدأه قبلها بـ `SFX_RISER_PEAK`) |
| `success` | الحل/الإنجاز |
| `glitch` | خطأ الذكاء الاصطناعي / هلوسة |
| `error` | الطريقة الغلط |

- **مؤثر لكل حدث بصري مهم، لا أكثر**. الأحجام: 0.3–0.5 للصغيرة (pop/click)، و0.6–0.9 للضربات.
- المؤثر الكبير (impact) يكون **على** ضربة الموسيقى، مو بعدها.
- احتجت صوت ما هو موجود؟ ولّده مرة بـ `node_type: sfx` (`eleven_text_to_sound_v2`، ٥٠ رصيد)
  وأضفه لـ `public/sfx/` و `SfxName` عشان يصير جزء من المكتبة.

## ٦ · الفحص (إلزامي)

1. `npx tsc --noEmit`
2. ارندر لقطات ثابتة من كل مشهد واقرأها بأداة Read:
   ```bash
   npx remotion render <Name> out/stills --sequence --frames=60,200,… --image-format=jpeg
   ```
   افحص: الحروف متصلة، والاتجاه RTL، وما فيه نص مقصوص أو متداخل، والمنطقة الآمنة، والحسابين ظاهرين.
3. عدّ الثواني لكل نص (قاعدة §٢). لو شكّيت إنه سريع، مدّده.

## ٧ · الرندر والتسليم

```bash
cd remotion/studio
npx remotion render <Name> ../../output/$(date +%F)-video/video.mp4 --crf=22
npx remotion still <Name> ../../output/$(date +%F)-video/cover.jpg --frame=<أقوى فريم> --image-format=jpeg
```
- **الحجم لازم < 30MB** (حد الرفع). لو زاد: `--crf=24`.
- `output/<D>-video/`: `lesson.md` · `caption.txt` · `cover.jpg` · `README.md`
  (الفكرة، ولحظات الإيقاع، والمؤثرات، وأمر الرندر). الـ `video.mp4` مستثنى من git.
- سلّم: `SendUserFile` للفيديو + الغلاف، واكتب **الكابشن كاملاً كنص** في المحادثة، وسطر عن فكرة
  التصميم. وذكّره: يرفعه **بدون** إضافة صوت من تيك توك (الموسيقى مدمجة ومرخصة من ElevenLabs).
- احفظ: `git add -A && git commit -m "فيديو <التاريخ>: <العنوان>" && git push -u origin claude/daily-tiktok-reels-task-eh6n4x`

## احتياط

لو Remotion تعطّل تقنياً: `render_video_html.py` (محرك HTML القديم) مع `--music` أو موسيقى ElevenLabs،
ونفس قواعد الإيقاع والأصول. ولو ElevenLabs ما اشتغل: `music_bed.py` (موسيقى برمجية) + `public/sfx/`.
