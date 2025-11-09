import {
  AlertCircle,
  CreditCard,
  Mail,
  Phone,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TRIP_MEMBER_ROLES, TRIP_MEMBER_STATUSES } from "@/configs/trip";
import { useApi } from "@/hooks/useApi";
import { useTrips } from "@/hooks/useTrips";
import { getMemberRoleColor, getMemberStatusColor } from "@/lib/colors";
import { formatCurrency, getInitials } from "@/lib/utils";

import MemberDialog from "./dialogs/MemberDialog";

const getFullName = (user) => {
  return `${user.first_name} ${user.last_name}`;
};

export function MembersManager() {
  const { id: tripId } = useParams();
  const { updateMembers, statistics, setStatistics, fetchStatistics } =
    useTrips();
  const { getRequest, patchRequest, deleteRequest } = useApi();
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { total, confirmed, pending } = statistics;

  useEffect(() => {
    setIsLoading(true);
    getRequest(`/trips/${tripId}/members/items/`)
      .then((response) => setMembers(response.data))
      .finally(() => setIsLoading(false));

    return () => {
      getRequest(`/trips/${tripId}/members/items/`);
    };
  }, [updateMembers, selectedStatus]);

  useEffect(() => {
    getRequest(
      `/trips/${tripId}/members/items/${
        selectedStatus !== "all" ? `?status=${selectedStatus}` : ""
      }`
    ).then((response) => setFilteredMembers(response.data));
  }, [members, selectedStatus]);

  useEffect(() => {
    fetchStatistics(tripId);
  }, [updateMembers]);

  const statuses = [
    {
      id: "all",
      name: "All",
    },
    ...Object.entries(TRIP_MEMBER_STATUSES).map(([key, value]) => ({
      id: key,
      name: value,
    })),
  ];

  const totalExpenses = members.reduce(
    (sum, member) => sum + member.expenses,
    0
  );
  const averageExpense =
    members.length > 0 ? totalExpenses / members.length : 0;

  const deleteMember = (id) => {
    const previousStatus = members.find((member) => member.id === id)?.status;
    setMembers(members.filter((member) => member.id !== id));
    setStatistics((prev) => ({
      ...prev,
      total: prev.total - 1,
      confirmed:
        previousStatus === "ACCEPTED" ? prev.confirmed - 1 : prev.confirmed,
      pending: previousStatus === "PENDING" ? prev.pending - 1 : prev.pending,
      declined:
        previousStatus === "DECLINED" ? prev.declined - 1 : prev.declined,
    }));
    deleteRequest(`/trips/${tripId}/members/items/${id}/`);
  };

  const updateMemberStatus = (id, status) => {
    const previousStatus = members.find((member) => member.id === id)?.status;
    if (previousStatus === status) return;
    setMembers(
      members.map((member) =>
        member.id === id ? { ...member, status } : member
      )
    );
    setStatistics((prev) => ({
      ...prev,
      confirmed:
        previousStatus === "ACCEPTED"
          ? prev.confirmed - 1
          : status === "ACCEPTED"
          ? prev.confirmed + 1
          : prev.confirmed,
      pending:
        previousStatus === "PENDING"
          ? prev.pending - 1
          : status === "PENDING"
          ? prev.pending + 1
          : prev.pending,
      declined:
        previousStatus === "DECLINED"
          ? prev.declined - 1
          : status === "DECLINED"
          ? prev.declined + 1
          : prev.declined,
    }));
    patchRequest(`/trips/${tripId}/members/items/${id}/`, { status });
  };

  const expenseStats = members
    .map((member) => ({
      ...member,
      percentage:
        totalExpenses > 0 ? (member.expenses / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.expenses - a.expenses);

  if (isLoading) {
    return <div className="space-y-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Expense
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {formatCurrency(averageExpense)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="expenses">Expense Split</TabsTrigger>
          <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          {/* Members List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Trip Members</CardTitle>
                <CardDescription>
                  Manage your travel group members
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <MemberDialog />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={member.user?.avatar} />
                        <AvatarFallback>
                          {getInitials(getFullName(member.user))}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">
                            {getFullName(member.user)}
                          </h4>
                          <Badge className={getMemberRoleColor(member.role)}>
                            {TRIP_MEMBER_ROLES[member.role]}
                          </Badge>
                          <Badge
                            className={getMemberStatusColor(member.status)}
                          >
                            {TRIP_MEMBER_STATUSES[member.status]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{member.user?.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{member.user?.phone}</span>
                          </div>
                        </div>
                        {member.dietary_restrictions && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Dietary: {member.dietary_restrictions}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(member.expenses)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          spent
                        </div>
                      </div>
                      <Select
                        value={member.status}
                        onValueChange={(value) =>
                          updateMemberStatus(member.id, value)
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TRIP_MEMBER_STATUSES).map(
                            ([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMember(member.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown by Member</CardTitle>
              <CardDescription>
                See how expenses are distributed among group members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenseStats.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.user?.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(getFullName(member.user))}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {getFullName(member.user)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(member.expenses)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.percentage.toFixed(1)}% of total
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Expenses</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(totalExpenses)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Average per person</span>
                    <span>{formatCurrency(averageExpense)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
              <CardDescription>
                Emergency contact information for all trip members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members
                  .filter(
                    (m) => m.emergency_contact_name && m.emergency_contact_phone
                  )
                  .map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.user?.avatar} />
                          <AvatarFallback className="text-xs">
                            {getInitials(getFullName(member.user))}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {getFullName(member.user)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.user?.phone}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">
                          Emergency Contact:
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.emergency_contact_name} -{" "}
                          {member.emergency_contact_phone}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
