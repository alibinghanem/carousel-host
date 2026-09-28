# الراجحي للتنمية والاستثمارات — Promo film (Remotion)

**Current deliverable (client focus): the 9:16 «الغوص» (dive) film — `out/mrajhi-promo-9x16.mp4` (29.5 s, music-driven, continuous portal-dive transitions). Composition id `Promo-9x16` (`src/PromoDive.tsx`, `src/dive/*`); the earlier card-based cut is kept as `Promo-9x16-v1-cards`.**

Two deliverables originally planned, rendered H.264 CRF 18, 30 fps, AAC audio:

| File | Format | Length |
|---|---|---|
| `out/mrajhi-promo-16x9.mp4` | 1920×1080 | 55.5 s (1665 f) |
| `out/mrajhi-promo-9x16.mp4` | 1080×1920 | 29 s (870 f) |

Concept **«خط الأفق الذهبي»**: one gold line (lifted from the real logo) opens the film, wipes between every scene, draws the growth curve and finally assembles the logo. Everything on screen is a real site fact or a real project photo (see `research/`).

## Run / re-render
```bash
npm i
npx remotion studio                       # preview; each scene also has its own composition
npx remotion render Promo-16x9 out/mrajhi-promo-16x9.mp4 --codec=h264 --crf=18
npx remotion render Promo-9x16 out/mrajhi-promo-9x16.mp4 --codec=h264 --crf=18
npx tsc --noEmit                          # type check (0 errors)
node scripts/stills.mjs "L-03-Projects:100,205"   # QA stills → out/stills/
```
Rendering enables WebGL through `remotion.config.ts` (`angle`). Fonts, photos and grain are bundled in `public/`, so renders need no network.

## Edit
| What | Where |
|---|---|
| All on-screen copy, stats, project names, cities, CTA (url, phone) | `src/content.ts` |
| Colours, fonts, easings, springs, type sizes, margins | `src/theme.ts` (colours mirror `research/palette.json`) |
| Scene order / durations / transitions | `src/Promo.tsx` (`LANDSCAPE_SCENES`, `PORTRAIT_SCENES`; overlap = `TRANSITION` = 15 f) |
| One scene | `src/scenes/*.tsx` (each is registered as a Studio composition in `src/Root.tsx`) |
| Photos | `PICK` list in `scripts/prepare.mjs` → `node scripts/prepare.mjs` regenerates `public/photos/` + `src/generated/photos.ts`. Originals: `public/assets/projects/`; index → `research/projects-index.json`, contact sheets → `research/sheets/` |
| Logo | `public/assets/logo/logo.jpg` (only raster exists on the site). `node scripts/tracelogo.mjs` regenerates the vector trace used for animation (`src/generated/logo-paths.ts`). If you send the original SVG, swap it in `src/components/LogoReveal.tsx` |
| Music | replace `public/audio/music-placeholder.wav` (see below); fade in/out is in `src/Promo.tsx` |

Components: `KineticText` (word-level Arabic reveal), `ImageReveal` (masked reveal + parallax + Ken Burns + duotone), `StatCounter`, `ServiceCard`, `ProjectShowcase`, `GrowthChart`, `LogoReveal`, `GradientBackground`, `GrainOverlay`, `goldWipe` transition.

## Music brief
120 BPM, 4/4 (1 beat = 15 frames, 1 bar = 2 s). Warm, confident, cinematic-corporate; light modern pulse with a subtle oud/qanun colour (no vocals, no lyrics), A-minor feel that lifts to major at the logo. Structure: soft intro 0:00–0:03 (hook) → groove enters 0:03 → build through projects 0:09–0:23 → stat hits 0:31–0:40 → riser 0:45–0:48 → **logo hit at 0:48.0** → warm sustain to 0:55.5 with natural tail. Gold-wipe whooshes land at **3.0 s, 9.0 s, 23.0 s, 31.0 s, 40.0 s, 48.0 s** (16:9) and **3.0 s, 11.0 s, 17.5 s, 21.5 s** (9:16). The included WAV is only a synthesized sync placeholder.

## Notes for the client
- Company name: the site/logo read «الراجحي للتنمية والاستثمارات»; the film uses that (see open question 1).
- Numbers are exactly the About page: +26 years, +40 projects, +1,000 units, +6,000 clients, 30% annual growth.
- The growth curve is the site's own project-per-year series (1 in 2000 → 41 in 2026), drawn right→left like Arabic reading direction.
- No AI/stock imagery is used; two site images flagged in open questions were excluded.

## Open questions (`research/open-questions.md`)
# Open questions (for the client)

1. **Company name.** Brief says «مساعد عبدالله الراجحي العقارية». The site, logo and licence read «الراجحي للتنمية والاستثمارات». The video uses the latter (it is what the logo shows). If the legal/marketing name is different, tell us and we change one string in `src/content.ts` — but the logo lockup itself will still read as on the site.
2. **Logo file.** The site has only a raster logo (JPEG, 1241×1772, white background). We vector-traced it for animation (`logo-traced.svg`); please send the original SVG/AI if available for pixel-perfect final.
3. **Stats.** The About page states +40 projects, +1,000 units, +6,000 clients, 30% annual growth, +26 years. Chart data implies 41 projects in 2026. Please confirm they are current before publishing (we show "+40", "+1,000", "+6,000", "+26", "30%").
4. **Bosnia & Herzegovina** appears on /services but not on the About footprint map. Omitted from the video (we show KSA, Cairo, Dubai only).
5. **AI/stock imagery on the site.** `services/*.png` (why-us) and `misc/{development,management,rental,consulting,maintenance,general,hero}.jpg` look like stock/AI images. We did **not** use them as company work; all project scenes use real project photos from listings. Confirm whether you want any of them used decoratively.
6. **Third-party watermarks.** A few listing photos carry a portal watermark (idx 48, 50, 54 in `projects-index.json`) — excluded.
7. **Music.** No licensed track supplied → silent placeholder in `public/audio/`. See README for the brief (mood/BPM).
8. **Socials.** Handles could not be verified from the rendered site → not shown on the end card.
9. **Prices** change daily → not used in the video.
10. **English version.** Site has an EN toggle (client-side). Video is Arabic-only per brief; say if you want an EN cutdown.
11. **AI-generated photo excluded.** Listing photo idx 31 (filename `ChatGPT_Image_…`, unit «القصر») is AI-generated; not used.
12. **Spelling normalised.** On screen we write «الأندلس» (site: «الاندلس») and keep «الأهلي» spelled as the site does not appear on screen. Confirm project-name spellings.
13. **Fonts.** Film uses Noto Kufi Arabic + IBM Plex Sans Arabic (not the site's Tajawal) per client request — confirm you are happy for the ad to differ from the website type.
14. **Music.** `public/audio/music-placeholder.wav` is a synthesized 120 BPM placeholder made only to test sync/fades; replace with a licensed track (brief in README).
