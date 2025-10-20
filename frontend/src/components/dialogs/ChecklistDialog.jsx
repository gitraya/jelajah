import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";

import { CHECKLIST_CATEGORIES, CHECKLIST_PRIORITY } from "@/configs/checklist";
import { useApi } from "@/hooks/useApi";
import { useChecklist } from "@/hooks/useChecklist";
import { useTrips } from "@/hooks/useTrips";
import { getErrorMessage, validator } from "@/lib/utils";

import { Alert, AlertDescription } from "../ui/alert";
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

const getAssignedToLabel = (member) => {
  return `${member.user.first_name} ${member.user.last_name}`;
};

export default function ChecklistDialog() {
  const { postRequest } = useApi();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm();
  const { id: tripId } = useParams();
  const { members } = useTrips();
  const { triggerUpdateChecklist } = useChecklist();
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const onSubmit = (data) => {
    postRequest(`/trips/${tripId}/checklist/items/`, data)
      .then(() => {
        triggerUpdateChecklist();
        setOpen(false);
      })
      .catch((error) =>
        setError(
          getErrorMessage(
            error,
            "An error occurred while creating the checklist item. Please try again later."
          )
        )
      );
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
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>Create a new checklist item</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="Enter task title"
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              aria-invalid={errors.description ? "true" : "false"}
              rows={3}
              {...register("description", {
                required: validator.required,
                minLength: validator.minLength(2),
                maxLength: validator.maxLength(500),
              })}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                onValueChange={(value) =>
                  setValue("category", value, { shouldValidate: true })
                }
                {...register("category", { required: validator.required })}
              >
                <SelectTrigger
                  aria-invalid={errors.category ? "true" : "false"}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CHECKLIST_CATEGORIES).map(
                    ([category, label]) => (
                      <SelectItem key={category} value={category}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                id="priority"
                onValueChange={(value) =>
                  setValue("priority", value, { shouldValidate: true })
                }
                {...register("priority", { required: validator.required })}
              >
                <SelectTrigger
                  aria-invalid={errors.priority ? "true" : "false"}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CHECKLIST_PRIORITY).map(
                    ([priority, label]) => (
                      <SelectItem key={priority} value={priority}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-xs text-destructive">
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                aria-invalid={errors.due_date ? "true" : "false"}
                {...register("due_date", { required: validator.required })}
              />
              {errors.due_date && (
                <p className="text-xs text-destructive">
                  {errors.due_date.message}
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
                {...register("assigned_to_id", {
                  required: validator.required,
                })}
              >
                <SelectTrigger
                  aria-invalid={errors.assigned_to_id ? "true" : "false"}
                >
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {getAssignedToLabel(option)}
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
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button type="submit">Add Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
