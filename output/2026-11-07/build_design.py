import sys
OUT=sys.argv[1]
def bridge(n, w=1000, labels=True, on=None, small=False, crop=False):
    """جسر بثلاث ألواح: n = عدد الألواح المركّبة، on = اللوح المضاء الحالي"""
    planks=[]
    xs=[600,450,300]  # من اليمين (تجربة) لليسار (إنتاج)
    for i,x in enumerate(xs):
        if i<n:
            col='#FF7A2F' if (on is None or on==i+1) else '#E8E4DC'
            tc='#1B2B38'
            planks.append(f'<rect x="{x+4}" y="170" width="142" height="44" rx="8" fill="{col}"/>'
                          f'<rect x="{x+20}" y="214" width="10" height="34" fill="{col}" opacity=".7"/><rect x="{x+120}" y="214" width="10" height="34" fill="{col}" opacity=".7"/>'
                          f'<text x="{x+75}" y="202" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="28" fill="{tc}">{i+1}</text>')
        else:
            planks.append(f'<rect x="{x+4}" y="170" width="142" height="44" rx="8" fill="none" stroke="#E8E4DC" stroke-opacity=".55" stroke-width="3" stroke-dasharray="10 8"/>'
                          f'<text x="{x+75}" y="202" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="26" fill="#E8E4DC" fill-opacity=".55">{i+1}</text>')
    lab=''
    if labels:
        lab=('<text x="875" y="140" text-anchor="middle" font-family="IBM Plex Sans Arabic" font-weight="700" font-size="40" fill="#fff">تجربة</text>'
             '<text x="125" y="140" text-anchor="middle" font-family="IBM Plex Sans Arabic" font-weight="700" font-size="40" fill="#FF7A2F">إنتاج</text>')
    # جرف يمين ويسار + سياج + فراغ
    cliffs=('<path d="M750 170 L1000 170 L1000 420 L820 420 Q790 300 760 260 Z" fill="url(#cl)"/>'
            '<path d="M0 170 L250 170 L240 260 Q210 300 180 420 L0 420 Z" fill="url(#cl)"/>'
            '<rect x="750" y="160" width="250" height="14" fill="#C9C2B6"/><rect x="0" y="160" width="250" height="14" fill="#C9C2B6"/>')
    flag=('<line x1="125" y1="160" x2="125" y2="60" stroke="#fff" stroke-width="5"/><path d="M125 60 L60 78 L125 96 Z" fill="#FF7A2F"/>' if not labels else '')
    void=''
    defs='<defs><linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E2638" stop-opacity="0"/><stop offset="1" stop-color="#0E2638" stop-opacity=".9"/></linearGradient><linearGradient id="cl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8E4DC"/><stop offset="1" stop-color="#E8E4DC" stop-opacity="0"/></linearGradient></defs>'
    vb='0 150 1000 110' if crop else '0 0 1000 420'
    return f'<svg viewBox="{vb}" width="{w}" data-safe="ignore">{defs}{void}{cliffs}{"".join(planks)}{lab}</svg>'

TAG='مؤسسات · من التجربة للإنتاج'
CSS=open(sys.argv[2]).read()
def slide(cls, body, pg=None, handles=True):
    p=f'<div class="pg">{pg}/7</div>' if pg else ''
    h='' if handles else ' data-handles="off"'
    return f'<section class="slide {cls}"{h}><div class="grid" data-safe="ignore"></div><div class="tag">{TAG}</div>{p}{body}</section>'

