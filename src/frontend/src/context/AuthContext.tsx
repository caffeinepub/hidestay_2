import type { HotelOwner } from "@/backend";
import { createContext, useContext, useEffect, useState } from "react";

type Role = "customer" | "hotel_owner" | "super_admin" | null;

interface AuthUser {
  name: string;
  email: string;
}

interface AuthState {
  role: Role;
  user: AuthUser | null;
  hotelOwner: HotelOwner | null;
}

interface RegisteredCustomer {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AdminAccount {
  name: string;
  email: string;
  phone: string;
  password: string;
  isRoot?: boolean;
}

interface AuthContextValue extends AuthState {
  isOwnerLoggedIn: boolean;
  loginCustomer: (emailOrPhone: string, password: string) => Promise<boolean>;
  loginHotelOwner: (email: string, password: string) => Promise<boolean>;
  loginHotelOwnerWithData: (owner: HotelOwner) => void;
  loginSuperAdmin: (emailOrPhone: string, password: string) => Promise<boolean>;
  registerCustomer: (
    name: string,
    email: string,
    phone: string,
    password: string,
  ) => Promise<boolean>;
  registerAdminAccount: (
    name: string,
    email: string,
    phone: string,
    password: string,
  ) => Promise<boolean>;
  resetAdminPassword: (
    emailOrPhone: string,
    newPassword: string,
  ) => Promise<boolean>;
  getAdminAccounts: () => AdminAccount[];
  setHotelOwner: (owner: HotelOwner | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "hidestay_auth";
const CUSTOMERS_KEY = "hidestay_customers";
const ADMINS_KEY = "hidestay_admins";
const ROOT_ADMIN_PASSWORD_KEY = "hidestay_root_admin_password";

const ROOT_ADMIN_EMAIL = "admin@hidestay.com";
const ROOT_ADMIN_PHONE = "9999000001";
const DEFAULT_ROOT_PASSWORD = "admin123";

function getRegisteredCustomers(): RegisteredCustomer[] {
  try {
    const saved = localStorage.getItem(CUSTOMERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [];
}

function saveRegisteredCustomers(customers: RegisteredCustomer[]) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

function getStoredAdmins(): AdminAccount[] {
  try {
    const saved = localStorage.getItem(ADMINS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [];
}

function saveAdminAccounts(admins: AdminAccount[]) {
  localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
}

function getRootAdminPassword(): string {
  return localStorage.getItem(ROOT_ADMIN_PASSWORD_KEY) || DEFAULT_ROOT_PASSWORD;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return { role: null, user: null, hotelOwner: null };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const loginCustomer = async (
    emailOrPhone: string,
    password: string,
  ): Promise<boolean> => {
    if (!emailOrPhone.trim() || !password.trim()) return false;

    const customers = getRegisteredCustomers();

    if (customers.length === 0) {
      const name = emailOrPhone.includes("@")
        ? emailOrPhone.split("@")[0]
        : `Guest ${emailOrPhone.slice(-4)}`;
      setState({
        role: "customer",
        user: { name, email: emailOrPhone },
        hotelOwner: null,
      });
      return true;
    }

    const match = customers.find(
      (c) =>
        (c.email === emailOrPhone || c.phone === emailOrPhone) &&
        c.password === password,
    );
    if (match) {
      setState({
        role: "customer",
        user: { name: match.name, email: match.email },
        hotelOwner: null,
      });
      return true;
    }
    return false;
  };

  const loginHotelOwner = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    if (email === "owner@hidestay.com" && password === "hotel123") {
      const syntheticOwner: HotelOwner = {
        name: "Hotel Owner",
        email,
        phone: "",
        password: "",
      };
      setState({
        role: "hotel_owner",
        user: { name: "Hotel Owner", email },
        hotelOwner: syntheticOwner,
      });
      return true;
    }
    return false;
  };

  const loginHotelOwnerWithData = (owner: HotelOwner) => {
    setState({
      role: "hotel_owner",
      user: { name: owner.name, email: owner.email },
      hotelOwner: owner,
    });
  };

  const setHotelOwner = (owner: HotelOwner | null) => {
    setState((prev) => ({ ...prev, hotelOwner: owner }));
  };

  const loginSuperAdmin = async (
    emailOrPhone: string,
    password: string,
  ): Promise<boolean> => {
    // Check root admin
    const rootPassword = getRootAdminPassword();
    if (
      (emailOrPhone === ROOT_ADMIN_EMAIL ||
        emailOrPhone === ROOT_ADMIN_PHONE) &&
      password === rootPassword
    ) {
      setState({
        role: "super_admin",
        user: { name: "Super Admin", email: ROOT_ADMIN_EMAIL },
        hotelOwner: null,
      });
      return true;
    }
    // Check stored admins
    const admins = getStoredAdmins();
    const match = admins.find(
      (a) =>
        (a.email === emailOrPhone || a.phone === emailOrPhone) &&
        a.password === password,
    );
    if (match) {
      setState({
        role: "super_admin",
        user: { name: match.name, email: match.email },
        hotelOwner: null,
      });
      return true;
    }
    return false;
  };

  const registerCustomer = async (
    name: string,
    email: string,
    phone: string,
    password: string,
  ): Promise<boolean> => {
    const customers = getRegisteredCustomers();
    const exists = customers.find(
      (c) => c.email === email || c.phone === phone,
    );
    if (exists) return false;
    customers.push({ name, email, phone, password });
    saveRegisteredCustomers(customers);
    setState({ role: "customer", user: { name, email }, hotelOwner: null });
    return true;
  };

  const registerAdminAccount = async (
    name: string,
    email: string,
    phone: string,
    password: string,
  ): Promise<boolean> => {
    // Check against root admin
    if (email === ROOT_ADMIN_EMAIL || phone === ROOT_ADMIN_PHONE) return false;
    const admins = getStoredAdmins();
    const exists = admins.find((a) => a.email === email || a.phone === phone);
    if (exists) return false;
    admins.push({ name, email, phone, password });
    saveAdminAccounts(admins);
    return true;
  };

  const resetAdminPassword = async (
    emailOrPhone: string,
    newPassword: string,
  ): Promise<boolean> => {
    // Root admin
    if (
      emailOrPhone === ROOT_ADMIN_EMAIL ||
      emailOrPhone === ROOT_ADMIN_PHONE
    ) {
      localStorage.setItem(ROOT_ADMIN_PASSWORD_KEY, newPassword);
      return true;
    }
    // Stored admins
    const admins = getStoredAdmins();
    const idx = admins.findIndex(
      (a) => a.email === emailOrPhone || a.phone === emailOrPhone,
    );
    if (idx === -1) return false;
    admins[idx].password = newPassword;
    saveAdminAccounts(admins);
    return true;
  };

  const getAdminAccounts = (): AdminAccount[] => {
    return getStoredAdmins();
  };

  const logout = () => {
    setState({ role: null, user: null, hotelOwner: null });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isOwnerLoggedIn:
          state.role === "hotel_owner" && state.hotelOwner !== null,
        loginCustomer,
        loginHotelOwner,
        loginHotelOwnerWithData,
        loginSuperAdmin,
        registerCustomer,
        registerAdminAccount,
        resetAdminPassword,
        getAdminAccounts,
        setHotelOwner,
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
