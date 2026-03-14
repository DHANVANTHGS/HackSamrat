const STORAGE_KEY = "hv_app_session";

const getApiBaseUrl = () => process.env.REACT_APP_API_BASE_URL || "https://mediledger-wdpu.onrender.com/api/v1";

const parseJsonSafely = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
};

const buildHeaders = ({ token, headers, body }) => {
  const nextHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (token) {
    nextHeaders.Authorization = `Bearer ${token}`;
  }

  if (body && !(body instanceof FormData) && !nextHeaders["Content-Type"]) {
    nextHeaders["Content-Type"] = "application/json";
  }

  return nextHeaders;
};

export async function apiRequest(path, { method = "GET", token, body, headers, signal } = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers: buildHeaders({ token, headers, body }),
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    signal,
  });

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || payload?.data?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload?.data ?? payload;
}

export function saveSession(session) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export async function downloadFile(path, { token, filename } = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "download";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export { getApiBaseUrl };
