import { useRouterState } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Building2, HelpCircle, Home, ShieldCheck, User } from "lucide-react";

const TABS = [
  { label: "Home", icon: Home, to: "/dashboard", ocid: "bottomnav.home.link" },
  {
    label: "Hotel Admin",
    icon: Building2,
    to: "/hotel-admin",
    ocid: "bottomnav.hotel_admin.link",
  },
  {
    label: "Super Admin",
    icon: ShieldCheck,
    to: "/super-admin",
    ocid: "bottomnav.super_admin.link",
  },
  {
    label: "Profile",
    icon: User,
    to: "/profile",
    ocid: "bottomnav.profile.link",
  },
  { label: "Help", icon: HelpCircle, to: "/help", ocid: "bottomnav.help.link" },
];

export default function BottomNav() {
  const { location } = useRouterState();
  const currentPath = location.pathname;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-[0_-2px_12px_rgba(0,0,0,0.08)]"
      style={{ height: 64 }}
    >
      <div className="flex items-stretch h-full max-w-lg mx-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPath === tab.to;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              data-ocid={tab.ocid}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors"
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}
              <Icon
                className={`w-[22px] h-[22px] transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[10px] font-body font-medium transition-colors leading-tight text-center ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
