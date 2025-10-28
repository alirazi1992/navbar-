// /src/Layout.jsx
import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Ship,
  Users,
  Cloud,
  AlertTriangle,
  FileText,
  Bell,
  Map,
  Settings,
  LogOut,
  Anchor,
  Navigation,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { useLocale } from "@/contexts/LocaleContext.jsx";

export default function Layout() {
  const location = useLocation();
  const { isRtl } = useLocale();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("خطا در دریافت اطلاعات کاربر فعال.", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [location.key]);

  const isAdmin = user?.role === "admin";

  const navigationItems = useMemo(() => {
    const adminNavigation = [
      { title: "داشبورد", page: "AdminDashboard", icon: LayoutDashboard },
      { title: "کاربران", page: "UsersManagement", icon: Users },
      { title: "ناوگان", page: "VesselsManagement", icon: Ship },
      { title: "داده‌های محیطی", page: "EnvironmentalData", icon: Cloud },
      { title: "رخدادها", page: "IncidentsManagement", icon: AlertTriangle },
      { title: "استودیو محتوا", page: "ContentManagement", icon: FileText },
      { title: "اعلان‌ها", page: "NotificationsManagement", icon: Bell },
    ];

    const clientNavigation = [
      { title: "داشبورد", page: "ClientDashboard", icon: LayoutDashboard },
      { title: "ناوگان من", page: "MyVessels", icon: Ship },
      { title: "رادار لحظه‌ای", page: "MapRadar", icon: Map },
      { title: "هوش مسیر", page: "RouteInfo", icon: Navigation },
      { title: "دستورالعمل‌ها", page: "NewsRegulations", icon: FileText },
      { title: "پروفایل", page: "ClientProfile", icon: Settings },
    ];

    return isAdmin ? adminNavigation : clientNavigation;
  }, [isAdmin]);

  const handleSwitchRole = async () => {
    const targetRole = isAdmin ? "client" : "admin";
    const updatedUser = await base44.auth.switchRole(targetRole);
    setUser(updatedUser);
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-300">
          <Anchor className="h-10 w-10 animate-spin text-cyan-400" />
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            در حال راه‌اندازی سامانه
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 ${
        isRtl ? "flex-row-reverse" : ""
      }`}
      dir="rtl"
    >
      <aside
        className={`fixed ${isRtl ? "right-0" : "left-0"} inset-y-0 z-40 w-72 transform border-slate-800/70 bg-slate-950/90 backdrop-blur transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : `${isRtl ? "translate-x-full" : "-translate-x-full"} lg:translate-x-0`
        }`}
      >
        <div
          className={`flex items-center gap-3 border-b border-slate-800 px-6 py-6 ${
            isRtl ? "flex-row-reverse text-right" : ""
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 shadow-lg shadow-cyan-500/30">
            <Anchor className="h-6 w-6 text-white" />
          </div>
          <div className={isRtl ? "text-right" : ""}>
            <h2 className="text-xl font-semibold text-white">دیدبان بندر</h2>
            <p className="text-xs tracking-wide text-slate-400">سامانه مدیریت عملیات دریایی</p>
          </div>
        </div>

        <nav className="flex h-[calc(100vh-180px)] flex-col justify-between overflow-y-auto px-4 py-6">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={({ isActive }) =>
                    [
                      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
                        isRtl ? "flex-row-reverse text-right" : ""
                      }`,
                      isActive
                        ? "bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/40"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-cyan-200",
                    ].join(" ")
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{item.title}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
            <div className={isRtl ? "text-right" : ""}>
              <p className="text-xs tracking-wide text-slate-400">ورود با</p>
              <p className="mt-1 text-sm font-semibold text-white">{user?.full_name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
              <span className="rounded-full bg-cyan-500/20 px-2 py-1 text-xs font-semibold tracking-wide text-cyan-300">
                {user?.role === "admin" ? "مدیر" : "مشتری"}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-slate-600 bg-slate-900/60 text-xs tracking-wide"
                onClick={handleSwitchRole}
              >
                {isAdmin ? "تغییر به نمای مشتری" : "تغییر به نمای مدیر"}
              </Button>
            </div>
            <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 border border-transparent bg-slate-800/60 text-sm text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                onClick={async () => {
                  await base44.auth.logout();
                  const updatedUser = await base44.auth.me();
                  setUser(updatedUser);
                  setSidebarOpen(false);
                }}
              >
                <LogOut className="ml-2 h-4 w-4" />
                خروج از کاربری فعلی
              </Button>
            </div>
          </div>
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className={`flex-1 ${isRtl ? "lg:pr-72 pr-0 pl-0" : "pl-0 lg:pl-72"}`} dir="rtl">
        <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
          <div className={`flex items-center justify-between px-4 py-4 lg:px-8 ${isRtl ? "flex-row-reverse" : ""}`}>
            <div className="text-right">
              <p className="text-xs tracking-[0.28em] text-cyan-400">دیدبان بندر</p>
              <h1 className="text-lg font-semibold text-white">
                {isAdmin ? "اتاق کنترل مدیریت" : "فضای کاری عملیات مشتریان"}
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={`inline-flex items-center gap-2 border border-slate-700/80 bg-slate-900/60 text-slate-300 hover:bg-slate-800 lg:hidden ${
                isRtl ? "flex-row-reverse" : ""
              }`}
              onClick={() => setSidebarOpen((value) => !value)}
            >
              <span>فهرست</span>
            </Button>
          </div>
        </header>

        <div className="min-h-[calc(100vh-4rem)] px-4 pb-12 pt-6 lg:px-10">
          <div className="mx-auto max-w-7xl space-y-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
