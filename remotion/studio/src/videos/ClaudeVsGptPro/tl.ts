/** الجدول الزمني (30fps · 120BPM): كل قطع على بداية مازورة (60 فريم) والـ drop عند 120 */
export const FRAMES = 1710; // 57ث
export const HIT = 120;
export const SEG = {
  hook: [0, 120],
  r1: [120, 360], // الصور
  r2: [360, 600], // البحث
  r3: [600, 840], // الملفات
  r4: [840, 1140], // الأسماء تختلف
  map: [1140, 1440], // خريطة القرار
  end: [1440, 1710],
} as const;
export const CUTS = [SEG.r1[0], SEG.r2[0], SEG.r3[0], SEG.r4[0], SEG.map[0], SEG.end[0]];
