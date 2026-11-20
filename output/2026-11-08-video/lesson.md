# Claude · Connectors: خلّه يشتغل على بياناتك

## الفكرة
Claude لحاله ما يشوف إيميلك ولا ملفاتك ولا تقويمك. **Connectors** (الموصلات) تخلّيه يوصل لتطبيقاتك، يجيب بياناتك منها، و**ينفّذ إجراءات فيها**. من الموصلات اللي تذكرها صفحة المساعدة: Gmail و Google Drive و Google Calendar و Slack و GitHub و Microsoft 365 و Linear.

## كيف تشغّلها؟
1. في المحادثة: اضغط **+** (أو اكتب /) ← مرّر على **Connectors** ← **Manage connectors**، ثم **+** جنب Connectors. (أو من الإعدادات: **Customize > Connectors**.)
2. اختر الموصل ← **Connect** أو **Install** ← كمّل تسجيل الدخول والإعدادات.
3. في أي محادثة: **+** ← **Connectors** ← فعّل الموصل اللي تبيه.

## مثال حرفي
بعد ما تفعّل Gmail و Drive و Calendar: «وش اجتماعاتي بكرة؟ وجيب آخر إيميل من العميل عن العقد، وملف عرض السعر من Drive». سؤال واحد يسحب من ثلاث تطبيقات.

## الأمان
- Claude **يورث صلاحياتك**: ما يقدر يوصل لملف أو قناة أو سجل أنت ما تقدر توصل له في الخدمة نفسها.
- وصّل بس الخدمات اللي تثق فيها وراجع الصلاحيات، خصوصاً الموصلات المخصّصة اللي ما تحققت منها Anthropic.
- عندك 10 موصلات أو أكثر؟ الصفحة تقترح تخلّي **Tool access** على **On demand**.

## لمين متاحة؟
- الموصلات الجاهزة (web connectors) متاحة **لكل المستخدمين** على Claude والويب وسطح المكتب والجوال (iOS و Android).
- **Team و Enterprise:** المالك (Owner) يضيف الموصل للمنظمة أول من **Organization settings > Connectors** ← **Browse connectors** ← **Add to your team**، وبعدها كل شخص يسجّل دخوله بنفسه.
- الموصلات المخصّصة (remote MCP) متاحة في Free و Pro و Max و Ultra و Team و Enterprise، والمجانية **موصل مخصّص واحد بس**.

## الخطأ الشائع
تسأل Claude «وش في إيميلي؟» بدون ما توصّله، ويجاوبك إنه ما يقدر. الحل مو تنسخ وتلصق… الحل توصّل.

## المصدر (تحقق 2026-11-08)
- Claude Help Center: Pre-built web connectors using remote MCP: https://support.claude.com/en/articles/11176164-pre-built-web-connectors-using-remote-mcp
