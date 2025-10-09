import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";

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
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { usePacking } from "@/hooks/usePacking";
import { getErrorMessage, validator } from "@/lib/utils";

const getAssignedLabel = (assigned_to, user) => {
  if (!assigned_to?.user) {
    return "Shared";
  }

  if (assigned_to?.user?.id === user?.id) {
    return `Personal (${TRIP_MEMBER_ROLES[assigned_to.role]})`;
  }

  return `${assigned_to.user.first_name} ${assigned_to.user.last_name} (${
    TRIP_MEMBER_ROLES[assigned_to.role]
  })`;
};

export default function PackingDialog() {
  const { postRequest, getRequest } = useApi();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm();
  const { id: tripId } = useParams();
  const { user } = useAuth();
  const { categories, triggerUpdatePackingItems } = usePacking();
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [assignedToOptions, setAssignedToOptions] = useState([]);

  const onSubmit = (data) => {
    if (data.assigned_to_id === "shared") {
      data.assigned_to_id = null;
    }

    postRequest(`/trips/${tripId}/packing/items/`, data)
      .then(() => {
        triggerUpdatePackingItems();
        setOpen(false);
      })
      .catch((error) =>
        setError(
          getErrorMessage(
            error,
            "An error occurred while creating the trip. Please try again later."
          )
        )
      );
  };

  const fetchAssignedToOptions = () =>
    getRequest(`/trips/${tripId}/members/`).then((response) =>
      setAssignedToOptions([
        // Add "Shared" option
        { id: "shared" },
        ...response.data,
      ])
    );

  useEffect(() => {
    if (open) {
      fetchAssignedToOptions();
      reset();
    }
  }, [open]);

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
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
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
            <Select
              id="category_id"
              onValueChange={(value) =>
                setValue("category_id", value, { shouldValidate: true })
              }
              {...register("category_id", { required: validator.required })}
            >
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
            <Select
              id="assigned_to_id"
              onValueChange={(value) =>
                setValue("assigned_to_id", value, { shouldValidate: true })
              }
              {...register("assigned_to_id", { required: validator.required })}
            >
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
            {errors.assigned_to_id && (
              <p className="text-xs text-destructive">
                {errors.assigned_to_id.message}
              </p>
            )}
          </div>
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
