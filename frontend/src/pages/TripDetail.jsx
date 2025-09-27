import {
  Calendar,
  CheckCircle,
  Map,
  MapPin,
  Package,
  Star,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

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
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "@/components/UserAvatar";
import { formatCurrency, getInitials } from "@/lib/utils";

export default function TripDetail() {
  const navigate = useNavigate();
  // Mock trip data - in a real app, you'd fetch this based on tripId
  const tripData = {
    title: "Jelajah Bali Adventure",
    destination: "Bali, Indonesia",
    dates: "March 15-22, 2024",
    duration: "8 days",
    members: 6,
    totalBudget: 15000000,
    spentBudget: 8500000,
    description:
      "An amazing adventure exploring the cultural and natural beauty of Bali with friends. Join us as we discover ancient temples, pristine beaches, lush rice terraces, and vibrant local culture.",
    organizer: {
      name: "John Smith",
      avatar: "",
      email: "john.smith@email.com",
    },
  };

  const budgetPercentage = (tripData.spentBudget / tripData.totalBudget) * 100;

  const itinerary = [
    {
      day: 1,
      date: "March 15",
      title: "Arrival in Denpasar",
      activities: ["Airport pickup", "Hotel check-in", "Welcome dinner"],
      location: "Denpasar Airport & Hotel",
      status: "completed",
    },
    {
      day: 2,
      date: "March 16",
      title: "Ubud Cultural Tour",
      activities: [
        "Tegallalang Rice Terraces",
        "Monkey Forest",
        "Traditional market",
      ],
      location: "Ubud",
      status: "completed",
    },
    {
      day: 3,
      date: "March 17",
      title: "Temple Hopping",
      activities: ["Tanah Lot Temple", "Uluwatu Temple", "Kecak Fire Dance"],
      location: "Tabanan & Uluwatu",
      status: "upcoming",
    },
    {
      day: 4,
      date: "March 18",
      title: "Beach Day",
      activities: ["Seminyak Beach", "Water sports", "Beach club"],
      location: "Seminyak",
      status: "upcoming",
    },
    {
      day: 5,
      date: "March 19",
      title: "Adventure Day",
      activities: ["White water rafting", "ATV ride", "Volcano tour"],
      location: "Ubud & Mount Batur",
      status: "upcoming",
    },
  ];

  const highlights = [
    {
      title: "Tegallalang Rice Terraces",
      description:
        "UNESCO World Heritage rice terraces with stunning valley views",
      rating: 4.8,
      image: "🌾",
    },
    {
      title: "Uluwatu Temple",
      description:
        "Clifftop temple with spectacular sunset views and Kecak dance",
      rating: 4.7,
      image: "🏛️",
    },
    {
      title: "Seminyak Beach",
      description:
        "Premium beach destination with world-class dining and surfing",
      rating: 4.6,
      image: "🏖️",
    },
    {
      title: "White Water Rafting",
      description:
        "Thrilling adventure through Bali's lush tropical landscapes",
      rating: 4.9,
      image: "🚣",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
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

            <div className="flex-1 flex items-center gap-4">
              <div>
                <h1 className="mb-2 font-semibold">{tripData.title}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{tripData.destination}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{tripData.dates}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{tripData.members} members</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-auto">
                <Badge variant="secondary" className="px-3 py-1">
                  {tripData.duration}
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
            <CardTitle className="flex items-center gap-2">
              <Map className="w-5 h-5" />
              Trip Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{tripData.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Organizer */}
              <div className="space-y-2">
                <h4>Trip Organizer</h4>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={tripData.organizer.avatar} />
                    <AvatarFallback>
                      {getInitials(tripData.organizer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{tripData.organizer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {tripData.organizer.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <h4>Budget Progress</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Spent</span>
                    <span>{Math.round(budgetPercentage)}%</span>
                  </div>
                  <Progress value={budgetPercentage} className="w-full" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatCurrency(tripData.spentBudget)}</span>
                    <span>{formatCurrency(tripData.totalBudget)}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2">
                <h4>Trip Stats</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="break-words">{tripData.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Group size:</span>
                    <span className="break-words">
                      {tripData.members} people
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Cost per person:
                    </span>
                    <span className="break-words">
                      {formatCurrency(tripData.totalBudget / tripData.members)}
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
              {itinerary.map((day) => (
                <div
                  key={day.day}
                  className="flex items-start space-x-4 p-4 border rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        day.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {day.status === "completed" ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        day.day
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4>{day.title}</h4>
                      <Badge
                        variant={
                          day.status === "completed" ? "default" : "secondary"
                        }
                      >
                        {day.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {day.date} • {day.location}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {day.activities.map((activity, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
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
              {highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 border rounded-lg"
                >
                  <div className="text-2xl">{highlight.image}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{highlight.title}</h4>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{highlight.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {highlight.description}
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
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    Comfortable walking shoes
                  </li>
                  <li className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    Sunscreen (SPF 50+)
                  </li>
                  <li className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    Light rain jacket
                  </li>
                  <li className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    Swimwear and beach towel
                  </li>
                  <li className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    Power bank and camera
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-3">Important Notes</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Best time to visit temples is early morning</li>
                  <li>• Dress modestly when visiting religious sites</li>
                  <li>• Keep valuables secure at beaches</li>
                  <li>• Stay hydrated and use mosquito repellent</li>
                  <li>• Have cash ready for local markets</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Want to join this adventure? Contact {tripData.organizer.name} at{" "}
            {tripData.organizer.email}
          </p>
        </div>
      </div>
    </div>
  );
}
