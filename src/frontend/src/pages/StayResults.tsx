import { Button } from "@/components/ui/button";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import { motion } from "motion/react";

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
      price: "₹12,000/night",
      rating: 4.8,
      seed: "hotel1",
    },
    {
      name: "Blue Horizon Hotel",
      location: "Santorini, Greece",
      price: "₹18,500/night",
      rating: 4.9,
      seed: "hotel2",
    },
    {
      name: "Forest Edge Boutique",
      location: "Kyoto, Japan",
      price: "₹15,000/night",
      rating: 4.7,
      seed: "hotel3",
    },
    {
      name: "Sunset Palms Hotel",
      location: "Maldives",
      price: "₹26,000/night",
      rating: 5.0,
      seed: "hotel4",
    },
    {
      name: "Old Town Residency",
      location: "Prague, Czech Republic",
      price: "₹7,999/night",
      rating: 4.6,
      seed: "hotel5",
    },
    {
      name: "Mountain View Inn",
      location: "Swiss Alps, Switzerland",
      price: "₹21,500/night",
      rating: 4.8,
      seed: "hotel6",
    },
  ],
  Resorts: [
    {
      name: "Azure Bay Resort",
      location: "Phuket, Thailand",
      price: "₹31,999/night",
      rating: 4.9,
      seed: "resort1",
    },
    {
      name: "Coral Cove Retreat",
      location: "Seychelles",
      price: "₹43,500/night",
      rating: 5.0,
      seed: "resort2",
    },
    {
      name: "Jungle Canopy Resort",
      location: "Costa Rica",
      price: "₹24,500/night",
      rating: 4.7,
      seed: "resort3",
    },
    {
      name: "Desert Bloom Oasis",
      location: "Marrakech, Morocco",
      price: "₹28,500/night",
      rating: 4.8,
      seed: "resort4",
    },
    {
      name: "Lagoon Paradise",
      location: "Fiji Islands",
      price: "₹39,500/night",
      rating: 4.9,
      seed: "resort5",
    },
    {
      name: "Peak Summit Resort",
      location: "Queenstown, NZ",
      price: "₹26,500/night",
      rating: 4.6,
      seed: "resort6",
    },
  ],
  Homestays: [
    {
      name: "Grandma Rosa's Cottage",
      location: "Tuscany, Italy",
      price: "₹6,299/night",
      rating: 4.9,
      seed: "home1",
    },
    {
      name: "Balinese Family Villa",
      location: "Ubud, Bali",
      price: "₹7,499/night",
      rating: 4.8,
      seed: "home2",
    },
    {
      name: "Highland Croft Stay",
      location: "Scotland, UK",
      price: "₹5,499/night",
      rating: 4.7,
      seed: "home3",
    },
    {
      name: "Bamboo Garden House",
      location: "Chiang Mai, Thailand",
      price: "₹4,699/night",
      rating: 4.8,
      seed: "home4",
    },
    {
      name: "Old Town Apartment",
      location: "Lisbon, Portugal",
      price: "₹7,799/night",
      rating: 4.9,
      seed: "home5",
    },
    {
      name: "Vineyard Farmhouse",
      location: "Bordeaux, France",
      price: "₹9,299/night",
      rating: 4.7,
      seed: "home6",
    },
  ],
  "Guest Houses": [
    {
      name: "Maple Leaf Guest House",
      location: "Vancouver, Canada",
      price: "₹6,699/night",
      rating: 4.7,
      seed: "guest1",
    },
    {
      name: "Harbor View Lodge",
      location: "Cape Town, SA",
      price: "₹7,999/night",
      rating: 4.8,
      seed: "guest2",
    },
    {
      name: "The Wanderer's Rest",
      location: "Kathmandu, Nepal",
      price: "₹3,799/night",
      rating: 4.6,
      seed: "guest3",
    },
    {
      name: "Colonial House Stay",
      location: "Hanoi, Vietnam",
      price: "₹4,999/night",
      rating: 4.7,
      seed: "guest4",
    },
    {
      name: "Garden Gate House",
      location: "Dublin, Ireland",
      price: "₹9,699/night",
      rating: 4.8,
      seed: "guest5",
    },
    {
      name: "Lakeside Guest House",
      location: "Pokhara, Nepal",
      price: "₹4,399/night",
      rating: 4.9,
      seed: "guest6",
    },
  ],
};

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

export default function StayResults() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/results" });
  const category = search.category ?? "Hotels";
  const destination = search.destination ?? "";
  const properties = MOCK_PROPERTIES[category] ?? MOCK_PROPERTIES.Hotels;

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
            data-ocid="results.back.button"
            onClick={() => navigate({ to: "/search", search: { category } })}
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
        {/* Results header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="font-display font-black text-foreground text-3xl sm:text-4xl">
            {properties.length} stays found
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            {category} in{" "}
            <span className="text-foreground font-semibold">
              {destination || "all destinations"}
            </span>
            {search.checkin && search.checkout && (
              <span>
                {" · "}
                {search.checkin} → {search.checkout}
              </span>
            )}
            {search.adults && (
              <span>
                {" · "}
                {search.adults} Adult{Number(search.adults) !== 1 ? "s" : ""}
                {Number(search.children) > 0 &&
                  `, ${search.children} Child${Number(search.children) !== 1 ? "ren" : ""}`}
                {" · "}
                {search.rooms} Room{Number(search.rooms) !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </motion.div>

        {/* Property grid */}
        {properties.length === 0 ? (
          <div
            data-ocid="results.empty_state"
            className="text-center py-20 text-muted-foreground font-body"
          >
            No properties found. Try adjusting your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map((prop, i) => (
              <motion.div
                key={prop.seed}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                data-ocid={`results.property.item.${i + 1}`}
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
                      data-ocid={`results.property.button.${i + 1}`}
                      onClick={() =>
                        navigate({
                          to: "/details",
                          search: {
                            id: prop.seed,
                            category,
                            name: prop.name,
                            location: prop.location,
                            price: prop.price,
                            rating: prop.rating,
                          },
                        })
                      }
                      className="font-body text-xs border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

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
