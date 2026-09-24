---
name: Arcanum
description: An AI tarot reader drawn as a brass instrument on black paper — hairline rules, numbered plates, sepia card studies under a veil.
colors:
  ink: "#0c0b09"
  ink-2: "#161410"
  paper: "#f2ede2"
  paper-dim: "#c9c0ab"
  brass: "#b98a3d"
  brass-bright: "#e8b768"
  line: "rgba(242,237,226,0.16)"
  line-bright: "rgba(242,237,226,0.34)"
typography:
  display:
    fontFamily: "Fraunces, serif"
    fontSize: "clamp(2.6rem, 5.4vw, 4.6rem)"
    fontWeight: 440
    lineHeight: 1.03
    letterSpacing: "-0.015em"
  page-title:
    fontFamily: "Fraunces, serif"
    fontSize: "clamp(2.1rem, 4.2vw, 3.3rem)"
    fontWeight: 440
    lineHeight: 1.08
    letterSpacing: "-0.012em"
  headline:
    fontFamily: "Fraunces, serif"
    fontSize: "clamp(1.9rem, 3.2vw, 2.7rem)"
    fontWeight: 440
    lineHeight: 1.14
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Fraunces, serif"
    fontSize: "1.3rem"
    fontWeight: 440
    lineHeight: 1.3
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Fraunces, serif"
    fontSize: "1.14rem"
    fontWeight: 440
    lineHeight: 1.62
  body-mono:
    fontFamily: "Space Mono, monospace"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Space Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.14em"
  label-small:
    fontFamily: "Space Mono, monospace"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  none: "0px"
  card-inner: "2px"
  card: "3px"
  turn: "28px"
  round: "50%"
spacing:
  gutter-mobile: "24px"
  gutter: "40px"
  row: "48px"
  hero-gap: "64px"
  section: "120px"
  container: "1180px"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label-small}"
    rounded: "{rounded.none}"
    padding: "18px 26px"
  button-primary-small:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "11px 18px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.paper-dim}"
    rounded: "{rounded.none}"
    padding: "0 0 2px"
  button-ghost-hover:
    textColor: "{colors.paper}"
  nav-cta:
    backgroundColor: "{colors.brass-bright}"
    textColor: "{colors.ink}"
    typography: "{typography.label-small}"
    rounded: "{rounded.none}"
    padding: "11px 18px"
  nav-cta-hover:
    backgroundColor: "transparent"
    textColor: "{colors.brass-bright}"
  toggle-option:
    backgroundColor: "transparent"
    textColor: "{colors.paper-dim}"
    typography: "{typography.label-small}"
    rounded: "{rounded.none}"
    padding: "9px 16px"
  toggle-option-active:
    backgroundColor: "{colors.brass-bright}"
    textColor: "{colors.ink}"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.paper-dim}"
    rounded: "{rounded.none}"
    padding: "9px 14px"
  chip-selected:
    backgroundColor: "{colors.brass-bright}"
    textColor: "{colors.ink}"
  plate-label:
    textColor: "{colors.brass-bright}"
    typography: "{typography.label}"
  question-input:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "24px 26px"
  card-face:
    backgroundColor: "{colors.ink-2}"
    rounded: "{rounded.card}"
  dropdown-panel:
    backgroundColor: "{colors.ink-2}"
    rounded: "{rounded.none}"
---

# Design System: Arcanum

<!-- Documented from the shipped code (src/index.css :root tokens and component styles, pages under src/). Descriptive names are derived from the code's own vocabulary ("instrument frame", "plate", "veil"); they were not separately confirmed with the user in this pass. -->

## Overview

**Creative North Star: "The Arcanum Instrument"**

Arcanum is drawn as a precision instrument laid on black paper: near-black ink ground, warm off-white paper type, and a single brass accent that marks every point of action or measurement. Structure comes from 1px hairline rules, not from filled surfaces; sections, tables, rows, pricing cells and journey paths are all drawn as ruled lines on the ink. A fixed corner frame (four open brass-grey corners, 22px from the viewport edge) sits over every page like the registration marks of a plate, and the wordmark carries an edition number ("No. I").

