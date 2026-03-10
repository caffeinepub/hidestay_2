import type { Property } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AdminAccount } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Download,
  IndianRupee,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Phone,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type BookingStatus = "Confirmed" | "Pending" | "Cancelled" | "Completed";

interface AdminBooking {
  id: string;
  guest: string;
  guestPhone: string;
  guestEmail: string;
  stay: string;
  stayLocation: string;
  checkIn: string;
  checkOut: string;
  bookingDate: string;
  guests: number;
  amount: string;
  status: BookingStatus;
  paymentType: string;
}

const MOCK_BOOKINGS: AdminBooking[] = [
  {
    id: "HIDE-20260301-1421",
    guest: "Priya Sharma",
    guestPhone: "+91 98765 43210",
    guestEmail: "priya.sharma@email.com",
    stay: "Mountain Dew Resort",
    stayLocation: "Mussoorie, Uttarakhand",
    checkIn: "2026-03-05",
    checkOut: "2026-03-08",
    bookingDate: "2026-03-01",
    guests: 2,
    amount: "₹13,500",
    status: "Confirmed",
    paymentType: "Pay at Hotel",
  },
  {
    id: "HIDE-20260303-2834",
    guest: "Rahul Verma",
    guestPhone: "+91 91234 56789",
    guestEmail: "rahul.verma@email.com",
    stay: "Green Valley Homestay",
    stayLocation: "Rishikesh, Uttarakhand",
    checkIn: "2026-03-10",
    checkOut: "2026-03-13",
    bookingDate: "2026-03-03",
    guests: 3,
    amount: "₹3,600",
    status: "Confirmed",
    paymentType: "Pay at Hotel",
  },
  {
    id: "HIDE-20260305-3910",
    guest: "Anjali Patel",
    guestPhone: "+91 87654 32109",
    guestEmail: "anjali.patel@email.com",
    stay: "City Hub Hotel",
    stayLocation: "Dehradun, Uttarakhand",
    checkIn: "2026-03-15",
    checkOut: "2026-03-18",
    bookingDate: "2026-03-05",
    guests: 1,
    amount: "₹9,600",
    status: "Pending",
    paymentType: "Pay at Hotel",
  },
  {
    id: "HIDE-20260307-4512",
    guest: "Vikram Singh",
    guestPhone: "+91 99887 76655",
    guestEmail: "vikram.singh@email.com",
    stay: "Azure Bay Resort",
    stayLocation: "Nainital, Uttarakhand",
    checkIn: "2026-03-20",
    checkOut: "2026-03-25",
    bookingDate: "2026-03-07",
    guests: 4,
    amount: "₹63,998",
    status: "Confirmed",
    paymentType: "Pay at Hotel",
  },
  {
    id: "HIDE-20260309-5671",
    guest: "Meera Nair",
    guestPhone: "+91 76543 21098",
    guestEmail: "meera.nair@email.com",
    stay: "Grandma Rosa's Cottage",
    stayLocation: "Lansdowne, Uttarakhand",
    checkIn: "2026-03-01",
    checkOut: "2026-03-04",
    bookingDate: "2026-02-25",
    guests: 2,
    amount: "₹6,299",
    status: "Completed",
    paymentType: "Pay at Hotel",
  },
  {
    id: "HIDE-20260310-6789",
    guest: "Arjun Mehta",
    guestPhone: "+91 82345 67890",
    guestEmail: "arjun.mehta@email.com",
    stay: "Himalayan Hideaway",
    stayLocation: "Chakrata, Uttarakhand",
    checkIn: "2026-03-22",
    checkOut: "2026-03-24",
    bookingDate: "2026-03-10",
    guests: 2,
    amount: "₹8,400",
    status: "Pending",
    paymentType: "Pay at Hotel",
  },
];

