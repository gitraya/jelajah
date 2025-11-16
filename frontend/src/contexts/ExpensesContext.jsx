import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";

import { useApi } from "@/hooks/useApi";
import { ExpensesContext } from "@/hooks/useExpenses";
import { getAPIData, getErrorMessage } from "@/lib/utils";

const updateCategoryStats = (prevStats, expense, isAdding = true) => {
  const multiplier = isAdding ? 1 : -1;
  const existingCategoryIndex = prevStats.category_stats.findIndex(
    (cat) => cat.category.id === expense.category.id
  );

  if (existingCategoryIndex !== -1) {
    const updatedStats = [...prevStats.category_stats];
    updatedStats[existingCategoryIndex] = {
      ...updatedStats[existingCategoryIndex],
      amount:
        updatedStats[existingCategoryIndex].amount +
        expense.amount * multiplier,
      count: updatedStats[existingCategoryIndex].count + 1 * multiplier,
    };
    return updatedStats.filter((cat) => cat.count > 0);
  } else if (isAdding) {
    return [
      ...prevStats.category_stats,
      { category: expense.category, amount: expense.amount, count: 1 },
    ];
  }
  return prevStats.category_stats;
};

export const ExpensesProvider = ({ children }) => {
  const { id: defaultTripId } = useParams();
  const { getRequest, deleteRequest, postRequest } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState({});

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getAPIData("/expenses/categories/");
      const categoriesData = [{ id: "all", name: "All" }, ...response.data];
      setCategories(categoriesData);
      return categoriesData;
    } catch (error) {
      console.error(
        "Failed to fetch expense categories:",
        getErrorMessage(error)
      );
      return [];
    }
  }, []);

  const fetchStatistics = useCallback(async (tripId) => {
    try {
      const response = await getRequest(
        `/trips/${tripId}/expenses/statistics/`
      );
      setStatistics(response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Failed to fetch expense statistics:",
        getErrorMessage(error)
      );
      return {};
    }
  }, []);

  const fetchExpenses = useCallback(async (tripId) => {
    try {
      const response = await getRequest(`/trips/${tripId}/expenses/items/`);
      setExpenses(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch expenses:", getErrorMessage(error));
      return [];
    }
  }, []);

  const createExpense = useCallback(async (data, tripId = defaultTripId) => {
    try {
      setError("");
      const response = await postRequest(
        `/trips/${tripId}/expenses/items/`,
        data
      );

      setExpenses((prev) =>
        [...prev, response.data].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        )
      );
      setStatistics((prev) => ({
        ...prev,
        amount_spent: prev.amount_spent + response.data.amount,
        budget_remaining: prev.budget_remaining - response.data.amount,
        category_stats: updateCategoryStats(prev, response.data, true),
      }));

      return response.data;
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "An error occurred while creating the expense. Please try again later."
        )
      );
      throw error;
    }
  }, []);

  const deleteExpense = useCallback(
    async (id, tripId = defaultTripId) => {
      const deletedExpense = expenses.find((item) => item.id === id);
      if (!deletedExpense) return;

      setExpenses((prev) => prev.filter((item) => item.id !== id));
      setStatistics((prev) => ({
        ...prev,
        amount_spent: prev.amount_spent - deletedExpense.amount,
        budget_remaining: prev.budget_remaining + deletedExpense.amount,
        category_stats: updateCategoryStats(prev, deletedExpense, false),
      }));
      deleteRequest(`/trips/${tripId}/expenses/items/${id}/`);
    },
    [expenses]
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!defaultTripId) return;
    setIsLoading(true);
    Promise.all([
      fetchStatistics(defaultTripId),
      fetchExpenses(defaultTripId),
    ]).finally(() => setIsLoading(false));
  }, []);

  return (
    <ExpensesContext.Provider
      value={{
        error,
        isLoading,
        expenses,
        categories,
        statistics,
        setError,
        createExpense,
        deleteExpense,
      }}
    >
      {children}
    </ExpensesContext.Provider>
  );
};
