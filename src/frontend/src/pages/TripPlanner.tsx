import { loadHighlights } from "@/components/DestinationHighlightsTab";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  ChevronDown,
  Clock,
  Coffee,
  MapPin,
  Sparkles,
  Star,
  TreePine,
  Users,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const DESTINATIONS = [
  "Rishikesh",
  "Mussoorie",
  "Nainital",
  "Dehradun",
  "Auli",
  "Chopta",
  "Lansdowne",
  "Jim Corbett",
  "Haridwar",
  "Chakrata",
];

const BUDGET_RANGES = [
  {
    label: "Budget (₹5,000 – ₹10,000)",
    value: "budget",
    min: 5000,
    max: 10000,
  },
  {
    label: "Mid-range (₹10,000 – ₹25,000)",
    value: "midrange",
    min: 10000,
    max: 25000,
  },
  { label: "Luxury (₹25,000+)", value: "luxury", min: 25000, max: 100000 },
];

const TRAVEL_TYPES = [
  { label: "Family", emoji: "👨‍👩‍👧‍👦", value: "family" },
  { label: "Solo", emoji: "🧳", value: "solo" },
  { label: "Couple", emoji: "💑", value: "couple" },
];

type TravelType = "family" | "solo" | "couple";
type BudgetType = "budget" | "midrange" | "luxury";

interface Hotel {
  name: string;
  type: string;
  price: number;
  rating: number;
  amenities: string[];
  image: string;
}

interface DayPlan {
  day: number;
  title: string;
  activities: { time: string; activity: string; icon: string }[];
}

interface TripPlan {
  destination: string;
  duration: number;
  travelType: TravelType;
  suggestedHotels: Hotel[];
  attractions: { name: string; category: string; distance: string }[];
  itinerary: DayPlan[];
  tips: string[];
}

const DESTINATION_DATA: Record<
  string,
  {
    attractions: { name: string; category: string; distance: string }[];
    tips: Record<TravelType, string[]>;
    defaultDuration: number;
  }
