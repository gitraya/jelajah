import moment from "moment";
import React, { useCallback, useState } from "react";

import { useApi } from "@/hooks/useApi";
import { TripsContext } from "@/hooks/useTrips";
import { getErrorMessage } from "@/lib/utils";

export const TripsProvider = ({ children }) => {
  const { getRequest } = useApi();
  const [publicTrips, setPublicTrips] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [tripsStatistics, setTripsStatistics] = useState({});

  const fetchTripsStatistics = useCallback(async () => {
    try {
      const response = await getRequest(`/trips/statistics/`);
      setTripsStatistics(response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Failed to fetch trips statistics:",
        getErrorMessage(error)
      );
      return {};
    }
  }, []);

  const fetchPublicTrips = useCallback(async (queryString) => {
    try {
      const response = await getRequest(
        `/trips/?is_public=true&${queryString}`
      );
      const tripsWithLabels = response.data.map((trip) => {
        trip.duration_label = `${trip.duration} ${
          trip.duration > 1 ? "days" : "day"
        }`;
        const startDate = moment(trip.start_date).format("MMM D");
        const endDate = moment(trip.end_date).format("D, YYYY");
        trip.dates = `${startDate}-${endDate}`;
        return trip;
      });
      setPublicTrips(tripsWithLabels);
      return tripsWithLabels;
    } catch (error) {
      console.error("Failed to fetch public trips:", getErrorMessage(error));
      return [];
    }
  }, []);

  const fetchMyTrips = useCallback(async () => {
    try {
      const response = await getRequest(`/trips/`);
      const tripsWithLabels = response.data.map((trip) => {
        trip.duration_label = `${trip.duration} ${
          trip.duration > 1 ? "days" : "day"
        }`;
        const startDate = moment(trip.start_date).format("MMM D");
        const endDate = moment(trip.end_date).format("D, YYYY");
        trip.dates = `${startDate}-${endDate}`;
        return trip;
      });
      setMyTrips(tripsWithLabels);
      return tripsWithLabels;
    } catch (error) {
      console.error("Failed to fetch my trips:", getErrorMessage(error));
      return [];
    }
  }, []);

  return (
    <TripsContext.Provider
      value={{
        publicTrips,
        fetchPublicTrips,
        myTrips,
        setMyTrips,
        fetchMyTrips,
        tripsStatistics,
        fetchTripsStatistics,
      }}
    >
      {children}
    </TripsContext.Provider>
  );
};
