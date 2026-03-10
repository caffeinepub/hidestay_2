import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useActor } from "@/hooks/useActor";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building2, CheckCircle, Lock } from "lucide-react";
import { useState } from "react";

type Step = "login" | "forgot_identity" | "forgot_reset" | "forgot_success";

export default function HotelOwnerLogin() {
  const {
    loginHotelOwner,
    loginHotelOwnerWithData,
    checkHotelOwnerExists,
    resetHotelOwnerPassword,
  } = useAuth();
  const { actor } = useActor();
  const navigate = useNavigate();

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [step, setStep] = useState<Step>("login");
  const [forgotIdentity, setForgotIdentity] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);

    // Try hardcoded fallback first
    if (email === "owner@hidestay.com") {
      const ok = await loginHotelOwner(email, password);
      if (ok) {
        navigate({ to: "/hotel-admin" });
        setLoading(false);
        return;
      }
    }

    // Try backend
    try {
      if (actor) {
        const owner = await actor.loginOwner(email, password);
        loginHotelOwnerWithData(owner);
        navigate({ to: "/hotel-admin" });
        setLoading(false);
        return;
      }
    } catch {
      // fall through to error
    }

    // Also try local fallback
    const ok = await loginHotelOwner(email, password);
    if (ok) {
      navigate({ to: "/hotel-admin" });
    } else {
      setError("Invalid credentials. Please check your email and password.");
    }
    setLoading(false);
  };

  const handleForgotIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    if (!forgotIdentity.trim()) {
      setForgotError("Please enter your registered email.");
      return;
    }
    const exists = checkHotelOwnerExists(forgotIdentity.trim());
    if (!exists) {
      setForgotError("No hotel owner account found with that email.");
      return;
    }
    setStep("forgot_reset");
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setForgotError("Please fill in both password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setForgotError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError("Passwords do not match.");
      return;
    }
    setForgotLoading(true);
    const ok = await resetHotelOwnerPassword(
      forgotIdentity.trim(),
      newPassword,
    );
    setForgotLoading(false);
    if (ok) {
      setStep("forgot_success");
    } else {
      setForgotError("Could not reset password. Please try again.");
    }
  };

  const resetForgotFlow = () => {
    setStep("login");
    setForgotIdentity("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotError("");
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
        data-ocid="hotel_owner_login.card"
      >
        {/* ── LOGIN STEP ── */}
        {step === "login" && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-3 shadow-green">
                <Building2 className="w-7 h-7 text-primary-foreground" />
              </div>
              <h2 className="font-display font-black text-xl text-foreground">
                Hotel Owner Login
              </h2>
              <p className="text-muted-foreground text-sm font-body mt-1">
                Access your property management dashboard
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="font-body text-sm font-medium"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="owner@hidestay.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    data-ocid="hotel_owner_login.email.input"
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    data-ocid="hotel_owner_login.password.input"
                    className="font-body"
                    autoComplete="current-password"
                  />
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("forgot_identity");
                        setError("");
                      }}
                      data-ocid="hotel_owner_login.forgot_password.button"
                      className="text-primary text-xs font-body font-medium hover:underline transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
                {error && (
                  <p
                    data-ocid="hotel_owner_login.error_state"
                    className="text-destructive text-xs font-body bg-destructive/10 rounded-md px-3 py-2"
                  >
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  data-ocid="hotel_owner_login.submit_button"
                  className="w-full bg-primary text-primary-foreground font-body font-semibold h-11 text-base"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm font-body text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/register/hotel-owner" })}
                    data-ocid="hotel_owner_login.register.link"
                    className="text-primary font-semibold hover:underline"
                  >
                    Register as Hotel Owner
                  </button>
                </p>
              </div>

              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => navigate({ to: "/dashboard" })}
                  data-ocid="hotel_owner_login.back.link"
                  className="text-muted-foreground text-sm font-body hover:text-primary transition-colors"
                >
                  ← Back to Home
                </button>
              </div>
            </CardContent>
          </>
        )}

        {/* ── FORGOT: ENTER IDENTITY ── */}
        {step === "forgot_identity" && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-display font-black text-xl text-foreground">
                Forgot Password
              </h2>
              <p className="text-muted-foreground text-sm font-body mt-1">
                Enter your registered email address
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleForgotIdentitySubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="forgotIdentity"
                    className="font-body text-sm font-medium"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="forgotIdentity"
                    type="text"
                    placeholder="owner@hidestay.com"
                    value={forgotIdentity}
                    onChange={(e) => {
                      setForgotIdentity(e.target.value);
                      setForgotError("");
                    }}
                    data-ocid="hotel_owner_login.forgot_identity.input"
                    className="font-body"
                    autoFocus
                  />
                </div>
                {forgotError && (
                  <p
                    data-ocid="hotel_owner_login.forgot_error_state"
                    className="text-destructive text-xs font-body bg-destructive/10 rounded-md px-3 py-2"
                  >
                    {forgotError}
                  </p>
                )}
                <Button
                  type="submit"
                  data-ocid="hotel_owner_login.forgot_continue.button"
                  className="w-full bg-primary text-primary-foreground font-body font-semibold h-11 text-base"
                >
                  Continue
                </Button>
              </form>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={resetForgotFlow}
                  data-ocid="hotel_owner_login.forgot_back.button"
                  className="text-muted-foreground text-sm font-body hover:text-primary flex items-center gap-1 mx-auto transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </button>
              </div>
            </CardContent>
          </>
        )}

        {/* ── FORGOT: NEW PASSWORD ── */}
        {step === "forgot_reset" && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-display font-black text-xl text-foreground">
                Create New Password
              </h2>
              <p className="text-muted-foreground text-sm font-body mt-1">
                Set a new password for your account
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="newPassword"
                    className="font-body text-sm font-medium"
                  >
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setForgotError("");
                    }}
                    data-ocid="hotel_owner_login.new_password.input"
                    className="font-body"
                    autoFocus
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
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setForgotError("");
                    }}
                    data-ocid="hotel_owner_login.confirm_password.input"
                    className="font-body"
                  />
                </div>
                {forgotError && (
                  <p
                    data-ocid="hotel_owner_login.reset_error_state"
                    className="text-destructive text-xs font-body bg-destructive/10 rounded-md px-3 py-2"
                  >
                    {forgotError}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={forgotLoading}
                  data-ocid="hotel_owner_login.reset_submit.button"
                  className="w-full bg-primary text-primary-foreground font-body font-semibold h-11 text-base"
                >
                  {forgotLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={resetForgotFlow}
                  data-ocid="hotel_owner_login.reset_back.button"
                  className="text-muted-foreground text-sm font-body hover:text-primary flex items-center gap-1 mx-auto transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </button>
              </div>
            </CardContent>
          </>
        )}

        {/* ── FORGOT: SUCCESS ── */}
        {step === "forgot_success" && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <CheckCircle className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-display font-black text-xl text-foreground">
                Password Updated
              </h2>
              <p className="text-muted-foreground text-sm font-body mt-1">
                Your password has been changed successfully.
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <Button
                type="button"
                onClick={resetForgotFlow}
                data-ocid="hotel_owner_login.success_back.button"
                className="w-full bg-primary text-primary-foreground font-body font-semibold h-11 text-base"
              >
                Back to Login
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
