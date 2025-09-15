import { useEffect, useState } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAPIData } from "@/lib/utils";

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      const response = await getAPIData("/trips/?is_public=true");
      setTrips(response.data);
    };

    fetchTrips().finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">All Trips</h1>
        <Button asChild>
          <Link to="/trips/new">+ Create Trip</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <p>Loading...</p>}
        {!loading && trips.length === 0 && <p>No trips found.</p>}
        {trips.map((trip) => (
          <Card key={trip.id}>
            <CardHeader>
              <CardTitle>{trip.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Location: {trip.location.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Date: {trip.start_date}
              </p>
              <p className="text-sm text-muted-foreground">
                Participants:{" "}
                {trip.members.map((m) => m.user.first_name).join(", ") ||
                  "None"}
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
