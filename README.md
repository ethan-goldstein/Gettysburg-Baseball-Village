# Gettysburg Baseball Village (sample homepage)

A one-page sample site for **Gettysburg Baseball Village**, a summer youth baseball tournament destination in Gettysburg, PA.

Static HTML/CSS/JS with no build step. Open `index.html` through any static server, e.g.:

```bash
python3 -m http.server 5173
```

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | All page content (works with JavaScript off) |
| `css/styles.css` | Design tokens, layout, components, motion |
| `js/main.js` | Header state, scroll reveals, parallax, countdown, age filter, details dialog, signup form |
| `images/` | Badge logo (SVG), compressed WebP photos, Gettysburg College wordmark |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` | Icons |
| `og.jpg` | 1200×630 link-preview card (iMessage, Slack, social) |
| `404.html` | "That one went foul." page for GitHub Pages |
| `CREDITS.md` | Source and license for every photo (also listed in the footer's "Photo credits") |
| `tools/` | Source pages for `og.jpg` and the PNG icons; re-render with headless Chrome if the hero or logo changes |

## Updating the live site

Push to `main` and GitHub Pages republishes in about a minute. Browsers cache CSS/JS for 10 minutes, so after changing `css/styles.css` or `js/main.js`, bump the `?v=` number on their links in `index.html` (e.g. `styles.css?v=3` to `?v=4`) so visitors get the new version immediately.

## Design

- **Colors:** navy `#0B2545`, cream `#F7F3EA`, paper `#FFFDF8`, orange `#F47E27` (accent only). Orange buttons use navy text for contrast; text links use burnt orange `#A84B0C`. All pairs pass WCAG AA.
- **Fonts (Google Fonts):** Fraunces (headlines), Figtree (body), Barlow Condensed (labels, scoreboard digits).
- **Motion:** scroll reveals, hero Ken Burns + hill parallax, stitch underlines, scoreboard flip digits. Everything is disabled under `prefers-reduced-motion`.

## Placeholders to replace before this goes live

- **Tournament dates:** every card says "Dates TBD". The countdown targets Fri **May 28, 2027, 8:00 AM ET** (Memorial Day weekend); change `OPENING` in `js/main.js` if needed.
- **Age groups:** sample ranges per weekend (in each card's `data-min` / `data-max` and in `TOURNAMENTS` in `js/main.js`).
- **Tournament details dialog:** format, check-in and housing lines are sample copy.
- **Signup form:** not connected to anything. Wire it to Mailchimp, Formspree, Google Forms, etc. and remove the "Sample site" note.
- **Contact:** `info@gettysburgbaseballvillage.com` and `(717) 555-0142` are placeholders.
- **Social links:** all five icons point to `#`.
- **Photos:** free-license stand-ins (see `CREDITS.md`). Swap in real Village photos when available; keep each under ~400 KB as WebP.

## Brand notes

The badge logo is original. The Gettysburg College wordmark appears only as a "Host campus" credit in the Team Housing section; the college's athletic marks (G, Bullets) are intentionally not used. Confirm the college is OK with the wordmark before launch.
