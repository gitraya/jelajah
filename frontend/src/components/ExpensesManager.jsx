import {
  DollarSign,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getExpenseCategoryColor } from "@/lib/colors";
import { formatCurrency } from "@/lib/utils";

export function ExpensesManager() {
  const [expenses, setExpenses] = useState([
    {
      id: "1",
      category: "Accommodation",
      description: "Hotel booking - 4 nights",
      amount: 3200000,
      date: "2024-03-15",
      paidBy: "John",
      splitBetween: ["John", "Sarah", "Mike", "Lisa", "Tom", "Anna"],
    },
    {
      id: "2",
      category: "Transportation",
      description: "Airport transfer",
      amount: 450000,
      date: "2024-03-15",
      paidBy: "Sarah",
      splitBetween: ["John", "Sarah", "Mike", "Lisa", "Tom", "Anna"],
    },
    {
      id: "3",
      category: "Food",
      description: "Welcome dinner",
      amount: 850000,
      date: "2024-03-15",
      paidBy: "Mike",
      splitBetween: ["John", "Sarah", "Mike", "Lisa", "Tom", "Anna"],
    },
    {
      id: "4",
      category: "Activities",
      description: "Ubud tour guide",
      amount: 600000,
      date: "2024-03-16",
      paidBy: "Lisa",
      splitBetween: ["John", "Sarah", "Mike", "Lisa", "Tom", "Anna"],
    },
  ]);

  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: "",
    description: "",
    amount: "",
    paidBy: "",
    splitBetween: ["John", "Sarah", "Mike", "Lisa", "Tom", "Anna"],
  });

  const totalBudget = 15000000;
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const budgetPercentage = (totalSpent / totalBudget) * 100;

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const addExpense = () => {
    if (
      newExpense.category &&
      newExpense.description &&
      newExpense.amount &&
      newExpense.paidBy
    ) {
      const expense = {
        id: Date.now().toString(),
        category: newExpense.category,
        description: newExpense.description,
        amount: parseInt(newExpense.amount),
        date: new Date().toISOString().split("T")[0],
        paidBy: newExpense.paidBy,
        splitBetween: newExpense.splitBetween,
      };
      setExpenses([...expenses, expense]);
      setNewExpense({
        category: "",
        description: "",
        amount: "",
        paidBy: "",
        splitBetween: ["John", "Sarah", "Mike", "Lisa", "Tom", "Anna"],
      });
      setIsAddingExpense(false);
    }
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBudget)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSpent)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBudget - totalSpent)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Spent</span>
              <span>{Math.round(budgetPercentage)}%</span>
            </div>
            <Progress value={budgetPercentage} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(categoryTotals).map(([category, amount]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{category}</span>
                  <Badge
                    variant="outline"
                    className={getExpenseCategoryColor(category)}
                  >
                    {formatCurrency(amount)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Track all trip expenses</CardDescription>
          </div>
          <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>
                  Record a new expense for the trip
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value) =>
                      setNewExpense({ ...newExpense, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Accommodation">
                        Accommodation
                      </SelectItem>
                      <SelectItem value="Transportation">
                        Transportation
                      </SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Activities">Activities</SelectItem>
                      <SelectItem value="Shopping">Shopping</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter description"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (IDR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, amount: e.target.value })
                    }
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label htmlFor="paidBy">Paid by</Label>
                  <Select
                    value={newExpense.paidBy}
                    onValueChange={(value) =>
                      setNewExpense({ ...newExpense, paidBy: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="John">John</SelectItem>
                      <SelectItem value="Sarah">Sarah</SelectItem>
                      <SelectItem value="Mike">Mike</SelectItem>
                      <SelectItem value="Lisa">Lisa</SelectItem>
                      <SelectItem value="Tom">Tom</SelectItem>
                      <SelectItem value="Anna">Anna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingExpense(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={addExpense}>Add Expense</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      className={getExpenseCategoryColor(expense.category)}
                    >
                      {expense.category}
                    </Badge>
                    <span className="font-medium">{expense.description}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Paid by {expense.paidBy} • {expense.date} • Split between{" "}
                    {expense.splitBetween.length} people
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {formatCurrency(expense.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteExpense(expense.id)}
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
    </div>
  );
}
