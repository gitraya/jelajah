import {
  Calendar,
  CheckCircle,
  Clock,
  Map,
  MapPin,
  Package,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserAvatar } from "@/components/UserAvatar";
import { ITINERARY_TYPES_ICONS } from "@/configs/itinerary";
import { ItinerariesProvider } from "@/contexts/ItinerariesContext";
import { PackingItemsProvider } from "@/contexts/PackingItemsContext";
import { TripProvider } from "@/contexts/TripContext";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { useItineraries } from "@/hooks/useItineraries";
import { usePackingItems } from "@/hooks/usePackingItems";
import { useTrip } from "@/hooks/useTrip";
import { formatCurrency, getInitials } from "@/lib/utils";

import NotFound from "./NotFound";

export default function TripDetail() {
  return (
    <TripProvider>
      <ItinerariesProvider>
        <PackingItemsProvider>
          <div className="min-h-screen bg-background">
            <TripDetailContent />
          </div>
        </PackingItemsProvider>
      </ItinerariesProvider>
    </TripProvider>
  );
}

const TripDetailContent = () => {
  const navigate = useNavigate();
  const { postRequest } = useApi();
  const { user } = useAuth();
  const { trip, isLoading, itinerarySummary } = useTrip();
  const { itineraries } = useItineraries();
  const { packingItems } = usePackingItems();
  const [isJoining, setIsJoining] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading trip details...
      </div>
    );
  }

  if (!trip) {
    return <NotFound />;
  }

  const name = `${trip.owner.first_name} ${trip.owner.last_name}`;
  const isFull = trip.members_count >= trip.member_spots;
  const spotsLeft = trip.member_spots - trip.members_count;

  const handleJoinTrip = async () => {
    if (!user) {
      navigate("/login?redirect=/trips/" + trip.id);
      toast.info("Please log in to join the trip.");
      return;
    }

    try {
      setIsJoining(true);
      await postRequest(`/trips/${trip.id}/join/`);
      toast.success(
        "Successfully sent join request! you will be notified via email."
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.detail ||
          "Failed to send join request. Please try again later."
      );
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex lg:items-center gap-4 flex-col lg:flex-row">
            <Link
              as="button"
              onClick={() => navigate(-1)}
              className={buttonVariants({
                variant: "outline",
              })}
            >
              ← Back to Browse
            </Link>

            <div className="flex-1 flex items-center gap-4 flex-wrap">
              <div>
                <h1 className="mb-2 font-semibold">{trip.title}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{trip.destination}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{trip.dates}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>
                      {trip.members_count}/{trip.member_spots} member
                      {trip.member_spots > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-auto">
                <Badge variant="secondary" className="px-3 py-1">
                  {trip.duration_label}
                </Badge>
                <UserAvatar />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Trip Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-4 sm:gap-2 justify-between flex-wrap">
              <div className="flex items-center gap-2 shrink-0">
                <Map className="w-5 h-5" />
                About This Trip
              </div>
              {trip.is_joinable && !isFull && (
                <Button onClick={handleJoinTrip} disabled={isJoining}>
                  {isJoining
                    ? "Joining..."
                    : `Join Trip (${spotsLeft} spots left)`}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{trip.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Organizer */}
              <div className="space-y-2">
                <h4>Trip Organizer</h4>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={trip.owner.avatar} />
                    <AvatarFallback>{getInitials(name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-sm text-muted-foreground">
                      {trip.owner.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Info */}
              <div className="space-y-2">
                <h4>Trip Details</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{trip.duration_label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {trip.members_count}/{trip.member_spots} travelers
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{trip.dates}</span>
                  </div>
                </div>
              </div>

              {/* Budget Info */}
              <div className="space-y-2">
                <h4>Budget Estimate</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total budget:</span>
                    <span>{formatCurrency(trip.budget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Per person:</span>
                    <span className="font-medium">
                      {formatCurrency(trip.budget / trip.member_spots)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Itinerary */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Itinerary</CardTitle>
            <CardDescription>
              Our planned activities for each day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {itinerarySummary.map((day, index) => {
                const totalItems = day.itineraries.length + day.tasks;
                const completedItems =
                  day.locations_visited + day.tasks_completed;
                const isFullyComplete =
                  totalItems > 0 && completedItems === totalItems;

                return (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 border rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isFullyComplete
                            ? "bg-green-100 text-green-800"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {isFullyComplete ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          day.date.split(" ")[1]
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4>{day.date}</h4>
                        {isFullyComplete && (
                          <Badge variant="default" className="bg-green-600">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2 break-all">
                        {day.locations.join(", ")}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {day.itineraries.map((name, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Highlights */}
        <Card>
          <CardHeader>
            <CardTitle>Trip Highlights</CardTitle>
            <CardDescription>
              Must-see destinations and experiences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {itineraries.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 border rounded-lg"
                >
                  <div className="text-2xl">
                    {ITINERARY_TYPES_ICONS[item.type.name] || "📍"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {/* <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{item.rating}</span>
                      </div> */}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Travel Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Travel Tips & Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="mb-3">What to Bring</h4>
                {packingItems?.length === 0 ? (
                  <small>
                    <i>No packing items listed.</i>
                  </small>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {packingItems.slice(0, 5).map((item) => {
                      return (
                        <li key={item.id} className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          {item.name}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div>
                <h4 className="mb-3">Important Notes</h4>
                {trip.notes ? (
                  trip.notes
                ) : (
                  <small>
                    <i>No additional notes provided.</i>
                  </small>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Want to join this adventure? Contact {name} at{" "}
            <a href={`mailto:${trip.owner.email}`} className="hover:underline">
              {trip.owner.email}
            </a>
          </p>
        </div>
      </div>
    </>
  );
};
