import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { InviteMemberDialog } from "@/components/InviteMemberDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/useApi";

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRequest, putRequest } = useApi();
  const [tripData, setTripData] = useState(null);

  useEffect(() => {
    const fetchTrip = async () => {
      const trip = await getRequest(`/trips/${id}`);
      setTripData(trip.data);
    };

    fetchTrip();
  }, [id]);

  const handleDelete = async () => {
    await putRequest(`/trips/${id}`, { status: "DELETED" });
    navigate("/trips");
  };

  return (
    <div className="container max-w-xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>{tripData?.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <strong>Location:</strong> {tripData?.location}
          </p>
          <p>
            <strong>Date:</strong> {tripData?.start_date}
          </p>
          <div>
            <strong>Participants:</strong>
            <ul className="list-disc list-inside">
              {tripData?.members.map((member, index) => (
                <li key={index}>{member}</li>
              ))}
            </ul>
          </div>
          {tripData?.notes && (
            <p>
              <strong>Notes:</strong> {tripData.notes}
            </p>
          )}

          <div className="flex gap-4 pt-6">
            <Button onClick={() => navigate(`/trips/${id}/edit`)}>Edit</Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to delete this trip?
                  </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Yes, Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <InviteMemberDialog
            onInvite={(email) => {
              console.log("Invite", email);
              // later update backend or save in trip.members
            }}
          />

          <Button onClick={() => navigate("/trips")} className="mt-4 ml-4">
            Back to Trip List
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
