import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "@tanstack/react-router";
import { Globe, MapPin, Star, X, ZoomIn, ZoomOut } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface TourAreaImage {
  url: string;
  description?: string;
}

interface TourArea {
  images: TourAreaImage[];
}

interface StayVerseTour {
  id: string;
  tourName: string;
  city: string;
  rating: number;
  image: string;
  status?: string;
  propertyId?: string;
  areas: {
    lobby?: TourArea;
    rooms?: TourArea;
    balcony?: TourArea;
    restaurant?: TourArea;
    pool?: TourArea;
    [key: string]: TourArea | undefined;
  };
  hotspots?: Array<{
    fromArea: string;
    toArea: string;
    label: string;
  }>;
}

const AREA_LABELS: Record<string, string> = {
  lobby: "Lobby",
  rooms: "Rooms",
  balcony: "Balcony",
  restaurant: "Restaurant",
  pool: "Pool",
};

function PanoramaViewer({
  imageUrl,
  altText,
}: {
  imageUrl: string;
  altText: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [panX, setPanX] = useState(0);
  const [zoom, setZoom] = useState(1);
  const lastX = useRef(0);
  const totalPan = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - lastX.current;
    lastX.current = e.clientX;
    totalPan.current += delta;
    setPanX(totalPan.current);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    lastX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientX - lastX.current;
    lastX.current = e.touches[0].clientX;
    totalPan.current += delta;
    setPanX(totalPan.current);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(3, Math.max(1, z - e.deltaY * 0.001)));
  };

  return (
    <div
      ref={containerRef}
      data-ocid="stayverse_viewer.canvas_target"
      className="relative w-full overflow-hidden bg-black select-none"
      style={{ height: "340px", cursor: isDragging ? "grabbing" : "grab" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      onWheel={handleWheel}
    >
      <img
        src={imageUrl}
        alt={altText}
        draggable={false}
        className="absolute top-0 h-full object-cover transition-none"
        style={{
          width: `${100 * zoom * 2.5}%`,
          left: `calc(50% + ${panX}px - ${100 * zoom * 2.5 * 0.5}%)`,
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
          minWidth: "250%",
          pointerEvents: "none",
        }}
      />
      {/* Drag hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white/70 text-xs px-3 py-1 rounded-full pointer-events-none">
        ← Drag to explore 360° →
      </div>
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(3, z + 0.3))}
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(1, z - 0.3))}
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function StayVerseViewerModal({
  tour,
  open,
  onClose,
}: {
  tour: StayVerseTour | null;
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [activeArea, setActiveArea] = useState("lobby");

  useEffect(() => {
    if (tour) {
      const firstArea = Object.keys(tour.areas)[0] || "lobby";
      setActiveArea(firstArea);
    }
  }, [tour]);

  if (!tour) return null;

  const availableAreas = Object.keys(tour.areas).filter(
    (k) => tour.areas[k] && (tour.areas[k]?.images?.length ?? 0) > 0,
  );
  const currentArea = tour.areas[activeArea];
  const currentImage = currentArea?.images?.[0]?.url || tour.image;
  const currentDesc =
    currentArea?.images?.[0]?.description ||
    AREA_LABELS[activeArea] ||
    activeArea;

  const activeHotspots = (tour.hotspots || []).filter(
    (h) => h.fromArea === activeArea,
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="stayverse_viewer.modal"
        className="max-w-2xl w-full p-0 bg-gray-950 border-gray-800 text-white overflow-hidden rounded-2xl"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#1F7A4C]" />
            <span className="font-bold text-sm sm:text-base text-white">
              🌐 StayVerse –{" "}
              <span className="text-[#FF9933]">{tour.tourName}</span>
            </span>
          </div>
          <button
            type="button"
            data-ocid="stayverse_viewer.close_button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Location + rating bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>{tour.city}</span>
            <span className="mx-1 text-gray-700">·</span>
            <span className="text-gray-300">{currentDesc}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-semibold text-white">
              {tour.rating}
            </span>
          </div>
        </div>

        {/* Panorama viewer */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeArea}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PanoramaViewer imageUrl={currentImage} altText={currentDesc} />
          </motion.div>
        </AnimatePresence>

        {/* Hotspot navigation */}
        {activeHotspots.length > 0 && (
          <div className="px-4 py-2 bg-gray-900 flex items-center gap-2 flex-wrap">
            <span className="text-gray-500 text-xs">Navigate:</span>
            {activeHotspots.map((hs) => (
              <button
                key={`${hs.fromArea}-${hs.toArea}`}
                type="button"
                onClick={() => setActiveArea(hs.toArea)}
                className="bg-[#1F7A4C]/30 hover:bg-[#1F7A4C]/60 border border-[#1F7A4C]/40 text-[#4ade80] text-xs px-3 py-1 rounded-full transition-colors flex items-center gap-1"
              >
                <Globe className="w-3 h-3" />
                {hs.label}
              </button>
            ))}
          </div>
        )}

        {/* Area tabs */}
        <div className="px-4 py-3 border-t border-gray-800 flex gap-2 flex-wrap">
          {availableAreas.map((area, idx) => (
            <button
              key={area}
              type="button"
              data-ocid={`stayverse_viewer.area_tab.${idx + 1}`}
              onClick={() => setActiveArea(area)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                activeArea === area
                  ? "bg-[#1F7A4C] text-white shadow-lg shadow-[#1F7A4C]/30"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {AREA_LABELS[area] || area}
            </button>
          ))}
        </div>

        {/* Book Now CTA */}
        <div className="px-4 pb-4">
          <Button
            data-ocid="stayverse_viewer.book_now.button"
            onClick={() => {
              onClose();
              navigate({ to: "/search" });
            }}
            className="w-full bg-[#1F7A4C] hover:bg-[#166038] text-white font-bold text-base py-6 rounded-xl shadow-lg shadow-[#1F7A4C]/30 transition-all"
          >
            <span className="mr-2">🏨</span>
            Book Now – Pay at Hotel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function StayVerseSection() {
  const [tours, setTours] = useState<StayVerseTour[]>([]);
  const [selectedTour, setSelectedTour] = useState<StayVerseTour | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hidestay_stayverse_tours");
      if (stored) {
        const parsed: StayVerseTour[] = JSON.parse(stored);
        const approved = parsed.filter((t) => t.status === "approved");
        setTours(approved);
        return;
      }
    } catch {}
    setTours([]);
  }, []);

  const handleEnterTour = (tour: StayVerseTour) => {
    setSelectedTour(tour);
    setViewerOpen(true);
  };

  const getTourImage = (tour: StayVerseTour) => {
    return (
      tour.areas.lobby?.images?.[0]?.url ||
      tour.image ||
      "/assets/generated/category-hotels.dim_600x400.jpg"
    );
  };

  if (tours.length === 0) return null;

  return (
    <section data-ocid="stayverse_section.section" className="mt-14 mb-10">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-gray-900 text-2xl sm:text-3xl flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#1F7A4C]" />
            StayVerse
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Explore hotels in immersive 360° virtual tours
          </p>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 bg-[#1F7A4C]/10 text-[#1F7A4C] text-xs font-bold px-3 py-1.5 rounded-full">
          <Globe className="w-3.5 h-3.5" /> Virtual Tours
        </span>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tours.slice(0, 6).map((tour, i) => (
          <motion.div
            key={tour.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            data-ocid={`stayverse_section.item.${i + 1}`}
            className="group cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 bg-white border border-gray-100"
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={getTourImage(tour)}
                alt={tour.tourName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              {/* 360° badge */}
              <div className="absolute top-3 left-3">
                <span className="bg-[#FF9933] text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Globe className="w-3 h-3" /> 360°
                </span>
              </div>
              {/* Property info overlay */}
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-bold text-base leading-tight drop-shadow">
                  {tour.tourName}
                </h3>
                <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {tour.city}
                </p>
              </div>
            </div>

            {/* Card footer */}
            <div className="p-3 flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-semibold text-gray-700">
                  {tour.rating}
                </span>
              </div>
              <span className="text-gray-400 text-xs">
                {Object.keys(tour.areas).length} areas
              </span>
            </div>

            <div className="px-3 pb-3">
              <Button
                data-ocid={`stayverse_section.enter_button.${i + 1}`}
                onClick={() => handleEnterTour(tour)}
                className="w-full bg-[#1F7A4C] hover:bg-[#166038] text-white font-semibold rounded-xl py-2.5 text-sm transition-all shadow-sm hover:shadow-md hover:shadow-[#1F7A4C]/25 flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4" />
                Enter StayVerse
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Viewer modal */}
      <StayVerseViewerModal
        tour={selectedTour}
        open={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          setSelectedTour(null);
        }}
      />
    </section>
  );
}
