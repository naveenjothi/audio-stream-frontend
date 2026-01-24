import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { getIdToken } from "@/lib/firebase";

// Service base URLs
const CATALOG_BASE_URL =
  process.env.NEXT_PUBLIC_CATALOG_API_URL || "http://localhost:4000";
const SIGNALING_BASE_URL =
  process.env.NEXT_PUBLIC_SIGNALING_API_URL || "http://localhost:4001";

// Create axios instance with interceptors
function createApiClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor: attach auth token
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await getIdToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: handle 401 and 404
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Redirect to login on unauthorized
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(new Error("Unauthorized - redirecting to login"));
      }

      if (error.response?.status === 404) {
        // Return null for 404s instead of throwing
        return Promise.resolve({ data: { data: null }, status: 404 });
      }

      return Promise.reject(error);
    }
  );

  return client;
}

// Export pre-configured clients
export const catalogClient = createApiClient(CATALOG_BASE_URL);
export const signalingClient = createApiClient(SIGNALING_BASE_URL);

// Helper to extract data from response
export function extractData<T>(response: { data: { data: T } }): T {
  return response.data.data;
}

// Helper for async endpoints (202 Accepted)
export async function handleAsyncEndpoint<T>(
  promise: Promise<{ data: T; status: number }>
): Promise<{ accepted: boolean; data?: T }> {
  const response = await promise;
  if (response.status === 202) {
    return { accepted: true, data: response.data };
  }
  return { accepted: false, data: response.data };
}
