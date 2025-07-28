import axios from "axios";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export async function getAPIData(endpoint) {
  try {
    const response = await axios.get(`${API_URL}/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data from API:", error);
    throw error;
  }
}
