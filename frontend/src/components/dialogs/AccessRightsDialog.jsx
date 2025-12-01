import { Check, Minus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AccessItem = ({ allowed, limited, children }) => (
  <li className="flex items-start gap-2">
    {allowed ? (
      <Check className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
    ) : limited ? (
      <Minus className="h-4 w-4 mt-0.5 text-yellow-500 shrink-0" />
    ) : (
      <X className="h-4 w-4 mt-0. 5 text-red-500 shrink-0" />
    )}
    <span className="text-sm">{children}</span>
  </li>
);

const RoleAccessList = ({ role }) => {
  const accessRights = {
    organizer: {
      title: "Organizer",
      description:
        "Full control over the trip.  The trip owner is always an Organizer and cannot be changed by other Organizers.",
      rights: [
        { text: "View, create, update, and delete trips", allowed: true },
        { text: "Only owner can delete the trip", allowed: true },
        { text: "Manage all trip members", allowed: true },
        {
          text: "Full access to itinerary (view, create, update, delete)",
          allowed: true,
        },
        {
          text: "Full access to packing items (view, create, update, delete)",
          allowed: true,
        },
        {
          text: "Full access to expenses (view, create, update, delete)",
          allowed: true,
        },
        {
          text: "Full access to checklist (view, create, update, delete)",
          allowed: true,
        },
      ],
    },
    coOrganizer: {
      title: "Co-Organizer",
      description:
        "Assists the Organizer in managing the trip but cannot delete the trip or manage membership.",
      rights: [
        { text: "View and update trips", allowed: true },
        { text: "Delete trips", allowed: false },
        { text: "Manage trip members", allowed: false },
        {
          text: "Full access to itinerary (view, create, update, delete)",
          allowed: true,
        },
        {
          text: "Full access to packing items (view, create, update, delete)",
          allowed: true,
        },
        {
          text: "Full access to expenses (view, create, update, delete)",
          allowed: true,
        },
        {
          text: "Full access to checklist (view, create, update, delete)",
          allowed: true,
        },
      ],
    },
    member: {
      title: "Member",
      description:
        "Participates in the trip with limited access. Can view most content but has restricted editing capabilities.",
      rights: [
        { text: "View trips", allowed: true },
        { text: "Update or delete trips", allowed: false },
        { text: "Manage trip members", allowed: false },
        { text: "View itinerary", allowed: true },
        { text: "Create, update, or delete itinerary", allowed: false },
        { text: "View packing items", allowed: true },
        {
          text: "Create, update and delete packing items (only assigned to self)",
          allowed: true,
          limited: true,
        },
        { text: "View expenses", allowed: true },
        { text: "Create, update, or delete expenses", allowed: false },
        { text: "View checklist", allowed: true },
        {
          text: "Create, update and delete checklist items (only assigned to self)",
          allowed: true,
          limited: true,
        },
      ],
    },
  };

  const access = accessRights[role];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{access.description}</p>
      <ul className="space-y-2">
        {access.rights.map((right, index) => (
          <AccessItem
            key={index}
            allowed={right.allowed}
            limited={right.limited}
          >
            {right.text}
          </AccessItem>
        ))}
      </ul>
    </div>
  );
};

export default function AccessRightsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline">
          Access Rights & Roles
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Access Rights & Roles</DialogTitle>
          <DialogDescription>
            Learn about the different roles and their permissions in Jelajah.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="organizer" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="organizer">Organizer</TabsTrigger>
            <TabsTrigger value="coOrganizer">Co-Organizer</TabsTrigger>
            <TabsTrigger value="member">Member</TabsTrigger>
          </TabsList>
          <TabsContent value="organizer" className="mt-4">
            <RoleAccessList role="organizer" />
          </TabsContent>
          <TabsContent value="coOrganizer" className="mt-4">
            <RoleAccessList role="coOrganizer" />
          </TabsContent>
          <TabsContent value="member" className="mt-4">
            <RoleAccessList role="member" />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
