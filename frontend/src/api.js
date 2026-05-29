const VITE_API_URL = typeof import.meta !== "undefined" && import.meta.env
  ? import.meta.env.VITE_API_URL
  : undefined;
const REACT_APP_API_URL = process.env.REACT_APP_API_URL;
const API_URL = REACT_APP_API_URL || VITE_API_URL || "http://localhost:8000";

export const apiPath = (path) => `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
