---
version: final
name: DEV-NEWS-Nexus-Core-Command-Terminal
description: A retro-cyber Y2K-themed classified intelligence broadcast interface. It blends Y2K-era tactile windows, CRT scanline aesthetics, amber/green/red terminals, and physical manila-folder dossier layouts over a warm aged paper canvas, rejecting modern flat UI conventions in favor of tactical retro-futurism.

colors:
  paper: "#fcfaf2"
  paper-stain: "#e3d3b6"
  ink: "#111111"
  ink-faded: "#4a4947"
  blood-red: "#801c1c"
  manila: "#f4edd8"
  manila-dark: "#b89b65"
  aged-paper: "#f5f2e9"
  cyber-cyan: "#225577"
  cd-rom: "#e8e6df"

typography:
  masthead:
    fontFamily: "'UnifrakturMaguntia', 'Playfair Display', Georgia, serif"
    fontSize: "52px"
    fontWeight: "900"
    letterSpacing: "-0.02em"
    textTransform: "uppercase"
  headline:
    fontFamily: "'Playfair Display', Georgia, serif"
    fontSize: "24px"
    fontWeight: "900"
    fontStyle: "italic"
    letterSpacing: "-0.01em"
    textTransform: "uppercase"
  body:
    fontFamily: "'Old Standard TT', system-ui, sans-serif"
    fontSize: "14px"
    lineHeight: "1.45"
  terminal:
    fontFamily: "'Courier Prime', 'VT323', monospace"
    fontSize: "11px"
    lineHeight: "1.6"

effects:
  paper-grain: "SVG noise filter with fractalNoise baseFrequency 0.85 and 0.045 opacity overlaying the document"
  vignette: "radial-gradient(circle at center, transparent 40%, rgba(30, 20, 10, 0.06) 100%)"
  scanline: "linear-gradient(rgba(17, 17, 17, 0.02) 50%, transparent 50%) background-size: 100% 4px with scanline-sweep keyframe animation"

components:
  cd-rom-window:
    background: "{colors.paper}"
    border: "2px solid {colors.ink}"
    boxShadow: "5px 5px 0px {colors.ink}"
  dossier-folder:
    background: "{colors.paper}"
    border: "2px solid {colors.ink}"
    boxShadow: "6px 6px 0px {colors.ink}"
  vintage-stamp:
    background: "transparent"
    border: "2px solid {colors.ink}"
    boxShadow: "3px 3px 0px {colors.ink}"
    textTransform: "uppercase"
    fontWeight: "900"
  amber-terminal:
    background: "linear-gradient(180deg, #1b0e03 0%, #0a0400 100%)"
    border: "2px solid #e07a1b"
    boxShadow: "inset 0 0 15px rgba(224, 122, 27, 0.4), 4px 4px 0px {colors.ink}"
    color: "#ff9d3b"
  green-terminal:
    background: "linear-gradient(180deg, #021a08 0%, #000902 100%)"
    border: "2px solid #1c883e"
    boxShadow: "inset 0 0 15px rgba(28, 136, 62, 0.4), 4px 4px 0px {colors.ink}"
    color: "#44ee77"
  red-terminal:
    background: "linear-gradient(180deg, #260505 0%, #0e0101 100%)"
    border: "2px solid #991b1b"
    boxShadow: "inset 0 0 15px rgba(153, 27, 27, 0.4), 4px 4px 0px {colors.ink}"
    color: "#ef4444"
---

# Design System: DEV.NEWS — NEXUS CORE Command Terminal

## 1. Overview & Creative North Star
**Creative North Star: "Retro-Cyber Classified Terminal"**

DEV.NEWS merges Y2K tactile desktop interfaces with classical broadsheet typography and CRT terminal glows. The design is deliberately dense, tactile, and structured, mimicking a physical dossier containing classified intelligence wire archives.

---

## 2. Colors & Surface Philosophy

### The Palette
- **Canvas Base (`aged-paper` / `paper`):** The default screen container uses `#f5f2e9` (`aged-paper`). Modular elements and parchment sheets float on it with `#fcfaf2` (`paper`).
- **Tactile Elements (`manila` / `manila-dark` / `cd-rom`):** Manila folder tabs use `#f4edd8` (`manila`) and `#b89b65` (`manila-dark`). CD-ROM panels use `#e8e6df` (`cd-rom`).
- **Inks & Accents (`ink` / `ink-faded` / `blood-red`):** Pure black is avoided in favor of off-black `#111111` (`ink`). Urgency levels use `#801c1c` (`blood-red`).

---

## 3. Typography
The system uses extreme contrast between historical serifs and retro-futuristic monospace:
- **Masthead:** Large, bold gothic blackletter (`UnifrakturMaguntia` or `Playfair Display`) represents the classical wire service identity.
- **Headlines:** Medium-sized italic serif titles (`Playfair Display`) command high visual hierarchy.
- **Body & Dossier Content:** Clean serif typeface (`Old Standard TT` or `Alegreya`) formats news stories.
- **Console / Terminal Feed:** Clean monospace (`Courier Prime` or `VT323`) displays status feeds and logs.

---

## 4. Elevation & Depth
Depth is created physically rather than using modern drop-shadows:
- **Tactile Shadows:** Hard offset shadows (`3px`, `5px`, `6px`, `8px` solid black) give cards a raised, physical look.
- **Vignette and Noise:** A fixed SVG noise layer simulates low-grade paper pulp grain, while a radial gradient vignette darkens the corners of the viewport to represent a retro screen tube.

---

## 5. Components
- **CD-ROM Window / Dossier Folder:** Tactile containers featuring `2px solid #111111` borders, hard solid black shadows, and high contrast.
- **Vintage Stamp Button:** Stamped buttons with `2px` black borders and `3px` solid shadows.
- **Teletype Console Terminals:** High-contrast CRT command terminal displays in Amber, Green, or Red with internal glows and sweeping scanline sweeps.

---

## 6. Do’s and Don’ts

### Do:
- Align content inside defined column layouts separated by thin lines or double dividers.
- Use solid offset shadows (`vintage-shadow`) for interactive elements.
- Keep the font sizes distinct and hierarchical (heavy blackletter headers vs. typewriter monospace logs).

### Don’t:
- Don't use soft, modern CSS shadows or gradient blurs unless they represent terminal tube glows.
- Don't use pure primary colors or standard Tailwind buttons.
- Don't use rounded corners greater than `rounded` (4px to 8px) to keep the Y2K industrial look.
