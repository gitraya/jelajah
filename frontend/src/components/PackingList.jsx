import { CheckCircle, Circle, Package, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import { TRIP_MEMBER_ROLES } from "@/configs/trip";
import { useAuth } from "@/hooks/useAuth";
import { usePackingItems } from "@/hooks/usePackingItems";
import { useTrip } from "@/hooks/useTrip";
import { getPackingCategoryColor } from "@/lib/colors";

import PackingDialog from "./dialogs/PackingDialog";

const getAssignedName = (assigned_to, user) => {
  if (assigned_to?.user?.id === user?.id) {
    return "Personal";
  }

  return assigned_to?.user?.first_name || "Shared";
};

const getIsEditable = (packing, user, userRole) => {
  return (
    userRole !== TRIP_MEMBER_ROLES.MEMBER[0] ||
    packing.assigned_to?.user?.id === user?.id
  );
};

export function PackingList() {
  const { user } = useAuth();
  const { trip } = useTrip();
  const {
    categories,
    packingItems,
    statistics,
    isLoading,
    togglePacking,
    deletePacking,
    setSelectedCategory,
    selectedCategory,
  } = usePackingItems();

  if (isLoading) {
    return <div className="space-y-6">Loading...</div>;
  }

  const { total_items, packed_items, category_stats } = statistics;

  const packedPercentage =
    total_items > 0 ? (packed_items / total_items) * 100 : 0;

  const handleDeletePacking = (packingId) => {
    deletePacking(packingId);
    toast.success("Packing item deleted successfully");
  };

  const handleTogglePacking = (packingId) => {
    togglePacking(packingId);
    toast.success("Packing item updated successfully");
  };

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
          {category_stats?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category_stats.map((stat) => (
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
        <CardHeader className="flex flex-row items-center justify-between flex-wrap">
          <div>
            <CardTitle>Packing List</CardTitle>
            <CardDescription>
              Keep track of what to pack for your trip
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
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
          {packingItems?.length > 0 ? (
            <div className="space-y-2">
              {packingItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-wrap gap-3 sm:gap-0 items-center justify-between p-3 border rounded-lg transition-colors ${
                    item.packed ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center space-x-3">
                    <Checkbox
                      checked={item.packed}
                      disabled={
                        getIsEditable(item, user, trip.user_role) ? false : true
                      }
                      onCheckedChange={() => handleTogglePacking(item.id)}
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
                  <div className="ml-auto sm:ml-0 flex flex-wrap items-center gap-2">
                    <Badge
                      className={getPackingCategoryColor(item.category.name)}
                    >
                      {item.category.name}
                    </Badge>
                    <Badge variant="outline">
                      {getAssignedName(item.assigned_to, user)}
                    </Badge>
                    {trip.user_role !== TRIP_MEMBER_ROLES.MEMBER[0] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePacking(item.id)}
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
                ? "No items in the packing list. Start by adding some!"
                : "No items in this category. Try selecting a different category or add new items."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
