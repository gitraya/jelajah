import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

import { useApi } from "@/hooks/useApi";
import { ChecklistContext } from "@/hooks/useChecklist";
import { getErrorMessage } from "@/lib/utils";

export const ChecklistProvider = ({ children }) => {
  const { id } = useParams();
  const { getRequest } = useApi();
  const [statistics, setStatistics] = useState({});
  const [updateChecklist, setUpdateChecklist] = useState(Math.random());

  // Function to trigger re-fetching of checklist items
  const triggerUpdateChecklist = () => {
    setUpdateChecklist(Math.random());
  };

  const fetchStatistics = async (tripId) => {
    try {
      const response = await getRequest(
        `/trips/${tripId}/checklist/statistics/`
      );
      setStatistics(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch checklist statistics:",
        getErrorMessage(error)
      );
    }
  };

  useEffect(() => {
    fetchStatistics(id);
  }, []);

  return (
    <ChecklistContext.Provider
      value={{
        statistics,
        updateChecklist,
        setStatistics,
        fetchStatistics,
        triggerUpdateChecklist,
      }}
    >
      {children}
    </ChecklistContext.Provider>
  );
};
