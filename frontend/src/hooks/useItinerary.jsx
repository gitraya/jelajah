import { createContext, useContext } from "react";

export const ItineraryContext = createContext(null);

export const useItinerary = () => {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error("useItinerary must be used within an ItineraryProvider");
  }
  return context;
};
