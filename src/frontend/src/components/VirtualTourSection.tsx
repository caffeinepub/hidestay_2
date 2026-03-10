import { Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { VirtualTour } from "./VirtualTourManager";

const STORAGE_KEY = "hidestay_virtual_tours";

const SAMPLE_TOURS: VirtualTour[] = [
  {
    id: "sample-1",
    roomName: "Himalayan Suite",
    roomType: "Suite",
    description:
      "Panoramic mountain views from a luxurious king-size suite with private balcony.",
    imageDataUrl: "https://picsum.photos/seed/room1/1600/600",
    status: "approved" as const,
  },
  {
    id: "sample-2",
    roomName: "Valley View Deluxe",
    roomType: "Deluxe Room",
    description:
      "Warm wood interiors and floor-to-ceiling windows overlooking the Uttarakhand valley.",
    imageDataUrl: "https://picsum.photos/seed/room2/1600/600",
    status: "approved" as const,
  },
  {
    id: "sample-3",
    roomName: "Family Retreat",
    roomType: "Family Room",
    description:
      "Spacious two-bedroom layout with a cozy living area, perfect for family getaways.",
    imageDataUrl: "https://picsum.photos/seed/room3/1600/600",
    status: "approved" as const,
  },
];

// ─── Draggable Panorama Core ──────────────────────────────────────────────────

interface PanoramaViewerProps {
  src: string;
  alt: string;
  /** height class for the container */
  heightClass?: string;
  /** zoom level 1–3 (default 1) */
  zoom?: number;
  onZoomChange?: (z: number) => void;
  /** fired once on first drag interaction */
  onFirstInteraction?: () => void;
  showHint?: boolean;
  /** extra class names for the container */
  className?: string;
  "data-ocid"?: string;
}

function PanoramaViewer({
  src,
  alt,
  heightClass = "h-64",
  zoom = 1,
  onZoomChange,
  onFirstInteraction,
  showHint = true,
  className = "",
  "data-ocid": dataOcid,
}: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0); // current translateX in px
  const draggingRef = useRef(false);
  const startXRef = useRef(0); // pointer start X
  const startOffsetRef = useRef(0); // offset at drag start
  const [renderOffset, setRenderOffset] = useState(0);
  const interactedRef = useRef(false);

  /** Image width = container width * 2.5 * zoom */
  const getImageWidth = useCallback(() => {
    const cw = containerRef.current?.offsetWidth ?? 300;
    return cw * 2.5 * zoom;
  }, [zoom]);

  const clamp = useCallback(
    (val: number) => {
      const cw = containerRef.current?.offsetWidth ?? 300;
      const iw = getImageWidth();
      const min = -(iw - cw);
      return Math.max(min, Math.min(0, val));
    },
    [getImageWidth],
  );

  const applyOffset = useCallback(
    (val: number) => {
      const clamped = clamp(val);
      offsetRef.current = clamped;
      setRenderOffset(clamped);
    },
    [clamp],
  );

  // When zoom changes, re-clamp existing offset
  // biome-ignore lint/correctness/useExhaustiveDependencies: zoom is a prop used transitively via applyOffset; listing it ensures re-clamp on zoom change
  useEffect(() => {
    applyOffset(offsetRef.current);
  }, [zoom, applyOffset]);

  const notifyInteraction = useCallback(() => {
    if (!interactedRef.current) {
      interactedRef.current = true;
      onFirstInteraction?.();
    }
  }, [onFirstInteraction]);

  // ── Mouse handlers ──
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      draggingRef.current = true;
      startXRef.current = e.clientX;
      startOffsetRef.current = offsetRef.current;
      notifyInteraction();
    },
    [notifyInteraction],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingRef.current) return;
      const delta = e.clientX - startXRef.current;
      applyOffset(startOffsetRef.current + delta);
    },
    [applyOffset],
  );

  const onMouseUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  const onMouseLeave = useCallback(() => {
    draggingRef.current = false;
  }, []);

  // ── Touch handlers ──
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      startXRef.current = e.touches[0].clientX;
      startOffsetRef.current = offsetRef.current;
      notifyInteraction();
    },
    [notifyInteraction],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const delta = e.touches[0].clientX - startXRef.current;
      applyOffset(startOffsetRef.current + delta);
    },
    [applyOffset],
  );

  // ── Scroll-to-zoom ──
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!onZoomChange) return;
      e.preventDefault();
      const direction = e.deltaY < 0 ? 1 : -1;
      const next = Math.min(3, Math.max(1, zoom + direction * 0.25));
      onZoomChange(Number.parseFloat(next.toFixed(2)));
    },
    [zoom, onZoomChange],
  );

  const imageW = getImageWidth();

  return (
    <div
      ref={containerRef}
      data-ocid={dataOcid}
      className={`relative overflow-hidden select-none cursor-grab active:cursor-grabbing ${heightClass} ${className}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onMouseUp}
      onWheel={onWheel}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{
          width: imageW,
          height: "100%",
          objectFit: "cover",
          transform: `translateX(${renderOffset}px)`,
          transition: draggingRef.current ? "none" : "transform 0.05s",
          userSelect: "none",
          pointerEvents: "none",
          maxWidth: "none",
        }}
      />
      {/* Drag hint */}
      {showHint && (
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ opacity: showHint ? 1 : 0, transition: "opacity 0.4s" }}
        >
          <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1.5 rounded-full">
            <span>⟵</span> Drag to explore <span>⟶</span>
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Full-screen Modal ────────────────────────────────────────────────────────

function FullscreenModal({
  tour,
  onClose,
}: {
  tour: VirtualTour;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [hintVisible, setHintVisible] = useState(true);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleZoomIn = () =>
    setZoom((z) => Math.min(3, Number.parseFloat((z + 0.25).toFixed(2))));
  const handleZoomOut = () =>
    setZoom((z) => Math.max(1, Number.parseFloat((z - 0.25).toFixed(2))));

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape key handler above covers keyboard
    <div
      data-ocid="details.virtual_tour.modal"
      className="fixed inset-0 z-[9999] bg-black flex flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            <RotateCcw className="w-3 h-3" />
            360°
          </span>
          <div>
            <h3 className="font-display font-bold text-white text-lg leading-tight">
              {tour.roomName}
            </h3>
            <span
              className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: "#FF9933", color: "#1a1a1a" }}
            >
              {tour.roomType}
            </span>
          </div>
        </div>
        <button
          type="button"
          data-ocid="details.virtual_tour.close_button"
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close full screen"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Panorama viewer */}
      <div className="flex-1 overflow-hidden">
        <PanoramaViewer
          src={tour.imageDataUrl}
          alt={tour.roomName}
          heightClass="h-full"
          zoom={zoom}
          onZoomChange={setZoom}
          onFirstInteraction={() =>
            setTimeout(() => setHintVisible(false), 2000)
          }
          showHint={hintVisible}
          data-ocid="details.virtual_tour.canvas_target"
        />
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        {/* Description */}
        <p className="text-white/60 text-xs font-body max-w-xs truncate">
          {tour.description || "Drag to pan · Scroll to zoom"}
        </p>
        {/* Instructions badge */}
        <span className="hidden sm:inline text-white/40 text-xs font-body">
          Drag to pan • Scroll to zoom
        </span>
        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-ocid="details.virtual_tour.zoom_out.button"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Zoom out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-white/70 text-xs font-body w-8 text-center">
            {zoom.toFixed(1)}×
          </span>
          <button
            type="button"
            data-ocid="details.virtual_tour.zoom_in.button"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Zoom in"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function VirtualTourSection({
  propertyId: _propertyId,
}: {
  propertyId: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [fullscreenTour, setFullscreenTour] = useState<VirtualTour | null>(
    null,
  );

  const tours: VirtualTour[] = (() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed: VirtualTour[] = stored ? JSON.parse(stored) : [];
      const approved = parsed.filter((t) => t.status === "approved");
      return approved.length > 0 ? approved : SAMPLE_TOURS;
    } catch {
      return SAMPLE_TOURS;
    }
  })();

  if (tours.length === 0) return null;

  const activeTour = tours[activeIndex] ?? tours[0];

  return (
    <>
      <section data-ocid="details.virtual_tour.section" className="mb-8">
        {/* Section heading */}
        <h2 className="font-display font-bold text-foreground text-xl mb-1">
          Virtual Room Tour
        </h2>
        <p className="text-sm text-muted-foreground font-body mb-4">
          Drag to explore each room. Tap full screen for an immersive
          experience.
        </p>

        {/* Room tabs */}
        {tours.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {tours.map((tour, i) => (
              <button
                key={tour.id}
                type="button"
                data-ocid={`details.virtual_tour.tab.${i + 1}`}
                onClick={() => {
                  setActiveIndex(i);
                  setShowHint(true);
                }}
                className="relative px-4 py-1.5 rounded-full text-sm font-body font-semibold transition-all"
                style={{
                  background: activeIndex === i ? "#1F7A4C" : "transparent",
                  color: activeIndex === i ? "#fff" : "#1F7A4C",
                  border: "1.5px solid #1F7A4C",
                }}
              >
                {tour.roomName}
              </button>
            ))}
          </div>
        )}

        {/* Panorama card */}
        <div
          className="rounded-2xl overflow-hidden border border-border shadow-xs bg-black"
          style={{ position: "relative" }}
        >
          {/* 360° badge — top left */}
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
              <RotateCcw className="w-3 h-3" />
              360°
            </span>
          </div>

          {/* Room type badge — top right */}
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "#FF9933", color: "#1a1a1a" }}
            >
              {activeTour.roomType}
            </span>
          </div>

          {/* Draggable viewer */}
          <PanoramaViewer
            src={activeTour.imageDataUrl}
            alt={activeTour.roomName}
            heightClass="h-52 sm:h-64"
            zoom={1}
            onFirstInteraction={() =>
              setTimeout(() => setShowHint(false), 2500)
            }
            showHint={showHint}
            data-ocid="details.virtual_tour.canvas_target"
          />

          {/* Full screen button overlay — bottom center */}
          <div className="absolute bottom-3 right-3 z-10">
            <button
              type="button"
              data-ocid="details.virtual_tour.open_modal_button"
              onClick={() => setFullscreenTour(activeTour)}
              className="inline-flex items-center gap-1.5 bg-black/70 hover:bg-black/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              View Full Screen
            </button>
          </div>
        </div>

        {/* Room name + description below card */}
        <div className="mt-3 px-1">
          <p className="font-display font-semibold text-foreground text-base">
            {activeTour.roomName}
          </p>
          {activeTour.description && (
            <p className="text-sm text-muted-foreground font-body mt-0.5">
              {activeTour.description}
            </p>
          )}
        </div>
      </section>

      {/* Fullscreen modal */}
      {fullscreenTour && (
        <FullscreenModal
          tour={fullscreenTour}
          onClose={() => setFullscreenTour(null)}
        />
      )}
    </>
  );
}
