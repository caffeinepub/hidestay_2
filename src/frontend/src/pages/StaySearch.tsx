import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const MOCK_PROPERTIES: Record<
  string,
  Array<{
    name: string;
    location: string;
    price: string;
    rating: number;
    seed: string;
  }>
> = {
  Hotels: [
    {
      name: "The Grand Meridian",
      location: "Bali, Indonesia",
      price: "$145/night",
      rating: 4.8,
      seed: "hotel1",
    },
    {
      name: "Blue Horizon Hotel",
      location: "Santorini, Greece",
      price: "$220/night",
      rating: 4.9,
      seed: "hotel2",
    },
    {
      name: "Forest Edge Boutique",
      location: "Kyoto, Japan",
      price: "$180/night",
      rating: 4.7,
      seed: "hotel3",
    },
    {
      name: "Sunset Palms Hotel",
      location: "Maldives",
      price: "$310/night",
      rating: 5.0,
      seed: "hotel4",
    },
    {
      name: "Old Town Residency",
      location: "Prague, Czech Republic",
      price: "$95/night",
      rating: 4.6,
      seed: "hotel5",
    },
    {
      name: "Mountain View Inn",
      location: "Swiss Alps, Switzerland",
      price: "$260/night",
      rating: 4.8,
      seed: "hotel6",
    },
  ],
  Resorts: [
    {
      name: "Azure Bay Resort",
      location: "Phuket, Thailand",
      price: "$380/night",
      rating: 4.9,
      seed: "resort1",
    },
    {
      name: "Coral Cove Retreat",
      location: "Seychelles",
      price: "$520/night",
      rating: 5.0,
      seed: "resort2",
    },
    {
      name: "Jungle Canopy Resort",
      location: "Costa Rica",
      price: "$290/night",
      rating: 4.7,
      seed: "resort3",
    },
    {
      name: "Desert Bloom Oasis",
      location: "Marrakech, Morocco",
      price: "$340/night",
      rating: 4.8,
      seed: "resort4",
    },
    {
      name: "Lagoon Paradise",
      location: "Fiji Islands",
      price: "$470/night",
      rating: 4.9,
      seed: "resort5",
    },
    {
      name: "Peak Summit Resort",
      location: "Queenstown, NZ",
      price: "$315/night",
      rating: 4.6,
      seed: "resort6",
    },
  ],
  Homestays: [
    {
      name: "Grandma Rosa's Cottage",
      location: "Tuscany, Italy",
      price: "$75/night",
      rating: 4.9,
      seed: "home1",
    },
    {
      name: "Balinese Family Villa",
      location: "Ubud, Bali",
      price: "$88/night",
      rating: 4.8,
      seed: "home2",
    },
    {
      name: "Highland Croft Stay",
      location: "Scotland, UK",
      price: "$65/night",
      rating: 4.7,
      seed: "home3",
    },
    {
      name: "Bamboo Garden House",
      location: "Chiang Mai, Thailand",
      price: "$55/night",
      rating: 4.8,
      seed: "home4",
    },
    {
      name: "Old Town Apartment",
      location: "Lisbon, Portugal",
      price: "$92/night",
      rating: 4.9,
      seed: "home5",
    },
    {
      name: "Vineyard Farmhouse",
      location: "Bordeaux, France",
      price: "$110/night",
      rating: 4.7,
      seed: "home6",
    },
  ],
  "Guest Houses": [
    {
      name: "Maple Leaf Guest House",
      location: "Vancouver, Canada",
      price: "$79/night",
      rating: 4.7,
      seed: "guest1",
    },
    {
      name: "Harbor View Lodge",
      location: "Cape Town, SA",
      price: "$95/night",
      rating: 4.8,
      seed: "guest2",
    },
    {
      name: "The Wanderer's Rest",
      location: "Kathmandu, Nepal",
      price: "$45/night",
      rating: 4.6,
      seed: "guest3",
    },
    {
      name: "Colonial House Stay",
      location: "Hanoi, Vietnam",
      price: "$58/night",
      rating: 4.7,
      seed: "guest4",
    },
    {
      name: "Garden Gate House",
      location: "Dublin, Ireland",
      price: "$115/night",
      rating: 4.8,
      seed: "guest5",
    },
    {
      name: "Lakeside Guest House",
      location: "Pokhara, Nepal",
      price: "$52/night",
      rating: 4.9,
      seed: "guest6",
    },
  ],
};

const DEFAULT_PROPERTIES = MOCK_PROPERTIES.Hotels;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= Math.floor(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground"
          }`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1 font-body">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function StaySearch() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/search" });
  const category = (search as { category?: string }).category ?? "Hotels";
  const properties = MOCK_PROPERTIES[category] ?? DEFAULT_PROPERTIES;

  const [location, setLocation] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Searching...", {
      description: `Finding ${category} in ${location || "all destinations"}`,
    });
  };

  const handleViewDetails = (name: string) => {
    toast("Coming soon!", {
      description: `Details for "${name}" will be available soon.`,
    });
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, delay: i * 0.07 },
    }),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/dashboard" })}
            data-ocid="search.back.button"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-body"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-display font-black text-primary tracking-widest text-lg">
              HIDESTAY
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="font-display font-black text-foreground text-3xl sm:text-4xl">
            Browse {category}
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            Discover the best {category.toLowerCase()} for your next adventure
          </p>
        </motion.div>

        {/* Search / Filter Bar */}
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSearch}
          className="bg-white border border-border rounded-2xl p-4 sm:p-5 mb-8 shadow-xs flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1">
            <label
              htmlFor="search-location"
              className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block"
            >
              Location
            </label>
            <Input
              id="search-location"
              placeholder="Where are you going?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              data-ocid="search.location.input"
              className="font-body"
            />
          </div>
          <div className="sm:w-40">
            <label
              htmlFor="search-checkin"
              className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block"
            >
              Check-in
            </label>
            <input
              id="search-checkin"
              type="date"
              value={checkin}
              onChange={(e) => setCheckin(e.target.value)}
              data-ocid="search.checkin.input"
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-body text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="sm:w-40">
            <label
              htmlFor="search-checkout"
              className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block"
            >
              Check-out
            </label>
            <input
              id="search-checkout"
              type="date"
              value={checkout}
              onChange={(e) => setCheckout(e.target.value)}
              data-ocid="search.checkout.input"
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-body text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="sm:self-end">
            <Button
              type="submit"
              data-ocid="search.submit_button"
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold px-6 h-10"
            >
              Search
            </Button>
          </div>
        </motion.form>

        {/* Property Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((prop, i) => (
            <motion.div
              key={prop.seed}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              data-ocid={`search.property.item.${i + 1}`}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs hover:shadow-green hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-44 overflow-hidden">
                <img
                  src={`https://picsum.photos/seed/${prop.seed}/400/250`}
                  alt={prop.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold text-foreground text-base mb-0.5">
                  {prop.name}
                </h3>
                <div className="flex items-center gap-1 text-muted-foreground text-xs font-body mb-2">
                  <MapPin className="w-3 h-3" />
                  {prop.location}
                </div>
                <StarRating rating={prop.rating} />
                <div className="flex items-center justify-between mt-3">
                  <span className="font-display font-bold text-primary text-lg">
                    {prop.price}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(prop.name)}
                    data-ocid={`search.property.button.${i + 1}`}
                    className="font-body text-xs border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-muted-foreground text-sm font-body">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
