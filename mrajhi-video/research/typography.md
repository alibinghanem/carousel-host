# Typography notes

- **Site font:** Tajawal (Next.js `next/font` → `__Tajawal_76817d`; confirmed in compiled CSS). It is a Google Font, so the *original brand UI font is available* — no substitute needed.
- **Logo wordmark:** custom heavy Arabic display lettering + a slab-ish serif English line ("Rajhi Developments & Investments"). Not a font we can load; the logo is used as an asset (traced vector), never re-typeset.
- **Video type system:** Tajawal only (800/900 for headlines, 500/700 for support, 400 for small text). Numerals: Arabic-Indic (٤٠+) on screen to match the site's price display (٦٠٬٠٠٠); Latin digits only for phone/URL/licence which the site prints in Latin.
- **Type scale (1080-wide base, scales with width):** hero 150 / headline 112 / subhead 64 / body 44 / caption 30 (px at 1920×1080: multiply by 1.0; at 1080×1920: see theme.ts).

## Final film type system (revision)
Client asked for a more professional/premium face than the site UI font. Film uses **Noto Kufi Arabic** (variable, 800 for headlines/numerals) + **IBM Plex Sans Arabic** (400–700 for text). Both SIL OFL; files + licences in `public/fonts/`. The site's own Tajawal remains documented above as the brand UI font.
