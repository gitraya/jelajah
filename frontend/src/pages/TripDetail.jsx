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
import { cn } from "@/lib/utils";

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRequest, putRequest } = useApi();
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      const trip = await getRequest(`/trips/${id}`);
      setTripData(trip.data);
      setLoading(false);
    };

    fetchTrip();
  }, [id]);

  const handleDelete = async () => {
    await putRequest(`/trips/${id}`, { status: "DELETED" });
    navigate("/trips");
  };

  const isEditable = tripData?.is_editable;

  return (
    <div className="container max-w-xl py-8 px-4">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {tripData ? (
            <Card>
              <CardHeader>
                <CardTitle>{tripData?.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  <strong>Location:</strong> {tripData?.location?.name}
                </p>
                <p>
                  <strong>Date:</strong> {tripData?.start_date}
                </p>
                <div>
                  <strong>Participants:</strong>
                  {tripData?.member?.length ? (
                    <ul className="list-disc list-inside">
                      {tripData?.members.map((member, index) => (
                        <li key={index}>{member.user?.first_name}</li>
                      ))}
                    </ul>
                  ) : (
                    " None"
                  )}
                </div>
                {tripData?.notes && (
                  <p>
                    <strong>Notes:</strong> {tripData.notes}
                  </p>
                )}

                {isEditable && (
                  <>
                    <div className="flex gap-4 pt-6">
                      <Button onClick={() => navigate(`/trips/${id}/edit`)}>
                        Edit
                      </Button>

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
                  </>
                )}
                <Button
                  onClick={() => navigate("/trips")}
                  className={cn("mt-4", {
                    "ml-4": isEditable,
                  })}
                >
                  Back to Trip List
                </Button>
              </CardContent>
            </Card>
          ) : (
            <p>Trip not found.</p>
          )}
        </>
      )}
    </div>
  );
}
