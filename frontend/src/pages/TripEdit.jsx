import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TripEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Dummy data, will be fetched from backend later
  const dummyData = {
    title: "Trip to Bali",
    location: "Bali",
    date: "2025-08-10",
  };

  const { register, handleSubmit } = useForm({
    defaultValues: dummyData,
  });

  const onSubmit = (data) => {
    console.log("Trip successfully edited:", data);
    navigate(`/trips/${id}`);
  };

  return (
    <div className="container max-w-xl py-8 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Edit Trip</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="title" className="mb-2">
            Title
          </Label>
          <Input id="title" {...register("title")} />
        </div>
        <div>
          <Label htmlFor="location" className="mb-2">
            Location
          </Label>
          <Input id="location" {...register("location")} />
        </div>
        <div>
          <Label htmlFor="date" className="mb-2">
            Date
          </Label>
          <Input type="date" id="date" {...register("date")} />
        </div>
        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
}
