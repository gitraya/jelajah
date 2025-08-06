import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TripEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Dummy data, will be fetched from backend later
  const dummyData = {
    title: "Trip to Bali",
    location: "Bali",
    date: "2025-08-10",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: dummyData,
  });

  const onSubmit = (data) => {
    console.log("Trip successfully edited:", data);
    navigate(`/trips/${id}`);
  };

  return (
    <div className="container max-w-xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Trip</CardTitle>
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
              <Label htmlFor="notes" className="mb-2">
                Notes
              </Label>
              <Textarea id="notes" {...register("notes")} />
            </div>

            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
