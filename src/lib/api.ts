import axios, { AxiosError } from 'axios';
import { ApiError } from '@/types/api';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://ai-invoicing-and-billing-app-server.onrender.com/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Note: Allow calling services to handle 401 (either via offline fallback or user prompt)



    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    return Promise.reject({
      ...error,
      customMessage: message,
      details: error.response?.data?.errorDetails,
    });
  }
);

export default api;
