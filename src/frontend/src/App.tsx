import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouterState,
} from "@tanstack/react-router";
import BottomNav from "./components/BottomNav";
import BookingConfirmation from "./pages/BookingConfirmation";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerRegister from "./pages/CustomerRegister";
import Dashboard from "./pages/Dashboard";
import HelpSupport from "./pages/HelpSupport";
import HotelAdmin from "./pages/HotelAdmin";
import HotelOwnerLogin from "./pages/HotelOwnerLogin";
import HotelOwnerRegister from "./pages/HotelOwnerRegister";
import ProfilePage from "./pages/ProfilePage";
import SplashScreen from "./pages/SplashScreen";
import StayDetails from "./pages/StayDetails";
import StayResults from "./pages/StayResults";
import StaySearch from "./pages/StaySearch";
import SuperAdmin from "./pages/SuperAdmin";
import SuperAdminLogin from "./pages/SuperAdminLogin";

const queryClient = new QueryClient();

const LOGIN_PATHS = [
  "/login/customer",
  "/login/hotel-owner",
  "/login/super-admin",
  "/register",
  "/register/hotel-owner",
];

function RootLayout() {
  const { location } = useRouterState();
  const isSplash = location.pathname === "/";
  const isLogin = LOGIN_PATHS.includes(location.pathname);
  return (
    <>
      <Outlet />
      {!isSplash && !isLogin && <BottomNav />}
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const splashRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: SplashScreen,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: Dashboard,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  component: StaySearch,
  validateSearch: (search) =>
    search as {
      category?: string;
    },
});

const resultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/results",
  component: StayResults,
  validateSearch: (search) =>
    search as {
      category?: string;
      destination?: string;
      checkin?: string;
      checkout?: string;
      adults?: number;
      children?: number;
      rooms?: number;
    },
});

const detailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/details",
  component: StayDetails,
  validateSearch: (search) =>
    search as {
      id?: string;
      category?: string;
      name?: string;
      location?: string;
      price?: string;
      rating?: number;
    },
});

const confirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/confirmation",
  component: BookingConfirmation,
  validateSearch: (search) =>
    search as {
      bookingId?: string;
      stayName?: string;
      location?: string;
      checkin?: string;
      checkout?: string;
      guestName?: string;
    },
});

const hotelAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hotel-admin",
  component: HotelAdmin,
});

const superAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/super-admin",
  component: SuperAdmin,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const helpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/help",
  component: HelpSupport,
});

const customerLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login/customer",
  component: CustomerLogin,
});

const hotelOwnerLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login/hotel-owner",
  component: HotelOwnerLogin,
});

const superAdminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login/super-admin",
  component: SuperAdminLogin,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: CustomerRegister,
});

const hotelOwnerRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register/hotel-owner",
  component: HotelOwnerRegister,
});

const routeTree = rootRoute.addChildren([
  splashRoute,
  dashboardRoute,
  searchRoute,
  resultsRoute,
  detailsRoute,
  confirmationRoute,
  hotelAdminRoute,
  superAdminRoute,
  profileRoute,
  helpRoute,
  customerLoginRoute,
  hotelOwnerLoginRoute,
  superAdminLoginRoute,
  registerRoute,
  hotelOwnerRegisterRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
