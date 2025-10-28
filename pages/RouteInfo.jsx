// /src/pages/RouteInfo.jsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ship, Cloud, AlertTriangle, FileText } from "lucide-react";
import { formatDateTime } from "@/utils";

const EARTH_RADIUS_KM = 6371;
const toRadians = (v) => (v * Math.PI) / 180;
function haversineDistance(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export default function RouteInfo() {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: vessels = [], isLoading: vesselsLoading } = useQuery({
    queryKey: ["vessels"],
    queryFn: () => base44.entities.Vessel.list(),
  });

  const { data: weather = [], isLoading: weatherLoading } = useQuery({
    queryKey: ["weather"],
    queryFn: () => base44.entities.Weather.list(),
  });

  const { data: incidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => base44.entities.Incident.list("-date"),
  });

  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ["articles"],
    queryFn: () => base44.entities.Article.list("-publish_date"),
  });

  const myVessels = useMemo(() => {
    if (!user || user.role === "admin") {
      return vessels.filter((v) => v.latitude && v.longitude);
    }
    return vessels.filter((v) => v.owner_id === user.id && v.latitude && v.longitude);
  }, [vessels, user]);

  const routeIntelligence = useMemo(() => {
    return myVessels.map((vessel) => {
      const nearbyWeather = weather
        .filter((r) => r.latitude && r.longitude)
        .filter((r) => haversineDistance(vessel.latitude, vessel.longitude, r.latitude, r.longitude) <= 120)
        .sort(
          (a, b) =>
            haversineDistance(vessel.latitude, vessel.longitude, a.latitude, a.longitude) -
            haversineDistance(vessel.latitude, vessel.longitude, b.latitude, b.longitude)
        );

      const nearbyIncidents = incidents
        .filter((i) => i.latitude && i.longitude)
        .filter((i) => haversineDistance(vessel.latitude, vessel.longitude, i.latitude, i.longitude) <= 180)
        .sort(
          (a, b) =>
            haversineDistance(vessel.latitude, vessel.longitude, a.latitude, a.longitude) -
            haversineDistance(vessel.latitude, vessel.longitude, b.latitude, b.longitude)
        );

      const keywords = [vessel.destination, "port", "harbor", vessel.flag].filter(Boolean);
      const relevantArticles = articles
        .filter((a) => a.status === "Published")
        .filter((a) => {
          const content = `${a.title} ${a.summary} ${a.region}`.toLowerCase().replace(/\s+/g, " ");
          return keywords.some((k) => k && content.includes(String(k).toLowerCase()));
        })
        .slice(0, 4);

      return { vessel, nearbyWeather, nearbyIncidents, relevantArticles };
    });
  }, [myVessels, incidents, articles, weather]);

  const loading = vesselsLoading || weatherLoading || incidentsLoading || articlesLoading;

  return (
    <div className="space-y-6" dir="rtl">
      <section className="space-y-2 text-right">
        <h1 className="flex items-center justify-end gap-3 text-3xl font-semibold text-white">
          <span>هوش مسیر</span>
          <Ship className="h-8 w-8 text-cyan-400" />
        </h1>
        <p className="max-w-2xl text-sm text-slate-300/90">
          خلاصه‌های تطبیقی برای هر شناور با ترکیب پیش‌بینی‌های آب‌وهوایی، رخدادهای پیرامونی و نکات عملیاتی.
        </p>
      </section>

      {loading && (
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardContent className="p-6 text-center text-slate-300">
            در حال تجمیع تله‌متری ناوگان…
          </CardContent>
        </Card>
      )}

      {!loading && routeIntelligence.length === 0 && (
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardContent className="p-6 text-center text-slate-300">
            برای این حساب، شناورِ دارای موقعیت زنده ثبت نشده است.
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {routeIntelligence.map(({ vessel, nearbyWeather, nearbyIncidents, relevantArticles }) => (
          <Card key={vessel.id} className="border-slate-800/80 bg-slate-900/60">
            <CardHeader className="flex flex-col gap-2 border-b border-slate-800/70">
              <div className="text-right">
                <CardTitle className="text-white">{vessel.name}</CardTitle>
                <p className="text-xs text-slate-400">
                  {vessel.type} • مقصد {vessel.destination ?? "نامشخص"}
                </p>
              </div>
              <div className="text-left">
                <Badge>{vessel.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="weather">
                <TabsList className="grid grid-cols-1 gap-1 sm:grid-cols-3">
                  <TabsTrigger value="weather">
                    <Cloud className="ml-2 h-4 w-4" />
                    آب‌وهوا ({nearbyWeather.length})
                  </TabsTrigger>
                  <TabsTrigger value="incidents">
                    <AlertTriangle className="ml-2 h-4 w-4" />
                    رخدادها ({nearbyIncidents.length})
                  </TabsTrigger>
                  <TabsTrigger value="insights">
                    <FileText className="ml-2 h-4 w-4" />
                    نکات و دستورالعمل‌ها ({relevantArticles.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="weather">
                  <div className="space-y-3 text-right">
                    {nearbyWeather.length === 0 && (
                      <p className="rounded-xl border border-dashed border-slate-700/70 p-4 text-sm text-slate-300">
                        گزارشی در شعاع ۱۲۰ کیلومتری یافت نشد.
                      </p>
                    )}
                    {nearbyWeather.map((report) => (
                      <div key={report.id} className="rounded-xl border border-slate-800/70 bg-slate-900/70 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold text-white">{report.location_name}</h3>
                          <Badge>{report.sea_state}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          به‌روزرسانی: {formatDateTime(report.created_date)}
                        </p>
                        {report.description && (
                          <p className="mt-2 text-sm text-slate-300/90">{report.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="incidents">
                  <div className="space-y-3 text-right">
                    {nearbyIncidents.length === 0 && (
                      <p className="rounded-xl border border-dashed border-slate-700/70 p-4 text-sm text-slate-300">
                        رخدادی در شعاع ۱۸۰ کیلومتری ثبت نشده است.
                      </p>
                    )}
                    {nearbyIncidents.map((incident) => (
                      <div key={incident.id} className="rounded-xl border border-slate-800/70 bg-slate-900/70 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold text-white">{incident.title}</h3>
                          <Badge>{incident.severity}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          {incident.location_name} • {formatDateTime(incident.date)}
                        </p>
                        {incident.description && (
                          <p className="mt-2 text-sm text-slate-300/90">{incident.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="insights">
                  <div className="space-y-3 text-right">
                    {relevantArticles.length === 0 && (
                      <p className="rounded-xl border border-dashed border-slate-700/70 p-4 text-sm text-slate-300">
                        مطلب مرتبطی برای این مسیر یافت نشد.
                      </p>
                    )}
                    {relevantArticles.map((article) => (
                      <div key={article.id} className="rounded-xl border border-slate-800/70 bg-slate-900/70 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold text-white">{article.title}</h3>
                          <Badge>{article.category}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          انتشار: {formatDateTime(article.publish_date ?? article.created_date)}
                        </p>
                        {article.summary && (
                          <p className="mt-2 text-sm text-slate-300/90">{article.summary}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
