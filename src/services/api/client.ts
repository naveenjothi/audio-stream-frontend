import { getIdToken } from "@/lib/firebase";

// Service base URLs
const CATALOG_BASE_URL =
  import.meta.env.VITE_CATALOG_API_URL || "http://localhost:4000";
const SIGNALING_BASE_URL =
  import.meta.env.VITE_SIGNALING_API_URL || "http://localhost:4001";

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
}

interface ApiClient {
  get<T>(url: string, params?: Record<string, string>): Promise<ApiResponse<T>>;
  post<T>(url: string, body?: unknown): Promise<ApiResponse<T>>;
  put<T>(url: string, body?: unknown): Promise<ApiResponse<T>>;
  delete<T = void>(url: string): Promise<ApiResponse<T>>;
}

function createApiClient(baseURL: string): ApiClient {
  async function request<T>(
    url: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const token = await getIdToken();
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };
    // Don't set Content-Type for FormData — browser sets it with boundary
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseURL}${url}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      window.location.href = "/login";
      throw new Error("Unauthorized - redirecting to login");
    }

    if (response.status === 404) {
      return { data: { data: null } as T, status: 404 };
    }

    if (!response.ok) {
      throw new Error(
        `Request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data =
      response.status === 204
        ? (undefined as T)
        : ((await response.json()) as T);
    return { data, status: response.status };
  }

  return {
    get: <T>(url: string, params?: Record<string, string>) => {
      const query = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<T>(url + query);
    },
    post: <T>(url: string, body?: unknown) =>
      request<T>(url, {
        method: "POST",
        body:
          body instanceof FormData
            ? body
            : body !== undefined
              ? JSON.stringify(body)
              : undefined,
      }),
    put: <T>(url: string, body?: unknown) =>
      request<T>(url, {
        method: "PUT",
        body: body !== undefined ? JSON.stringify(body) : undefined,
      }),
    delete: <T = void>(url: string) => request<T>(url, { method: "DELETE" }),
  };
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
  promise: Promise<{ data: T; status: number }>,
): Promise<{ accepted: boolean; data?: T }> {
  const response = await promise;
  if (response.status === 202) {
    return { accepted: true, data: response.data };
  }
  return { accepted: false, data: response.data };
}