> = {
  Rishikesh: {
    attractions: [
      { name: "Laxman Jhula", category: "Landmark", distance: "2 km" },
      { name: "Ram Jhula", category: "Bridge", distance: "3 km" },
      { name: "Triveni Ghat", category: "Spiritual", distance: "1 km" },
      { name: "Rajaji National Park", category: "Wildlife", distance: "18 km" },
      { name: "Beatles Ashram", category: "Heritage", distance: "5 km" },
      { name: "Neer Garh Waterfall", category: "Nature", distance: "8 km" },
    ],
    tips: {
      family: [
        "Pack light rainwear for evening Ganga Aarti",
        "Book river-view rooms for kids",
        "Avoid peak summer afternoons for sightseeing",
      ],
      solo: [
        "Try a yoga retreat at least one morning",
        "Join white-water rafting groups at Shivpuri",
        "Visit Beatles Ashram at sunrise for stunning views",
      ],
      couple: [
        "Book a candlelight dinner by the Ganges",
        "Take an evening bungee jump at Mohan Chatti",
        "Sunrise meditation at Parmarth Niketan Ashram",
      ],
    },
    defaultDuration: 3,
  },
  Mussoorie: {
    attractions: [
      { name: "Gun Hill", category: "Viewpoint", distance: "2 km" },
      { name: "Kempty Falls", category: "Waterfall", distance: "15 km" },
      { name: "Mall Road", category: "Shopping", distance: "0.5 km" },
      { name: "Camel's Back Road", category: "Walk", distance: "1 km" },
      { name: "Landour Cantonment", category: "Heritage", distance: "4 km" },
      { name: "Cloud's End", category: "Nature", distance: "6 km" },
    ],
    tips: {
      family: [
        "Book cable car tickets to Gun Hill in advance",
        "Carry warm layers even in summer",
        "Kids love Kempty Falls — bring a change of clothes",
      ],
      solo: [
        "Walk the Camel's Back Road at dawn for misty views",
        "Explore Landour's local bakeries and bookshops",
        "Try the local Garhwali food at Mall Road",
      ],
      couple: [
        "Sunset at Cloud's End is magical and rarely crowded",
        "Stay in a heritage colonial cottage for a vintage feel",
        "Horse riding on Camel's Back Road at dusk",
      ],
    },
    defaultDuration: 2,
  },
  Nainital: {
    attractions: [
      { name: "Naini Lake", category: "Lake", distance: "0.5 km" },
      { name: "Snow View Point", category: "Viewpoint", distance: "2 km" },
      { name: "Naina Devi Temple", category: "Spiritual", distance: "0.3 km" },
      { name: "Tiffin Top", category: "Trek", distance: "4 km" },
      { name: "Eco Cave Gardens", category: "Nature", distance: "3 km" },
      { name: "The Mall Road", category: "Shopping", distance: "0.1 km" },
    ],
    tips: {
      family: [
        "Early morning boat ride on Naini Lake is crowd-free",
        "Eco Cave Gardens is ideal for children",
        "Evening at Mall Road with local street food",
      ],
      solo: [
        "Trek to Tiffin Top for panoramic Himalayan views",
        "Hire a cycle and explore the lake perimeter",
        "Chat with locals in the old bazaar for hidden gems",
      ],
      couple: [
        "Sunset boat ride on Naini Lake is a must",
        "Book a room with lake view for a romantic stay",
        "Enjoy candlelight dinner at a lakeside restaurant",
      ],
    },
    defaultDuration: 2,
  },
  Dehradun: {
    attractions: [
      { name: "Sahastradhara", category: "Waterfall", distance: "14 km" },
      { name: "Robber's Cave", category: "Nature", distance: "8 km" },
      {
        name: "Forest Research Institute",
        category: "Heritage",
        distance: "5 km",
      },
      { name: "Tapkeshwar Temple", category: "Spiritual", distance: "6 km" },
      { name: "Mindrolling Monastery", category: "Culture", distance: "10 km" },
      { name: "Lacchiwala", category: "Picnic", distance: "23 km" },
    ],
    tips: {
      family: [
        "Robber's Cave is a fun cave walk for all ages",
        "Sahastradhara's sulphur springs are relaxing",
        "FRI campus is perfect for a peaceful afternoon walk",
      ],
      solo: [
        "Mindrolling Monastery offers a meditative experience",
        "Try local food at Paltan Bazaar in the evening",
        "Early morning at Tapkeshwar Temple is blissful",
      ],
      couple: [
        "Sahastradhara waterfall picnic at golden hour",
        "Evening walk around Clock Tower area",
        "Wine tasting at Mohan Meakin Brewery is a hidden gem",
      ],
    },
    defaultDuration: 2,
  },
  Auli: {
    attractions: [
      { name: "Auli Ski Resort", category: "Adventure", distance: "0 km" },
      { name: "Auli Cable Car", category: "Experience", distance: "1 km" },
      { name: "Gorson Bugyal", category: "Meadow", distance: "3 km" },
      { name: "Kwani Bugyal", category: "Trek", distance: "8 km" },
      { name: "Joshimath", category: "Town", distance: "13 km" },
      { name: "Nanda Devi View", category: "Viewpoint", distance: "0.5 km" },
    ],
    tips: {
      family: [
        "Cable car ride is safe and stunning for families",
        "Warm clothing mandatory even in June",
        "Book ski lessons in advance during winter season",
      ],
      solo: [
        "Trek to Gorson Bugyal for solitude and snow views",
        "Best for solo trekkers in April–June",
        "Stay in government GMVN lodges for budget travel",
      ],
      couple: [
        "Romantic snow skiing in January-February",
        "Nanda Devi view from the ski slopes at sunrise",
        "Hot cocoa and bonfire stays in mountain cabins",
      ],
    },
    defaultDuration: 3,
  },
  Chopta: {
    attractions: [
      { name: "Tungnath Temple", category: "Spiritual", distance: "4 km" },
      { name: "Chandrashila Peak", category: "Trek", distance: "5 km" },
      { name: "Deoria Tal", category: "Lake", distance: "15 km" },
      { name: "Ukhimath", category: "Heritage", distance: "8 km" },
      { name: "Bisurital", category: "Nature", distance: "12 km" },
    ],
    tips: {
      family: [
        "Best for families with older children (teens+)",
        "Trek to Tungnath is moderate and very rewarding",
        "Stay in tent camps for a unique family experience",
      ],
      solo: [
        "Chandrashila summit at sunrise for 360° Himalayan view",
        "Overnight in Chopta camp for stargazing",
        "Off-season (Oct-Nov) is best for solitude and snow",
      ],
      couple: [
        "Stargazing from Chandrashila base camp is unforgettable",
        "Deoria Tal lake reflection of Chaukhamba is stunning",
        "Cozy wooden cottages with fireplace make a romantic escape",
      ],
    },
    defaultDuration: 3,
  },
};

