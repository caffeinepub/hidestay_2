import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { useState } from "react";

export default function CustomerRegister() {
  const { registerCustomer } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const ok = await registerCustomer(
      name.trim(),
      email.trim(),
      phone.trim(),
      password,
    );
    setLoading(false);

    if (ok) {
      navigate({ to: "/profile" });
    } else {
      setError("An account with this email or phone already exists.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background flex flex-col items-center justify-center px-4 py-8">
      {/* Branding */}
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
        data-ocid="customer_register.card"
      >
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-3 shadow-green">
            <UserPlus className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="font-display font-black text-xl text-foreground">
            Create Account
          </h2>
          <p className="text-muted-foreground text-sm font-body mt-1">
            Join HIDESTAY to start booking
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
                placeholder="Arjun Sharma"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                data-ocid="customer_register.name.input"
                className="font-body"
                autoComplete="name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-body text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                data-ocid="customer_register.email.input"
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
                placeholder="9876543210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError("");
                }}
                data-ocid="customer_register.phone.input"
                className="font-body"
                autoComplete="tel"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="font-body text-sm font-medium"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                data-ocid="customer_register.password.input"
                className="font-body"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="font-body text-sm font-medium"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                data-ocid="customer_register.confirm_password.input"
                className="font-body"
                autoComplete="new-password"
              />
            </div>
            {error && (
              <p
                data-ocid="customer_register.error_state"
                className="text-destructive text-xs font-body bg-destructive/10 rounded-md px-3 py-2"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={loading}
              data-ocid="customer_register.submit_button"
              className="w-full bg-primary text-primary-foreground font-body font-semibold h-11 text-base"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-5 flex flex-col gap-2 text-center">
            <button
              type="button"
              onClick={() => navigate({ to: "/login/customer" })}
              data-ocid="customer_register.login.link"
              className="text-primary text-sm font-body font-medium hover:underline transition-colors"
            >
              Already have an account? Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/dashboard" })}
              data-ocid="customer_register.back.link"
              className="text-muted-foreground text-sm font-body hover:text-primary transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
