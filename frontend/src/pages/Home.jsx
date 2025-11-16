import _ from "lodash";
import {
  Calendar,
  DollarSign,
  Eye,
  Globe,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import HowItWorksDialog from "@/components/dialogs/HowItWorksDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAvatar } from "@/components/UserAvatar";
import { DIFFICULTY_LEVELS, TRIP_STATUSES } from "@/configs/trip";
import { TripsProvider } from "@/contexts/TripsContext";
import { useAuth } from "@/hooks/useAuth";
import { useTrips } from "@/hooks/useTrips";
import { getTripDifficultyColor, getTripStatusColor } from "@/lib/colors";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

export default function Home() {
  return (
    <TripsProvider>
      <div className="min-h-screen bg-background">
        <HomeContent />
      </div>
    </TripsProvider>
  );
}

const HomeContent = () => {
  const { user } = useAuth();
  const {
    fetchPublicTrips,
    publicTrips,
    tripsStatistics,
    fetchTripsStatistics,
  } = useTrips();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const handleClearFilters = () => {
    setInputValue("");
    setSearchQuery("");
    setSelectedDestination("All");
    setSelectedStatus("All");
    setSelectedDifficulty("All");
  };

  const getSearchQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("title", searchQuery);
    if (selectedDestination !== "All")
      params.append("destination", selectedDestination);
    if (selectedStatus !== "All") params.append("status", selectedStatus);
    if (selectedDifficulty !== "All")
      params.append("difficulty", selectedDifficulty);
    return params.toString();
  }, [searchQuery, selectedDestination, selectedStatus, selectedDifficulty]);

  const debouncedSetSearchQuery = useCallback(
    _.debounce((value) => setSearchQuery(value), 500),
    []
  );

  const handleSearchInputChange = (e) => {
    setInputValue(e.target.value);
    debouncedSetSearchQuery(e.target.value);
  };

  useEffect(() => {
    const fetchFilteredTrips = async () => {
      setIsLoading(true);
      await fetchPublicTrips(getSearchQueryString());
      setIsLoading(false);
    };
    fetchFilteredTrips();
  }, [getSearchQueryString, fetchPublicTrips]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchPublicTrips(), fetchTripsStatistics()]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const statuses = ["All", "PLANNING", "ONGOING", "COMPLETED"];
  const difficulties = ["All", "EASY", "MODERATE", "CHALLENGING"];
  const destinations = ["All", ...(tripsStatistics.destinations || [])];

  return (
    <>
      {/* Header with User Avatar */}
      {user && (
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-end">
              <UserAvatar />
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-4">
              <Globe className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold">
                Jelajah: Discover Amazing Trips
              </h1>
            </div>
            <p className="text-lg text-muted-foreground mb-8">
              Join fellow travelers on incredible adventures around the world.
              Browse public trips, connect with organizers, and embark on your
              next journey.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to={user ? "/trips/my" : "/login?redirect=/trips/my"}
                className={buttonVariants({
                  size: "lg",
                })}
              >
                {user ? "My Trips" : "Plan Your Own Trip"}
              </Link>
              {user ? (
                <HowItWorksDialog />
              ) : (
                <Link
                  to="/login"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                  })}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Available Trips
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold break-words">
                {tripsStatistics.total}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Open for Joining
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 break-words">
                {tripsStatistics.joinable}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Destinations
              </CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold break-words">
                {tripsStatistics.destinations?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold break-words">
                {formatCurrency(tripsStatistics.average_budget || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Find Your Perfect Trip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search trips, destinations, or tags..."
                  value={inputValue}
                  onChange={handleSearchInputChange}
                  className="w-full"
                />
              </div>
              <Select
                value={selectedDestination}
                onValueChange={setSelectedDestination}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Destination" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((dest) => (
                    <SelectItem key={dest} value={dest}>
                      {dest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "All" ? "All" : TRIP_STATUSES[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedDifficulty}
                onValueChange={setSelectedDifficulty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty === "All"
                        ? "All"
                        : DIFFICULTY_LEVELS[difficulty]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {publicTrips.length} {publicTrips.length === 1 ? "Trip" : "Trips"}{" "}
            Found
          </h2>
          <div className="text-sm text-muted-foreground">
            Sorted by relevance
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg">Loading trips...</div>
          </div>
        )}

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicTrips.map((trip) => {
            const spotsLeft = trip.member_spots - trip.members_count;

            return (
              <Link key={trip.id} to={`/trips/${trip.id}`}>
                <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="mb-2 group-hover:text-primary transition-colors">
                          {trip.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{trip.destination}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDate(trip.start_date)} -{" "}
                            {formatDate(trip.end_date)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={getTripStatusColor(trip.status)}>
                          {TRIP_STATUSES[trip.status]}
                        </Badge>
                        {trip.is_joinable && spotsLeft > 0 && (
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            {spotsLeft} spots left
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {trip.description}
                    </p>

                    {/* Organizer */}
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={trip.owner.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(
                            `${trip.owner.first_name} ${trip.owner.last_name}`
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        by {trip.owner.first_name} {trip.owner.last_name}
                      </span>
                    </div>

                    {/* Trip Details */}
                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="ml-1 font-medium">
                          {trip.duration} day{trip.duration > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Group:</span>
                        <span className="ml-1 font-medium">
                          {trip.members_count}/{trip.member_spots} people
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="ml-1 font-medium">
                        {formatCurrency(trip.budget / trip.member_spots)}
                        /person
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      <span className="text-muted-foreground">Level:</span>
                      <Badge
                        className={getTripDifficultyColor(trip.difficulty)}
                        size="sm"
                      >
                        {DIFFICULTY_LEVELS[trip.difficulty]}
                      </Badge>
                    </div>

                    {/* Highlights */}
                    <div className="mb-3">
                      <div className="text-sm text-muted-foreground mb-1">
                        Highlights:
                      </div>
                      {trip.highlights.length === 0 && (
                        <div className="text-xs text-muted-foreground italic">
                          No highlights provided.
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {trip.highlights.slice(0, 3).map((highlight, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
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

                    {/* Action */}
                    <Button
                      className="w-full"
                      variant={trip.is_joinable ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/trips/${trip.id}`);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {trip.is_joinable ? "View & Join" : "View Trip"}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {publicTrips.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              No trips found matching your criteria.
            </div>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Footer CTA */}
        <div className="text-center py-12 mt-12 border-t">
          <h3 className="text-xl font-semibold mb-4">
            Ready to Plan Your Own Adventure?
          </h3>
          <p className="text-muted-foreground mb-6">
            Create your own trip and invite others to join your journey.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to={user ? "/trips/my/" : "/login"}
              className={buttonVariants({ size: "lg" })}
            >
              Start Planning Now
            </Link>
            {!user && (
              <Link
                to="/login"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                })}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
