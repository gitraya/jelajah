import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useApi } from "@/hooks/useApi";
import { ChecklistContext } from "@/hooks/useChecklist";
import { getErrorMessage } from "@/lib/utils";

const updateCategoryStats = (prevStats, item, operation) => {
  const categoryStats = [...prevStats.category_stats];
  const categoryIndex = categoryStats.findIndex(
    (cat) => cat.category === item.category
  );

  if (operation === "add") {
    if (categoryIndex >= 0) {
      categoryStats[categoryIndex] = {
        ...categoryStats[categoryIndex],
        total: categoryStats[categoryIndex].total + 1,
      };
    } else {
      categoryStats.push({ category: item.category, total: 1, completed: 0 });
    }
  } else if (operation === "remove") {
    if (categoryIndex >= 0) {
      categoryStats[categoryIndex] = {
        ...categoryStats[categoryIndex],
        total: categoryStats[categoryIndex].total - 1,
        completed: item.is_completed
          ? categoryStats[categoryIndex].completed - 1
          : categoryStats[categoryIndex].completed,
      };
    }
  }

  return categoryStats.filter((cat) => cat.total > 0);
};

export const ChecklistProvider = ({ children }) => {
  const { id: defaultTripId } = useParams();
  const { getRequest, patchRequest, deleteRequest, postRequest } = useApi();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checklistItems, setChecklistItems] = useState([]);
  const [upcomingChecklistItems, setUpcomingChecklistItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statistics, setStatistics] = useState({});

  const fetchStatistics = useCallback(async (tripId) => {
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
      return {};
    }
  }, []);

  const fetchChecklistItems = useCallback(
    async (tripId) => {
      try {
        const queryParams =
          selectedCategory !== "all" ? `?category=${selectedCategory}` : "";
        const response = await getRequest(
          `/trips/${tripId}/checklist/items${queryParams}`
        );
        setChecklistItems(response.data);
        return response.data;
      } catch (error) {
        console.error(
          "Failed to fetch checklist items:",
          getErrorMessage(error)
        );
        return [];
      }
    },
    [selectedCategory]
  );

  const fetchUpcomingChecklistItems = useCallback(async (tripId) => {
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
  }, []);

  const createChecklist = useCallback(async (data, tripId = defaultTripId) => {
    try {
      setError(null);
      const response = await postRequest(
        `/trips/${tripId}/checklist/items/`,
        data
      );

      setChecklistItems((prev) =>
        [response.data, ...prev].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )
      );
      setStatistics((prev) => ({
        ...prev,
        total_items: prev.total_items + 1,
        category_stats: updateCategoryStats(prev, response.data, "add"),
      }));

      if (new Date(response.data.due_date) >= new Date()) {
        setUpcomingChecklistItems((prev) =>
          [response.data, ...prev].sort(
            (a, b) => new Date(a.due_date) - new Date(b.due_date)
          )
        );
      }

      return response.data;
    } catch (error) {
      const errorMsg = getErrorMessage(
        error,
        "An error occurred while creating the checklist item. Please try again later."
      );
      setError(errorMsg);
      throw error;
    }
  }, []);

  const toggleCompleted = useCallback(
    (id, tripId = defaultTripId) => {
      const toggledItem = checklistItems.find((item) => item.id === id);
      if (!toggledItem) return;

      const is_completed = !toggledItem.is_completed;

      setChecklistItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_completed } : item))
      );
      setUpcomingChecklistItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_completed } : item))
      );
      setStatistics((prev) => ({
        ...prev,
        completed_items: is_completed
          ? prev.completed_items + 1
          : prev.completed_items - 1,
        category_stats: prev.category_stats.map((cat) =>
          cat.category === toggledItem.category
            ? {
                ...cat,
                completed: is_completed ? cat.completed + 1 : cat.completed - 1,
              }
            : cat
        ),
      }));
      patchRequest(`/trips/${tripId}/checklist/items/${id}/`, { is_completed });
    },
    [checklistItems]
  );

  const deleteItem = useCallback(
    (id, tripId = defaultTripId) => {
      const deletedItem = checklistItems.find((item) => item.id === id);
      if (!deletedItem) return;

      setChecklistItems((prev) => prev.filter((item) => item.id !== id));
      setUpcomingChecklistItems((prev) =>
        prev.filter((item) => item.id !== id)
      );
      setStatistics((prev) => ({
        ...prev,
        total_items: prev.total_items - 1,
        completed_items: deletedItem.is_completed
          ? prev.completed_items - 1
          : prev.completed_items,
        category_stats: updateCategoryStats(prev, deletedItem, "remove"),
      }));
      deleteRequest(`/trips/${tripId}/checklist/items/${id}/`);
    },
    [checklistItems]
  );

  useEffect(() => {
    if (!defaultTripId) return;
    setIsLoading(true);
    Promise.all([
      fetchStatistics(defaultTripId),
      fetchUpcomingChecklistItems(defaultTripId),
      fetchChecklistItems(defaultTripId),
    ]).finally(() => setIsLoading(false));
  }, [selectedCategory]);

  return (
    <ChecklistContext.Provider
      value={{
        error,
        isLoading,
        checklistItems,
        upcomingChecklistItems,
        selectedCategory,
        statistics,
        setError,
        setSelectedCategory,
        createChecklist,
        deleteItem,
        toggleCompleted,
      }}
    >
      {children}
    </ChecklistContext.Provider>
  );
};