The pairing of an optical-size serif (Fraunces, weight 440, with italic in brass for emphasis) and a monospace (Space Mono) for every label, lede, number and control gives the system its voice: the serif speaks, the mono measures. The card artwork (sepia studies on parchment) is always pulled into the dark room with a filter veil so it never reads as a bright rectangle pasted onto the page. Density is generous: wide section padding (120px), long measures capped in `ch`, and one primary action per view.

Motion is a single exponential ease-out used for everything that travels (reveals, lifts, the card plate turning over), with plain 0.2s colour fades for hover. It is deliberate and unhurried, never bouncy.

**Key Characteristics:**
- Ink ground, paper type, brass as the only accent.
- Hairline rules (1px, 16% and 34% paper) carry all structure; surfaces stay flat.
- Square corners everywhere except cards (3px), dots (round) and the journey turn (28px half-round).
- Fraunces 440 for voice, Space Mono uppercase with wide tracking for labels and controls.
- Card art always behind a brightness/contrast/saturation veil, tuned per context.
- One easing curve, `cubic-bezier(.16,1,.3,1)`, for anything that moves.

## Colors

A near-monochrome warm-dark palette with a single brass metal accent.

### Primary
- **Bright Brass** (`brass-bright`): the accent. Nav CTA fill, active toggle and selected chip fill, plate labels, section tags, numerals (card marks, mechanism indices, journey marks), italic emphasis inside headlines, focus outlines (1.5px), the journey node dots, hover underlines.
- **Old Brass** (`brass`): the quieter metal. Borders of informational badges (free-quota notice, lock badge), the underline of text links at rest (`deck-all-link`, `about-link`), the halo ring around the current journey-strip dot, text selection background.

### Neutral
- **Lamp-Black Ink** (`ink`): page and html background, the fill of the primary button's text, the interior of journey dots.
- **Raised Ink** (`ink-2`): the one raised surface: card faces, dropdown and mobile nav panels, the deck catalogue band, the journey art frame, hover fill for jump rows and pager links.
- **Paper** (`paper`): primary text, headlines, the primary button fill.
- **Faded Paper** (`paper-dim`): secondary text, ledes, mono body copy, inactive nav links and toggle options, the inactive card meaning, the corner frame (at 55% opacity).
- **Hairline** (`line`): default rule colour for every section border, table cell, row divider, and the hero's 64px grid.
- **Bright Hairline** (`line-bright`): rules that must be seen as an edge: control borders (toggles, chips, inputs, social buttons, burger), card borders, the journey path line and its turns, ghost-button underline.

### Named Rules
**The One Metal Rule.** Brass is the only hue on the page. Everything else is ink or paper at some strength; tints of brass (`rgba(232,183,104,0.04–0.06)`) are used only as the faint wash behind a selected or highlighted row, never as a new colour.

**The Veiled Art Rule.** Card artwork never renders unfiltered. It always takes one of the two `--card-art-filter*` custom properties on `:root`: `--card-art-filter` (brightness .42, contrast 1.1, saturate .8) for in-game faces and the deck strip; `-zoom` (.56 / 1.08 / .85) for every enlarged read. The cards index and a card's own page reuse the reading's components rather than styling art themselves: index nodes render `CardFrontFace` (thumbnail art, same veils, numeral and name, hover zoom), and the card page renders `CardPlateFace`, the zoom's chrome in flow. In-game faces and the deck strip additionally carry two ink gradient veils, dark at top (~24–26%) and bottom (~32–34%), clear in the middle, so the numeral and name have ground to sit on.

## Typography

**Display Font:** Fraunces (with serif fallback), loaded at optical sizes 9–144, weights 300 / 440 / 560 and italic 440; the system uses 440 throughout and 560 for the wordmark only.
**Label/Mono Font:** Space Mono (with monospace fallback), weight 400 (700 is loaded but not used).

**Character:** A soft, high-contrast optical serif held at a restrained 440 weight, set against a typewriter mono that handles every number, label, lede and control. The serif carries meaning; the mono carries measurement.

