import {
  AlertCircle,
  Calendar,
  CheckSquare,
  Clock,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CHECKLIST_CATEGORIES, CHECKLIST_PRIORITY } from "@/configs/checklist";
import { TRIP_MEMBER_ROLES } from "@/configs/trip";
import { useAuth } from "@/hooks/useAuth";
import { useChecklist } from "@/hooks/useChecklist";
import { useTrip } from "@/hooks/useTrip";
import { getItineraryPriorityColor } from "@/lib/colors";
import { formatDate, isOverdue } from "@/lib/utils";

import ChecklistDialog from "./dialogs/ChecklistDialog";

export const ChecklistPriorityIcon = ({ priority }) => {
  switch (priority) {
    case "high":
      return <AlertCircle className="w-4 h-4" />;
    case "medium":
      return <Clock className="w-4 h-4" />;
    default:
      return <CheckSquare className="w-4 h-4" />;
  }
};

const getAssignedName = (assignedTo) => {
  return `${assignedTo.user.first_name} ${assignedTo.user.last_name}`;
};

const getIsEditable = (checklist, user, userRole) => {
  return (
    userRole !== TRIP_MEMBER_ROLES.MEMBER[0] ||
    checklist.assigned_to?.user?.id === user?.id
  );
};

export function ChecklistManager() {
  const { user } = useAuth();
  const { trip } = useTrip();
  const {
    statistics,
    isLoading,
    upcomingChecklistItems,
    checklistItems,
    selectedCategory,
    setSelectedCategory,
    toggleCompleted,
    deleteItem,
  } = useChecklist();
  const { total_items, completed_items, category_stats } = statistics;

  const categories = [
    { id: "all", name: "All" },
    ...Object.entries(CHECKLIST_CATEGORIES).map(([key, value]) => ({
      id: key,
      name: value,
    })),
  ];

  const completionPercentage =
    total_items > 0 ? (completed_items / total_items) * 100 : 0;

  if (isLoading) {
    return <div className="space-y-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Checklist Progress
          </CardTitle>
          <CardDescription>
            {completed_items} of {total_items} tasks completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completed</span>
              <span>{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
          <CardDescription>Tasks due soon that need attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingChecklistItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No upcoming tasks
              </p>
            ) : (
              upcomingChecklistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1 rounded ${getItineraryPriorityColor(
                        item.priority
                      )}`}
                    >
                      <ChecklistPriorityIcon priority={item.priority} />
                    </div>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Due {formatDate(item.due_date)}</span>
                        <span>•</span>
                        <span>{getAssignedName(item.assigned_to)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {CHECKLIST_CATEGORIES[item.category]}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progress by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {category_stats?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {category_stats.map((stat) => (
                <div key={stat.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      {CHECKLIST_CATEGORIES[stat.category]}
                    </span>
                    <Badge variant="outline">
                      {stat.completed}/{stat.total}
                    </Badge>
                  </div>
                  <Progress
                    value={(stat.completed / stat.total) * 100 || 0}
                    className="w-full h-2"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No tasks found</p>
          )}
        </CardContent>
      </Card>

      {/* Checklist Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Tasks</CardTitle>
            <CardDescription>
              Manage your trip preparation tasks
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ChecklistDialog />
          </div>
        </CardHeader>
        <CardContent>
          {checklistItems?.length > 0 ? (
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    item.is_completed ? "bg-muted/50" : ""
                  } ${
                    isOverdue(item.due_date, item.is_completed)
                      ? "border-red-200 bg-red-50"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Checkbox
                        checked={item.is_completed}
                        disabled={
                          getIsEditable(item, user, trip.user_role)
                            ? false
                            : true
                        }
                        onCheckedChange={() => toggleCompleted(item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <h4
                          className={`font-medium ${
                            item.is_completed
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {item.title}
                        </h4>
                        {item.description && (
                          <p
                            className={`text-sm mt-1 ${
                              item.is_completed
                                ? "line-through text-muted-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            className={getItineraryPriorityColor(item.priority)}
                          >
                            {CHECKLIST_PRIORITY[item.priority]}
                          </Badge>
                          <Badge variant="outline">
                            {CHECKLIST_CATEGORIES[item.category]}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(item.due_date)}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            • {getAssignedName(item.assigned_to)}
                          </span>
                          {isOverdue(item.due_date, item.is_completed) && (
                            <Badge variant="destructive">Overdue</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {trip.user_role !== TRIP_MEMBER_ROLES.MEMBER[0] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {selectedCategory === "all"
                ? "No tasks found. Start by adding some!"
                : "No tasks in this category. Try selecting a different category or add new tasks."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
