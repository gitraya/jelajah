import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { EXPENSE_SPLIT_TYPES } from "@/configs/expense";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";
import { useMembers } from "@/hooks/useMembers";
import { validator } from "@/lib/utils";

import { SelectInput } from "../ui/select-input";

const getPaidByLabel = (paid_by) => {
  return `${paid_by.user.first_name} ${paid_by.user.last_name}`;
};

const getSplits = (data) => {
  const splitBetween = data.split_between || [];
  const totalAmount = parseFloat(data.amount) || 0;

  if (data.split_type === "EQUAL") {
    const equalAmount = totalAmount / splitBetween.length;
    return splitBetween.map((member) => ({
      member_id: member.value,
      amount: equalAmount,
      paid: member.value === data.paid_by_id,
    }));
  } else if (data.split_type === "PERCENTAGE") {
    return splitBetween.map((member) => {
      const percentage = parseFloat(data[`percentage_${member.value}`]) || 0;
      const amount = (percentage / 100) * totalAmount;
      return {
        member_id: member.value,
        amount,
        paid: member.value === data.paid_by_id,
      };
    });
  } else {
    return splitBetween.map((member) => {
      const amount = parseFloat(data[`amount_${member.value}`]) || 0;
      return {
        member_id: member.value,
        amount,
        paid: member.value === data.paid_by_id,
      };
    });
  }
};

export default function ExpenseDialog() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    control,
    getValues,
    watch,
  } = useForm();
  const { user } = useAuth();
  const { members } = useMembers();
  const { categories, createExpense, error, setError } = useExpenses();
  const [open, setOpen] = useState(false);

  const onSubmit = (data) => {
    if (data.date === "") {
      delete data.date;
    }

    data.splits = getSplits(data);

    createExpense(data).then(() => {
      toast("Expense added successfully");
      setOpen(false);
    });
  };

  const setAmountsForSplitBetween = () => {
    const splitBetween = getValues("split_between") || [];
    if (!splitBetween?.length) return;

    const splitType = getValues("split_type");
    const totalAmount = parseFloat(getValues("amount")) || 0;
    if (splitType === "EQUAL") {
      const equalAmount = totalAmount / splitBetween.length;
      splitBetween.forEach((member) => {
        setValue(`amount_${member.value}`, equalAmount, {
          shouldValidate: true,
        });
      });
    }

    if (splitType === "PERCENTAGE") {
      splitBetween.forEach((member) => setValue(`amount_${member.value}`, ""));
    } else {
      splitBetween.forEach((member) =>
        setValue(`percentage_${member.value}`, "")
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
    setAmountsForSplitBetween();
  }, [watch("split_between"), watch("split_type"), watch("amount")]);

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
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              className="mb-0"
              aria-invalid={errors.date ? "true" : "false"}
              {...register("date")}
            />
            <small className="mb-2 block text-gray-600">
              Leave empty to use today's date
            </small>
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="paid_by_id">Paid by</Label>
            <Select
              id="paid_by_id"
              onValueChange={(value) => {
                const oldSplitBetween = getValues("split_between");
                const newSplitBetween = oldSplitBetween || [];
                if (!newSplitBetween?.some((o) => o.value === value)) {
                  newSplitBetween.push({
                    value,
                    label: getPaidByLabel(members.find((m) => m.id === value)),
                  });
                }
                setValue("paid_by_id", value, { shouldValidate: true });
                setValue("split_between", newSplitBetween, {
                  shouldValidate: true,
                });
              }}
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
          <div className="space-y-2">
            <h3 className="font-medium">Split Between</h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="split_type">Split Type</Label>
            <Select
              id="split_type"
              onValueChange={(value) =>
                setValue("split_type", value, { shouldValidate: true })
              }
              {...register("split_type", { required: validator.required })}
            >
              <SelectTrigger
                aria-invalid={errors.split_type ? "true" : "false"}
              >
                <SelectValue placeholder="Select split type" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_SPLIT_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.split_type && (
              <p className="text-xs text-destructive">
                {errors.split_type.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="split_between">Split Between</Label>
            <Controller
              control={control}
              name="split_between"
              rules={{ required: validator.required }}
              render={({ field }) => (
                <SelectInput
                  id="split_between"
                  isMulti
                  options={members.map((member) => ({
                    value: member.id,
                    label: getPaidByLabel(member),
                  }))}
                  placeholder="Select members to split with"
                  aria-invalid={errors.split_between ? "true" : "false"}
                  value={field.value}
                  onChange={(selectedOptions) =>
                    field.onChange(selectedOptions)
                  }
                />
              )}
            />
            {errors.split_between && (
              <p className="text-xs text-destructive">
                {errors.split_between.message}
              </p>
            )}
          </div>
          {watch("split_between")?.map((member) => {
            const amountId = `amount_${member.value}`;
            const percentageId = `percentage_${member.value}`;
            const htmlFor =
              watch("split_type") === "PERCENTAGE" ? percentageId : amountId;
            return (
              <div className="grid grid-cols-2 gap-4" key={member.value}>
                <Label htmlFor={htmlFor}>{member.label} :</Label>
                {watch("split_type") === "PERCENTAGE" ? (
                  <Input
                    id={percentageId}
                    type="number"
                    placeholder="Enter percentage"
                    aria-invalid={errors[percentageId] ? "true" : "false"}
                    {...register(percentageId, {
                      required: validator.required,
                      min: {
                        value: 1,
                        message: "Percentage must be at least 1",
                      },
                      max: {
                        value: 100,
                        message: "Percentage cannot exceed 100",
                      },
                    })}
                  />
                ) : (
                  <Input
                    id={amountId}
                    type="number"
                    placeholder="Enter amount"
                    disabled={watch("split_type") === "EQUAL"}
                    aria-invalid={errors[amountId] ? "true" : "false"}
                    {...register(amountId, { required: validator.required })}
                  />
                )}
                {errors[htmlFor] && (
                  <p className="text-xs text-destructive">
                    {errors[htmlFor].message}
                  </p>
                )}
              </div>
            );
          })}

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
