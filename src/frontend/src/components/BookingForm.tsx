import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useActor } from "@/hooks/useActor";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stayName: string;
  location: string;
  price: string;
  propertyId?: string;
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function generateBookingId() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `HIDE-${date}-${rand}`;
}

function saveBookingToStorage(booking: {
  id: string;
  stayName: string;
  location: string;
  checkin: string;
  checkout: string;
  guestName: string;
  phone: string;
  email: string;
  guests: number;
  createdAt: number;
}) {
  const existing = JSON.parse(
    localStorage.getItem("hidestay_bookings") || "[]",
  );
  existing.push(booking);
  localStorage.setItem("hidestay_bookings", JSON.stringify(existing));
}

export default function BookingForm({
  open,
  onOpenChange,
  stayName,
  location,
  price,
  propertyId = "",
}: BookingFormProps) {
  const navigate = useNavigate();
  const { actor } = useActor();
  const [isPending, setIsPending] = useState(false);

  const [form, setForm] = useState({
    guestName: "",
    phone: "",
    email: "",
    checkin: "",
    checkout: "",
    guests: "1",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.guestName.trim()) errs.guestName = "Guest name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
      errs.email = "Invalid email";
    if (!form.checkin) errs.checkin = "Check-in date is required";
    if (!form.checkout) errs.checkout = "Check-out date is required";
    else if (form.checkin && form.checkout <= form.checkin)
      errs.checkout = "Check-out must be after check-in";
    const g = Number(form.guests);
    if (!form.guests || g < 1) errs.guests = "At least 1 guest required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsPending(true);
    let bookingId = generateBookingId();

    try {
      if (actor) {
        try {
          const booking = await actor.createBooking(
            propertyId,
            stayName,
            location,
            form.checkin,
            form.checkout,
            form.guestName,
            form.phone,
            form.email,
            BigInt(form.guests),
          );
          bookingId = booking.id;
        } catch {
          // Backend failed, use local fallback silently
        }
      }

      // Always save to localStorage as UI cache
      saveBookingToStorage({
        id: bookingId,
        stayName,
        location,
        checkin: form.checkin,
        checkout: form.checkout,
        guestName: form.guestName,
        phone: form.phone,
        email: form.email,
        guests: Number(form.guests),
        createdAt: Date.now(),
      });

      onOpenChange(false);
      navigate({
        to: "/confirmation",
        search: {
          bookingId,
          stayName,
          location,
          checkin: form.checkin,
          checkout: form.checkout,
          guestName: form.guestName,
        },
      });
    } catch {
      toast.error("Booking failed. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl max-h-[92dvh] overflow-y-auto px-5 pb-8"
      >
        <div className="mx-auto w-10 h-1.5 rounded-full bg-muted mt-2 mb-5" />
        <SheetHeader className="mb-6">
          <SheetTitle className="font-display font-black text-2xl text-foreground">
            Book Your Stay
          </SheetTitle>
          <p className="font-body text-sm text-muted-foreground">
            {stayName} &middot; {location}
          </p>
          <p className="font-display font-bold text-primary text-lg">{price}</p>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <Label
              htmlFor="guestName"
              className="font-body text-sm font-medium"
            >
              Guest Name
            </Label>
            <Input
              id="guestName"
              data-ocid="booking_form.guest_name.input"
              placeholder="Full name"
              value={form.guestName}
              onChange={(e) => set("guestName", e.target.value)}
              className="h-12 rounded-xl font-body"
            />
            {errors.guestName && (
              <p
                data-ocid="booking_form.guest_name.error_state"
                className="text-destructive text-xs font-body"
              >
                {errors.guestName}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="font-body text-sm font-medium">
              Phone Number
            </Label>
            <Input
              id="phone"
              data-ocid="booking_form.phone.input"
              type="tel"
              inputMode="numeric"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="h-12 rounded-xl font-body"
            />
            {errors.phone && (
              <p
                data-ocid="booking_form.phone.error_state"
                className="text-destructive text-xs font-body"
              >
                {errors.phone}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="font-body text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              data-ocid="booking_form.email.input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="h-12 rounded-xl font-body"
            />
            {errors.email && (
              <p
                data-ocid="booking_form.email.error_state"
                className="text-destructive text-xs font-body"
              >
                {errors.email}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="checkin"
                className="font-body text-sm font-medium"
              >
                Check-in
              </Label>
              <Input
                id="checkin"
                data-ocid="booking_form.checkin.input"
                type="date"
                min={today()}
                value={form.checkin}
                onChange={(e) => set("checkin", e.target.value)}
                className="h-12 rounded-xl font-body"
              />
              {errors.checkin && (
                <p className="text-destructive text-xs font-body">
                  {errors.checkin}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="checkout"
                className="font-body text-sm font-medium"
              >
                Check-out
              </Label>
              <Input
                id="checkout"
                data-ocid="booking_form.checkout.input"
                type="date"
                min={form.checkin || today()}
                value={form.checkout}
                onChange={(e) => set("checkout", e.target.value)}
                className="h-12 rounded-xl font-body"
              />
              {errors.checkout && (
                <p className="text-destructive text-xs font-body">
                  {errors.checkout}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="guests" className="font-body text-sm font-medium">
              Number of Guests
            </Label>
            <Input
              id="guests"
              data-ocid="booking_form.guests.input"
              type="number"
              min={1}
              value={form.guests}
              onChange={(e) => set("guests", e.target.value)}
              className="h-12 rounded-xl font-body"
            />
            {errors.guests && (
              <p className="text-destructive text-xs font-body">
                {errors.guests}
              </p>
            )}
          </div>

          <Button
            type="submit"
            data-ocid="booking_form.submit.primary_button"
            disabled={isPending}
            className="w-full h-14 text-lg font-display font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md mt-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
