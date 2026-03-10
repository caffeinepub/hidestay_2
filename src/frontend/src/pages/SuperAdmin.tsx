import type { Property } from "@/backend";
import DestinationHighlightsTab from "@/components/DestinationHighlightsTab";
import type { VirtualTour } from "@/components/VirtualTourManager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import type { AdminAccount, RegisteredCustomer } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
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
  RefreshCw,
  ScrollText,
  ShieldCheck,
  Star,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

// ── Activity Log Utility ─────────────────────────────────────────────────────
const ACTIVITY_LOG_KEY = "hidestay_activity_log";

interface ActivityLogEntry {
  id: string;
  action: string;
  category: "property" | "booking" | "user" | "featured";
  adminName: string;
  timestamp: string;
}

const SAMPLE_ACTIVITY_LOG: ActivityLogEntry[] = [
  {
    id: "log-001",
    action: "Property 'Mountain Dew Resort' approved",
    category: "property",
    adminName: "HIDESTAY Admin",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "log-002",
    action: "Property 'Lake View Guest House' marked as Featured",
    category: "featured",
    adminName: "HIDESTAY Admin",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "log-003",
    action: "Booking HIDE-20260301-1421 confirmed",
    category: "booking",
    adminName: "HIDESTAY Admin",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "log-004",
    action: "User account rahul.verma@email.com disabled",
    category: "user",
    adminName: "HIDESTAY Admin",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "log-005",
    action: "Property 'Old Heritage Inn' rejected",
    category: "property",
    adminName: "HIDESTAY Admin",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
];

function getActivityLog(): ActivityLogEntry[] {
  try {
    const stored = localStorage.getItem(ACTIVITY_LOG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ActivityLogEntry[];
      return parsed;
    }
    // Seed with sample data on first load
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(SAMPLE_ACTIVITY_LOG));
    return SAMPLE_ACTIVITY_LOG;
  } catch {
    return SAMPLE_ACTIVITY_LOG;
  }
}

