import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Dummy data (nanti diganti fetch backend)
  const trip = {
    id,
    title: "Trip ke Bali",
    location: "Bali, Indonesia",
    date: "2025-08-10",
    members: ["Raka", "Ibnu", "Dina"],
    notes: "Jangan lupa bawa sunblock dan kamera.",
  };

  return (
    <div className="container max-w-xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>{trip.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <strong>Lokasi:</strong> {trip.location}
          </p>
          <p>
            <strong>Tanggal:</strong> {trip.date}
          </p>
          <div>
            <strong>Peserta:</strong>
            <ul className="list-disc list-inside">
              {trip.members.map((member, index) => (
                <li key={index}>{member}</li>
              ))}
            </ul>
          </div>
          {trip.notes && (
            <p>
              <strong>Catatan:</strong> {trip.notes}
            </p>
          )}
          <Button onClick={() => navigate("/trips")} className="mt-4">
            Kembali ke Daftar Trip
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
