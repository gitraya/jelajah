import {
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ITINERARY_STATUSES } from "@/configs/itinerary";
import { useApi } from "@/hooks/useApi";
import { useItinerary } from "@/hooks/useItinerary";
import { getMapStatusColor, getMapTypeColor } from "@/lib/colors";
import { formatDate } from "@/lib/utils";

import ItineraryDialog from "./dialogs/ItineraryDialog";

const generateGoogleMapsUrl = (location) => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    location.name + " " + location.address
  )}`;
};

export function ItinerariesManager() {
  const { id: tripId } = useParams();
  const { types, updateItinerary, statistics, setStatistics, fetchStatistics } =
    useItinerary();
  const { getRequest, deleteRequest, patchRequest } = useApi();
  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { total_items, planned_items, visited_items, skipped_items } =
    statistics;

  useEffect(() => {
    setIsLoading(true);
    getRequest(
      `/trips/${tripId}/itinerary/items${
        selectedType !== "all" ? `?type_id=${selectedType}` : ""
      }`
    )
      .then((response) => setLocations(response.data))
      .finally(() => setIsLoading(false));

    getRequest(`/trips/${tripId}/itinerary/items/`)
      .then((response) => {
        setItinerary(
          response.data
            .filter((l) => l.visit_time && l.status !== "skipped")
            .sort(
              (a, b) =>
                new Date(a.visit_time).getTime() -
                new Date(b.visit_time).getTime()
            )
        );
      })
      .finally(() => setIsLoading(false));
  }, [updateItinerary, selectedType]);

  useEffect(() => {
    fetchStatistics(tripId);
  }, [updateItinerary]);

  const statuses = [
    { id: "all", name: "All" },
    ...Object.entries(ITINERARY_STATUSES).map(([key, value]) => ({
      id: key,
      name: value,
    })),
  ];

  const deleteLocation = (id) => {
    const deletedLocation = locations.find((location) => location.id === id);
    setLocations(locations.filter((location) => location.id !== id));
    setItinerary(itinerary.filter((location) => location.id !== id));
    setStatistics((prev) => ({
      ...prev,
      total_items: prev.total_items - 1,
      planned_items:
        deletedLocation.status === "planned"
          ? prev.planned_items - 1
          : prev.planned_items,
      visited_items:
        deletedLocation.status === "visited"
          ? prev.visited_items - 1
          : prev.visited_items,
      skipped_items:
        deletedLocation.status === "skipped"
          ? prev.skipped_items - 1
          : prev.skipped_items,
    }));
    deleteRequest(`/trips/${tripId}/itinerary/items/${id}/`);
  };

  // : 'planned' | 'visited' | 'skipped'
  const updateStatus = (id, status) => {
    setLocations(
      locations.map((location) =>
        location.id === id ? { ...location, status } : location
      )
    );
    setItinerary(
      itinerary
        .map((location) =>
          location.id === id ? { ...location, status } : location
        )
        .filter((location) => location.status !== "skipped")
    );
    setStatistics((prev) => {
      const location = locations.find((loc) => loc.id === id);
      let { planned_items, visited_items, skipped_items } = prev;

      // Decrement old status count
      if (location.status === "planned") planned_items -= 1;
      else if (location.status === "visited") visited_items -= 1;
      else if (location.status === "skipped") skipped_items -= 1;

      // Increment new status count
      if (status === "planned") planned_items += 1;
      else if (status === "visited") visited_items += 1;
      else if (status === "skipped") skipped_items += 1;

      return {
        ...prev,
        planned_items,
        visited_items,
        skipped_items,
      };
    });
    patchRequest(`/trips/${tripId}/itinerary/items/${id}/`, { status });
  };

  if (isLoading) {
    return <div className="space-y-6">Loading...</div>;
  }

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
            <div className="text-2xl font-bold">{total_items}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planned</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planned_items}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visited</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visited_items}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skipped</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skipped_items}</div>
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
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
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
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ItineraryDialog />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No locations added yet. Use the "Add to Itinerary" button to
                    include places in your trip.
                  </p>
                ) : (
                  locations.map((location) => (
                    <div key={location.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{location.name}</h4>
                            <Badge className={getMapTypeColor(location.type)}>
                              {location.type}
                            </Badge>
                            <Badge
                              className={getMapStatusColor(location.status)}
                            >
                              {location.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {location.address}
                          </p>
                          {location.description && (
                            <p className="text-sm mb-2">
                              {location.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {location.rating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{location.rating}</span>
                              </div>
                            )}
                            {location.estimated_time && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{location.estimated_time}</span>
                              </div>
                            )}
                            <span>
                              Visit: {formatDate(location.visit_time)}
                            </span>
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
                              {statuses.map((status) => (
                                <SelectItem key={status.id} value={status.id}>
                                  {status.name}
                                </SelectItem>
                              ))}
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
                  ))
                )}
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
                          {formatDate(location.visit_time)}
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
                        {location.estimated_time && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Clock className="w-4 h-4" />
                            <span>{location.estimated_time}</span>
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