function addActivityLog(
  action: string,
  category: ActivityLogEntry["category"],
) {
  const entries = getActivityLog();
  const newEntry: ActivityLogEntry = {
    id: `log-${Date.now()}`,
    action,
    category,
    adminName: "HIDESTAY Admin",
    timestamp: new Date().toISOString(),
  };
  const updated = [newEntry, ...entries].slice(0, 200); // keep max 200
  try {
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}
// ─────────────────────────────────────────────────────────────────────────────

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

const ANALYTICS_STATS = [
  {
    label: "Total Users",
    value: "8,921",
    icon: Users,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    label: "Hotel Owners",
    value: "312",
    icon: UserCheck,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Total Properties",
    value: "342",
    icon: Building2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Total Bookings",
    value: "1,284",
    icon: TrendingUp,
    color: "text-primary",
    bg: "bg-green-50",
  },
  {
    label: "Pending Approvals",
    value: "18",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const BOOKINGS_PER_DAY = [
  { day: "Mon", bookings: 42 },
  { day: "Tue", bookings: 58 },
  { day: "Wed", bookings: 35 },
  { day: "Thu", bookings: 71 },
  { day: "Fri", bookings: 89 },
  { day: "Sat", bookings: 124 },
  { day: "Sun", bookings: 96 },
];

const NEW_USERS_PER_WEEK = [
  { week: "W1 Feb", users: 184 },
  { week: "W2 Feb", users: 221 },
  { week: "W3 Feb", users: 198 },
  { week: "W4 Feb", users: 267 },
  { week: "W1 Mar", users: 312 },
  { week: "W2 Mar", users: 289 },
];

const PROPERTY_GROWTH = [
  { month: "Oct", properties: 210 },
  { month: "Nov", properties: 248 },
  { month: "Dec", properties: 271 },
  { month: "Jan", properties: 298 },
  { month: "Feb", properties: 321 },
  { month: "Mar", properties: 342 },
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
    const action =
      status === "Cancelled"
        ? `Booking ${id} cancelled`
        : `Booking ${id} confirmed`;
    addActivityLog(action, "booking");
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
      addActivityLog(`Property '${id}' approved`, "property");
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
      addActivityLog(`Property '${id}' rejected`, "property");
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

// ---- USERS TAB ----
const MOCK_OWNER_PROPERTIES: Property[] = [
  {
    id: "prop-001",
    ownerEmail: "owner@hidestay.com",
    status: "approved",
    propertyName: "The Mountain Retreat",
    propertyType: "Resort",
    imageUrls: ["/assets/generated/hero-alpine-valley.dim_1200x800.jpg"],
    checkinTime: "2:00 PM",
    checkoutTime: "11:00 AM",
    city: "Rishikesh",
    pricePerNight: BigInt(4500),
    description:
      "A serene mountain retreat nestled in the foothills of Rishikesh with breathtaking views of the Ganges.",
    amenities: ["WiFi", "Breakfast", "Parking", "River View"],
    address: "23, Tapovan Road, Rishikesh, Uttarakhand",
    rules: "No smoking. No pets. Check-in after 2 PM.",
    contactPhone: "9876540001",
  },
  {
    id: "prop-002",
    ownerEmail: "owner@hidestay.com",
    status: "pending",
    propertyName: "Himalayan Valley View",
    propertyType: "Homestay",
    imageUrls: ["/assets/generated/category-homestay.dim_800x600.jpg"],
    checkinTime: "1:00 PM",
    checkoutTime: "10:00 AM",
    city: "Mussoorie",
    pricePerNight: BigInt(2800),
    description:
      "A cosy Himalayan homestay with panoramic valley views and warm hospitality in the heart of Mussoorie.",
    amenities: ["WiFi", "Mountain View", "Fireplace", "Home-cooked Meals"],
    address: "12, Mall Road, Mussoorie, Uttarakhand",
    rules: "No loud music after 10 PM. Vegetarian meals only.",
    contactPhone: "9876540002",
  },
  {
    id: "prop-003",
    ownerEmail: "owner@hidestay.com",
    status: "rejected",
    propertyName: "Nainital Lake Cottage",
    propertyType: "Guest House",
    imageUrls: ["/assets/generated/category-guesthouse.dim_800x600.jpg"],
    checkinTime: "12:00 PM",
    checkoutTime: "11:00 AM",
    city: "Nainital",
    pricePerNight: BigInt(3200),
    description:
      "A charming lakeside cottage near Naini Lake offering tranquil stays and scenic boat rides.",
    amenities: ["Lake View", "Parking", "Room Service"],
    address: "5, Mallital, Nainital, Uttarakhand",
    rules: "No outdoor fires. Quiet hours 10 PM–7 AM.",
    contactPhone: "9876540003",
  },
];

const MOCK_USERS: RegisteredCustomer[] = [
  {
    name: "Arjun Sharma",
    email: "arjun@example.com",
    phone: "9876543001",
    password: "",
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    name: "Priya Mehta",
    email: "priya@example.com",
    phone: "9876543002",
    password: "",
    createdAt: "2026-02-10T08:30:00.000Z",
  },
  {
    name: "Rahul Singh",
    email: "rahul@example.com",
    phone: "9876543003",
    password: "",
    createdAt: "2026-02-20T14:00:00.000Z",
  },
];

function UsersTab() {
  const { actor, isFetching } = useActor();
  const { getAllUsers, disableUser, enableUser, deleteUser } = useAuth();
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<RegisteredCustomer | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    propertyName: "",
    city: "",
    pricePerNight: "",
    description: "",
  });
  const [localProperties, setLocalProperties] = useState<Property[]>([]);

  const { data: pendingProps = [] } = useQuery<Property[]>({
    queryKey: ["all_pending_properties"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPendingProperties();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: approvedProps = [] } = useQuery<Property[]>({
    queryKey: ["all_approved_properties_users"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllApprovedProperties();
    },
    enabled: !!actor && !isFetching,
  });

  const registeredUsers = getAllUsers();
  const allUsers = registeredUsers.length === 0 ? MOCK_USERS : registeredUsers;

  const filtered = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search),
  );

  const getUserType = (u: RegisteredCustomer) =>
    u.email === "owner@hidestay.com" ? "Hotel Owner" : "Customer";

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDisable = (email: string) => {
    disableUser(email);
    addActivityLog(`User account ${email} disabled`, "user");
    setTick((t) => t + 1);
    if (selected?.email === email)
      setSelected((p) => (p ? { ...p, disabled: true } : p));
    toast.success("Account disabled.");
  };

  const handleEnable = (email: string) => {
    enableUser(email);
    addActivityLog(`User account ${email} enabled`, "user");
    setTick((t) => t + 1);
    if (selected?.email === email)
      setSelected((p) => (p ? { ...p, disabled: false } : p));
    toast.success("Account enabled.");
  };

  const handleDelete = (email: string) => {
    deleteUser(email);
    addActivityLog(`User account ${email} deleted`, "user");
    setTick((t) => t + 1);
    setSelected(null);
    toast.success("Account deleted.");
  };

  void tick;

  const getLatestUser = (email: string): RegisteredCustomer | undefined => {
    return getAllUsers().find((u) => u.email === email);
  };

  // Get properties for a specific owner
  const getOwnerProperties = (ownerEmail: string): Property[] => {
    const backendAll = [...pendingProps, ...approvedProps];
    const fromBackend = backendAll.filter((p) => p.ownerEmail === ownerEmail);
    if (fromBackend.length > 0) return fromBackend;
    // Use mock for demo owner
    const mock = MOCK_OWNER_PROPERTIES.filter(
      (p) => p.ownerEmail === ownerEmail,
    );
    // Merge with any local edits
    if (localProperties.length > 0) {
      return mock
        .map((mp) => localProperties.find((lp) => lp.id === mp.id) ?? mp)
        .filter((p) => p.ownerEmail === ownerEmail);
    }
    return mock;
  };

  const getStatusBadge = (status: string) => {
    if (status === "approved")
      return (
        <Badge className="bg-green-100 text-green-700 font-body text-xs">
          Approved
        </Badge>
      );
    if (status === "rejected")
      return (
        <Badge className="bg-red-100 text-red-700 font-body text-xs">
          Rejected
        </Badge>
      );
    return (
      <Badge className="bg-amber-100 text-amber-800 font-body text-xs">
        Pending
      </Badge>
    );
  };

  // Property detail from owner view
  if (selectedProperty && selected) {
    const latest = getLatestUser(selected.email) ?? selected;
    const currentProp =
      localProperties.find((p) => p.id === selectedProperty.id) ??
      selectedProperty;
    return (
      <div
        data-ocid="super_admin.owner_property_detail.panel"
        className="space-y-5"
      >
        <button
          type="button"
          onClick={() => setSelectedProperty(null)}
          data-ocid="super_admin.owner_property_detail.back.button"
          className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {latest.name}'s Profile
        </button>

        {/* Use PropertyDetailView for display */}
        <PropertyDetailView
          prop={currentProp}
          onBack={() => setSelectedProperty(null)}
          onApprove={() => toast.info("Use Property Approvals tab to approve.")}
          onReject={() => toast.info("Use Property Approvals tab to reject.")}
          approving={false}
          rejecting={false}
        />

        {/* Extra admin actions overlay */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-display font-bold text-foreground mb-3 text-sm">
              Owner Admin Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button
                data-ocid="super_admin.owner_property_detail.edit.button"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/5 font-body font-semibold flex items-center gap-2"
                onClick={() => {
                  setEditForm({
                    propertyName: currentProp.propertyName,
                    city: currentProp.city,
                    pricePerNight: String(currentProp.pricePerNight),
                    description: currentProp.description,
                  });
                  setEditOpen(true);
                }}
              >
                <Building2 className="w-4 h-4" /> Edit Property Details
              </Button>
              <Button
                data-ocid="super_admin.owner_property_detail.remove.button"
                variant="outline"
                className="border-red-400 text-red-600 hover:bg-red-50 font-body font-semibold flex items-center gap-2"
                onClick={() => {
                  toast.info("Property removed (demo).");
                  setSelectedProperty(null);
                }}
              >
                <XCircle className="w-4 h-4" /> Remove Property
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Edit Property Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent
            data-ocid="super_admin.owner_property_detail.edit.dialog"
            className="font-body max-w-md"
          >
            <DialogHeader>
              <DialogTitle className="font-display font-bold text-foreground">
                Edit Property Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="font-body text-sm font-semibold text-foreground">
                  Property Name
                </Label>
                <Input
                  value={editForm.propertyName}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, propertyName: e.target.value }))
                  }
                  className="font-body"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-sm font-semibold text-foreground">
                  Location (City)
                </Label>
                <Input
                  value={editForm.city}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, city: e.target.value }))
                  }
                  className="font-body"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-sm font-semibold text-foreground">
                  Price per Night (₹)
                </Label>
                <Input
                  type="number"
                  value={editForm.pricePerNight}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      pricePerNight: e.target.value,
                    }))
                  }
                  className="font-body"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-body text-sm font-semibold text-foreground">
                  Description
                </Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="font-body resize-none"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                data-ocid="super_admin.owner_property_detail.edit.cancel.button"
                variant="outline"
                className="font-body"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="super_admin.owner_property_detail.edit.save.button"
                className="bg-primary text-white font-body font-semibold"
                onClick={() => {
                  const updated: Property = {
                    ...currentProp,
                    propertyName: editForm.propertyName,
                    city: editForm.city,
                    pricePerNight: BigInt(
                      Number(editForm.pricePerNight) ||
                        Number(currentProp.pricePerNight),
                    ),
                    description: editForm.description,
                  };
                  setLocalProperties((prev) => {
                    const filtered2 = prev.filter((p) => p.id !== updated.id);
                    return [...filtered2, updated];
                  });
                  setSelectedProperty(updated);
                  setEditOpen(false);
                  toast.success("Property details updated.");
                }}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Hotel Owner detail view
  if (selected && getUserType(selected) === "Hotel Owner") {
    const latest = getLatestUser(selected.email) ?? selected;
    const ownerProps = getOwnerProperties(latest.email);
    return (
      <div data-ocid="super_admin.owner_detail.panel" className="space-y-5">
        <button
          type="button"
          onClick={() => setSelected(null)}
          data-ocid="super_admin.owner_detail.back.button"
          className="flex items-center gap-1.5 text-sm text-primary font-body hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </button>

        {/* Owner Profile Card */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-7 h-7 text-amber-700" />
              </div>
              <div>
                <h2 className="font-display font-bold text-foreground text-xl">
                  {latest.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-amber-100 text-amber-800 font-body text-xs">
                    Hotel Owner
                  </Badge>
                  {latest.disabled ? (
                    <Badge className="bg-red-100 text-red-700 font-body text-xs">
                      Disabled
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700 font-body text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">
                  Full Name
                </p>
                <p className="font-body font-medium text-foreground">
                  {latest.name}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">
                  Email Address
                </p>
                <p className="font-body font-medium text-foreground">
                  {latest.email}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">
                  Phone Number
                </p>
                <p className="font-body font-medium text-foreground">
                  {latest.phone || "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">
                  Account Created
                </p>
                <p className="font-body font-medium text-foreground">
                  {formatDate(latest.createdAt)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">
                  Total Properties Listed
                </p>
                <p className="font-body font-bold text-primary text-lg">
                  {ownerProps.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Section */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Properties
            </h3>
            {ownerProps.length === 0 ? (
              <div
                data-ocid="super_admin.owner_detail.properties.empty_state"
                className="text-center py-10 text-muted-foreground font-body"
              >
                <Building2 className="w-8 h-8 mx-auto mb-2 text-primary/30" />
                <p className="text-sm">
                  No properties listed by this owner yet.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block">
                  <Table data-ocid="super_admin.owner_detail.properties.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-body text-xs uppercase tracking-wide text-muted-foreground">
                          Property Name
                        </TableHead>
                        <TableHead className="font-body text-xs uppercase tracking-wide text-muted-foreground">
                          Location
                        </TableHead>
                        <TableHead className="font-body text-xs uppercase tracking-wide text-muted-foreground">
                          Price / Night
                        </TableHead>
                        <TableHead className="font-body text-xs uppercase tracking-wide text-muted-foreground">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ownerProps.map((prop, i) => {
                        const localProp =
                          localProperties.find((lp) => lp.id === prop.id) ??
                          prop;
                        return (
                          <TableRow
                            key={prop.id}
                            data-ocid={`super_admin.owner_detail.property.row.${i + 1}`}
                            onClick={() => setSelectedProperty(localProp)}
                            className="cursor-pointer hover:bg-primary/5 transition-colors"
                          >
                            <TableCell className="font-body font-semibold text-foreground">
                              {localProp.propertyName}
                            </TableCell>
                            <TableCell className="font-body text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              {localProp.city}
                            </TableCell>
                            <TableCell className="font-body font-medium text-primary">
                              ₹
                              {Number(localProp.pricePerNight).toLocaleString(
                                "en-IN",
                              )}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(localProp.status)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {ownerProps.map((prop, i) => {
                    const localProp =
                      localProperties.find((lp) => lp.id === prop.id) ?? prop;
                    return (
                      <Card
                        key={prop.id}
                        data-ocid={`super_admin.owner_detail.property.row.${i + 1}`}
                        onClick={() => setSelectedProperty(localProp)}
                        className="border-border shadow-xs cursor-pointer hover:border-primary/40 transition-colors"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-body font-semibold text-foreground text-sm">
                                {localProp.propertyName}
                              </p>
                              <p className="text-xs text-muted-foreground font-body flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-primary" />
                                {localProp.city}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-body font-bold text-primary text-sm">
                                ₹
                                {Number(localProp.pricePerNight).toLocaleString(
                                  "en-IN",
                                )}
                              </p>
                              <div className="mt-1">
                                {getStatusBadge(localProp.status)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {latest.disabled ? (
            <Button
              onClick={() => handleEnable(latest.email)}
              data-ocid="super_admin.owner_detail.enable.button"
              className="bg-green-600 hover:bg-green-700 text-white font-body font-semibold flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" /> Enable Account
            </Button>
          ) : (
            <Button
              onClick={() => handleDisable(latest.email)}
              data-ocid="super_admin.owner_detail.disable.button"
              variant="outline"
              className="border-amber-500 text-amber-700 hover:bg-amber-50 font-body font-semibold flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Disable Account
            </Button>
          )}
          <Button
            onClick={() => handleDelete(latest.email)}
            data-ocid="super_admin.owner_detail.delete.button"
            variant="outline"
            className="border-red-400 text-red-600 hover:bg-red-50 font-body font-semibold flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" /> Delete Account
          </Button>
        </div>
      </div>
    );
  }

  // Generic customer detail view
  if (selected) {
    const latest = getLatestUser(selected.email) ?? selected;
    const userType = getUserType(latest);
    return (
      <div data-ocid="super_admin.user_detail.panel" className="space-y-5">
        <button
          type="button"
          onClick={() => setSelected(null)}
          data-ocid="super_admin.user_detail.back.button"
          className="flex items-center gap-1.5 text-sm text-primary font-body hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </button>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-bold text-foreground text-xl">
                  {latest.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-blue-100 text-blue-800 font-body text-xs">
                    {userType}
                  </Badge>
                  {latest.disabled ? (
                    <Badge className="bg-red-100 text-red-700 font-body text-xs">
                      Disabled
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700 font-body text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">
                  Full Name
                </p>
                <p className="font-body font-medium text-foreground">
                  {latest.name}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">
                  Email Address
                </p>
                <p className="font-body font-medium text-foreground">
                  {latest.email}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">
                  Phone Number
                </p>
                <p className="font-body font-medium text-foreground">
                  {latest.phone || "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">
                  User Type
                </p>
                <p className="font-body font-medium text-foreground">
                  {userType}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">
                  Account Created
                </p>
                <p className="font-body font-medium text-foreground">
                  {formatDate(latest.createdAt)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">
                  Total Bookings
                </p>
                <p className="font-body font-medium text-foreground">2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Recent Activity
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-body py-2 border-b border-border">
                <span className="text-muted-foreground">Last booking</span>
                <span className="font-medium text-foreground">
                  HIDE-20260310-4821
                </span>
              </div>
              <div className="flex justify-between text-sm font-body py-2 border-b border-border">
                <span className="text-muted-foreground">Destination</span>
                <span className="font-medium text-foreground">Rishikesh</span>
              </div>
              <div className="flex justify-between text-sm font-body py-2">
                <span className="text-muted-foreground">Status</span>
                <Badge className="bg-green-100 text-green-700 font-body text-xs">
                  Confirmed
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {latest.disabled ? (
            <Button
              onClick={() => handleEnable(latest.email)}
              data-ocid="super_admin.user_detail.enable.button"
              className="bg-green-600 hover:bg-green-700 text-white font-body font-semibold flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" /> Enable Account
            </Button>
          ) : (
            <Button
              onClick={() => handleDisable(latest.email)}
              data-ocid="super_admin.user_detail.disable.button"
              variant="outline"
              className="border-amber-500 text-amber-700 hover:bg-amber-50 font-body font-semibold flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Disable Account
            </Button>
          )}
          <Button
            onClick={() => handleDelete(latest.email)}
            data-ocid="super_admin.user_detail.delete.button"
            variant="outline"
            className="border-red-400 text-red-600 hover:bg-red-50 font-body font-semibold flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" /> Delete Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div data-ocid="super_admin.users.panel" className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-foreground text-lg">
            Registered Users
          </h2>
          <p className="text-muted-foreground text-sm font-body">
            {allUsers.length} total users
          </p>
        </div>
        <div className="relative">
          <Input
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="super_admin.users.search_input"
            className="font-body pl-3 w-64"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          data-ocid="super_admin.users.empty_state"
          className="text-center py-12 text-muted-foreground font-body"
        >
          <Users className="w-10 h-10 mx-auto mb-3 text-primary/30" />
          <p className="text-sm">No users found.</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((u, i) => {
              const uType = getUserType(u);
              return (
                <Card
                  key={u.email}
                  data-ocid={`super_admin.users.item.${i + 1}`}
                  onClick={() => setSelected(u)}
                  className="border-border shadow-xs cursor-pointer hover:border-primary/40 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-body font-semibold text-foreground text-sm">
                            {u.name}
                          </p>
                          <p className="text-xs text-muted-foreground font-body">
                            {u.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          className={
                            uType === "Hotel Owner"
                              ? "bg-amber-100 text-amber-800 font-body text-xs"
                              : "bg-blue-100 text-blue-800 font-body text-xs"
                          }
                        >
                          {uType}
                        </Badge>
                        {u.disabled ? (
                          <Badge className="bg-red-100 text-red-700 font-body text-xs">
                            Disabled
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700 font-body text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <Table data-ocid="super_admin.users.table">
              <TableHeader>
                <TableRow>
                  <TableHead className="font-body text-xs uppercase tracking-wide text-muted-foreground">
                    Name
                  </TableHead>
                  <TableHead className="font-body text-xs uppercase tracking-wide text-muted-foreground">
                    Email
                  </TableHead>
                  <TableHead className="font-body text-xs uppercase tracking-wide text-muted-foreground">
                    Phone
                  </TableHead>
                  <TableHead className="font-body text-xs uppercase tracking-wide text-muted-foreground">
                    Type
                  </TableHead>
                  <TableHead className="font-body text-xs uppercase tracking-wide text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u, i) => {
                  const uType = getUserType(u);
                  return (
                    <TableRow
                      key={u.email}
                      data-ocid={`super_admin.users.item.${i + 1}`}
                      onClick={() => setSelected(u)}
                      className="cursor-pointer hover:bg-primary/5 transition-colors"
                    >
                      <TableCell className="font-body font-semibold text-foreground">
                        {u.name}
                      </TableCell>
                      <TableCell className="font-body text-muted-foreground">
                        {u.email}
                      </TableCell>
                      <TableCell className="font-body text-muted-foreground">
                        {u.phone || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            uType === "Hotel Owner"
                              ? "bg-amber-100 text-amber-800 font-body text-xs"
                              : "bg-blue-100 text-blue-800 font-body text-xs"
                          }
                        >
                          {uType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.disabled ? (
                          <Badge className="bg-red-100 text-red-700 font-body text-xs">
                            Disabled
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700 font-body text-xs">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

function FeaturedHotelsTab() {
  const { actor } = useActor();
  const [featuredIds, setFeaturedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("hidestay_featured_hotels");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const { data: approvedProperties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["approvedProperties"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllApprovedProperties();
      return result;
    },
    enabled: !!actor,
  });

  const MOCK_APPROVED: Property[] = [
    {
      id: "prop-001",
      propertyName: "The Mountain Retreat",
      city: "Rishikesh",
      address: "Near Laxman Jhula, Rishikesh",
      propertyType: "Resort",
      pricePerNight: BigInt(4500),
      imageUrls: ["/assets/generated/category-resorts.dim_600x400.jpg"],
      status: "approved",
      ownerEmail: "owner@hidestay.com",
      contactPhone: "+91 9876543210",
      description: "Luxury mountain resort with stunning views.",
      amenities: ["WiFi", "Pool", "Spa"],
      rules: "No smoking",
      checkinTime: "2:00 PM",
      checkoutTime: "11:00 AM",
    },
    {
      id: "prop-002",
      propertyName: "Valley View Homestay",
      city: "Mussoorie",
      address: "Landour, Mussoorie",
      propertyType: "Homestay",
      pricePerNight: BigInt(2800),
      imageUrls: ["/assets/generated/category-homestays.dim_600x400.jpg"],
      status: "approved",
      ownerEmail: "owner@hidestay.com",
      contactPhone: "+91 9876543211",
      description: "Cozy homestay with valley views.",
      amenities: ["WiFi", "Breakfast"],
      rules: "No pets",
      checkinTime: "1:00 PM",
      checkoutTime: "10:00 AM",
    },
    {
      id: "prop-003",
      propertyName: "Lake View Guest House",
      city: "Nainital",
      address: "Near Naini Lake, Nainital",
      propertyType: "Guest House",
      pricePerNight: BigInt(3200),
      imageUrls: ["/assets/generated/category-guesthouses.dim_600x400.jpg"],
      status: "approved",
      ownerEmail: "owner@hidestay.com",
      contactPhone: "+91 9876543212",
      description: "Beautiful guest house with lake views.",
      amenities: ["WiFi", "Parking"],
      rules: "Quiet hours after 10 PM",
      checkinTime: "12:00 PM",
      checkoutTime: "11:00 AM",
    },
  ];

  const displayProperties =
    approvedProperties.length > 0 ? approvedProperties : MOCK_APPROVED;

  const toggleFeatured = (id: string) => {
    setFeaturedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        addActivityLog(`Property '${id}' removed from Featured`, "featured");
        toast.success("Removed from Featured Hotels.");
      } else {
        next.add(id);
        addActivityLog(`Property '${id}' marked as Featured`, "featured");
        toast.success("Marked as Featured! Now visible on homepage.");
      }
      localStorage.setItem(
        "hidestay_featured_hotels",
        JSON.stringify([...next]),
      );
      return next;
    });
  };

  const featuredProperties = displayProperties.filter((p) =>
    featuredIds.has(p.id),
  );
  const nonFeaturedProperties = displayProperties.filter(
    (p) => !featuredIds.has(p.id),
  );

  if (isLoading) {
    return (
      <div
        className="text-center py-12 text-muted-foreground"
        data-ocid="super_admin.featured.loading_state"
      >
        Loading approved properties...
      </div>
    );
  }

  return (
    <div className="space-y-8" data-ocid="super_admin.featured.section">
      {/* Currently Featured */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-[#FF9933] fill-[#FF9933]" />
          <h3 className="font-semibold text-lg text-foreground">
            Currently Featured
          </h3>
          <Badge variant="secondary" className="ml-1">
            {featuredProperties.length}
          </Badge>
        </div>
        {featuredProperties.length === 0 ? (
          <div
            className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm"
            data-ocid="super_admin.featured.empty_state"
          >
            No featured hotels yet. Mark approved properties as featured below.
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-ocid="super_admin.featured.list"
          >
            {featuredProperties.map((prop, i) => (
              <Card
                key={prop.id}
                className="overflow-hidden border-[#FF9933]/30 shadow-sm"
                data-ocid={`super_admin.featured.item.${i + 1}`}
              >
                <div className="relative h-36 bg-gray-100">
                  {prop.imageUrls.length > 0 ? (
                    <img
                      src={prop.imageUrls[0]}
                      alt={prop.propertyName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-[#1F7A4C]" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-[#FF9933] text-white border-0 text-xs font-semibold gap-1">
                      <Star className="w-3 h-3 fill-white" /> Featured
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                    {prop.propertyName}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {prop.city}
                  </p>
                  <p className="text-xs font-medium text-[#1F7A4C] mt-1">
                    ₹{Number(prop.pricePerNight).toLocaleString("en-IN")} /
                    night
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2 text-xs border-red-200 text-red-600 hover:bg-red-50"
                    data-ocid={`super_admin.featured.remove.button.${i + 1}`}
                    onClick={() => toggleFeatured(prop.id)}
                  >
                    Remove from Featured
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* All Approved Properties */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-[#1F7A4C]" />
          <h3 className="font-semibold text-lg text-foreground">
            Approved Properties
          </h3>
          <Badge variant="secondary" className="ml-1">
            {nonFeaturedProperties.length}
          </Badge>
        </div>
        {nonFeaturedProperties.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
            All approved properties are currently featured.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table data-ocid="super_admin.featured.table">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Property</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Rating</TableHead>
                  <TableHead className="text-xs">Price/Night</TableHead>
                  <TableHead className="text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nonFeaturedProperties.map((prop, i) => (
                  <TableRow
                    key={prop.id}
                    data-ocid={`super_admin.featured.row.${i + 1}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {prop.imageUrls.length > 0 ? (
                            <img
                              src={prop.imageUrls[0]}
                              alt={prop.propertyName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground line-clamp-1">
                            {prop.propertyName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {prop.propertyType}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {prop.city}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">4.5</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-[#1F7A4C]">
                      ₹{Number(prop.pricePerNight).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        className="bg-[#FF9933] hover:bg-[#e68a2e] text-white text-xs gap-1"
                        data-ocid={`super_admin.featured.mark.button.${i + 1}`}
                        onClick={() => toggleFeatured(prop.id)}
                      >
                        <Star className="w-3 h-3" /> Mark as Featured
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityLogTab() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>(() => getActivityLog());
  const [filter, setFilter] = useState<"all" | ActivityLogEntry["category"]>(
    "all",
  );

  const refresh = () => setLogs(getActivityLog());

  const getCategoryColor = (category: ActivityLogEntry["category"]) => {
    switch (category) {
      case "property":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "booking":
        return "bg-green-100 text-green-800 border border-green-200";
      case "user":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "featured":
        return "bg-amber-100 text-amber-800 border border-amber-200";
    }
  };

  const getCategoryLabel = (category: ActivityLogEntry["category"]) => {
    switch (category) {
      case "property":
        return "Property";
      case "booking":
        return "Booking";
      case "user":
        return "User";
      case "featured":
        return "Featured";
    }
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const filtered =
    filter === "all" ? logs : logs.filter((l) => l.category === filter);

  return (
    <div className="space-y-6" data-ocid="super_admin.activity_log.section">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-primary" />
          <h2 className="font-display font-black text-foreground text-xl">
            Activity Log
          </h2>
          <Badge className="bg-primary/10 text-primary border-0 font-body text-xs">
            {filtered.length} entries
          </Badge>
        </div>
        <button
          type="button"
          onClick={refresh}
          data-ocid="super_admin.activity_log.refresh.button"
          className="flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5 hover:bg-muted/50"
        >
          <Activity className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-2 flex-wrap"
        data-ocid="super_admin.activity_log.filter.tab"
      >
        {(["all", "property", "booking", "user", "featured"] as const).map(
          (f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-colors border ${
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted/50"
              }`}
            >
              {f === "all"
                ? "All Actions"
                : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ),
        )}
      </div>

      {filtered.length === 0 ? (
        <div
          data-ocid="super_admin.activity_log.empty_state"
          className="text-center py-16 text-muted-foreground font-body"
        >
          <ScrollText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No activity recorded yet.</p>
          <p className="text-xs mt-1">
            Actions like approving properties or cancelling bookings will appear
            here.
          </p>
        </div>
      ) : (
        <Card
          className="border-border shadow-xs overflow-hidden"
          data-ocid="super_admin.activity_log.table"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="font-body font-semibold text-foreground w-8">
                    #
                  </TableHead>
                  <TableHead className="font-body font-semibold text-foreground">
                    Action
                  </TableHead>
                  <TableHead className="font-body font-semibold text-foreground">
                    Category
                  </TableHead>
                  <TableHead className="font-body font-semibold text-foreground">
                    Admin
                  </TableHead>
                  <TableHead className="font-body font-semibold text-foreground whitespace-nowrap">
                    Date & Time
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry, idx) => (
                  <TableRow
                    key={entry.id}
                    className="hover:bg-muted/20 transition-colors"
                    data-ocid={`super_admin.activity_log.row.${idx + 1}`}
                  >
                    <TableCell className="font-body text-muted-foreground text-xs">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="font-body text-foreground text-sm py-3">
                      {entry.action}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] font-body ${getCategoryColor(entry.category)}`}
                      >
                        {getCategoryLabel(entry.category)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-body text-sm text-muted-foreground whitespace-nowrap">
                      {entry.adminName}
                    </TableCell>
                    <TableCell className="font-body text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(entry.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <p className="text-xs font-body text-muted-foreground/60 text-center">
        Activity logs are read-only. Showing latest {filtered.length} entries.
      </p>
    </div>
  );
}

// ── Platform Settings Tab ─────────────────────────────────────────────────────

const SETTINGS_KEY = "hidestay_platform_settings";

interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  companyAddress: string;
  footerText: string;
  homeTagline: string;
  featuredSectionTitle: string;
  exploreSectionTitle: string;
  logoUrl: string;
  bannerUrls: string[];
}

const defaultSettings: PlatformSettings = {
  platformName: "HIDESTAY",
  supportEmail: "hidestayindiapvtltd@gmail.com",
  supportPhone: "+91 98765 43210",
  companyAddress: "Rishikesh, Uttarakhand, India",
  footerText: "Discover Hidden Stays in India",
  homeTagline: "Luxury stays surrounded by nature",
  featuredSectionTitle: "Top Stays",
  exploreSectionTitle: "Explore by Category",
  logoUrl: "",
  bannerUrls: [],
};

function loadSettings(): PlatformSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {}
  return defaultSettings;
}

function PlatformSettingsTab() {
  const [settings, setSettings] = useState<PlatformSettings>(loadSettings);
  const [saved, setSaved] = useState(false);
  const handleChange = (field: keyof PlatformSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSettings((prev) => ({ ...prev, logoUrl: reader.result as string }));
      setSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        setSettings((prev) => ({
          ...prev,
          bannerUrls: [...prev.bannerUrls, reader.result as string],
        }));
        setSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBanner = (idx: number) => {
    setSettings((prev) => ({
      ...prev,
      bannerUrls: prev.bannerUrls.filter((_, i) => i !== idx),
    }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    toast.success("Platform settings saved successfully.");
    addActivityLog("Platform settings updated", "user");
  };

  return (
    <div className="space-y-8" data-ocid="platform_settings.panel">
      {/* Platform Information */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Platform Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label
                className="font-body text-sm font-medium"
                htmlFor="ps-name"
              >
                Platform Name
              </Label>
              <Input
                id="ps-name"
                value={settings.platformName}
                onChange={(e) => handleChange("platformName", e.target.value)}
                placeholder="HIDESTAY"
                data-ocid="platform_settings.platform_name.input"
              />
            </div>
            <div className="space-y-2">
              <Label
                className="font-body text-sm font-medium"
                htmlFor="ps-email"
              >
                Support Email
              </Label>
              <Input
                id="ps-email"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleChange("supportEmail", e.target.value)}
                placeholder="support@hidestay.com"
                data-ocid="platform_settings.support_email.input"
              />
            </div>
            <div className="space-y-2">
              <Label
                className="font-body text-sm font-medium"
                htmlFor="ps-phone"
              >
                Support Phone Number
              </Label>
              <Input
                id="ps-phone"
                value={settings.supportPhone}
                onChange={(e) => handleChange("supportPhone", e.target.value)}
                placeholder="+91 98765 43210"
                data-ocid="platform_settings.support_phone.input"
              />
            </div>
            <div className="space-y-2">
              <Label
                className="font-body text-sm font-medium"
                htmlFor="ps-footer"
              >
                Website Footer Text
              </Label>
              <Input
                id="ps-footer"
                value={settings.footerText}
                onChange={(e) => handleChange("footerText", e.target.value)}
                placeholder="Discover Hidden Stays in India"
                data-ocid="platform_settings.footer_text.input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              className="font-body text-sm font-medium"
              htmlFor="ps-address"
            >
              Company Address
            </Label>
            <Textarea
              id="ps-address"
              value={settings.companyAddress}
              onChange={(e) => handleChange("companyAddress", e.target.value)}
              placeholder="Rishikesh, Uttarakhand, India"
              rows={2}
              data-ocid="platform_settings.company_address.textarea"
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="font-body text-sm font-medium">
              Platform Logo
            </Label>
            <div className="flex items-center gap-4">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="Platform logo"
                  className="h-14 w-14 rounded-lg object-contain border bg-muted"
                />
              ) : (
                <div className="h-14 w-14 rounded-lg border bg-muted flex items-center justify-center text-xs text-muted-foreground font-body">
                  No logo
                </div>
              )}
              <label
                htmlFor="ps-logo-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-body hover:bg-primary/90 transition-colors"
                data-ocid="platform_settings.logo.upload_button"
              >
                <Download className="w-4 h-4" />
                Upload Logo
                <input
                  id="ps-logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </label>
              {settings.logoUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="font-body"
                  onClick={() => {
                    setSettings((p) => ({ ...p, logoUrl: "" }));
                    setSaved(false);
                  }}
                  data-ocid="platform_settings.logo.delete_button"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Homepage Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            Homepage Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label
                className="font-body text-sm font-medium"
                htmlFor="ps-tagline"
              >
                Homepage Tagline
              </Label>
              <Input
                id="ps-tagline"
                value={settings.homeTagline}
                onChange={(e) => handleChange("homeTagline", e.target.value)}
                placeholder="Luxury stays surrounded by nature"
                data-ocid="platform_settings.tagline.input"
              />
            </div>
            <div className="space-y-2">
              <Label
                className="font-body text-sm font-medium"
                htmlFor="ps-featured-title"
              >
                Featured Section Title
              </Label>
              <Input
                id="ps-featured-title"
                value={settings.featuredSectionTitle}
                onChange={(e) =>
                  handleChange("featuredSectionTitle", e.target.value)
                }
                placeholder="Top Stays"
                data-ocid="platform_settings.featured_title.input"
              />
            </div>
            <div className="space-y-2">
              <Label
                className="font-body text-sm font-medium"
                htmlFor="ps-explore-title"
              >
                Explore Section Title
              </Label>
              <Input
                id="ps-explore-title"
                value={settings.exploreSectionTitle}
                onChange={(e) =>
                  handleChange("exploreSectionTitle", e.target.value)
                }
                placeholder="Explore by Category"
                data-ocid="platform_settings.explore_title.input"
              />
            </div>
          </div>

          {/* Banner Images */}
          <div className="space-y-3">
            <Label className="font-body text-sm font-medium">
              Homepage Banner Images
            </Label>
            <label
              htmlFor="ps-banner-upload"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md border border-dashed border-primary text-primary text-sm font-body hover:bg-primary/5 transition-colors"
              data-ocid="platform_settings.banner.upload_button"
            >
              <Download className="w-4 h-4" />
              Upload Banner Images
              <input
                id="ps-banner-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleBannerUpload}
              />
            </label>
            {settings.bannerUrls.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {settings.bannerUrls.map((url, idx) => (
                  <div
                    /* biome-ignore lint/suspicious/noArrayIndexKey: banner order is stable */
                    key={idx}
                    className="relative rounded-lg overflow-hidden h-28 bg-muted group"
                    data-ocid={`platform_settings.banner.item.${idx + 1}`}
                  >
                    <img
                      src={url}
                      alt={`Banner ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeBanner(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      data-ocid={`platform_settings.banner.delete_button.${idx + 1}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p
                className="text-sm text-muted-foreground font-body"
                data-ocid="platform_settings.banner.empty_state"
              >
                No banner images uploaded yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-body px-8"
          data-ocid="platform_settings.save_button"
        >
          Save Settings
        </Button>
        {saved && (
          <span
            className="flex items-center gap-1 text-sm text-green-600 font-body"
            data-ocid="platform_settings.success_state"
          >
            <CheckCircle2 className="w-4 h-4" />
            Settings saved
          </span>
        )}
      </div>
    </div>
  );
}

function VirtualTourApprovalsTab() {
  const TOURS_KEY = "hidestay_virtual_tours";
  const [tours, setTours] = useState<VirtualTour[]>(() => {
    try {
      const stored = localStorage.getItem(TOURS_KEY);
      return stored ? (JSON.parse(stored) as VirtualTour[]) : [];
    } catch {
      return [];
    }
  });
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [previewTour, setPreviewTour] = useState<VirtualTour | null>(null);

  const saveTours = (updated: VirtualTour[]) => {
    try {
      localStorage.setItem(TOURS_KEY, JSON.stringify(updated));
    } catch {
      // quota
    }
    setTours(updated);
  };

  const handleApprove = (id: string) => {
    const tour = tours.find((t) => t.id === id);
    if (!tour) return;
    const updated = tours.map((t) =>
      t.id === id ? { ...t, status: "approved" as const } : t,
    );
    saveTours(updated);
    addActivityLog(`360° tour '${tour.roomName}' approved`, "property");
    toast.success(`Tour "${tour.roomName}" approved.`);
  };

  const handleReject = (id: string) => {
    const tour = tours.find((t) => t.id === id);
    if (!tour) return;
    const updated = tours.map((t) =>
      t.id === id ? { ...t, status: "rejected" as const } : t,
    );
    saveTours(updated);
    addActivityLog(`360° tour '${tour.roomName}' rejected`, "property");
    toast.error(`Tour "${tour.roomName}" rejected.`);
  };

  const getStatusBadge = (status: VirtualTour["status"] | undefined) => {
    if (status === "approved")
      return "bg-green-100 text-green-800 border border-green-200";
    if (status === "rejected")
      return "bg-red-100 text-red-800 border border-red-200";
    return "bg-amber-100 text-amber-800 border border-amber-200";
  };

  const getStatusLabel = (status: VirtualTour["status"] | undefined) => {
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    return "Pending";
  };

  const filtered =
    filter === "all"
      ? tours
      : tours.filter((t) => (t.status ?? "pending") === filter);

  return (
    <div className="space-y-6" data-ocid="super_admin.tours.section">
      <div className="flex items-center gap-2">
        <RefreshCw className="w-5 h-5 text-primary" />
        <h2 className="font-display font-black text-foreground text-xl">
          Virtual Tour Approvals
        </h2>
        <Badge className="bg-primary/10 text-primary border-0 font-body text-xs">
          {filtered.length} tours
        </Badge>
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-2 flex-wrap"
        data-ocid="super_admin.tours.filter.tab"
      >
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-colors border ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted/50"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div
          data-ocid="super_admin.tours.empty_state"
          className="text-center py-16 text-muted-foreground font-body border-2 border-dashed border-border rounded-2xl"
        >
          <RefreshCw className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No virtual tours found</p>
          <p className="text-xs mt-1">
            Hotel owners can upload 360° room tour images from their dashboard.
          </p>
        </div>
      ) : (
        <Card className="border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="font-body font-semibold text-foreground">
                    Preview
                  </TableHead>
                  <TableHead className="font-body font-semibold text-foreground">
                    Room Name
                  </TableHead>
                  <TableHead className="font-body font-semibold text-foreground">
                    Room Type
                  </TableHead>
                  <TableHead className="font-body font-semibold text-foreground">
                    Status
                  </TableHead>
                  <TableHead className="font-body font-semibold text-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tour, i) => (
                  <TableRow
                    key={tour.id}
                    data-ocid={`super_admin.tours.item.${i + 1}`}
                    className="hover:bg-muted/30"
                  >
                    <TableCell>
                      {/* biome-ignore lint/a11y/useKeyWithClickEvents: thumbnail click-to-preview is supplemental; Preview button handles keyboard */}
                      <div
                        className="w-20 h-14 rounded-lg overflow-hidden bg-muted cursor-pointer"
                        onClick={() => setPreviewTour(tour)}
                      >
                        <img
                          src={tour.imageDataUrl}
                          alt={tour.roomName}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-body font-medium text-foreground">
                      {tour.roomName}
                    </TableCell>
                    <TableCell>
                      <span
                        className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                        style={{ background: "#FF9933", color: "#1a1a1a" }}
                      >
                        {tour.roomType}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${getStatusBadge(tour.status)}`}
                      >
                        {getStatusLabel(tour.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          data-ocid={`super_admin.tours.preview.button.${i + 1}`}
                          onClick={() => setPreviewTour(tour)}
                          className="px-2.5 py-1 text-xs font-body font-medium rounded-lg border border-border hover:bg-muted/50 transition-colors"
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          data-ocid={`super_admin.tours.approve.button.${i + 1}`}
                          onClick={() => handleApprove(tour.id)}
                          disabled={(tour.status ?? "pending") === "approved"}
                          className="px-2.5 py-1 text-xs font-body font-semibold rounded-lg bg-[#1F7A4C] text-white hover:bg-[#185e3a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          data-ocid={`super_admin.tours.reject.button.${i + 1}`}
                          onClick={() => handleReject(tour.id)}
                          disabled={(tour.status ?? "pending") === "rejected"}
                          className="px-2.5 py-1 text-xs font-body font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Reject
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Full-screen preview modal */}
      {previewTour && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click-to-close is supplemental; X button handles keyboard
        <div
          data-ocid="super_admin.tours.preview.modal"
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center"
          onClick={() => setPreviewTour(null)}
        >
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation only */}
          <div
            className="relative max-w-5xl w-full px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display font-bold text-white text-xl">
                  {previewTour.roomName}
                </h3>
                <span
                  className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1"
                  style={{ background: "#FF9933", color: "#1a1a1a" }}
                >
                  {previewTour.roomType}
                </span>
                <span
                  className={`inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full ml-2 ${getStatusBadge(previewTour.status)}`}
                >
                  {getStatusLabel(previewTour.status)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTour(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div
              className="overflow-hidden rounded-2xl"
              style={{ maxHeight: "60vh" }}
            >
              <img
                src={previewTour.imageDataUrl}
                alt={previewTour.roomName}
                className="w-full h-full object-cover"
                style={{ maxHeight: "60vh" }}
              />
            </div>
            {previewTour.description && (
              <p className="text-white/80 font-body text-sm mt-3 text-center">
                {previewTour.description}
              </p>
            )}
            <div className="flex justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  handleApprove(previewTour.id);
                  setPreviewTour(null);
                }}
                className="px-5 py-2 text-sm font-body font-semibold rounded-xl bg-[#1F7A4C] text-white hover:bg-[#185e3a] transition-colors"
              >
                Approve Tour
              </button>
              <button
                type="button"
                onClick={() => {
                  handleReject(previewTour.id);
                  setPreviewTour(null);
                }}
                className="px-5 py-2 text-sm font-body font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Reject Tour
              </button>
            </div>
            <p className="text-white/50 font-body text-xs mt-3 text-center">
              Click outside to close
            </p>
          </div>
        </div>
      )}
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
        {/* Analytics Summary */}
        <div data-ocid="super_admin.analytics.section" className="mb-8">
          <h2 className="font-display font-bold text-foreground text-lg mb-4">
            Analytics Overview
          </h2>

          {/* 5 Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {ANALYTICS_STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.label}
                  data-ocid="super_admin.stats.card"
                  className="border-border shadow-xs hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div
                      className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}
                    >
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <p className="font-display font-black text-foreground text-2xl leading-none mb-1">
                      {stat.value}
                    </p>
                    <p className="text-muted-foreground text-xs font-body leading-tight">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bookings per day */}
            <Card
              data-ocid="super_admin.bookings_chart.card"
              className="border-border shadow-xs"
            >
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="font-display text-sm font-semibold text-foreground">
                  Bookings per Day
                </CardTitle>
                <p className="text-muted-foreground text-xs font-body">
                  Last 7 days
                </p>
              </CardHeader>
              <CardContent className="px-2 pb-4">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart
                    data={BOOKINGS_PER_DAY}
                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                      }}
                    />
                    <Bar
                      dataKey="bookings"
                      fill="#1F7A4C"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* New users per week */}
            <Card
              data-ocid="super_admin.users_chart.card"
              className="border-border shadow-xs"
            >
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="font-display text-sm font-semibold text-foreground">
                  New Users per Week
                </CardTitle>
                <p className="text-muted-foreground text-xs font-body">
                  Last 6 weeks
                </p>
              </CardHeader>
              <CardContent className="px-2 pb-4">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart
                    data={NEW_USERS_PER_WEEK}
                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                      }}
                    />
                    <Bar dataKey="users" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Property listings growth */}
            <Card
              data-ocid="super_admin.properties_chart.card"
              className="border-border shadow-xs"
            >
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="font-display text-sm font-semibold text-foreground">
                  Property Listings Growth
                </CardTitle>
                <p className="text-muted-foreground text-xs font-body">
                  Last 6 months
                </p>
              </CardHeader>
              <CardContent className="px-2 pb-4">
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart
                    data={PROPERTY_GROWTH}
                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="properties"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      dot={{ fill: "#2563EB", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
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
            <TabsTrigger value="users" data-ocid="super_admin.users.tab">
              Users
            </TabsTrigger>
            <TabsTrigger value="featured" data-ocid="super_admin.featured.tab">
              Featured Hotels
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              data-ocid="super_admin.activity_log.tab"
            >
              Activity Log
            </TabsTrigger>
            <TabsTrigger value="settings" data-ocid="super_admin.settings.tab">
              Platform Settings
            </TabsTrigger>
            <TabsTrigger value="tours" data-ocid="super_admin.tours.tab">
              Virtual Tours
            </TabsTrigger>
            <TabsTrigger
              value="destinations"
              data-ocid="super_admin.destinations.tab"
            >
              Destination Highlights
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

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          <TabsContent value="featured">
            <FeaturedHotelsTab />
          </TabsContent>
          <TabsContent value="activity">
            <ActivityLogTab />
          </TabsContent>
          <TabsContent value="settings">
            <PlatformSettingsTab />
          </TabsContent>
          <TabsContent value="destinations">
            <DestinationHighlightsTab />
          </TabsContent>

          <TabsContent value="tours">
            <VirtualTourApprovalsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
