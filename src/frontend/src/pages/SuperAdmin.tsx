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
  Building2,
  Check,
  Download,
  IndianRupee,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

function PropertyApprovalCard({
  prop,
  index,
  onApprove,
  onReject,
  approving,
  rejecting,
}: {
  prop: Property;
  index: number;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  approving: boolean;
  rejecting: boolean;
}) {
  return (
    <Card
      data-ocid={`super_admin.pending.item.${index + 1}`}
      className="border-border shadow-xs"
    >
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {prop.imageUrls.length > 0 ? (
            <img
              src={prop.imageUrls[0]}
              alt={prop.propertyName}
              className="w-full sm:w-24 h-28 sm:h-20 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-full sm:w-24 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-display font-bold text-foreground">
                  {prop.propertyName}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground font-body">
                  <MapPin className="w-3 h-3" />
                  {prop.city} · {prop.propertyType}
                </div>
              </div>
              <span className="font-display font-bold text-primary">
                ₹{Number(prop.pricePerNight).toLocaleString("en-IN")}/night
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-body mt-1 line-clamp-2">
              {prop.description}
            </p>
            <p className="text-xs text-muted-foreground font-body mt-1">
              Owner: {prop.ownerEmail}
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                disabled={approving || rejecting}
                onClick={() => onApprove(prop.id)}
                data-ocid={`super_admin.pending.approve_button.${index + 1}`}
                className="bg-green-600 hover:bg-green-700 text-white font-body text-xs h-8"
              >
                {approving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5 mr-1" />
                )}
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={approving || rejecting}
                onClick={() => onReject(prop.id)}
                data-ocid={`super_admin.pending.delete_button.${index + 1}`}
                className="text-destructive border-destructive/40 hover:bg-destructive hover:text-white font-body text-xs h-8"
              >
                {rejecting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <X className="w-3.5 h-3.5 mr-1" />
                )}
                Reject
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
  // Force re-render after creating account
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

      {/* Create Form */}
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

      {/* Admin Accounts List */}
      <div className="space-y-3">
        {/* Root Admin */}
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

        {/* Stored Admins */}
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
  const { actor } = useActor();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: pendingProperties = [], isLoading: pendingLoading } = useQuery<
    Property[]
  >({
    queryKey: ["pendingProperties"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPendingProperties();
    },
    enabled: !!actor && role === "super_admin",
  });

  const { data: approvedProperties = [], isLoading: approvedLoading } =
    useQuery<Property[]>({
      queryKey: ["approvedProperties"],
      queryFn: async () => {
        if (!actor) return [];
        return actor.getAllApprovedProperties();
      },
      enabled: !!actor && role === "super_admin",
    });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.approveProperty(id);
    },
    onSuccess: () => {
      toast.success("Property approved!");
      queryClient.invalidateQueries({ queryKey: ["pendingProperties"] });
      queryClient.invalidateQueries({ queryKey: ["approvedProperties"] });
    },
    onError: () => toast.error("Failed to approve property."),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.rejectProperty(id);
    },
    onSuccess: () => {
      toast.success("Property rejected.");
      queryClient.invalidateQueries({ queryKey: ["pendingProperties"] });
    },
    onError: () => toast.error("Failed to reject property."),
  });

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
              value="pending"
              data-ocid="super_admin.pending.tab"
              className="relative"
            >
              Property Approvals
              {pendingProperties.length > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {pendingProperties.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" data-ocid="super_admin.approved.tab">
              Approved Properties
            </TabsTrigger>
            <TabsTrigger value="admins" data-ocid="super_admin.admins.tab">
              Admin Accounts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
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
                        <TableHead className="font-body text-xs">
                          Guest
                        </TableHead>
                        <TableHead className="font-body text-xs">
                          Stay
                        </TableHead>
                        <TableHead className="font-body text-xs">
                          Date
                        </TableHead>
                        <TableHead className="font-body text-xs">
                          Amount
                        </TableHead>
                        <TableHead className="font-body text-xs">
                          Status
                        </TableHead>
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
          </TabsContent>

          <TabsContent value="pending">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-foreground text-lg">
                  Pending Properties
                  {pendingProperties.length > 0 && (
                    <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                      {pendingProperties.length}
                    </span>
                  )}
                </h2>
              </div>
              {pendingLoading ? (
                <div
                  data-ocid="super_admin.pending.loading_state"
                  className="flex items-center justify-center py-12"
                >
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : pendingProperties.length === 0 ? (
                <div
                  data-ocid="super_admin.pending.empty_state"
                  className="text-center py-12 text-muted-foreground font-body"
                >
                  <Check className="w-10 h-10 mx-auto mb-3 text-green-500" />
                  <p className="font-display font-bold text-foreground">
                    All caught up!
                  </p>
                  <p className="text-sm mt-1">No pending property approvals.</p>
                </div>
              ) : (
                pendingProperties.map((prop, i) => (
                  <PropertyApprovalCard
                    key={prop.id}
                    prop={prop}
                    index={i}
                    onApprove={(id) => approveMutation.mutate(id)}
                    onReject={(id) => rejectMutation.mutate(id)}
                    approving={
                      approveMutation.isPending &&
                      approveMutation.variables === prop.id
                    }
                    rejecting={
                      rejectMutation.isPending &&
                      rejectMutation.variables === prop.id
                    }
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="approved">
            <div className="space-y-4">
              <h2 className="font-display font-bold text-foreground text-lg">
                Approved Properties
                <span className="ml-2 text-sm font-body text-muted-foreground font-normal">
                  ({approvedProperties.length})
                </span>
              </h2>
              {approvedLoading ? (
                <div
                  data-ocid="super_admin.approved.loading_state"
                  className="flex items-center justify-center py-12"
                >
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : approvedProperties.length === 0 ? (
                <div
                  data-ocid="super_admin.approved.empty_state"
                  className="text-center py-12 text-muted-foreground font-body"
                >
                  <Building2 className="w-10 h-10 mx-auto mb-3 text-primary/30" />
                  <p className="text-sm">No approved properties yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {approvedProperties.map((prop, i) => (
                    <Card
                      key={prop.id}
                      data-ocid={`super_admin.approved.item.${i + 1}`}
                      className="border-border shadow-xs"
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
                          <div className="min-w-0">
                            <h3 className="font-display font-bold text-foreground truncate">
                              {prop.propertyName}
                            </h3>
                            <p className="text-muted-foreground text-xs font-body">
                              {prop.city} · {prop.propertyType}
                            </p>
                            <p className="text-primary font-semibold text-sm font-body mt-1">
                              ₹
                              {Number(prop.pricePerNight).toLocaleString(
                                "en-IN",
                              )}
                              /night
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="admins">
            <AdminAccountsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
