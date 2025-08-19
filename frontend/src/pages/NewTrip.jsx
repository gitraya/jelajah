import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import { postAPIData } from "@/lib/utils";

export default function NewTrip() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm();

  const onSubmit = async (data) => {
    delete data.members;
    delete data.notes;

    data.owner = 2; // Hardcoded owner ID for now
    await postAPIData("/trips/", data);

    console.log("New Trip:", data);

    // TODO: send to backend later
    navigate("/trips");
  };

  const memberOptions = [
    { value: "1", label: "Alice" },
    { value: "2", label: "Bob" },
    { value: "3", label: "Charlie" },
    { value: "4", label: "Diana" },
  ];

  return (
    <div className="container py-8 px-4 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Trip</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title" className="mb-2">
                Title
              </Label>
              <Input id="title" {...register("title", { required: true })} />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">Title is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="location" className="mb-2">
                Location
              </Label>
              <Input id="location" {...register("location")} />
            </div>

            <div>
              <Label htmlFor="start_date" className="mb-2">
                Start Date
              </Label>
              <Input
                id="start_date"
                type="date"
                {...register("start_date", { required: true })}
              />
              {errors.start_date && (
                <p className="text-red-500 text-sm mt-1">Date is required</p>
              )}
            </div>
            <div>
              <Label htmlFor="end_date" className="mb-2">
                End Date
              </Label>
              <Input
                id="end_date"
                type="date"
                {...register("end_date", { required: true })}
              />
              {errors.end_date && (
                <p className="text-red-500 text-sm mt-1">Date is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="members" className="mb-2">
                Participants
              </Label>
              <Controller
                name="members"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <MultiSelect
                    options={memberOptions}
                    placeholder="Select participants"
                    selected={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            <div>
              <Label htmlFor="notes" className="mb-2">
                Notes
              </Label>
              <Textarea id="notes" {...register("notes")} />
            </div>

            <Button type="submit">Save Trip</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
