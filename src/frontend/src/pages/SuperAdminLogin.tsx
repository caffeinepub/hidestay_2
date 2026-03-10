import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";

type View = "login" | "forgot" | "reset";

export default function SuperAdminLogin() {
  const { loginSuperAdmin, getAdminAccounts, resetAdminPassword } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState<View>("login");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Forgot state
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotError, setForgotError] = useState("");

  // Reset state
  const [verifiedIdentifier, setVerifiedIdentifier] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!email.trim() || !password.trim()) {
      setLoginError("Please enter your email/phone and password.");
      return;
    }
    setLoginLoading(true);
    const ok = await loginSuperAdmin(email, password);
    setLoginLoading(false);
    if (ok) {
      navigate({ to: "/super-admin" });
    } else {
      setLoginError("Invalid credentials. Restricted access only.");
    }
  };

  const handleVerifyIdentity = () => {
    setForgotError("");
    const id = forgotIdentifier.trim();
    if (!id) {
      setForgotError("Please enter your email or phone number.");
      return;
    }
    // Check root admin
    const ROOT_EMAIL = "admin@hidestay.com";
    const ROOT_PHONE = "9999000001";
    const admins = getAdminAccounts();
    const isRoot = id === ROOT_EMAIL || id === ROOT_PHONE;
    const isStored = admins.some((a) => a.email === id || a.phone === id);
    if (isRoot || isStored) {
      setVerifiedIdentifier(id);
      setView("reset");
    } else {
      setForgotError("No admin account found with this email or phone.");
    }
  };

  const handleResetPassword = async () => {
    setResetError("");
    if (newPassword.length < 6) {
      setResetError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }
    setResetLoading(true);
    await resetAdminPassword(verifiedIdentifier, newPassword);
    setResetLoading(false);
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      setNewPassword("");
      setConfirmPassword("");
      setForgotIdentifier("");
      setVerifiedIdentifier("");
      setView("login");
    }, 1500);
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
        {/* ── LOGIN VIEW ── */}
        {view === "login" && (
          <>
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
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="font-body text-sm font-medium"
                  >
                    Email or Phone Number
                  </Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="admin@hidestay.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setLoginError("");
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
                      setLoginError("");
                    }}
                    data-ocid="super_admin_login.password.input"
                    className="font-body"
                    autoComplete="current-password"
                  />
                </div>
                {loginError && (
                  <p
                    data-ocid="super_admin_login.error_state"
                    className="text-destructive text-xs font-body bg-destructive/10 rounded-md px-3 py-2"
                  >
                    {loginError}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={loginLoading}
                  data-ocid="super_admin_login.submit_button"
                  className="w-full bg-primary text-primary-foreground font-body font-semibold h-11 text-base"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {loginLoading ? "Signing in..." : "Access Dashboard"}
                </Button>
              </form>
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setForgotIdentifier("");
                    setForgotError("");
                    setView("forgot");
                  }}
                  data-ocid="super_admin_login.forgot.link"
                  className="text-primary text-sm font-body hover:underline transition-colors font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="mt-3 text-center">
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
          </>
        )}

        {/* ── FORGOT VIEW ── */}
        {view === "forgot" && (
          <>
            <CardHeader className="pb-2">
              <button
                type="button"
                onClick={() => {
                  setForgotIdentifier("");
                  setForgotError("");
                  setView("login");
                }}
                data-ocid="super_admin_login.forgot_back.button"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary text-sm font-body transition-colors mb-3"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-black text-xl text-foreground">
                    Reset Password
                  </h2>
                  <p className="text-muted-foreground text-xs font-body mt-0.5">
                    Verify your identity to continue
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-muted-foreground text-sm font-body mb-4">
                Enter your registered email or phone number to verify your
                identity.
              </p>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="forgot-identifier"
                    className="font-body text-sm font-medium"
                  >
                    Email or Phone Number
                  </Label>
                  <Input
                    id="forgot-identifier"
                    type="text"
                    placeholder="admin@hidestay.com"
                    value={forgotIdentifier}
                    onChange={(e) => {
                      setForgotIdentifier(e.target.value);
                      setForgotError("");
                    }}
                    data-ocid="super_admin_login.forgot.input"
                    className="font-body"
                  />
                </div>
                {forgotError && (
                  <p
                    data-ocid="super_admin_login.forgot.error_state"
                    className="text-destructive text-xs font-body bg-destructive/10 rounded-md px-3 py-2"
                  >
                    {forgotError}
                  </p>
                )}
                <Button
                  type="button"
                  onClick={handleVerifyIdentity}
                  data-ocid="super_admin_login.verify.button"
                  className="w-full bg-primary text-primary-foreground font-body font-semibold h-11"
                >
                  Verify Identity
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* ── RESET VIEW ── */}
        {view === "reset" && (
          <>
            <CardHeader className="pb-2">
              <button
                type="button"
                onClick={() => {
                  setNewPassword("");
                  setConfirmPassword("");
                  setResetError("");
                  setResetSuccess(false);
                  setView("forgot");
                }}
                data-ocid="super_admin_login.reset_back.button"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary text-sm font-body transition-colors mb-3"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-black text-xl text-foreground">
                    Set New Password
                  </h2>
                  <p className="text-muted-foreground text-xs font-body mt-0.5">
                    Choose a strong password
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {resetSuccess ? (
                <div
                  data-ocid="super_admin_login.reset.success_state"
                  className="text-center py-6"
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-display font-bold text-foreground">
                    Password Updated!
                  </p>
                  <p className="text-muted-foreground text-sm font-body mt-1">
                    Redirecting to login...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="new-password"
                      className="font-body text-sm font-medium"
                    >
                      New Password
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setResetError("");
                      }}
                      data-ocid="super_admin_login.new_password.input"
                      className="font-body"
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
                      placeholder="Repeat your new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setResetError("");
                      }}
                      data-ocid="super_admin_login.confirm_password.input"
                      className="font-body"
                    />
                  </div>
                  {resetError && (
                    <p
                      data-ocid="super_admin_login.reset.error_state"
                      className="text-destructive text-xs font-body bg-destructive/10 rounded-md px-3 py-2"
                    >
                      {resetError}
                    </p>
                  )}
                  <Button
                    type="button"
                    disabled={resetLoading}
                    onClick={handleResetPassword}
                    data-ocid="super_admin_login.reset.submit_button"
                    className="w-full bg-primary text-primary-foreground font-body font-semibold h-11"
                  >
                    {resetLoading ? "Updating..." : "Reset Password"}
                  </Button>
                </div>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
