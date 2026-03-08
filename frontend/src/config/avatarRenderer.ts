function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function defaultLocalRendererUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  const isLocalHost =
    window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";

  return isLocalHost ? "http://127.0.0.1:8788" : "";
}

const configuredBaseUrl =
  import.meta.env.VITE_AVATAR_RENDERER_URL?.trim() || defaultLocalRendererUrl();

export const AVATAR_RENDERER = {
  baseUrl: normalizeBaseUrl(configuredBaseUrl),
  isConfigured: Boolean(configuredBaseUrl),
} as const;