### Hierarchy
- **Display** (440, clamp 2.6–4.6rem, 1.03, −0.015em, max 15ch): landing hero H1 only. Italic words inside it turn brass.
- **Page title** (440, clamp 2.1–3.3rem, 1.08, max 21ch, balanced): H1 on content pages (cards index, about). Card pages scale up to clamp 2.6–4.2rem; the game select head uses clamp 2–3rem.
- **Headline** (440, clamp 1.9–2.7rem, 1.1–1.14): section H2s in the section-head grid and journey heads. The final CTA H2 runs larger (clamp 2.3–4rem, content pages 2–3.2rem) with brass italic emphasis.
- **Title** (440, 1.28–1.32rem): H3s in mechanism cells, spread rows, about steps; card names and reading titles are italic.
- **Body** (Fraunces 440, 1.1–1.2rem, 1.55–1.8, max 62–74ch): long-form reading text (card meanings, about rows, the generated reading).
- **Body mono** (Space Mono, 0.84–0.98rem, 1.6–1.75, max 46–68ch, `paper-dim`): ledes, section-head paragraphs, FAQ answers, feature lists, step descriptions.
- **Label** (Space Mono, 0.75rem, 0.14em, uppercase, brass): plate labels, section tags, dial caption.
- **Label small** (Space Mono, 0.62–0.72rem, 0.06–0.12em, uppercase): nav links, buttons, toggles, breadcrumbs, data-line terms, badges.

### Named Rules
**The Serif Speaks, Mono Measures Rule.** Headings and reading prose are Fraunces; anything that is a number, a label, an instruction or a control is Space Mono. Uppercase appears only in the mono.

**The Brass Italic Rule.** Emphasis inside a headline is Fraunces italic at the same weight, coloured brass-bright. It is not bolded.

## Layout

A centred 1180px container (`.wrap`) with 40px side gutters, 24px at ≤980px. Vertical rhythm is wide: landing sections pad 120px top and bottom; the hero 132/96px (104/64 on tablet); content pages start 72px below the header (48px on tablet) and close with a final CTA 128px below the last block (96px on tablet).

The recurring spatial device is the **0.9fr / 1.4fr two-column head**: a label or heading on the left, heading/body on the right, 48px gap. It is used by the landing section heads, journey heads, card reading rows and about rows, and collapses to one column at 980px. The card folio splits 0.82fr / 1.18fr with a 76px gap and a sticky art plate (top 110px).

Grids of equal cells (mechanism 3-up, pricing 3-up, comparison table) are drawn by borders or by a 1px gap showing the `line` colour behind ink cells, never by gutters between floating boxes.

Breakpoints (desktop-first, max-width):
- **980px**: two-column heads, hero, demo, pricing, mechanism and comparison stack to one column; header drops to the wordmark and a burger panel (64px tall); corner frame tightens to 14px inset / 16px corners; game board cards shrink (74×118) and the board scrolls sideways instead of shrinking further; the card folio becomes one column ordered label → H1 → position → plate → rest.
- **981–640px**: the journey path uses 4 nodes per row.
- **640px**: the journey path runs straight down (one node per row with a vertical hairline); the journey-strip hides the outermost neighbours; meanings stack; pager stacks.
- `(hover: none)`: the card hover zoom is removed.

## Elevation & Depth

The system is flat by default: depth comes from hairlines and from the single raised tone `ink-2`, not from shadow. Shadows appear only under things that are physically cards or floating panels, and they are always deep, soft and dark (negative spread, black at 55–100%), never coloured and never offset hard. The sticky header and fixed confirm bar are translucent ink (86% / 92%) with a 10px backdrop blur.

### Shadow Vocabulary
- **Card rest** (`0 16px 26px -20px rgba(0,0,0,0.9)`): every card face at rest.
- **Card lifted** (`0 30px 44px -26px rgba(0,0,0,0.95)` plus `0 0 0 1px brass-bright`): a board card on hover/focus.
- **Card in flight / zoom** (`0 40px 60px -30px` / `0 30px 60px -24px`, black .95): the flying card and the enlarged read.
- **Plate** (`0 34px 60px -28px rgba(0,0,0,0.85)`, mirrored upward when reversed): the card page art.
- **Panel** (`0 16px 32px -16px rgba(0,0,0,0.6)` / `0 20px 44px -22px rgba(0,0,0,0.75)`): account dropdown and mobile nav panel.
- **Primary hover** (`0 14px 30px -12px rgba(0,0,0,0.55)` plus a 1px brass ring): the primary button lifting.

