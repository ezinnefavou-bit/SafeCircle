const BASE = "https://1-community-watch-api.vercel.app/api/v1";
export const TOKEN_KEY = "community_watch_token";


export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) 
}

export function storeToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
  
}

export function extractUser(payload) {
  return payload?.data?.user || payload?.user || payload?.data || null;
}

export function extractToken(payload) {
  return payload?.data?.token || payload?.data?.accessToken || payload?.token || payload?.accessToken || null;
}

export function unwrap(payload) {
  return payload?.data ?? payload ?? null;
}

export function extractList(payload, keys = []) {
  const data = unwrap(payload);
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
}

export async function apiFetch(path, options = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error("Unable to connect to the SafeCircle API. Check your internet connection and try again.");
  }

  let payload = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try { payload = await res.json(); } catch { payload = null; }
  } else {
    const text = await res.text();
    payload = text ? { message: text } : null;
  }

  if (!res.ok) {
    const message = payload?.message || payload?.error?.message || payload?.error || `Request failed with status ${res.status}`;
    const error = new Error(typeof message === "string" ? message : JSON.stringify(message));
    error.status = res.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}
