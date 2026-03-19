import type { Booking } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  LogOut,
  Mail,
  MessageSquare,
  Search,
  User,
  UserCircle,
} from "lucide-react";
import { useState } from "react";

function getLocalBookings(email: string): Booking[] {
  try {
    const raw = localStorage.getItem("hidestay_bookings");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed
      .filter(
        (b: { email?: string }) =>
          (b.email || "").toLowerCase() === email.toLowerCase(),
      )
      .map(
        (b: {
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
        }) => ({
          id: b.id,
          stayName: b.stayName,
          location: b.location,
          checkin: b.checkin,
          checkout: b.checkout,
          guestName: b.guestName,
          phone: b.phone,
          email: b.email,
          guests: BigInt(b.guests || 1),
          createdAt: BigInt(b.createdAt || Date.now()),
          status: "pending",
          propertyId: "",
        }),
      );
  } catch {
    return [];
  }
}

export default function ProfilePage() {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const { actor } = useActor();
  const [lookupId, setLookupId] = useState("");
  const [searched, setSearched] = useState(false);

  const { data: backendBookings = [] } = useQuery<Booking[]>({
    queryKey: ["customerBookings", user?.email],
    queryFn: async () => {
      if (!actor || !user?.email) return [];
      try {
        return await actor.getBookingsByCustomerEmail(user.email);
      } catch {
        return [];
      }
    },
    enabled: !!actor && role === "customer" && !!user?.email,
  });

  // Merge backend bookings with localStorage bookings (deduplicate by id)
  const myBookings = (() => {
    const local = user?.email ? getLocalBookings(user.email) : [];
    const backendIds = new Set(backendBookings.map((b) => b.id));
    const uniqueLocal = local.filter((b) => !backendIds.has(b.id));
    return [...backendBookings, ...uniqueLocal];
  })();

  const getBookingStatus = (booking: Booking): string => {
    // Use backend status if it's a terminal state
    if (booking.status === "cancelled") return "Cancelled";
    if (booking.status === "completed") return "Completed";

    // Compute from dates for pending/confirmed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkout = new Date(booking.checkout);
    checkout.setHours(0, 0, 0, 0);
    const checkin = new Date(booking.checkin);
    checkin.setHours(0, 0, 0, 0);
    if (checkout < today) return "Completed";
    if (checkin <= today) return "Active";
    return "Upcoming";
  };

  const lookedUpBooking = searched
    ? myBookings.find(
        (b) => b.id.toLowerCase() === lookupId.trim().toLowerCase(),
      )
    : null;

  const handleLookup = () => {
    if (lookupId.trim()) setSearched(true);
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/dashboard" });
  };

  const handleLeaveReview = (booking: Booking) => {
    navigate({
      to: "/details",
      search: {
        id: booking.id,
        category: "Hotels",
        name: booking.stayName,
        location: booking.location,
        price: "₹8,500/night",
        rating: 4.5,
        review: "true",
      },
    });
  };

  if (role !== "customer") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 pb-24">
        <Card className="w-full max-w-sm shadow-green border-border text-center">
          <CardHeader>
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <UserCircle className="w-7 h-7 text-primary" />
            </div>
            <CardTitle className="font-display text-xl text-foreground">
              Sign In to View Profile
            </CardTitle>
            <p className="text-muted-foreground text-sm font-body mt-1">
              Sign in to view your profile and bookings.
            </p>
          </CardHeader>
          <CardContent>
            <Button
              data-ocid="profile.customer_login.button"
              className="w-full bg-primary text-primary-foreground font-body font-semibold"
              onClick={() => navigate({ to: "/login/customer" })}
            >
              Customer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div data-ocid="profile.page" className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border shadow-xs">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-foreground text-xl">
              My Profile
            </h1>
            <p className="text-muted-foreground text-sm font-body">
              Manage your bookings and account
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            data-ocid="profile.logout.button"
            className="font-body text-xs flex items-center gap-1.5"
            onClick={handleLogout}
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Card className="border-border shadow-xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-green">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-bold text-foreground text-lg">
                {user?.name || "Guest User"}
              </h2>
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-body">
                <Mail className="w-3.5 h-3.5" />
                {user?.email || "guest@hidestay.com"}
              </div>
              <Badge
                variant="secondary"
                className="mt-1.5 text-[10px] font-body"
              >
                Customer Account
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base text-foreground">
              Look Up Booking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Booking ID (e.g. HIDE-20260310-4821)"
                value={lookupId}
                data-ocid="profile.booking_id.input"
                onChange={(e) => {
                  setLookupId(e.target.value);
                  setSearched(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                className="font-body text-sm"
              />
              <Button
                data-ocid="profile.lookup.button"
                onClick={handleLookup}
                className="bg-primary text-primary-foreground font-body font-semibold flex items-center gap-1.5 shrink-0"
              >
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>
            {searched && lookedUpBooking && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm font-body space-y-1">
                <p className="font-semibold text-foreground">
                  {lookedUpBooking.stayName}
                </p>
                <p className="text-muted-foreground">
                  {lookedUpBooking.location}
                </p>
                <p className="text-muted-foreground">
                  {lookedUpBooking.checkin} → {lookedUpBooking.checkout}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {lookedUpBooking.id}
                </p>
                <Badge variant="secondary" className="text-[10px]">
                  {getBookingStatus(lookedUpBooking)}
                </Badge>
              </div>
            )}
            {searched && !lookedUpBooking && (
              <p className="text-muted-foreground text-sm font-body text-center py-3">
                No booking found for{" "}
                <span className="font-semibold text-foreground">
                  {lookupId}
                </span>
                . Please check the Booking ID and try again.
              </p>
            )}
          </CardContent>
        </Card>

        <section>
          <h2 className="font-display font-bold text-foreground text-lg mb-3">
            My Bookings
          </h2>
          {myBookings.length === 0 ? (
            <Card className="border-border shadow-xs">
              <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
                <CalendarDays className="w-10 h-10 text-muted-foreground/40" />
                <p className="font-body text-muted-foreground text-sm">
                  No bookings yet. Start exploring hidden stays!
                </p>
                <Button
                  size="sm"
                  onClick={() =>
                    navigate({ to: "/search", search: { category: "Hotels" } })
                  }
                  className="bg-primary text-primary-foreground font-body font-semibold"
                >
                  Explore Stays
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myBookings.map((booking, i) => {
                const status = getBookingStatus(booking);
                return (
                  <Card
                    key={booking.id}
                    data-ocid={`profile.booking.item.${i + 1}`}
                    className="border-border shadow-xs"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-bold text-foreground">
                            {booking.stayName}
                          </h3>
                          <p className="text-muted-foreground text-xs font-body">
                            {booking.location}
                          </p>
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground font-body">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {booking.checkin} → {booking.checkout}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground font-body">
                            <User className="w-3.5 h-3.5" />
                            {Number(booking.guests)} Guest
                            {Number(booking.guests) !== 1 ? "s" : ""}
                          </div>
                          <p className="text-[10px] text-muted-foreground font-mono mt-1">
                            {booking.id}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div
                            className={`flex items-center gap-1 text-xs font-body font-semibold ${
                              status === "Completed"
                                ? "text-emerald-600"
                                : status === "Active"
                                  ? "text-blue-600"
                                  : status === "Cancelled"
                                    ? "text-red-500"
                                    : "text-amber-600"
                            }`}
                          >
                            {status === "Upcoming" ? (
                              <Clock className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            {status}
                          </div>
                          {status === "Completed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              data-ocid={`profile.review.button.${i + 1}`}
                              onClick={() => handleLeaveReview(booking)}
                              className="text-[10px] font-body h-7 px-2.5 border-primary/30 text-primary hover:bg-primary/5 flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              Leave a Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
