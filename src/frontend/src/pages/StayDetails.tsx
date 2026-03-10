import BookingForm from "@/components/BookingForm";
import PropertyMap from "@/components/PropertyMap";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  Car,
  Clock,
  Dumbbell,
  MapPin,
  Sparkles,
  Star,
  UtensilsCrossed,
  WashingMachine,
  Waves,
  Wifi,
  Wind,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

function getDescription(category: string, name: string): string {
  switch (category) {
    case "Resorts":
      return `${name} is a world-class resort destination offering unparalleled luxury and serenity. Nestled in breathtaking natural surroundings, every detail has been crafted to create an unforgettable escape. Guests enjoy spacious suites, curated dining experiences, and a full range of leisure facilities. Whether you seek adventure or pure relaxation, this resort exceeds every expectation.`;
    case "Homestays":
      return `${name} offers an authentic, warm stay where you become part of the local family. Decorated with handcrafted furnishings and regional artworks, the home radiates character and charm. Your hosts provide home-cooked meals and personal recommendations to help you explore like a local. It's travel at its most genuine and heartfelt.`;
    case "Guest Houses":
      return `${name} is a welcoming retreat for the thoughtful traveller seeking comfort without compromise. Thoughtfully appointed rooms offer a peaceful sanctuary after days of exploration. The friendly staff attends to every need with warmth and efficiency. Its central location makes it the ideal base for discovering all that the destination has to offer.`;
    default:
      return `${name} is a prestigious property that blends contemporary design with timeless hospitality. Floor-to-ceiling windows frame stunning views while interiors speak a language of quiet luxury. Every amenity has been selected to anticipate your needs before you voice them. Guests consistently rate it among the finest stays in the region.`;
  }
}

const AMENITIES = [
  { icon: Wifi, label: "Free WiFi" },
  { icon: Car, label: "Free Parking" },
  { icon: Wind, label: "Air Conditioning" },
  { icon: UtensilsCrossed, label: "Restaurant" },
  { icon: Waves, label: "Swimming Pool" },
  { icon: Dumbbell, label: "Gym" },
  { icon: Sparkles, label: "Spa" },
  { icon: WashingMachine, label: "Laundry" },
];

const RULES = [
  "No smoking inside rooms",
  "No pets allowed",
  "No parties or events",
  "Quiet hours: 10 PM – 7 AM",
  "Valid ID required at check-in",
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-sm font-semibold text-foreground ml-1 font-body">
        {Number(rating).toFixed(1)}
      </span>
    </div>
  );
}

export default function StayDetails() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/details" });

  const id = search.id ?? "hotel1";
  const category = search.category ?? "Hotels";
  const name = search.name ?? "The Grand Meridian";
  const location = search.location ?? "Rishikesh, Uttarakhand";
  const price = search.price ?? "₹12,000/night";
  const rating = Number(search.rating ?? 4.8);

  const images = [
    `https://picsum.photos/seed/${id}a/900/600`,
    `https://picsum.photos/seed/${id}b/900/600`,
    `https://picsum.photos/seed/${id}c/900/600`,
    `https://picsum.photos/seed/${id}d/900/600`,
  ];

  const [activeImg, setActiveImg] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            data-ocid="details.back.button"
            onClick={() => navigate({ to: "/results", search: { category } })}
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

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 pb-52">
        {/* Image Gallery */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {/* Main Image */}
          <div
            data-ocid="details.gallery.main"
            className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden shadow-md mb-3"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImg}
                src={images[activeImg]}
                alt={`${name} view ${activeImg + 1}`}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none rounded-2xl" />
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2">
            {images.map((img, i) => (
              <button
                type="button"
                key={img}
                data-ocid={`details.gallery.thumb.${i + 1}`}
                onClick={() => setActiveImg(i)}
                className={`flex-1 h-16 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  activeImg === i
                    ? "border-primary shadow-sm scale-[1.04]"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </motion.section>

        {/* Header Info */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="font-display font-black text-foreground text-2xl sm:text-3xl mb-2">
                {name}
              </h1>
              <div className="flex items-center gap-1.5 text-muted-foreground font-body text-sm mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{location}</span>
              </div>
              <StarRating rating={rating} />
            </div>
            <div className="text-right">
              <p className="font-display font-black text-primary text-3xl">
                {price}
              </p>
              <p className="text-xs text-muted-foreground font-body">
                per night
              </p>
            </div>
          </div>
        </motion.section>

        {/* Description */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-8"
        >
          <h2 className="font-display font-bold text-foreground text-xl mb-3">
            About this Stay
          </h2>
          <p className="text-muted-foreground font-body leading-relaxed text-sm sm:text-base">
            {getDescription(category, name)}
          </p>
        </motion.section>

        {/* Amenities */}
        <motion.section
          data-ocid="details.amenities.section"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="font-display font-bold text-foreground text-xl mb-4">
            Amenities
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {AMENITIES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 bg-accent/60 border border-primary/15 rounded-xl px-3 py-3 text-sm font-body text-foreground"
              >
                <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Check-in / Check-out */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div
            data-ocid="details.checkin.card"
            className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center gap-2 shadow-xs"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">
              Check-in
            </p>
            <p className="font-display font-bold text-foreground text-xl">
              2:00 PM
            </p>
          </div>
          <div
            data-ocid="details.checkout.card"
            className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center gap-2 shadow-xs"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">
              Check-out
            </p>
            <p className="font-display font-bold text-foreground text-xl">
              11:00 AM
            </p>
          </div>
        </motion.div>

        {/* Map & Location */}
        <motion.section
          data-ocid="details.map.section"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="font-display font-bold text-foreground text-xl mb-4">
            Location &amp; Map
          </h2>
          <PropertyMap location={location} propertyName={name} />
        </motion.section>

        {/* Rules */}
        <motion.section
          data-ocid="details.rules.section"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mb-8"
        >
          <h2 className="font-display font-bold text-foreground text-xl mb-4">
            Rules &amp; Regulations
          </h2>
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
            <ul className="space-y-3">
              {RULES.map((rule) => (
                <li
                  key={rule}
                  className="flex items-start gap-2.5 font-body text-sm text-foreground"
                >
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary block" />
                  </span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </motion.section>
      </main>

      {/* Sticky Book Now Footer — sits above the bottom nav bar (bottom-16 = 64px) */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white/97 backdrop-blur border-t border-border px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Button
            data-ocid="details.book_now.primary_button"
            onClick={() => setBookingOpen(true)}
            className="w-full h-14 text-lg font-display font-bold tracking-wide bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-md"
          >
            Book Now — {price}
          </Button>
        </div>
      </div>

      {/* Booking Form Sheet */}
      <BookingForm
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        stayName={name}
        location={location}
        price={price}
      />
    </div>
  );
}
