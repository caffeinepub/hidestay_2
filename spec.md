# HIDESTAY

## Current State
- Hotel Owner registration: saved in ICP backend (Motoko canister) -- permanent
- Customer registration: saved in localStorage only -- resets when code changes
- Bookings: saved in both backend and localStorage but backend Booking type has no status or propertyId
- Properties: saved in backend -- permanent
- All other data (platform settings, activity log, featured hotels, reviews, virtual tours) stored in localStorage

## Requested Changes (Diff)

### Add
- Backend: `Customer` type with registerCustomer, loginCustomer, getCustomerByEmail, updateCustomerPassword functions
- Backend: `BookingStatus` field on Booking type (pending/confirmed/cancelled/completed)
- Backend: `propertyId` field on Booking type
- Backend: `getBookingsByEmail` query to fetch all bookings for a customer
- Backend: `updateBookingStatus` function for Super Admin actions
- Frontend: AuthContext updated to register/login customers via backend canister
- Frontend: BookingForm updated to always save booking to backend with propertyId and status
- Frontend: ProfilePage updated to load bookings from backend by customer email

### Modify
- Backend: Booking type extended with status (Text) and propertyId (Text) fields
- Frontend: AuthContext loginCustomer and registerCustomer to call backend first, with localStorage as session cache only
- Frontend: BookingForm to pass propertyId when creating booking

### Remove
- Frontend: localStorage as primary data store for customer accounts (keep only as session cache)
- Frontend: hidestay_customers localStorage key as source of truth

## Implementation Plan
1. Regenerate Motoko backend with Customer type (registerCustomer, loginCustomer, getCustomerByEmail, updateCustomerPassword, disableCustomer, enableCustomer, deleteCustomer) and updated Booking type with status + propertyId + getBookingsByEmail + updateBookingStatus
2. Update AuthContext: registerCustomer calls backend canister, loginCustomer calls backend canister with localStorage session cache fallback
3. Update BookingForm: always calls backend createBooking with status and propertyId, localStorage saved only as UI cache
4. Update ProfilePage: loads bookings from backend via getBookingsByEmail
5. Update SuperAdmin booking management to use updateBookingStatus on backend
