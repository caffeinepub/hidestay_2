import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Home,
  KeyRound,
  MapPin,
  Palmtree,
  Search,
} from "lucide-react";
import type { Variants } from "motion/react";
import { motion } from "motion/react";
import { useState } from "react";

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
  const [searchQuery, setSearchQuery] = useState("");

  const handleExplore = (name: string) => {
    navigate({ to: "/search", search: { category: name } });
  };

  const handleSearch = () => {
    navigate({ to: "/search", search: { category: "Hotels" } });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#1F7A4C]" />
            <span className="font-display font-black text-[#1F7A4C] tracking-widest text-xl">
              HIDESTAY
            </span>
          </div>
          <p className="hidden sm:block text-gray-500 text-sm font-body tracking-widest uppercase">
            Discover Hidden Stays
          </p>
        </div>
      </header>

      {/* Hero Section — Luxury Alpine */}
      <section
        className="relative w-full overflow-hidden"
        style={{ minHeight: "520px" }}
      >
        {/* Alpine background image */}
        <img
          src="/assets/generated/hero-alpine-luxury.dim_1600x900.jpg"
          alt="Luxury alpine mountain landscape"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/60" />

        {/* Indian tricolor accent strip at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white/60 to-[#1F7A4C]" />

        <div
          className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-20 gap-4"
          style={{ minHeight: "520px" }}
        >
          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
            className="font-display font-black text-white text-3xl sm:text-5xl lg:text-6xl tracking-wide drop-shadow-xl max-w-3xl leading-tight"
          >
            HIDESTAY – Find Your Perfect Stay
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-white/90 font-body text-base sm:text-xl tracking-wide max-w-lg drop-shadow font-light"
          >
            Luxury stays surrounded by nature
          </motion.p>

          {/* Indian identity badge */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-[#FF9933] font-body text-xs sm:text-sm font-semibold tracking-widest uppercase drop-shadow"
          >
            🇮🇳 Hidden Stays Across India
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="w-full max-w-xl mt-2"
          >
            <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-full shadow-2xl border border-white/60 overflow-hidden px-2 py-1.5">
              <Search className="w-5 h-5 text-[#1F7A4C] ml-3 shrink-0" />
              <Input
                data-ocid="dashboard.search_input"
                placeholder="Search destinations, e.g. Rishikesh, Mussoorie…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-800 placeholder:text-gray-400 font-body text-sm flex-1"
              />
              <Button
                data-ocid="dashboard.search_button"
                onClick={handleSearch}
                className="bg-[#1F7A4C] hover:bg-[#166038] text-white font-body font-semibold rounded-full px-5 py-2 text-sm shrink-0 shadow"
              >
                Search
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Cards */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="mb-8 text-center">
          <h2 className="font-display font-bold text-gray-900 text-2xl sm:text-3xl">
            Browse by Category
          </h2>
          <p className="text-gray-500 mt-1 font-body">
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
                className="group cursor-pointer rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative h-56 sm:h-72"
              >
                {/* Full-bleed background image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5" />

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
                    <p className="text-white/75 text-xs font-body leading-snug mt-0.5 line-clamp-2 hidden sm:block">
                      {cat.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    data-ocid={`${cat.ocid}_explore_button`}
                    className="w-full bg-[#1F7A4C] hover:bg-[#166038] text-white font-body font-semibold text-xs sm:text-sm rounded-full shadow-md"
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
      <footer className="border-t border-gray-100 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-[#1F7A4C] font-semibold tracking-wider text-sm font-body mb-2">
            🇮🇳 Discover Hidden Stays in India
          </p>
          <p className="text-gray-400 text-sm font-body">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1F7A4C] transition-colors"
            >
              Built with ❤️ using caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
