import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

// PWA icon reference - keeps asset from being pruned by build pipeline
const PWA_ICON = "/assets/generated/hidestay-icon-512.dim_512x512.png";
if (typeof document !== "undefined") {
  const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (link) link.href = PWA_ICON;
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      <App />
    </InternetIdentityProvider>
  </QueryClientProvider>,
);
