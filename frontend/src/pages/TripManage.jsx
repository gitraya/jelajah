import {
  Calendar,
  CheckSquare,
  DollarSign,
  Map,
  MapPin,
  Package,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";

import { ChecklistManager } from "@/components/ChecklistManager";
import { ExpensesManager } from "@/components/ExpensesManager";
import { ItinerariesManager } from "@/components/ItinerariesManager";
import { MembersManager } from "@/components/MembersManager";
import { PackingList } from "@/components/PackingList";
import { TripOverview } from "@/components/TripOverview";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/UserAvatar";
import { ChecklistProvider } from "@/contexts/ChecklistContext";
import { ExpensesProvider } from "@/contexts/ExpensesContext";
import { ItinerariesProvider } from "@/contexts/ItinerariesContext";
import { PackingItemsProvider } from "@/contexts/PackingItemsContext";
import { TripsProvider } from "@/contexts/TripsContext";
import { useAuth } from "@/hooks/useAuth";

export default function TripManage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "overview"
  );

  // Mock trip data
  const tripData = {
    title: "Jelajah Bali Adventure",
    destination: "Bali, Indonesia",
    dates: "March 15-22, 2024",
    duration: "8 days",
    members: 6,
    totalBudget: 15000000,
    spentBudget: 8500000,
  };

  // Manage view (original trip management interface)
  return (
    <TripsProvider>
      <ItinerariesProvider>
        <ChecklistProvider>
          <ExpensesProvider>
            <PackingItemsProvider>
              <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="border-b">
                  <div className="container mx-auto px-4 py-6">
                    <div className="flex lg:items-center gap-4 flex-col lg:flex-row">
                      <Link
                        to={user ? "/trips/my" : "/login?redirect=/trips/my"}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors mr-auto lg:mr-0"
                      >
                        ← Back to Trips
                      </Link>

                      <div className="flex-1 flex items-center gap-4">
                        <div>
                          <h1 className="mb-2 font-semibold">
                            {tripData.title}
                          </h1>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{tripData.destination}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{tripData.dates}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{tripData.members} members</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 ml-auto">
                          <Badge variant="secondary" className="px-3 py-1">
                            {tripData.duration}
                          </Badge>
                          <UserAvatar />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

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
                      <TripOverview tripData={tripData} />
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
    </TripsProvider>
  );
}
