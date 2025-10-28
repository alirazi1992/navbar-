import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import StatsCard from "@/components/admin/StatsCard";
import AlertsPanel from "@/components/admin/AlertsPanel";
import VesselsChart from "@/components/admin/VesselsChart";
import RecentActivity from "@/components/admin/RecentActivity";
import QuickMap from "@/components/client/QuickMap";
import WeatherWidget from "@/components/client/WeatherWidget";
import NotificationsWidget from "@/components/client/NotificationsWidget";
import { Users, Ship, BellRing, Gauge } from "lucide-react";

export default function AdminDashboard() {
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: vessels = [] } = useQuery({
    queryKey: ["vessels"],
    queryFn: () => base44.entities.Vessel.list(),
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => base44.entities.Incident.list(),
  });

  const { data: articles = [] } = useQuery({
    queryKey: ["articles"],
    queryFn: () => base44.entities.Article.list(),
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => base44.entities.Notification.list(),
  });

  const { data: weather = [] } = useQuery({
    queryKey: ["weather"],
    queryFn: () => base44.entities.Weather.list(),
  });

  const فعال = notifications.filter((notification) => notification.status !== "Archived");
  const بحرانی = incidents.filter((incident) => incident.severity === "Critical");
  const عملیاتی = vessels.filter((vessel) => vessel.status === "Active");

  const توزیع_ناوگان = useMemo(() => {
    const counts = vessels.reduce((acc, vessel) => {
      acc[vessel.status] = (acc[vessel.status] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([status, value]) => ({
      name: status,
      value,
    }));
  }, [vessels]);

  return (
    <div className="space-y-6" dir="rtl">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 text-right">
        <StatsCard
          title={{ fa: "کاربران ثبت‌شده" }}
          value={users.length}
          icon={Users}
          color="cyan"
          trend={{ fa: "۱۲٪ رشد نسبت به هفته گذشته" }}
        />
        <StatsCard
          title={{ fa: "شناورهای ناوگان" }}
          value={vessels.length}
          icon={Ship}
          color="blue"
          trend={{ fa: `${عملیاتی.length} شناور در حال عملیات` }}
        />
        <StatsCard
          title={{ fa: "اعلان‌های فعال" }}
          value={فعال.length}
          icon={BellRing}
          color="pink"
          trend={{ fa: `${بحرانی.length} هشدار بحرانی ثبت شده` }}
        />
        <StatsCard
          title={{ fa: "آمادگی عملیاتی" }}
          value="۸۷٪"
          icon={Gauge}
          color="green"
          trend={{ fa: "کاهش ۴٪ در معوقات تعمیراتی" }}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <VesselsChart data={توزیع_ناوگان} />
          <QuickMap vessels={vessels} />
        </div>
        <div className="space-y-6">
          <AlertsPanel incidents={incidents.slice(0, 5)} />
          <WeatherWidget reports={weather} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <RecentActivity vessels={vessels} articles={articles} />
        <NotificationsWidget notifications={notifications.slice(0, 6)} userEmail={users[0]?.email ?? null} />
      </section>
    </div>
  );
}
