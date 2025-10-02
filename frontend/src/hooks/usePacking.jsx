import { createContext, useContext } from "react";

export const PackingContext = createContext(null);

export const usePacking = () => {
  const context = useContext(PackingContext);
  if (!context) {
    throw new Error("usePacking must be used within a PackingProvider");
  }
  return context;
};
