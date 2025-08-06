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

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Dummy data (will be replaced with backend fetch)
  const trip = {
    id,
    title: "Trip to Bali",
    location: "Bali, Indonesia",
    date: "2025-08-10",
    members: ["Raka", "Ibnu", "Dina"],
    notes: "Don't forget to bring sunblock and camera.",
  };

  const handleDelete = () => {
    // delete trip logic (dummy for now)
    console.log("Delete trip id:", id);
    navigate("/trips");
  };

  return (
    <div className="container max-w-xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>{trip.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <strong>Location:</strong> {trip.location}
          </p>
          <p>
            <strong>Date:</strong> {trip.date}
          </p>
          <div>
            <strong>Participants:</strong>
            <ul className="list-disc list-inside">
              {trip.members.map((member, index) => (
                <li key={index}>{member}</li>
              ))}
            </ul>
          </div>
          {trip.notes && (
            <p>
              <strong>Notes:</strong> {trip.notes}
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
