import { CheckCircle, Circle, Package, Plus, Trash2 } from "lucide-react";
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
import { getPackingCategoryColor } from "@/lib/colors";

export function PackingList() {
  const [items, setItems] = useState([
    {
      id: "1",
      name: "Passport",
      category: "Documents",
      quantity: 1,
      packed: true,
      assignedTo: "Personal",
    },
    {
      id: "2",
      name: "Sunscreen SPF 50",
      category: "Toiletries",
      quantity: 2,
      packed: true,
      assignedTo: "Shared",
    },
    {
      id: "3",
      name: "Beach towels",
      category: "Beach gear",
      quantity: 6,
      packed: false,
      assignedTo: "Shared",
    },
    {
      id: "4",
      name: "Swimwear",
      category: "Clothing",
      quantity: 2,
      packed: false,
      assignedTo: "Personal",
    },
    {
      id: "5",
      name: "Camera",
      category: "Electronics",
      quantity: 1,
      packed: true,
      assignedTo: "John",
    },
    {
      id: "6",
      name: "First aid kit",
      category: "Medical",
      quantity: 1,
      packed: false,
      assignedTo: "Sarah",
    },
    {
      id: "7",
      name: "Hiking shoes",
      category: "Clothing",
      quantity: 1,
      packed: false,
      assignedTo: "Personal",
    },
    {
      id: "8",
      name: "Phone chargers",
      category: "Electronics",
      quantity: 6,
      packed: true,
      assignedTo: "Personal",
    },
  ]);

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    quantity: "1",
    assignedTo: "",
  });

  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Documents",
    "Clothing",
    "Toiletries",
    "Electronics",
    "Beach gear",
    "Medical",
    "Other",
  ];
  const assignedToOptions = [
    "Personal",
    "Shared",
    "John",
    "Sarah",
    "Mike",
    "Lisa",
    "Tom",
    "Anna",
  ];

  const totalItems = items.length;
  const packedItems = items.filter((item) => item.packed).length;
  const packedPercentage =
    totalItems > 0 ? (packedItems / totalItems) * 100 : 0;

  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const togglePacked = (id) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    );
  };

  const addItem = () => {
    if (
      newItem.name &&
      newItem.category &&
      newItem.quantity &&
      newItem.assignedTo
    ) {
      const item = {
        id: Date.now().toString(),
        name: newItem.name,
        category: newItem.category,
        quantity: parseInt(newItem.quantity),
        packed: false,
        assignedTo: newItem.assignedTo,
      };
      setItems([...items, item]);
      setNewItem({
        name: "",
        category: "",
        quantity: "1",
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
      const packedCategoryItems = categoryItems.filter((item) => item.packed);
      return {
        category,
        total: categoryItems.length,
        packed: packedCategoryItems.length,
        percentage:
          categoryItems.length > 0
            ? (packedCategoryItems.length / categoryItems.length) * 100
            : 0,
      };
    })
    .filter((stat) => stat.total > 0);

  return (
    <div className="space-y-6">
      {/* Packing Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Packing Progress
          </CardTitle>
          <CardDescription>
            {packedItems} of {totalItems} items packed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Packed</span>
              <span>{Math.round(packedPercentage)}%</span>
            </div>
            <Progress value={packedPercentage} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Category Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progress by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryStats.map((stat) => (
              <div key={stat.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{stat.category}</span>
                  <Badge
                    variant="outline"
                    className={getPackingCategoryColor(stat.category)}
                  >
                    {stat.packed}/{stat.total}
                  </Badge>
                </div>
                <Progress value={stat.percentage} className="w-full h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Packing List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Packing List</CardTitle>
            <CardDescription>
              Keep track of what to pack for your trip
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
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Packing Item</DialogTitle>
                  <DialogDescription>
                    Add a new item to your packing list
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      value={newItem.name}
                      onChange={(e) =>
                        setNewItem({ ...newItem, name: e.target.value })
                      }
                      placeholder="Enter item name"
                    />
                  </div>
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
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) =>
                        setNewItem({ ...newItem, quantity: e.target.value })
                      }
                      placeholder="Enter quantity"
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
                        <SelectValue placeholder="Select who packs this" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignedToOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingItem(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={addItem}>Add Item</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  item.packed ? "bg-muted/50" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={item.packed}
                    onCheckedChange={() => togglePacked(item.id)}
                  />
                  <div className="flex items-center gap-2">
                    {item.packed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span
                      className={`${
                        item.packed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.quantity > 1 && (
                      <Badge variant="outline" className="text-xs">
                        {item.quantity}x
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPackingCategoryColor(item.category)}>
                    {item.category}
                  </Badge>
                  <Badge variant="outline">{item.assignedTo}</Badge>
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
