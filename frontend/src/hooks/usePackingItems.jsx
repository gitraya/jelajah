import { createContext, useContext } from "react";

export const PackingItemsContext = createContext(null);

export const usePackingItems = () => {
  const context = useContext(PackingItemsContext);
  if (!context) {
    throw new Error(
      "usePackingItems must be used within a PackingItemsProvider"
    );
  }
  return context;
};
