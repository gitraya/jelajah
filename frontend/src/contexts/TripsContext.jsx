import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

import { useApi } from "@/hooks/useApi";
import { TripsContext } from "@/hooks/useTrips";
import { getErrorMessage } from "@/lib/utils";

export const TripsProvider = ({ children }) => {
  const { id } = useParams();
  const { getRequest } = useApi();
  const [members, setMembers] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [updateMembers, setUpdateMembers] = useState(Math.random());

  // Function to trigger re-fetching members
  const triggerUpdateMembers = () => {
    setUpdateMembers(Math.random());
  };

  const fetchMembers = async () => {
    try {
      const response = await getRequest(`/trips/${id}/members/`);
      setMembers(response.data || []);
    } catch (error) {
      console.error("Failed to fetch trip members:", getErrorMessage(error));
    }
  };

  const fetchStatistics = async (tripId) => {
    try {
      const response = await getRequest(`/trips/${tripId}/members/statistics/`);
      setStatistics(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch member statistics:",
        getErrorMessage(error)
      );
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchStatistics(id);
  }, []);

  return (
    <TripsContext.Provider
      value={{
        members,
        statistics,
        updateMembers,
        setStatistics,
        setMembers,
        fetchMembers,
        fetchStatistics,
        triggerUpdateMembers,
      }}
    >
      {children}
    </TripsContext.Provider>
  );
};
