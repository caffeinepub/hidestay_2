import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  ImageIcon,
  Info,
  Link2,
  Maximize2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

type AreaKey = "lobby" | "rooms" | "balcony" | "restaurant" | "pool";

const AREA_LABELS: Record<AreaKey, string> = {
  lobby: "Lobby",
  rooms: "Rooms",
  balcony: "Balcony",
  restaurant: "Restaurant",
  pool: "Pool Area",
};

const AREA_ICONS: Record<AreaKey, string> = {
  lobby: "🏛️",
  rooms: "🛏️",
  balcony: "🌅",
  restaurant: "🍽️",
  pool: "🏊",
};

type Hotspot = {
  id: string;
  fromArea: AreaKey;
  toArea: AreaKey;
  label: string;
};

type AreaData = {
  images: { id: string; url: string; file?: File; caption: string }[];
  description: string;
};

type TourData = {
  areas: Record<AreaKey, AreaData>;
  hotspots: Hotspot[];
  tourName: string;
  propertyId: string;
};

const defaultAreas = (): Record<AreaKey, AreaData> => ({
  lobby: { images: [], description: "" },
  rooms: { images: [], description: "" },
  balcony: { images: [], description: "" },
  restaurant: { images: [], description: "" },
  pool: { images: [], description: "" },
});

type SavedStayVerseTour = {
  id: string;
  tourName: string;
  propertyId: string;
  ownerName: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected" | "updates_requested";
  adminNote?: string;
  areas: Record<
    string,
    {
      images: { id: string; url: string; caption: string }[];
      description: string;
    }
  >;
  hotspots: { id: string; fromArea: string; toArea: string; label: string }[];
};

