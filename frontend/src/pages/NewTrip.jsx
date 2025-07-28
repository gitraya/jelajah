import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { postAPIData } from "@/lib/utils";

export default function NewTrip() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    delete data.members;
    delete data.notes;

    data.owner = 2; // Hardcoded owner ID for now
    await postAPIData("trips/", data);

    console.log("Trip baru:", data);

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
              <Label htmlFor="start_date" className="mb-2">
                Tanggal Mulai
              </Label>
              <Input
                id="start_date"
                type="date"
                {...register("start_date", { required: true })}
              />
              {errors.start_date && (
                <p className="text-red-500 text-sm mt-1">Tanggal wajib diisi</p>
              )}
            </div>
            <div>
              <Label htmlFor="end_date" className="mb-2">
                Tanggal Selesai
              </Label>
              <Input
                id="end_date"
                type="date"
                {...register("end_date", { required: true })}
              />
              {errors.end_date && (
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
