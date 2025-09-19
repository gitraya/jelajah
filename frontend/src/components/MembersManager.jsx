import {
  AlertCircle,
  CreditCard,
  Mail,
  Phone,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getMemberRoleColor, getMemberStatusColor } from "@/lib/colors";
import { formatCurrency, getInitials } from "@/lib/utils";

export function MembersManager() {
  const [members, setMembers] = useState([
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 234 567 8901",
      role: "Organizer",
      emergencyContact: "Jane Smith - +1 234 567 8902",
      dietaryRestrictions: "None",
      expenses: 1420000,
      status: "confirmed",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 234 567 8903",
      role: "Co-organizer",
      emergencyContact: "Mark Johnson - +1 234 567 8904",
      dietaryRestrictions: "Vegetarian",
      expenses: 950000,
      status: "confirmed",
    },
    {
      id: "3",
      name: "Mike Chen",
      email: "mike.chen@email.com",
      phone: "+1 234 567 8905",
      role: "Member",
      emergencyContact: "Lisa Chen - +1 234 567 8906",
      dietaryRestrictions: "None",
      expenses: 850000,
      status: "confirmed",
    },
    {
      id: "4",
      name: "Lisa Rodriguez",
      email: "lisa.rodriguez@email.com",
      phone: "+1 234 567 8907",
      role: "Member",
      emergencyContact: "Carlos Rodriguez - +1 234 567 8908",
      dietaryRestrictions: "Gluten-free",
      expenses: 1100000,
      status: "confirmed",
    },
    {
      id: "5",
      name: "Tom Wilson",
      email: "tom.wilson@email.com",
      phone: "+1 234 567 8909",
      role: "Member",
      emergencyContact: "Emma Wilson - +1 234 567 8910",
      dietaryRestrictions: "None",
      expenses: 780000,
      status: "pending",
    },
    {
      id: "6",
      name: "Anna Davis",
      email: "anna.davis@email.com",
      phone: "+1 234 567 8911",
      role: "Member",
      emergencyContact: "David Davis - +1 234 567 8912",
      dietaryRestrictions: "Vegan",
      expenses: 920000,
      status: "confirmed",
    },
  ]);

  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Member",
    emergencyContact: "",
    dietaryRestrictions: "",
  });

  const [selectedStatus, setSelectedStatus] = useState("All");

  const statuses = ["All", "confirmed", "pending", "declined"];
  const roles = ["Organizer", "Co-organizer", "Member"];

  const totalExpenses = members.reduce(
    (sum, member) => sum + member.expenses,
    0
  );
  const averageExpense =
    members.length > 0 ? totalExpenses / members.length : 0;

  const filteredMembers =
    selectedStatus === "All"
      ? members
      : members.filter((member) => member.status === selectedStatus);

  const addMember = () => {
    if (newMember.name && newMember.email && newMember.phone) {
      const member = {
        id: Date.now().toString(),
        name: newMember.name,
        email: newMember.email,
        phone: newMember.phone,
        role: newMember.role,
        emergencyContact: newMember.emergencyContact,
        dietaryRestrictions: newMember.dietaryRestrictions || "None",
        expenses: 0,
        status: "pending",
      };
      setMembers([...members, member]);
      setNewMember({
        name: "",
        email: "",
        phone: "",
        role: "Member",
        emergencyContact: "",
        dietaryRestrictions: "",
      });
      setIsAddingMember(false);
    }
  };

  const deleteMember = (id) => {
    setMembers(members.filter((member) => member.id !== id));
  };

  // 'confirmed' | 'pending' | 'declined'
  const updateMemberStatus = (id, status) => {
    setMembers(
      members.map((member) =>
        member.id === id ? { ...member, status } : member
      )
    );
  };

  const stats = {
    total: members.length,
    confirmed: members.filter((m) => m.status === "confirmed").length,
    pending: members.filter((m) => m.status === "pending").length,
    declined: members.filter((m) => m.status === "declined").length,
  };

  const expenseStats = members
    .map((member) => ({
      ...member,
      percentage:
        totalExpenses > 0 ? (member.expenses / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.expenses - a.expenses);

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
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.confirmed}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
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
                      <SelectItem key={status} value={status}>
                        {status === "All"
                          ? "All"
                          : status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Member</DialogTitle>
                      <DialogDescription>
                        Invite a new member to your trip
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={newMember.name}
                          onChange={(e) =>
                            setNewMember({ ...newMember, name: e.target.value })
                          }
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newMember.email}
                          onChange={(e) =>
                            setNewMember({
                              ...newMember,
                              email: e.target.value,
                            })
                          }
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={newMember.phone}
                          onChange={(e) =>
                            setNewMember({
                              ...newMember,
                              phone: e.target.value,
                            })
                          }
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={newMember.role}
                          onValueChange={(value) =>
                            setNewMember({ ...newMember, role: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="emergencyContact">
                          Emergency Contact
                        </Label>
                        <Input
                          id="emergencyContact"
                          value={newMember.emergencyContact}
                          onChange={(e) =>
                            setNewMember({
                              ...newMember,
                              emergencyContact: e.target.value,
                            })
                          }
                          placeholder="Name and phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dietaryRestrictions">
                          Dietary Restrictions
                        </Label>
                        <Textarea
                          id="dietaryRestrictions"
                          value={newMember.dietaryRestrictions}
                          onChange={(e) =>
                            setNewMember({
                              ...newMember,
                              dietaryRestrictions: e.target.value,
                            })
                          }
                          placeholder="Any dietary restrictions or allergies"
                          rows={2}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingMember(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={addMember}>Add Member</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{member.name}</h4>
                          <Badge className={getMemberRoleColor(member.role)}>
                            {member.role}
                          </Badge>
                          <Badge
                            className={getMemberStatusColor(member.status)}
                          >
                            {member.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span>{member.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{member.phone}</span>
                          </div>
                        </div>
                        {member.dietaryRestrictions !== "None" && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Dietary: {member.dietaryRestrictions}
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
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
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
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.name}</span>
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
                  .filter((m) => m.emergencyContact)
                  .map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-xs">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.phone}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">
                          Emergency Contact:
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.emergencyContact}
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
