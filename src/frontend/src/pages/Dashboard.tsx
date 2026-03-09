import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Building2,
  Home,
  KeyRound,
  MapPin,
  Palmtree,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Category } from "../backend.d";
import { useGetAllCategories } from "../hooks/useQueries";

const DEFAULT_CATEGORIES = [
  {
    name: "Hotels",
    description:
      "Comfortable stays with premium amenities and professional service for every traveler.",
    icon: Building2,
    accent: "oklch(0.52 0.18 145)",
  },
  {
    name: "Resorts",
    description:
      "Escape to paradise with world-class resorts nestled in nature's most breathtaking settings.",
    icon: Palmtree,
    accent: "oklch(0.45 0.16 155)",
  },
  {
    name: "Homestays",
    description:
      "Live like a local. Authentic experiences with welcoming hosts across hidden destinations.",
    icon: Home,
    accent: "oklch(0.58 0.15 140)",
  },
  {
    name: "Guest Houses",
    description:
      "Cozy, affordable, and full of character — your home away from home while exploring.",
    icon: KeyRound,
    accent: "oklch(0.42 0.14 150)",
  },
];

const ICONS: Record<string, React.ElementType> = {
  Hotels: Building2,
  Resorts: Palmtree,
  Homestays: Home,
  "Guest Houses": KeyRound,
};

const ACCENTS: string[] = [
  "oklch(0.52 0.18 145)",
  "oklch(0.45 0.16 155)",
  "oklch(0.58 0.15 140)",
  "oklch(0.42 0.14 150)",
];

function mergeCategories(fetched: Category[]) {
  if (!fetched || fetched.length === 0) return DEFAULT_CATEGORIES;
  return fetched.map((cat, i) => ({
    name: cat.name,
    description: cat.description,
    icon: ICONS[cat.name] ?? Building2,
    accent: ACCENTS[i % ACCENTS.length],
  }));
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Dashboard() {
  const { data: fetchedCategories, isLoading } = useGetAllCategories();
  const categories = mergeCategories(fetchedCategories ?? []);

  const handleExplore = (name: string) => {
    toast("Coming soon!", {
      description: `${name} listings are on their way.`,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
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

      {/* Hero banner */}
      <section
        className="relative h-52 sm:h-72 w-full overflow-hidden"
        style={{
          backgroundImage:
            "url('/assets/generated/mountain-bg.dim_1200x800.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-background" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display font-bold text-white text-2xl sm:text-4xl tracking-wide drop-shadow-lg"
          >
            Find Your Perfect Escape
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-white/80 font-body mt-2 text-sm sm:text-base tracking-wide"
          >
            Handpicked stays off the beaten path
          </motion.p>
        </div>
      </section>

      {/* Category section */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h3 className="font-display font-bold text-foreground text-2xl sm:text-3xl">
            Browse by Category
          </h3>
          <p className="text-muted-foreground mt-1 font-body">
            Choose the type of stay that suits you
          </p>
        </div>

        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            data-ocid="categories.loading_state"
          >
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              const ocidIndex = idx + 1;
              return (
                <motion.div
                  key={cat.name}
                  variants={cardVariants}
                  data-ocid={`categories.item.${ocidIndex}`}
                >
                  <Card className="group h-full flex flex-col hover:shadow-green hover:-translate-y-1 transition-all duration-300 border-border overflow-hidden cursor-pointer">
                    <CardHeader className="pb-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                        style={{ backgroundColor: `${cat.accent}20` }}
                      >
                        <Icon
                          className="w-6 h-6"
                          style={{ color: cat.accent }}
                        />
                      </div>
                      <h4 className="font-display font-bold text-foreground text-lg leading-tight">
                        {cat.name}
                      </h4>
                    </CardHeader>
                    <CardContent className="flex-1 pb-4">
                      <p className="text-muted-foreground text-sm font-body leading-relaxed">
                        {cat.description}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button
                        variant="ghost"
                        className="p-0 h-auto text-primary hover:text-primary hover:bg-transparent font-body font-semibold text-sm group/btn"
                        onClick={() => handleExplore(cat.name)}
                        data-ocid={`categories.button.${ocidIndex}`}
                      >
                        Explore
                        <ArrowRight className="ml-1 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
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
