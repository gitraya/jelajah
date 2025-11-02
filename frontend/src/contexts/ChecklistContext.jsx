import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

import { useApi } from "@/hooks/useApi";
import { ChecklistContext } from "@/hooks/useChecklist";
import { getErrorMessage } from "@/lib/utils";

export const ChecklistProvider = ({ children }) => {
  const { id: defaultTripId } = useParams();
  const { getRequest, patchRequest, deleteRequest, postRequest } = useApi();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checklistItems, setChecklistItems] = useState([]);
  const [upcomingChecklistItems, setUpcomingChecklistItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statistics, setStatistics] = useState({});
  const [updateChecklistItems, setUpdateChecklistItems] = useState(
    Math.random()
  );

  // Function to trigger re-fetching of checklist items
  const triggerUpdateChecklist = () => {
    setUpdateChecklistItems(Math.random());
  };

  const fetchStatistics = async (tripId) => {
    try {
      const response = await getRequest(
        `/trips/${tripId}/checklist/statistics/`
      );
      setStatistics(response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Failed to fetch checklist statistics:",
        getErrorMessage(error)
      );
    }
  };

  const fetchChecklistItems = async (tripId) => {
    try {
      const response = await getRequest(
        `/trips/${tripId}/checklist/items${
          selectedCategory !== "all" ? `?category=${selectedCategory}` : ""
        }`
      );
      setChecklistItems(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch checklist items:", getErrorMessage(error));
      return [];
    }
  };

  const fetchUpcomingChecklistItems = async (tripId) => {
    try {
      const response = await getRequest(
        `/trips/${tripId}/checklist/items?upcoming=true`
      );
      setUpcomingChecklistItems(response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Failed to fetch upcoming checklist items:",
        getErrorMessage(error)
      );
      return [];
    }
  };

  const createChecklist = async (data, tripId = defaultTripId) => {
    try {
      setError("");
      const response = await postRequest(
        `/trips/${tripId}/checklist/items/`,
        data
      );

      fetchUpcomingChecklistItems(tripId);

      setChecklistItems((prev) =>
        [...prev, response.data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )
      );
      setStatistics((prev) => ({
        ...prev,
        total_items: prev.total_items + 1,
        category_stats: prev.category_stats.map((cat) => {
          const existingCategory = prev.category_stats.find(
            (cat) => cat.category?.id === response.data.category.id
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
              { category: response.data.category, total: 1, completed: 0 },
            ];
          }
        }),
      }));

      return response.data;
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "An error occurred while creating the checklist item. Please try again later."
        )
      );
      throw error;
    }
  };

  const toggleCompleted = (id, tripId = defaultTripId) => {
    const toggledItem = checklistItems.find((item) => item.id === id);
    const is_completed = !toggledItem.is_completed;
    setChecklistItems(
      checklistItems.map((item) =>
        item.id === id ? { ...item, is_completed } : item
      )
    );
    setStatistics((prev) => ({
      ...prev,
      completed_items: is_completed
        ? prev.completed_items + 1
        : prev.completed_items - 1,
      category_stats: prev.category_stats.map((cat) => {
        if (cat.category?.id === toggledItem.category.id) {
          return {
            ...cat,
            completed: is_completed ? cat.completed + 1 : cat.completed - 1,
          };
        }
        return cat;
      }),
    }));
    patchRequest(`/trips/${tripId}/checklist/items/${id}/`, {
      is_completed,
    });
  };

  const deleteItem = (id, tripId = defaultTripId) => {
    const deletedItem = checklistItems.find((item) => item.id === id);
    setChecklistItems(checklistItems.filter((item) => item.id !== id));
    setStatistics((prev) => ({
      ...prev,
      total_items: prev.total_items - 1,
      completed_items: deletedItem.is_completed
        ? prev.completed_items - 1
        : prev.completed_items,
      category_stats: prev.category_stats
        .map((cat) => {
          if (cat.category?.id === deletedItem.category.id) {
            return {
              ...cat,
              total: cat.total - 1,
              completed: deletedItem.is_completed
                ? cat.completed - 1
                : cat.completed,
            };
          }
          return cat;
        })
        .filter((cat) => cat.total > 0),
    }));
    deleteRequest(`/trips/${tripId}/checklist/items/${id}/`);
  };

  useEffect(() => {
    fetchStatistics(defaultTripId);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchStatistics(defaultTripId);
    fetchUpcomingChecklistItems(defaultTripId);
    fetchChecklistItems(defaultTripId).finally(() => setIsLoading(false));
  }, [updateChecklistItems, selectedCategory]);

  return (
    <ChecklistContext.Provider
      value={{
        error,
        checklistItems,
        upcomingChecklistItems,
        selectedCategory,
        isLoading,
        statistics,
        updateChecklistItems,
        createChecklist,
        deleteItem,
        toggleCompleted,
        setError,
        fetchChecklistItems,
        setSelectedCategory,
        setStatistics,
        fetchStatistics,
        triggerUpdateChecklist,
      }}
    >
      {children}
    </ChecklistContext.Provider>
  );
};
