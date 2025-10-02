import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

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
import { useApi } from "@/hooks/useApi";
import { usePacking } from "@/hooks/usePacking";
import { validator } from "@/lib/utils";

export default function PackingDialog() {
  const { postRequest } = useApi();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const { categories, triggerUpdatePackingItems } = usePacking();
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const onSubmit = async (data) => {
    try {
      data.assigned_to = "f6bef501-37bb-401f-ad78-ff5954c76741";

      await postRequest(
        "/trips/ec5813bd-2a95-4d2f-8f30-ac40c57bd1b0/packing/items/",
        data
      );

      triggerUpdatePackingItems();
      setOpen(false);
    } catch (error) {
      setError(
        error.status !== 500
          ? error?.response?.data?.[
              Object.keys(error?.response?.data)?.[0]
            ]?.[0]
          : "An error occurred while creating the trip. Please try again later."
      );
    }
  };

  const assignedToOptions = [
    {
      id: "a123e4567-e89b-12d3-a456-426614174000",
      first_name: "Personal",
      last_name: "",
    },
    {
      id: "a123e4567-e89b-12d3-a456-426614174001",
      first_name: "Shared",
      last_name: "",
    },
  ];

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
            <Label htmlFor="category">Category</Label>
            <Select
              id="category"
              aria-invalid={errors.category ? "true" : "false"}
              onValueChange={(value) =>
                setValue("category", value, { shouldValidate: true })
              }
              {...register("category", { required: validator.required })}
            >
              <SelectTrigger>
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
            {errors.category && (
              <p className="text-xs text-destructive">
                {errors.category.message}
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
            <Label htmlFor="assigned_to">Assigned to</Label>
            <Select
              id="assigned_to"
              aria-invalid={errors.assigned_to ? "true" : "false"}
              onValueChange={(value) =>
                setValue("assigned_to", value, { shouldValidate: true })
              }
              {...register("assigned_to", { required: validator.required })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select who packs this" />
              </SelectTrigger>
              <SelectContent>
                {assignedToOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.first_name} {option.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assigned_to && (
              <p className="text-xs text-destructive">
                {errors.assigned_to.message}
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
