import { ExternalBlob } from "@/backend";
import type { Property } from "@/backend";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/context/AuthContext";
import { useActor } from "@/hooks/useActor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  Clock,
  IndianRupee,
  Loader2,
  LogOut,
  MapPin,
  Phone,
  PlusCircle,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const AMENITY_SUGGESTIONS = [
  "WiFi",
  "Parking",
  "AC",
  "Restaurant",
  "Swimming Pool",
  "Gym",
  "Room Service",
  "Laundry",
  "24/7 Reception",
  "Garden",
  "Terrace",
  "Hot Water",
  "Kitchen",
  "TV",
  "Wheelchair Access",
];

interface PropertyFormData {
  propertyName: string;
  propertyType: string;
  city: string;
  address: string;
  contactPhone: string;
  description: string;
  pricePerNight: string;
  amenities: string[];
  rules: string;
  checkinTime: string;
  checkoutTime: string;
}

const EMPTY_FORM: PropertyFormData = {
  propertyName: "",
  propertyType: "Hotel",
  city: "",
  address: "",
  contactPhone: "",
  description: "",
  pricePerNight: "",
  amenities: [],
  rules: "",
  checkinTime: "14:00",
  checkoutTime: "11:00",
};

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border font-body ${
        STATUS_STYLES[s] || "bg-muted text-muted-foreground border-border"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function HotelAdmin() {
  const { user, hotelOwner, isOwnerLoggedIn, logout } = useAuth();
  const { actor } = useActor();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PropertyFormData>(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [amenityInput, setAmenityInput] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const ownerEmail = hotelOwner?.email || user?.email || "";

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["myProperties", ownerEmail],
    queryFn: async () => {
      if (!actor || !ownerEmail) return [];
      return actor.getMyProperties(ownerEmail);
    },
    enabled: !!actor && !!ownerEmail && isOwnerLoggedIn,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      if (
        !form.propertyName.trim() ||
        !form.city.trim() ||
        !form.address.trim() ||
        !form.contactPhone.trim() ||
        !form.description.trim() ||
        !form.pricePerNight.trim()
      ) {
        throw new Error("Please fill in all required fields.");
      }

      // Upload images
      const imageUrls: string[] = [];
      for (let idx = 0; idx < imageFiles.length; idx++) {
        const file = imageFiles[idx];
        const arrayBuffer = await file.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8).withUploadProgress((pct) => {
          setUploadProgress(
            Math.round(
              (idx / imageFiles.length) * 100 + pct / imageFiles.length,
            ),
          );
        });
        const galleryImage = await actor.uploadImage(
          file.name,
          `Property image for ${form.propertyName}`,
          blob,
        );
        imageUrls.push(galleryImage.blob.getDirectURL());
      }
      setUploadProgress(100);

      const price = BigInt(Math.round(Number(form.pricePerNight)));
      return actor.submitProperty(
        form.propertyName.trim(),
        form.propertyType,
        form.city.trim(),
        form.address.trim(),
        form.contactPhone.trim(),
        form.description.trim(),
        imageUrls,
        price,
        form.amenities,
        form.rules.trim(),
        form.checkinTime,
        form.checkoutTime,
        ownerEmail,
      );
    },
    onSuccess: () => {
      toast.success("Property submitted for approval!");
      setForm(EMPTY_FORM);
      setImageFiles([]);
      setUploadProgress(0);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["myProperties", ownerEmail] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Submission failed. Please try again.");
      setUploadProgress(0);
    },
  });

  const handleLogout = () => {
    logout();
    navigate({ to: "/dashboard" });
  };

  const addAmenity = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || form.amenities.includes(trimmed)) return;
    setForm((prev) => ({ ...prev, amenities: [...prev.amenities, trimmed] }));
    setAmenityInput("");
  };

  const removeAmenity = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenity),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  if (!isOwnerLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 pb-24">
        <Card className="w-full max-w-sm shadow-green border-border text-center">
          <CardHeader>
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <CardTitle className="font-display text-xl text-foreground">
              Hotel Owner Access Required
            </CardTitle>
            <p className="text-muted-foreground text-sm font-body mt-1">
              Please log in as a hotel owner to manage your properties.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              data-ocid="hotel_admin.login.button"
              className="w-full bg-primary text-primary-foreground font-body font-semibold"
              onClick={() => navigate({ to: "/login/hotel-owner" })}
            >
              Login as Hotel Owner
            </Button>
            <Button
              variant="outline"
              data-ocid="hotel_admin.register.button"
              className="w-full font-body font-semibold"
              onClick={() => navigate({ to: "/register/hotel-owner" })}
            >
              Register as Hotel Owner
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Property submission form view
  if (showForm) {
    return (
      <div
        data-ocid="hotel_admin.property_form.page"
        className="min-h-screen bg-background pb-24"
      >
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border shadow-xs">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              data-ocid="hotel_admin.property_form.back.button"
              onClick={() => setShowForm(false)}
              className="flex items-center gap-1.5 text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="font-display font-black text-foreground text-lg">
              Add New Property
            </h1>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          <Card className="border-border shadow-xs">
            <CardHeader>
              <CardTitle className="font-display text-base">
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="font-body text-sm font-medium">
                  Property Name *
                </Label>
                <Input
                  placeholder="e.g. Sunrise Boutique Hotel"
                  value={form.propertyName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, propertyName: e.target.value }))
                  }
                  data-ocid="hotel_admin.property_form.name.input"
                  className="font-body"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-body text-sm font-medium">
                  Property Type *
                </Label>
                <Select
                  value={form.propertyType}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, propertyType: v }))
                  }
                >
                  <SelectTrigger data-ocid="hotel_admin.property_form.type.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hotel">Hotel</SelectItem>
                    <SelectItem value="Resort">Resort</SelectItem>
                    <SelectItem value="Homestay">Homestay</SelectItem>
                    <SelectItem value="Guest House">Guest House</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-body text-sm font-medium">
                    <MapPin className="inline w-3.5 h-3.5 mr-1" />
                    City *
                  </Label>
                  <Input
                    placeholder="e.g. Manali"
                    value={form.city}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, city: e.target.value }))
                    }
                    data-ocid="hotel_admin.property_form.city.input"
                    className="font-body"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-body text-sm font-medium">
                    <Phone className="inline w-3.5 h-3.5 mr-1" />
                    Contact Phone *
                  </Label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={form.contactPhone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, contactPhone: e.target.value }))
                    }
                    data-ocid="hotel_admin.property_form.phone.input"
                    className="font-body"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-body text-sm font-medium">
                  Address *
                </Label>
                <Textarea
                  placeholder="Full address of the property"
                  value={form.address}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, address: e.target.value }))
                  }
                  data-ocid="hotel_admin.property_form.address.textarea"
                  className="font-body resize-none"
                  rows={2}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-body text-sm font-medium">
                  Description *
                </Label>
                <Textarea
                  placeholder="Describe your property — highlight what makes it special"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  data-ocid="hotel_admin.property_form.description.textarea"
                  className="font-body resize-none"
                  rows={4}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-body text-sm font-medium">
                  <IndianRupee className="inline w-3.5 h-3.5 mr-1" />
                  Price per Night (₹) *
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 3500"
                  value={form.pricePerNight}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, pricePerNight: e.target.value }))
                  }
                  data-ocid="hotel_admin.property_form.price.input"
                  className="font-body"
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="border-border shadow-xs">
            <CardHeader>
              <CardTitle className="font-display text-base">
                Property Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                type="button"
                data-ocid="hotel_admin.property_form.dropzone"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-body text-muted-foreground">
                  Click to upload property images
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WEBP accepted
                </p>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                data-ocid="hotel_admin.property_form.upload_button"
              />
              {imageFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {imageFiles.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="relative rounded-lg overflow-hidden aspect-video bg-muted"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        data-ocid={`hotel_admin.property_form.remove_image.button.${idx + 1}`}
                        className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card className="border-border shadow-xs">
            <CardHeader>
              <CardTitle className="font-display text-base">
                Amenities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add amenity (e.g. WiFi)"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAmenity(amenityInput);
                    }
                  }}
                  data-ocid="hotel_admin.property_form.amenity.input"
                  className="font-body"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addAmenity(amenityInput)}
                  data-ocid="hotel_admin.property_form.amenity.button"
                  className="flex-shrink-0 font-body"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {AMENITY_SUGGESTIONS.filter(
                  (a) => !form.amenities.includes(a),
                ).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addAmenity(suggestion)}
                    className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors font-body border border-border"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
              {form.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-body font-medium"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        data-ocid="hotel_admin.property_form.remove_amenity.button"
                        className="hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rules & Times */}
          <Card className="border-border shadow-xs">
            <CardHeader>
              <CardTitle className="font-display text-base">
                Rules & Check-in Times
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="font-body text-sm font-medium">
                  Rules & Regulations
                </Label>
                <Textarea
                  placeholder="e.g. No smoking, No pets, Check-out by 11 AM..."
                  value={form.rules}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, rules: e.target.value }))
                  }
                  data-ocid="hotel_admin.property_form.rules.textarea"
                  className="font-body resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-body text-sm font-medium">
                    <Clock className="inline w-3.5 h-3.5 mr-1" />
                    Check-in Time
                  </Label>
                  <Input
                    type="time"
                    value={form.checkinTime}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, checkinTime: e.target.value }))
                    }
                    data-ocid="hotel_admin.property_form.checkin_time.input"
                    className="font-body"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-body text-sm font-medium">
                    <Clock className="inline w-3.5 h-3.5 mr-1" />
                    Check-out Time
                  </Label>
                  <Input
                    type="time"
                    value={form.checkoutTime}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, checkoutTime: e.target.value }))
                    }
                    data-ocid="hotel_admin.property_form.checkout_time.input"
                    className="font-body"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload progress */}
          {submitMutation.isPending &&
            uploadProgress > 0 &&
            uploadProgress < 100 && (
              <div className="space-y-1">
                <p className="text-xs font-body text-muted-foreground">
                  Uploading images... {uploadProgress}%
                </p>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

          <Button
            type="button"
            disabled={submitMutation.isPending}
            onClick={() => submitMutation.mutate()}
            data-ocid="hotel_admin.property_form.submit_button"
            className="w-full bg-primary text-primary-foreground font-body font-semibold h-12 text-base"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit for Approval"
            )}
          </Button>
        </main>
      </div>
    );
  }

  // Dashboard view
  return (
    <div
      data-ocid="hotel_admin.page"
      className="min-h-screen bg-background pb-24"
    >
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-foreground text-xl">
              Owner Dashboard
            </h1>
            <p className="text-muted-foreground text-sm font-body">
              {hotelOwner?.name || user?.name || "Hotel Owner"} · {ownerEmail}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              data-ocid="hotel_admin.add_property.button"
              className="bg-primary text-primary-foreground font-body font-semibold flex items-center gap-1.5"
              onClick={() => setShowForm(true)}
            >
              <PlusCircle className="w-4 h-4" />
              Add Property
            </Button>
            <Button
              size="sm"
              variant="outline"
              data-ocid="hotel_admin.logout.button"
              className="font-body text-xs flex items-center gap-1.5"
              onClick={handleLogout}
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {isLoading ? (
          <div
            data-ocid="hotel_admin.properties.loading_state"
            className="flex items-center justify-center py-16"
          >
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : properties.length === 0 ? (
          <div
            data-ocid="hotel_admin.properties.empty_state"
            className="text-center py-16 text-muted-foreground font-body"
          >
            <Building2 className="w-12 h-12 mx-auto mb-4 text-primary/30" />
            <p className="text-lg font-display font-bold text-foreground">
              No properties yet
            </p>
            <p className="text-sm mt-1">
              Submit your first property to get started.
            </p>
            <Button
              className="mt-4 bg-primary text-primary-foreground"
              onClick={() => setShowForm(true)}
              data-ocid="hotel_admin.empty.add_property.button"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add First Property
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground font-body">
              {properties.length}{" "}
              {properties.length === 1 ? "property" : "properties"} listed
            </p>
            {properties.map((prop, i) => (
              <Card
                key={prop.id}
                data-ocid={`hotel_admin.property.item.${i + 1}`}
                className="border-border shadow-xs"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {prop.imageUrls.length > 0 ? (
                        <img
                          src={prop.imageUrls[0]}
                          alt={prop.propertyName}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-7 h-7 text-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-display font-bold text-foreground">
                          {prop.propertyName}
                        </h3>
                        <p className="text-muted-foreground text-sm font-body">
                          {prop.city} · {prop.propertyType}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-primary font-body font-semibold text-sm">
                            ₹
                            {Number(prop.pricePerNight).toLocaleString("en-IN")}
                            /night
                          </span>
                          <StatusBadge status={prop.status} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
