const pageRoutes = {
  AdminDashboard: "/admin",
  UsersManagement: "/admin/users",
  VesselsManagement: "/admin/vessels",
  EnvironmentalData: "/admin/environment",
  IncidentsManagement: "/admin/incidents",
  ContentManagement: "/admin/content",
  NotificationsManagement: "/admin/notifications",
  ClientDashboard: "/client",
  MyVessels: "/client/vessels",
  MapRadar: "/client/map",
  RouteInfo: "/client/routes",
  NewsRegulations: "/client/news",
  ClientProfile: "/client/profile",
};

export function createPageUrl(pageName) {
  return pageRoutes[pageName] ?? "/";
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDate(isoString) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

export function formatDateTime(isoString) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return `${dateFormatter.format(date)} • ${timeFormatter.format(date)}`;
}

export function formatNumber(value, options = {}) {
  if (value == null || Number.isNaN(Number(value))) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", options).format(value);
}
