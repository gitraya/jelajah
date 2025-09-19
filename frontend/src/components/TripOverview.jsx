import { CheckCircle, Clock, DollarSign, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

export function TripOverview({ tripData }) {
  const budgetPercentage = (tripData.spentBudget / tripData.totalBudget) * 100;

  const itinerary = [
    {
      day: 1,
      date: "March 15",
      title: "Arrival in Denpasar",
      activities: ["Airport pickup", "Hotel check-in", "Welcome dinner"],
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
      status: "completed",
    },
    {
      day: 3,
      date: "March 17",
      title: "Temple Hopping",
      activities: ["Tanah Lot Temple", "Uluwatu Temple", "Kecak Fire Dance"],
      status: "upcoming",
    },
    {
      day: 4,
      date: "March 18",
      title: "Beach Day",
      activities: ["Seminyak Beach", "Water sports", "Beach club"],
      status: "upcoming",
    },
    {
      day: 5,
      date: "March 19",
      title: "Adventure Day",
      activities: ["White water rafting", "ATV ride", "Volcano tour"],
      status: "upcoming",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(tripData.totalBudget)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(tripData.spentBudget)} spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tripData.members}</div>
            <p className="text-xs text-muted-foreground">travelers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tripData.duration}</div>
            <p className="text-xs text-muted-foreground">{tripData.dates}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">40%</div>
            <p className="text-xs text-muted-foreground">completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>
            Track your spending throughout the trip
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
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
        </CardContent>
      </Card>

      {/* Itinerary Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Itinerary</CardTitle>
          <CardDescription>
            Your planned activities for each day
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
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {day.day}
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
                  <p className="text-sm text-muted-foreground mb-2">
                    {day.date}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {day.activities.map((activity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
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
    </div>
  );
}
