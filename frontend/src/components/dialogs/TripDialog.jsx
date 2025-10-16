import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useApi } from "@/hooks/useApi";
import { calculateDuration, validator } from "@/lib/utils";

export default function TripDialog() {
  const navigate = useNavigate();
  const { postRequest } = useApi();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const onSubmit = async (data) => {
    try {
      data.budget = parseInt(data.budget) || 0;
      data.duration = calculateDuration(data.start_date, data.end_date);
      data.member_spots = parseInt(data.member_spots) || 1;
      const response = await postRequest("/trips/", data);

      navigate(`/trips/${response.data.id}/manage`);
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

  useEffect(() => {
    if (open) {
      reset();
      setError("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto mt-4 sm:mt-0">
          <Plus className="w-4 h-4 mr-2" />
          Create New Trip
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
          <DialogDescription>
            Start planning your next adventure
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter trip title"
              aria-invalid={errors.title ? "true" : "false"}
              {...register("title", {
                required: validator.required,
                minLength: validator.minLength(2),
                maxLength: validator.maxLength(100),
              })}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="location.name">Destination</Label>
            <Input
              id="location.name"
              placeholder="Where are you going?"
              aria-invalid={errors.location?.name ? "true" : "false"}
              {...register("location.name", {
                required: validator.required,
                minLength: validator.minLength(2),
                maxLength: validator.maxLength(255),
              })}
            />
            {errors.location?.name && (
              <p className="text-xs text-destructive">
                {errors.location.name.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                aria-invalid={errors.start_date ? "true" : "false"}
                {...register("start_date", { required: validator.required })}
              />
              {errors.start_date && (
                <p className="text-xs text-destructive">
                  {errors.start_date.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                aria-invalid={errors.end_date ? "true" : "false"}
                {...register("end_date", { required: validator.required })}
              />
              {errors.end_date && (
                <p className="text-xs text-destructive">
                  {errors.end_date.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Total Budget (IDR)</Label>
            <Input
              id="budget"
              type="number"
              placeholder="Enter budget amount"
              aria-invalid={errors.budget ? "true" : "false"}
              {...register("budget", {
                min: { value: 0, message: "Budget cannot be negative" },
              })}
            />
            {errors.budget && (
              <p className="text-xs text-destructive">
                {errors.budget.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="member_spots">Member Spots</Label>
            <Input
              id="member_spots"
              type="number"
              placeholder="Enter number of member spots"
              aria-invalid={errors.member_spots ? "true" : "false"}
              {...register("member_spots", {
                min: {
                  value: 1,
                  message: "At least 1 member spot is required",
                },
              })}
            />
            {errors.member_spots && (
              <p className="text-xs text-destructive">
                {errors.member_spots.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your trip"
              rows={3}
              aria-invalid={errors.description ? "true" : "false"}
              {...register("description", {
                required: validator.required,
                minLength: validator.minLength(2),
              })}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="is_public" {...register("is_public")} />
            <Label htmlFor="is_public">Public</Label>
          </div>
          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Create Trip</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
