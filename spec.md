# HIDESTAY

## Current State
The app has: SplashScreen, Dashboard, StaySearch, StayResults, StayDetails, BookingConfirmation pages. No bottom navigation exists. Each page has its own header and footer.

## Requested Changes (Diff)

### Add
- `BottomNav` component: persistent bottom navigation bar with 5 tabs (Home, Hotel Admin, Super Admin, Profile, Help & Support), visible on all main pages (Dashboard, StaySearch, StayResults, StayDetails, BookingConfirmation)
- `/hotel-admin` route: Hotel Admin dashboard with simple password gate ("hotel123"), showing property management UI with mock properties list
- `/super-admin` route: Super Admin control panel with simple password gate ("admin123"), showing platform stats and booking overview
- `/profile` route: Customer profile page with booking history lookup by Booking ID
- `/help` route: Help & Support page with contact details, company info, FAQs, support options

### Modify
- `App.tsx`: Add new routes for hotel-admin, super-admin, profile, help. Wrap main pages in a layout that shows BottomNav.
- All main pages (Dashboard, StaySearch, StayResults, StayDetails, BookingConfirmation): Add `pb-20` bottom padding to prevent content hiding behind BottomNav. Remove individual footers if redundant.
- SplashScreen: No bottom nav (splash is transitional).

### Remove
- Nothing removed, footers can remain or be replaced by bottom nav as appropriate.

## Implementation Plan
1. Create `BottomNav` component with 5 tabs using lucide icons, active state based on current route, fixed to bottom.
2. Create layout wrapper `MainLayout` that renders `<Outlet />` + `<BottomNav />`.
3. Create `HotelAdminPage` with password gate ("hotel123"), property list with add/edit/remove mock actions.
4. Create `SuperAdminPage` with password gate ("admin123"), platform stats cards, recent bookings table.
5. Create `ProfilePage` with booking lookup by ID form + static profile section.
6. Create `HelpSupportPage` with contact info, company info, FAQ accordion, support options.
7. Update `App.tsx` to use `MainLayout` for main routes, add new routes.
8. Adjust padding on all main pages so content doesn't hide behind bottom nav.
