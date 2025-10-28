import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { seedData } from "../data/seed-data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../data/db.json");
const buildRandomString = (length) => {
  const create = () =>
    (typeof randomUUID === "function"
      ? randomUUID().replace(/-/g, "")
      : Math.random().toString(36).slice(2)) || "";

  let buffer = create();
  while (buffer.length < length) {
    buffer += create();
  }
  return buffer.slice(0, length);
};

const createPrefixedId = (prefix, length) => `${prefix}-${buildRandomString(length)}`;

const deepClone = (value) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const todayStart = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const toIsoDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const ensureNumber = (value, fallback = 0) => {
  if (value == null || value === "") return fallback;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const primaryStatusOptions = new Set(["Active", "Locked", "Suspended"]);
const subStatusOptions = new Set(["Active", "Locked", "Suspended"]);

const normalizePrimaryPayload = (payload = {}) => ({
  name: payload.name?.trim() ?? "بدون نام",
  branchName: payload.branchName?.trim() ?? "—",
  nationalCode: payload.nationalCode?.trim() ?? "",
  phone: payload.phone?.trim() ?? "",
  email: payload.email?.trim()?.toLowerCase() ?? "",
  notes: payload.notes?.trim() ?? "",
  creditLimit: ensureNumber(payload.creditLimit, null),
  creditUsed: ensureNumber(payload.creditUsed, 0),
  creditDueDate: payload.creditDueDate ?? null,
  status: primaryStatusOptions.has(payload.status) ? payload.status : "Active",
});

const normalizeSubPayload = (payload = {}) => ({
  name: payload.name?.trim() ?? "کاربر بدون نام",
  nationalCode: payload.nationalCode?.trim() ?? "",
  role: payload.role?.trim() ?? "staff",
  phone: payload.phone?.trim() ?? "",
  email: payload.email?.trim()?.toLowerCase() ?? "",
  status: subStatusOptions.has(payload.status) ? payload.status : "Active",
});

async function ensureDatabaseFile() {
  try {
    await fs.access(DB_PATH);
    const raw = await fs.readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed.primaryUsers || !parsed.subUsers) {
      throw new Error("Database corrupted");
    }
    return parsed;
  } catch (error) {
    const seeded = deepClone(seedData);
    await fs.writeFile(DB_PATH, JSON.stringify(seeded, null, 2), "utf8");
    return seeded;
  }
}

async function writeDatabase(state) {
  await fs.writeFile(DB_PATH, JSON.stringify(state, null, 2), "utf8");
}

function evaluatePrimaryUserCredit(state, primaryId) {
  const primary = state.primaryUsers.find((item) => item.id === primaryId);
  if (!primary) return;
  const related = state.subUsers.filter((sub) => sub.primaryUserId === primaryId);

  const limit = primary.creditLimit == null ? null : Number(primary.creditLimit);
  const used = Number(primary.creditUsed ?? 0);
  const dueDate = primary.creditDueDate ? new Date(primary.creditDueDate) : null;
  const expired = dueDate ? dueDate.getTime() < todayStart().getTime() : false;
  const overLimit = limit != null ? used > limit : false;
  const shouldLock = Boolean(expired || overLimit);

  if (shouldLock) {
    primary.lockedByCredit = true;
    primary.status = "Locked";
    related.forEach((sub) => {
      sub.lockedByCredit = true;
      sub.status = "Locked";
    });
  } else if (primary.lockedByCredit) {
    primary.lockedByCredit = false;
    if (primary.status === "Locked") {
      primary.status = "Active";
    }
    related.forEach((sub) => {
      if (sub.lockedByCredit) {
        sub.lockedByCredit = false;
        if (sub.status === "Locked") {
          sub.status = "Active";
        }
      }
    });
  }
}

