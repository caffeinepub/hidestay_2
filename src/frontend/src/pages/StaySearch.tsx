import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Minus, Plus, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const CATEGORY_HERO: Record<string, { bg: string; label: string }> = {
  Hotels: {
    bg: "https://picsum.photos/seed/hotel-hero/1200/400",
    label: "Find Hotels",
  },
  Resorts: {
    bg: "https://picsum.photos/seed/resort-hero/1200/400",
    label: "Find Resorts",
  },
  Homestays: {
    bg: "https://picsum.photos/seed/home-hero/1200/400",
    label: "Find Homestays",
  },
  "Guest Houses": {
    bg: "https://picsum.photos/seed/guesthouse-hero/1200/400",
    label: "Find Guest Houses",
  },
};

function Counter({
  label,
  sub,
  value,
  min,
  onIncrement,
  onDecrement,
  incrementId,
  decrementId,
}: {
  label: string;
  sub: string;
  value: number;
  min: number;
  onIncrement: () => void;
  onDecrement: () => void;
  incrementId: string;
  decrementId: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <p className="font-body font-semibold text-foreground text-sm">
          {label}
        </p>
        <p className="font-body text-xs text-muted-foreground">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-ocid={decrementId}
          onClick={onDecrement}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-5 text-center font-body font-bold text-foreground text-sm">
          {value}
        </span>
        <button
          type="button"
          data-ocid={incrementId}
          onClick={onIncrement}
          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function StaySearch() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/search" });
  const category = (search as { category?: string }).category ?? "Hotels";
  const hero = CATEGORY_HERO[category] ?? CATEGORY_HERO.Hotels;

  const [destination, setDestination] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [guestsOpen, setGuestsOpen] = useState(false);

  const guestSummary = [
    `${adults} Adult${adults !== 1 ? "s" : ""}`,
    children > 0 ? `${children} Child${children !== 1 ? "ren" : ""}` : null,
    `${rooms} Room${rooms !== 1 ? "s" : ""}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/results",
      search: {
        category,
        destination,
        checkin,
        checkout,
        adults,
        children,
        rooms,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero area */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img
          src={hero.bg}
          alt={hero.label}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        {/* Header inside hero */}
        <div className="absolute top-0 left-0 right-0 px-4 sm:px-6 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/dashboard" })}
            data-ocid="search.back.button"
            className="text-white hover:text-white hover:bg-white/20 font-body flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <span className="font-display font-black text-white tracking-widest text-lg">
            HIDESTAY
          </span>
        </div>
        {/* Hero text */}
        <div className="absolute bottom-6 left-0 right-0 px-4 sm:px-6">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display font-black text-white text-3xl sm:text-4xl drop-shadow-lg"
          >
            {hero.label}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-white/80 font-body text-sm mt-1"
          >
            Search and find the perfect {category.toLowerCase()} for your trip
          </motion.p>
        </div>
      </div>

      {/* Form card */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 -mt-8 pb-12">
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          onSubmit={handleSearch}
          className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-border p-6 sm:p-8 space-y-5"
        >
          {/* Destination */}
          <div>
            <label
              htmlFor="destination"
              className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block"
            >
              Destination / City
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="destination"
                data-ocid="search.destination.input"
                placeholder="Where are you going?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="pl-9 font-body"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="checkin"
                className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block"
              >
                Check-in
              </label>
              <input
                id="checkin"
                type="date"
                data-ocid="search.checkin.input"
                value={checkin}
                onChange={(e) => setCheckin(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-body text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div>
              <label
                htmlFor="checkout"
                className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block"
              >
                Check-out
              </label>
              <input
                id="checkout"
                type="date"
                data-ocid="search.checkout.input"
                value={checkout}
                onChange={(e) => setCheckout(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-body text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          {/* Guests & Rooms */}
          <div>
            <p className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Guests &amp; Rooms
            </p>
            <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  data-ocid="search.guests_rooms.button"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-body text-foreground flex items-center gap-2 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors text-left"
                >
                  <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="flex-1">{guestSummary}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <Counter
                  label="Adults"
                  sub="Ages 13+"
                  value={adults}
                  min={1}
                  onIncrement={() => setAdults((v) => v + 1)}
                  onDecrement={() => setAdults((v) => Math.max(1, v - 1))}
                  incrementId="search.adults.increment.button"
                  decrementId="search.adults.decrement.button"
                />
                <Counter
                  label="Children"
                  sub="Ages 2–12"
                  value={children}
                  min={0}
                  onIncrement={() => setChildren((v) => v + 1)}
                  onDecrement={() => setChildren((v) => Math.max(0, v - 1))}
                  incrementId="search.children.increment.button"
                  decrementId="search.children.decrement.button"
                />
                <Counter
                  label="Rooms"
                  sub="Number of rooms"
                  value={rooms}
                  min={1}
                  onIncrement={() => setRooms((v) => v + 1)}
                  onDecrement={() => setRooms((v) => Math.max(1, v - 1))}
                  incrementId="search.rooms.increment.button"
                  decrementId="search.rooms.decrement.button"
                />
                <Button
                  type="button"
                  size="sm"
                  className="mt-3 w-full bg-primary text-primary-foreground font-body"
                  onClick={() => setGuestsOpen(false)}
                >
                  Done
                </Button>
              </PopoverContent>
            </Popover>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            data-ocid="search.submit_button"
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-body font-bold text-base rounded-xl"
          >
            Search Stays
          </Button>
        </motion.form>
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 text-center text-muted-foreground text-sm font-body">
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
