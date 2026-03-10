# HIDESTAY

## Current State
- Super Admin login page has a single form: email/phone + password, hardcoded root credentials (`admin@hidestay.com / admin123`).
- Super Admin dashboard has Bookings, Property Approvals, and Approved Properties tabs.
- No way to create additional admin accounts.
- No forgot/reset password flow.

## Requested Changes (Diff)

### Add
- **Forgot Password flow** on login page: a link below the login form reveals a two-step panel — first verify identity (email or phone must match a stored admin account), then set a new password.
- **Admin Accounts tab** inside the Super Admin dashboard (logged-in admins only): displays all admin accounts and includes a "Create Admin Account" form with Name, Email, Phone, Password fields.
- `registerAdminAccount` and `resetAdminPassword` functions in AuthContext.
- Admin accounts stored in localStorage (`hidestay_admins`); root admin is always valid but its password can be reset.

### Modify
- `loginSuperAdmin` in AuthContext to check both root admin and stored admin accounts.
- `SuperAdminLogin` page to support three views: `login`, `forgot`, `reset`.
- `SuperAdmin` dashboard to include a new "Admin Accounts" tab.

### Remove
- Nothing removed.

## Implementation Plan
1. Update `AuthContext.tsx`: add admin accounts storage, update `loginSuperAdmin`, add `registerAdminAccount` and `resetAdminPassword`.
2. Update `SuperAdminLogin.tsx`: add Forgot Password link, forgot/reset views.
3. Update `SuperAdmin.tsx`: add Admin Accounts tab with list and create form.
