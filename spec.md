# HIDESTAY

## Current State
New project -- no existing code.

## Requested Changes (Diff)

### Add
- Splash screen shown on app load with centered HIDESTAY text logo, tagline "Discover Hidden Stays", and mountain background image
- Auto-navigation from splash to main dashboard after 3 seconds
- Main dashboard showing four stay category cards: Hotels, Resorts, Homestays, Guest Houses
- Green and white color theme throughout

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: minimal canister (no complex data needed for MVP)
2. Frontend:
   - SplashScreen component: full-screen mountain background, HIDESTAY text logo centered, tagline, 3-second timer then navigate to /dashboard
   - Dashboard component: 4 category cards (Hotels, Resorts, Homestays, Guest Houses) with icons/illustrations
   - React Router for navigation between splash and dashboard
   - Green/white color palette applied via Tailwind
