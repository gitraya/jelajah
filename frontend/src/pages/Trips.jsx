import { useEffect, useState } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAPIData } from "@/lib/utils";

export default function Trips() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    getAPIData("trips")
      .then((data) => setTrips(data))
      .catch((error) => {
        console.error("Failed to fetch trips:", error);
      });
  }, []);

  return (
    <div className="container py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My Trips</h1>
        <Button asChild>
          <Link to="/trips/new">+ Create Trip</Link>
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
                Location: {trip.location}
              </p>
              <p className="text-sm text-muted-foreground">
                Date: {trip.start_date}
              </p>
              <p className="text-sm text-muted-foreground">
                Participants: {trip.members.join(", ")}
              </p>
              <Button variant="link" asChild className="mt-2 p-0 text-blue-800">
                <Link to={`/trips/${trip.id}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
