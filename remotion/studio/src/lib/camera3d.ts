/**
 * كاميرا ثلاثية الأبعاد بـ CSS: لقطة واحدة متواصلة بدون قطع.
 * الكاميرا تمر بمفاتيح (إطار + موضع + دوران) عبر منحنى Hermite ناعم،
 * فالسرعة ما تنقطع أبداً. «محطة» للقراءة = مفتاحان بـ stop: true (سرعة صفر عند الوصول والمغادرة).
 *
 * المحاور: x يمين، y تحت، z نحو المشاهد. الكاميرا تنظر باتجاه −z.
 * «المسافة» d = cz − z هي بُعد العنصر عن عين الكاميرا، وحجمه الظاهر = PERSPECTIVE / d
 * (d = 1200 → حجمه الطبيعي). عين CSS تقع على بعد PERSPECTIVE أمام مستوى الشاشة،
 * فنزيح العالم بـ (cz − PERSPECTIVE) عشان المعادلة تطلع صح.
 */
export const PERSPECTIVE = 1200;

export type Cam = { x: number; y: number; z: number; yaw: number; pitch: number; roll: number };
export type Key = { f: number; stop?: boolean } & Partial<Cam>;

const FIELDS: (keyof Cam)[] = ["x", "y", "z", "yaw", "pitch", "roll"];

/** يملأ القيم الناقصة من المفتاح السابق */
type FKey = { f: number; stop: boolean } & Cam;
const fill = (keys: Key[]): FKey[] => {
  let prev: Cam = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0 };
  return keys.map((k) => {
    const c = { ...prev, ...k, stop: !!k.stop } as FKey;
    prev = c;
    return c;
  });
};

/** Hermite تكعيبي عبر المفاتيح (مماسات بفرق متمركز → حركة متصلة السرعة) */
export const makePath = (raw: Key[]) => {
  const k = fill(raw);
  return (f: number): Cam => {
    if (f <= k[0].f) return k[0];
    if (f >= k[k.length - 1].f) return k[k.length - 1];
    let i = 0;
    while (f > k[i + 1].f) i++;
    const a = k[i];
    const b = k[i + 1];
    const p = k[Math.max(0, i - 1)];
    const n = k[Math.min(k.length - 1, i + 2)];
    const h = b.f - a.f;
    const t = (f - a.f) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    const out = {} as Cam;
    for (const key of FIELDS) {
      // stop: true على المفتاح = سرعة صفر عنده (وقفة محطة): الكاميرا ما تتجاوزها أبداً
      const m0 = i === 0 || a.stop ? 0 : ((b[key] - p[key]) / (b.f - p.f)) * h;
      const m1 = i + 1 === k.length - 1 || b.stop ? 0 : ((n[key] - a[key]) / (n.f - a.f)) * h;
      out[key] =
        (2 * t3 - 3 * t2 + 1) * a[key] + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * b[key] + (t3 - t2) * m1;
    }
    return out;
  };
};

/** مصفوفة الرؤية لعنصر «العالم» */
export const worldTransform = (c: Cam) =>
  `rotateZ(${-c.roll}deg) rotateX(${-c.pitch}deg) rotateY(${-c.yaw}deg) translate3d(${-c.x}px, ${-c.y}px, ${PERSPECTIVE - c.z}px)`;

/** نسخة دورانها حول عين الكاميرا نفسها (صحيحة للميل الكبير pitch > ~12°): translateZ(P) خارجي ثم الدوران ثم إزاحة الكاميرا */
export const worldTransformEye = (c: Cam) =>
  `translateZ(${PERSPECTIVE}px) rotateZ(${-c.roll}deg) rotateX(${-c.pitch}deg) rotateY(${-c.yaw}deg) translate3d(${-c.x}px, ${-c.y}px, ${-c.z}px)`;

/** مسافة العنصر أمام الكاميرا (تقريبية على محور النظر) */
export const depth = (c: Cam, z: number) => c.z - z;

/** شفافية حسب المسافة: يتلاشى قبل ما يلمس الكاميرا، ويذوب في الضباب البعيد */
export const fade = (d: number, near = 380, nearSoft = 260, far = 5200, farSoft = 1600) => {
  if (d <= near - nearSoft) return 0;
  const n = Math.min(1, (d - (near - nearSoft)) / nearSoft);
  const fz = d <= far ? 1 : Math.max(0, 1 - (d - far) / farSoft);
  return n * fz;
};

export const smooth = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};
