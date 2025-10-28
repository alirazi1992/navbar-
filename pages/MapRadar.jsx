// src/pages/MapRadar.jsx
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, Cloud, AlertTriangle } from "lucide-react";
import QuickMap from "@/components/client/QuickMap";
import { formatDateTime } from "@/utils";
import { toFa } from "@/labels";

export default function MapRadar() {
  const { data: vessels = [] } = useQuery({
    queryKey: ["vessels"],
    queryFn: () => base44.entities.Vessel.list(),
  });
  const { data: weather = [] } = useQuery({
    queryKey: ["weather"],
    queryFn: () => base44.entities.Weather.list(),
  });
  const { data: incidents = [] } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => base44.entities.Incident.list("-date"),
  });

  return (
    <div className="space-y-6" dir="rtl">
      <section className="space-y-2 text-right">
        <h1 className="flex items-center justify-end gap-3 text-3xl font-semibold text-white">
          <span>رادار لحظه‌ای</span>
          <Navigation className="h-8 w-8 text-cyan-400" />
        </h1>
        <p className="max-w-2xl text-sm text-slate-300/90">
          پایش مکانی ناوگان و لایه‌های آب‌وهوایی/رخدادها در یک نگاه.
        </p>
      </section>

      <Card className="border-slate-800/80 bg-slate-900/60">
        <CardHeader className="text-right">
          <CardTitle>نقشهٔ عملیاتی</CardTitle>
        </CardHeader>
        <CardContent>
          <QuickMap vessels={vessels} />
          <p className="mt-2 text-center text-xs text-slate-500">
            * فقط شناورهایی نمایش داده می‌شوند که دادهٔ موقعیت دارند.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardHeader className="text-right">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>پایش رخدادها</span>
              <AlertTriangle className="h-5 w-5 text-amber-300" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {incidents.slice(0, 3).map((i) => (
              <div key={i.id} className="rounded-xl border border-slate-800/70 bg-slate-900/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-white">{i.title}</h3>
                  <Badge>{toFa("incidentSeverity", i.severity)}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {i.location_name} • {formatDateTime(i.date)}
                </p>
                {i.description && <p className="mt-2 text-sm text-slate-300/90">{i.description}</p>}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardHeader className="text-right">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>لایه‌های آب‌وهوایی</span>
              <Cloud className="h-5 w-5 text-cyan-300" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weather.slice(0, 4).map((w) => (
              <div key={w.id} className="rounded-xl border border-slate-800/70 bg-slate-900/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-white">{w.location_name}</h3>
                  <Badge>{toFa("seaState", w.sea_state)}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  به‌روزرسانی: {formatDateTime(w.created_date)}
                </p>
                {w.description && <p className="mt-2 text-sm text-slate-300/90">{w.description}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
