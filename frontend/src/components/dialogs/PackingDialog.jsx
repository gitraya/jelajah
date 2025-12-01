import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TRIP_MEMBER_ROLES } from "@/configs/trip";
import { useAuth } from "@/hooks/useAuth";
import { useMembers } from "@/hooks/useMembers";
import { usePackingItems } from "@/hooks/usePackingItems";
import { useTrip } from "@/hooks/useTrip";
import { validator } from "@/lib/utils";

const getAssignedLabel = (assigned_to, user) => {
  if (!assigned_to?.user) {
    return "Shared";
  }

  if (assigned_to?.user?.id === user?.id) {
    return `You (${TRIP_MEMBER_ROLES[assigned_to.role][1]})`;
  }

  return `${assigned_to.user.first_name} ${assigned_to.user.last_name} (${
    TRIP_MEMBER_ROLES[assigned_to.role][1]
  })`;
};

export default function PackingDialog() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm();
  const { id: tripId } = useParams();
  const { trip } = useTrip();
  const { user } = useAuth();
  const { acceptedMembers } = useMembers();
  const { categories, error, setError, createPacking } = usePackingItems();
  const [open, setOpen] = useState(false);

  const onSubmit = (data) => {
    if (data.assigned_to_id === "shared") {
      data.assigned_to_id = null;
    }

    createPacking(data, tripId).then(() => {
      toast.success("Packing item added successfully");
      setOpen(false);
    });
  };

  useEffect(() => {
    if (open) {
      reset();
      setError("");
    }
  }, [open]);

  const assignedToOptions =
    trip.user_role !== TRIP_MEMBER_ROLES.MEMBER[0]
      ? [{ id: "shared" }, ...acceptedMembers]
      : acceptedMembers.filter((member) => member.user?.id === user?.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              placeholder="Enter item name"
              aria-invalid={errors.name ? "true" : "false"}
              {...register("name", {
                required: validator.required,
                minLength: validator.minLength(2),
                maxLength: validator.maxLength(100),
              })}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category_id">Category</Label>
            <Controller
              name="category_id"
              control={control}
              rules={{ required: validator.required }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    aria-invalid={errors.category_id ? "true" : "false"}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category_id && (
              <p className="text-xs text-destructive">
                {errors.category_id.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="Enter quantity"
              aria-invalid={errors.quantity ? "true" : "false"}
              {...register("quantity", {
                required: validator.required,
                min: { value: 1, message: "Quantity must be at least 1" },
              })}
            />
            {errors.quantity && (
              <p className="text-xs text-destructive">
                {errors.quantity.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="assigned_to_id">Assigned to</Label>
            <Controller
              name="assigned_to_id"
              control={control}
              rules={{ required: validator.required }}
              defaultValue={
                trip.user_role === TRIP_MEMBER_ROLES.MEMBER[0]
                  ? assignedToOptions[0]?.id
                  : ""
              }
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    aria-invalid={errors.assigned_to_id ? "true" : "false"}
                  >
                    <SelectValue placeholder="Select who packs this" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedToOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {getAssignedLabel(option, user)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.assigned_to_id && (
              <p className="text-xs text-destructive">
                {errors.assigned_to_id.message}
              </p>
            )}
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add Item</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
