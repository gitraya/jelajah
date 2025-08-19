import { getAPIData, postAPIData } from "@/lib/utils";

import { useAuth } from "./useAuth";

export const useApi = () => {
  const { checkAuth } = useAuth();

  const getRequest = async (endpoint, config) => {
    const response = await getAPIData(endpoint, config);

    // If we got a 401 Unauthorized, try to refresh the token
    if (response.status === 401) {
      const refreshSuccess = await refreshToken();

      if (refreshSuccess) {
        return getRequest(endpoint, config);
      } else {
        throw new Error("Authentication failed");
      }
    }

    return response;
  };

  const postRequest = async (endpoint, data, config) => {
    const response = await postAPIData(endpoint, data, config);

    // If we got a 401 Unauthorized, try to refresh the token
    if (response.status === 401) {
      const refreshSuccess = await refreshToken();

      if (refreshSuccess) {
        return postRequest(endpoint, data, config);
      } else {
        throw new Error("Authentication failed");
      }
    }

    return response;
  };

  const refreshToken = async () => {
    try {
      const response = await postAPIData("/auth/token/refresh");

      if (response.status === 200) {
        await checkAuth();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  };

  return { getRequest, postRequest };
};