const DEFAULT_DATA = {
  attractions: [
    { name: "Local Market", category: "Shopping", distance: "1 km" },
    { name: "Viewpoint Hill", category: "Viewpoint", distance: "3 km" },
    { name: "Ancient Temple", category: "Spiritual", distance: "2 km" },
    { name: "Nature Reserve", category: "Wildlife", distance: "10 km" },
    { name: "Waterfall Trail", category: "Nature", distance: "6 km" },
  ],
  tips: {
    family: [
      "Book accommodations with family rooms in advance",
      "Carry snacks and light jackets",
      "Plan sightseeing in the mornings before crowds",
    ],
    solo: [
      "Stay in hostels or guesthouses for social connections",
      "Rent a bike to explore freely",
      "Early risers get the best views",
    ],
    couple: [
      "Book a romantic cottage or lake-view room",
      "Enjoy a sunset picnic at the viewpoint",
      "Check for couple-friendly spa packages",
    ],
  },
  defaultDuration: 2,
};

const HOTEL_NAMES_BY_BUDGET: Record<
  BudgetType,
  { prefix: string[]; suffix: string[] }
> = {
  budget: {
    prefix: ["Hilltop", "Valley", "Green", "Sunrise", "Pine"],
    suffix: ["Guesthouse", "Homestay", "Lodge", "Inn"],
  },
  midrange: {
    prefix: ["Mountain", "Heritage", "Vista", "Maple", "Cedar"],
    suffix: ["Cottage", "Resort", "Retreat", "Hotel"],
  },
  luxury: {
    prefix: ["Grand", "Royal", "Taj", "Himalayan", "Imperial"],
    suffix: ["Palace", "Grand Resort", "Luxury Retreat", "Spa Resort"],
  },
};

const AMENITY_POOLS: Record<BudgetType, string[]> = {
  budget: [
    "Free WiFi",
    "Parking",
    "Hot Water",
    "Room Service",
    "Mountain View",
  ],
  midrange: [
    "Free WiFi",
    "Parking",
    "Restaurant",
    "24/7 Support",
    "Mountain View",
    "Garden",
  ],
  luxury: [
    "Free WiFi",
    "Pool",
    "Spa",
    "Restaurant",
    "Room Service",
    "Mountain View",
    "Helipad",
    "Concierge",
  ],
};

const HOTEL_IMAGES = [
  "/assets/generated/category-hotels.dim_600x400.jpg",
  "/assets/generated/category-resorts.dim_600x400.jpg",
  "/assets/generated/category-homestays.dim_600x400.jpg",
  "/assets/generated/category-guesthouses.dim_600x400.jpg",
];

const HOTEL_TYPES: Record<BudgetType, string[]> = {
  budget: ["Guesthouse", "Homestay", "Dormitory Lodge"],
  midrange: ["Boutique Hotel", "Heritage Cottage", "Mountain Resort"],
  luxury: ["Luxury Resort", "Spa Retreat", "Heritage Palace"],
};

