import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";

import { useApi } from "@/hooks/useApi";
import { TripContext } from "@/hooks/useTrip";
import { getErrorMessage } from "@/lib/utils";

export const TripProvider = ({ children }) => {
  const { id: defaultTripId } = useParams();
  const { getRequest } = useApi();
  const [itinerarySummary, setItinerarySummary] = useState([]);

  const fetchItinerarySummary = useCallback(async (tripId) => {
    try {
      const response = await getRequest(
        `/trips/${tripId}/itineraries/summary/`
      );
      setItinerarySummary(response.data || []);
      return response.data;
    } catch (error) {
      console.error(
        "Failed to fetch itinerary summary:",
        getErrorMessage(error)
      );
      return [];
    }
  }, []);

  useEffect(() => {
    if (!defaultTripId) return;
    fetchItinerarySummary(defaultTripId);
  }, []);

  return (
    <TripContext.Provider value={{ itinerarySummary }}>
      {children}
    </TripContext.Provider>
  );
};
