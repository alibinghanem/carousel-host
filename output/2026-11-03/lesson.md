# Copilot في Excel: اسأل جدولك (Copilot · Excel)

## الفكرة
بدل ما تدوّر على معادلة أو تبني PivotTable، تفتح **Copilot** داخل Excel وتكتب سؤالك بجملة عادية: «أي منطقة الأعلى مبيعاً؟». Copilot يحلّل بياناتك، ويكتب المعادلة، ويرسم الرسم، وأحياناً يعدّل الملف نفسه.

## كيف تبدأ
1. احفظ الملف في **OneDrive** وشغّل **الحفظ التلقائي (AutoSave)**. Copilot في Excel يحتاجه، وما يشتغل مع ملف غير محفوظ.
2. رتّب بياناتك في جدول واضح بعناوين أعمدة، وتجنّب الخلايا المدمجة. (نصيحة عملية، مو شرط رسمي.)
3. اضغط **أيقونة Copilot** في الزاوية السفلية اليمنى من نافذة Excel (وتنتقل Microsoft تدريجياً لزر موحّد بين Word و Excel و PowerPoint).
4. اكتب سؤالك، وتجي الإجابة في لوحة جانبية.

## ثلاث أوضاع
- **محادثة (Chat):** يجاوب ويحلّل بياناتك **بدون ما يغيّر الملف**.
- **خطة (Plan):** يعرض لك الخطوات وأنت توافق قبل التنفيذ.
- **تعديل (Edit):** الوضع الافتراضي، يعدّل الملف مباشرة. ما يشتغل لو **خيارات الحساب (Calculation Options)** على Manual، والملف لازم بصيغة حديثة.
- على **الكمبيوتر والويب** الأوضاع الثلاثة، وعلى **آيباد** المحادثة والخطة، وعلى **آيفون وأندرويد** المحادثة بس.

## وش تقدر تطلب؟ (أمثلة)
- Summarize trends and outliers: ملخّص واتجاهات وقيم شاذة.
- Explain this formula: يشرح معادلة الخلية المحددة.
- Add a profit margin column: عمود بمعادلة جاهزة.
- Create a PivotTable by region / Make a chart of sales by month: PivotTable ورسوم.
- Highlight values above 10,000: تلوين وترتيب وفلترة، وتضغط **Apply** عشان تشوف التغيير.
- تحليل متقدم بـ Python: ينشئ ورقة جديدة ويكتب الكود (يحتاج Python in Excel).

## الخطأ الشائع والتنبيهات
- **دليل قديم فيه دالة COPILOT؟** Microsoft أعلنت إنها **لم تعد متوفرة في Excel بداية 14 سبتمبر 2026**، وأي خلية فيها تُرجع `#NAME?` عند إعادة الحساب. استخدم لوحة Copilot بدلها.
- **اللغة:** Microsoft تقول إن Copilot في Excel يقبل أوامر بلغات كثيرة لكنه **مدرّب أغلبه على الإنجليزي** وقد يضعف الأداء بلغات ثانية. جرّب بالعربي وبالإنجليزي وقارن. (عمّمت الأمثلة بالإنجليزي في التصميم.)
- **الاشتراك:** Microsoft 365 Personal أو Family **مع رصيد AI**، أو Premium، أو خطة Copilot تجارية، أو خطط الأعمال المؤهلة، وتتأثر بإعدادات المنشأة. وفي الخطط الفردية الميزة **لصاحب الاشتراك بس**.
- **راجع كل نتيجة:** Copilot ممكن يغلط في معادلة أو رقم. جرّبه على نسخة قبل ملفك المهم. وحدّ حجم الجدول المذكور: حتى **2 مليون خلية**.

## مثال حرفي
جدول مبيعات فيه مناطق وأشهر. تكتب: «Which region sells the most?» فيجاوبك بالأعلى ويقترح رسم، وبعدها تكتب: «Add a column for the share of total» فيضيف لك عمود المعادلة.

## المصادر (تحقق 2026-11-03)
- Microsoft Support: Get started with Copilot in Excel: https://support.microsoft.com/en-us/excel/copilot/get-started-with-copilot-in-excel
- Microsoft Support: Frequently asked questions about Copilot in Excel: https://support.microsoft.com/en-us/excel/copilot/frequently-asked-questions-about-copilot-in-excel
- Microsoft Support: Frequently asked questions about Copilot in Microsoft 365 subscriptions: https://support.microsoft.com/en-us/microsoft-365-copilot/frequently-asked-questions-about-copilot-in-microsoft-365-subscriptions
- Microsoft Support: COPILOT Function (إيقاف الدالة): https://support.microsoft.com/en-us/excel/functions/copilot-function
- Microsoft Support: Get data insights / Visualize your data with Copilot in Excel
- Microsoft Support: Copilot in Excel tutorial for screen reader users (حد 2 مليون خلية)

> support.microsoft.com ما يفتح من الحاوية (WebFetch)، فتحققت بـ WebSearch على نفس الصفحات الرسمية. وقائمة اللغات المدعومة في Excel بالتحديد تتغير؛ أحد المصادر القديمة ذكر ثماني لغات بدون العربية، والـ FAQ الحالي يذكر نحو 50 لغة، فكتبت «الإنجليزي أدق» وما أكدت دعم العربي.
