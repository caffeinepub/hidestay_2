import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  LogOut,
  Mail,
  Search,
  User,
  UserCircle,
} from "lucide-react";
import { useState } from "react";

const MOCK_PAST_BOOKINGS = [
  {
    id: "HIDE-20260201-8821",
    stayName: "Mountain Dew Resort",
    location: "Manali, Himachal Pradesh",
    checkin: "2026-02-01",
    checkout: "2026-02-04",
    status: "Completed",
  },
  {
    id: "HIDE-20260115-4432",
    stayName: "Grandma Rosa's Cottage",
    location: "Ooty, Tamil Nadu",
    checkin: "2026-01-15",
    checkout: "2026-01-18",
    status: "Completed",
  },
];

export default function ProfilePage() {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const [lookupId, setLookupId] = useState("");
  const [searched, setSearched] = useState(false);

  const handleLookup = () => {
    if (lookupId.trim()) setSearched(true);
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/dashboard" });
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
      {/* Header */}
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
        {/* Profile Card */}
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

        {/* Booking Lookup */}
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
            {searched && (
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

        {/* Recent Activity */}
        <section>
          <h2 className="font-display font-bold text-foreground text-lg mb-3">
            Recent Stays
          </h2>
          <div className="space-y-3">
            {MOCK_PAST_BOOKINGS.map((booking, i) => (
              <Card
                key={booking.id}
                data-ocid={`profile.booking.item.${i + 1}`}
                className="border-border shadow-xs"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
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
                      <p className="text-[10px] text-muted-foreground font-mono mt-1">
                        {booking.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-body font-semibold flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      {booking.status}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
