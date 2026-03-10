import { RefreshCw, X } from "lucide-react";
import { useState } from "react";
import type { VirtualTour } from "./VirtualTourManager";

const STORAGE_KEY = "hidestay_virtual_tours";

const SAMPLE_TOURS: VirtualTour[] = [
  {
    id: "sample-1",
    roomName: "Himalayan Suite",
    roomType: "Suite",
    description:
      "Panoramic mountain views from the comfort of a luxurious king-size suite with private balcony.",
    imageDataUrl: "https://picsum.photos/seed/room1/1200/600",
  },
  {
    id: "sample-2",
    roomName: "Valley View Deluxe",
    roomType: "Deluxe Room",
    description:
      "Warm wood interiors and floor-to-ceiling windows overlooking the Uttarakhand valley.",
    imageDataUrl: "https://picsum.photos/seed/room2/1200/600",
  },
  {
    id: "sample-3",
    roomName: "Family Retreat",
    roomType: "Family Room",
    description:
      "Spacious two-bedroom layout with a cozy living area, perfect for family getaways.",
    imageDataUrl: "https://picsum.photos/seed/room3/1200/600",
  },
];

function TourCard({
  tour,
  index,
  onExpand,
}: {
  tour: VirtualTour;
  index: number;
  onExpand: (tour: VirtualTour) => void;
}) {
  return (
    <button
      type="button"
      data-ocid={`details.virtual_tour.item.${index + 1}`}
      className="rounded-2xl border border-border overflow-hidden shadow-xs bg-card group cursor-pointer text-left w-full"
      onClick={() => onExpand(tour)}
    >
      {/* Panorama image with pan effect */}
      <style>{`
        @keyframes pan360preview {
          0% { transform: translateX(0); }
          50% { transform: translateX(-18%); }
          100% { transform: translateX(0); }
        }
        .pan-on-hover:hover {
          animation: pan360preview 5s ease-in-out infinite;
        }
      `}</style>
      <div className="relative h-44 overflow-hidden bg-black">
        <img
          src={tour.imageDataUrl}
          alt={tour.roomName}
          className="pan-on-hover w-[130%] max-w-none h-full object-cover transition-transform"
        />
        {/* 360° badge */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-black/70 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
          <RefreshCw className="w-3 h-3" />
          360°
        </span>
        {/* Room type badge */}
        <span
          className="absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: "#FF9933", color: "#1a1a1a" }}
        >
          {tour.roomType}
        </span>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow">
            Click to expand
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-bold text-foreground">
          {tour.roomName}
        </h3>
        {tour.description && (
          <p className="text-sm text-muted-foreground font-body mt-1 line-clamp-2">
            {tour.description}
          </p>
        )}
      </div>
    </button>
  );
}

export default function VirtualTourSection({
  propertyId: _propertyId,
}: {
  propertyId: string;
}) {
  const [expandedTour, setExpandedTour] = useState<VirtualTour | null>(null);

  const tours: VirtualTour[] = (() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed: VirtualTour[] = stored ? JSON.parse(stored) : [];
      return parsed.length > 0 ? parsed : SAMPLE_TOURS;
    } catch {
      return SAMPLE_TOURS;
    }
  })();

  if (tours.length === 0) return null;

  return (
    <section data-ocid="details.virtual_tour.section" className="mb-8">
      <h2 className="font-display font-bold text-foreground text-xl mb-1">
        360° Room Tours
      </h2>
      <p className="text-sm text-muted-foreground font-body mb-4">
        Hover over an image to look around. Click to view full screen.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tours.map((tour, i) => (
          <TourCard
            key={tour.id}
            tour={tour}
            index={i}
            onExpand={setExpandedTour}
          />
        ))}
      </div>

      {/* Full-screen modal */}
      {expandedTour && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click-to-close is supplemental; X button handles keyboard
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center"
          onClick={() => setExpandedTour(null)}
        >
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation only, close button handles keyboard */}
          <div
            className="relative max-w-5xl w-full px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display font-bold text-white text-xl">
                  {expandedTour.roomName}
                </h3>
                <span
                  className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1"
                  style={{ background: "#FF9933", color: "#1a1a1a" }}
                >
                  {expandedTour.roomType}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setExpandedTour(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div
              className="overflow-hidden rounded-2xl"
              style={{ maxHeight: "60vh" }}
            >
              <img
                src={expandedTour.imageDataUrl}
                alt={expandedTour.roomName}
                className="w-full h-full object-cover"
                style={{ maxHeight: "60vh" }}
              />
            </div>
            {expandedTour.description && (
              <p className="text-white/80 font-body text-sm mt-3 text-center">
                {expandedTour.description}
              </p>
            )}
            <p className="text-white/50 font-body text-xs mt-2 text-center">
              Tap outside or press close to exit
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
