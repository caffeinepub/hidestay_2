import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Building2, Home, KeyRound, MapPin, Palmtree } from "lucide-react";
import type { Variants } from "motion/react";
import { motion } from "motion/react";

const CATEGORIES = [
  {
    name: "Hotels",
    description: "Premium amenities, professional service, comfort guaranteed.",
    icon: Building2,
    image: "/assets/generated/category-hotels.dim_600x400.jpg",
    ocid: "dashboard.hotels.card",
  },
  {
    name: "Resorts",
    description: "World-class escapes in nature's most breathtaking settings.",
    icon: Palmtree,
    image: "/assets/generated/category-resorts.dim_600x400.jpg",
    ocid: "dashboard.resorts.card",
  },
  {
    name: "Homestays",
    description: "Authentic local experiences with warm Uttarakhand hosts.",
    icon: Home,
    image: "/assets/generated/category-homestays.dim_600x400.jpg",
    ocid: "dashboard.homestays.card",
  },
  {
    name: "Guest Houses",
    description: "Cozy, affordable stays full of character and charm.",
    icon: KeyRound,
    image: "/assets/generated/category-guesthouses.dim_600x400.jpg",
    ocid: "dashboard.guesthouses.card",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55 },
  },
};

export default function Dashboard() {
  const navigate = useNavigate();

  const handleExplore = (name: string) => {
    navigate({ to: "/search", search: { category: name } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-display font-black text-primary tracking-widest text-xl">
              HIDESTAY
            </span>
          </div>
          <p className="hidden sm:block text-muted-foreground text-sm font-body tracking-widest uppercase">
            Discover Hidden Stays
          </p>
        </div>
      </header>

      {/* Hero Banner */}
      <section
        className="relative h-64 sm:h-80 w-full overflow-hidden"
        style={{
          backgroundImage:
            "url('/assets/generated/uttarakhand-mountains.dim_1600x600.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF9933]/40 via-white/5 to-[#1F7A4C]/50" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 gap-3">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display font-black text-white text-3xl sm:text-5xl tracking-wide drop-shadow-lg"
          >
            HIDESTAY – Find Your Perfect Stay
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="text-white/90 font-body text-sm sm:text-lg tracking-wide max-w-md drop-shadow"
          >
            Handpicked stays off the beaten path
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="text-[#FF9933] font-body text-xs sm:text-sm font-semibold tracking-widest uppercase drop-shadow"
          >
            🇮🇳 Discover Hidden Stays in India
          </motion.p>
        </div>
      </section>

      {/* Category Cards */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-8 text-center">
          <h2 className="font-display font-bold text-foreground text-2xl sm:text-3xl">
            Browse by Category
          </h2>
          <p className="text-muted-foreground mt-1 font-body">
            Choose the type of stay that suits you
          </p>
        </div>

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.name}
                variants={cardVariants}
                data-ocid={cat.ocid}
                onClick={() => handleExplore(cat.name)}
                className="group cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative h-56 sm:h-72"
              >
                {/* Full-bleed background image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Gradient overlay — dark at bottom for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

                {/* Icon badge top-right */}
                <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <Icon className="w-4 h-4 text-white" />
                </div>

                {/* Text + button pinned to bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
                  <div>
                    <h3 className="font-display font-bold text-white text-base sm:text-lg leading-tight drop-shadow">
                      {cat.name}
                    </h3>
                    <p className="text-white/80 text-xs font-body leading-snug mt-0.5 line-clamp-2 hidden sm:block">
                      {cat.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    data-ocid={`${cat.ocid}_explore_button`}
                    className="w-full bg-[#1F7A4C] hover:bg-[#1F7A4C]/90 text-white font-body font-semibold text-xs sm:text-sm rounded-full shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExplore(cat.name);
                    }}
                  >
                    Explore
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-primary font-semibold tracking-wider text-sm font-body mb-2">
            🇮🇳 Discover Hidden Stays in India
          </p>
          <p className="text-muted-foreground text-sm font-body">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Built with ❤️ using caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
