import React, { useCallback, useEffect, useState } from "react";

import { useApi } from "@/hooks/useApi";
import { TagsContext } from "@/hooks/useTags";
import { getErrorMessage } from "@/lib/utils";

export const TagsProvider = ({ children }) => {
  const [tags, setTags] = useState([]);
  const { getRequest } = useApi();

  const fetchTags = useCallback(async () => {
    try {
      const response = await getRequest("/tags/");
      setTags(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch tags:", getErrorMessage(error));
      return [];
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <TagsContext.Provider value={{ tags }}>{children}</TagsContext.Provider>
  );
};
