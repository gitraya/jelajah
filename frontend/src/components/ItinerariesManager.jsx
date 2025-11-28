import {
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

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
import { TRIP_MEMBER_ROLES } from "@/configs/trip";
import { useItineraries } from "@/hooks/useItineraries";
import { useTrip } from "@/hooks/useTrip";
import { getMapStatusColor, getMapTypeColor } from "@/lib/colors";
import { formatDateTime } from "@/lib/utils";

import ItineraryDialog from "./dialogs/ItineraryDialog";

const generateGoogleMapsUrl = (location) => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    location.name + " " + location.address
  )}`;
};

export function ItinerariesManager() {
  const { trip } = useTrip();
  const {
    types,
    deleteLocation,
    updateStatus,
    statistics,
    isLoading,
    selectedType,
    selectedStatus,
    setSelectedStatus,
    setSelectedType,
    locations,
    itineraries,
  } = useItineraries();

  if (isLoading) {
    return <div className="space-y-6">Loading...</div>;
  }

  const { total, planned, visited, skipped } = statistics;

  const statuses = [
    { id: "all", name: "All" },
    ...Object.entries(ITINERARY_STATUSES).map(([key, value]) => ({
      id: key,
      name: value,
    })),
  ];

  const handleDeleteLocation = (locationId) => {
    deleteLocation(locationId);
    toast.success("Location deleted successfully");
  };

  const handleToggleLocationStatus = (locationId, status) => {
    updateStatus(locationId, status);
    toast.success("Location status updated successfully");
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Locations
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold break-all">{total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planned</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold break-all">{planned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visited</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold break-all">{visited}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skipped</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold break-all">{skipped}</div>
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
            <CardHeader className="flex flex-wrap flex-row items-center justify-between">
              <div>
                <CardTitle>Locations & Places</CardTitle>
                <CardDescription>
                  Manage your trip destinations and points of interest
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="sm:w-32">
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
                  <SelectTrigger className="sm:w-32">
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
                {trip.user_role !== TRIP_MEMBER_ROLES.MEMBER[0] && (
                  <ItineraryDialog triggerClassName="w-full sm:w-auto" />
                )}
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
                      <div className="flex flex-wrap items-start justify-between mb-3 gap-3 sm:gap-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{location.name}</h4>
                            <Badge
                              className={getMapTypeColor(location.type?.name)}
                            >
                              {location.type?.name}
                            </Badge>
                            <Badge
                              className={getMapStatusColor(location.status)}
                            >
                              {ITINERARY_STATUSES[location.status]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {location.address}
                          </p>
                          {location.description && (
                            <p className="text-sm mb-2 break-all">
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
                              Visit: {formatDateTime(location.visit_time)}
                            </span>
                          </div>
                          {location.notes && (
                            <p className="text-sm text-muted-foreground mt-2 italic break-all">
                              Note: {location.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-auto sm:ml-4">
                          {trip.user_role !== TRIP_MEMBER_ROLES.MEMBER[0] && (
                            <Select
                              value={location.status}
                              onValueChange={(value) =>
                                handleToggleLocationStatus(location.id, value)
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statuses.slice(1).map((status) => (
                                  <SelectItem key={status.id} value={status.id}>
                                    {status.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
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
                          {trip.user_role !== TRIP_MEMBER_ROLES.MEMBER[0] && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLocation(location.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
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
                {itineraries.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No scheduled locations. Add visit dates to your locations to
                    see them here.
                  </p>
                ) : (
                  itineraries.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-shrink-0 w-16 text-center">
                        <div className="text-sm font-medium">
                          {formatDateTime(location.visit_time)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-medium break-all">
                            {location.name}
                          </h4>
                          <Badge
                            className={getMapTypeColor(location.type?.name)}
                          >
                            {location.type?.name}
                          </Badge>
                          <Badge className={getMapStatusColor(location.status)}>
                            {ITINERARY_STATUSES[location.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground break-all">
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
