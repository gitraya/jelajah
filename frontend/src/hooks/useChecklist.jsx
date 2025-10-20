import { createContext, useContext } from "react";

export const ChecklistContext = createContext(null);

export const useChecklist = () => {
  const context = useContext(ChecklistContext);
  if (!context) {
    throw new Error("useChecklist must be used within an ChecklistProvider");
  }
  return context;
};
