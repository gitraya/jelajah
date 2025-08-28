import { IS_DEVELOPMENT } from "@/configs";
import { getAPIData, postAPIData, putAPIData } from "@/lib/utils";

import { useAuth } from "./useAuth";

export const useApi = () => {
  const { checkAuth } = useAuth();

  const getRequest = async (endpoint, config) => {
    try {
      const response = await getAPIData(endpoint, config);
      return response;
    } catch (error) {
      if (error.response.status === 401) {
        const refreshSuccess = await refreshToken();

        if (refreshSuccess) {
          return getRequest(endpoint, config);
        }
      }
      throw error;
    }
  };

  const postRequest = async (endpoint, data, config) => {
    try {
      const response = await postAPIData(endpoint, data, config);
      return response;
    } catch (error) {
      if (error.response.status === 401) {
        const refreshSuccess = await refreshToken();

        if (refreshSuccess) {
          return postRequest(endpoint, data, config);
        }
      }
      throw error;
    }
  };

  const putRequest = async (endpoint, data, config) => {
    try {
      const response = await putAPIData(endpoint, data, config);
      return response;
    } catch (error) {
      if (error.response.status === 401) {
        const refreshSuccess = await refreshToken();

        if (refreshSuccess) {
          return putRequest(endpoint, data, config);
        }
      }
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      await postAPIData("/auth/token/refresh/");
      await checkAuth();
      return true;
    } catch (error) {
      if (IS_DEVELOPMENT) {
        console.error("Token refresh error:", error);
      }
      return false;
    }
  };

  return { getRequest, postRequest, putRequest };
};
