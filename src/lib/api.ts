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
    if (error.response?.status === 401) {
      // Allow pages like dashboard to render demo/offline preview rather than blank bounce
      const isMutating = error.config?.method && ['post', 'put', 'patch', 'delete'].includes(error.config.method.toLowerCase());
      if (isMutating && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/signup') {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }


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
