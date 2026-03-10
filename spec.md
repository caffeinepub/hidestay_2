# HIDESTAY

## Current State
The app uses a generic purple-toned OKLCH color palette (hue 145 area). Buttons, primary colors, and accents are all purple-based. The dashboard has a mountain hero image with a dark overlay. The footer shows only a caffeine.ai credit. The splash screen uses the same mountain background.

## Requested Changes (Diff)

### Add
- Saffron (#FF9933) accent color replacing the current accent
- Forest Green (#1F7A4C) as the primary color
- Indian flag-inspired gradient on the hero/splash: saffron at the top, green at the bottom, white center
- Footer line: "Discover Hidden Stays in India" in all pages that have a footer
- New Uttarakhand mountain background image: `/assets/generated/uttarakhand-mountains.dim_1600x600.jpg`

### Modify
- `index.css`: Update OKLCH color tokens — primary to Forest Green, accent to Saffron, background to white
- All buttons app-wide: rounded, Forest Green background, white text
- Dashboard hero: use new mountain image, add saffron-to-transparent gradient at top and green-to-transparent gradient at bottom
- Splash screen: use new mountain image, apply saffron gradient overlay at top and green gradient at bottom
- Dashboard footer: add "Discover Hidden Stays in India" tagline

### Remove
- Purple/violet hue-based color tokens from CSS variables

## Implementation Plan
1. Update `index.css` OKLCH tokens for primary (Forest Green), accent (Saffron), and keep background white
2. Update Dashboard.tsx: swap mountain image to new one, add Indian flag gradient overlay (saffron top + green bottom), update footer with India tagline, update button colors
3. Update SplashScreen.tsx: swap mountain image, add saffron/green gradient overlays
4. Audit other pages (login, search, results, details, etc.) to apply green buttons and saffron accents consistently