### Named Rules
**The Only Cards Cast Shadows Rule.** Sections, rows, cells and the board frame are hairline-only. A shadow means "this is an object you can pick up or a panel floating over the page."

## Shapes

Square corners are the default for every control, panel, row and button (0 radius). The exceptions are material, not decorative: card faces 3px with a 2px inner hairline inset at 4.2% of the card width; node dots, avatars and the card-back emblem are round; the journey path's row turns are half-round (28px). Borders are always 1px; the only dashed stroke is an empty board slot.

The **corner frame** is the persistent silhouette: four open L-shaped corners (22×22px, 1px, `paper-dim` at 55%) fixed 22px inside the viewport, beneath the header layer (z-index 10). At ≤980px they shrink to 16px at a 14px inset.

## Components

### Buttons
Tactile but restrained: square, mono, uppercase, small.
- **Shape:** square (0).
- **Primary:** paper fill, ink text, 1px paper border, 18px/26px padding, Space Mono 0.78rem, 0.08em, uppercase, with a trailing 16px arrow icon. A compact variant (`btn-small`) uses 11/18px and 0.72rem.
- **Hover / Focus:** lifts 2px with the primary-hover shadow and a 1px brass ring; the arrow slides 4px right; 0.35s exponential ease-out. Focus uses the global 1.5px brass-bright outline, 3px offset. Disabled: 35% opacity, no pointer.
- **Ghost:** a text link, not a box: mono 0.76rem, `paper-dim`, 1px `line-bright` underline with 2px gap; hover turns paper with a brass underline. Where it must stand beside a filled primary (board readout, pricing card), it takes the boxed form: 1px `line-bright` border, 11/18px (or 17/26px) padding, uppercase.
- **Nav CTA:** brass-bright fill, ink text, 11/18px, mono 0.75rem uppercase; hover inverts to transparent with brass text and border.
- **Social sign-in:** full-width outline row (1px `line-bright`, 14/20px), icon + mono label; hover brass border and text, 1px lift.

### Toggles (segmented)
- **Style:** an inline 1px `line-bright` frame with 4px padding and 2px gaps holding mono uppercase options (0.72rem, 0.08em, 9/16px). Used for the deck style, pricing period and card orientation (Normal / Invertida, with a small card glyph that flips).
- **State:** inactive `paper-dim`, hover paper, active brass-bright fill with ink text. The reading view toggle is a variant without inner padding, divided by 1px rules between options.

### Chips
- **Style:** framing chips are 1px `line-bright` outline, mono 0.78rem, 9/14px, `paper-dim`.
- **State:** hover paper text with `paper-dim` border; selected fills brass-bright with ink text.

### Inputs / Fields
- **Style:** the question field is a transparent box with a 1px `line-bright` border, 24/26px padding, Fraunces italic 1.22rem.
- **Focus:** border turns brass-bright; no glow, no fill. Hover lifts the border to `paper-dim` over a 2% paper wash.

### Navigation
- **Header:** sticky, 78px tall (64px ≤980px), translucent ink with 10px blur and a bottom hairline. Wordmark: 22px compass-ring glyph, "ARCANUM" in Fraunces 560, and a brass mono edition index "No. I" (hidden on tablet). Links: mono 0.72rem uppercase, `paper-dim`, 38px apart; hover paper with a brass underline that draws left to right (0.28s); active page holds paper and the full underline. Utility cluster: language switcher (active in brass), account menu (round avatar with brass ring, chevron rotating 180° open), nav CTA.
- **Mobile:** a 40px square burger (1px `line-bright`) opens an `ink-2` panel of full-width mono rows separated by hairlines; the CTA becomes the panel's last full-width brass row.
- **Footer:** hairline top, mono 0.75rem copyright left, links right; stacks centred at 980px.

### Plate Label (current convention, open item)
A mono label (0.75rem, 0.14em, uppercase, brass-bright) led by a 34px brass hairline dash, sitting 28px above the page H1. Every page currently carries one, numbered as a folio plate: "Lâmina I — Tarot Online Grátis" (landing), VI (spread select), VII (question), VIII (board), IX (reading), X (sign-in), XI (readings), XII (pricing), XIII (cards index); the card page shows the card's own numeral and group; About uses "Colofão". This is the site's present grammar, recorded as observed. **The user has not decided whether to keep it**; do not extend it to new surfaces or remove it from existing ones until that decision is made.

