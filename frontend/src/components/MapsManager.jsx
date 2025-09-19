import {
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getMapStatusColor, getMapTypeColor } from "@/lib/colors";
import { formatDate } from "@/lib/utils";

export function MapsManager() {
  const [locations, setLocations] = useState([
    {
      id: "1",
      name: "Tegallalang Rice Terraces",
      address: "Jl. Raya Tegallalang, Tegallalang, Gianyar Regency",
      type: "Nature",
      description:
        "Famous rice terraces with stunning views and traditional irrigation system",
      coordinates: { lat: -8.4337, lng: 115.2827 },
      rating: 4.5,
      estimatedTime: "2-3 hours",
      visitDate: "2024-03-16",
      notes:
        "Best time for photos is early morning. Bring comfortable walking shoes.",
      status: "planned",
    },
    {
      id: "2",
      name: "Tanah Lot Temple",
      address: "Beraban, Kediri, Tabanan Regency",
      type: "Cultural",
      description: "Iconic temple on a rock formation in the sea",
      coordinates: { lat: -8.6208, lng: 115.0869 },
      rating: 4.3,
      estimatedTime: "1-2 hours",
      visitDate: "2024-03-17",
      notes: "Visit during sunset for best experience. Can get very crowded.",
      status: "planned",
    },
    {
      id: "3",
      name: "Ubud Monkey Forest Sanctuary",
      address: "Jl. Monkey Forest Rd, Ubud, Gianyar Regency",
      type: "Nature",
      description: "Sacred sanctuary and nature reserve complex in Ubud",
      coordinates: { lat: -8.5186, lng: 115.2587 },
      rating: 4.0,
      estimatedTime: "1 hour",
      visitDate: "2024-03-16",
      notes: "Keep belongings secure. Monkeys can be mischievous!",
      status: "visited",
    },
    {
      id: "4",
      name: "Seminyak Beach",
      address: "Seminyak, Kuta, Badung Regency",
      type: "Beach",
      description:
        "Popular beach known for its upscale beach clubs and sunset views",
      coordinates: { lat: -8.6842, lng: 115.1726 },
      rating: 4.2,
      estimatedTime: "Half day",
      visitDate: "2024-03-18",
      notes:
        "Great for surfing and beach clubs. Book restaurant reservations in advance.",
      status: "planned",
    },
    {
      id: "5",
      name: "Uluwatu Temple",
      address: "Pecatu, South Kuta, Badung Regency",
      type: "Cultural",
      description: "Clifftop temple with spectacular ocean views",
      coordinates: { lat: -8.8292, lng: 115.0856 },
      rating: 4.6,
      estimatedTime: "2-3 hours",
      visitDate: "2024-03-17",
      notes: "Watch the famous Kecak fire dance performance at sunset.",
      status: "planned",
    },
  ]);

  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
    type: "",
    description: "",
    estimatedTime: "",
    visitDate: "",
    notes: "",
  });

  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const types = [
    "All",
    "Cultural",
    "Nature",
    "Beach",
    "Restaurant",
    "Shopping",
    "Activity",
    "Other",
  ];
  const statuses = ["All", "planned", "visited", "skipped"];

  const filteredLocations = locations.filter((location) => {
    const typeMatch = selectedType === "All" || location.type === selectedType;
    const statusMatch =
      selectedStatus === "All" || location.status === selectedStatus;
    return typeMatch && statusMatch;
  });

  const addLocation = () => {
    if (newLocation.name && newLocation.address && newLocation.type) {
      const location = {
        id: Date.now().toString(),
        name: newLocation.name,
        address: newLocation.address,
        type: newLocation.type,
        description: newLocation.description,
        coordinates: { lat: 0, lng: 0 }, // In a real app, you'd geocode the address
        rating: 0,
        estimatedTime: newLocation.estimatedTime,
        visitDate: newLocation.visitDate,
        notes: newLocation.notes,
        status: "planned",
      };
      setLocations([...locations, location]);
      setNewLocation({
        name: "",
        address: "",
        type: "",
        description: "",
        estimatedTime: "",
        visitDate: "",
        notes: "",
      });
      setIsAddingLocation(false);
    }
  };

  const deleteLocation = (id) => {
    setLocations(locations.filter((location) => location.id !== id));
  };

  // : 'planned' | 'visited' | 'skipped'
  const updateStatus = (id, status) => {
    setLocations(
      locations.map((location) =>
        location.id === id ? { ...location, status } : location
      )
    );
  };

  const generateGoogleMapsUrl = (location) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      location.name + " " + location.address
    )}`;
  };

  const stats = {
    total: locations.length,
    planned: locations.filter((l) => l.status === "planned").length,
    visited: locations.filter((l) => l.status === "visited").length,
    skipped: locations.filter((l) => l.status === "skipped").length,
  };

  const itinerary = locations
    .filter((l) => l.visitDate && l.status !== "skipped")
    .sort(
      (a, b) =>
        new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime()
    );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Locations
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planned</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.planned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visited</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.visited}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skipped</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.skipped}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="locations" className="w-full">
        <TabsList>
          <TabsTrigger value="locations">All Locations</TabsTrigger>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="space-y-4">
          {/* Locations List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Locations & Places</CardTitle>
                <CardDescription>
                  Manage your trip destinations and points of interest
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "All"
                          ? "All"
                          : status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog
                  open={isAddingLocation}
                  onOpenChange={setIsAddingLocation}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Location
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Location</DialogTitle>
                      <DialogDescription>
                        Add a new place to your trip itinerary
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                      <div>
                        <Label htmlFor="name">Location Name</Label>
                        <Input
                          id="name"
                          value={newLocation.name}
                          onChange={(e) =>
                            setNewLocation({
                              ...newLocation,
                              name: e.target.value,
                            })
                          }
                          placeholder="Enter location name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={newLocation.address}
                          onChange={(e) =>
                            setNewLocation({
                              ...newLocation,
                              address: e.target.value,
                            })
                          }
                          placeholder="Enter address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select
                          value={newLocation.type}
                          onValueChange={(value) =>
                            setNewLocation({ ...newLocation, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {types.slice(1).map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newLocation.description}
                          onChange={(e) =>
                            setNewLocation({
                              ...newLocation,
                              description: e.target.value,
                            })
                          }
                          placeholder="Describe this location"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="estimatedTime">Estimated Time</Label>
                          <Input
                            id="estimatedTime"
                            value={newLocation.estimatedTime}
                            onChange={(e) =>
                              setNewLocation({
                                ...newLocation,
                                estimatedTime: e.target.value,
                              })
                            }
                            placeholder="e.g., 2-3 hours"
                          />
                        </div>
                        <div>
                          <Label htmlFor="visitDate">Visit Date</Label>
                          <Input
                            id="visitDate"
                            type="date"
                            value={newLocation.visitDate}
                            onChange={(e) =>
                              setNewLocation({
                                ...newLocation,
                                visitDate: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={newLocation.notes}
                          onChange={(e) =>
                            setNewLocation({
                              ...newLocation,
                              notes: e.target.value,
                            })
                          }
                          placeholder="Any special notes or tips"
                          rows={2}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingLocation(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={addLocation}>Add Location</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLocations.map((location) => (
                  <div key={location.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{location.name}</h4>
                          <Badge className={getMapTypeColor(location.type)}>
                            {location.type}
                          </Badge>
                          <Badge className={getMapStatusColor(location.status)}>
                            {location.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {location.address}
                        </p>
                        {location.description && (
                          <p className="text-sm mb-2">{location.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {location.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{location.rating}</span>
                            </div>
                          )}
                          {location.estimatedTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{location.estimatedTime}</span>
                            </div>
                          )}
                          <span>Visit: {formatDate(location.visitDate)}</span>
                        </div>
                        {location.notes && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            Note: {location.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Select
                          value={location.status}
                          onValueChange={(value) =>
                            updateStatus(location.id, value)
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planned">Planned</SelectItem>
                            <SelectItem value="visited">Visited</SelectItem>
                            <SelectItem value="skipped">Skipped</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(
                              generateGoogleMapsUrl(location),
                              "_blank"
                            )
                          }
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteLocation(location.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="itinerary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Itinerary</CardTitle>
              <CardDescription>
                Your scheduled locations organized by date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {itinerary.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No scheduled locations. Add visit dates to your locations to
                    see them here.
                  </p>
                ) : (
                  itinerary.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-shrink-0 w-16 text-center">
                        <div className="text-sm font-medium">
                          {formatDate(location.visitDate)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{location.name}</h4>
                          <Badge className={getMapTypeColor(location.type)}>
                            {location.type}
                          </Badge>
                          <Badge className={getMapStatusColor(location.status)}>
                            {location.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {location.address}
                        </p>
                        {location.estimatedTime && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Clock className="w-4 h-4" />
                            <span>{location.estimatedTime}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(generateGoogleMapsUrl(location), "_blank")
                        }
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
