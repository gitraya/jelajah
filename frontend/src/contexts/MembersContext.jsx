import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { TRIP_MEMBER_STATUSES } from "@/configs/trip";
import { useApi } from "@/hooks/useApi";
import { MembersContext } from "@/hooks/useMembers";
import { getErrorMessage } from "@/lib/utils";

export const MembersProvider = ({ children }) => {
  const { id: defaultTripId } = useParams();
  const { getRequest, patchRequest, deleteRequest, postRequest } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  const [acceptedMembers, setAcceptedMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [statistics, setStatistics] = useState({});

  const fetchMembers = useCallback(async (tripId) => {
    try {
      const response = await getRequest(`/trips/${tripId}/members/items/`);
      setMembers(response.data || []);
      setAcceptedMembers(
        (response.data || []).filter(
          (member) => member.status === Object.keys(TRIP_MEMBER_STATUSES)[0]
        )
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch trip members:", getErrorMessage(error));
      return [];
    }
  }, []);

  const fetchFilteredMembers = useCallback(
    async (tripId) => {
      try {
        const response = await getRequest(
          `/trips/${tripId}/members/items/${
            selectedStatus !== "all" ? `?status=${selectedStatus}` : ""
          }`
        );
        setFilteredMembers(response.data || []);
        return response.data;
      } catch (error) {
        console.error("Failed to fetch trip members:", getErrorMessage(error));
        return [];
      }
    },
    [selectedStatus]
  );

  const fetchStatistics = useCallback(async (tripId) => {
    try {
      const response = await getRequest(`/trips/${tripId}/members/statistics/`);
      setStatistics(response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Failed to fetch member statistics:",
        getErrorMessage(error)
      );
      return {};
    }
  }, []);

  const createMember = useCallback(
    async (data, tripId = defaultTripId) => {
      try {
        setError("");
        const response = await postRequest(
          `/trips/${tripId}/members/items/`,
          data
        );

        setMembers((prev) => [...prev, response.data]);
        setStatistics((prev) => ({
          ...prev,
          total: prev.total + 1,
          [response.data.status.toLowerCase()]:
            (prev[response.data.status.toLowerCase()] || 0) + 1,
        }));

        if (
          selectedStatus === "all" ||
          selectedStatus === response.data.status
        ) {
          setFilteredMembers((prev) => [...prev, response.data]);
        }

        return response.data;
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "An error occurred while creating the member. Please try again later."
          )
        );
        throw error;
      }
    },
    [selectedStatus]
  );

  const deleteMember = useCallback(
    (id, tripId = defaultTripId) => {
      const member = members.find((m) => m.id === id);
      if (!member) return;

      setMembers((prev) => prev.filter((m) => m.id !== id));
      setFilteredMembers((prev) => prev.filter((m) => m.id !== id));
      setStatistics((prev) => ({
        ...prev,
        total: prev.total - 1,
        [member.status.toLowerCase()]:
          (prev[member.status.toLowerCase()] || 0) - 1,
      }));
      deleteRequest(`/trips/${tripId}/members/items/${id}/`);
    },
    [members]
  );

  const updateMember = useCallback(
    async (id, data, tripId = defaultTripId) => {
      try {
        const member = members.find((m) => m.id === id);
        if (!member || Object.keys(data).length === 0) return;
        setError("");

        setMembers((prev) =>
          prev.map((m) => (m.id === id ? { ...m, ...data } : m))
        );
        setFilteredMembers((prev) =>
          prev.map((m) => (m.id === id ? { ...m, ...data } : m))
        );
        if (data.status && data.status !== member.status) {
          setStatistics((prev) => ({
            ...prev,
            [member.status.toLowerCase()]:
              (prev[member.status.toLowerCase()] || 0) - 1,
            [data.status.toLowerCase()]:
              (prev[data.status.toLowerCase()] || 0) + 1,
          }));
        }
        await patchRequest(`/trips/${tripId}/members/items/${id}/`, data);
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            "An error occurred while updating the member. Please try again later."
          )
        );
        throw error;
      }
    },
    [members]
  );

  useEffect(() => {
    if (!defaultTripId) return;
    fetchFilteredMembers(defaultTripId);
  }, [selectedStatus]);

  useEffect(() => {
    if (!defaultTripId) return;
    setIsLoading(true);
    Promise.all([
      fetchStatistics(defaultTripId),
      fetchMembers(defaultTripId),
    ]).finally(() => setIsLoading(false));
  }, []);

  return (
    <MembersContext.Provider
      value={{
        isLoading,
        error,
        members,
        acceptedMembers,
        filteredMembers,
        selectedStatus,
        statistics,
        createMember,
        deleteMember,
        updateMember,
        setSelectedStatus,
        setError,
      }}
    >
      {children}
    </MembersContext.Provider>
  );
};
