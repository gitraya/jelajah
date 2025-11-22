import {
  Calendar,
  CheckSquare,
  DollarSign,
  Edit,
  Map,
  MapPin,
  Package,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { ChecklistManager } from "@/components/ChecklistManager";
import TripDialog from "@/components/dialogs/TripDialog";
import { ExpensesManager } from "@/components/ExpensesManager";
import { ItinerariesManager } from "@/components/ItinerariesManager";
import { MembersManager } from "@/components/MembersManager";
import { PackingList } from "@/components/PackingList";
import { TripOverview } from "@/components/TripOverview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/UserAvatar";
import { ChecklistProvider } from "@/contexts/ChecklistContext";
import { ExpensesProvider } from "@/contexts/ExpensesContext";
import { ItinerariesProvider } from "@/contexts/ItinerariesContext";
import { MembersProvider } from "@/contexts/MembersContext";
import { PackingItemsProvider } from "@/contexts/PackingItemsContext";
import { TagsProvider } from "@/contexts/TagsContext";
import { TripProvider } from "@/contexts/TripContext";
import { useAuth } from "@/hooks/useAuth";
import { useTrip } from "@/hooks/useTrip";

import NotFound from "./NotFound";

export default function TripManage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "overview"
  );

  // Manage view (original trip management interface)
  useEffect(() => {
    searchParams.set("tab", activeTab);
    window.history.replaceState(null, "", `?${searchParams.toString()}`);
  }, [activeTab]);

  return (
    <TripProvider>
      <Container>
        <TagsProvider>
          <MembersProvider>
            <ItinerariesProvider>
              <ChecklistProvider>
                <ExpensesProvider>
                  <PackingItemsProvider>
                    <div className="min-h-screen bg-background">
                      {/* Header */}
                      <Header />
                      {/* Main Content */}
                      <div className="container mx-auto px-4 py-6">
                        <Tabs
                          value={activeTab}
                          onValueChange={setActiveTab}
                          className="w-full"
                        >
                          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto gap-2">
                            <TabsTrigger
                              value="overview"
                              className="flex items-center gap-2"
                            >
                              <Calendar className="w-4 h-4" />
                              Overview
                            </TabsTrigger>
                            <TabsTrigger
                              value="expenses"
                              className="flex items-center gap-2"
                            >
                              <DollarSign className="w-4 h-4" />
                              Expenses
                            </TabsTrigger>
                            <TabsTrigger
                              value="packing"
                              className="flex items-center gap-2"
                            >
                              <Package className="w-4 h-4" />
                              Packing
                            </TabsTrigger>
                            <TabsTrigger
                              value="checklist"
                              className="flex items-center gap-2"
                            >
                              <CheckSquare className="w-4 h-4" />
                              Checklist
                            </TabsTrigger>
                            <TabsTrigger
                              value="maps"
                              className="flex items-center gap-2"
                            >
                              <Map className="w-4 h-4" />
                              Maps
                            </TabsTrigger>
                            <TabsTrigger
                              value="members"
                              className="flex items-center gap-2"
                            >
                              <Users className="w-4 h-4" />
                              Members
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="overview" className="mt-6">
                            <TripOverview />
                          </TabsContent>

                          <TabsContent value="expenses" className="mt-6">
                            <ExpensesManager />
                          </TabsContent>

                          <TabsContent value="packing" className="mt-6">
                            <PackingList />
                          </TabsContent>

                          <TabsContent value="checklist" className="mt-6">
                            <ChecklistManager />
                          </TabsContent>

                          <TabsContent value="maps" className="mt-6">
                            <ItinerariesManager />
                          </TabsContent>

                          <TabsContent value="members" className="mt-6">
                            <MembersManager />
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>
                  </PackingItemsProvider>
                </ExpensesProvider>
              </ChecklistProvider>
            </ItinerariesProvider>
          </MembersProvider>
        </TagsProvider>
      </Container>
    </TripProvider>
  );
}

const Container = ({ children }) => {
  const { trip, isLoading } = useTrip();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!trip || !trip.is_member) {
    return <NotFound />;
  }

  return <>{children}</>;
};

const Header = () => {
  const { user } = useAuth();
  const { trip, isLoading, fetchTripDetails } = useTrip();

  if (isLoading) {
    return <div className="border-b">Loading...</div>;
  }

  const onSuccessEditTrip = (updatedTrip) => fetchTripDetails(updatedTrip.id);

  return (
    <div className="border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex lg:items-center gap-4 flex-col lg:flex-row">
          <Link
            to={user ? "/trips/my" : "/login?redirect=/trips/my"}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors mr-auto lg:mr-0"
          >
            ← Back to Trips
          </Link>

          <div className="flex-1 flex items-center gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-semibold shrink-0">{trip.title}</h1>

                <TripDialog
                  trip={trip}
                  onSuccess={onSuccessEditTrip}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Trip
                    </Button>
                  }
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{trip.dates}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>
                    {trip.members_count}/{trip.member_spots} member
                    {trip.member_spots > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <Badge variant="secondary" className="px-3 py-1">
                {trip.duration_label}
              </Badge>
              <UserAvatar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