function generateHotels(
  destination: string,
  budget: BudgetType,
  travelType: TravelType,
): Hotel[] {
  const names = HOTEL_NAMES_BY_BUDGET[budget];
  const amenities = AMENITY_POOLS[budget];
  const types = HOTEL_TYPES[budget];
  const priceRanges: Record<BudgetType, [number, number]> = {
    budget: [1800, 4500],
    midrange: [4500, 14000],
    luxury: [18000, 55000],
  };
  const [minP, maxP] = priceRanges[budget];

  const travelBonus =
    travelType === "couple"
      ? ["Couple Package", "Romantic Dinner"]
      : travelType === "family"
        ? ["Kids Play Area", "Family Dining"]
        : ["Solo Discount", "Laundry"];

  return [0, 1, 2].map((i) => ({
    name: `${names.prefix[i % names.prefix.length]} ${destination} ${names.suffix[i % names.suffix.length]}`,
    type: types[i % types.length],
    price: Math.floor(minP + ((maxP - minP) / 3) * (i + 0.5)),
    rating: Number.parseFloat((4.2 + i * 0.2).toFixed(1)),
    amenities: [
      ...amenities.slice(0, 3 + i),
      travelBonus[i % travelBonus.length],
    ],
    image: HOTEL_IMAGES[i % HOTEL_IMAGES.length],
  }));
}

