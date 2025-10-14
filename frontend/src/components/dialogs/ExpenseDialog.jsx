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
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";
import { useTrips } from "@/hooks/useTrips";
import { getErrorMessage, validator } from "@/lib/utils";

const getPaidByLabel = (paid_by) => {
  return `${paid_by.user.first_name} ${paid_by.user.last_name}`;
};

export default function ExpenseDialog() {
  const { postRequest } = useApi();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm();
  const { id: tripId } = useParams();
  const { user } = useAuth();
  const { members } = useTrips();
  const { categories, triggerUpdateExpenses } = useExpenses();
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const onSubmit = (data) => {
    postRequest(`/trips/${tripId}/expenses/items/`, data)
      .then(() => {
        triggerUpdateExpenses();
        setOpen(false);
      })
      .catch((error) =>
        setError(
          getErrorMessage(
            error,
            "An error occurred while creating the expense. Please try again later."
          )
        )
      );
  };

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Record a new expense for the trip
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
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
            <Label htmlFor="title">Description</Label>
            <Input
              id="title"
              placeholder="Enter expense description"
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
            <Label htmlFor="amount">Amount (IDR)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              aria-invalid={errors.amount ? "true" : "false"}
              {...register("amount", {
                required: validator.required,
                min: { value: 10000, message: "Amount must be at least 10000" },
              })}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="paid_by_id">Paid by</Label>
            <Select
              id="paid_by_id"
              onValueChange={(value) =>
                setValue("paid_by_id", value, { shouldValidate: true })
              }
              {...register("paid_by_id", { required: validator.required })}
            >
              <SelectTrigger
                aria-invalid={errors.paid_by_id ? "true" : "false"}
              >
                <SelectValue placeholder="Select who paid this" />
              </SelectTrigger>
              <SelectContent>
                {members.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {getPaidByLabel(option, user)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paid_by_id && (
              <p className="text-xs text-destructive">
                {errors.paid_by_id.message}
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add Expense</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
