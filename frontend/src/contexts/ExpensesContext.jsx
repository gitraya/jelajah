import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

import { useApi } from "@/hooks/useApi";
import { ExpensesContext } from "@/hooks/useExpenses";
import { getAPIData, getErrorMessage } from "@/lib/utils";

export const ExpensesProvider = ({ children }) => {
  const { id } = useParams();
  const { getRequest } = useApi();
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [updateExpenses, setUpdateExpenses] = useState(Math.random());

  // Function to trigger re-fetching expenses
  const triggerUpdateExpenses = () => {
    setUpdateExpenses(Math.random());
  };

  const fetchCategories = async () => {
    try {
      const response = await getAPIData("/expenses/categories/");
      setCategories([{ id: "all", name: "All" }, ...response.data]);
    } catch (error) {
      console.error(
        "Failed to fetch packing categories:",
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
    } catch (error) {
      console.error(
        "Failed to fetch expense statistics:",
        getErrorMessage(error)
      );
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchStatistics(id);
  }, []);

  return (
    <ExpensesContext.Provider
      value={{
        categories,
        statistics,
        updateExpenses,
        setStatistics,
        fetchCategories,
        fetchStatistics,
        triggerUpdateExpenses,
      }}
    >
      {children}
    </ExpensesContext.Provider>
  );
};
