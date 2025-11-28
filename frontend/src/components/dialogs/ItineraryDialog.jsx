import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useItineraries } from "@/hooks/useItineraries";
import { validator } from "@/lib/utils";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

export default function ItineraryDialog({ triggerClassName }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm();
  const { createItinerary, types, setError, error } = useItineraries();
  const [open, setOpen] = useState(false);

  const onSubmit = (data) => {
    createItinerary(data).then(() => {
      toast.success("Location added successfully");
      setOpen(false);
    });
  };

  useEffect(() => {
    if (open) {
      reset();
      setError("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={triggerClassName}>
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
          <DialogDescription>
            Add a new place to your trip itinerary
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Location Name</Label>
            <Input
              id="name"
              placeholder="Enter location name"
              aria-invalid={errors.name ? "true" : "false"}
              {...register("name", {
                required: validator.required,
                minLength: validator.minLength(3),
                maxLength: validator.maxLength(100),
              })}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Enter address"
              aria-invalid={errors.address ? "true" : "false"}
              {...register("address", {
                required: validator.required,
                minLength: validator.minLength(5),
                maxLength: validator.maxLength(200),
              })}
            />
            {errors.address && (
              <p className="text-xs text-destructive">
                {errors.address.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="type_id">Type</Label>
            <Select
              id="type_id"
              onValueChange={(value) =>
                setValue("type_id", value, { shouldValidate: true })
              }
              {...register("type_id", { required: validator.required })}
            >
              <SelectTrigger aria-invalid={errors.type_id ? "true" : "false"}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {types.slice(1).map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type_id && (
              <p className="text-xs text-destructive">
                {errors.type_id.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe this location"
              rows={3}
              aria-invalid={errors.description ? "true" : "false"}
              {...register("description", {
                required: validator.required,
                minLength: validator.minLength(5),
                maxLength: validator.maxLength(500),
              })}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_time">Estimated Time</Label>
              <Input
                id="estimated_time"
                placeholder="e.g., 2-3 hours"
                aria-invalid={errors.estimated_time ? "true" : "false"}
                {...register("estimated_time", {
                  required: validator.required,
                  minLength: validator.minLength(2),
                  maxLength: validator.maxLength(50),
                })}
              />
              {errors.estimated_time && (
                <p className="text-xs text-destructive">
                  {errors.estimated_time.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="visit_time">Visit Date</Label>
              <Input
                id="visit_time"
                type="datetime-local"
                className="!overflow-hidden"
                aria-invalid={errors.visit_time ? "true" : "false"}
                {...register("visit_time", {
                  required: validator.required,
                })}
              />
              {errors.visit_time && (
                <p className="text-xs text-destructive">
                  {errors.visit_time.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any special notes or tips"
              rows={2}
              aria-invalid={errors.notes ? "true" : "false"}
              {...register("notes", {
                maxLength: validator.maxLength(300),
              })}
            />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes.message}</p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button type="submit">Add Location</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
