const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
    body: options.body && typeof options.body !== "string" ? JSON.stringify(options.body) : options.body,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data?.message) {
        message = data.message;
      }
    } catch (error) {
      // ignore json parse errors
    }
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const backendClient = {
  listPrimaryUsers: (options = {}) =>
    request(`/primary-users${options.includeSubUsers ? "?includeSubUsers=true" : ""}`),
  getPrimaryUser: (id, options = {}) =>
    request(`/primary-users/${id}${options.includeSubUsers ? "?includeSubUsers=true" : ""}`),
  createPrimaryUser: (payload) => request("/primary-users", { method: "POST", body: payload }),
  updatePrimaryUser: (id, payload) => request(`/primary-users/${id}`, { method: "PATCH", body: payload }),
  createSubUser: (primaryUserId, payload) =>
    request(`/primary-users/${primaryUserId}/sub-users`, { method: "POST", body: payload }),
  updateSubUser: (id, payload) => request(`/sub-users/${id}`, { method: "PATCH", body: payload }),
  listSubUsers: (primaryUserId) => request(`/primary-users/${primaryUserId}/sub-users`),
  getSummary: () => request("/summary"),
};
