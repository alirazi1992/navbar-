// /src/labels.js
export const fa = {
  roles: {
    admin: "مدیر",
    client: "مشتری",
  },
  vesselStatus: {
    ACTIVE: "فعال",
    DOCKED: "پهلـوگرفته",
    UNDER_REVIEW: "در بررسی",
    IN_MAINTENANCE: "در تعمیرات",
    IN_PROGRESS: "در حال انجام",
    OPEN: "باز",
    RESOLVED: "حل‌شده",
    CLOSED: "بسته‌شده",
  },
  incidentSeverity: {
    CRITICAL: "بحرانی",
    HIGH: "بالا",
    MEDIUM: "متوسط",
    LOW: "پایین",
  },
  seaState: {
    CALM: "آرام",
    MODERATE: "متوسط",
    ROUGH: "متلاطم",
  },
  publishStatus: {
    PUBLISHED: "منتشرشده",
    DRAFT: "پیش‌نویس",
    ARCHIVED: "بایگانی‌شده",
    SENT: "ارسال‌شده",
    QUEUED: "در صف",
  },
  audience: {
    All: "همه",
    Admin: "مدیر",
    Client: "مشتری",
  },
  table: {
    actions: "اقدامات",
    updated: "به‌روزشده",
    sent: "ارسال‌شده",
    scheduled: "زمان‌بندی",
    region: "ناحیه",
    status: "وضعیت",
    severity: "شدت",
    priority: "اولویت",
    audience: "مخاطب",
    category: "دسته‌بندی",
    title: "عنوان",
    author: "نویسنده",
    tags: "برچسب‌ها",
    name: "نام",
    type: "نوع",
    destination: "مقصد",
    speed: "سرعت",
    position: "موقعیت",
  },
};

export function toFa(mapName, value) {
  const maps = {
    roles: fa.roles,
    vesselStatus: fa.vesselStatus,
    incidentSeverity: fa.incidentSeverity,
    seaState: fa.seaState,
    publishStatus: fa.publishStatus,
    audience: fa.audience,
  };
  const m = maps[mapName] || {};
  return m[value] || value;
}