function generateItinerary(
  destination: string,
  duration: number,
  travelType: TravelType,
): DayPlan[] {
  const data = DESTINATION_DATA[destination] || DEFAULT_DATA;
  const attractions = [...data.attractions];

  const activityTemplates: Record<
    TravelType,
    Record<number, { time: string; activity: string; icon: string }[]>
  > = {
    family: {
      1: [
        {
          time: "08:00 AM",
          activity: `Arrive in ${destination}, check in & freshen up`,
          icon: "🏨",
        },
        {
          time: "11:00 AM",
          activity: `Visit ${attractions[0]?.name || "local landmark"} with family`,
          icon: "🗺️",
        },
        {
          time: "01:00 PM",
          activity: "Family lunch at a local Garhwali restaurant",
          icon: "🍽️",
        },
        {
          time: "04:00 PM",
          activity: `Explore ${attractions[1]?.name || "market area"} and local bazaar`,
          icon: "🛍️",
        },
        {
          time: "07:00 PM",
          activity: "Evening at hotel – kids' activities & family dinner",
          icon: "🌙",
        },
      ],
      2: [
        {
          time: "07:00 AM",
          activity: "Sunrise walk and morning yoga (optional)",
          icon: "🌅",
        },
        {
          time: "10:00 AM",
          activity: `${attractions[2]?.name || "Nature trail"} visit`,
          icon: "🏔️",
        },
        {
          time: "12:30 PM",
          activity: "Picnic lunch at a scenic spot",
          icon: "🧺",
        },
        {
          time: "03:00 PM",
          activity: `${attractions[3]?.name || "Local activity"} – great for kids`,
          icon: "🎉",
        },
        {
          time: "06:00 PM",
          activity: "Evening stroll and street food at the main market",
          icon: "🌆",
        },
      ],
      3: [
        {
          time: "08:00 AM",
          activity:
            "Leisure morning – hotel breakfast & swimming (if available)",
          icon: "☀️",
        },
        {
          time: "11:00 AM",
          activity: `Day trip to ${attractions[4]?.name || "nearby attraction"}`,
          icon: "🚗",
        },
        {
          time: "02:00 PM",
          activity: "Late lunch and souvenir shopping",
          icon: "🛒",
        },
        {
          time: "05:00 PM",
          activity: "Check out & depart with cherished memories",
          icon: "👋",
        },
      ],
    },
    couple: {
      1: [
        {
          time: "09:00 AM",
          activity: `Arrive in ${destination}, check into romantic retreat`,
          icon: "🏨",
        },
        {
          time: "11:30 AM",
          activity: `Stroll around ${attractions[0]?.name || "scenic viewpoint"}`,
          icon: "💑",
        },
        {
          time: "01:00 PM",
          activity: "Candlelight lunch at a riverside or hilltop café",
          icon: "🍷",
        },
        {
          time: "04:00 PM",
          activity: `Visit ${attractions[1]?.name || "heritage site"} at golden hour`,
          icon: "📸",
        },
        {
          time: "07:30 PM",
          activity: "Romantic sunset dinner at hotel with valley views",
          icon: "🌇",
        },
      ],
      2: [
        {
          time: "07:00 AM",
          activity: "Sunrise yoga or meditation session together",
          icon: "🧘",
        },
        {
          time: "10:00 AM",
          activity: `${attractions[2]?.name || "Private nature walk"} – serene and peaceful`,
          icon: "🌿",
        },
        {
          time: "12:30 PM",
          activity: "Gourmet lunch at boutique café",
          icon: "🍽️",
        },
        {
          time: "03:00 PM",
          activity: `Couples spa treatment or ${attractions[3]?.name || "lakeside activity"}`,
          icon: "💆",
        },
        {
          time: "07:00 PM",
          activity: "Stargazing bonfire dinner in the open air",
          icon: "✨",
        },
      ],
      3: [
        {
          time: "08:00 AM",
          activity: "Leisurely breakfast with mountain view",
          icon: "☕",
        },
        {
          time: "11:00 AM",
          activity: `Adventure activity – ${attractions[4]?.name || "short trek or bike ride"}`,
          icon: "🏕️",
        },
        {
          time: "01:30 PM",
          activity: "Farewell lunch with local specialties",
          icon: "🥘",
        },
        {
          time: "04:00 PM",
          activity: "Check out – depart with beautiful memories",
          icon: "💖",
        },
      ],
    },
    solo: {
      1: [
        {
          time: "07:00 AM",
          activity: `Arrive in ${destination}, check into guesthouse or hostel`,
          icon: "🏨",
        },
        {
          time: "09:30 AM",
          activity: `Explore ${attractions[0]?.name || "main attraction"} solo at your pace`,
          icon: "🧳",
        },
        {
          time: "12:00 PM",
          activity: "Lunch at a local dhaba – try regional cuisine",
          icon: "🍲",
        },
        {
          time: "03:00 PM",
          activity: `${attractions[1]?.name || "Cultural site"} and photography walk`,
          icon: "📷",
        },
        {
          time: "06:00 PM",
          activity: "Sunset at a hilltop café with journal writing",
          icon: "📓",
        },
      ],
      2: [
        {
          time: "06:00 AM",
          activity: "Early sunrise hike or nature walk",
          icon: "🌄",
        },
        {
          time: "09:00 AM",
          activity: `${attractions[2]?.name || "Heritage walk"} with audio guide`,
          icon: "🎧",
        },
        {
          time: "11:30 AM",
          activity: "Street food exploration and local market",
          icon: "🌮",
        },
        {
          time: "02:00 PM",
          activity: `${attractions[3]?.name || "Adventure activity"} – rafting, trekking or cycling`,
          icon: "🚵",
        },
        {
          time: "06:00 PM",
          activity: "Evening yoga class or meditation session",
          icon: "🧘",
        },
      ],
      3: [
        {
          time: "07:00 AM",
          activity: "Slow morning with local chai and newspaper",
          icon: "☕",
        },
        {
          time: "10:00 AM",
          activity: `Final visit to ${attractions[4]?.name || "one last hidden gem"}`,
          icon: "🗺️",
        },
        {
          time: "12:30 PM",
          activity: "Farewell meal with a new friend from your stay",
          icon: "🤝",
        },
        {
          time: "03:00 PM",
          activity: "Check out & head to next adventure",
          icon: "🚀",
        },
      ],
    },
  };

  return Array.from({ length: duration }, (_, i) => ({
    day: i + 1,
    title:
      i === 0
        ? "Arrival & First Impressions"
        : i === duration - 1
          ? "Last Day & Departure"
          : `Day ${i + 1} – Explore & Discover`,
    activities:
      activityTemplates[travelType][(i % 3) + 1] ||
      activityTemplates[travelType][1],
  }));
}

