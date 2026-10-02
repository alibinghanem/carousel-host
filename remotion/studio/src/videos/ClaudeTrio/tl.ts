/** الجدول الزمني (30fps). كل الأرقام مضاعفات 30 = كل ثانية (نبضتين عند 120BPM). */
export const FRAMES = 1560; // 52ث
export const HIT = 120; // الـ drop على ثانية 4: الكاميرا تخترق
export const Z = { hook: 0, chat: -1800, cowork: -3800, code: -5800, compare: -7800, end: -9800 };
/** وصول الكاميرا لكل محطة / مغادرتها (بين المغادرة والوصول التالي = سفر 30 إطار) */
export const ARR = { chat: 150, cowork: 420, code: 720, compare: 1020, end: 1320 };
export const LEAVE = { chat: 390, cowork: 690, code: 990, compare: 1290 };
/** موضع الكاميرا الذي يجعل لوح المحطة بحجمه الطبيعي (المسافة 1200) */
export const camZ = (z: number) => z + 1200;
