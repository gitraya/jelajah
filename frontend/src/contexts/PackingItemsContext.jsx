import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

import { useApi } from "@/hooks/useApi";
import { PackingItemsContext } from "@/hooks/usePackingItems";
import { getAPIData, getErrorMessage } from "@/lib/utils";

export const PackingItemsProvider = ({ children }) => {
  const { id: defaultTripId } = useParams();
  const { getRequest, postRequest, deleteRequest, patchRequest } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [packingItems, setPackingItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [updatePackingItems, setUpdatePackingItems] = useState(Math.random());

  // Function to trigger re-fetching packing items
  const triggerUpdatePackingItems = () => setUpdatePackingItems(Math.random());

  const fetchCategories = async () => {
    try {
      const response = await getAPIData("/packing/categories/");
      setCategories([{ id: "all", name: "All" }, ...response.data]);
      return [{ id: "all", name: "All" }, ...response.data];
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
      return response.data;
    } catch (error) {
      console.error(
        "Failed to fetch packing statistics:",
        getErrorMessage(error)
      );
    }
  };

  const fetchPackingItems = async (tripId) => {
    try {
      const response = await getRequest(
        `/trips/${tripId}/packing/items${
          selectedCategory !== "all" ? `?category_id=${selectedCategory}` : ""
        }`
      );
      setPackingItems(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch packing items:", getErrorMessage(error));
      return [];
    }
  };

  const createPacking = async (data, tripId = defaultTripId) => {
    try {
      setError("");
      const response = await postRequest(
        `/trips/${tripId}/packing/items/`,
        data
      );
      setPackingItems((prev) =>
        [...prev, response.data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )
      );
      setStatistics((prev) => ({
        ...prev,
        total_items: prev.total_items + 1,
        category_stats: prev.category_stats.map((cat) => {
          const existingCategory = prev.category_stats.find(
            (cat) => cat.category.id === response.data.category.id
          );
          if (existingCategory) {
            if (cat.category?.id === response.data.category.id) {
              return {
                ...cat,
                total: cat.total + 1,
              };
            }
            return cat;
          } else {
            return [
              ...prev.category_stats,
              {
                category: response.data.category,
                total: 1,
                packed: 0,
              },
            ];
          }
        }),
      }));

      return response.data;
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "An error occurred while creating the packing item. Please try again later."
        )
      );
      throw error;
    }
  };

  const togglePacking = (id, tripId = defaultTripId) => {
    const toggledItem = packingItems.find((item) => item.id === id);
    const packed = !toggledItem.packed;
    setPackingItems(
      packingItems.map((item) => (item.id === id ? { ...item, packed } : item))
    );
    setStatistics((prev) => ({
      ...prev,
      packed_items: packed ? prev.packed_items + 1 : prev.packed_items - 1,
      category_stats: prev.category_stats.map((cat) => {
        if (cat.category?.id === toggledItem.category.id) {
          return {
            ...cat,
            packed: packed ? cat.packed + 1 : cat.packed - 1,
          };
        }
        return cat;
      }),
    }));
    patchRequest(`/trips/${tripId}/packing/items/${id}/`, { packed });
  };

  const deletePacking = (id, tripId = defaultTripId) => {
    const deletedItem = packingItems.find((item) => item.id === id);
    setPackingItems(packingItems.filter((item) => item.id !== id));
    setStatistics((prev) => ({
      ...prev,
      total_items: prev.total_items - 1,
      packed_items: deletedItem.packed
        ? prev.packed_items - 1
        : prev.packed_items,
      category_stats: prev.category_stats
        .map((cat) => {
          if (cat.category.id === deletedItem.category.id) {
            return {
              ...cat,
              total: cat.total - 1,
              packed: deletedItem.packed ? cat.packed - 1 : cat.packed,
            };
          }
          return cat;
        })
        .filter((cat) => cat.total > 0),
    }));
    deleteRequest(`/trips/${tripId}/packing/items/${id}/`);
  };

  useEffect(() => {
    fetchCategories();
    fetchStatistics(defaultTripId);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchStatistics(defaultTripId);
    fetchPackingItems(defaultTripId).finally(() => setIsLoading(false));
  }, [updatePackingItems, selectedCategory]);

  return (
    <PackingItemsContext.Provider
      value={{
        error,
        isLoading,
        packingItems,
        selectedCategory,
        categories,
        statistics,
        updatePackingItems,
        setError,
        setPackingItems,
        createPacking,
        togglePacking,
        deletePacking,
        setStatistics,
        setSelectedCategory,
        fetchCategories,
        fetchStatistics,
        triggerUpdatePackingItems,
      }}
    >
      {children}
    </PackingItemsContext.Provider>
  );
};
