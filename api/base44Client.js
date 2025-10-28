import {
  users as seedUsers,
  vessels as seedVessels,
  weatherReports as seedWeather,
  incidents as seedIncidents,
  articles as seedArticles,
  notifications as seedNotifications,
} from "@/data/mockData.js";

const STORAGE_PREFIX = "base44-demo";
const LATENCY_MS = 120;

const deepClone = (value) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const withLatency = async (value) => {
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
  return deepClone(value);
};

const loadFromStorage = (key, seed) => {
  if (typeof window === "undefined") {
    return seed.map((item) => ({ ...item }));
  }
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}:${key}`);
    if (!raw) {
      return seed.map((item) => ({ ...item }));
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 0) {
      return parsed;
    }
  } catch (error) {
    console.warn(`Failed to parse persisted ${key}`, error);
  }
  return seed.map((item) => ({ ...item }));
};

const persistToStorage = (key, records) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    `${STORAGE_PREFIX}:${key}`,
    JSON.stringify(records)
  );
};

const sortRecords = (records, order) => {
  if (!order) return [...records];
  const isDescending = order.startsWith("-");
  const key = isDescending ? order.slice(1) : order;
  return [...records].sort((a, b) => {
    const valueA = a?.[key];
    const valueB = b?.[key];
    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return 1;
    if (valueB == null) return -1;
    const comparison = valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    return isDescending ? -comparison : comparison;
  });
};

const matchesCriteria = (record, criteria = {}) =>
  Object.entries(criteria).every(([key, expected]) => {
    if (expected == null) return true;
    const value = record?.[key];
    if (Array.isArray(expected)) {
      return expected.includes(value);
    }
    if (typeof expected === "string") {
      return String(value).toLowerCase().includes(expected.toLowerCase());
    }
    if (typeof expected === "function") {
      return expected(value, record);
    }
    return value === expected;
  });

const createId = (prefix) => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
};

const createStore = (entityName, seed) => {
  let records = loadFromStorage(entityName, seed);

  const persist = () => persistToStorage(entityName, records);

  return {
    async list(order) {
      return withLatency(sortRecords(records, order ?? "-created_date"));
    },
    async filter(criteria = {}, order) {
      const filtered = records.filter((record) => matchesCriteria(record, criteria));
      return withLatency(sortRecords(filtered, order ?? "-created_date"));
    },
    async getById(id) {
      return withLatency(records.find((record) => record.id === id) ?? null);
    },
    async create(payload) {
      const record = {
        ...payload,
        id: payload.id ?? createId(entityName.slice(0, 3).toLowerCase()),
        created_date: payload.created_date ?? new Date().toISOString(),
      };
      records = [record, ...records];
      persist();
      return withLatency(record);
    },
    async update(id, patch) {
      let updatedRecord = null;
      records = records.map((record) => {
        if (record.id !== id) return record;
        updatedRecord = { ...record, ...patch, updated_date: new Date().toISOString() };
        return updatedRecord;
      });
      persist();
      return withLatency(updatedRecord);
    },
    async delete(id) {
      const existing = records.find((record) => record.id === id);
      records = records.filter((record) => record.id !== id);
      persist();
      return withLatency(existing ?? null);
    },
    _all() {
      return records;
    },
  };
};

const userStore = createStore("User", seedUsers);
const vesselStore = createStore("Vessel", seedVessels);
const weatherStore = createStore("Weather", seedWeather);
const incidentStore = createStore("Incident", seedIncidents);
const articleStore = createStore("Article", seedArticles);
const notificationStore = createStore("Notification", seedNotifications);

const SESSION_KEY = `${STORAGE_PREFIX}:sessionUserId`;

const loadInitialUserId = () => {
  if (typeof window === "undefined") return seedUsers[0]?.id ?? null;
  const stored = window.localStorage.getItem(SESSION_KEY);
  if (stored) return stored;
  const fallback = seedUsers[0]?.id ?? null;
  if (fallback) {
    window.localStorage.setItem(SESSION_KEY, fallback);
  }
  return fallback;
};

let currentUserId = loadInitialUserId();

const persistUserId = (id) => {
  if (typeof window === "undefined") return;
  if (!id) {
    window.localStorage.removeItem(SESSION_KEY);
  } else {
    window.localStorage.setItem(SESSION_KEY, id);
  }
};

export const base44 = {
  auth: {
    async me() {
      const user = (await userStore.getById(currentUserId)) ?? seedUsers[0] ?? null;
      return withLatency(user);
    },
    async login(identifier) {
      const allUsers = await userStore.list();
      const match = allUsers.find(
        (user) => user.email === identifier || user.id === identifier
      );
      if (!match) {
        throw new Error("Unable to find a user with those credentials.");
      }
      currentUserId = match.id;
      persistUserId(currentUserId);
      return withLatency(match);
    },
    async logout() {
      const clientFallback =
        (await userStore.list()).find((user) => user.role !== "admin") ?? null;
      currentUserId = clientFallback?.id ?? null;
      persistUserId(currentUserId);
      return withLatency(clientFallback);
    },
    async switchRole(role) {
      const allUsers = await userStore.list();
      const candidate = allUsers.find((user) => user.role === role);
      if (!candidate) {
        throw new Error(`No user available for role "${role}".`);
      }
      currentUserId = candidate.id;
      persistUserId(currentUserId);
      return withLatency(candidate);
    },
    async listUsers() {
      return userStore.list();
    },
  },
  entities: {
    User: userStore,
    Vessel: vesselStore,
    Weather: weatherStore,
    Incident: incidentStore,
    Article: articleStore,
    Notification: notificationStore,
  },
};