export default function StayVerseVirtualTour() {
  const [tourData, setTourData] = useState<TourData>({
    areas: defaultAreas(),
    hotspots: [],
    tourName: "",
    propertyId: "",
  });
  const [activeArea, setActiveArea] = useState<AreaKey>("lobby");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewArea, setPreviewArea] = useState<AreaKey>("lobby");
  const [previewImgIdx, setPreviewImgIdx] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [newHotspot, setNewHotspot] = useState<{
    from: AreaKey;
    to: AreaKey;
    label: string;
  }>({
    from: "lobby",
    to: "rooms",
    label: "",
  });
  const [saved, setSaved] = useState(false);
  const [addingHotspot, setAddingHotspot] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag state for panorama viewer
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [panOffset, setPanOffset] = useState(0);
  const [panDelta, setPanDelta] = useState(0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newImages = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      url: URL.createObjectURL(file),
      file,
      caption: "",
    }));
    setTourData((prev) => ({
      ...prev,
      areas: {
        ...prev.areas,
        [activeArea]: {
          ...prev.areas[activeArea],
          images: [...prev.areas[activeArea].images, ...newImages],
        },
      },
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (imgId: string) => {
    setTourData((prev) => ({
      ...prev,
      areas: {
        ...prev.areas,
        [activeArea]: {
          ...prev.areas[activeArea],
          images: prev.areas[activeArea].images.filter(
            (img) => img.id !== imgId,
          ),
        },
      },
    }));
  };

  const updateDescription = (desc: string) => {
    setTourData((prev) => ({
      ...prev,
      areas: {
        ...prev.areas,
        [activeArea]: { ...prev.areas[activeArea], description: desc },
      },
    }));
  };

  const updateCaption = (imgId: string, caption: string) => {
    setTourData((prev) => ({
      ...prev,
      areas: {
        ...prev.areas,
        [activeArea]: {
          ...prev.areas[activeArea],
          images: prev.areas[activeArea].images.map((img) =>
            img.id === imgId ? { ...img, caption } : img,
          ),
        },
      },
    }));
  };

  const addHotspot = () => {
    if (newHotspot.from === newHotspot.to) return;
    const duplicate = tourData.hotspots.some(
      (h) => h.fromArea === newHotspot.from && h.toArea === newHotspot.to,
    );
    if (duplicate) return;
    const hotspot: Hotspot = {
      id: `hs-${Date.now()}`,
      fromArea: newHotspot.from,
      toArea: newHotspot.to,
      label: newHotspot.label || `Go to ${AREA_LABELS[newHotspot.to]}`,
    };
    setTourData((prev) => ({ ...prev, hotspots: [...prev.hotspots, hotspot] }));
    setAddingHotspot(false);
    setNewHotspot({ from: "lobby", to: "rooms", label: "" });
  };

  const removeHotspot = (id: string) => {
    setTourData((prev) => ({
      ...prev,
      hotspots: prev.hotspots.filter((h) => h.id !== id),
    }));
  };

  const totalImages = Object.values(tourData.areas).reduce(
    (sum, a) => sum + a.images.length,
    0,
  );

  const hotspotsForPreviewArea = tourData.hotspots.filter(
    (h) => h.fromArea === previewArea,
  );

  const currentImages = tourData.areas[previewArea].images;

  const handlePreviewOpen = () => {
    const firstAreaWithImages = (Object.keys(tourData.areas) as AreaKey[]).find(
      (k) => tourData.areas[k].images.length > 0,
    );
    if (firstAreaWithImages) {
      setPreviewArea(firstAreaWithImages);
      setPreviewImgIdx(0);
      setPanOffset(0);
      setPanDelta(0);
    }
    setPreviewOpen(true);
  };

  const navigateToArea = (area: AreaKey) => {
    setPreviewArea(area);
    setPreviewImgIdx(0);
    setPanOffset(0);
    setPanDelta(0);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragStart(e.clientX);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragStart === null) return;
      const delta = e.clientX - dragStart;
      setPanDelta(delta);
    },
    [dragStart],
  );

  const handleMouseUp = useCallback(() => {
    setPanOffset((prev) => prev + panDelta);
    setPanDelta(0);
    setDragStart(null);
  }, [panDelta]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientX);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (dragStart === null) return;
      const delta = e.touches[0].clientX - dragStart;
      setPanDelta(delta);
    },
    [dragStart],
  );

  const handleTouchEnd = useCallback(() => {
    setPanOffset((prev) => prev + panDelta);
    setPanDelta(0);
    setDragStart(null);
  }, [panDelta]);

  const totalPan = panOffset + panDelta;
  const panPercent = (totalPan / 4).toFixed(2);

  const handleSave = () => {
    // Save to localStorage for Super Admin review
    try {
      const STAYVERSE_KEY = "hidestay_stayverse_tours";
      const existing: SavedStayVerseTour[] = (() => {
        try {
          const s = localStorage.getItem(STAYVERSE_KEY);
          return s ? JSON.parse(s) : [];
        } catch {
          return [];
        }
      })();
      // Strip File objects from images
      const cleanAreas = Object.fromEntries(
        (Object.keys(tourData.areas) as AreaKey[]).map((k) => [
          k,
          {
            ...tourData.areas[k],
            images: tourData.areas[k].images.map(({ id, url, caption }) => ({
              id,
              url,
              caption,
            })),
          },
        ]),
      ) as Record<
        AreaKey,
        {
          images: { id: string; url: string; caption: string }[];
          description: string;
        }
      >;
      const entry: SavedStayVerseTour = {
        id: `sv-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
        tourName: tourData.tourName || "Untitled Tour",
        propertyId: tourData.propertyId || "PROP-000",
        ownerName: "Hotel Owner",
        submittedAt: new Date().toISOString(),
        status: "pending",
        areas: cleanAreas,
        hotspots: tourData.hotspots,
      };
      localStorage.setItem(STAYVERSE_KEY, JSON.stringify([...existing, entry]));
    } catch {
      // quota or serialization error; ignore
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6" data-ocid="stayverse.section">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1F7A4C] to-[#145c38] rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-lg">
            🌐
          </div>
          <div>
            <h2 className="text-xl font-bold font-display">
              StayVerse Virtual Tour
            </h2>
            <p className="text-white/80 text-sm font-body">
              Upload 360° panoramic images and define hotspot navigation between
              areas
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-3 flex-wrap">
          <div className="bg-white/15 rounded-lg px-3 py-1.5 text-sm font-body">
            <span className="font-bold">{totalImages}</span> images uploaded
          </div>
          <div className="bg-white/15 rounded-lg px-3 py-1.5 text-sm font-body">
            <span className="font-bold">{tourData.hotspots.length}</span>{" "}
            hotspots defined
          </div>
          <div className="bg-white/15 rounded-lg px-3 py-1.5 text-sm font-body">
            <span className="font-bold">
              {
                (Object.keys(tourData.areas) as AreaKey[]).filter(
                  (k) => tourData.areas[k].images.length > 0,
                ).length
              }
            </span>{" "}
            / 5 areas covered
          </div>
        </div>
      </div>

      {/* Tour name */}
      <div>
        {/* fix(noLabelWithoutControl): added htmlFor matching input id */}
        <label
          htmlFor="stayverse-tour-name"
          className="text-sm font-medium font-body text-foreground mb-1.5 block"
        >
          Tour Name
        </label>
        <Input
          id="stayverse-tour-name"
          placeholder="e.g. Grand Valley Resort – Full Property Tour"
          value={tourData.tourName}
          onChange={(e) =>
            setTourData((p) => ({ ...p, tourName: e.target.value }))
          }
          data-ocid="stayverse.tour_name.input"
          className="font-body"
        />
      </div>

      {/* Area selector */}
      <div>
        <p className="text-sm font-medium font-body text-foreground mb-3">
          Select Area to Manage
        </p>
        <div className="grid grid-cols-5 gap-2">
          {(Object.keys(AREA_LABELS) as AreaKey[]).map((area) => {
            const count = tourData.areas[area].images.length;
            const isActive = activeArea === area;
            return (
              // fix(useButtonType): added type="button"
              <button
                key={area}
                type="button"
                onClick={() => setActiveArea(area)}
                data-ocid={`stayverse.area_${area}.tab`}
                className={`relative flex flex-col items-center gap-1.5 rounded-xl p-3 border-2 transition-all text-center ${
                  isActive
                    ? "border-[#1F7A4C] bg-[#1F7A4C]/5"
                    : "border-border bg-card hover:border-[#1F7A4C]/40"
                }`}
              >
                <span className="text-2xl">{AREA_ICONS[area]}</span>
                <span className="text-xs font-body font-medium leading-tight">
                  {AREA_LABELS[area]}
                </span>
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1F7A4C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active area editor */}
      <div className="border rounded-2xl p-5 bg-card space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{AREA_ICONS[activeArea]}</span>
          <h3 className="font-display font-bold text-lg">
            {AREA_LABELS[activeArea]}
          </h3>
          <Badge variant="outline" className="ml-auto text-xs font-body">
            {tourData.areas[activeArea].images.length} image(s)
          </Badge>
        </div>

        {/* Upload button */}
        {/* fix(useSemanticElements): use native button instead of div role="button" */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          data-ocid="stayverse.image.dropzone"
          className="w-full border-2 border-dashed border-[#1F7A4C]/40 rounded-xl p-6 text-center cursor-pointer hover:border-[#1F7A4C] hover:bg-[#1F7A4C]/5 transition-all"
        >
          <Upload className="w-8 h-8 text-[#1F7A4C] mx-auto mb-2" />
          <p className="font-body font-medium text-sm">
            Click to upload panoramic images
          </p>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            Best results with equirectangular (360°) JPG or PNG images
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
            data-ocid="stayverse.image.upload_button"
          />
        </button>

        {/* Uploaded images grid */}
        {tourData.areas[activeArea].images.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {tourData.areas[activeArea].images.map((img, idx) => (
              <div
                key={img.id}
                className="relative group rounded-xl overflow-hidden border"
              >
                <img
                  src={img.url}
                  alt={`${AREA_LABELS[activeArea]} ${idx + 1}`}
                  className="w-full h-28 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all" />
                {/* fix(useButtonType): added type="button" */}
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  data-ocid={`stayverse.image.delete_button.${idx + 1}`}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="p-2">
                  <Input
                    placeholder="Caption (optional)"
                    value={img.caption}
                    onChange={(e) => updateCaption(img.id, e.target.value)}
                    className="text-xs h-7 font-body"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Area description */}
        <div>
          {/* fix(noLabelWithoutControl): added htmlFor matching textarea id */}
          <label
            htmlFor="stayverse-area-description"
            className="text-xs font-medium font-body text-muted-foreground mb-1 block"
          >
            Area Description (shown to guests)
          </label>
          <Textarea
            id="stayverse-area-description"
            placeholder={`Describe the ${AREA_LABELS[activeArea].toLowerCase()} for guests...`}
            value={tourData.areas[activeArea].description}
            onChange={(e) => updateDescription(e.target.value)}
            rows={2}
            data-ocid="stayverse.area_description.textarea"
            className="font-body text-sm resize-none"
          />
        </div>
      </div>

      {/* Hotspot Navigation */}
      <div className="border rounded-2xl p-5 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[#1F7A4C]" />
            <h3 className="font-display font-bold text-base">
              Navigation Hotspots
            </h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAddingHotspot(true)}
            data-ocid="stayverse.add_hotspot.button"
            className="text-xs font-body border-[#1F7A4C] text-[#1F7A4C] hover:bg-[#1F7A4C]/5"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Hotspot
          </Button>
        </div>

        <p className="text-xs text-muted-foreground font-body flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          Hotspots let guests navigate between areas in the virtual tour. Define
          links between areas below.
        </p>

        {/* Add hotspot form */}
        {addingHotspot && (
          <div className="bg-[#1F7A4C]/5 border border-[#1F7A4C]/20 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium font-body">
              New Navigation Hotspot
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                {/* fix(noLabelWithoutControl): added htmlFor matching SelectTrigger id */}
                <label
                  htmlFor="stayverse-hotspot-from"
                  className="text-xs text-muted-foreground font-body mb-1 block"
                >
                  From Area
                </label>
                <Select
                  value={newHotspot.from}
                  onValueChange={(v) =>
                    setNewHotspot((p) => ({ ...p, from: v as AreaKey }))
                  }
                >
                  <SelectTrigger
                    id="stayverse-hotspot-from"
                    data-ocid="stayverse.hotspot_from.select"
                    className="font-body text-sm h-8"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(AREA_LABELS) as AreaKey[]).map((a) => (
                      <SelectItem key={a} value={a}>
                        {AREA_ICONS[a]} {AREA_LABELS[a]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                {/* fix(noLabelWithoutControl): added htmlFor matching SelectTrigger id */}
                <label
                  htmlFor="stayverse-hotspot-to"
                  className="text-xs text-muted-foreground font-body mb-1 block"
                >
                  To Area
                </label>
                <Select
                  value={newHotspot.to}
                  onValueChange={(v) =>
                    setNewHotspot((p) => ({ ...p, to: v as AreaKey }))
                  }
                >
                  <SelectTrigger
                    id="stayverse-hotspot-to"
                    data-ocid="stayverse.hotspot_to.select"
                    className="font-body text-sm h-8"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(AREA_LABELS) as AreaKey[]).map((a) => (
                      <SelectItem key={a} value={a}>
                        {AREA_ICONS[a]} {AREA_LABELS[a]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              {/* fix(noLabelWithoutControl): added htmlFor matching input id */}
              <label
                htmlFor="stayverse-hotspot-label"
                className="text-xs text-muted-foreground font-body mb-1 block"
              >
                Hotspot Label (optional)
              </label>
              <Input
                id="stayverse-hotspot-label"
                placeholder={`e.g. "Explore the ${AREA_LABELS[newHotspot.to]}"`}
                value={newHotspot.label}
                onChange={(e) =>
                  setNewHotspot((p) => ({ ...p, label: e.target.value }))
                }
                data-ocid="stayverse.hotspot_label.input"
                className="font-body text-sm h-8"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={addHotspot}
                disabled={newHotspot.from === newHotspot.to}
                data-ocid="stayverse.hotspot_save.button"
                className="bg-[#1F7A4C] hover:bg-[#145c38] text-white font-body text-xs"
              >
                Add Hotspot
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAddingHotspot(false)}
                data-ocid="stayverse.hotspot_cancel.button"
                className="font-body text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Hotspot list */}
        {tourData.hotspots.length === 0 && !addingHotspot ? (
          <div
            data-ocid="stayverse.hotspots.empty_state"
            className="text-center py-6 text-muted-foreground"
          >
            <Link2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm font-body">
              No hotspots yet. Add one to enable area navigation.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tourData.hotspots.map((hs, idx) => (
              <div
                key={hs.id}
                data-ocid={`stayverse.hotspot.item.${idx + 1}`}
                className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-2.5"
              >
                <span className="text-base">{AREA_ICONS[hs.fromArea]}</span>
                <span className="text-sm font-body font-medium">
                  {AREA_LABELS[hs.fromArea]}
                </span>
                <ArrowRight className="w-4 h-4 text-[#1F7A4C] shrink-0" />
                <span className="text-base">{AREA_ICONS[hs.toArea]}</span>
                <span className="text-sm font-body font-medium flex-1">
                  {AREA_LABELS[hs.toArea]}
                </span>
                {hs.label && (
                  <span className="text-xs text-muted-foreground font-body italic">
                    "{hs.label}"
                  </span>
                )}
                {/* fix(useButtonType): added type="button" */}
                <button
                  type="button"
                  onClick={() => removeHotspot(hs.id)}
                  data-ocid={`stayverse.hotspot.delete_button.${idx + 1}`}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handlePreviewOpen}
          disabled={totalImages === 0}
          data-ocid="stayverse.preview.button"
          className="flex-1 font-body border-[#1F7A4C] text-[#1F7A4C] hover:bg-[#1F7A4C]/5"
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview Walkthrough
        </Button>
        <Button
          onClick={handleSave}
          disabled={totalImages === 0 || !tourData.tourName}
          data-ocid="stayverse.save.button"
          className="flex-1 bg-[#1F7A4C] hover:bg-[#145c38] text-white font-body"
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            "Save Virtual Tour"
          )}
        </Button>
      </div>

      {/* Submission note */}
      <p className="text-xs text-muted-foreground font-body text-center">
        Saved tours will be submitted for Super Admin review before appearing on
        your property page.
      </p>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          className="max-w-2xl p-0 overflow-hidden"
          data-ocid="stayverse.preview.modal"
        >
          <div className="bg-black relative">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent">
              <div>
                <p className="text-white font-display font-bold text-base">
                  {AREA_ICONS[previewArea]} {AREA_LABELS[previewArea]}
                </p>
                {currentImages[previewImgIdx]?.caption && (
                  <p className="text-white/70 text-xs font-body">
                    {currentImages[previewImgIdx].caption}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* fix(useButtonType): added type="button" */}
                <button
                  type="button"
                  onClick={() => setFullscreenOpen(true)}
                  data-ocid="stayverse.preview.fullscreen_button"
                  className="text-white/80 hover:text-white"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
                {/* fix(useButtonType): added type="button" */}
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  data-ocid="stayverse.preview.close_button"
                  className="text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Panorama viewer */}
            <div
              className="h-72 overflow-hidden cursor-grab active:cursor-grabbing select-none relative"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              data-ocid="stayverse.preview.canvas_target"
            >
              {currentImages.length > 0 ? (
                <img
                  src={currentImages[previewImgIdx]?.url}
                  alt=""
                  className="h-full min-w-[200%] object-cover transition-none pointer-events-none"
                  style={{
                    transform: `translateX(calc(-25% + ${panPercent}%))`,
                    transition:
                      dragStart !== null ? "none" : "transform 0.3s ease",
                  }}
                  draggable={false}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-white/30" />
                </div>
              )}

              {/* Drag hint */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/50 text-xs font-body flex items-center gap-1">
                <ChevronLeft className="w-3.5 h-3.5" />
                Drag to explore
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Multiple image navigation */}
            {currentImages.length > 1 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
                {/* fix(noArrayIndexKey): use prefixed key instead of bare index */}
                {currentImages.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => {
                      setPreviewImgIdx(i);
                      setPanOffset(0);
                      setPanDelta(0);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === previewImgIdx ? "bg-white scale-125" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Area navigation + hotspots */}
            <div className="p-4 bg-gray-900">
              <p className="text-white/60 text-xs font-body mb-3">
                {tourData.areas[previewArea].description ||
                  "Explore this area by dragging the image above."}
              </p>

              {/* Hotspot buttons */}
              {hotspotsForPreviewArea.length > 0 && (
                <div className="mb-3">
                  <p className="text-white/50 text-[10px] font-body uppercase tracking-wider mb-2">
                    Navigate to
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {hotspotsForPreviewArea.map((hs) => (
                      // fix(useButtonType): added type="button"
                      // fix(noUnusedTemplateLiteral): changed to plain string
                      <button
                        key={hs.id}
                        type="button"
                        onClick={() => navigateToArea(hs.toArea)}
                        data-ocid="stayverse.preview.hotspot.button"
                        className="flex items-center gap-1.5 bg-[#1F7A4C] hover:bg-[#145c38] text-white text-xs font-body px-3 py-1.5 rounded-full transition-colors"
                      >
                        <span>{AREA_ICONS[hs.toArea]}</span>
                        {hs.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Area tabs */}
              <div className="flex gap-1.5 flex-wrap">
                {(Object.keys(tourData.areas) as AreaKey[]).map((area) => {
                  const hasImages = tourData.areas[area].images.length > 0;
                  if (!hasImages) return null;
                  return (
                    // fix(useButtonType): added type="button"
                    <button
                      key={area}
                      type="button"
                      onClick={() => navigateToArea(area)}
                      data-ocid={`stayverse.preview.area_${area}.tab`}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-body transition-all ${
                        previewArea === area
                          ? "bg-white text-gray-900 font-medium"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      <span>{AREA_ICONS[area]}</span>
                      {AREA_LABELS[area]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen dialog */}
      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent
          className="max-w-screen-lg p-0 overflow-hidden"
          data-ocid="stayverse.fullscreen.modal"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Full Screen Tour</DialogTitle>
          </DialogHeader>
          <div
            className="relative h-[70vh] bg-black overflow-hidden cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {currentImages.length > 0 && (
              <img
                src={currentImages[previewImgIdx]?.url}
                alt=""
                className="h-full min-w-[200%] object-cover pointer-events-none"
                style={{
                  transform: `translateX(calc(-25% + ${panPercent}%))`,
                  transition:
                    dragStart !== null ? "none" : "transform 0.3s ease",
                }}
                draggable={false}
              />
            )}
            {/* fix(useButtonType): added type="button" */}
            <button
              type="button"
              onClick={() => setFullscreenOpen(false)}
              data-ocid="stayverse.fullscreen.close_button"
              className="absolute top-4 right-4 w-9 h-9 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs font-body flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" /> Drag to explore{" "}
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
