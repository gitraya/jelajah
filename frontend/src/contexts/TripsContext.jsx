import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

import { useApi } from "@/hooks/useApi";
import { TripsContext } from "@/hooks/useTrips";
import { getErrorMessage } from "@/lib/utils";

export const TripsProvider = ({ children }) => {
  const { id: tripId } = useParams();
  const { getRequest } = useApi();
  const [updateMembers, setUpdateMembers] = useState(Math.random());
  const [members, setMembers] = useState([]);

  // Function to trigger re-fetching members
  const triggerUpdateMembers = () => {
    setUpdateMembers(Math.random());
  };

  const fetchMembers = async () => {
    try {
      const response = await getRequest(`/trips/${tripId}/members/`);
      setMembers(response.data || []);
    } catch (error) {
      console.error("Failed to fetch trip members:", getErrorMessage(error));
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <TripsContext.Provider
      value={{
        members,
        updateMembers,
        fetchMembers,
        triggerUpdateMembers,
      }}
    >
      {children}
    </TripsContext.Provider>
  );
};
