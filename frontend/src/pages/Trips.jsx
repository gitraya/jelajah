import { useEffect, useState } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Trips() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    // Simulasi fetch trip dari server
    const dummyTrips = [
      {
        id: 1,
        title: "Trip ke Bali",
        location: "Bali",
        date: "2025-08-10",
        members: ["Kamu", "Ibnu", "Alya"],
      },
      {
        id: 2,
        title: "Pendakian Semeru",
        location: "Lumajang, Jatim",
        date: "2025-09-15",
        members: ["Kamu ", "Moerdowo"],
      },
    ];

    setTrips(dummyTrips);
  }, []);

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Trip Saya</h1>
        <Button asChild>
          <Link to="/trips/new">+ Buat Trip</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trips.map((trip) => (
          <Card key={trip.id}>
            <CardHeader>
              <CardTitle>{trip.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Lokasi: {trip.location}
              </p>
              <p className="text-sm text-muted-foreground">
                Tanggal: {trip.date}
              </p>
              <p className="text-sm text-muted-foreground">
                Peserta: {trip.members.join(", ")}
              </p>
              <Button variant="link" asChild className="mt-2 p-0">
                <Link to={`/trips/${trip.id}`}>Lihat Detail</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
