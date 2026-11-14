# الإنترنت يمشي تحت البحر (تقنية · كابلات البحر)

## الفكرة
كثير يظنون إن الإنترنت بين القارات يمر بالأقمار الصناعية. الحقيقة: **أكثر من 99% من حركة البيانات الدولية** تعدّي بـ**كابلات بحرية** تنمدّ على قاع البحر. الأقمار الصناعية، حسب نفس الرقم، تشيل أقل من 1% (هي والبقية).

رسالتك من الخليج لأوروبا ما تطير… **تغوص**.

## رحلة الرسالة (مسار مبسّط للتوضيح)
1. جوالك يوصل لأقرب **محطة إنزال (Landing station)**، مثل محطات جدة على البحر الأحمر.
2. من هناك تغوص الرسالة كـ**ضوء داخل ألياف زجاجية** في كابل بحري.
3. تطلع في أوروبا وتكمل لموقع الخدمة.

## وش داخل الكابل؟
- قطره في القاع العميق (بدون تدريع) قريب من **خرطوم الحديقة: 17–21 ملم**.
- من الداخل لبرا: **ألياف زجاجية** (الضوء) ← **أنبوب نحاس** يمرّر الكهرباء للمكرّرات (Repeaters) اللي تقوّي الإشارة ← **أسلاك فولاذ** للحماية (بعض المسارات تحتاج تدريع أكثر، والعميقة قد تكون بلا تدريع) ← **غلاف بولي إيثيلين**.

## وش يقطعها؟
تحصل **150–200 عطل بالسنة**، وحسب ICPC أغلبها (**70–80% وأكثر**، وبعض المصادر 80–86%) بسبب **مراسي السفن وشباك الصيد**، والباقي كوارث طبيعية (زلازل، تيارات). التصليح يحتاج **سفن متخصصة** وأحياناً **أسابيع**.

## مثال حقيقي: البحر الأحمر، 6 سبتمبر 2025
- حصلت قطوعات قرب **جدة** في كابلات **SMW4** و **IMEWE** (حسب NetBlocks، وأُفيد عن قطع في FALCON GCX بالكويت).
- Microsoft حذّرت من **تأخّر أعلى (latency) على Azure** لحركة الشرق الأوسط، وقالت إنها حوّلت الحركة لمسارات بديلة.
- امتد البطء للهند وباكستان والإمارات والخليج.
- **السبب ما تأكد رسمياً** في المصادر اللي رجعت لها (فيه تقارير تلمّح لأطراف، بس غير مؤكدة)، فما ننسبه لأحد.

## الخطأ الشائع
«الإنترنت يجي من الأقمار». لا: الأقمار (مثل ستارلينك) تخدم المناطق البعيدة أو تكمّل، لكن **العمود الفقري للإنترنت بين القارات كابلات بحرية**. وقطع كابل ما يوقف الإنترنت، يخلي الطريق أطول فيصير أبطأ.

## المصادر (تحقق 2026-11-02)
- ITU: Porto Submarine Cable Resilience Summit (يناير/فبراير 2026): أكثر من 99% من حركة البيانات الدولية تعدّي بالكابلات البحرية. https://www.itu.int/es/mediacentre/Pages/MA-2026-01-26-Porto-Submarine-Cable-Resilience-Summit.aspx
- ICPC (via ISCPC Guide): تركيب الكابل وقطره 17–21 ملم للعميق بدون تدريع. https://www.cablejoints.co.uk/upload/Submarine_Cables___ISCPC_Guide.pdf
- Ciena: Telecommunications in the Harshest Environment on Earth: قطر ~20 ملم تحت 2 كم. https://www.ciena.com/insights/articles/Telecommunications-in-the-Harshest-Environment-on-Earth.html
- TeleGeography: Cable Breakage: When and How Cables Go Down. https://resources.telegeography.com/what-happens-when-submarine-cables-break
- ITU عبر Guardian Nigeria: الصيد والمراسي سبب أكثر من 80% من التلف. https://guardian.ng/business-services/fishing-anchoring-cause-80-of-submarine-cable-damage-says-itu/
- Al Jazeera (7 سبتمبر 2025): Internet disruptions in Middle East and South Asia after Red Sea cable cuts. https://www.aljazeera.com/news/2025/9/7/internet-disruptions-in-middle-east-and-south-asia-after-red-sea-cable-cuts
- Petri: Microsoft Confirms Azure Latency as Red Sea Cable Cuts Hit Internet Connectivity. https://petri.com/red-sea-cable-cuts-azure-latency-internet-slowdowns/

> www2.telegeography.com (المصدر المرشّح في بنك المواضيع) ما يفتح من الحاوية، فتحققت بـ WebSearch وبمصادر ITU و ICPC و Al Jazeera. أرقام عدد الكابلات تختلف بين المصادر (ITU نحو 500، و TeleGeography نحو 600+) فما ذكرتها بالفيديو.
