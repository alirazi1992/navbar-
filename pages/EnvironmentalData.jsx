// /src/pages/EnvironmentalData.jsx
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Droplets } from "lucide-react";
import { formatDateTime } from "@/utils";
import { toFa } from "@/labels";

export default function EnvironmentalData() {
  const { data: briefings = [] } = useQuery({
    queryKey: ["articles", "env-briefings"],
    queryFn: () => base44.entities.Article.list("-publish_date"),
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ["weather", "incidents"],
    queryFn: () => base44.entities.Weather.list(),
  });

  return (
    <div className="space-y-6" dir="rtl">
      <section className="space-y-2 text-right">
        <h1 className="flex items-center justify-end gap-3 text-3xl font-semibold text-white">
          <span>رصدخانهٔ محیطی</span>
          <Leaf className="h-8 w-8 text-emerald-400" />
        </h1>
        <p className="max-w-2xl text-sm text-slate-300/90">
          رخدادها و به‌روزرسانی‌های محیطی مؤثر بر اکوسیستم‌های دریایی، همراه با نکات انطباقی.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardHeader className="text-right">
            <CardTitle>گزارش‌های انطباق</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {briefings.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-slate-800/70 bg-slate-900/70 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-white">{a.title}</h3>
                  <Badge>{toFa("publishStatus", a.status)}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {a.region ?? "بین‌المللی"} • {formatDateTime(a.publish_date ?? a.created_date)}
                </p>
                {a.summary && (
                  <p className="mt-2 text-sm text-slate-300/90">{a.summary}</p>
                )}
                {a.tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {a.tags.map((t) => (
                      <Badge key={t} variant="outline">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardHeader className="text-right">
            <CardTitle className="flex items-center justify-end gap-2">
              <span>رخدادهای محیطی</span>
              <Droplets className="h-5 w-5 text-cyan-300" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {incidents.slice(0, 4).map((w) => (
              <div
                key={w.id}
                className="rounded-xl border border-slate-800/70 bg-slate-900/70 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-white">
                    {w.location_name}
                  </h3>
                  <Badge>{toFa("seaState", w.sea_state)}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  به‌روزرسانی: {formatDateTime(w.created_date)}
                </p>
                {w.description && (
                  <p className="mt-2 text-sm text-slate-300/90">{w.description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