function generatePlan(
  destination: string,
  checkin: string,
  checkout: string,
  budget: BudgetType,
  travelType: TravelType,
): TripPlan {
  const data = DESTINATION_DATA[destination] || DEFAULT_DATA;

  let duration = data.defaultDuration;
  if (checkin && checkout) {
    const d1 = new Date(checkin);
    const d2 = new Date(checkout);
    const diff = Math.round(
      (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff > 0 && diff <= 10) duration = diff;
  }

  // Merge curated highlights from Super Admin
  const highlights = loadHighlights();
  const curated = highlights.find(
    (h) => h.destination.toLowerCase() === destination.toLowerCase(),
  );

  const baseAttractions = data.attractions;
  const mergedAttractions = curated
    ? [
        ...curated.attractions,
        ...baseAttractions.filter(
          (a) => !curated.attractions.some((ca) => ca.name === a.name),
        ),
      ]
    : baseAttractions;

  const baseHotels = generateHotels(destination, budget, travelType);
  const curatedHotels = curated
    ? curated.recommendedHotels.map((h) => ({
        name: h.name,
        type: h.type,
        price: h.pricePerNight,
        rating: h.rating,
        amenities: ["WiFi", "Breakfast", "Parking"],
        image:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
      }))
    : [];
  const mergedHotels =
    curatedHotels.length > 0
      ? [...curatedHotels, ...baseHotels].slice(0, 5)
      : baseHotels;

  return {
    destination,
    duration,
    travelType,
    suggestedHotels: mergedHotels,
    attractions: mergedAttractions,
    itinerary: generateItinerary(destination, duration, travelType),
    tips:
      (data.tips as Record<TravelType, string[]>)[travelType] ||
      DEFAULT_DATA.tips[travelType],
  };
}

const CATEGORY_ICONS: Record<string, string> = {
  Landmark: "🏛️",
  Bridge: "🌉",
  Spiritual: "🙏",
  Wildlife: "🐘",
  Heritage: "🏯",
  Nature: "🌿",
  Waterfall: "💧",
  Shopping: "🛍️",
  Walk: "🚶",
  Adventure: "⛷️",
  Experience: "🎢",
  Meadow: "🌼",
  Trek: "🥾",
  Town: "🏘️",
  Viewpoint: "🏔️",
  Lake: "🏞️",
  Picnic: "🧺",
  Culture: "🎭",
  default: "📍",
};

export default function TripPlanner() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [budget, setBudget] = useState<BudgetType>("midrange");
  const [travelType, setTravelType] = useState<TravelType>("family");
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(1);

  const today = new Date().toISOString().split("T")[0];

  const handleGenerate = () => {
    if (!destination) return;
    setLoading(true);
    setPlan(null);
    setTimeout(() => {
      const result = generatePlan(
        destination,
        checkin,
        checkout,
        budget,
        travelType,
      );
      setPlan(result);
      setActiveDay(1);
      setLoading(false);
    }, 1800);
  };

  const canGenerate = !!destination;

  return (
    <div className="min-h-screen bg-[#F8F8F6] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            data-ocid="trip_planner.back.button"
            onClick={() => navigate({ to: "/dashboard" })}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1F7A4C] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-black text-[#1F7A4C] text-base tracking-wide leading-tight">
                AI Trip Planner
              </h1>
              <p className="text-xs text-gray-400 leading-tight">
                Smart itineraries for India
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src="/assets/generated/hero-alpine-luxury.dim_1600x900.jpg"
            alt="Trip planner banner"
            className="w-full h-36 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1F7A4C]/80 to-black/40 flex items-center px-6">
            <div>
              <p className="text-white/90 text-xs font-semibold uppercase tracking-widest mb-1">
                Plan Your Trip
              </p>
              <h2 className="text-white font-black text-2xl leading-tight drop-shadow">
                Your Perfect India
                <br />
                Adventure Awaits
              </h2>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5"
          data-ocid="trip_planner.form.panel"
        >
          <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#1F7A4C]" /> Tell us about your
            trip
          </h3>

          {/* Destination */}
          <div>
            <p className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              Destination *
            </p>
            <div className="relative">
              <select
                data-ocid="trip_planner.destination.select"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1F7A4C] appearance-none"
              >
                <option value="">Choose a destination in Uttarakhand…</option>
                {DESTINATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Travel Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                <CalendarDays className="w-3 h-3 inline mr-1" />
                Check-in
              </p>
              <input
                data-ocid="trip_planner.checkin.input"
                type="date"
                value={checkin}
                min={today}
                onChange={(e) => setCheckin(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1F7A4C]"
              />
            </div>
            <div>
              <p className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                <CalendarDays className="w-3 h-3 inline mr-1" />
                Check-out
              </p>
              <input
                data-ocid="trip_planner.checkout.input"
                type="date"
                value={checkout}
                min={checkin || today}
                onChange={(e) => setCheckout(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1F7A4C]"
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <p className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              <Wallet className="w-3 h-3 inline mr-1" />
              Budget Range
            </p>
            <div className="relative">
              <select
                data-ocid="trip_planner.budget.select"
                value={budget}
                onChange={(e) => setBudget(e.target.value as BudgetType)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1F7A4C] appearance-none"
              >
                {BUDGET_RANGES.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Travel Type */}
          <div>
            <p className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              <Users className="w-3 h-3 inline mr-1" />
              Travel Type
            </p>
            <div
              className="grid grid-cols-3 gap-2"
              data-ocid="trip_planner.travel_type.panel"
            >
              {TRAVEL_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  data-ocid={`trip_planner.${t.value}.toggle`}
                  onClick={() => setTravelType(t.value as TravelType)}
                  className={`rounded-xl py-3 text-center text-sm font-semibold border-2 transition-all ${
                    travelType === t.value
                      ? "border-[#1F7A4C] bg-[#1F7A4C]/10 text-[#1F7A4C]"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#1F7A4C]/40"
                  }`}
                >
                  <span className="block text-xl mb-0.5">{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            data-ocid="trip_planner.generate.primary_button"
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className="w-full bg-[#1F7A4C] hover:bg-[#166038] text-white font-bold rounded-xl py-4 text-base flex items-center justify-center gap-2 shadow-md transition-all"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
                Crafting your itinerary…
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate My Trip Plan
              </>
            )}
          </Button>
        </div>

        {/* Loading state */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              data-ocid="trip_planner.loading_state"
              className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100"
            >
              <div className="flex justify-center mb-4">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{
                    duration: 1.2,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                  className="w-16 h-16 rounded-full bg-[#1F7A4C]/10 flex items-center justify-center"
                >
                  <Sparkles className="w-8 h-8 text-[#1F7A4C]" />
                </motion.div>
              </div>
              <p className="font-bold text-gray-800 text-base">
                Crafting your perfect itinerary…
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Curating stays, attractions & day plans
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {plan && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
              data-ocid="trip_planner.results.panel"
            >
              {/* Summary bar */}
              <div className="bg-[#1F7A4C] rounded-2xl p-5 text-white flex flex-wrap gap-4 justify-between items-center">
                <div>
                  <p className="text-white/70 text-xs uppercase tracking-widest font-semibold">
                    Your Trip to
                  </p>
                  <h2 className="font-black text-2xl">{plan.destination}</h2>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-black">{plan.duration}</p>
                    <p className="text-white/70 text-xs">Days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black">
                      {plan.suggestedHotels[0] &&
                        `₹${plan.suggestedHotels[0].price.toLocaleString("en-IN")}`}
                    </p>
                    <p className="text-white/70 text-xs">From/night</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black">
                      {
                        TRAVEL_TYPES.find((t) => t.value === plan.travelType)
                          ?.emoji
                      }
                    </p>
                    <p className="text-white/70 text-xs capitalize">
                      {plan.travelType}
                    </p>
                  </div>
                </div>
              </div>

              {/* Day-by-day Itinerary */}
              <div
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                data-ocid="trip_planner.itinerary.panel"
              >
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-[#1F7A4C]" />{" "}
                    Day-by-Day Itinerary
                  </h3>
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {plan.itinerary.map((day) => (
                      <button
                        type="button"
                        key={day.day}
                        data-ocid={`trip_planner.day_${day.day}.tab`}
                        onClick={() => setActiveDay(day.day)}
                        className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          activeDay === day.day
                            ? "bg-[#1F7A4C] text-white border-[#1F7A4C]"
                            : "border-gray-200 text-gray-500 hover:border-[#1F7A4C]/50"
                        }`}
                      >
                        Day {day.day}
                      </button>
                    ))}
                  </div>
                </div>
                {plan.itinerary
                  .filter((d) => d.day === activeDay)
                  .map((day) => (
                    <div key={day.day} className="p-4">
                      <p className="text-[#1F7A4C] font-bold text-sm mb-4">
                        {day.title}
                      </p>
                      <div className="space-y-0">
                        {day.activities.map((act, i) => (
                          <div
                            key={act.time + act.activity}
                            className="flex gap-3 group"
                          >
                            <div className="flex flex-col items-center">
                              <div className="w-9 h-9 rounded-full bg-[#1F7A4C]/10 flex items-center justify-center text-lg shrink-0">
                                {act.icon}
                              </div>
                              {i < day.activities.length - 1 && (
                                <div className="w-0.5 h-6 bg-gray-100 my-1" />
                              )}
                            </div>
                            <div className="pb-4 pt-1">
                              <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {act.time}
                              </p>
                              <p className="text-sm text-gray-800 font-medium leading-snug">
                                {act.activity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Suggested Hotels */}
              <div data-ocid="trip_planner.hotels.panel">
                <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 mb-3">
                  <Coffee className="w-4 h-4 text-[#1F7A4C]" /> Suggested Stays
                </h3>
                <div className="space-y-3">
                  {plan.suggestedHotels.map((hotel, i) => (
                    <motion.div
                      key={hotel.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      data-ocid={`trip_planner.hotel.item.${i + 1}`}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex"
                    >
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-28 h-28 object-cover shrink-0"
                      />
                      <div className="p-3 flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-800 text-sm leading-tight truncate">
                              {hotel.name}
                            </h4>
                            <p className="text-gray-400 text-xs mt-0.5">
                              {hotel.type}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full shrink-0">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold text-gray-700">
                              {hotel.rating}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {hotel.amenities.slice(0, 3).map((am) => (
                            <Badge
                              key={am}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            >
                              {am}
                            </Badge>
                          ))}
                        </div>
                        <p className="mt-2 text-[#1F7A4C] font-black text-sm">
                          ₹{hotel.price.toLocaleString("en-IN")}
                          <span className="text-gray-400 text-xs font-normal">
                            {" "}
                            /night
                          </span>
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Nearby Attractions */}
              <div data-ocid="trip_planner.attractions.panel">
                <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 mb-3">
                  <Camera className="w-4 h-4 text-[#1F7A4C]" /> Nearby
                  Attractions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {plan.attractions.map((attr, i) => (
                    <div
                      key={attr.name}
                      data-ocid={`trip_planner.attraction.item.${i + 1}`}
                      className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm"
                    >
                      <span className="text-xl">
                        {CATEGORY_ICONS[attr.category] ||
                          CATEGORY_ICONS.default}
                      </span>
                      <p className="font-semibold text-gray-800 text-sm mt-1 leading-tight">
                        {attr.name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant="outline" className="text-[10px] px-1.5">
                          {attr.category}
                        </Badge>
                        <span className="text-gray-400 text-[11px] flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          {attr.distance}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Travel Tips */}
              <div
                className="bg-[#FF9933]/10 border border-[#FF9933]/30 rounded-2xl p-5"
                data-ocid="trip_planner.tips.panel"
              >
                <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 mb-3">
                  <TreePine className="w-4 h-4 text-[#FF9933]" /> Travel Tips
                  for{" "}
                  {plan.travelType === "family"
                    ? "Families"
                    : plan.travelType === "couple"
                      ? "Couples"
                      : "Solo Travelers"}
                </h3>
                <ul className="space-y-2">
                  {plan.tips.map((tip) => (
                    <li
                      key={tip}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="text-[#FF9933] font-bold mt-0.5">✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="flex gap-3">
                <Button
                  data-ocid="trip_planner.search_stays.primary_button"
                  onClick={() =>
                    navigate({ to: "/search", search: { category: "Hotels" } })
                  }
                  className="flex-1 bg-[#1F7A4C] hover:bg-[#166038] text-white font-bold rounded-xl py-4 text-sm"
                >
                  Search Stays in {plan.destination}
                </Button>
                <Button
                  data-ocid="trip_planner.replan.secondary_button"
                  variant="outline"
                  onClick={() => {
                    setPlan(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-5 rounded-xl border-[#1F7A4C] text-[#1F7A4C] font-bold"
                >
                  Replan
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
