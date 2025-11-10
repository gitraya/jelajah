import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";

import { ITINERARY_STATUSES_ENUM } from "@/configs/itinerary";
import { useApi } from "@/hooks/useApi";
import { ItinerariesContext } from "@/hooks/useItineraries";
import { getAPIData, getErrorMessage } from "@/lib/utils";

const { SKIPPED } = ITINERARY_STATUSES_ENUM;

export const ItinerariesProvider = ({ children }) => {
  const { id: defaultTripId } = useParams();
  const { getRequest, deleteRequest, patchRequest, postRequest } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [types, setTypes] = useState([]);
  const [statistics, setStatistics] = useState({});

  const fetchTypes = useCallback(async () => {
    try {
      const response = await getAPIData("/itineraries/types/");
      const typesWithAll = [{ id: "all", name: "All" }, ...response.data];
      setTypes(typesWithAll);
      return typesWithAll;
    } catch (error) {
      console.error("Failed to fetch itinerary types:", getErrorMessage(error));
      return [];
    }
  }, []);

  const fetchStatistics = useCallback(async (tripId) => {
    try {
      const response = await getRequest(
        `/trips/${tripId}/itineraries/statistics/`
      );
      setStatistics(response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Failed to fetch itinerary statistics:",
        getErrorMessage(error)
      );
      return {};
    }
  }, []);

  const fetchLocations = useCallback(
    async (tripId) => {
      try {
        const params = new URLSearchParams();
        if (selectedStatus !== "all") params.append("status", selectedStatus);
        if (selectedType !== "all") params.append("type_id", selectedType);

        const queryString = params.toString();
        const response = await getRequest(
          `/trips/${tripId}/itineraries/items${
            queryString ? `?${queryString}` : ""
          }`
        );
        setLocations(response.data);
        return response.data;
      } catch (error) {
        console.error("Failed to fetch locations:", getErrorMessage(error));
        return [];
      }
    },
    [selectedStatus, selectedType]
  );

  const fetchItineraries = useCallback(async (tripId) => {
    try {
      const response = await getRequest(
        `/trips/${tripId}/itineraries/organized/`
      );
      setItineraries(response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Failed to fetch organized itineraries:",
        getErrorMessage(error)
      );
      return [];
    }
  }, []);

  const createItinerary = useCallback(async (data, tripId = defaultTripId) => {
    try {
      setError("");
      const response = await postRequest(
        `/trips/${tripId}/itineraries/items/`,
        data
      );

      setLocations((prev) => [...prev, response.data]);
      setItineraries((prev) =>
        [...prev, response.data].sort(
          (a, b) => new Date(a.visit_time) - new Date(b.visit_time)
        )
      );
      setStatistics((prev) => ({
        ...prev,
        total: prev.total + 1,
        [response.data.status]: (prev[response.data.status] || 0) + 1,
      }));

      return response.data;
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "An error occurred while creating the itinerary item. Please try again later."
        )
      );
      throw error;
    }
  }, []);

  const deleteLocation = useCallback(
    async (id, tripId = defaultTripId) => {
      const deletedLocation = locations.find((location) => location.id === id);
      if (!deletedLocation) return;

      setLocations((prev) => prev.filter((location) => location.id !== id));
      setItineraries((prev) => prev.filter((location) => location.id !== id));
      setStatistics((prev) => ({
        ...prev,
        total: prev.total - 1,
        [deletedLocation.status]: (prev[deletedLocation.status] || 1) - 1,
      }));

      deleteRequest(`/trips/${tripId}/itineraries/items/${id}/`);
    },
    [locations]
  );

  const updateStatus = useCallback(
    async (id, status, tripId = defaultTripId) => {
      const location = locations.find((loc) => loc.id === id);
      if (!location) return;

      const oldStatus = location.status;

      setLocations((prev) =>
        prev.map((loc) => (loc.id === id ? { ...loc, status } : loc))
      );
      setItineraries((prev) =>
        prev
          .map((loc) => (loc.id === id ? { ...loc, status } : loc))
          .filter((loc) => loc.status !== SKIPPED)
      );
      setStatistics((prev) => ({
        ...prev,
        [oldStatus]: (prev[oldStatus] || 1) - 1,
        [status]: (prev[status] || 0) + 1,
      }));

      patchRequest(`/trips/${tripId}/itineraries/items/${id}/`, {
        status,
      });
    },
    [locations]
  );

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    if (!defaultTripId) return;
    setIsLoading(true);
    Promise.all([
      fetchStatistics(defaultTripId),
      fetchItineraries(defaultTripId),
      fetchLocations(defaultTripId),
    ]).finally(() => setIsLoading(false));
  }, [selectedType, selectedStatus]);

  return (
    <ItinerariesContext.Provider
      value={{
        error,
        isLoading,
        itineraries,
        locations,
        selectedType,
        selectedStatus,
        types,
        statistics,
        setError,
        setSelectedType,
        setSelectedStatus,
        createItinerary,
        deleteLocation,
        updateStatus,
      }}
    >
      {children}
    </ItinerariesContext.Provider>
  );
};
