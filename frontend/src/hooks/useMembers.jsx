import { createContext, useContext } from "react";

export const MembersContext = createContext(null);

export const useMembers = () => {
  const context = useContext(MembersContext);
  if (!context) {
    throw new Error("useMembers must be used within a MembersProvider");
  }
  return context;
};
