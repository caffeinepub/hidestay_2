# HIDESTAY

## Current State
- Bottom nav with 5 tabs: Home, Hotel Admin, Super Admin, Profile, Help
- HotelAdmin page: password-only login (hardcoded "hotel123")
- SuperAdmin page: password-only login (hardcoded "admin123")
- ProfilePage: static guest profile, no login
- Booking system works, saves to backend
- No shared auth context across the app

## Requested Changes (Diff)

### Add
- AuthContext (React context) managing login state for three roles: customer, hotel_owner, super_admin
- CustomerLogin page: email/phone + password fields, self-register flow (any credentials accepted for demo), navigates to Profile/dashboard after login
- HotelOwnerLogin page: email/phone + password fields, hardcoded credential (owner@hidestay.com / hotel123), navigates to Hotel Admin dashboard
- SuperAdminLogin page: email/phone + password fields, hardcoded credential (admin@hidestay.com / admin123), navigates to Super Admin panel
- Route "/login/customer", "/login/hotel-owner", "/login/super-admin"
- Logout button in HotelAdmin, SuperAdmin, and Profile headers

### Modify
- HotelAdmin: Remove password-only gate; redirect to /login/hotel-owner if not authenticated as hotel_owner via AuthContext
- SuperAdmin: Remove password-only gate; redirect to /login/super-admin if not authenticated as super_admin via AuthContext
- ProfilePage: Show login prompt / redirect to /login/customer if not authenticated as customer; show real user name/email after login
- BottomNav: No visual change needed; auth redirects handled at page level
- App.tsx: Wrap app in AuthProvider, add three login routes

### Remove
- Password-only input fields in HotelAdmin and SuperAdmin

## Implementation Plan
1. Create AuthContext.tsx with login/logout functions and role-based state
2. Create CustomerLogin.tsx page (email/phone + password, any credentials accepted)
3. Create HotelOwnerLogin.tsx page (email/phone + password, validates against hardcoded owner credentials)
4. Create SuperAdminLogin.tsx page (email/phone + password, validates against hardcoded admin credentials)
5. Update HotelAdmin.tsx to use AuthContext, redirect to login if not authed
6. Update SuperAdmin.tsx to use AuthContext, redirect to login if not authed
7. Update ProfilePage.tsx to use AuthContext, show login prompt if not authed
8. Update App.tsx to add AuthProvider and new login routes