const STATS = [
  {
    label: "Total Bookings",
    value: "1,284",
    icon: TrendingUp,
    color: "text-primary",
  },
  {
    label: "Total Revenue",
    value: "₹48,36,500",
    icon: IndianRupee,
    color: "text-emerald-600",
  },
  {
    label: "Active Properties",
    value: "342",
    icon: Building2,
    color: "text-blue-600",
  },
  {
    label: "Registered Users",
    value: "8,921",
    icon: Users,
    color: "text-purple-600",
  },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <Badge className="bg-green-100 text-green-800 border border-green-200 font-body text-[11px]">
        <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge className="bg-red-100 text-red-700 border border-red-200 font-body text-[11px]">
        <XCircle className="w-3 h-3 mr-1" /> Rejected
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-800 border border-amber-200 font-body text-[11px]">
      <Clock className="w-3 h-3 mr-1" /> Pending
    </Badge>
  );
}

function PropertyDetailView({
  prop,
  onBack,
  onApprove,
  onReject,
  approving,
  rejecting,
}: {
  prop: Property;
  onBack: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  approving: boolean;
  rejecting: boolean;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const isPending = prop.status === "pending";

  return (
    <div data-ocid="super_admin.property_detail.panel" className="space-y-5">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        data-ocid="super_admin.property_detail.back.button"
        className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Property List
      </button>

      {/* Image Gallery */}
      {prop.imageUrls.length > 0 ? (
        <div className="space-y-2">
          <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden bg-muted">
            <img
              src={prop.imageUrls[activeImage]}
              alt={prop.propertyName}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3">
              <StatusBadge status={prop.status} />
            </div>
          </div>
          {prop.imageUrls.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {prop.imageUrls.map((url, i) => (
                <button
                  type="button"
                  key={url}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === i
                      ? "border-primary"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={url}
                    alt={`Gallery view ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full h-48 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Building2 className="w-16 h-16 text-primary/30" />
          <div className="absolute top-3 right-3">
            <StatusBadge status={prop.status} />
          </div>
        </div>
      )}

      {/* Property Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-display font-black text-foreground text-2xl">
            {prop.propertyName}
          </h2>
          <div className="flex items-center gap-1.5 mt-1 text-muted-foreground text-sm font-body">
            <Building2 className="w-3.5 h-3.5" />
            <span>{prop.propertyType}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display font-black text-primary text-2xl">
            ₹{Number(prop.pricePerNight).toLocaleString("en-IN")}
          </p>
          <p className="text-muted-foreground text-xs font-body">per night</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="border-border shadow-xs">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-display font-bold text-foreground text-sm">
              Property Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-body font-medium text-foreground">
                    {prop.city}
                  </p>
                  <p className="font-body text-muted-foreground text-xs">
                    {prop.address}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-body text-foreground">
                  {prop.contactPhone}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-body text-muted-foreground">
                  Owner: {prop.ownerEmail}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-display font-bold text-foreground text-sm">
              Check-in / Check-out
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <Clock className="w-4 h-4 text-green-700 mx-auto mb-1" />
                <p className="text-green-800 font-display font-bold text-sm">
                  {prop.checkinTime || "12:00 PM"}
                </p>
                <p className="text-green-700 text-[11px] font-body">Check-in</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <Clock className="w-4 h-4 text-red-600 mx-auto mb-1" />
                <p className="text-red-700 font-display font-bold text-sm">
                  {prop.checkoutTime || "11:00 AM"}
                </p>
                <p className="text-red-600 text-[11px] font-body">Check-out</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-4">
          <h3 className="font-display font-bold text-foreground text-sm mb-2">
            Property Description
          </h3>
          <p className="font-body text-muted-foreground text-sm leading-relaxed">
            {prop.description || "No description provided."}
          </p>
        </CardContent>
      </Card>

      {/* Amenities */}
      {prop.amenities.length > 0 && (
        <Card className="border-border shadow-xs">
          <CardContent className="p-4">
            <h3 className="font-display font-bold text-foreground text-sm mb-3">
              Amenities
            </h3>
            <div className="flex flex-wrap gap-2">
              {prop.amenities.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-body px-2.5 py-1 rounded-full"
                >
                  <Check className="w-3 h-3" />
                  {a}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules */}
      {prop.rules && (
        <Card className="border-border shadow-xs">
          <CardContent className="p-4">
            <h3 className="font-display font-bold text-foreground text-sm mb-2">
              Rules &amp; Regulations
            </h3>
            <p className="font-body text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
              {prop.rules}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {isPending && (
        <div className="flex gap-3 pt-2 pb-4">
          <Button
            onClick={() => onApprove(prop.id)}
            disabled={approving || rejecting}
            data-ocid="super_admin.property_detail.approve.button"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-body font-semibold h-12 rounded-xl text-sm"
          >
            {approving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Approve Property
          </Button>
          <Button
            onClick={() => onReject(prop.id)}
            disabled={approving || rejecting}
            data-ocid="super_admin.property_detail.reject.button"
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-600 hover:text-white font-body font-semibold h-12 rounded-xl text-sm"
          >
            {rejecting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            Reject Property
          </Button>
        </div>
      )}

      {!isPending && (
        <div className="py-4 text-center">
          <StatusBadge status={prop.status} />
          <p className="text-xs text-muted-foreground font-body mt-2">
            {prop.status === "approved"
              ? "This property is live and visible in public search results."
              : "This property has been rejected and is hidden from search results."}
          </p>
        </div>
      )}
    </div>
  );
}

function BookingsTab() {
  const [bookings, setBookings] = useState<AdminBooking[]>(MOCK_BOOKINGS);
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(
    null,
  );
  const [showHotelModal, setShowHotelModal] = useState(false);

  const updateStatus = (id: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b)),
    );
    if (selectedBooking?.id === id) {
      setSelectedBooking((prev) => (prev ? { ...prev, status } : null));
    }
    toast.success(
      `Booking ${status === "Cancelled" ? "cancelled" : "confirmed"} successfully`,
    );
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Pending":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "Cancelled":
        return "bg-red-100 text-red-700 border border-red-200";
      case "Completed":
        return "bg-blue-100 text-blue-800 border border-blue-200";
    }
  };

  if (selectedBooking) {
    return (
      <div data-ocid="super_admin.booking_detail.panel" className="space-y-5">
        <button
          type="button"
          onClick={() => setSelectedBooking(null)}
          data-ocid="super_admin.booking_detail.back.button"
          className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bookings
        </button>

        <div className="flex items-center justify-between">
          <h2 className="font-display font-black text-foreground text-xl">
            Booking Details
          </h2>
          <Badge
            className={`text-[11px] font-body ${getStatusColor(selectedBooking.status)}`}
          >
            {selectedBooking.status}
          </Badge>
        </div>

        <Card className="border-border shadow-xs">
          <CardContent className="p-5 space-y-5">
            {/* Booking Info */}
            <div>
              <h3 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-primary" /> Booking
                Information
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground font-body">
                    Booking ID
                  </p>
                  <p className="font-mono text-sm text-primary font-semibold">
                    {selectedBooking.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">
                    Booking Date
                  </p>
                  <p className="font-body text-sm text-foreground">
                    {selectedBooking.bookingDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">
                    Payment Type
                  </p>
                  <p className="font-body text-sm text-foreground font-medium">
                    {selectedBooking.paymentType}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">
                    Check-in
                  </p>
                  <p className="font-body text-sm text-foreground">
                    {selectedBooking.checkIn}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">
                    Check-out
                  </p>
                  <p className="font-body text-sm text-foreground">
                    {selectedBooking.checkOut}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">
                    Guests
                  </p>
                  <p className="font-body text-sm text-foreground">
                    {selectedBooking.guests} guest
                    {selectedBooking.guests > 1 ? "s" : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">
                    Total Amount
                  </p>
                  <p className="font-body text-sm text-foreground font-semibold text-primary">
                    {selectedBooking.amount}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Guest Info */}
            <div>
              <h3 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Guest Details
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground font-body">
                    Customer Name
                  </p>
                  <p className="font-body text-sm text-foreground font-medium">
                    {selectedBooking.guest}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">
                    Phone Number
                  </p>
                  <p className="font-body text-sm text-foreground">
                    {selectedBooking.guestPhone}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">
                    Email Address
                  </p>
                  <p className="font-body text-sm text-foreground">
                    {selectedBooking.guestEmail}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Hotel Info */}
            <div>
              <h3 className="font-display font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> Hotel Details
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground font-body">
                    Hotel Name
                  </p>
                  <p className="font-body text-sm text-foreground font-medium">
                    {selectedBooking.stay}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">
                    Location
                  </p>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="font-body text-sm text-foreground">
                      {selectedBooking.stayLocation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-3 pb-4">
          {selectedBooking.status !== "Cancelled" && (
            <Button
              variant="destructive"
              className="w-full font-body"
              data-ocid="super_admin.booking_detail.cancel.button"
              onClick={() => updateStatus(selectedBooking.id, "Cancelled")}
            >
              <X className="w-4 h-4 mr-2" /> Cancel Booking
            </Button>
          )}
          {(selectedBooking.status === "Pending" ||
            selectedBooking.status === "Cancelled") && (
            <Button
              className="w-full bg-primary text-primary-foreground font-body hover:bg-primary/90"
              data-ocid="super_admin.booking_detail.confirm.button"
              onClick={() => updateStatus(selectedBooking.id, "Confirmed")}
            >
              <Check className="w-4 h-4 mr-2" /> Mark as Confirmed
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full font-body border-primary text-primary"
            data-ocid="super_admin.booking_detail.view_hotel.button"
            onClick={() => setShowHotelModal(true)}
          >
            <Building2 className="w-4 h-4 mr-2" /> View Hotel Details
          </Button>
        </div>

        {/* Hotel Details Modal */}
        {showHotelModal && (
          <div
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
            data-ocid="super_admin.hotel_modal.dialog"
          >
            <Card className="w-full max-w-md border-border shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-lg">
                    {selectedBooking.stay}
                  </CardTitle>
                  <button
                    type="button"
                    onClick={() => setShowHotelModal(false)}
                    data-ocid="super_admin.hotel_modal.close.button"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-5">
                <div className="flex items-center gap-2 text-sm font-body text-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{selectedBooking.stayLocation}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span>Luxury Stay Property</span>
                </div>
                <p className="text-xs font-body text-muted-foreground pt-1">
                  To view full property details and manage approval status,
                  visit the Property Approvals tab.
                </p>
                <Button
                  variant="outline"
                  className="w-full font-body mt-2"
                  data-ocid="super_admin.hotel_modal.close_secondary.button"
                  onClick={() => setShowHotelModal(false)}
                >
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div data-ocid="super_admin.bookings.panel" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-foreground text-lg">
          All Bookings
        </h2>
        <Badge variant="outline" className="font-body text-xs">
          {bookings.length} total
        </Badge>
      </div>
      <Card className="border-border shadow-xs">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table data-ocid="super_admin.bookings.table">
              <TableHeader>
                <TableRow>
                  <TableHead className="font-body text-xs">
                    Booking ID
                  </TableHead>
                  <TableHead className="font-body text-xs">Customer</TableHead>
                  <TableHead className="font-body text-xs">Hotel</TableHead>
                  <TableHead className="font-body text-xs">Check-in</TableHead>
                  <TableHead className="font-body text-xs">Check-out</TableHead>
                  <TableHead className="font-body text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking, i) => (
                  <TableRow
                    key={booking.id}
                    data-ocid={`super_admin.bookings.row.${i + 1}`}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <TableCell className="font-mono text-xs text-primary">
                      {booking.id}
                    </TableCell>
                    <TableCell className="font-body text-sm">
                      {booking.guest}
                    </TableCell>
                    <TableCell className="font-body text-sm">
                      {booking.stay}
                    </TableCell>
                    <TableCell className="font-body text-xs text-muted-foreground">
                      {booking.checkIn}
                    </TableCell>
                    <TableCell className="font-body text-xs text-muted-foreground">
                      {booking.checkOut}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] font-body ${getStatusColor(booking.status)}`}
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground font-body text-center">
        Click any booking row to view details and manage status
      </p>
    </div>
  );
}

function PropertyApprovalsTab() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());

  const { data: pendingProperties = [], isLoading: pendingLoading } = useQuery<
    Property[]
  >({
    queryKey: ["pendingProperties"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPendingProperties();
    },
    enabled: !!actor,
  });

  const { data: approvedProperties = [], isLoading: approvedLoading } =
    useQuery<Property[]>({
      queryKey: ["approvedProperties"],
      queryFn: async () => {
        if (!actor) return [];
        return actor.getAllApprovedProperties();
      },
      enabled: !!actor,
    });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.approveProperty(id);
    },
    onSuccess: (_, id) => {
      toast.success("Property approved! It is now visible in search results.");
      queryClient.invalidateQueries({ queryKey: ["pendingProperties"] });
      queryClient.invalidateQueries({ queryKey: ["approvedProperties"] });
      // Update selected property status in view
      if (selectedProperty?.id === id) {
        setSelectedProperty({ ...selectedProperty, status: "approved" });
      }
    },
    onError: () => toast.error("Failed to approve property."),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.rejectProperty(id);
    },
    onSuccess: (_, id) => {
      toast.success("Property rejected.");
      setRejectedIds((prev) => new Set([...prev, id]));
      queryClient.invalidateQueries({ queryKey: ["pendingProperties"] });
      if (selectedProperty?.id === id) {
        setSelectedProperty({ ...selectedProperty, status: "rejected" });
      }
    },
    onError: () => toast.error("Failed to reject property."),
  });

  const isLoading = pendingLoading || approvedLoading;

  // Combine: pending (with rejected tracked locally) + approved
  const allProperties: Property[] = [
    ...pendingProperties.map((p) =>
      rejectedIds.has(p.id) ? { ...p, status: "rejected" } : p,
    ),
    ...approvedProperties,
  ];

  const pendingCount = pendingProperties.filter(
    (p) => !rejectedIds.has(p.id),
  ).length;

  if (selectedProperty) {
    return (
      <PropertyDetailView
        prop={selectedProperty}
        onBack={() => setSelectedProperty(null)}
        onApprove={(id) => approveMutation.mutate(id)}
        onReject={(id) => rejectMutation.mutate(id)}
        approving={
          approveMutation.isPending &&
          approveMutation.variables === selectedProperty.id
        }
        rejecting={
          rejectMutation.isPending &&
          rejectMutation.variables === selectedProperty.id
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-display font-bold text-foreground text-lg">
            Property Approvals
          </h2>
          <p className="text-muted-foreground text-sm font-body">
            Review and manage submitted properties.
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-amber-100 text-amber-800 border border-amber-200 font-body text-xs px-3 py-1">
            {pendingCount} Pending Review
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div
          data-ocid="super_admin.approvals.loading_state"
          className="flex items-center justify-center py-12"
        >
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : allProperties.length === 0 ? (
        <div
          data-ocid="super_admin.approvals.empty_state"
          className="text-center py-12 text-muted-foreground font-body"
        >
          <Check className="w-10 h-10 mx-auto mb-3 text-green-500" />
          <p className="font-display font-bold text-foreground">
            All caught up!
          </p>
          <p className="text-sm mt-1">No properties submitted yet.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block">
            <Card className="border-border shadow-xs overflow-hidden">
              <Table data-ocid="super_admin.approvals.table">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-body text-xs font-semibold">
                      Property Name
                    </TableHead>
                    <TableHead className="font-body text-xs font-semibold">
                      Owner
                    </TableHead>
                    <TableHead className="font-body text-xs font-semibold">
                      Location
                    </TableHead>
                    <TableHead className="font-body text-xs font-semibold">
                      Price / Night
                    </TableHead>
                    <TableHead className="font-body text-xs font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="font-body text-xs font-semibold">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allProperties.map((prop, i) => (
                    <TableRow
                      key={prop.id}
                      data-ocid={`super_admin.approvals.row.${i + 1}`}
                      className="cursor-pointer hover:bg-primary/5 transition-colors"
                      onClick={() => setSelectedProperty(prop)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {prop.imageUrls.length > 0 ? (
                            <img
                              src={prop.imageUrls[0]}
                              alt={prop.propertyName}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          <div>
                            <p className="font-body font-semibold text-foreground text-sm">
                              {prop.propertyName}
                            </p>
                            <p className="text-muted-foreground text-[11px] font-body">
                              {prop.propertyType}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-body text-sm text-muted-foreground max-w-[120px] truncate">
                        {prop.ownerEmail}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm font-body text-foreground">
                          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          {prop.city}
                        </div>
                      </TableCell>
                      <TableCell className="font-body font-semibold text-primary text-sm">
                        ₹{Number(prop.pricePerNight).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={prop.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProperty(prop);
                          }}
                          data-ocid={`super_admin.approvals.review.button.${i + 1}`}
                          className="font-body text-xs h-7 px-3"
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {allProperties.map((prop, i) => (
              <Card
                key={prop.id}
                data-ocid={`super_admin.approvals.item.${i + 1}`}
                className="border-border shadow-xs cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => setSelectedProperty(prop)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {prop.imageUrls.length > 0 ? (
                      <img
                        src={prop.imageUrls[0]}
                        alt={prop.propertyName}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-7 h-7 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-display font-bold text-foreground text-sm truncate">
                            {prop.propertyName}
                          </p>
                          <p className="text-muted-foreground text-xs font-body">
                            {prop.propertyType}
                          </p>
                        </div>
                        <StatusBadge status={prop.status} />
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground font-body">
                        <MapPin className="w-3 h-3" />
                        {prop.city}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-primary font-semibold text-sm font-body">
                          ₹{Number(prop.pricePerNight).toLocaleString("en-IN")}
                          /night
                        </span>
                        <span className="text-xs text-primary font-body underline">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const ROOT_ADMIN: AdminAccount & { isRoot: true } = {
  name: "Super Admin",
  email: "hidestayindiapvtltd@gmail.com",
  phone: "9999000001",
  password: "",
  isRoot: true,
};

function AdminAccountsTab() {
  const { registerAdminAccount, getAdminAccounts } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [, setTick] = useState(0);

  const admins = getAdminAccounts();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    const ok = await registerAdminAccount(
      name.trim(),
      email.trim(),
      phone.trim(),
      password,
    );
    setSubmitting(false);
    if (ok) {
      toast.success("Admin account created.");
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setShowForm(false);
      setTick((t) => t + 1);
    } else {
      toast.error("An account with this email or phone already exists.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-foreground text-lg">
            Admin Accounts
          </h2>
          <p className="text-muted-foreground text-sm font-body">
            Manage who can access the Super Admin panel.
          </p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          data-ocid="super_admin.create_admin.open_modal_button"
          className="bg-primary text-primary-foreground font-body font-semibold flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          {showForm ? "Cancel" : "Create New Admin"}
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-5">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="admin-name"
                    className="font-body text-sm font-medium"
                  >
                    Name
                  </Label>
                  <Input
                    id="admin-name"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-ocid="super_admin.create_admin.input"
                    className="font-body"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="admin-email"
                    className="font-body text-sm font-medium"
                  >
                    Email
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-ocid="super_admin.create_admin.email.input"
                    className="font-body"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="admin-phone"
                    className="font-body text-sm font-medium"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="admin-phone"
                    placeholder="+91 XXXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-ocid="super_admin.create_admin.phone.input"
                    className="font-body"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="admin-password"
                    className="font-body text-sm font-medium"
                  >
                    Password
                  </Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-ocid="super_admin.create_admin.password.input"
                    className="font-body"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  data-ocid="super_admin.create_admin.cancel_button"
                  className="font-body"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  data-ocid="super_admin.create_admin.submit_button"
                  className="bg-primary text-primary-foreground font-body font-semibold"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  Create Account
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <Card
          data-ocid="super_admin.admins.item.1"
          className="border-border shadow-xs"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold text-foreground">
                      {ROOT_ADMIN.name}
                    </p>
                    <Badge className="bg-primary text-primary-foreground text-[10px] font-body px-2">
                      Root Admin
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs font-body">
                    {ROOT_ADMIN.email}
                  </p>
                  <p className="text-muted-foreground text-xs font-body">
                    {ROOT_ADMIN.phone}
                  </p>
                </div>
              </div>
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {admins.length === 0 ? (
          <div
            data-ocid="super_admin.admins.empty_state"
            className="text-center py-8 text-muted-foreground font-body"
          >
            <Users className="w-10 h-10 mx-auto mb-3 text-primary/30" />
            <p className="text-sm">
              No additional admin accounts yet. Create one above.
            </p>
          </div>
        ) : (
          admins.map((admin, i) => (
            <Card
              key={admin.email}
              data-ocid={`super_admin.admins.item.${i + 2}`}
              className="border-border shadow-xs"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-display font-bold text-foreground">
                          {admin.name}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-body px-2 border-primary/30 text-primary"
                        >
                          Admin
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs font-body">
                        {admin.email}
                      </p>
                      <p className="text-muted-foreground text-xs font-body">
                        {admin.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default function SuperAdmin() {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/dashboard" });
  };

  if (role !== "super_admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 pb-24">
        <Card className="w-full max-w-sm shadow-green border-border text-center">
          <CardHeader>
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
            <CardTitle className="font-display text-xl text-foreground">
              Super Admin Access Required
            </CardTitle>
            <p className="text-muted-foreground text-sm font-body mt-1">
              Restricted area. Authorised personnel only.
            </p>
          </CardHeader>
          <CardContent>
            <Button
              data-ocid="super_admin.login.button"
              className="w-full bg-primary text-primary-foreground font-body font-semibold"
              onClick={() => navigate({ to: "/login/super-admin" })}
            >
              Login as Super Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      data-ocid="super_admin.page"
      className="min-h-screen bg-background pb-24"
    >
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-foreground text-xl">
              Super Admin Panel
            </h1>
            <p className="text-muted-foreground text-sm font-body">
              Welcome, {user?.name || "Admin"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              data-ocid="super_admin.export.button"
              className="font-body text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export Report
            </Button>
            <Button
              size="sm"
              variant="outline"
              data-ocid="super_admin.logout.button"
              className="font-body text-xs flex items-center gap-1.5"
              onClick={handleLogout}
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                data-ocid="super_admin.stats.card"
                className="border-border shadow-xs"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="text-muted-foreground text-xs font-body">
                      {stat.label}
                    </span>
                  </div>
                  <p className="font-display font-black text-foreground text-2xl">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="bookings" data-ocid="super_admin.tabs">
          <TabsList className="mb-6 font-body flex-wrap h-auto">
            <TabsTrigger value="bookings" data-ocid="super_admin.bookings.tab">
              Bookings
            </TabsTrigger>
            <TabsTrigger
              value="approvals"
              data-ocid="super_admin.approvals.tab"
            >
              Property Approvals
            </TabsTrigger>
            <TabsTrigger value="admins" data-ocid="super_admin.admins.tab">
              Admin Accounts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <BookingsTab />
          </TabsContent>

          <TabsContent value="approvals">
            <PropertyApprovalsTab />
          </TabsContent>

          <TabsContent value="admins">
            <AdminAccountsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
