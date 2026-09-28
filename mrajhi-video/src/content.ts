// Single source of truth for on-screen copy. Every fact below is printed on https://mrajhi.com.sa
// (see research/brand-brief.md). Edit here to change text in both aspect ratios.
export const BRAND = {
  name: "الراجحي للتنمية والاستثمارات",
  tagline: "تطوير عقاري واستثمارات",
  slogan: "الراجحي، شعارنا الجودة أولاً",
  cta: "ابحث عن عقارك المثالي",
  url: "mrajhi.com.sa",
  phone: "920033876",
  license: "1200012936",
};

export const HOOK = { words: ["بيتك..", "قرار", "يستحق", "الثقة"], goldFrom: 2 };
export const ASPIRATION = { l1: "حيث تلتقي الراحة بالمنزل", l2: "مكانٌ يشعرك بالدفء والأمان" };

// photo ids = index in research/projects-index.json
export const PROJECTS = [
  { name: "مشروع الأندلس", district: "الرياض · حي العليا", main: 13, second: 102 },
  { name: "مشروع الندى", district: "الرياض · حي العليا", main: 75, second: 77 },
  { name: "مشروع المنال", district: "الرياض", main: 5, second: 153 },
  { name: "مجمع روف قاردن", district: "الرياض · السليمانية", main: 4, second: 96 },
  { name: "فلل الملز", district: "الرياض · الملز", main: 18, second: 123 },
];

export const SERVICES_RE = {
  label: "الخدمات العقارية",
  items: [
    { key: "dev", title: "التطوير العقاري", text: "وحدات سكنية بمواصفات هندسية دقيقة", photo: 16 },
    { key: "mgmt", title: "إدارة الممتلكات", text: "تسويق وصيانة وتحصيل إيجارات", photo: 20 },
    { key: "rent", title: "تأجير العقارات", text: "تصاميم مبتكرة في أهم أحياء الرياض", photo: 6 },
  ],
};
export const SERVICES_CT = {
  label: "المقاولات والإنشاءات",
  items: [
    { key: "general", title: "المقاولات العامة", text: "إشراف مباشر وتقارير دورية", photo: 18 },
    { key: "consult", title: "الاستشارات الهندسية", text: "تخطيط معماري وتصميم داخلي وواجهات", photo: 29 },
    { key: "maint", title: "الصيانة والتشغيل", text: "عقود تشغيل طويلة الأجل", photo: 12 },
  ],
};

export const STATS = [
  { value: 26, suffix: "+", label: "سنة من التميز" },
  { value: 40, suffix: "+", label: "مشروع منجز" },
  { value: 1000, suffix: "+", label: "وحدة سكنية وتجارية" },
  { value: 6000, suffix: "+", label: "عميل تم خدمتهم" },
];
// "نمو المشاريع من 2000 إلى 2026" — About page growth chart (projects per year)
export const GROWTH = [1,1,2,3,4,5,6,7,9,10,11,13,15,16,18,20,21,23,25,27,29,31,33,35,37,39,41];
export const GROWTH_BADGE = { value: 30, label: "نمو سنوي" };

export const CITIES = [
  { key: "riyadh", name: "الرياض", note: "المقر الرئيسي · أكثر من 30 مشروعًا" },
  { key: "khobar", name: "الخبر", note: "المنطقة الشرقية" },
  { key: "hafr", name: "حفر الباطن", note: "المنطقة الشمالية" },
  { key: "cairo", name: "القاهرة", note: "جمهورية مصر العربية" },
  { key: "dubai", name: "دبي", note: "الإمارات العربية المتحدة" },
] as const;

export const PILLARS = [
  { title: "شفافية تامة", text: "أسعار واضحة بدون رسوم مخفية" },
  { title: "إعلانات موثقة", text: "كل عقار يُفحص ويُتحقق منه" },
  { title: "دعم مخصص", text: "مستشار يرافقك في كل خطوة" },
  { title: "إجراءات سريعة", text: "معاملات مبسطة توفر وقتك" },
];
