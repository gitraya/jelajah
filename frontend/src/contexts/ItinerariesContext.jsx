import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

import { useApi } from "@/hooks/useApi";
import { ItinerariesContext } from "@/hooks/useItineraries";
import { getAPIData, getErrorMessage } from "@/lib/utils";

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
  const [updateItineraries, setUpdateItineraries] = useState(Math.random());

  // Function to trigger re-fetching itinerary
  const triggerUpdateItineraries = () => setUpdateItineraries(Math.random());

  const fetchTypes = async () => {
    try {
      const response = await getAPIData("/itineraries/types/");
      setTypes([{ id: "all", name: "All" }, ...response.data]);
      return [{ id: "all", name: "All" }, ...response.data];
    } catch (error) {
      console.error("Failed to fetch itinerary types:", getErrorMessage(error));
    }
  };

  const fetchStatistics = async (tripId) => {
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
    }
  };

  const fetchLocations = async (tripId) => {
    try {
      const search = new URLSearchParams();
      if (selectedStatus !== "all") {
        search.append("status", selectedStatus);
      }
      if (selectedType !== "all") {
        search.append("type_id", selectedType);
      }
      const response = await getRequest(
        `/trips/${tripId}/itineraries/items${
          search.toString() ? `?${search.toString()}` : ""
        }`
      );
      setLocations(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch locations:", getErrorMessage(error));
      return [];
    }
  };

  const fetchItineraries = async (tripId) => {
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
  };

  const createItinerary = async (data, tripId = defaultTripId) => {
    try {
      setError("");
      const response = await postRequest(
        `/trips/${tripId}/itineraries/items/`,
        data
      );

      fetchItineraries(tripId);

      setLocations((prev) => [...prev, response.data]);
      setStatistics((prev) => ({
        ...prev,
        total: prev.total + 1,
        planned:
          response.data.status === "planned" ? prev.planned + 1 : prev.planned,
        visited:
          response.data.status === "visited" ? prev.visited + 1 : prev.visited,
        skipped:
          response.data.status === "skipped" ? prev.skipped + 1 : prev.skipped,
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
  };

  const deleteLocation = (id, tripId = defaultTripId) => {
    const deletedLocation = locations.find((location) => location.id === id);
    setLocations(locations.filter((location) => location.id !== id));
    setLocations(itineraries.filter((location) => location.id !== id));
    setStatistics((prev) => ({
      ...prev,
      total: prev.total - 1,
      planned:
        deletedLocation.status === "planned" ? prev.planned - 1 : prev.planned,
      visited:
        deletedLocation.status === "visited" ? prev.visited - 1 : prev.visited,
      skipped:
        deletedLocation.status === "skipped" ? prev.skipped - 1 : prev.skipped,
    }));
    deleteRequest(`/trips/${tripId}/itineraries/items/${id}/`);
  };

  // : 'planned' | 'visited' | 'skipped'
  const updateStatus = (id, status, tripId = defaultTripId) => {
    setLocations(
      locations.map((location) =>
        location.id === id ? { ...location, status } : location
      )
    );
    setLocations(
      itineraries
        .map((location) =>
          location.id === id ? { ...location, status } : location
        )
        .filter((location) => location.status !== "skipped")
    );
    setStatistics((prev) => {
      const location = locations.find((loc) => loc.id === id);
      let { planned, visited, skipped } = prev;

      // Decrement old status count
      if (location.status === "planned") planned -= 1;
      else if (location.status === "visited") visited -= 1;
      else if (location.status === "skipped") skipped -= 1;

      // Increment new status count
      if (status === "planned") planned += 1;
      else if (status === "visited") visited += 1;
      else if (status === "skipped") skipped += 1;

      return {
        ...prev,
        planned,
        visited,
        skipped,
      };
    });
    patchRequest(`/trips/${tripId}/itineraries/items/${id}/`, { status });
  };

  useEffect(() => {
    fetchTypes();
    fetchStatistics(defaultTripId);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchStatistics(defaultTripId);
    fetchItineraries(defaultTripId);
    fetchLocations(defaultTripId).finally(() => setIsLoading(false));
  }, [updateItineraries, selectedType, selectedStatus]);

  return (
    <ItinerariesContext.Provider
      value={{
        error,
        isLoading,
        itineraries,
        locations,
        types,
        statistics,
        updateItineraries,
        selectedType,
        selectedStatus,
        setError,
        setItineraries,
        setSelectedType,
        setSelectedStatus,
        createItinerary,
        deleteLocation,
        updateStatus,
        setStatistics,
        fetchTypes,
        fetchStatistics,
        triggerUpdateItineraries,
      }}
    >
      {children}
    </ItinerariesContext.Provider>
  );
};
