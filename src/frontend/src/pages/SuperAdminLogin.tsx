import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function SuperAdminLogin() {
  const { loginSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email/phone and password.");
      return;
    }
    setLoading(true);
    const ok = await loginSuperAdmin(email, password);
    setLoading(false);
    if (ok) {
      navigate({ to: "/super-admin" });
    } else {
      setError("Invalid credentials. Restricted access only.");
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
        data-ocid="super_admin_login.card"
      >
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-3 shadow-green">
            <ShieldCheck className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="font-display font-black text-xl text-foreground">
            Super Admin Login
          </h2>
          <p className="text-muted-foreground text-sm font-body mt-1">
            Restricted area – authorised personnel only
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-body text-sm font-medium">
                Email or Phone Number
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="admin@hidestay.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                data-ocid="super_admin_login.email.input"
                className="font-body"
                autoComplete="username"
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
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                data-ocid="super_admin_login.password.input"
                className="font-body"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p
                data-ocid="super_admin_login.error_state"
                className="text-destructive text-xs font-body bg-destructive/10 rounded-md px-3 py-2"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={loading}
              data-ocid="super_admin_login.submit_button"
              className="w-full bg-primary text-primary-foreground font-body font-semibold h-11 text-base"
            >
              <Lock className="w-4 h-4 mr-2" />
              {loading ? "Signing in..." : "Access Dashboard"}
            </Button>
          </form>
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => navigate({ to: "/dashboard" })}
              data-ocid="super_admin_login.back.link"
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
