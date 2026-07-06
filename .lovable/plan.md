
# Mrora — DesignCube-style agency site (animation-first)

Rebuild the reference agency site as a single-page app rebranded to **Mrora** using the uploaded M-monogram logo. Priority is faithful reproduction of the motion — custom cursor, rotating 3D cube, dual marquees, giant scroll-in headings, tilted portrait cards, sliding testimonials, and section-linked scroll effects.

## Brand
- Name: **Mrora** — replace "Design*Cube" everywhere (asterisk word-separator kept: `MRORA`, `ABOUT*US`, `MEET*THE*TEAM`, `CUSTOMER*THOUGHTS`)
- Logo: uploaded `image.png` (M monogram) in nav + favicon
- Palette: `#000` bg / `#FFF` fg / `#8A8A8A` muted / **accent `#C6FF3D`** (neon lime)
- Type: **Bricolage Grotesque** heavy weights (display + body), loaded via Google Fonts `<link>` in `__root.tsx`

## Motion system (this is the deliverable)

Every effect below is built to match the video frame-for-frame.

1. **Custom cursor** — two fixed divs following `mousemove`
   - Inner: 6px white dot, exact position, no lag
   - Outer: 32px ring, lerp-follows with `requestAnimationFrame` (delayed trail)
   - On `[data-cursor="hover"]` (buttons, cards, links): ring scales to 56px and fills neon-green; on `[data-cursor="text"]`: becomes I-beam
   - Native cursor hidden via `* { cursor: none }`

2. **Top service marquee** — infinite left-scroll ticker, green `✚` between items, duplicated track, `@keyframes marquee { to { transform: translateX(-50%) } }`, 40s linear infinite

3. **Hero rotating cube** — real CSS 3D
   - Wrapper `perspective: 1600px`; inner `.cube` with `transform-style: preserve-3d`
   - 6 faces (`front/back/left/right/top/bottom`) each 520×520 with a laptop-mockup image
   - Auto-rotate via `@keyframes cubeSpin { to { transform: rotateY(360deg) rotateX(360deg) } }` 24s linear
   - On pointer-move over hero: JS overrides transform to `rotateY(mouseX)` + `rotateX(-mouseY)` (tilt-follow); releases back to auto after 1.5s idle
   - Behind cube: giant faded `MRORA` wordmark, `clip-path: inset(...)` so the cube visually "cuts" into the letters
   - Neon-green highlighted outline drawn behind cube as a rotating rounded rect (matches video's green frame flicker)

4. **Section reveal headings** (`ABOUT*US`, `MEET*THE*TEAM`, `CUSTOMER*THOUGHTS`, `AWARDS`) — `IntersectionObserver` triggers:
   - Letters split into spans, staggered `translateY(60%) → 0` + `opacity 0 → 1`, 40ms per char, cubic-bezier(0.2, 0.8, 0.2, 1)
   - Small arrow-up glyphs (↑) between words, drawn as SVG, animate in last

5. **Stats block** — numbers count up from 0 to target using `requestAnimationFrame` when scrolled into view; neon-green digits, muted caption fades in 200ms after

6. **"02 — Your Vision, Our Expertise"** — index number scales from 0.7→1 on enter, service tag row is a **reverse-direction marquee** (right-to-left offset from top marquee)

7. **Meet the team grid** — 6 portrait cards in 3×2
   - Each card has a subtle `transform: rotate(±1deg) scale(0.98)` idle; on hover tilts to `rotate(0) scale(1)` with 300ms spring
   - One slot is the tilted neon-green **"Visit My X (Twitter) ↗"** card, permanently rotated `-8deg`, on hover rotates to `0deg` and lifts
   - Behind grid: giant `MEET*THE*TEAM` with the same char-stagger reveal
   - Dot pagination pill at bottom (3 dots, active one green)

8. **Testimonials** — horizontal slider
   - Track uses `transform: translateX(-100% * index)` with `transition: transform 700ms cubic-bezier(0.65,0,0.35,1)`
   - Prev/next chevron buttons (custom-cursor hover state)
   - Quote text fades + slides in 100ms after slide settles
   - Auto-advance every 6s, pauses on hover

9. **Awards list** — rows fade+slide in on scroll; right-side sticky `AWARDS` text stays pinned while list scrolls past (position: sticky)

10. **Projects bento** — 3-column grid of monitor/laptop mockup cards; on hover, image `scale(1.04)` inside `overflow: hidden`, label slides up from bottom

11. **Global scroll polish** — CSS `scroll-behavior: smooth`; sections use `IntersectionObserver` + `.in-view` class toggling opacity/translate

## Structure & files
- `src/styles.css` — black/lime tokens, cursor rules, cube 3D + marquee + reveal keyframes, `@utility` helpers
- `src/routes/__root.tsx` — Google Fonts link (Bricolage Grotesque 400/600/800), real title/description/OG ("Mrora — Design & Digital Studio"), favicon PNG
- `public/favicon.png` — from uploaded M logo; delete default `favicon.ico`
- `src/assets/logo-mrora.png.asset.json` — Lovable asset pointer for the M logo (from `/mnt/user-uploads/image.png`)
- `src/assets/*` — generated images: 6 laptop mockups (cube faces), 6 team portraits, 6 project mockups, 3 testimonial avatars
- `src/components/`:
  - `Cursor.tsx` — dot + ring + lerp
  - `TopMarquee.tsx`, `TagMarquee.tsx`
  - `Nav.tsx` — back-pill top-left, logo center
  - `Hero.tsx` + `Cube3D.tsx` — 3D cube with pointer tilt
  - `AboutHeading.tsx` (reusable stagger-reveal heading)
  - `Stats.tsx` — count-up
  - `Vision.tsx` (02 section)
  - `Services.tsx` — expandable rows
  - `Team.tsx` — tilted grid + Twitter card
  - `Testimonials.tsx` — carousel
  - `Awards.tsx` — sticky-right list
  - `Projects.tsx` — bento
  - `CTA.tsx`, `Footer.tsx`
  - `hooks/useInView.ts`, `hooks/useCountUp.ts`, `hooks/useMouse.ts`
- `src/routes/index.tsx` — compose sections, remove placeholder
- Install: `framer-motion`, `lucide-react`

## Copy (all "Mrora")
Tagline: "At Mrora, we specialize in web design, SEO, UI/UX, branding, and digital marketing. Elevate your brand and transform your digital presence with our innovative design solutions."
`*ESTABLISHED — 2026 / BUCHAREST, ROMANIA`
Awards, testimonials, and case copy rewritten to reference Mrora.

## Out of scope
- No backend/auth/DB
- Contact form is static UI only
- No real Twitter link — button is decorative

Ready to build on approval.
