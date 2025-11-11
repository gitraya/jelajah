import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";

import { useApi } from "@/hooks/useApi";
import { TripContext } from "@/hooks/useTrip";
import { getErrorMessage } from "@/lib/utils";

export const TripProvider = ({ children }) => {
  const { id: defaultTripId } = useParams();
  const { getRequest } = useApi();
  const [isLoading, setIsLoading] = useState(true);
  const [trip, setTrip] = useState(null);
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

  const fetchTripDetails = useCallback(async (tripId) => {
    setIsLoading(true);
    try {
      const response = await getRequest(`/trips/${tripId}/`);
      response.data.durationLabel = `${response.data.duration} ${
        response.data.duration > 1 ? "days" : "day"
      }`;
      const startDate = moment(response.data.start_date).format("MMM D");
      const endDate = moment(response.data.end_date).format("D, YYYY");
      response.data.dates = `${startDate}-${endDate}`;
      setTrip(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch trip details:", getErrorMessage(error));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!defaultTripId) return;
    fetchItinerarySummary(defaultTripId);
    fetchTripDetails(defaultTripId);
  }, []);

  return (
    <TripContext.Provider value={{ itinerarySummary, trip, isLoading }}>
      {children}
    </TripContext.Provider>
  );
};
