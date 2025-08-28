import axios from "axios";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { IS_DEVELOPMENT } from "@/configs";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.withCredentials = true;

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getAuthConfig() {
  return {
    withCredentials: true,
  };
}

export async function getAPIData(endpoint, config) {
  try {
    const response = await axios.get(endpoint, config);
    return response;
  } catch (error) {
    if (IS_DEVELOPMENT) {
      console.error("Error fetching data from API:", error);
    }
    throw error;
  }
}

export async function postAPIData(endpoint, data, config) {
  try {
    const response = await axios.post(endpoint, data, config);
    return response;
  } catch (error) {
    if (IS_DEVELOPMENT) {
      console.error("Error posting data to API:", error);
    }
    throw error;
  }
}

export async function putAPIData(endpoint, data, config) {
  try {
    const response = await axios.put(endpoint, data, config);
    return response;
  } catch (error) {
    if (IS_DEVELOPMENT) {
      console.error("Error updating data to API:", error);
    }
    throw error;
  }
}

export const validator = {
  required: { value: true, message: "Required field" },
  isRequired: (value) => ({ value: value, message: "Required field" }),
  pattern: (pattern) => ({ value: pattern, message: `Invalid format` }),
  url: {
    value:
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
    message: `Invalid URL format`,
  },
  username: {
    value: /^[a-zA-Z0-9_]{3,30}$/,
    message: `Username must be 3-30 characters long and can only contain letters, numbers, and underscores`,
  },
  password: {
    value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
    message: `Password must be at least 8 characters long and contain at least one letter, one number, and one special character`,
  },
  email: {
    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
    message: `Invalid email format`,
  },
  phone: {
    // international phone number regex
    value: /^((\+\d{2}|0)(\d{2,3}))[ .-]?\d{1,4}[ .-]?\d{2,4}[ .-]?\d{2,4}/i,
    message: `Invalid phone format. Use + country code (e.g., +62) at the beginning for non-local numbers`,
  },
  min: (min) => ({ value: min, message: `Must be at least $${min}` }),
  max: (max) => ({ value: max, message: `Must not exceed $${max}` }),
  minAndFree: (min) => ({
    value: min,
    message: `Must be at least $${min} or 0 for free`,
  }),
  minLength: (min) => ({
    value: min,
    message: `Must contain at least ${min} characters`,
  }),
  maxLength: (max) => ({
    value: max,
    message: `Must not exceed ${max} characters`,
  }),
};

export const getErrorMessage = (error) => {
  let errorMessage = "Something went wrong";
  if (error.response?.data) {
    const [field, messages] = Object.entries(error.response.data)[0];
    const capitalizedField = field.charAt(0).toUpperCase() + field.slice(1);
    errorMessage = `${capitalizedField}: ${messages.join(", ")}`;
  }
  return errorMessage;
};
