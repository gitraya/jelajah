import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

import { useApi } from "@/hooks/useApi";
import { PackingContext } from "@/hooks/usePacking";
import { getAPIData, getErrorMessage } from "@/lib/utils";

export const PackingProvider = ({ children }) => {
  const { id } = useParams();
  const { getRequest } = useApi();
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [updatePackingItems, setUpdatePackingItems] = useState(Math.random());

  // Function to trigger re-fetching packing items
  const triggerUpdatePackingItems = () => {
    setUpdatePackingItems(Math.random());
  };

  const fetchCategories = async () => {
    try {
      const response = await getAPIData("/packing/categories/");
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
      const response = await getRequest(`/trips/${tripId}/packing/statistics/`);
      setStatistics(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch packing statistics:",
        getErrorMessage(error)
      );
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchStatistics(id);
  }, []);

  return (
    <PackingContext.Provider
      value={{
        categories,
        statistics,
        updatePackingItems,
        setStatistics,
        fetchCategories,
        fetchStatistics,
        triggerUpdatePackingItems,
      }}
    >
      {children}
    </PackingContext.Provider>
  );
};
