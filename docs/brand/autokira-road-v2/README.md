# AutoKira road monogram v2

Local candidate identity assets, created 2026-10-26. Existing app branding, favicon references and manifest are unchanged. No commit, push or deployment was performed.

## Inspected source of truth

| Source | Current evidence |
| --- | --- |
| `src/index.css:5–45` | Light brand #006B63, background #F5F8F8, white surfaces, ink #172C2B; dark brand #78CBB9, background #191C20, surface #22262B, ink #EEF1F4. |
| `src/index.css:24–25` | Both display and body use system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif. No dedicated brand font is declared here. |
| `src/index.css:181–220`, `291–293` | Compact bold wordmark, negative tracking, teal Kira, fine borders, restrained 8–12px corners, flat functional controls. |
| `src/components/DrivingForm.tsx:44–57` | Current header is a live-text AutoKira wordmark plus Malaysia; no pictorial logo in this header. |
| `src/pages/cockpit.page.tsx:33–37` | Both electric-car and petrol-car modes are offered. |
| `public/logo.png` | Visually inspected: amber lightning bolt on a near-black square. |
| `public/favicon.svg` | Teal #0B7A55 tile with pale lightning bolt; this differs from the current CSS brand color. |
| `index.html:5–8` | Actual browser and touch references use PNG favicons and apple-touch-icon.png, rather than favicon.svg. |
| `docs/brand/autokira-icon-v1.png` and matching `.md` | Existing untracked A/road bitmap study, visually inspected; preserved. |

These findings come from the current local checkout, not assumptions about the repository name or older design notes.

## Direction

A compact A monogram: two substantial converging sides evoke a roadway and the initial of AutoKira. One crossbar keeps the A legible at small sizes. This is intentionally an abstract mobility cue, rather than a literal car drawing. The wordmark and surrounding product copy carry the calculation meaning; the icon does not attempt to illustrate every feature.

An alternative car-roof/equals symbol would make the vehicle/comparison story more literal, but introduces more small details. A bar-chart icon would emphasize cost but lose the driving association. The A-road is the simplest continuation of the existing wordmark and earlier local study.

This version is flat, geometric and drawn directly as SVG. It has no generated texture, 3D material or raster tracing. The same geometry is used in every export. Preview card shadows and visual effects are unnecessary for this interface.

## Reusable design prompt

> Redesign the identity for **AutoKira**, a Malaysian driving-cost calculator supporting both electric and petrol cars. Match its actual existing interface: calm, practical, readable, flat and restrained, with fine borders and softly rounded 8–12px controls.
>
> Create one compact custom **A monogram subtly inspired by two converging sides of a road**. Use substantial geometric strokes, softly rounded terminals, one clear crossbar, balanced negative space and an open lower counter. It should read as A first and suggest mobility second. Keep the silhouette clear at 16px and 32px. Communicate a trustworthy tool for understanding driving costs; do not try to pack car, currency and calculator illustrations into one mark.
>
> Use the exact current palette. Light theme: deep teal **#006B63**, dark ink **#172C2B**, white **#FFFFFF**, cool pale background **#F5F8F8**. Dark theme: mint teal **#78CBB9**, pale ink **#EEF1F4**, charcoal background **#191C20**. The primary app icon uses a solid #006B63 field and a #F5F8F8 symbol. Also provide a single-color version.
>
> Pair the symbol with the exact wordmark **AutoKira**. Match the interface's system sans-serif character: system-ui / Apple system / Segoe UI, bold approximately 750 weight, modest negative tracking. Keep Auto in the theme's text color and Kira in its teal accent. Provide separate symbol and horizontal lockup files.
>
> Exclude lightning bolts, plugs, batteries, fuel pumps, droplets, leaves, racing badges, currency signs, calculator keys, gradients, glow, shadows, 3D effects and texture. Treat electric and petrol vehicles equally. Deliver clean editable SVG artwork, transparent symbol exports, light/dark lockups and a square app icon with generous safe space. Round app-icon corners at presentation time; retain a full-bleed square master. Show small-size previews separately from the actual assets.

## Files

Candidate assets live in `public/brand/autokira-road-v2/`:

- `mark-light.svg`: transparent teal symbol for light surfaces.
- `mark-dark.svg`: transparent mint symbol for dark surfaces.
- `mark-mono.svg`: currentColor symbol, black by default as an external image. Inline it to inherit CSS color.
- `lockup-light.svg`, `lockup-dark.svg`: transparent horizontal wordmarks. Text remains editable and uses system fonts; its appearance can vary by OS. For a future fixed print master, outline the approved wordmark in a vector editor.
- `app-icon.svg`: square full-bleed 512px master. Its mark fits inside the central 80% circular maskable safe zone.
- `app-icon-180.png`, `app-icon-192.png`, `app-icon-512.png`: solid square app/touch exports; the platform can apply its own mask.
- `favicon.svg`, `favicon-16.png`, `favicon-32.png`: rounded tile browser candidates.
- `mark-transparent-512.png`: transparent raster symbol.

`preview.svg` and `preview.png` in this folder show the light/dark lockups, app icon and actual-size favicon examples. They are review sheets, not logo source files.

## Verification and integration boundary

Rendered every SVG-derived PNG with Sharp. Visually inspected the combined preview, including 16px and 32px examples. Verified dimensions, transparency and SVG parsing. The candidate mark is legible in the rendered preview; this is not a live browser-tab or physical-device test.

No app code or active icon was replaced. Adoption would require updating the PNG/touch/manifest references and optionally placing the symbol beside the existing live-text header. The manifest still contains older charcoal theme values; this proposal does not change those unrelated settings.
