import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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
import { CreatableSelectInput } from "@/components/ui/select-input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DIFFICULTY_LEVELS } from "@/configs/trip";
import { useApi } from "@/hooks/useApi";
import { useTags } from "@/hooks/useTags";
import { calculateDuration, getErrorMessage, validator } from "@/lib/utils";

export default function TripDialog({ trip, onSuccess, trigger }) {
  const isEditMode = Boolean(trip);
  const navigate = useNavigate();
  const { postRequest, patchRequest } = useApi();
  const { tags: defaultTags } = useTags();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm({
    defaultValues: {
      difficulty: trip?.difficulty || "",
    },
  });
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const onSubmit = async (data) => {
    try {
      data.budget = parseInt(data.budget) || 0;
      data.duration = calculateDuration(data.start_date, data.end_date);
      data.member_spots = parseInt(data.member_spots) || 1;

      if (data.tag_ids) {
        data.new_tag_names = data.tag_ids
          .filter((tag) => !defaultTags.some((t) => t.id === tag.value))
          .map((tag) => tag.label);
        data.new_tag_ids = data.tag_ids
          .filter((tag) => defaultTags.some((t) => t.id === tag.value))
          .map((tag) => tag.value);
      } else {
        data.new_tag_ids = [];
      }

      if (isEditMode) {
        const existingTagIds = trip?.tags?.map((tag) => tag.id) || [];
        const removedTagIds = existingTagIds.filter(
          (id) => !data.new_tag_ids.includes(id)
        );
        if (removedTagIds.length > 0) {
          data.remove_tag_ids = removedTagIds;
        }
      }

      delete data.tag_ids;

      let response = isEditMode
        ? await patchRequest(`/trips/${trip.id}/`, data)
        : await postRequest("/trips/", data);

      if (onSuccess) {
        onSuccess(response.data);
      } else {
        navigate(`/trips/${response.data.id}/manage`);
      }

      if (isEditMode) {
        toast.success(`Trip "${response.data.title}" updated successfully.`);
      } else {
        toast.success(`Trip "${response.data.title}" created successfully.`);
      }

      setOpen(false);
    } catch (error) {
      setError(
        error.status !== 500
          ? getErrorMessage(error)
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

  useEffect(() => {
    if (trip) {
      setValue("difficulty", trip.difficulty);
    }
  }, [trip]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full sm:w-auto mt-4 sm:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Create New Trip
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Trip" : "Create New Trip"}
          </DialogTitle>
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
              defaultValue={trip?.title || ""}
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
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              placeholder="Where are you going?"
              aria-invalid={errors.destination ? "true" : "false"}
              defaultValue={trip?.destination || ""}
              {...register("destination", {
                required: validator.required,
                minLength: validator.minLength(2),
                maxLength: validator.maxLength(255),
              })}
            />
            {errors.destination && (
              <p className="text-xs text-destructive">
                {errors.destination.message}
              </p>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                className="!overflow-hidden"
                aria-invalid={errors.start_date ? "true" : "false"}
                defaultValue={trip?.start_date || ""}
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
                className="!overflow-hidden"
                aria-invalid={errors.end_date ? "true" : "false"}
                defaultValue={trip?.end_date || ""}
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
              defaultValue={trip?.budget || ""}
              {...register("budget", {
                min: { value: 0, message: "Budget cannot be negative" },
                required: validator.required,
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
              defaultValue={trip?.member_spots || ""}
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
              defaultValue={trip?.description || ""}
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
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              id="difficulty"
              defaultValue={trip?.difficulty || ""}
              onValueChange={(value) =>
                setValue("difficulty", value, { shouldValidate: true })
              }
              {...register("difficulty", { required: validator.required })}
            >
              <SelectTrigger
                aria-invalid={errors.difficulty ? "true" : "false"}
              >
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DIFFICULTY_LEVELS).map(
                  ([difficulty, label]) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            {errors.difficulty && (
              <p className="text-xs text-destructive">
                {errors.difficulty.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tag_ids">Tags (comma-separated)</Label>
            <Controller
              control={control}
              name="tag_ids"
              defaultValue={trip?.tags?.map((i) => ({
                value: i.id,
                label: i.name,
              }))}
              render={({ field }) => (
                <CreatableSelectInput
                  id="tag_ids"
                  isMulti
                  options={defaultTags.map((tag) => ({
                    value: tag.id,
                    label: tag.name,
                  }))}
                  placeholder="Select tags or type to create"
                  aria-invalid={errors.tag_ids ? "true" : "false"}
                  value={field.value}
                  onChange={(selectedOptions) =>
                    field.onChange(selectedOptions)
                  }
                />
              )}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Add tags to help others discover your trip
            </p>
            {errors.tag_ids && (
              <p className="text-xs text-destructive">
                {errors.tag_ids.message}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_public"
              defaultChecked={isEditMode ? trip.is_public : true}
              {...register("is_public")}
            />
            <Label htmlFor="is_public">Public</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_joinable"
              defaultChecked={isEditMode ? trip.is_joinable : true}
              {...register("is_joinable")}
            />
            <Label htmlFor="is_joinable">Joinable</Label>
          </div>
          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">
              {isEditMode ? "Update Trip" : "Create Trip"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
