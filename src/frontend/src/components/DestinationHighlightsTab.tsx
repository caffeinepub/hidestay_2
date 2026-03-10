import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, MapPin, Plus, Star, Trash2, TreePine } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "hidestay_destination_highlights";

export interface CuratedAttraction {
  name: string;
  category: string;
  distance: string;
}

export interface CuratedHotel {
  name: string;
  type: string;
  pricePerNight: number;
  rating: number;
}

export interface DestinationHighlight {
  id: string;
  destination: string;
  description: string;
  attractions: CuratedAttraction[];
  recommendedHotels: CuratedHotel[];
}

export function loadHighlights(): DestinationHighlight[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHighlights(data: DestinationHighlight[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

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

const ATTRACTION_CATEGORIES = [
  "Landmark",
  "Spiritual",
  "Nature",
  "Adventure",
  "Heritage",
  "Wildlife",
  "Waterfall",
  "Lake",
  "Viewpoint",
  "Shopping",
];

const HOTEL_TYPES = ["Hotel", "Resort", "Homestay", "Guest House"];

export default function DestinationHighlightsTab() {
  const [highlights, setHighlights] = useState<DestinationHighlight[]>([]);
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editing, setEditing] = useState<DestinationHighlight | null>(null);

  // form state
  const [formDest, setFormDest] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [attractions, setAttractions] = useState<CuratedAttraction[]>([]);
  const [hotels, setHotels] = useState<CuratedHotel[]>([]);

  // attraction form
  const [attrName, setAttrName] = useState("");
  const [attrCat, setAttrCat] = useState("Landmark");
  const [attrDist, setAttrDist] = useState("");

  // hotel form
  const [hotelName, setHotelName] = useState("");
  const [hotelType, setHotelType] = useState("Hotel");
  const [hotelPrice, setHotelPrice] = useState("");
  const [hotelRating, setHotelRating] = useState("4");

  useEffect(() => {
    setHighlights(loadHighlights());
  }, []);

  function openAdd() {
    setFormDest("");
    setFormDesc("");
    setAttractions([]);
    setHotels([]);
    setEditing(null);
    setView("add");
  }

  function openEdit(h: DestinationHighlight) {
    setFormDest(h.destination);
    setFormDesc(h.description);
    setAttractions([...h.attractions]);
    setHotels([...h.recommendedHotels]);
    setEditing(h);
    setView("edit");
  }

  function addAttraction() {
    if (!attrName.trim()) return;
    setAttractions((prev) => [
      ...prev,
      { name: attrName.trim(), category: attrCat, distance: attrDist || "N/A" },
    ]);
    setAttrName("");
    setAttrDist("");
  }

  function removeAttraction(i: number) {
    setAttractions((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addHotel() {
    if (!hotelName.trim()) return;
    setHotels((prev) => [
      ...prev,
      {
        name: hotelName.trim(),
        type: hotelType,
        pricePerNight: Number.parseInt(hotelPrice) || 0,
        rating: Number.parseFloat(hotelRating) || 4,
      },
    ]);
    setHotelName("");
    setHotelPrice("");
  }

  function removeHotel(i: number) {
    setHotels((prev) => prev.filter((_, idx) => idx !== i));
  }

  function saveEntry() {
    if (!formDest) return;
    let updated: DestinationHighlight[];
    if (editing) {
      updated = highlights.map((h) =>
        h.id === editing.id
          ? {
              ...h,
              destination: formDest,
              description: formDesc,
              attractions,
              recommendedHotels: hotels,
            }
          : h,
      );
    } else {
      const newEntry: DestinationHighlight = {
        id: Date.now().toString(),
        destination: formDest,
        description: formDesc,
        attractions,
        recommendedHotels: hotels,
      };
      updated = [...highlights, newEntry];
    }
    saveHighlights(updated);
    setHighlights(updated);
    setView("list");
  }

  function deleteEntry(id: string) {
    const updated = highlights.filter((h) => h.id !== id);
    saveHighlights(updated);
    setHighlights(updated);
  }

  if (view === "add" || view === "edit") {
    return (
      <div data-ocid="destination_highlights.form.panel">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView("list")}
            data-ocid="destination_highlights.back.button"
          >
            ← Back
          </Button>
          <h2 className="text-xl font-semibold text-gray-800">
            {view === "edit" ? "Edit Destination" : "Add Destination Highlight"}
          </h2>
        </div>

        <div className="grid gap-6 max-w-3xl">
          {/* Destination + Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" /> Destination Info
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Destination *
                </p>
                <Select value={formDest} onValueChange={setFormDest}>
                  <SelectTrigger data-ocid="destination_highlights.destination.select">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {DESTINATIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Description
                </p>
                <Input
                  placeholder="Brief description of this destination..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  data-ocid="destination_highlights.description.input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Attractions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TreePine className="w-4 h-4 text-green-600" /> Nearby
                Attractions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {attractions.length > 0 && (
                <div className="space-y-2">
                  {attractions.map((a, i) => (
                    <div
                      key={`attr-${a.name}-${i}`}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                      data-ocid={`destination_highlights.attraction.item.${i + 1}`}
                    >
                      <div>
                        <span className="font-medium text-sm">{a.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {a.category} · {a.distance}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttraction(i)}
                        data-ocid={`destination_highlights.attraction.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Attraction name"
                  value={attrName}
                  onChange={(e) => setAttrName(e.target.value)}
                  data-ocid="destination_highlights.attraction_name.input"
                />
                <Select value={attrCat} onValueChange={setAttrCat}>
                  <SelectTrigger data-ocid="destination_highlights.attraction_category.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ATTRACTION_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Distance (e.g. 3 km)"
                  value={attrDist}
                  onChange={(e) => setAttrDist(e.target.value)}
                  data-ocid="destination_highlights.attraction_distance.input"
                />
                <Button
                  onClick={addAttraction}
                  className="bg-green-600 hover:bg-green-700"
                  data-ocid="destination_highlights.add_attraction.button"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Hotels */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-green-600" /> Recommended
                Hotels
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {hotels.length > 0 && (
                <div className="space-y-2">
                  {hotels.map((h, i) => (
                    <div
                      key={`hotel-${h.name}-${i}`}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                      data-ocid={`destination_highlights.hotel.item.${i + 1}`}
                    >
                      <div>
                        <span className="font-medium text-sm">{h.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {h.type} · ₹{h.pricePerNight.toLocaleString()}/night ·
                          ⭐ {h.rating}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHotel(i)}
                        data-ocid={`destination_highlights.hotel.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Hotel name"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  data-ocid="destination_highlights.hotel_name.input"
                />
                <Select value={hotelType} onValueChange={setHotelType}>
                  <SelectTrigger data-ocid="destination_highlights.hotel_type.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOTEL_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Price per night (₹)"
                  type="number"
                  value={hotelPrice}
                  onChange={(e) => setHotelPrice(e.target.value)}
                  data-ocid="destination_highlights.hotel_price.input"
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Rating (1-5)"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={hotelRating}
                    onChange={(e) => setHotelRating(e.target.value)}
                    data-ocid="destination_highlights.hotel_rating.input"
                  />
                  <Button
                    onClick={addHotel}
                    className="bg-green-600 hover:bg-green-700"
                    data-ocid="destination_highlights.add_hotel.button"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            className="bg-green-600 hover:bg-green-700 w-full"
            onClick={saveEntry}
            disabled={!formDest}
            data-ocid="destination_highlights.save.button"
          >
            {view === "edit" ? "Save Changes" : "Save Destination Highlight"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div data-ocid="destination_highlights.list.panel">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Destination Highlights
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Curated destinations, attractions, and hotels that appear in AI Trip
            Planner results.
          </p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={openAdd}
          data-ocid="destination_highlights.add.button"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Destination
        </Button>
      </div>

      {highlights.length === 0 ? (
        <div
          className="text-center py-16 text-gray-400"
          data-ocid="destination_highlights.list.empty_state"
        >
          <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No destination highlights yet</p>
          <p className="text-sm mt-1">
            Add your first destination to start curating AI Trip Planner
            results.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {highlights.map((h, i) => (
            <Card
              key={h.id}
              className="border border-gray-200"
              data-ocid={`destination_highlights.item.${i + 1}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-gray-800">
                        {h.destination}
                      </span>
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        {h.attractions.length} attractions
                      </Badge>
                      <Badge
                        className="bg-saffron-100 text-orange-700 text-xs"
                        style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}
                      >
                        {h.recommendedHotels.length} hotels
                      </Badge>
                    </div>
                    {h.description && (
                      <p className="text-sm text-gray-500 mb-2">
                        {h.description}
                      </p>
                    )}
                    {h.attractions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {h.attractions.slice(0, 4).map((a) => (
                          <span
                            key={`a-${a.name}`}
                            className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5"
                          >
                            {a.name}
                          </span>
                        ))}
                        {h.attractions.length > 4 && (
                          <span className="text-xs text-gray-400">
                            +{h.attractions.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                    {h.recommendedHotels.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {h.recommendedHotels.slice(0, 3).map((hotel) => (
                          <span
                            key={`h-${hotel.name}`}
                            className="text-xs bg-orange-50 text-orange-700 rounded-full px-2 py-0.5 flex items-center gap-1"
                          >
                            <Star className="w-2.5 h-2.5" /> {hotel.name}
                          </span>
                        ))}
                        {h.recommendedHotels.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{h.recommendedHotels.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(h)}
                      data-ocid={`destination_highlights.edit_button.${i + 1}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEntry(h.id)}
                      data-ocid={`destination_highlights.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
