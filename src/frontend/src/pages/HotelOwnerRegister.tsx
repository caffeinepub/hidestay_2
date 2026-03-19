import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { Building2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function HotelOwnerRegister() {
  const { registerHotelOwner, loginHotelOwnerWithData } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password.trim()
    ) {
      setError("All fields are required.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const result = await registerHotelOwner(
        form.name.trim(),
        form.email.trim(),
        form.phone.trim(),
        form.password,
      );

      if (!result.success) {
        setError("An account with this email or phone already exists.");
        return;
      }

      // Log the owner in immediately after registration
      loginHotelOwnerWithData({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: "",
      });

      toast.success("Account created! Welcome to HIDESTAY.");
      navigate({ to: "/hotel-admin" });
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="font-display font-black text-3xl text-primary tracking-tight">
          HIDESTAY
        </h1>
        <p className="text-muted-foreground text-sm font-body mt-1">
          Find Your Perfect Stay
        </p>
      </div>

      <Card
        className="w-full max-w-sm shadow-green border-border"
        data-ocid="hotel_owner_register.card"
      >
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-3 shadow-green">
            <Building2 className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="font-display font-black text-xl text-foreground">
            Create Owner Account
          </h2>
          <p className="text-muted-foreground text-sm font-body mt-1">
            Join HIDESTAY and list your property
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="font-body text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Rajesh Kumar"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                data-ocid="hotel_owner_register.name.input"
                className="font-body"
                autoComplete="name"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="reg-email"
                className="font-body text-sm font-medium"
              >
                Email
              </Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="rajesh@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                data-ocid="hotel_owner_register.email.input"
                className="font-body"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="font-body text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                data-ocid="hotel_owner_register.phone.input"
                className="font-body"
                autoComplete="tel"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="reg-password"
                className="font-body text-sm font-medium"
              >
                Password
              </Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                data-ocid="hotel_owner_register.password.input"
                className="font-body"
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="confirm-password"
                className="font-body text-sm font-medium"
              >
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                data-ocid="hotel_owner_register.confirm_password.input"
                className="font-body"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p
                data-ocid="hotel_owner_register.error_state"
                className="text-destructive text-xs font-body bg-destructive/10 rounded-md px-3 py-2"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              data-ocid="hotel_owner_register.submit_button"
              className="w-full bg-primary text-primary-foreground font-body font-semibold h-11 text-base"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm font-body text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate({ to: "/login/hotel-owner" })}
                data-ocid="hotel_owner_register.login.link"
                className="text-primary font-semibold hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
