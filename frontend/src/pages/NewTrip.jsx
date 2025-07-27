import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewTrip() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    const tripData = {
      ...data,
      members: data.members.split(",").map((m) => m.trim()),
    };

    console.log("Trip baru:", tripData);

    // TODO: kirim ke backend nanti
    navigate("/trips");
  };

  return (
    <div className="container py-8 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Buat Trip Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title" className="mb-2">
                Judul
              </Label>
              <Input id="title" {...register("title", { required: true })} />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">Judul wajib diisi</p>
              )}
            </div>

            <div>
              <Label htmlFor="location" className="mb-2">
                Lokasi
              </Label>
              <Input id="location" {...register("location")} />
            </div>

            <div>
              <Label htmlFor="date" className="mb-2">
                Tanggal
              </Label>
              <Input
                id="date"
                type="date"
                {...register("date", { required: true })}
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">Tanggal wajib diisi</p>
              )}
            </div>

            <div>
              <Label htmlFor="members" className="mb-2">
                Peserta (pisahkan dengan koma)
              </Label>
              <Input id="members" {...register("members")} />
            </div>

            <div>
              <Label htmlFor="notes" className="mb-2">
                Catatan
              </Label>
              <Textarea id="notes" {...register("notes")} />
            </div>

            <Button type="submit">Simpan Trip</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
