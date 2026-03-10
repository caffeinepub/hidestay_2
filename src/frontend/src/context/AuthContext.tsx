import { createContext, useContext, useEffect, useState } from "react";

type Role = "customer" | "hotel_owner" | "super_admin" | null;

interface AuthUser {
  name: string;
  email: string;
}

interface AuthState {
  role: Role;
  user: AuthUser | null;
}

interface AuthContextValue extends AuthState {
  loginCustomer: (emailOrPhone: string, password: string) => Promise<boolean>;
  loginHotelOwner: (email: string, password: string) => Promise<boolean>;
  loginSuperAdmin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "hidestay_auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return { role: null, user: null };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const loginCustomer = async (
    emailOrPhone: string,
    password: string,
  ): Promise<boolean> => {
    if (!emailOrPhone.trim() || !password.trim()) return false;
    const name = emailOrPhone.includes("@")
      ? emailOrPhone.split("@")[0]
      : `Guest ${emailOrPhone.slice(-4)}`;
    setState({
      role: "customer",
      user: { name, email: emailOrPhone },
    });
    return true;
  };

  const loginHotelOwner = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    if (email === "owner@hidestay.com" && password === "hotel123") {
      setState({
        role: "hotel_owner",
        user: { name: "Hotel Owner", email },
      });
      return true;
    }
    return false;
  };

  const loginSuperAdmin = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    if (email === "admin@hidestay.com" && password === "admin123") {
      setState({
        role: "super_admin",
        user: { name: "Super Admin", email },
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setState({ role: null, user: null });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        loginCustomer,
        loginHotelOwner,
        loginSuperAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
