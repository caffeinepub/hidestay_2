import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Dashboard from "./pages/Dashboard";
import SplashScreen from "./pages/SplashScreen";
import StayResults from "./pages/StayResults";
import StaySearch from "./pages/StaySearch";

const queryClient = new QueryClient();

const rootRoute = createRootRoute({
  component: () => <Outlet />,
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

const routeTree = rootRoute.addChildren([
  splashRoute,
  dashboardRoute,
  searchRoute,
  resultsRoute,
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
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
