const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiFetch = async (path: string, options?: RequestInit) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers, // Ensure we don't accidentally overwrite custom headers
    },
    ...options,
  });

  // Always parse the JSON so we can look at the 'message' or 'success' fields
  const data = await res.json();

  if (!res.ok) {
    // If the backend sent a message (e.g., from your DTO validation), use it.
    // Otherwise, fall back to "API Error".
    throw new Error(data.message || "API Error");
  }

  return data;
};
