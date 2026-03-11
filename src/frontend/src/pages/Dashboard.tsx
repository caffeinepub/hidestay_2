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
  Sparkles,
  Star,
} from "lucide-react";
import type { Variants } from "motion/react";
import { motion } from "motion/react";
import React, { useState } from "react";

const CATEGORIES = [
  {
    name: "Hotels",
    description: "Premium amenities & professional service.",
    icon: Building2,
    image: "/assets/generated/category-hotels.dim_600x400.jpg",
    ocid: "dashboard.hotels.card",
  },
  {
    name: "Resorts",
    description: "World-class escapes in breathtaking settings.",
    icon: Palmtree,
    image: "/assets/generated/category-resorts.dim_600x400.jpg",
    ocid: "dashboard.resorts.card",
  },
  {
    name: "Homestays",
    description: "Authentic local experiences with warm hosts.",
    icon: Home,
    image: "/assets/generated/category-homestays.dim_600x400.jpg",
    ocid: "dashboard.homestays.card",
  },
  {
    name: "Guest Houses",
    description: "Cozy, affordable stays full of character.",
    icon: KeyRound,
    image: "/assets/generated/category-guesthouses.dim_600x400.jpg",
    ocid: "dashboard.guesthouses.card",
  },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function TopStaysSection() {
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("hidestay_featured_hotels");
      if (stored) setFeaturedIds(JSON.parse(stored));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const MOCK_PROPERTIES = [
    {
      id: "prop-001",
      propertyName: "The Mountain Retreat",
      city: "Rishikesh",
      pricePerNight: 4500,
      rating: 4.8,
      imageUrl: "/assets/generated/category-resorts.dim_600x400.jpg",
      type: "Resort",
    },
    {
      id: "prop-002",
      propertyName: "Valley View Homestay",
      city: "Mussoorie",
      pricePerNight: 2800,
      rating: 4.6,
      imageUrl: "/assets/generated/category-homestays.dim_600x400.jpg",
      type: "Homestay",
    },
    {
      id: "prop-003",
      propertyName: "Lake View Guest House",
      city: "Nainital",
      pricePerNight: 3200,
      rating: 4.7,
      imageUrl: "/assets/generated/category-guesthouses.dim_600x400.jpg",
      type: "Guest House",
    },
  ];

  const featuredProperties =
    featuredIds.length > 0
      ? MOCK_PROPERTIES.filter((p) => featuredIds.includes(p.id))
      : MOCK_PROPERTIES;

  if (featuredProperties.length === 0) return null;

  return (
    <div className="mt-14 mb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-gray-900 text-2xl sm:text-3xl flex items-center gap-2">
            <Star className="w-6 h-6 text-[#FF9933] fill-[#FF9933]" />
            Top Stays
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Handpicked luxury properties across India
          </p>
        </div>
      </div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        data-ocid="dashboard.top_stays.list"
      >
        {featuredProperties.map((prop, i) => (
          <motion.div
            key={prop.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            data-ocid={`dashboard.top_stays.item.${i + 1}`}
            className="group cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 bg-white border border-gray-100"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={prop.imageUrl}
                alt={prop.propertyName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="bg-[#FF9933] text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" /> Featured
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-bold text-base leading-tight drop-shadow">
                  {prop.propertyName}
                </h3>
                <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {prop.city}
                </p>
              </div>
            </div>
            <div className="p-3 flex items-center justify-between">
              <div>
                <span className="text-[#1F7A4C] font-bold text-base">
                  ₹{prop.pricePerNight.toLocaleString("en-IN")}
                </span>
                <span className="text-gray-400 text-xs"> / night</span>
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-semibold text-gray-700">
                  {prop.rating}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleExplore = (name: string) => {
    navigate({ to: "/search", search: { category: name } });
  };

  const handleSearch = () => {
    navigate({
      to: "/search",
      search: { category: "Hotels" },
    });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen bg-[#F8F8F6] flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1F7A4C] flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-[#1F7A4C] tracking-widest text-lg">
              HIDESTAY
            </span>
          </div>
          <p className="hidden sm:block text-gray-400 text-xs font-semibold tracking-widest uppercase">
            Discover Hidden Stays in India
          </p>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative w-full overflow-hidden"
        style={{ minHeight: "560px" }}
      >
        {/* Background image */}
        <img
          src="/assets/generated/hero-alpine-luxury.dim_1600x900.jpg"
          alt="Luxury mountain landscape"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/65" />
        {/* Saffron-to-green accent at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FF9933] via-white/50 to-[#1F7A4C]" />

        <div
          className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-24 gap-5"
          style={{ minHeight: "560px" }}
        >
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 text-white/90 text-xs font-semibold px-4 py-1.5 rounded-full tracking-widest uppercase"
          >
            🇮🇳 Hidden Stays Across India
          </motion.span>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="font-black text-white text-3xl sm:text-5xl lg:text-6xl tracking-tight drop-shadow-xl max-w-3xl leading-tight"
          >
            HIDESTAY – Find Your
            <br className="hidden sm:block" /> Perfect Stay
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-white/85 text-base sm:text-xl tracking-wide max-w-md font-light"
          >
            Luxury stays surrounded by nature
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.65 }}
            className="w-full max-w-2xl mt-2"
          >
            <div className="flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/80 px-3 py-2 gap-2">
              <Search className="w-5 h-5 text-[#1F7A4C] shrink-0 ml-1" />
              <Input
                data-ocid="dashboard.search_input"
                placeholder="Where are you going? e.g. Rishikesh, Mussoorie…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-800 placeholder:text-gray-400 text-sm flex-1 px-1"
              />
              <Button
                data-ocid="dashboard.search_button"
                onClick={handleSearch}
                className="bg-[#1F7A4C] hover:bg-[#166038] text-white font-bold rounded-xl px-6 py-2 text-sm shrink-0 shadow-md transition-colors"
              >
                Search
              </Button>
            </div>
          </motion.div>

          {/* Quick category pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-2 mt-1"
          >
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.name}
                data-ocid={`dashboard.hero.${cat.name.toLowerCase().replace(" ", "_")}.button`}
                onClick={() => handleExplore(cat.name)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-xs font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm transition-all"
              >
                {cat.name}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Plan Your Trip Banner */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#1F7A4C] to-[#166038] shadow-lg"
          data-ocid="dashboard.trip_planner.card"
        >
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 right-16 w-24 h-24 rounded-full bg-[#FF9933]/20" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                <Sparkles className="w-5 h-5 text-[#FF9933]" />
                <span className="text-[#FF9933] text-xs font-bold uppercase tracking-widest">
                  New Feature
                </span>
              </div>
              <h3 className="text-white font-black text-xl sm:text-2xl leading-tight">
                Plan Your Perfect Trip
              </h3>
              <p className="text-white/70 text-sm mt-1 max-w-sm">
                Get a personalised day-by-day itinerary with hotel suggestions
                and attractions tailored to your travel style.
              </p>
            </div>
            <Button
              data-ocid="dashboard.plan_trip.primary_button"
              onClick={() => navigate({ to: "/trip-planner" })}
              className="shrink-0 bg-white text-[#1F7A4C] hover:bg-[#FF9933] hover:text-white font-black rounded-xl px-8 py-3 text-sm shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Plan My Trip
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Category Cards */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h2 className="font-bold text-gray-900 text-2xl sm:text-3xl">
            Browse by Category
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Choose the type of stay that suits you
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.name}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: i * 0.1 }}
                data-ocid={cat.ocid}
                onClick={() => handleExplore(cat.name)}
                className="group cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative h-52 sm:h-72 bg-gray-100"
              >
                {/* Full-bleed background image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Icon badge */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <Icon className="w-4 h-4 text-white" />
                </div>

                {/* Text + button at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
                  <div>
                    <h3 className="font-bold text-white text-base sm:text-lg leading-tight drop-shadow">
                      {cat.name}
                    </h3>
                    <p className="text-white/70 text-xs leading-snug mt-0.5 line-clamp-2 hidden sm:block">
                      {cat.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    data-ocid={`${cat.ocid}_explore_button`}
                    className="w-full bg-[#1F7A4C] hover:bg-[#166038] text-white font-semibold text-xs sm:text-sm rounded-full shadow transition-colors"
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
        </div>

        {/* Top Stays / Featured Hotels */}
        <TopStaysSection />

        {/* Features row */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            {
              emoji: "🏔️",
              title: "Nature Escapes",
              desc: "Stays surrounded by Himalayan landscapes",
            },
            {
              emoji: "✅",
              title: "Verified Stays",
              desc: "All properties reviewed and approved",
            },
            {
              emoji: "💳",
              title: "Pay at Hotel",
              desc: "No advance payment required",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">
                {f.title}
              </h3>
              <p className="text-gray-500 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-[#1F7A4C] font-semibold tracking-wider text-sm mb-2">
            🇮🇳 Discover Hidden Stays in India
          </p>
          <p className="text-gray-400 text-xs">
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
