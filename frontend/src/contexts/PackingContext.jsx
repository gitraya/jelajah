import React, { useEffect, useState } from "react";

import { PackingContext } from "@/hooks/usePacking";
import { getAPIData, getErrorMessage } from "@/lib/utils";

export const PackingProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [updatePackingItems, setUpdatePackingItems] = useState(Math.random());

  // Function to trigger re-fetching packing items
  const triggerUpdatePackingItems = () => {
    setUpdatePackingItems(Math.random());
  };

  const fetchCategories = async () => {
    try {
      const response = await getAPIData("/packing/categories/");
      setCategories(response.data);
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
    <PackingContext.Provider
      value={{
        categories,
        updatePackingItems,
        fetchCategories,
        triggerUpdatePackingItems,
      }}
    >
      {children}
    </PackingContext.Provider>
  );
};