S=[]
S.append(slide('s1',f'''
<h1 class="hd">التجربة نجحت<em>وما وصلت للإنتاج؟</em></h1>
<div class="br">{bridge(0)}</div>
<div class="stat"><div class="n en">95%</div><div class="t">من تجارب الذكاء الاصطناعي التوليدي في الشركات <b>ما طلع لها أثر مالي ملموس</b><i>تقرير MIT NANDA · 2025</i></div></div>
<div class="swipe">اسحب ←</div><div class="hbar">{{{{HANDLES}}}}</div>'''))
S.append(slide('s2',f'''
<h2 class="hd">في العرض <em>انبهروا</em></h2>
<div class="pol"><img src="assets/demo.jpg" alt=""></div>
<div class="sticky">وبعدين؟<br>ولا أحد فتحها<br>الأسبوع الجاي</div>
<div class="pill p1"><b class="en">Gartner</b> توقعت إن <b>30%</b> على الأقل من مشاريع الذكاء الاصطناعي التوليدي تنترك بعد إثبات الفكرة بنهاية 2025</div>
<div class="why"><span>جودة البيانات</span><span>ضوابط المخاطر</span><span>التكلفة</span><span>قيمة مو واضحة</span></div>
<div class="key">المشكلة مو بالموديل… <b>الجسر</b> بين التجربة وشغلك اليومي ناقص</div>''',2))
S.append(slide('s3',f'''
<h2 class="hd">اللوح 1: <em>اربطها بيومك</em></h2>
<div class="mini">{bridge(1,on=1,labels=False,crop=True)}</div>
<div class="row r1"><div class="lb">تجربة</div><div class="bx">تنسخ إيميل العميل في المحادثة<br>وتطلب ملخص… لما تتذكر</div></div>
<div class="row r2"><div class="lb on">إنتاج</div><div class="flow">
 <div class="nd"><img src="assets/gmail-color.svg" alt=""><span>إيميل عميل جديد</span></div><div class="ar">←</div>
 <div class="nd ai"><b>✦</b><span>يتلخّص ويتصنّف تلقائياً</span></div><div class="ar">←</div>
 <div class="nd"><img src="assets/excel-color.svg" alt=""><span>سطر في شيت الفريق</span></div></div></div>
<div class="pill p3">القاعدة: لو تحتاج أحد <b>يتذكّر يفتحها</b>… بتموت. خلّها تشتغل <b>داخل</b> العملية اللي تصير كل يوم</div>''',3))
S.append(slide('s4',f'''
<h2 class="hd">اللوح 2: <em>مالك ورقم</em></h2>
<div class="mini">{bridge(2,on=2,labels=False,crop=True)}</div>
<div class="own"><div class="av">👤</div><div><b>مالك واحد بالاسم</b>يتابعها ويقرر تكمل أو توقف<i>مو «فريق التقنية» بشكل عام</i></div></div>
<div class="kpi"><div class="kh">رقم واحد يتغيّر <i>(مثال توضيحي)</i></div>
 <div class="kl">وقت أول رد على العميل</div>
 <div class="bars"><div class="b"><span>قبل</span><div class="bar" style="width:92%"></div><em class="en">6h</em></div><div class="b"><span>بعد</span><div class="bar on" style="width:26%"></div><em class="en">1.5h</em></div></div></div>
<div class="pill p4">تقرير MIT حسب النجاح بشيء واحد: التجربة <b>تنتقل للتشغيل</b> ومعها <b>مؤشرات قابلة للقياس</b>. اللي ما ينقاس… ما ينحسب</div>''',4))
S.append(slide('s5',f'''
<h2 class="hd">اللوح 3: <em>بيانات وحدود</em></h2>
<div class="mini">{bridge(3,on=3,labels=False,crop=True)}</div>
<div class="lst">
 <div class="it"><span>1</span><div>بيانات نظيفة ومحدّثة<i>الموديل يشتغل على اللي تعطيه، مو على اللي في بالك</i></div></div>
 <div class="it"><span>2</span><div>إنسان يراجع الحالات الحساسة<i>الشكاوى، الفلوس، أي قرار يمس عميل</i></div></div>
 <div class="it"><span>3</span><div>صلاحيات وسجل لكل خطوة<i>مين شاف وش، ووش تغيّر ومتى</i></div></div>
</div>
<div class="pill p5">جودة البيانات وضعف ضوابط المخاطر من الأسباب اللي ذكرتها <b class="en">Gartner</b> لترك المشاريع</div>''',5))
S.append(slide('s6',f'''
<h2 class="hd">قبل أي تجربة <em>جاية</em></h2>
<div class="full">{bridge(3)}</div>
<div class="q"><div class="qi"><span>1</span>وين تنحط في يوم الفريق؟</div><div class="qi"><span>2</span>مين مالكها بالاسم؟</div><div class="qi"><span>3</span>وش الرقم اللي بيتغيّر؟</div><div class="qi"><span>4</span>وش يصير لو غلطت؟</div></div>
<div class="err"><b>الخطأ الشائع:</b> نجرّب أداة أقوى. <b>الصح:</b> نكمّل الجسر</div>''',6))
S.append(slide('s7',f'''
<h2 class="hd">التجربة الحلوة<br><em>لازم يكون لها جسر</em></h2>
<div class="ring"><div class="face"><img src="{{{{AVATAR}}}}" alt=""></div></div>
<div class="nm">علي التميمي</div>
<div class="ds">أتمتة وذكاء اصطناعي للشغل اليومي</div>
<div class="soc"><div>{{{{HANDLES}}}}</div></div>
<div class="ask">وش التجربة اللي نجحت عندكم… وما كمّلت؟</div>''',7,handles=False))
html=f'<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(S)}</body></html>'
open(OUT,'w').write(html)
