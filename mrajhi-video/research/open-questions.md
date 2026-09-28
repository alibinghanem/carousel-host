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
15. **Music (9:16).** `public/audio/music-portrait-A.mp3` is an AI-generated instrumental (ElevenLabs Music v2.5, 120 BPM, 29.5 s, hit at 21 s = logo). `music-portrait-B.mp3` is an alternate take. Confirm licensing/usage terms of the generated track for your distribution before paid media. The 16:9 film still uses the synthesized placeholder.
16. **Voice-over.** Dropped at the client's request (music only).
