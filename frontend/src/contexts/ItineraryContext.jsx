import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

import { useApi } from "@/hooks/useApi";
import { ItineraryContext } from "@/hooks/useItinerary";
import { getAPIData, getErrorMessage } from "@/lib/utils";

export const ItineraryProvider = ({ children }) => {
  const { id } = useParams();
  const { getRequest } = useApi();
  const [types, setTypes] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [updateItinerary, setUpdateItinerary] = useState(Math.random());

  // Function to trigger re-fetching itinerary
  const triggerUpdateItinerary = () => {
    setUpdateItinerary(Math.random());
  };

  const fetchCategories = async () => {
    try {
      const response = await getAPIData("/itinerary/types/");
      setTypes([{ id: "all", name: "All" }, ...response.data]);
    } catch (error) {
      console.error(
        "Failed to fetch itinerary categories:",
        getErrorMessage(error)
      );
    }
  };

  const fetchStatistics = async (tripId) => {
    try {
      const response = await getRequest(
        `/trips/${tripId}/itinerary/statistics/`
      );
      setStatistics(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch itinerary statistics:",
        getErrorMessage(error)
      );
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchStatistics(id);
  }, []);

  return (
    <ItineraryContext.Provider
      value={{
        types,
        statistics,
        updateItinerary,
        setStatistics,
        fetchCategories,
        fetchStatistics,
        triggerUpdateItinerary,
      }}
    >
      {children}
    </ItineraryContext.Provider>
  );
};
