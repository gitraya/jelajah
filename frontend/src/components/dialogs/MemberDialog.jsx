import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { TRIP_MEMBER_ROLES } from "@/configs/trip";
import { useMembers } from "@/hooks/useMembers";
import { validator } from "@/lib/utils";

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

export default function MemberDialog() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm();
  const { createMember, error, setError } = useMembers();
  const [open, setOpen] = useState(false);

  const onSubmit = (data) =>
    createMember(data).then(() => {
      toast("Member added successfully");
      setOpen(false);
    });

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
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Invite a new member to your trip
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              placeholder="Enter first name"
              aria-invalid={errors.first_name ? "true" : "false"}
              {...register("first_name", {
                required: validator.required,
                minLength: 2,
                maxLength: 100,
              })}
            />
            {errors.first_name && (
              <p className="text-xs text-destructive">
                {errors.first_name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              placeholder="Enter last name"
              aria-invalid={errors.last_name ? "true" : "false"}
              {...register("last_name", {
                required: validator.required,
                minLength: 2,
                maxLength: 100,
              })}
            />
            {errors.last_name && (
              <p className="text-xs text-destructive">
                {errors.last_name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              aria-invalid={errors.email ? "true" : "false"}
              {...register("email", {
                required: validator.required,
                pattern: validator.email,
              })}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="Enter phone number"
              aria-invalid={errors.phone ? "true" : "false"}
              {...register("phone", {
                required: validator.required,
                pattern: validator.phone,
              })}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              id="role"
              onValueChange={(value) =>
                setValue("role", value, { shouldValidate: true })
              }
              {...register("role", { required: validator.required })}
            >
              <SelectTrigger aria-invalid={errors.role ? "true" : "false"}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TRIP_MEMBER_ROLES).map(([role, [, label]]) => (
                  <SelectItem key={role} value={role}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">
              Emergency Contact - Name
            </Label>
            <Input
              id="emergency_contact_name"
              placeholder="Name of emergency contact"
              aria-invalid={errors.emergency_contact_name ? "true" : "false"}
              {...register("emergency_contact_name", {
                required: validator.required,
                minLength: 2,
                maxLength: 100,
              })}
            />
            {errors.emergency_contact_name && (
              <p className="text-xs text-destructive">
                {errors.emergency_contact_name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone">
              Emergency Contact - Phone
            </Label>
            <Input
              id="emergency_contact_phone"
              placeholder="Phone number of emergency contact"
              aria-invalid={errors.emergency_contact_phone ? "true" : "false"}
              {...register("emergency_contact_phone", {
                required: validator.required,
                pattern: validator.phone,
              })}
            />
            {errors.emergency_contact_phone && (
              <p className="text-xs text-destructive">
                {errors.emergency_contact_phone.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
            <Textarea
              id="dietary_restrictions"
              placeholder="Any dietary restrictions or allergies"
              rows={2}
              aria-invalid={errors.dietary_restrictions ? "true" : "false"}
              {...register("dietary_restrictions", {
                maxLength: 300,
              })}
            />
            {errors.dietary_restrictions && (
              <p className="text-xs text-destructive">
                {errors.dietary_restrictions.message}
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button type="submit">Add Member</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
