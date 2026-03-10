import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Camera, ImagePlus, RefreshCw, Trash2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "hidestay_virtual_tours";

const ROOM_TYPES = [
  "Standard Room",
  "Deluxe Room",
  "Suite",
  "Family Room",
  "Presidential Suite",
  "Dormitory",
];

export interface VirtualTour {
  id: string;
  roomName: string;
  roomType: string;
  description: string;
  imageDataUrl: string;
}

const EMPTY_FORM = {
  roomName: "",
  roomType: "",
  description: "",
  imageDataUrl: "",
};

export default function VirtualTourManager() {
  const [tours, setTours] = useState<VirtualTour[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tours));
    } catch {
      // storage quota
    }
  }, [tours]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((prev) => ({
        ...prev,
        imageDataUrl: ev.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.roomName.trim()) {
      toast.error("Room name is required.");
      return;
    }
    if (!form.roomType) {
      toast.error("Please select a room type.");
      return;
    }
    if (!form.imageDataUrl) {
      toast.error("Please upload a panorama image.");
      return;
    }
    const newTour: VirtualTour = {
      id: `tour-${Date.now()}`,
      roomName: form.roomName.trim(),
      roomType: form.roomType,
      description: form.description.trim(),
      imageDataUrl: form.imageDataUrl,
    };
    setTours((prev) => [...prev, newTour]);
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
    toast.success("360° tour saved!");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancel = () => {
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = (id: string) => {
    setTours((prev) => prev.filter((t) => t.id !== id));
    toast.success("Tour removed.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-foreground text-xl">
            360° Room Tours
          </h2>
          <p className="text-sm text-muted-foreground font-body mt-0.5">
            Upload panoramic images to give guests a virtual walkthrough.
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary text-primary-foreground font-body font-semibold flex items-center gap-2"
            data-ocid="hotel_admin.tours.add_form.section"
          >
            <ImagePlus className="w-4 h-4" />
            Add Tour
          </Button>
        )}
      </div>

      {/* Saved Tours List */}
      {tours.length === 0 && !showForm ? (
        <div
          data-ocid="hotel_admin.tours.empty_state"
          className="text-center py-16 border-2 border-dashed border-border rounded-2xl"
        >
          <Camera className="w-12 h-12 mx-auto mb-4 text-primary/30" />
          <p className="font-display font-bold text-foreground text-lg">
            No 360° tours yet
          </p>
          <p className="text-sm text-muted-foreground font-body mt-1 mb-4">
            Add panoramic room images to help guests explore before they book.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary text-primary-foreground font-body font-semibold"
          >
            <ImagePlus className="w-4 h-4 mr-2" />
            Add First Tour
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {tours.map((tour, i) => (
            <Card
              key={tour.id}
              data-ocid={`hotel_admin.tours.item.${i + 1}`}
              className="border-border shadow-xs overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* Panorama thumbnail with 360° badge */}
                  <div className="relative w-32 h-24 flex-shrink-0 overflow-hidden">
                    <img
                      src={tour.imageDataUrl}
                      alt={tour.roomName}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 inline-flex items-center gap-0.5 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      <RefreshCw className="w-2.5 h-2.5" />
                      360°
                    </span>
                  </div>
                  {/* Info */}
                  <div className="flex-1 p-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display font-bold text-foreground">
                        {tour.roomName}
                      </h3>
                      <span
                        className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1"
                        style={{ background: "#FF9933", color: "#1a1a1a" }}
                      >
                        {tour.roomType}
                      </span>
                      {tour.description && (
                        <p className="text-xs text-muted-foreground font-body mt-1 line-clamp-1">
                          {tour.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      data-ocid={`hotel_admin.tours.remove.button.${i + 1}`}
                      onClick={() => handleRemove(tour.id)}
                      className="flex-shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Remove tour"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Tour Form */}
      {showForm && (
        <Card
          data-ocid="hotel_admin.tours.add_form.section"
          className="border-primary/30 shadow-sm"
        >
          <CardHeader>
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Add New 360° Tour
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Room Name */}
            <div className="space-y-1.5">
              <Label className="font-body text-sm font-medium">
                Room Name *
              </Label>
              <Input
                placeholder="e.g. Himalayan Suite"
                value={form.roomName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, roomName: e.target.value }))
                }
                data-ocid="hotel_admin.tours.room_name.input"
                className="font-body"
              />
            </div>

            {/* Room Type */}
            <div className="space-y-1.5">
              <Label className="font-body text-sm font-medium">
                Room Type *
              </Label>
              <Select
                value={form.roomType}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, roomType: v }))
                }
              >
                <SelectTrigger
                  data-ocid="hotel_admin.tours.room_type.select"
                  className="font-body"
                >
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="font-body">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="font-body text-sm font-medium">
                Description
              </Label>
              <Textarea
                placeholder="Describe what guests will see in this room tour..."
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                data-ocid="hotel_admin.tours.description.textarea"
                className="font-body resize-none"
                rows={3}
              />
            </div>

            {/* Panorama Upload */}
            <div className="space-y-2">
              <Label className="font-body text-sm font-medium">
                Panorama Image *
              </Label>
              {form.imageDataUrl ? (
                <div className="relative rounded-xl overflow-hidden">
                  {/* Preview with 360° badge + pan animation hint */}
                  <style>{`
                    @keyframes pan360 {
                      0% { transform: translateX(0); }
                      50% { transform: translateX(-15%); }
                      100% { transform: translateX(0); }
                    }
                    .tour-preview-img:hover {
                      animation: pan360 4s ease-in-out infinite;
                    }
                  `}</style>
                  <div className="overflow-hidden rounded-xl h-48 bg-black">
                    <img
                      src={form.imageDataUrl}
                      alt="Panorama preview"
                      className="tour-preview-img w-[130%] max-w-none h-full object-cover cursor-grab"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-end justify-between p-3 pointer-events-none">
                    <span className="inline-flex items-center gap-1 bg-black/70 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      <RefreshCw className="w-3 h-3" />
                      360° Preview — hover to pan
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, imageDataUrl: "" }));
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white hover:bg-black/80"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  data-ocid="hotel_admin.tours.image.dropzone"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-body text-muted-foreground">
                    Click to upload panoramic image
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Wide-angle or equirectangular JPG/PNG recommended
                  </p>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                onClick={handleSave}
                data-ocid="hotel_admin.tours.save.button"
                className="flex-1 bg-primary text-primary-foreground font-body font-semibold"
              >
                Save Tour
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                data-ocid="hotel_admin.tours.cancel.button"
                className="flex-1 font-body"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
