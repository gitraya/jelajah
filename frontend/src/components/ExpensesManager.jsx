import {
  DollarSign,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TRIP_MEMBER_ROLES } from "@/configs/trip";
import { useExpenses } from "@/hooks/useExpenses";
import { useTrip } from "@/hooks/useTrip";
import { getExpenseCategoryColor } from "@/lib/colors";
import { formatCurrency } from "@/lib/utils";

import { ConfirmationDialog } from "./dialogs/ConfirmationDialog";
import ExpenseDialog from "./dialogs/ExpenseDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const getPaidByName = (paid_by) => {
  return `${paid_by.user.first_name} ${paid_by.user.last_name}`;
};

export function ExpensesManager() {
  const { trip } = useTrip();
  const { statistics, isLoading, expenses, deleteExpense } = useExpenses();
  const [viewingSplitExpense, setViewingSplitExpense] = useState(null);

  if (isLoading) {
    return <div className="space-y-6">Loading...</div>;
  }

  const { trip_budget, amount_spent, budget_remaining, category_stats } =
    statistics;

  const budgetPercentage = (amount_spent / trip_budget) * 100;

  const handleDeleteExpense = (expenseId) => {
    deleteExpense(expenseId);
    toast.success("Expense deleted successfully");
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
              {formatCurrency(trip_budget)}
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
              {formatCurrency(amount_spent)}
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
              {formatCurrency(budget_remaining)}
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
          {category_stats?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {category_stats.map((stat) => (
                <div key={stat.category?.name} className="space-y-2">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-sm">{stat.category?.name}</span>
                    <Badge
                      variant="outline"
                      className={getExpenseCategoryColor(stat.category?.name)}
                    >
                      {formatCurrency(stat.amount)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No category statistics available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap">
          <div>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Track all trip expenses</CardDescription>
          </div>
          {trip.user_role !== TRIP_MEMBER_ROLES.MEMBER[0] && <ExpenseDialog />}
        </CardHeader>
        <CardContent>
          {expenses?.length > 0 ? (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex flex-col md:flex-row items-center md:justify-between p-4 border rounded-lg gap-4"
                >
                  <div className="flex-1 mr-auto md:mr-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={getExpenseCategoryColor(
                          expense.category?.name
                        )}
                      >
                        {expense.category?.name}
                      </Badge>
                      <span className="font-medium">{expense.title}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Paid by {getPaidByName(expense.paid_by)} • {expense.date}{" "}
                      • Split between {expense.splits?.length} people
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 ml-auto md:ml-0">
                    <span className="font-medium">
                      {formatCurrency(expense.amount)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingSplitExpense(expense)}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      View Split
                    </Button>
                    {trip.user_role !== TRIP_MEMBER_ROLES.MEMBER[0] && (
                      <ConfirmationDialog
                        title="Delete Expense"
                        description="Are you sure you want to delete this expense? This action cannot be undone."
                        onConfirm={() => handleDeleteExpense(expense.id)}
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        }
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No items in the expense list. Start by adding some!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Split Details Dialog */}
      <Dialog
        open={viewingSplitExpense !== null}
        onOpenChange={(open) => !open && setViewingSplitExpense(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Expense Split Details</DialogTitle>
            <DialogDescription>{viewingSplitExpense?.title}</DialogDescription>
          </DialogHeader>
          {viewingSplitExpense && (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(viewingSplitExpense.amount)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Paid by</h4>
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800"
                  >
                    Payer
                  </Badge>
                  <span>{getPaidByName(viewingSplitExpense.paid_by)}</span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    Paid {formatCurrency(viewingSplitExpense.amount)}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">
                  Split between {viewingSplitExpense.splits.length} people
                </h4>
                <div className="space-y-2">
                  {viewingSplitExpense.splits.map((split) => {
                    return (
                      <div
                        key={split.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <span>{getPaidByName(split.member)}</span>
                        <div className="text-right">
                          <span className="font-medium">
                            {formatCurrency(split.amount)}
                          </span>
                          {split.paid === true ? (
                            <p className="text-xs text-green-600">
                              Already paid
                            </p>
                          ) : (
                            <p className="text-xs text-orange-600">
                              Owes to{" "}
                              {getPaidByName(viewingSplitExpense.paid_by)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setViewingSplitExpense(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
