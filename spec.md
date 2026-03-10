# HIDESTAY

## Current State
The app has a splash screen, dashboard, stay search, results, and details pages. The StayDetails page has a "Book Now" button that currently shows a toast message. The backend handles category management only.

## Requested Changes (Diff)

### Add
- Backend: Booking type with fields (id, stayName, location, checkin, checkout, guestName, phone, email, guests, createdAt). Functions: createBooking, getBooking, getAllBookings.
- BookingForm: Modal/sheet that opens when "Book Now" is tapped. Fields: Guest Name, Phone Number, Email, Check-in Date, Check-out Date, Number of Guests. Date validation: no past dates, checkout must be after checkin.
- BookingConfirmation page (/confirmation route): Shows Booking ID, stay name, location, check-in, check-out, guest name, and "Booking Confirmed – Pay at Hotel" message.
- Booking ID format: HIDE-YYYYMMDD-XXXX (date + 4-digit random number).

### Modify
- StayDetails.tsx: "Book Now" button opens a booking form sheet instead of a toast.
- App.tsx: Add /confirmation route.

### Remove
- Nothing removed.

## Implementation Plan
1. Regenerate backend with booking data model and CRUD functions.
2. Update StayDetails.tsx to open a BookingForm sheet on "Book Now".
3. Create BookingForm component with validation.
4. Create BookingConfirmation page.
5. Wire navigation from form submission to confirmation page.
6. Update App.tsx with new route.
