import {
  AlertCircle,
  Calendar,
  CheckSquare,
  Clock,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getItineraryPriorityColor } from "@/lib/colors";
import { formatDate, isOverdue } from "@/lib/utils";

export const ItineraryPriorityIcon = ({ priority }) => {
  switch (priority) {
    case "high":
      return <AlertCircle className="w-4 h-4" />;
    case "medium":
      return <Clock className="w-4 h-4" />;
    default:
      return <CheckSquare className="w-4 h-4" />;
  }
};

export function ChecklistManager() {
  const [items, setItems] = useState([
    {
      id: "1",
      title: "Book flight tickets",
      description: "Book round-trip tickets for all 6 members",
      category: "Pre-trip",
      priority: "high",
      dueDate: "2024-02-15",
      completed: true,
      assignedTo: "John",
    },
    {
      id: "2",
      title: "Apply for travel insurance",
      description: "Get comprehensive travel insurance for the group",
      category: "Pre-trip",
      priority: "high",
      dueDate: "2024-02-20",
      completed: true,
      assignedTo: "Sarah",
    },
    {
      id: "3",
      title: "Exchange currency",
      description: "Exchange money to Indonesian Rupiah",
      category: "Pre-trip",
      priority: "medium",
      dueDate: "2024-03-10",
      completed: false,
      assignedTo: "Mike",
    },
    {
      id: "4",
      title: "Download offline maps",
      description: "Download Google Maps offline for Bali region",
      category: "Pre-trip",
      priority: "low",
      dueDate: "2024-03-14",
      completed: false,
      assignedTo: "Lisa",
    },
    {
      id: "5",
      title: "Check weather forecast",
      description: "Monitor weather conditions before departure",
      category: "Pre-trip",
      priority: "low",
      dueDate: "2024-03-14",
      completed: false,
      assignedTo: "Tom",
    },
    {
      id: "6",
      title: "Confirm hotel booking",
      description: "Call hotel to confirm reservation details",
      category: "During trip",
      priority: "medium",
      dueDate: "2024-03-15",
      completed: false,
      assignedTo: "Anna",
    },
    {
      id: "7",
      title: "Submit expense reports",
      description: "Compile and submit all expense receipts",
      category: "Post-trip",
      priority: "medium",
      dueDate: "2024-03-30",
      completed: false,
      assignedTo: "John",
    },
  ]);

  // as 'low' | 'medium' | 'high'
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    dueDate: "",
    assignedTo: "",
  });

  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Pre-trip", "During trip", "Post-trip"];
  const members = ["John", "Sarah", "Mike", "Lisa", "Tom", "Anna"];

  const totalItems = items.length;
  const completedItems = items.filter((item) => item.completed).length;
  const completionPercentage =
    totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const toggleCompleted = (id) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const addItem = () => {
    if (
      newItem.title &&
      newItem.category &&
      newItem.dueDate &&
      newItem.assignedTo
    ) {
      const item = {
        id: Date.now().toString(),
        title: newItem.title,
        description: newItem.description,
        category: newItem.category,
        priority: newItem.priority,
        dueDate: newItem.dueDate,
        completed: false,
        assignedTo: newItem.assignedTo,
      };
      setItems([...items, item]);
      setNewItem({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        dueDate: "",
        assignedTo: "",
      });
      setIsAddingItem(false);
    }
  };

  const deleteItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const categoryStats = categories
    .slice(1)
    .map((category) => {
      const categoryItems = items.filter((item) => item.category === category);
      const completedCategoryItems = categoryItems.filter(
        (item) => item.completed
      );
      return {
        category,
        total: categoryItems.length,
        completed: completedCategoryItems.length,
        percentage:
          categoryItems.length > 0
            ? (completedCategoryItems.length / categoryItems.length) * 100
            : 0,
      };
    })
    .filter((stat) => stat.total > 0);

  const upcomingItems = items
    .filter((item) => !item.completed && new Date(item.dueDate) >= new Date())
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
    .slice(0, 3);

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
            {completedItems} of {totalItems} tasks completed
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
                      <ItineraryPriorityIcon priority={item.priority} />
                    </div>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Due {formatDate(item.dueDate)}</span>
                        <span>•</span>
                        <span>{item.assignedTo}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{item.category}</Badge>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categoryStats.map((stat) => (
              <div key={stat.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{stat.category}</span>
                  <Badge variant="outline">
                    {stat.completed}/{stat.total}
                  </Badge>
                </div>
                <Progress value={stat.percentage} className="w-full h-2" />
              </div>
            ))}
          </div>
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
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                  <DialogDescription>
                    Create a new checklist item
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Task Title</Label>
                    <Input
                      id="title"
                      value={newItem.title}
                      onChange={(e) =>
                        setNewItem({ ...newItem, title: e.target.value })
                      }
                      placeholder="Enter task title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newItem.description}
                      onChange={(e) =>
                        setNewItem({ ...newItem, description: e.target.value })
                      }
                      placeholder="Enter task description"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newItem.category}
                        onValueChange={(value) =>
                          setNewItem({ ...newItem, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.slice(1).map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newItem.priority}
                        onValueChange={(value) =>
                          setNewItem({ ...newItem, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newItem.dueDate}
                        onChange={(e) =>
                          setNewItem({ ...newItem, dueDate: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="assignedTo">Assigned to</Label>
                      <Select
                        value={newItem.assignedTo}
                        onValueChange={(value) =>
                          setNewItem({ ...newItem, assignedTo: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.map((member) => (
                            <SelectItem key={member} value={member}>
                              {member}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingItem(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={addItem}>Add Task</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg transition-colors ${
                  item.completed ? "bg-muted/50" : ""
                } ${
                  isOverdue(item.dueDate, item.completed)
                    ? "border-red-200 bg-red-50"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleCompleted(item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h4
                        className={`font-medium ${
                          item.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {item.title}
                      </h4>
                      {item.description && (
                        <p
                          className={`text-sm mt-1 ${
                            item.completed
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
                          {item.priority}
                        </Badge>
                        <Badge variant="outline">{item.category}</Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.dueDate)}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          • {item.assignedTo}
                        </span>
                        {isOverdue(item.dueDate, item.completed) && (
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
        </CardContent>
      </Card>
    </div>
  );
}
