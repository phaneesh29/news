---
version: final
name: Extreme-Vintage-Indian-Broadsheet
description: An extreme, highly textured physical newspaper interface inspired by classic Indian broadsheets (e.g., vintage Times of India). The system simulates aged, stained paper using SVG noise filters and radial gradients, heavy ink bleed using text-shadows, and relies entirely on period-accurate typography. The aesthetic is loud, dense, and authentically flawed, rejecting all modern UI conventions in favor of raw newsprint realism.

colors:
  paper: "#e4d8bc"
  paper-stain: "#cfbe9a"
  ink: "#181513"
  ink-faded: "#312a26"
  blood-red: "#781a1a"

typography:
  masthead:
    fontFamily: "'Playfair Display', serif"
    fontSize: 85px
    fontWeight: 900
    lineHeight: 1
    letterSpacing: 2px
    textShadow: "1px 1px 2px rgba(24, 21, 19, 0.5)"
    transform: "scaleY(1.1)"
  headline-main:
    fontFamily: "'Old Standard TT', serif"
    fontSize: 52px
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: -1px
    textTransform: uppercase
  headline-sub:
    fontFamily: "'Old Standard TT', serif"
    fontSize: 26px
    fontWeight: 700
    lineHeight: 1.05
    textTransform: uppercase
  body:
    fontFamily: "'Alegreya', serif"
    fontSize: 14.5px
    fontWeight: 400
    lineHeight: 1.35
    textAlign: justify
    textIndent: 15px
  dateline:
    fontFamily: "'Arial', sans-serif"
    fontSize: 10px
    fontWeight: 700
    textTransform: uppercase
    letterSpacing: 0.5px
    color: "{colors.ink-faded}"

effects:
  ink-bleed: "text-shadow: 0.5px 0.5px 1px rgba(24, 21, 19, 0.4), -0.5px -0.5px 0px rgba(24, 21, 19, 0.1)"
  paper-texture: "background-image: url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"><filter id=\"noiseFilter\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23noiseFilter)\" opacity=\"0.15\"/></svg>'), radial-gradient(circle at 50% 50%, {colors.paper} 0%, {colors.paper-stain} 100%)"
  engraving-crosshatch: "background: repeating-radial-gradient(circle at 0 0, transparent 0, {colors.paper} 10px), repeating-linear-gradient(#18151355, #18151355)"

components:
  masthead:
    borderBottom: "5px solid {colors.ink}"
    padding: 20px 0 10px 0
    pseudoAfter: "1px solid {colors.ink} (positioned 8px below main border)"
  breaking-news:
    border: "3px double {colors.blood-red}"
    backgroundColor: "rgba(207, 190, 154, 0.3)"
    padding: 12px
  advertisement-box:
    border: "4px groove rgba(24, 21, 19, 0.4)"
    background: "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(24, 21, 19, 0.03) 5px, rgba(24, 21, 19, 0.03) 10px)"
    padding: 15px
  drop-cap:
    fontSize: 64px
    lineHeight: 48px
    paddingTop: 8px
    paddingRight: 6px
    fontFamily: "'Old Standard TT'"
    fontWeight: 700
  button-coupon:
    border: "1px dashed {colors.ink}"
    backgroundColor: "transparent"
    fontFamily: "'Arial', sans-serif"
    fontSize: 11px
    fontWeight: 700
    textTransform: uppercase
---

## Overview

The "Extreme Vintage Indian Broadsheet" takes the newspaper aesthetic to its most hyper-realistic limit. It does not just replicate the layout of an old newspaper; it attempts to replicate the physical degradation of the medium itself—stained paper, bleeding ink, imperfect printing presses, and archaic typesetting.

## Core Visual Mechanics

1. **The Canvas (Paper Texture)**: We abandon solid hex colors. The background uses a complex CSS composition: an SVG fractal noise filter overlaid on a radial gradient from `#e4d8bc` (paper) to `#cfbe9a` (stain). This creates a fibrous, uneven, and aged look.
2. **The Ink (Bleed Effect)**: Ink on cheap newsprint spreads. We simulate this by applying a universal `text-shadow` to the entire container: `0.5px 0.5px 1px rgba(24, 21, 19, 0.4), -0.5px -0.5px 0px rgba(24, 21, 19, 0.1)`. This makes the text look slightly fuzzy and heavily stamped.
3. **The Accents**: Pure black `#000` is banned. We use off-blacks (`#181513`). The only color permitted on the page is a faded blood red (`#781a1a`) used strictly for "Breaking News" banners.

## Typography System

This design relies on loading specific Google Fonts that mimic early 20th-century hot-metal typesetting:

- **Masthead**: `Playfair Display`. A bold, elegant Roman serif font that feels authoritative and deeply classical, shifting away from aggressive blackletter to a cleaner, yet heavy vintage presence. It is scaled vertically (`transform: scaleY(1.1)`) and given extra heavy ink-shadows.
- **Headlines**: `Old Standard TT`. A high-contrast, strict serif font typical of late 19th and early 20th-century newsprint. Must be `text-transform: uppercase` and tightly tracked.
- **Body**: `Alegreya`. Chosen for its varied, ink-heavy, and slightly irregular humanist serif strokes that look authentic when justified and indented.
- **Utility / Datelines**: A stark, tiny, bold `Arial` in all-caps, letter-spaced to mimic typewriter inserts or lead-type dates.

## Layout & Components

- **Strict Grids**: Columns must be separated by `1px solid rgba(24, 21, 19, 0.7)` rather than solid borders, simulating fading ink.
- **Paragraphs**: No spacing between paragraphs. Instead, use a classic `text-indent: 15px` on all `p` tags (except the very first paragraph of a story, which uses a massive 64px Drop Cap).
- **Asterisms**: Use the `⁂` (U+2042) symbol to divide small sub-sections of articles.
- **Advertisements**: Ad boxes use a `4px groove` border and a faint, repeating diagonal line background to simulate the halftones or shading of old classifieds.
- **Buttons**: Rendered to look like "Clip & Mail" coupons using dashed borders (`1px dashed`).
- **Images**: Real photographs break the illusion unless carefully filtered. We simulate old metal engraving plates using a crosshatch CSS background on image placeholders: `repeating-radial-gradient` layered with `repeating-linear-gradient`.
