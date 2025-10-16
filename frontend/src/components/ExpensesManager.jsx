import { DollarSign, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

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
import { useApi } from "@/hooks/useApi";
import { useExpenses } from "@/hooks/useExpenses";
import { getExpenseCategoryColor } from "@/lib/colors";
import { formatCurrency } from "@/lib/utils";

import ExpenseDialog from "./dialogs/ExpenseDialog";

const getPaidByName = (paid_by) => {
  return `${paid_by.user.first_name} ${paid_by.user.last_name}`;
};

export function ExpensesManager() {
  const { id: tripId } = useParams();
  const { updateExpenses } = useExpenses();
  const { getRequest, deleteRequest } = useApi();
  const [isLoading, setIsLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [
    { total_budget, total_spent, remaining_budget, categories: categoryStats },
    setStatistics,
  ] = useState({});

  useEffect(() => {
    setIsLoading(true);
    getRequest(`/trips/${tripId}/expenses/items/`)
      .then((response) => setExpenses(response.data))
      .finally(() => setIsLoading(false));

    getRequest(`/trips/${tripId}/expenses/statistics/`).then((response) =>
      setStatistics(response.data)
    );
  }, [updateExpenses]);

  const budgetPercentage = (total_spent / total_budget) * 100;

  const deleteExpense = (id) => {
    const deletedExpense = expenses.find((item) => item.id === id);
    setExpenses(expenses.filter((item) => item.id !== id));
    setStatistics((prev) => ({
      ...prev,
      total_spent: prev.total_spent - deletedExpense.amount,
      remaining_budget: prev.remaining_budget + deletedExpense.amount,
      categories: prev.categories
        .map((cat) => {
          if (cat.category.id === deletedExpense.category.id) {
            return {
              ...cat,
              amount: cat.amount - deletedExpense.amount,
              count: cat.count - 1,
            };
          }
          return cat;
        })
        .filter((cat) => cat.count > 0),
    }));
    deleteRequest(`/trips/${tripId}/expenses/items/${id}/`);
  };

  if (isLoading) {
    return <div className="space-y-6">Loading...</div>;
  }

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
              {formatCurrency(total_budget)}
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
              {formatCurrency(total_spent)}
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
              {formatCurrency(remaining_budget)}
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
          {categoryStats?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categoryStats.map((stat) => (
                <div key={stat.category?.name} className="space-y-2">
                  <div className="flex justify-between items-center">
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Track all trip expenses</CardDescription>
          </div>
          <ExpenseDialog />
        </CardHeader>
        <CardContent>
          {expenses?.length > 0 ? (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
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
          ) : (
            <div className="text-sm text-muted-foreground">
              No items in the expense list. Start by adding some!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
