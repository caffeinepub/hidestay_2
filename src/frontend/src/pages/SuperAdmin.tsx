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
import {
  Building2,
  Download,
  IndianRupee,
  Lock,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";

const MOCK_BOOKINGS = [
  {
    id: "HIDE-20260301-1421",
    guest: "Priya Sharma",
    stay: "Mountain Dew Resort",
    date: "2026-03-01",
    amount: "₹13,500",
    status: "Confirmed",
  },
  {
    id: "HIDE-20260303-2834",
    guest: "Rahul Verma",
    stay: "Green Valley Homestay",
    date: "2026-03-03",
    amount: "₹3,600",
    status: "Confirmed",
  },
  {
    id: "HIDE-20260305-3910",
    guest: "Anjali Patel",
    stay: "City Hub Hotel",
    date: "2026-03-05",
    amount: "₹9,600",
    status: "Pending",
  },
  {
    id: "HIDE-20260307-4512",
    guest: "Vikram Singh",
    stay: "Azure Bay Resort",
    date: "2026-03-07",
    amount: "₹63,998",
    status: "Confirmed",
  },
  {
    id: "HIDE-20260309-5671",
    guest: "Meera Nair",
    stay: "Grandma Rosa's Cottage",
    date: "2026-03-09",
    amount: "₹6,299",
    status: "Completed",
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

export default function SuperAdmin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (password === "admin123") {
      setAuthed(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 pb-24">
        <Card className="w-full max-w-sm shadow-green border-border">
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <CardTitle className="font-display text-xl text-foreground">
              Super Admin Login
            </CardTitle>
            <p className="text-muted-foreground text-sm font-body mt-1">
              Restricted area. Authorised personnel only.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-password" className="font-body text-sm">
                Admin Password
              </Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                data-ocid="super_admin.password.input"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="font-body"
              />
            </div>
            {error && (
              <p
                data-ocid="super_admin.login.error_state"
                className="text-destructive text-xs font-body"
              >
                {error}
              </p>
            )}
            <Button
              className="w-full bg-primary text-primary-foreground font-body font-semibold"
              data-ocid="super_admin.login.submit_button"
              onClick={handleLogin}
            >
              Access Dashboard
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
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-foreground text-xl">
              Super Admin Panel
            </h1>
            <p className="text-muted-foreground text-sm font-body">
              HIDESTAY Control Centre
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            data-ocid="super_admin.export.button"
            className="font-body text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export Report
          </Button>
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

        {/* Bookings Table */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg text-foreground">
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table data-ocid="super_admin.bookings.table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-body text-xs">
                      Booking ID
                    </TableHead>
                    <TableHead className="font-body text-xs">Guest</TableHead>
                    <TableHead className="font-body text-xs">Stay</TableHead>
                    <TableHead className="font-body text-xs">Date</TableHead>
                    <TableHead className="font-body text-xs">Amount</TableHead>
                    <TableHead className="font-body text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_BOOKINGS.map((booking, i) => (
                    <TableRow
                      key={booking.id}
                      data-ocid={`super_admin.bookings.row.${i + 1}`}
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
                        {booking.date}
                      </TableCell>
                      <TableCell className="font-body text-sm font-semibold">
                        {booking.amount}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            booking.status === "Confirmed"
                              ? "default"
                              : booking.status === "Completed"
                                ? "secondary"
                                : "outline"
                          }
                          className={`text-[10px] font-body ${
                            booking.status === "Confirmed"
                              ? "bg-primary text-primary-foreground"
                              : ""
                          }`}
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
      </main>
    </div>
  );
}
