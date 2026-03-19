import type { Property } from "@/backend";
import { Button } from "@/components/ui/button";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import { motion } from "motion/react";

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

function mapPropertyTypeToCategory(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("resort")) return "Resorts";
  if (t.includes("home")) return "Homestays";
  if (t.includes("guest")) return "Guest Houses";
  return "Hotels";
}

function EmptyState({
  category,
  onBack,
}: { category: string; onBack: () => void }) {
  return (
    <motion.div
      data-ocid="results.empty_state"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full overflow-hidden rounded-3xl my-4"
      style={{
        background:
          "linear-gradient(135deg, #0d2d1a 0%, #1F7A4C 55%, #0d2d1a 100%)",
        minHeight: "520px",
      }}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        viewBox="0 0 1200 520"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon
          points="0,520 200,200 400,340 600,100 800,280 1000,160 1200,300 1200,520"
          fill="white"
        />
        <polygon
          points="0,520 100,320 300,420 550,180 750,350 950,220 1200,380 1200,520"
          fill="white"
          opacity="0.5"
        />
      </svg>
      <div className="absolute top-8 left-8 w-2 h-2 rounded-full bg-white/20" />
      <div className="absolute top-14 left-16 w-1.5 h-1.5 rounded-full bg-white/15" />
      <div className="absolute top-6 right-12 w-2.5 h-2.5 rounded-full bg-white/20" />
      <div className="absolute top-20 right-20 w-1.5 h-1.5 rounded-full bg-white/15" />
      <div
        className="absolute bottom-16 left-12 w-2 h-2 rounded-full"
        style={{ backgroundColor: "#FF993340" }}
      />
      <div
        className="absolute bottom-20 right-16 w-3 h-3 rounded-full"
        style={{ backgroundColor: "#FF993330" }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-24 rounded-b-full"
        style={{ backgroundColor: "#FF9933" }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20 gap-6">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 3.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              border: "1.5px solid rgba(255,255,255,0.2)",
            }}
          >
            <svg
              role="img"
              aria-label="Mountain landscape icon"
              viewBox="0 0 64 64"
              className="w-12 h-12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 50 L20 22 L32 36 L44 14 L58 50 Z"
                fill="white"
                opacity="0.9"
              />
              <path d="M6 50 L20 22 L29 33" fill="#FF9933" opacity="0.8" />
              <path d="M20 22 L24 30 L16 30 Z" fill="white" />
              <path d="M44 14 L49 24 L39 24 Z" fill="white" />
              <circle cx="52" cy="12" r="4" fill="#FF9933" opacity="0.9" />
            </svg>
          </div>
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              backgroundColor: "rgba(31,122,76,0.25)",
              animationDuration: "2.5s",
            }}
          />
        </motion.div>

        <motion.span
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="px-4 py-1 rounded-full text-xs font-semibold tracking-widest uppercase font-body"
          style={{
            backgroundColor: "rgba(255,153,51,0.18)",
            color: "#FF9933",
            border: "1px solid rgba(255,153,51,0.35)",
          }}
        >
          {category}
        </motion.span>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="flex flex-col gap-2"
        >
          <h2 className="font-display font-black text-white text-4xl sm:text-5xl leading-tight tracking-tight">
            Discover Hidden Stays.
          </h2>
          <p className="text-white/70 font-body text-base sm:text-lg">
            No {category} listed in this destination yet.
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-white/50 font-body text-sm max-w-xs"
        >
          New properties will appear soon. Be the first to discover them.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.45 }}
        >
          <Button
            data-ocid="results.back_home.button"
            onClick={onBack}
            className="mt-2 px-8 py-3 rounded-full font-body font-semibold text-white text-sm shadow-md"
            style={{ backgroundColor: "#FF9933", border: "none" }}
          >
            Back to Home
          </Button>
        </motion.div>

        <div className="flex items-center gap-3 opacity-30 mt-2">
          <div className="h-px w-16 bg-white" />
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
          <div className="h-px w-16 bg-white" />
        </div>
      </div>
    </motion.div>
  );
}

export default function StayResults() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/results" });
  const category = search.category ?? "Hotels";
  const destination = search.destination ?? "";

  const { actor, isFetching: actorLoading } = useActor();

  const {
    data: backendProperties = [],
    isLoading,
    isFetching,
  } = useQuery<Property[]>({
    queryKey: ["approvedProperties", actor ? "ready" : "loading"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllApprovedProperties();
      } catch {
        return [];
      }
    },
    enabled: !!actor,
    retry: 3,
    retryDelay: 1000,
    staleTime: 30000,
  });

  const properties = backendProperties.filter(
    (p) => mapPropertyTypeToCategory(p.propertyType) === category,
  );

  const showLoading = actorLoading || isLoading || isFetching;

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
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="font-display font-black text-foreground text-3xl sm:text-4xl">
            {showLoading
              ? "Searching..."
              : `${properties.length} ${properties.length === 1 ? "stay" : "stays"} found`}
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

        {showLoading ? (
          <div
            data-ocid="results.loading_state"
            className="text-center py-20 text-muted-foreground font-body"
          >
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading available stays...
          </div>
        ) : properties.length === 0 ? (
          <EmptyState
            category={category}
            onBack={() => navigate({ to: "/dashboard" })}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map((prop, i) => (
              <motion.div
                key={prop.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                data-ocid={`results.property.item.${i + 1}`}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs hover:shadow-green hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-44 overflow-hidden">
                  {prop.imageUrls.length > 0 ? (
                    <img
                      src={prop.imageUrls[0]}
                      alt={prop.propertyName}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-primary/40" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display font-bold text-foreground text-base mb-0.5">
                    {prop.propertyName}
                  </h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs font-body mb-2">
                    <MapPin className="w-3 h-3" />
                    {prop.city}, India
                  </div>
                  <StarRating rating={4.5} />
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-display font-bold text-primary text-lg">
                      ₹{Number(prop.pricePerNight).toLocaleString("en-IN")}
                      /night
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      data-ocid={`results.property.button.${i + 1}`}
                      onClick={() =>
                        navigate({
                          to: "/details",
                          search: {
                            id: prop.id,
                            category,
                            name: prop.propertyName,
                            location: `${prop.city}, India`,
                            price: `₹${Number(prop.pricePerNight).toLocaleString("en-IN")}/night`,
                            rating: 4.5,
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
