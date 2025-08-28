import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useApi } from "@/hooks/useApi";
import { validator } from "@/lib/utils";

export default function TripEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { putRequest, getRequest } = useApi();
  const [tripData, setTripData] = useState(null);
  const [memberOptions, setMemberOptions] = useState([]);

  useEffect(() => {
    const fetchTrip = async () => {
      const trip = await getRequest(`/trips/${id}`);
      setTripData(trip.data);
    };
    const fetchMembers = async () => {
      const members = await getRequest("/members");
      setMemberOptions(
        members.data.map((member) => ({
          value: member.id,
          label: member.name,
        }))
      );
    };

    fetchTrip();
    fetchMembers();
  }, [id]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    data.members = data.members.map((member) => member.value);
    await putRequest(`/trips/${id}/`, data);

    navigate(`/trips/${id}/my`);
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
              <Input
                id="title"
                defaultValue={tripData?.title}
                aria-invalid={errors.title ? "true" : "false"}
                {...register("title", {
                  required: validator.required,
                  minLength: validator.minLength(2),
                  maxLength: validator.maxLength(100),
                })}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="mb-2">
                Description
              </Label>
              <Textarea
                id="description"
                defaultValue={tripData?.description}
                aria-invalid={errors.description ? "true" : "false"}
                {...register("description", {
                  required: validator.required,
                  minLength: validator.minLength(2),
                })}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="location" className="mb-2">
                Location
              </Label>
              <Input
                id="location"
                defaultValue={tripData?.location}
                aria-invalid={errors.location ? "true" : "false"}
                {...register("location", {
                  required: validator.required,
                  minLength: validator.minLength(2),
                  maxLength: validator.maxLength(200),
                })}
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.location.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="start_date" className="mb-2">
                Start Date
              </Label>
              <Input
                id="start_date"
                type="date"
                defaultValue={tripData?.start_date}
                aria-invalid={errors.start_date ? "true" : "false"}
                {...register("start_date", { required: validator.required })}
              />
              {errors.start_date && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.start_date.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="end_date" className="mb-2">
                End Date
              </Label>
              <Input
                id="end_date"
                type="date"
                defaultValue={tripData?.end_date}
                aria-invalid={errors.end_date ? "true" : "false"}
                {...register("end_date", { required: validator.required })}
              />
              {errors.end_date && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.end_date.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="members" className="mb-2">
                Participants
              </Label>
              <Controller
                name="members"
                control={control}
                defaultValue={
                  tripData?.members?.map((member) => ({
                    value: member.id,
                    label: member.name,
                  })) || []
                }
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
              <Textarea
                id="notes"
                defaultValue={tripData?.notes}
                aria-invalid={errors.notes ? "true" : "false"}
                {...register("notes")}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_public"
                defaultValue={tripData?.is_public}
                {...register("is_public")}
              />
              <Label htmlFor="is_public">Public</Label>
            </div>

            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
