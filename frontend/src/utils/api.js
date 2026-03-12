const trimTrailingSlash = (value) => value.replace(/\/$/, "");

const getDefaultApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return "http://127.0.0.1:8000";
  }

  const { protocol, hostname, port, origin } = window.location;

  if (port === "3000") {
    const resolvedHost = hostname === "localhost" ? "127.0.0.1" : hostname;
    return `${protocol}//${resolvedHost}:8000`;
  }

  return origin;
};

export const API_BASE_URL = trimTrailingSlash(
  process.env.REACT_APP_API_BASE_URL || getDefaultApiBaseUrl()
);

export const apiUrl = (path) => `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;