import { createContext, useContext } from "react";

export const ItinerariesContext = createContext(null);

export const useItineraries = () => {
  const context = useContext(ItinerariesContext);
  if (!context) {
    throw new Error(
      "useItineraries must be used within an ItinerariesProvider"
    );
  }
  return context;
};
