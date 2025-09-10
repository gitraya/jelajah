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
      const members = await getRequest("/auth/users");
      setMemberOptions(
        members.data.map((member) => ({
          value: member.id,
          label: `${member.first_name} (${member.email})`,
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

            <hr className="border-gray-300 my-1" />

            <h2 className="font-medium mb-2">Location</h2>

            <div>
              <Label htmlFor="location.name" className="mb-2">
                Name
              </Label>
              <Input
                id="location.name"
                defaultValue={tripData?.location?.name}
                aria-invalid={errors.location?.name ? "true" : "false"}
                {...register("location.name", {
                  required: validator.required,
                  minLength: validator.minLength(2),
                  maxLength: validator.maxLength(255),
                })}
              />
              {errors.location?.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.location.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="location.description" className="mb-2">
                Description
              </Label>
              <Textarea
                id="location.description"
                defaultValue={tripData?.location?.description}
                aria-invalid={errors.location?.description ? "true" : "false"}
                {...register("location.description", {
                  minLength: validator.minLength(2),
                })}
              />
              {errors.location?.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.location.description.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="location.latitude" className="mb-2">
                Latitude
              </Label>
              <Input
                id="location.latitude"
                defaultValue={tripData?.location?.latitude}
                aria-invalid={errors.location?.latitude ? "true" : "false"}
                {...register("location.latitude", {
                  required: validator.required,
                  minLength: validator.minLength(2),
                })}
              />
              {errors.location?.latitude && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.location.latitude.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="location.longitude" className="mb-2">
                Longitude
              </Label>
              <Input
                id="location.longitude"
                defaultValue={tripData?.location?.longitude}
                aria-invalid={errors.location?.longitude ? "true" : "false"}
                {...register("location.longitude", {
                  required: validator.required,
                  minLength: validator.minLength(2),
                })}
              />
              {errors.location?.longitude && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.location.longitude.message}
                </p>
              )}
            </div>

            <hr className="border-gray-300" />

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
                    label: `${member.first_name} (${member.email})`,
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
                checked={tripData?.is_public}
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
