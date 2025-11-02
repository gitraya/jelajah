import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

import { useApi } from "@/hooks/useApi";
import { ExpensesContext } from "@/hooks/useExpenses";
import { getAPIData, getErrorMessage } from "@/lib/utils";

export const ExpensesProvider = ({ children }) => {
  const { id: defaultTripId } = useParams();
  const { getRequest, deleteRequest, postRequest } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [updateExpenses, setUpdateExpenses] = useState(Math.random());

  // Function to trigger re-fetching expenses
  const triggerUpdateExpenses = () => setUpdateExpenses(Math.random());

  const fetchCategories = async () => {
    try {
      const response = await getAPIData("/expenses/categories/");
      setCategories([{ id: "all", name: "All" }, ...response.data]);
      return [{ id: "all", name: "All" }, ...response.data];
    } catch (error) {
      console.error(
        "Failed to fetch expense categories:",
        getErrorMessage(error)
      );
    }
  };

  const fetchStatistics = async (tripId) => {
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
    }
  };

  const fetchExpenses = async (tripId) => {
    try {
      const response = await getRequest(`/trips/${tripId}/expenses/items/`);
      setExpenses(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch expenses:", getErrorMessage(error));
      return [];
    }
  };

  const createExpense = async (data, tripId = defaultTripId) => {
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
        category_stats: (() => {
          const existingCategory = prev.category_stats.find(
            (cat) => cat.category.id === response.data.category.id
          );
          if (existingCategory) {
            return prev.category_stats.map((cat) => {
              if (cat.category.id === response.data.category.id) {
                return {
                  ...cat,
                  amount: cat.amount + response.data.amount,
                  count: cat.count + 1,
                };
              }
              return cat;
            });
          } else {
            return [
              ...prev.category_stats,
              {
                category: response.data.category,
                amount: response.data.amount,
                count: 1,
              },
            ];
          }
        })(),
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
  };

  const deleteExpense = (id, tripId = defaultTripId) => {
    const deletedExpense = expenses.find((item) => item.id === id);
    setExpenses(expenses.filter((item) => item.id !== id));
    setStatistics((prev) => ({
      ...prev,
      amount_spent: prev.amount_spent - deletedExpense.amount,
      budget_remaining: prev.budget_remaining + deletedExpense.amount,
      category_stats: prev.category_stats
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

  useEffect(() => {
    fetchCategories();
    fetchStatistics(defaultTripId);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchStatistics(defaultTripId);
    fetchExpenses(defaultTripId).finally(() => setIsLoading(false));
  }, [updateExpenses]);

  return (
    <ExpensesContext.Provider
      value={{
        error,
        isLoading,
        expenses,
        categories,
        statistics,
        updateExpenses,
        setError,
        setExpenses,
        createExpense,
        deleteExpense,
        setStatistics,
        fetchCategories,
        fetchStatistics,
        fetchExpenses,
        triggerUpdateExpenses,
      }}
    >
      {children}
    </ExpensesContext.Provider>
  );
};
