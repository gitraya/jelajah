import {
  Calendar,
  DollarSign,
  Edit,
  Eye,
  MapPin,
  Settings,
  Share,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { ConfirmationDialog } from "@/components/dialogs/ConfirmationDialog";
import TripDialog from "@/components/dialogs/TripDialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "@/components/UserAvatar";
import { TagsProvider } from "@/contexts/TagsContext";
import { TripsProvider } from "@/contexts/TripsContext";
import { useApi } from "@/hooks/useApi";
import { useTrips } from "@/hooks/useTrips";
import { getTripStatusColor } from "@/lib/colors";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function MyTrips() {
  return (
    <TripsProvider>
      <TagsProvider>
        <div className="min-h-screen bg-background">
          <MyTripsContent />
        </div>
      </TagsProvider>
    </TripsProvider>
  );
}

const MyTripsContent = () => {
  const { deleteRequest, patchRequest } = useApi();
  const {
    fetchMyTrips,
    myTrips,
    setMyTrips,
    tripsStatistics,
    fetchTripsStatistics,
  } = useTrips();
  const { my_trips: statistics } = tripsStatistics || {};
  const [isLoading, setIsLoading] = useState(true);
  const [editTrip, setEditTrip] = useState(null);

  const startEditTrip = (trip) => {
    setEditTrip(trip);
  };

  const onSuccessEditTrip = (updatedTrip) => {
    setMyTrips((prevTrips) =>
      prevTrips.map((trip) =>
        trip.id === updatedTrip.id ? { ...trip, ...updatedTrip } : trip
      )
    );
    setEditTrip(null);
    toast(`Trip "${updatedTrip.title}" updated successfully.`);
  };

  const deleteTrip = (id) => {
    const deletedTrip = myTrips.find((trip) => trip.id === id);
    toast(`Trip "${deletedTrip.title}" deleted.`);
    setMyTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== id));
    deleteRequest(`/trips/${id}/`);
  };

  const togglePublic = (id, is_public) => {
    const updatedTrip = myTrips.find((trip) => trip.id === id);
    toast(
      `Trip "${updatedTrip.title}" is now ${is_public ? "public" : "private"}.`
    );
    setMyTrips((prevTrips) =>
      prevTrips.map((trip) => (trip.id === id ? { ...trip, is_public } : trip))
    );
    patchRequest(`/trips/${id}/`, { is_public });
  };

  const copyPublicLink = (tripId) => {
    const url = `${window.location.origin}/trips/${tripId}`;
    navigator.clipboard.writeText(url);
    toast.success("Public trip link copied to clipboard!");
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchMyTrips(), fetchTripsStatistics()]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  return (
    <>
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="mb-2 text-2xl font-semibold">My Trips</h1>
                <p className="text-muted-foreground">
                  Manage your travel adventures
                </p>
                <Link
                  to="/"
                  className="mt-3 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Browse Public Trips
                </Link>
              </div>
              <UserAvatar className="sm:hidden" />
            </div>
            <div className="flex items-center gap-3">
              <TripDialog />
              <UserAvatar className="hidden sm:block" />
            </div>
          </div>
        </div>
      </div>

      {/* Trip Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold break-words">
                {statistics?.total || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ongoing Trips
              </CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 break-words">
                {statistics?.ongoing || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Trips
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 break-words">
                {statistics?.upcoming || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Budget
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold break-words">
                {formatCurrency(statistics?.total_budget || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg">Loading trips...</div>
          </div>
        )}

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {myTrips.map((trip) => {
            const budgetPercentage =
              trip.budget > 0 ? (trip.spent_budget / trip.budget) * 100 : 0;

            return (
              <Card
                key={trip.id}
                className="group hover:shadow-lg transition-shadow gap-3"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{trip.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{trip.destination}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(trip.start_date)} -{" "}
                          {formatDate(trip.end_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>
                          {trip.members_count}/{trip.member_spots} member
                          {trip.member_spots > 1 ? "s" : ""} • {trip.duration}{" "}
                          day{trip.duration > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={getTripStatusColor(trip.status.toLowerCase())}
                    >
                      {trip.status.charAt(0) +
                        trip.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {trip.description}
                  </p>

                  {/* Tags */}
                  {trip.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {trip.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Budget Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Budget</span>
                      <span>
                        {formatCurrency(trip.spent_budget)} /{" "}
                        {formatCurrency(trip.budget)}
                      </span>
                    </div>
                    <Progress value={budgetPercentage} className="w-full h-2" />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/trips/${trip.id}/manage`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Manage
                      </Link>
                      {trip.is_public && (
                        <Link
                          to={`/trips/${trip.id}`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      {trip.is_editable && (
                        <TripDialog
                          trip={editTrip}
                          onSuccess={onSuccessEditTrip}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditTrip(trip)}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          }
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPublicLink(trip.id)}
                        disabled={!trip.is_public}
                      >
                        <Share className="w-4 h-4" />
                      </Button>
                      {trip.is_editable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePublic(trip.id, !trip.is_public)}
                          className={
                            trip.is_public
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {trip.is_deletable && (
                        <ConfirmationDialog
                          title="Delete Trip"
                          description="Are you sure you want to delete this trip? This action cannot be undone."
                          onConfirm={() => deleteTrip(trip.id)}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          }
                        />
                      )}
                    </div>
                  </div>

                  {trip.is_public && (
                    <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Public - anyone with link can view
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};
