import {
  AlertCircle,
  Calendar,
  CheckSquare,
  Clock,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

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
import { useApi } from "@/hooks/useApi";
import { useChecklist } from "@/hooks/useChecklist";
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

export function ChecklistManager() {
  const { id: tripId } = useParams();
  const { statistics, setStatistics, fetchStatistics, updateChecklist } =
    useChecklist();
  const { getRequest, patchRequest, deleteRequest } = useApi();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const {
    total_items,
    completed_items,
    categories: categoryStats,
  } = statistics;
  const [upcomingItems, setUpcomingItems] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    getRequest(
      `/trips/${tripId}/checklist/items${
        selectedCategory !== "all" ? `?category=${selectedCategory}` : ""
      }`
    )
      .then((response) => setItems(response.data))
      .finally(() => setIsLoading(false));
  }, [updateChecklist, selectedCategory]);

  useEffect(() => {
    fetchStatistics(tripId);
  }, [updateChecklist]);

  useEffect(() => {
    getRequest(`/trips/${tripId}/checklist/items/?upcoming=true`)
      .then((response) => setUpcomingItems(response.data))
      .finally(() => setIsLoading(false));
  }, [updateChecklist, items]);

  const categories = [
    { id: "all", name: "All" },
    ...Object.entries(CHECKLIST_CATEGORIES).map(([key, value]) => ({
      id: key,
      name: value,
    })),
  ];

  const completionPercentage =
    total_items > 0 ? (completed_items / total_items) * 100 : 0;

  const toggleCompleted = (id) => {
    const toggledItem = items.find((item) => item.id === id);
    const is_completed = !toggledItem.is_completed;
    setItems(
      items.map((item) => (item.id === id ? { ...item, is_completed } : item))
    );
    setStatistics((prev) => ({
      ...prev,
      completed_items: is_completed
        ? prev.completed_items + 1
        : prev.completed_items - 1,
      categories: prev.categories.map((cat) => {
        if (cat.category?.id === toggledItem.category.id) {
          return {
            ...cat,
            completed: is_completed ? cat.completed + 1 : cat.completed - 1,
          };
        }
        return cat;
      }),
    }));
    patchRequest(`/trips/${tripId}/checklist/items/${id}/`, {
      is_completed,
    });
  };

  const deleteItem = (id) => {
    const deletedItem = items.find((item) => item.id === id);
    setItems(items.filter((item) => item.id !== id));
    setStatistics((prev) => ({
      ...prev,
      total_items: prev.total_items - 1,
      completed_items: deletedItem.is_completed
        ? prev.completed_items - 1
        : prev.completed_items,
      categories: prev.categories
        .map((cat) => {
          if (cat.category?.id === deletedItem.category.id) {
            return {
              ...cat,
              total: cat.total - 1,
              completed: deletedItem.is_completed
                ? cat.completed - 1
                : cat.completed,
            };
          }
          return cat;
        })
        .filter((cat) => cat.total > 0),
    }));
    deleteRequest(`/trips/${tripId}/checklist/items/${id}/`);
  };

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
            {upcomingItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No upcoming tasks
              </p>
            ) : (
              upcomingItems.map((item) => (
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
          {categoryStats?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categoryStats.map((stat) => (
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
          {items?.length > 0 ? (
            <div className="space-y-3">
              {items.map((item) => (
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
