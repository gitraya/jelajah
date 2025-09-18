import {
  Calendar,
  DollarSign,
  Eye,
  Globe,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { getDifficultyColor, getStatusColor } from "@/lib/colors";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  // Mock public trips data
  const publicTrips = [
    {
      id: "1",
      title: "Jelajah Bali Adventure",
      destination: "Bali, Indonesia",
      startDate: "2024-03-15",
      endDate: "2024-03-22",
      duration: 8,
      members: 6,
      maxMembers: 8,
      totalBudget: 15000000,
      spentBudget: 8500000,
      status: "ongoing",
      description:
        "Explore the cultural and natural beauty of Bali with fellow adventurers.",
      organizer: {
        name: "John Smith",
        avatar: "",
      },
      highlights: ["Ubud Rice Terraces", "Uluwatu Temple", "Seminyak Beach"],
      difficulty: "moderate",
      tags: ["Culture", "Nature", "Beach"],
      createdAt: "2024-02-01",
      joinable: true,
    },
    {
      id: "2",
      title: "Tokyo Cherry Blossom Tour",
      destination: "Tokyo, Japan",
      startDate: "2024-04-05",
      endDate: "2024-04-12",
      duration: 7,
      members: 4,
      maxMembers: 6,
      totalBudget: 20000000,
      spentBudget: 2500000,
      status: "planning",
      description:
        "Experience cherry blossom season in Tokyo with traditional temples and modern city life.",
      organizer: {
        name: "Sarah Johnson",
        avatar: "",
      },
      highlights: ["Shibuya Crossing", "Senso-ji Temple", "Cherry Blossoms"],
      difficulty: "easy",
      tags: ["Culture", "City", "Festival"],
      createdAt: "2024-02-15",
      joinable: true,
    },
    {
      id: "3",
      title: "Backpacking Southeast Asia",
      destination: "Thailand, Vietnam, Cambodia",
      startDate: "2024-01-10",
      endDate: "2024-02-10",
      duration: 31,
      members: 2,
      maxMembers: 4,
      totalBudget: 25000000,
      spentBudget: 24800000,
      status: "completed",
      description:
        "Budget backpacking adventure through Southeast Asia highlights.",
      organizer: {
        name: "Mike Chen",
        avatar: "",
      },
      highlights: ["Angkor Wat", "Ha Long Bay", "Bangkok Markets"],
      difficulty: "challenging",
      tags: ["Backpacking", "Budget", "Adventure"],
      createdAt: "2023-12-01",
      joinable: false,
    },
    {
      id: "4",
      title: "Iceland Northern Lights",
      destination: "Reykjavik, Iceland",
      startDate: "2024-02-20",
      endDate: "2024-02-27",
      duration: 7,
      members: 5,
      maxMembers: 8,
      totalBudget: 30000000,
      spentBudget: 28000000,
      status: "completed",
      description:
        "Chase the Northern Lights and explore Iceland's dramatic landscapes.",
      organizer: {
        name: "Lisa Rodriguez",
        avatar: "",
      },
      highlights: ["Northern Lights", "Blue Lagoon", "Golden Circle"],
      difficulty: "moderate",
      tags: ["Nature", "Aurora", "Winter"],
      createdAt: "2024-01-15",
      joinable: false,
    },
    {
      id: "5",
      title: "Patagonia Hiking Expedition",
      destination: "Chile & Argentina",
      startDate: "2024-05-10",
      endDate: "2024-05-24",
      duration: 14,
      members: 3,
      maxMembers: 6,
      totalBudget: 35000000,
      spentBudget: 0,
      status: "planning",
      description:
        "Epic hiking adventure through Patagonia's most spectacular trails.",
      organizer: {
        name: "Tom Wilson",
        avatar: "",
      },
      highlights: ["Torres del Paine", "Fitz Roy", "Perito Moreno"],
      difficulty: "challenging",
      tags: ["Hiking", "Nature", "Adventure"],
      createdAt: "2024-03-01",
      joinable: true,
    },
    {
      id: "6",
      title: "European Summer Roadtrip",
      destination: "France, Italy, Switzerland",
      startDate: "2024-06-20",
      endDate: "2024-07-05",
      duration: 15,
      members: 6,
      maxMembers: 8,
      totalBudget: 35000000,
      spentBudget: 0,
      status: "planning",
      description:
        "Road trip through Europe's most beautiful destinations this summer.",
      organizer: {
        name: "Anna Davis",
        avatar: "",
      },
      highlights: ["Swiss Alps", "Tuscany", "French Riviera"],
      difficulty: "easy",
      tags: ["Roadtrip", "Culture", "Summer"],
      createdAt: "2024-03-01",
      joinable: true,
    },
  ];

  const onGoToMyTrips = () => {
    // Navigate to My Trips page
    window.location.href = "/my-trips";
  };

  const onViewTrip = (tripId) => {
    // Navigate to Trip Details page
    window.location.href = `/trips/${tripId}`;
  };

  // Filter trips based on search and filters
  const filteredTrips = publicTrips.filter((trip) => {
    const matchesSearch =
      searchQuery === "" ||
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesDestination =
      selectedDestination === "All" ||
      trip.destination.includes(selectedDestination);

    const matchesStatus =
      selectedStatus === "All" || trip.status === selectedStatus;

    const matchesDifficulty =
      selectedDifficulty === "All" || trip.difficulty === selectedDifficulty;

    return (
      matchesSearch && matchesDestination && matchesStatus && matchesDifficulty
    );
  });

  const destinations = [
    "All",
    "Bali",
    "Tokyo",
    "Thailand",
    "Iceland",
    "Patagonia",
    "Europe",
  ];
  const statuses = ["All", "planning", "ongoing", "completed"];
  const difficulties = ["All", "easy", "moderate", "challenging"];

  const stats = {
    total: publicTrips.length,
    joinable: publicTrips.filter((t) => t.joinable).length,
    destinations: new Set(publicTrips.map((t) => t.destination.split(",")[0]))
      .size,
    avgBudget:
      publicTrips.reduce((sum, trip) => sum + trip.totalBudget, 0) /
      publicTrips.length,
  };

  return (
    <div className="min-h-screen bg-background">
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
              <Button size="lg" onClick={onGoToMyTrips}>
                Plan Your Own Trip
              </Button>
              <Button variant="outline" size="lg">
                How It Works
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Available Trips
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold break-words">
                {stats.total}
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
                {stats.joinable}
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
                {stats.destinations}
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
                {formatCurrency(stats.avgBudget)}
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                      {status === "All"
                        ? "All"
                        : status.charAt(0).toUpperCase() + status.slice(1)}
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
                        : difficulty.charAt(0).toUpperCase() +
                          difficulty.slice(1)}
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
            {filteredTrips.length}{" "}
            {filteredTrips.length === 1 ? "Trip" : "Trips"} Found
          </h2>
          <div className="text-sm text-muted-foreground">
            Sorted by relevance
          </div>
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const spotsLeft = trip.maxMembers - trip.members;

            return (
              <Card
                key={trip.id}
                className="group hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onViewTrip(trip.id)}
              >
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
                          {formatDate(trip.startDate)} -{" "}
                          {formatDate(trip.endDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={getStatusColor(trip.status)}>
                        {trip.status}
                      </Badge>
                      {trip.joinable && spotsLeft > 0 && (
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
                      <AvatarImage src={trip.organizer.avatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(trip.organizer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      by {trip.organizer.name}
                    </span>
                  </div>

                  {/* Trip Details */}
                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="ml-1 font-medium">
                        {trip.duration} days
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Group:</span>
                      <span className="ml-1 font-medium">
                        {trip.members}/{trip.maxMembers} people
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="ml-1 font-medium">
                      {formatCurrency(trip.totalBudget / trip.maxMembers)}
                      /person
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-muted-foreground">Level:</span>
                    <Badge
                      className={getDifficultyColor(trip.difficulty)}
                      size="sm"
                    >
                      {trip.difficulty}
                    </Badge>
                  </div>

                  {/* Highlights */}
                  <div className="mb-3">
                    <div className="text-sm text-muted-foreground mb-1">
                      Highlights:
                    </div>
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
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Action */}
                  <Button
                    className="w-full"
                    variant={trip.joinable ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewTrip(trip.id);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {trip.joinable ? "View & Join" : "View Trip"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTrips.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              No trips found matching your criteria.
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedDestination("All");
                setSelectedStatus("All");
                setSelectedDifficulty("All");
              }}
            >
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
          <Button size="lg" onClick={onGoToMyTrips}>
            Start Planning Now
          </Button>
        </div>
      </div>
    </div>
  );
}
