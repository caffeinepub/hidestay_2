import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Edit, Lock, PlusCircle, ToggleLeft } from "lucide-react";
import { useState } from "react";

const INITIAL_PROPERTIES = [
  {
    id: 1,
    name: "Mountain Dew Resort",
    location: "Manali, Himachal Pradesh",
    price: "₹4,500",
    category: "Resorts",
    active: true,
  },
  {
    id: 2,
    name: "Green Valley Homestay",
    location: "Coorg, Karnataka",
    price: "₹1,800",
    category: "Homestays",
    active: true,
  },
  {
    id: 3,
    name: "City Hub Hotel",
    location: "Bengaluru, Karnataka",
    price: "₹3,200",
    category: "Hotels",
    active: false,
  },
];

export default function HotelAdmin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [properties, setProperties] = useState(INITIAL_PROPERTIES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProp, setNewProp] = useState({
    name: "",
    location: "",
    price: "",
    category: "Hotels",
  });

  const handleLogin = () => {
    if (password === "hotel123") {
      setAuthed(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  const toggleStatus = (id: number) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
    );
  };

  const handleAddProperty = () => {
    if (!newProp.name || !newProp.location || !newProp.price) return;
    setProperties((prev) => [
      ...prev,
      { id: Date.now(), ...newProp, active: true },
    ]);
    setNewProp({ name: "", location: "", price: "", category: "Hotels" });
    setDialogOpen(false);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 pb-24">
        <Card className="w-full max-w-sm shadow-green border-border">
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <CardTitle className="font-display text-xl text-foreground">
              Hotel Admin Login
            </CardTitle>
            <p className="text-muted-foreground text-sm font-body mt-1">
              Enter your password to access the hotel owner dashboard.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="hotel-password" className="font-body text-sm">
                Password
              </Label>
              <Input
                id="hotel-password"
                type="password"
                placeholder="Enter password"
                value={password}
                data-ocid="hotel_admin.password.input"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="font-body"
              />
            </div>
            {error && (
              <p
                data-ocid="hotel_admin.login.error_state"
                className="text-destructive text-xs font-body"
              >
                {error}
              </p>
            )}
            <Button
              className="w-full bg-primary text-primary-foreground font-body font-semibold"
              data-ocid="hotel_admin.login.submit_button"
              onClick={handleLogin}
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      data-ocid="hotel_admin.page"
      className="min-h-screen bg-background pb-24"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-foreground text-xl">
              Hotel Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-sm font-body">
              Welcome, Hotel Owner
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                data-ocid="hotel_admin.add_property.open_modal_button"
                className="bg-primary text-primary-foreground font-body font-semibold flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent
              data-ocid="hotel_admin.add_property.dialog"
              className="font-body"
            >
              <DialogHeader>
                <DialogTitle className="font-display">
                  Add New Property
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Property Name</Label>
                  <Input
                    placeholder="e.g. Sunrise Boutique Hotel"
                    value={newProp.name}
                    onChange={(e) =>
                      setNewProp((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g. Shimla, Himachal Pradesh"
                    value={newProp.location}
                    onChange={(e) =>
                      setNewProp((p) => ({ ...p, location: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Price per Night (₹)</Label>
                  <Input
                    placeholder="e.g. ₹2,500"
                    value={newProp.price}
                    onChange={(e) =>
                      setNewProp((p) => ({ ...p, price: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select
                    value={newProp.category}
                    onValueChange={(v) =>
                      setNewProp((p) => ({ ...p, category: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hotels">Hotels</SelectItem>
                      <SelectItem value="Resorts">Resorts</SelectItem>
                      <SelectItem value="Homestays">Homestays</SelectItem>
                      <SelectItem value="Guest Houses">Guest Houses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  data-ocid="hotel_admin.add_property.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddProperty}
                  data-ocid="hotel_admin.add_property.confirm_button"
                  className="bg-primary text-primary-foreground"
                >
                  Add Property
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Property List */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <p className="text-sm text-muted-foreground font-body">
          {properties.length} properties listed
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
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground">
                      {prop.name}
                    </h3>
                    <p className="text-muted-foreground text-sm font-body">
                      {prop.location}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-primary font-body font-semibold text-sm">
                        {prop.price}/night
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-body"
                      >
                        {prop.category}
                      </Badge>
                      <Badge
                        variant={prop.active ? "default" : "secondary"}
                        className={`text-[10px] font-body ${
                          prop.active
                            ? "bg-primary text-primary-foreground"
                            : ""
                        }`}
                      >
                        {prop.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-body text-xs"
                    data-ocid={`hotel_admin.property.edit_button.${i + 1}`}
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-body text-xs"
                    data-ocid={`hotel_admin.property.toggle.${i + 1}`}
                    onClick={() => toggleStatus(prop.id)}
                  >
                    <ToggleLeft className="w-3.5 h-3.5 mr-1" />
                    {prop.active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}