export async function createDataStore() {
  const state = await ensureDatabaseFile();

  const save = async () => {
    await writeDatabase(state);
  };

  const withPrimary = (includeSubUsers) => (primary) => {
    if (!includeSubUsers) return primary;
    const subUsers = state.subUsers
      .filter((sub) => sub.primaryUserId === primary.id)
      .map((sub) => deepClone(sub));
    return { ...primary, subUsers };
  };

  return {
    async listPrimaryUsers(includeSubUsers = false) {
      const sorted = [...state.primaryUsers].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return sorted.map((primary) => deepClone(withPrimary(includeSubUsers)(primary)));
    },

    async getPrimaryUser(id, includeSubUsers = false) {
      const primary = state.primaryUsers.find((item) => item.id === id);
      if (!primary) return null;
      return deepClone(withPrimary(includeSubUsers)(primary));
    },

    async createPrimaryUser(payload) {
      const now = new Date().toISOString();
      const base = normalizePrimaryPayload(payload);
      const record = {
        ...base,
        creditDueDate: base.creditDueDate ? toIsoDate(base.creditDueDate) : null,
        creditLimit: base.creditLimit,
        creditUsed: base.creditUsed,
        id: payload.id ?? createPrefixedId("pu", 10),
        lockedByCredit: false,
        createdAt: now,
        updatedAt: now,
      };
      state.primaryUsers.push(record);
      evaluatePrimaryUserCredit(state, record.id);
      await save();
      return this.getPrimaryUser(record.id, true);
    },

    async updatePrimaryUser(id, payload) {
      const primary = state.primaryUsers.find((item) => item.id === id);
      if (!primary) return null;
      const base = normalizePrimaryPayload(payload);
      Object.assign(primary, base, {
        creditDueDate: base.creditDueDate ? toIsoDate(base.creditDueDate) : null,
        creditLimit: base.creditLimit,
        creditUsed: base.creditUsed,
        updatedAt: new Date().toISOString(),
      });
      if (payload.status && !primaryStatusOptions.has(payload.status)) {
        primary.status = "Active";
      }
      evaluatePrimaryUserCredit(state, id);
      await save();
      return this.getPrimaryUser(id, true);
    },

    async createSubUser(primaryUserId, payload) {
      const primary = state.primaryUsers.find((item) => item.id === primaryUserId);
      if (!primary) {
        const error = new Error("Primary user not found");
        error.status = 404;
        throw error;
      }
      const now = new Date().toISOString();
      const base = normalizeSubPayload(payload);
      const record = {
        ...base,
        id: payload.id ?? createPrefixedId("su", 12),
        primaryUserId,
        lockedByCredit: Boolean(primary.lockedByCredit),
        createdAt: now,
        updatedAt: now,
      };
      if (record.lockedByCredit) {
        record.status = "Locked";
      }
      state.subUsers.push(record);
      evaluatePrimaryUserCredit(state, primaryUserId);
      await save();
      return deepClone(record);
    },

    async updateSubUser(id, payload) {
      const sub = state.subUsers.find((item) => item.id === id);
      if (!sub) return null;
      const base = normalizeSubPayload(payload);
      Object.assign(sub, base, {
        updatedAt: new Date().toISOString(),
      });
      if (payload.status && !subStatusOptions.has(payload.status)) {
        sub.status = "Active";
      }
      evaluatePrimaryUserCredit(state, sub.primaryUserId);
      await save();
      return deepClone(sub);
    },

    async getSubUser(id) {
      const sub = state.subUsers.find((item) => item.id === id);
      return sub ? deepClone(sub) : null;
    },

    async listSubUsers(primaryUserId) {
      return state.subUsers
        .filter((item) => item.primaryUserId === primaryUserId)
        .map((item) => deepClone(item));
    },

    async getSummary() {
      const totalPrimary = state.primaryUsers.length;
      const activePrimary = state.primaryUsers.filter((item) => item.status === "Active").length;
      const lockedPrimary = state.primaryUsers.filter((item) => item.status === "Locked").length;
      const totalSub = state.subUsers.length;
      const lockedSub = state.subUsers.filter((item) => item.status === "Locked").length;
      return {
        totalPrimary,
        activePrimary,
        lockedPrimary,
        totalSub,
        lockedSub,
      };
    },
  };
}
