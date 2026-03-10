import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin, Navigation } from "lucide-react";

interface Landmark {
  name: string;
  distance: string;
}

interface LocationData {
  lat: number;
  lng: number;
  landmarks: Landmark[];
}

const LOCATION_DB: Record<string, LocationData> = {
  rishikesh: {
    lat: 30.0869,
    lng: 78.2676,
    landmarks: [
      { name: "Laxman Jhula", distance: "1.2 km" },
      { name: "Ram Jhula", distance: "2.4 km" },
      { name: "Triveni Ghat", distance: "3.1 km" },
      { name: "Rishikesh City Center", distance: "3.8 km" },
    ],
  },
  mussoorie: {
    lat: 30.4598,
    lng: 78.0664,
    landmarks: [
      { name: "Mall Road", distance: "0.8 km" },
      { name: "Gun Hill Point", distance: "1.5 km" },
      { name: "Kempty Falls", distance: "14 km" },
      { name: "Dehradun", distance: "35 km" },
    ],
  },
  nainital: {
    lat: 29.3919,
    lng: 79.4542,
    landmarks: [
      { name: "Naini Lake", distance: "0.5 km" },
      { name: "Naina Devi Temple", distance: "1.0 km" },
      { name: "Snow View Point", distance: "2.5 km" },
      { name: "Nainital Bus Stand", distance: "1.8 km" },
    ],
  },
  dehradun: {
    lat: 30.3165,
    lng: 78.0322,
    landmarks: [
      { name: "Clock Tower", distance: "2.0 km" },
      { name: "Sahastradhara", distance: "14 km" },
      { name: "Robbers Cave", distance: "8 km" },
      { name: "Dehradun Railway Station", distance: "3.5 km" },
    ],
  },
  haridwar: {
    lat: 29.9457,
    lng: 78.1642,
    landmarks: [
      { name: "Har Ki Pauri", distance: "0.9 km" },
      { name: "Chandi Devi Temple", distance: "4.0 km" },
      { name: "Mansa Devi Temple", distance: "2.5 km" },
      { name: "Haridwar Railway Station", distance: "1.5 km" },
    ],
  },
  shimla: {
    lat: 31.1048,
    lng: 77.1734,
    landmarks: [
      { name: "The Ridge", distance: "1.0 km" },
      { name: "Mall Road", distance: "0.7 km" },
      { name: "Jakhu Temple", distance: "2.5 km" },
      { name: "Shimla Railway Station", distance: "1.3 km" },
    ],
  },
  manali: {
    lat: 32.2432,
    lng: 77.1892,
    landmarks: [
      { name: "Hadimba Devi Temple", distance: "2.0 km" },
      { name: "Solang Valley", distance: "14 km" },
      { name: "Rohtang Pass", distance: "51 km" },
      { name: "Old Manali", distance: "3.0 km" },
    ],
  },
  mumbai: {
    lat: 19.076,
    lng: 72.8777,
    landmarks: [
      { name: "Gateway of India", distance: "3.2 km" },
      { name: "Marine Drive", distance: "4.5 km" },
      { name: "Chhatrapati Shivaji Terminus", distance: "5.0 km" },
      { name: "Mumbai Airport", distance: "12 km" },
    ],
  },
  delhi: {
    lat: 28.6139,
    lng: 77.209,
    landmarks: [
      { name: "India Gate", distance: "3.0 km" },
      { name: "Red Fort", distance: "5.5 km" },
      { name: "Qutub Minar", distance: "14 km" },
      { name: "IGI Airport", distance: "18 km" },
    ],
  },
  jaipur: {
    lat: 26.9124,
    lng: 75.7873,
    landmarks: [
      { name: "Hawa Mahal", distance: "2.5 km" },
      { name: "Amber Fort", distance: "11 km" },
      { name: "City Palace", distance: "3.0 km" },
      { name: "Jaipur Railway Station", distance: "4.5 km" },
    ],
  },
  goa: {
    lat: 15.2993,
    lng: 74.124,
    landmarks: [
      { name: "Calangute Beach", distance: "2.0 km" },
      { name: "Baga Beach", distance: "3.5 km" },
      { name: "Fort Aguada", distance: "8 km" },
      { name: "Goa Airport", distance: "28 km" },
    ],
  },
};

const DEFAULT_LOCATION: LocationData = {
  lat: 30.0869,
  lng: 78.2676,
  landmarks: [
    { name: "City Center", distance: "2.0 km" },
    { name: "Local Market", distance: "1.5 km" },
    { name: "Railway Station", distance: "3.0 km" },
    { name: "Bus Stand", distance: "2.5 km" },
  ],
};

function resolveLocation(locationString: string): LocationData {
  const lower = locationString.toLowerCase();
  for (const key of Object.keys(LOCATION_DB)) {
    if (lower.includes(key)) {
      return LOCATION_DB[key];
    }
  }
  return DEFAULT_LOCATION;
}

function buildOSMEmbedUrl(lat: number, lng: number): string {
  const delta = 0.04;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

function buildGoogleMapsUrl(lat: number, lng: number, label: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(label)}`;
}

interface PropertyMapProps {
  location: string;
  propertyName: string;
}

export default function PropertyMap({
  location,
  propertyName,
}: PropertyMapProps) {
  const data = resolveLocation(location);
  const embedUrl = buildOSMEmbedUrl(data.lat, data.lng);
  const mapsUrl = buildGoogleMapsUrl(data.lat, data.lng, propertyName);

  return (
    <div className="space-y-4">
      {/* Address bar */}
      <div className="flex items-start gap-2.5 bg-accent/50 border border-primary/15 rounded-xl px-4 py-3">
        <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm font-medium text-foreground">
            {propertyName}
          </p>
          <p className="font-body text-xs text-muted-foreground mt-0.5">
            {location}
          </p>
        </div>
        <Button
          asChild
          size="sm"
          variant="outline"
          data-ocid="details.map.google_maps_button"
          className="flex-shrink-0 border-primary/30 text-primary hover:bg-primary hover:text-white font-body text-xs gap-1.5 h-8 px-3"
        >
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3 h-3" />
            Open in Maps
          </a>
        </Button>
      </div>

      {/* Interactive Map */}
      <div
        data-ocid="details.map.canvas_target"
        className="rounded-2xl overflow-hidden border border-border shadow-sm"
      >
        <iframe
          title="Property Location Map"
          src={embedUrl}
          width="100%"
          height="280"
          className="block"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Nearby Landmarks */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Navigation className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold text-sm text-foreground">
            Nearby Landmarks
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {data.landmarks.map((lm) => (
            <div
              key={lm.name}
              className="flex items-center justify-between bg-accent/40 rounded-lg px-3 py-2 gap-2"
            >
              <span className="font-body text-xs text-foreground truncate">
                {lm.name}
              </span>
              <span className="font-body text-xs font-semibold text-primary flex-shrink-0">
                {lm.distance}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
