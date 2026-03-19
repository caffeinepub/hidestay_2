import type { HotelOwner } from "@/backend";
import { createActorWithConfig } from "@/config";
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

export interface RegisteredCustomer {
  name: string;
  email: string;
  phone: string;
  password: string;
  disabled?: boolean;
  createdAt?: string;
}

export interface RegisteredOwner {
  name: string;
  email: string;
  phone: string;
  password: string;
  disabled?: boolean;
  createdAt?: string;
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
  registerHotelOwner: (
    name: string,
    email: string,
    phone: string,
    password: string,
  ) => Promise<{ success: boolean; owner?: RegisteredOwner }>;
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
  resetCustomerPassword: (
    emailOrPhone: string,
    newPassword: string,
  ) => Promise<boolean>;
  resetHotelOwnerPassword: (
    emailOrPhone: string,
    newPassword: string,
  ) => Promise<boolean>;
  checkCustomerExists: (emailOrPhone: string) => boolean;
  checkHotelOwnerExists: (emailOrPhone: string) => boolean;
  getAdminAccounts: () => AdminAccount[];
  getAllUsers: () => RegisteredCustomer[];
  getAllOwners: () => RegisteredOwner[];
  disableUser: (email: string) => void;
  enableUser: (email: string) => void;
  deleteUser: (email: string) => void;
  setHotelOwner: (owner: HotelOwner | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "hidestay_auth";
const CUSTOMERS_KEY = "hidestay_customers";
const HOTEL_OWNERS_KEY = "hidestay_hotel_owners";
const ADMINS_KEY = "hidestay_admins";
const ROOT_ADMIN_PASSWORD_KEY = "hidestay_root_admin_password";
const OWNER_PASSWORD_OVERRIDES_KEY = "hidestay_owner_pw_overrides";
const OWNER_DISABLED_KEY = "hidestay_owner_disabled";

const ROOT_ADMIN_EMAIL = "hidestayindiapvtltd@gmail.com";
const ROOT_ADMIN_PHONE = "9999000001";
const DEFAULT_ROOT_PASSWORD = "Bablu@1003";

// Demo owner credentials (always available)
const DEMO_OWNER_EMAIL = "owner@hidestay.com";
const DEMO_OWNER_DEFAULT_PASSWORD = "hotel123";

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

// Local cache for owners (for Super Admin listing and disable/enable)
function getLocalOwnerCache(): RegisteredOwner[] {
  try {
    const saved = localStorage.getItem(HOTEL_OWNERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [];
}

function saveLocalOwnerCache(owners: RegisteredOwner[]) {
  localStorage.setItem(HOTEL_OWNERS_KEY, JSON.stringify(owners));
}

function getDisabledOwners(): Set<string> {
  try {
    const saved = localStorage.getItem(OWNER_DISABLED_KEY);
    if (saved) return new Set(JSON.parse(saved));
  } catch {
    // ignore
  }
  return new Set();
}

function saveDisabledOwners(disabled: Set<string>) {
  localStorage.setItem(OWNER_DISABLED_KEY, JSON.stringify([...disabled]));
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

function getOwnerPasswordOverrides(): Record<string, string> {
  try {
    const saved = localStorage.getItem(OWNER_PASSWORD_OVERRIDES_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return {};
}

function saveOwnerPasswordOverrides(overrides: Record<string, string>) {
  localStorage.setItem(OWNER_PASSWORD_OVERRIDES_KEY, JSON.stringify(overrides));
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
      if (match.disabled) return false;
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
    // Check if account is disabled
    const disabledOwners = getDisabledOwners();
    if (disabledOwners.has(email.toLowerCase())) return false;

    // Check password overrides (for forgot password flow)
    const overrides = getOwnerPasswordOverrides();

    // Check demo owner
    if (email === DEMO_OWNER_EMAIL) {
      const validPassword =
        overrides[email.toLowerCase()] || DEMO_OWNER_DEFAULT_PASSWORD;
      if (password === validPassword) {
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
    }

    // Check password override first
    const overridePassword = overrides[email.toLowerCase()];
    if (overridePassword && overridePassword !== password) {
      // If there's an override and it doesn't match, reject immediately
      // unless we should also check backend - try backend below
    }
    if (overridePassword && overridePassword === password) {
      // Password override matches - authenticate via local cache or backend
      const cachedOwners = getLocalOwnerCache();
      const cachedMatch = cachedOwners.find(
        (o) => o.email === email || o.phone === email,
      );
      if (cachedMatch) {
        const ownerData: HotelOwner = {
          name: cachedMatch.name,
          email: cachedMatch.email,
          phone: cachedMatch.phone,
          password: "",
        };
        setState({
          role: "hotel_owner",
          user: { name: cachedMatch.name, email: cachedMatch.email },
          hotelOwner: ownerData,
        });
        return true;
      }
    }

    // Try backend authentication (primary source)
    try {
      const actor = await createActorWithConfig();
      const owner = await actor.loginOwner(email, password);
      // Success - update local cache
      const cachedOwners = getLocalOwnerCache();
      const existingIdx = cachedOwners.findIndex(
        (o) => o.email === owner.email,
      );
      if (existingIdx === -1) {
        cachedOwners.push({
          name: owner.name,
          email: owner.email,
          phone: owner.phone,
          password: "", // Don't cache password
          createdAt: new Date().toISOString(),
        });
        saveLocalOwnerCache(cachedOwners);
      }
      const ownerData: HotelOwner = {
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        password: "",
      };
      setState({
        role: "hotel_owner",
        user: { name: owner.name, email: owner.email },
        hotelOwner: ownerData,
      });
      return true;
    } catch {
      // Backend failed - try local cache as fallback
    }

    // Fallback: Check local cache
    const cachedOwners = getLocalOwnerCache();
    const match = cachedOwners.find(
      (o) => o.email === email || o.phone === email,
    );
    if (match) {
      if (match.disabled) return false;
      const effectivePassword =
        overrides[match.email.toLowerCase()] || match.password;
      if (password !== effectivePassword) return false;
      const ownerData: HotelOwner = {
        name: match.name,
        email: match.email,
        phone: match.phone,
        password: "",
      };
      setState({
        role: "hotel_owner",
        user: { name: match.name, email: match.email },
        hotelOwner: ownerData,
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
    customers.push({
      name,
      email,
      phone,
      password,
      createdAt: new Date().toISOString(),
    });
    saveRegisteredCustomers(customers);
    setState({ role: "customer", user: { name, email }, hotelOwner: null });
    return true;
  };

  const registerHotelOwner = async (
    name: string,
    email: string,
    phone: string,
    password: string,
  ): Promise<{ success: boolean; owner?: RegisteredOwner }> => {
    // Block demo owner email
    if (email === DEMO_OWNER_EMAIL) return { success: false };

    // Check local cache for duplicates first (fast check)
    const cachedOwners = getLocalOwnerCache();
    const existsLocally = cachedOwners.find(
      (o) => o.email === email || o.phone === phone,
    );
    if (existsLocally) return { success: false };

    // Register in backend (permanent storage)
    try {
      const actor = await createActorWithConfig();
      const owner = await actor.registerOwner(name, email, phone, password);

      // Also save to local cache for admin panel listing
      const newOwner: RegisteredOwner = {
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        password: "", // Don't store password in cache
        createdAt: new Date().toISOString(),
      };
      cachedOwners.push(newOwner);
      saveLocalOwnerCache(cachedOwners);

      return { success: true, owner: newOwner };
    } catch (err: any) {
      // If backend says email already registered, treat as duplicate
      const msg = String(err?.message || err);
      if (msg.toLowerCase().includes("already")) {
        return { success: false };
      }

      // Backend unavailable - fallback to local-only registration
      console.warn("Backend unavailable, registering locally:", msg);
      const newOwner: RegisteredOwner = {
        name,
        email,
        phone,
        password,
        createdAt: new Date().toISOString(),
      };
      cachedOwners.push(newOwner);
      saveLocalOwnerCache(cachedOwners);
      return { success: true, owner: newOwner };
    }
  };

  const registerAdminAccount = async (
    name: string,
    email: string,
    phone: string,
    password: string,
  ): Promise<boolean> => {
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
    if (
      emailOrPhone === ROOT_ADMIN_EMAIL ||
      emailOrPhone === ROOT_ADMIN_PHONE
    ) {
      localStorage.setItem(ROOT_ADMIN_PASSWORD_KEY, newPassword);
      return true;
    }
    const admins = getStoredAdmins();
    const idx = admins.findIndex(
      (a) => a.email === emailOrPhone || a.phone === emailOrPhone,
    );
    if (idx === -1) return false;
    admins[idx].password = newPassword;
    saveAdminAccounts(admins);
    return true;
  };

  const checkCustomerExists = (emailOrPhone: string): boolean => {
    const customers = getRegisteredCustomers();
    if (customers.length === 0) return true;
    return customers.some(
      (c) => c.email === emailOrPhone || c.phone === emailOrPhone,
    );
  };

  const resetCustomerPassword = async (
    emailOrPhone: string,
    newPassword: string,
  ): Promise<boolean> => {
    const customers = getRegisteredCustomers();
    if (customers.length === 0) return false;
    const idx = customers.findIndex(
      (c) => c.email === emailOrPhone || c.phone === emailOrPhone,
    );
    if (idx === -1) return false;
    customers[idx].password = newPassword;
    saveRegisteredCustomers(customers);
    return true;
  };

  const checkHotelOwnerExists = (emailOrPhone: string): boolean => {
    if (emailOrPhone === DEMO_OWNER_EMAIL) return true;
    const cachedOwners = getLocalOwnerCache();
    return cachedOwners.some(
      (o) => o.email === emailOrPhone || o.phone === emailOrPhone,
    );
  };

  const resetHotelOwnerPassword = async (
    emailOrPhone: string,
    newPassword: string,
  ): Promise<boolean> => {
    const key = emailOrPhone.toLowerCase();
    const overrides = getOwnerPasswordOverrides();

    // For demo owner, store override
    if (emailOrPhone === DEMO_OWNER_EMAIL) {
      overrides[key] = newPassword;
      saveOwnerPasswordOverrides(overrides);
      return true;
    }

    // Check locally cached owners
    const cachedOwners = getLocalOwnerCache();
    const idx = cachedOwners.findIndex(
      (o) => o.email === emailOrPhone || o.phone === emailOrPhone,
    );
    if (idx !== -1) {
      cachedOwners[idx].password = newPassword;
      saveLocalOwnerCache(cachedOwners);
      // Also clear any override
      delete overrides[key];
      saveOwnerPasswordOverrides(overrides);
      return true;
    }

    // Fallback: store override
    overrides[key] = newPassword;
    saveOwnerPasswordOverrides(overrides);
    return true;
  };

  const getAdminAccounts = (): AdminAccount[] => {
    return getStoredAdmins();
  };

  const getAllUsers = (): RegisteredCustomer[] => {
    return getRegisteredCustomers();
  };

  const getAllOwners = (): RegisteredOwner[] => {
    const owners = getLocalOwnerCache();
    // Merge disabled status
    const disabledOwners = getDisabledOwners();
    const ownersWithStatus = owners.map((o) => ({
      ...o,
      disabled: disabledOwners.has(o.email.toLowerCase()) || o.disabled,
    }));
    // Include demo owner
    const demoOwner: RegisteredOwner = {
      name: "Hotel Owner",
      email: DEMO_OWNER_EMAIL,
      phone: "9876543210",
      password: "",
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    const hasDemo = owners.some((o) => o.email === DEMO_OWNER_EMAIL);
    return hasDemo ? ownersWithStatus : [demoOwner, ...ownersWithStatus];
  };

  const disableUser = (email: string) => {
    // Try customers first
    const customers = getRegisteredCustomers();
    const cidx = customers.findIndex((c) => c.email === email);
    if (cidx !== -1) {
      customers[cidx].disabled = true;
      saveRegisteredCustomers(customers);
      return;
    }
    // Try hotel owners - use separate disabled set for backend owners
    const disabledOwners = getDisabledOwners();
    disabledOwners.add(email.toLowerCase());
    saveDisabledOwners(disabledOwners);
    // Also update local cache if present
    const owners = getLocalOwnerCache();
    const oidx = owners.findIndex((o) => o.email === email);
    if (oidx !== -1) {
      owners[oidx].disabled = true;
      saveLocalOwnerCache(owners);
    }
  };

  const enableUser = (email: string) => {
    const customers = getRegisteredCustomers();
    const cidx = customers.findIndex((c) => c.email === email);
    if (cidx !== -1) {
      customers[cidx].disabled = false;
      saveRegisteredCustomers(customers);
      return;
    }
    // Remove from disabled owners set
    const disabledOwners = getDisabledOwners();
    disabledOwners.delete(email.toLowerCase());
    saveDisabledOwners(disabledOwners);
    // Also update local cache if present
    const owners = getLocalOwnerCache();
    const oidx = owners.findIndex((o) => o.email === email);
    if (oidx !== -1) {
      owners[oidx].disabled = false;
      saveLocalOwnerCache(owners);
    }
  };

  const deleteUser = (email: string) => {
    const customers = getRegisteredCustomers();
    const filtered = customers.filter((c) => c.email !== email);
    if (filtered.length !== customers.length) {
      saveRegisteredCustomers(filtered);
      return;
    }
    const owners = getLocalOwnerCache();
    const filteredOwners = owners.filter((o) => o.email !== email);
    saveLocalOwnerCache(filteredOwners);
    // Also remove from disabled set
    const disabledOwners = getDisabledOwners();
    disabledOwners.delete(email.toLowerCase());
    saveDisabledOwners(disabledOwners);
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
        registerHotelOwner,
        registerAdminAccount,
        resetAdminPassword,
        resetCustomerPassword,
        resetHotelOwnerPassword,
        checkCustomerExists,
        checkHotelOwnerExists,
        getAdminAccounts,
        getAllUsers,
        getAllOwners,
        disableUser,
        enableUser,
        deleteUser,
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
