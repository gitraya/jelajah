import {
  AlertCircle,
  CreditCard,
  Mail,
  Phone,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

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
import { useAuth } from "@/hooks/useAuth";
import { useMembers } from "@/hooks/useMembers";
import { useTrip } from "@/hooks/useTrip";
import { getMemberRoleColor, getMemberStatusColor } from "@/lib/colors";
import { formatCurrency, getInitials } from "@/lib/utils";

import MemberDialog from "./dialogs/MemberDialog";

const getFullName = (user) => {
  return `${user.first_name} ${user.last_name}`;
};

export function MembersManager() {
  const { user } = useAuth();
  const { trip } = useTrip();
  const {
    statistics,
    isLoading,
    filteredMembers,
    members,
    selectedStatus,
    setSelectedStatus,
    updateMemberStatus,
    deleteMember,
  } = useMembers();

  if (isLoading) {
    return <div className="space-y-6">Loading...</div>;
  }

  const { total, accepted, pending, average_expense, total_expenses } =
    statistics;

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

  const expenseStats = members
    .map((member) => ({
      ...member,
      percentage:
        total_expenses > 0 ? (member.expenses / total_expenses) * 100 : 0,
    }))
    .sort((a, b) => b.expenses - a.expenses);

  const membersWithContacts = members.filter(
    (m) => m.emergency_contact_name && m.emergency_contact_phone
  );

  const handleDeleteMember = (memberId) => {
    deleteMember(memberId);
    toast("Member deleted successfully");
  };

  const handleUpdateMemberStatus = (memberId, status) => {
    updateMemberStatus(memberId, status);
    toast("Member status updated successfully");
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <Users className="h-4 w-4 text-green-600 shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{accepted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0" />
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
            <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold break-all">
              {formatCurrency(average_expense)}
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
            <CardHeader className="flex flex-wrap flex-row items-center justify-between">
              <div>
                <CardTitle>Trip Members</CardTitle>
                <CardDescription>
                  Manage your travel group members
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="sm:w-32">
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
                {trip.user_role === TRIP_MEMBER_ROLES.ORGANIZER[0] && (
                  <MemberDialog triggerClassName="w-full sm:w-auto" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMembers.map((member) => {
                  const isMemberEditable =
                    trip.user_role === TRIP_MEMBER_ROLES.ORGANIZER[0] &&
                    user.id !== trip.owner.id;
                  return (
                    <div
                      key={member.id}
                      className="flex flex-wrap items-center justify-between p-4 border rounded-lg gap-2"
                    >
                      <div className="flex flex-col sm:flex-row flex-wrap items-center space-x-4 gap-2">
                        <Avatar className="mr-auto">
                          <AvatarImage src={member.user?.avatar} />
                          <AvatarFallback>
                            {getInitials(getFullName(member.user))}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-medium">
                              {getFullName(member.user)}
                            </h4>
                            <Badge className={getMemberRoleColor(member.role)}>
                              {TRIP_MEMBER_ROLES[member.role][1]}
                            </Badge>
                            <Badge
                              className={getMemberStatusColor(member.status)}
                            >
                              {TRIP_MEMBER_STATUSES[member.status]}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <a
                              href={`mailto:${member.user?.email}`}
                              className="flex items-center gap-1 hover:underline"
                            >
                              <Mail className="w-4 h-4" />
                              <span>{member.user?.email}</span>{" "}
                            </a>
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
                      <div className="flex flex-wrap items-center gap-2 ml-auto">
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(member.expenses)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            spent
                          </div>
                        </div>
                        {isMemberEditable && (
                          <>
                            <Select
                              value={member.status}
                              onValueChange={(value) =>
                                handleUpdateMemberStatus(member.id, value)
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
                              onClick={() => handleDeleteMember(member.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
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
                    className="flex flex-wrap gap-3 items-center justify-between p-3 border rounded-lg"
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
                    <div className="flex items-center gap-4 ml-auto">
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
                      {formatCurrency(total_expenses)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Average per person</span>
                    <span>{formatCurrency(average_expense)}</span>
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
              {membersWithContacts.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  No emergency contact information available.
                </div>
              ) : (
                <div className="space-y-4">
                  {membersWithContacts.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-wrap gap-3 items-center justify-between p-3 border rounded-lg"
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
