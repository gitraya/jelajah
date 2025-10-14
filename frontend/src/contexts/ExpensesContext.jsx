import React, { useEffect, useState } from "react";

import { ExpensesContext } from "@/hooks/useExpenses";
import { getAPIData, getErrorMessage } from "@/lib/utils";

export const ExpensesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
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

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <ExpensesContext.Provider
      value={{
        categories,
        updateExpenses,
        fetchCategories,
        triggerUpdateExpenses,
      }}
    >
      {children}
    </ExpensesContext.Provider>
  );
};
