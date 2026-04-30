import { getAuthToken } from "./authSession";

const API_BASE_URL = "https://retailx-jzy5.onrender.com";
const responseCache = new Map<string, { expiresAt: number; data: unknown }>();
const pendingRequests = new Map<string, Promise<unknown>>();
const GET_CACHE_TTL_MS = 30 * 1000;

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, any>;
  auth?: boolean;
};

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, auth = true }: ApiOptions = {}
): Promise<T> {
  const cacheKey = `${method}:${path}`;
  const now = Date.now();

  if (method === "GET") {
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.data as T;
    }

    const pending = pendingRequests.get(cacheKey);
    if (pending) {
      return pending as Promise<T>;
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const requestStart = Date.now();
  console.log("API request start:", method, path);

  const executeRequest = async () => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    console.log("API request end:", method, path, Date.now() - requestStart, "ms");

    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || "Something went wrong");
    }

    if (method === "GET") {
      responseCache.set(cacheKey, {
        expiresAt: now + GET_CACHE_TTL_MS,
        data,
      });
    } else {
      responseCache.clear();
    }

    return data as T;
  };

  if (method !== "GET") {
    return executeRequest();
  }

  const requestPromise = executeRequest().finally(() => {
    pendingRequests.delete(cacheKey);
  });

  pendingRequests.set(cacheKey, requestPromise);

  return requestPromise;
}
