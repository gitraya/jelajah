import { CheckCircle, Circle, Package, Trash2 } from "lucide-react";
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
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { usePacking } from "@/hooks/usePacking";
import { getPackingCategoryColor } from "@/lib/colors";

import PackingDialog from "./dialogs/PackingDialog";

const getAssignedName = (assigned_to, user) => {
  if (assigned_to?.user?.id === user?.id) {
    return "Personal";
  }

  return assigned_to?.user?.first_name || "Shared";
};

export function PackingList() {
  const { id: tripId } = useParams();
  const { categories, updatePackingItems } = usePacking();
  const { getRequest, patchRequest, deleteRequest } = useApi();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [
    { total_items, packed_items, categories: categoryStats },
    setStatistics,
  ] = useState({});

  useEffect(() => {
    setIsLoading(true);
    getRequest(
      `/trips/${tripId}/packing/items${
        selectedCategory !== "all" ? `?category_id=${selectedCategory}` : ""
      }`
    )
      .then((response) => setItems(response.data))
      .finally(() => setIsLoading(false));
  }, [updatePackingItems, selectedCategory]);

  useEffect(() => {
    getRequest(`/trips/${tripId}/packing/statistics/`).then((response) =>
      setStatistics(response.data)
    );
  }, [updatePackingItems]);

  const packedPercentage =
    total_items > 0 ? (packed_items / total_items) * 100 : 0;

  const togglePacked = (id) => {
    const toggledItem = items.find((item) => item.id === id);
    const packed = !toggledItem.packed;
    setItems(
      items.map((item) => (item.id === id ? { ...item, packed } : item))
    );
    setStatistics((prev) => ({
      ...prev,
      packed_items: packed ? prev.packed_items + 1 : prev.packed_items - 1,
      categories: prev.categories.map((cat) => {
        if (cat.category?.id === toggledItem.category.id) {
          return {
            ...cat,
            packed: packed ? cat.packed + 1 : cat.packed - 1,
          };
        }
        return cat;
      }),
    }));
    patchRequest(`/trips/${tripId}/packing/items/${id}/`, { packed });
  };

  const deleteItem = (id) => {
    const deletedItem = items.find((item) => item.id === id);
    setItems(items.filter((item) => item.id !== id));
    setStatistics((prev) => ({
      ...prev,
      total_items: prev.total_items - 1,
      packed_items: deletedItem.packed
        ? prev.packed_items - 1
        : prev.packed_items,
      categories: prev.categories
        .map((cat) => {
          if (cat.category.id === deletedItem.category.id) {
            return {
              ...cat,
              total: cat.total - 1,
              packed: deletedItem.packed ? cat.packed - 1 : cat.packed,
            };
          }
          return cat;
        })
        .filter((cat) => cat.total > 0),
    }));
    deleteRequest(`/trips/${tripId}/packing/items/${id}/`);
  };

  if (isLoading) {
    return <div className="space-y-6">Loading...</div>;
  }

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
            {packed_items} of {total_items} items packed
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
          {categoryStats?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryStats.map((stat) => (
                <div key={stat.category?.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{stat.category?.name}</span>
                    <Badge
                      variant="outline"
                      className={getPackingCategoryColor(stat.category?.name)}
                    >
                      {stat.packed}/{stat.total}
                    </Badge>
                  </div>
                  <Progress
                    value={(stat.packed / stat.total) * 100 || 0}
                    className="w-full h-2"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No category statistics available
            </div>
          )}
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
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <PackingDialog />
          </div>
        </CardHeader>
        <CardContent>
          {items?.length > 0 ? (
            <div className="space-y-2">
              {items.map((item) => (
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
                          item.packed
                            ? "line-through text-muted-foreground"
                            : ""
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
                    <Badge
                      className={getPackingCategoryColor(item.category.name)}
                    >
                      {item.category.name}
                    </Badge>
                    <Badge variant="outline">
                      {getAssignedName(item.assigned_to, user)}
                    </Badge>
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
                ? "No items in the packing list. Start by adding some!"
                : "No items in this category. Try selecting a different category or add new items."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
