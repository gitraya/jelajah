import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Users,
} from "lucide-react";
import { useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useChecklist } from "@/hooks/useChecklist";
import { useExpenses } from "@/hooks/useExpenses";
import { useItineraries } from "@/hooks/useItineraries";
import { useTrip } from "@/hooks/useTrip";
import { formatCurrency } from "@/lib/utils";

export function TripOverview() {
  const { itinerarySummary, trip, fetchItinerarySummary } = useTrip();
  const { statistics: checklistStatistics } = useChecklist();
  const { statistics: expenseStatistics } = useExpenses();
  const { statistics: itineraryStatistics } = useItineraries();

  useEffect(() => {
    if (trip?.id) {
      fetchItinerarySummary(trip.id);
    }
  }, [trip?.id]);

  const { trip_budget, amount_spent } = expenseStatistics;
  const { total_items: total_tasks, completed_items: completed_tasks } =
    checklistStatistics;
  const {
    total: total_locations,
    planned: planned_locations,
    visited: visited_locations,
  } = itineraryStatistics;

  const budgetPercentage = (amount_spent / trip_budget) * 100;

  return (
    <div className="space-y-6">
      {/* Trip description and notes */}
      <Card>
        <CardHeader>
          <CardTitle>About this Trip</CardTitle>
          <CardDescription>
            Overview and summary of your trip details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trip?.description ? (
            <p className="whitespace-pre-wrap">{trip.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No description provided for this trip.
            </p>
          )}

          {trip?.notes && (
            <div className="mt-4">
              <h5 className="font-medium mb-2 italic">Additional Notes</h5>
              <p className="whitespace-pre-wrap">{trip.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold break-all">
              {formatCurrency(trip_budget)}
            </div>
            <p className="text-xs text-muted-foreground break-all">
              {formatCurrency(amount_spent)} spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trip.members_count}/{trip.member_spots}
            </div>
            <p className="text-xs text-muted-foreground">travelers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold break-all">
              {trip?.duration_label}
            </div>
            <p className="text-xs text-muted-foreground">{trip?.dates}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((completed_tasks / total_tasks) * 100) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">tasks completed</p>
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
              <span>{formatCurrency(amount_spent)}</span>
              <span>{formatCurrency(trip_budget)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks & Locations Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Tasks Progress
            </CardTitle>
            <CardDescription>From Checklist tab</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completed</span>
                <span>
                  {completed_tasks} / {total_tasks}
                </span>
              </div>
              <Progress
                value={(completed_tasks / total_tasks) * 100}
                className="w-full"
              />
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {completed_tasks}
                  </p>
                  <p className="text-xs text-muted-foreground">Done</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {`${total_tasks - completed_tasks}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{total_tasks}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Locations Progress
            </CardTitle>
            <CardDescription>From Maps tab</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Visited</span>
                <span>
                  {visited_locations} / {total_locations}
                </span>
              </div>
              <Progress
                value={(visited_locations / total_locations) * 100}
                className="w-full"
              />
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {visited_locations}
                  </p>
                  <p className="text-xs text-muted-foreground">Visited</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {`${planned_locations}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Planned</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{total_locations}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Itinerary Summary */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Daily Itinerary Summary</CardTitle>
            <CardDescription>
              Auto-generated from your Checklist and Maps data
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {itinerarySummary.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-1">No itinerary data available yet</p>
                <p className="text-sm">
                  Add tasks in the Checklist tab and locations in the Maps tab
                  to see your daily schedule
                </p>
              </div>
            ) : (
              itinerarySummary.map((day, index) => {
                const totalItems = day.itineraries.length + day.tasks;
                const completedItems =
                  day.locations_visited + day.tasks_completed;
                const isFullyComplete =
                  totalItems > 0 && completedItems === totalItems;
                const hasProgress = completedItems > 0;

                return (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 border rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-medium">{day.date}</h4>
                        {isFullyComplete && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                        {hasProgress && !isFullyComplete && (
                          <Badge variant="secondary">In Progress</Badge>
                        )}
                      </div>

                      {day.itineraries.length > 0 && (
                        <div className="mb-2">
                          <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground mb-1">
                            <MapPin className="w-3 h-3" />
                            <span>
                              Locations ({day.locations_visited}/
                              {day.itineraries.length} visited)
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {day.itineraries.map((name, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                              >
                                {name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {day.tasks > 0 && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CheckCircle className="w-3 h-3" />
                          <span>
                            {day.tasks_completed}/{day.tasks} tasks completed
                          </span>
                        </div>
                      )}

                      {day.tasks === 0 && day.itineraries.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No activities planned for this day.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {itinerarySummary.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <span className="text-blue-600 font-medium">ℹ️</span>
                <span>
                  This is a summary view. To manage your itinerary, use the{" "}
                  <strong>Checklist</strong> tab for tasks and the{" "}
                  <strong>Maps</strong> tab for locations.
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
