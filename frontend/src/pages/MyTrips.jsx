import {
  Calendar,
  DollarSign,
  Edit,
  Eye,
  MapPin,
  Share,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import TripDialog from "@/components/dialogs/TripDialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "@/components/UserAvatar";
import { getTripStatusColor } from "@/lib/colors";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function MyTrips() {
  const [trips, setTrips] = useState([
    {
      id: "1",
      title: "Jelajah Bali Adventure",
      destination: "Bali, Indonesia",
      startDate: "2024-03-15",
      endDate: "2024-03-22",
      duration: 8,
      members: 6,
      totalBudget: 15000000,
      spentBudget: 8500000,
      status: "ongoing",
      isPublic: true,
      description:
        "An amazing adventure exploring the cultural and natural beauty of Bali with friends.",
      createdAt: "2024-02-01",
    },
    {
      id: "2",
      title: "Tokyo Cherry Blossom Tour",
      destination: "Tokyo, Japan",
      startDate: "2024-04-05",
      endDate: "2024-04-12",
      duration: 7,
      members: 4,
      totalBudget: 20000000,
      spentBudget: 2500000,
      status: "planning",
      isPublic: false,
      description:
        "Cherry blossom season in Tokyo with traditional temples and modern city exploration.",
      createdAt: "2024-02-15",
    },
    {
      id: "3",
      title: "Backpacking Southeast Asia",
      destination: "Thailand, Vietnam, Cambodia",
      startDate: "2024-01-10",
      endDate: "2024-02-10",
      duration: 31,
      members: 2,
      totalBudget: 25000000,
      spentBudget: 24800000,
      status: "completed",
      isPublic: true,
      description:
        "Budget backpacking adventure through the highlights of Southeast Asia.",
      createdAt: "2023-12-01",
    },
    {
      id: "4",
      title: "European Summer Roadtrip",
      destination: "France, Italy, Switzerland",
      startDate: "2024-06-20",
      endDate: "2024-07-05",
      duration: 15,
      members: 8,
      totalBudget: 35000000,
      spentBudget: 0,
      status: "planning",
      isPublic: false,
      description:
        "Epic roadtrip through the most beautiful destinations in Europe.",
      createdAt: "2024-03-01",
    },
  ]);

  const deleteTrip = (id) => {
    setTrips(trips.filter((trip) => trip.id !== id));
  };

  const togglePublic = (id) => {
    setTrips(
      trips.map((trip) =>
        trip.id === id ? { ...trip, isPublic: !trip.isPublic } : trip
      )
    );
  };

  const copyPublicLink = (tripId) => {
    const url = `${window.location.origin}?view=public&trip=${tripId}`;
    navigator.clipboard.writeText(url);
    // In a real app, you'd show a toast notification here
    alert("Public link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background">
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
                {trips.length}
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
                {trips.filter((t) => t.status === "ongoing").length}
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
                {trips.filter((t) => t.status === "planning").length}
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
                {formatCurrency(
                  trips.reduce((sum, trip) => sum + trip.totalBudget, 0)
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {trips.map((trip) => {
            const budgetPercentage =
              trip.totalBudget > 0
                ? (trip.spentBudget / trip.totalBudget) * 100
                : 0;

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
                          {formatDate(trip.startDate)} -{" "}
                          {formatDate(trip.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>
                          {trip.members} members • {trip.duration} days
                        </span>
                      </div>
                    </div>
                    <Badge className={getTripStatusColor(trip.status)}>
                      {trip.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {trip.description}
                  </p>

                  {/* Budget Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Budget</span>
                      <span>
                        {formatCurrency(trip.spentBudget)} /{" "}
                        {formatCurrency(trip.totalBudget)}
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
                      {trip.isPublic && (
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
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPublicLink(trip.id)}
                        disabled={!trip.isPublic}
                      >
                        <Share className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePublic(trip.id)}
                        className={
                          trip.isPublic
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTrip(trip.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {trip.isPublic && (
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
    </div>
  );
}
