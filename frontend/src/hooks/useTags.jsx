import { createContext, useContext } from "react";

export const TagsContext = createContext(null);

export const useTags = () => {
  const context = useContext(TagsContext);
  if (!context) {
    throw new Error("useTags must be used within a TagsProvider");
  }
  return context;
};
