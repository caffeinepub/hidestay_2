# HIDESTAY

## Current State
- Splash screen auto-transitions to Dashboard after 3 seconds.
- Dashboard shows four category cards (Hotels, Resorts, Homestays, Guest Houses). Clicking any navigates to `/search?category=...`.
- StaySearch page (`/search`) combines a search filter bar AND property results grid on the same page. Guests/Rooms is not yet a field.
- App.tsx routes: `/` (Splash), `/dashboard`, `/search`.

## Requested Changes (Diff)

### Add
- New **StayResults** page at route `/results` that shows the property listings grid. Accepts query params: `category`, `destination`, `checkin`, `checkout`, `adults`, `children`, `rooms`.
- **Guests & Rooms dropdown** on the search page: a popover/dropdown selector with three counters: Adults, Children, Number of Rooms (each with +/- buttons). Displays a summary string like "2 Adults · 1 Child · 1 Room".

### Modify
- **StaySearch page** (`/search`) becomes a dedicated full-screen search form (no results grid). Fields: Destination/City (text input), Check-in date, Check-out date, Guests & Rooms dropdown. Large green "Search Stays" button that navigates to `/results` with all query params.
- **App.tsx** — add `/results` route for StayResults page.

### Remove
- Property listing grid and mock data from StaySearch page (move to StayResults).

## Implementation Plan
1. Create `StayResults.tsx`: receives search params, displays filtered property cards grid with Back button to search, same visual style as current property grid.
2. Update `StaySearch.tsx`: replace existing layout with a clean full-screen form — hero banner with category name, form card with Destination, Check-in, Check-out, Guests & Rooms dropdown, and large "Search Stays" CTA.
3. Implement Guests & Rooms as a Popover with +/- counters for Adults (min 1), Children (min 0), Rooms (min 1).
4. Update `App.tsx` to register `/results` route.