### Section Head
The 0.9fr / 1.4fr grid: left a brass mono tag (0.75rem, 0.14em, uppercase), right the Fraunces H2 and a mono `paper-dim` paragraph (max 52ch), 76px below to the content. Collapses to one column at 980px with an 18px gap.

### Journey Path (signature)
The deck drawn as one continuous path per group. Each node: a brass mono numeral, a 9px ink dot with a brass-bright ring on a 1px `line-bright` line, and the card thumbnail hanging 28px below in a 1px `line` frame on `ink-2` (aspect 440:789, journey filter), then the name in Fraunces 0.92rem `paper-dim`. Rows alternate direction (boustrophedon: 8 per row for the Major Arcana, 7 for suits, 4 on tablet) and the line bends between rows in a 28px half-round turn. Hover/focus: art rises 6px with a brass border and lighter filter, the dot fills brass and scales 1.3, the name turns paper. On phones it becomes a vertical list with the line running down the left.

The **journey strip** on a card page repeats the idea in one line: two neighbours either side, a gradient-faded hairline through the dots, the current dot filled brass with a 4px ink gap and a brass halo ring.

### Card Folio
The card page: art plate left (sticky, max 440px, 1px `line-bright`, plate filter, plate shadow), copy right: plate label, H1, mono position line, a hairline-ruled data line (`dt` mono 0.64rem uppercase over Fraunces 1.06rem values, divided by vertical rules), the orientation toggle, then two meanings side by side divided by a vertical rule. Switching to Invertida turns the plate 180° over 1.1s on the exponential ease-out; the inactive meaning steps back to `paper-dim` and the active one gains a 7px brass dot. Both meanings stay in the DOM.

### Content Rows
Love / work / advice on card pages and every About block: 0.9fr / 1.4fr rows between hairlines (40–52px vertical padding), Fraunces H2 left (clamp 1.4–2rem), Fraunces 1.14rem body right (max 62ch), optional mono note. About step lists put a brass mono numeral in a 52px column; bullet lists use a 16px brass dash.

### Card Pager
Two 1px `line` bordered links (previous left, next right-aligned), mono direction label over a Fraunces name; hover brass border on `ink-2`.

### Final CTA
A centred closing section: large Fraunces H2 (brass italic emphasis), a mono `paper-dim` paragraph (max 44ch), and the primary button with arrow. On content pages it sits under a top hairline and may end with a small mono disclaimer (0.74rem, 85% opacity).

### Card Face (game)
5:8 cards sized by `--card-w` / `--card-h` (108×172, 74×118 on tablet); every internal measure is a ratio of card width. Front: veiled art, brass mono numeral with suit glyph top-left, italic Fraunces name bottom. Back: a 45°/−45° hairline crosshatch on `ink-2` with a round brass emblem.

## Do's and Don'ts

### Do:
- **Do** draw structure with 1px `line` / `line-bright` rules and let `ink` show through; use `ink-2` as the only raised surface.
- **Do** put every card image behind one of the `--card-art-filter*` properties; pick the variant by context rather than inventing a new filter.
- **Do** set labels, numbers, controls and ledes in Space Mono; headings and reading prose in Fraunces 440.
- **Do** use `cubic-bezier(.16,1,.3,1)` for movement (0.28–0.5s for lifts and draws, 0.8s for reveals, 1.1s for the plate turn) and plain 0.2s ease for colour changes.
- **Do** keep controls square, 1px bordered, and fill them brass-bright only when active or selected.
- **Do** use the 0.9fr / 1.4fr two-column head for any heading-plus-body block, collapsing at 980px.

### Don't:
- **Don't** introduce a second accent hue; brass is the only colour.
- **Don't** round buttons, panels, toggles or rows; radius belongs to cards, dots and the journey turn only.
- **Don't** put shadows on sections, cells or rows; shadows are for cards and floating panels.
- **Don't** show card art at full brightness on the ink ground.
- **Don't** add new header chrome; every page shares the wordmark, nav, language switcher, account menu and CTA (or back link).
