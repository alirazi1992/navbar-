import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship, Bell, Compass, AlertTriangle } from "lucide-react";
import MyVesselsWidget from "@/components/client/MyVesselsWidget";
import NotificationsWidget from "@/components/client/NotificationsWidget";
import WeatherWidget from "@/components/client/WeatherWidget";
import QuickMap from "@/components/client/QuickMap";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils";

export default function ClientDashboard() {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: vessels = [], isLoading: vesselsLoading } = useQuery({
    queryKey: ["vessels"],
    queryFn: () => base44.entities.Vessel.list(),
  });

  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => base44.entities.Notification.list(),
  });

  const { data: weather = [], isLoading: weatherLoading } = useQuery({
    queryKey: ["weather"],
    queryFn: () => base44.entities.Weather.list(),
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => base44.entities.Incident.list("-date"),
  });

  const myVessels = useMemo(() => {
    if (!user || user.role === "admin") return vessels;
    return vessels.filter((vessel) => vessel.owner_id === user.id);
  }, [vessels, user]);

  const targetedNotifications = useMemo(() => {
    const role = user?.role === "admin" ? "Admin" : "Client";
    return notifications.filter(
      (notification) => notification.target_role === "All" || notification.target_role === role
    );
  }, [notifications, user]);

  const activeIncidents = incidents.filter((incident) => incident.status !== "Closed");

  return (
    <div className="space-y-6" dir="rtl">
      <section className="space-y-2 text-right">
        <h1 className="text-3xl font-semibold text-white">
          {user?.full_name ? `${user.full_name} عزیز، خوش آمدید` : "خوش آمدید"}
        </h1>
        <p className="max-w-2xl text-sm text-slate-300/90">
          در این داشبورد، وضعیت ناوگان، هشدارهای مسیر و اعلان‌های عملیاتی مرتبط با سفرهای شما به‌صورت زنده ارائه می‌شود.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3 text-right">
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold text-slate-400">شناورهای تحت مالکیت</p>
              <p className="mt-1 text-2xl font-semibold text-white">{myVessels.length}</p>
            </div>
            <Ship className="h-8 w-8 text-cyan-300/80" />
          </CardContent>
        </Card>
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold text-slate-400">اعلان‌های خوانده نشده</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {
                  targetedNotifications.filter(
                    (notification) => !notification.read_by?.includes(user?.email)
                  ).length
                }
              </p>
            </div>
            <Bell className="h-8 w-8 text-yellow-300/80" />
          </CardContent>
        </Card>
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold text-slate-400">رخدادهای فعال پیرامون مسیر</p>
              <p className="mt-1 text-2xl font-semibold text-white">{activeIncidents.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-rose-300/80" />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <MyVesselsWidget vessels={myVessels} isLoading={vesselsLoading} />
          <QuickMap vessels={myVessels} center={[25.25, 54.5]} />
        </div>
        <div className="space-y-6">
          <NotificationsWidget
            notifications={targetedNotifications}
            loading={notificationsLoading}
            userEmail={user?.email}
          />
          <WeatherWidget reports={weather} loading={weatherLoading} />
        </div>
      </section>

      <section className="space-y-4 text-right">
        <h2 className="flex items-center justify-end gap-2 text-lg font-semibold text-white">
          <span>هشدارهای مسیر</span>
          <Compass className="h-5 w-5 text-cyan-300" />
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activeIncidents.slice(0, 6).map((incident) => (
            <Card key={incident.id} className="border-slate-800/80 bg-slate-900/60">
              <CardHeader className="text-right">
                <CardTitle className="text-white text-base">{incident.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300/90">
                <Badge>{incident.severity}</Badge>
                <p>{incident.description}</p>
                <div className="text-xs text-slate-400">
                  {incident.location_name} • {formatDate(incident.date)}
                </div>
              </CardContent>
            </Card>
          ))}
          {activeIncidents.length === 0 && (
            <Card className="border-slate-800/80 bg-slate-900/60">
              <CardContent className="p-6 text-sm text-slate-300/80">
                تمام مسیرهای فعلی بدون هشدار هستند. در صورت صدور هشدار جدید، به‌صورت خودکار باخبر خواهید شد.
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
