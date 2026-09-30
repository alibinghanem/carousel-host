import { createContext, useContext } from "react";
import { useWindowedAudioData, visualizeAudio } from "@remotion/media-utils";
import { Audio } from "@remotion/media";
import {
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/**
 * موسيقى تفاعلية: نحلل الموسيقى مرة وحدة في جذر الفيديو (بالفريم العالمي)
 * ونوزّع الطاقة عبر Context — كذا أي مشهد داخل TransitionSeries/Sequence
 * يقرأ نفس النبضة بدون انقطاع (لا تستدعِ useWindowedAudioData داخل المشاهد).
 */
export type Energy = {
  kick: number; // 0..1 — لحظة الضربة فقط (قفزة الباص عن متوسط آخر ~8 فريمات): للنبض الحاد
  bass: number; // 0..1 — مستوى الباص (يبقى عالي طول الـ drop): للتوهج العام
  mid: number; // 0..1 — الأصوات والأوتار
  high: number; // 0..1 — الهاي هات واللمعان
  spectrum: number[]; // 32 عمود مُطبَّع (0..1) من الباص إلى الحدّة
  frame: number; // الفريم العالمي
};

const ZERO: Energy = {
  kick: 0,
  bass: 0,
  mid: 0,
  high: 0,
  spectrum: new Array(32).fill(0),
  frame: 0,
};
const Ctx = createContext<Energy>(ZERO);

/** يُرجع طاقة الموسيقى الحالية — أصفار إذا ما فيه MusicProvider */
export const useMusic = () => useContext(Ctx);

const db = (v: number, lo = -90, hi = -25) =>
  Math.min(
    1,
    Math.max(0, (20 * Math.log10(Math.max(v, 1e-9)) - lo) / (hi - lo)),
  );
const avg = (a: number[]) =>
  a.reduce((s, v) => s + v, 0) / Math.max(1, a.length);

/**
 * يلف الفيديو كامل: يشغّل الموسيقى + يحللها.
 * <MusicProvider src="videos/x/music.mp3" volume={0.85}>…</MusicProvider>
 */
export const MusicProvider: React.FC<{
  src: string;
  volume?: number;
  children: React.ReactNode;
}> = ({ src, volume = 0.85, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const url = staticFile(src);
  const { audioData, dataOffsetInSeconds } = useWindowedAudioData({
    src: url,
    frame,
    fps,
    windowInSeconds: 10,
  });
  let e: Energy = { ...ZERO, frame };
  if (audioData) {
    const fr = visualizeAudio({
      fps,
      frame,
      audioData,
      numberOfSamples: 256,
      optimizeFor: "speed",
      dataOffsetInSeconds,
      smoothing: true,
    });
    // التحويل لديسيبل يوازن سيطرة الترددات المنخفضة
    const bands = Array.from({ length: 32 }, (_, i) => {
      // توزيع لوغاريتمي تقريبي: أعمدة أكثر للمنخفض
      const a = Math.floor(Math.pow(i / 32, 1.8) * 200);
      const b = Math.max(a + 1, Math.floor(Math.pow((i + 1) / 32, 1.8) * 200));
      return db(avg(fr.slice(a, b)));
    });
    // الضربة = قفزة الطاقة المنخفضة عن متوسط الفريمات السابقة
    const low = (fq: number) =>
      avg(
        visualizeAudio({
          fps,
          frame: fq,
          audioData,
          numberOfSamples: 256,
          optimizeFor: "speed",
          dataOffsetInSeconds,
        }).slice(0, 6),
      );
    const now = avg(fr.slice(0, 6));
    let base = 0;
    for (let i = 3; i <= 10; i++) base += low(Math.max(0, frame - i)) / 8;
    const kick = Math.min(
      1,
      Math.max(0, (now / Math.max(base, 1e-6) - 1.15) / 1.3),
    );
    e = {
      kick,
      bass: db(avg(fr.slice(0, 6)), -60, -18),
      mid: db(avg(fr.slice(12, 60)), -80, -30),
      high: db(avg(fr.slice(80, 200)), -95, -45),
      spectrum: bands,
      frame,
    };
  }
  return (
    <Ctx.Provider value={e}>
      <Audio src={url} volume={volume} />
      {children}
    </Ctx.Provider>
  );
};

/** شريط طيف صوتي (للخاتمة/الغلاف أو أسفل المشهد) */
export const Spectrum: React.FC<{
  width?: number;
  height?: number;
  color?: string;
  bars?: number;
  mirror?: boolean;
  style?: React.CSSProperties;
}> = ({
  width = 800,
  height = 120,
  color = "#fff",
  bars = 32,
  mirror = true,
  style,
}) => {
  const { spectrum } = useMusic();
  const gap = 6;
  const w = (width - gap * (bars - 1)) / bars;
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: mirror ? "center" : "flex-end",
        gap,
        ...style,
      }}
    >
      {Array.from({ length: bars }, (_, i) => {
        const v = spectrum[Math.floor((i / bars) * spectrum.length)] ?? 0;
        return (
          <div
            key={i}
            style={{
              width: w,
              height: Math.max(w, v * height),
              borderRadius: w,
              background: color,
              opacity: 0.35 + v * 0.65,
            }}
          />
        );
      })}
    </div>
  );
};

/** مكتبة المؤثرات (ElevenLabs SFX) — public/sfx/<name>.mp3 */
export type SfxName =
  | "whoosh_fast" // انتقال سريع
  | "whoosh_soft" // انزلاق مشهد
  | "impact" // كشف عنوان / ضربة
  | "pop" // ظهور عنصر
  | "click" // نقرة واجهة
  | "typing" // كتابة 1.8ث
  | "riser" // تصاعد 2.45ث ينتهي عند الذروة — ابدأه قبل الضربة بـ 73 فريم
  | "success" // نجاح / إنجاز
  | "glitch" // خلل رقمي
  | "error"; // خطأ لطيف

export const SFX_RISER_PEAK = 73; // فريمات من بداية riser إلى ذروته (30fps)

export const Sfx: React.FC<{ name: SfxName; at: number; volume?: number }> = ({
  name,
  at,
  volume = 0.6,
}) => (
  <Sequence from={at} layout="none" name={`sfx:${name}`}>
    <Audio src={staticFile(`sfx/${name}.mp3`)} volume={volume} />
  </Sequence>
);
