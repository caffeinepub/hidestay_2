# HIDESTAY

## Current State
App has SplashScreen, Dashboard, StaySearch, and StayResults pages. The StayResults page shows property cards with a "View Details" button that currently shows a toast saying "Coming soon!". All prices are in INR (₹).

## Requested Changes (Diff)

### Add
- New `StayDetails` page at route `/details?id=<seed>&category=<category>`
- Image gallery with multiple photos (carousel/grid)
- Stay name, star rating display
- Location with embedded map (iframe OpenStreetMap)
- Price per night in ₹
- Stay description (paragraph)
- Amenities list: WiFi, Parking, AC, Restaurant, Pool, Gym, Spa, Laundry
- Rules & Regulations section
- Check-in time and Check-out time
- Large "Book Now" CTA button at the bottom

### Modify
- `StayResults.tsx`: "View Details" button navigates to `/details` route instead of showing toast
- `App.tsx`: Register `/details` route with StayDetails component

### Remove
- Toast "Coming soon!" behavior on View Details button

## Implementation Plan
1. Create `src/frontend/src/pages/StayDetails.tsx` with all required sections
2. Add mock detail data (description, amenities, rules, check-in/out, multiple image seeds) keyed by property seed
3. Register `/details` route in `App.tsx`
4. Update `StayResults.tsx` View Details button to navigate to `/details`
