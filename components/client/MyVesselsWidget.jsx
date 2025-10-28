import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship, Compass, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl, formatDateTime } from "@/utils";
import { useLocale } from "@/contexts/LocaleContext.jsx";
import { vesselStatusLabels } from "@/utils/labels.js";

const statusStyles = {
  Active: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  Rejected: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
  "Under Review": "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  Maintenance: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  Docked: "bg-slate-500/20 text-slate-300 border border-slate-400/30",
  "Awaiting Departure":
    "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30",
};

export default function MyVesselsWidget({ vessels = [], loading = false }) {
  const { t, isRtl } = useLocale();
  const topVessels = vessels.slice(0, 4);

  return (
    <Card className="border-slate-800/80 bg-slate-900/60">
      <CardHeader className={`flex flex-row items-center justify-between ${isRtl ? "flex-row-reverse" : ""}`}>
        <CardTitle className={`flex items-center gap-2 text-white ${isRtl ? "flex-row-reverse" : ""}`}>
          <Ship className="h-5 w-5 text-cyan-400" />
          {t({ en: "My fleet snapshot", fa: "نمای کلی ناوگان من" })}
        </CardTitle>
        <Link
          to={createPageUrl("MyVessels")}
          className="text-xs font-semibold uppercase tracking-wide text-cyan-300 hover:text-cyan-200"
        >
          {t({ en: "View all", fa: "مشاهده همه" })}
        </Link>
      </CardHeader>
      <CardContent className={isRtl ? "text-right" : ""}>
        {loading && (
          <p className="rounded-xl border border-slate-700/70 bg-slate-800/50 p-6 text-center text-sm text-slate-300">
            {t({ en: "Loading fleet telemetry…", fa: "در حال دریافت اطلاعات ناوگان…" })}
          </p>
        )}
        {!loading && topVessels.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-700/70 bg-slate-800/50 px-4 py-8 text-center text-sm text-slate-400">
            <Ship className="h-10 w-10 text-slate-500/40" />
            <p>{t({ en: "No registered vessels yet.", fa: "هنوز شناوری ثبت نشده است." })}</p>
          </div>
        )}
        {!loading && topVessels.length > 0 && (
          <div className="space-y-4">
            {topVessels.map((vessel) => (
              <div
                key={vessel.id}
                className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4 transition hover:border-cyan-500/30 hover:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{vessel.name}</h4>
                    <p className="text-xs text-slate-400">{vessel.type}</p>
                  </div>
                  <Badge className={statusStyles[vessel.status] ?? statusStyles["Under Review"]}>
                    {t(vesselStatusLabels[vessel.status] ?? vessel.status)}
                  </Badge>
                </div>
                <div className={`mt-3 grid grid-cols-1 gap-3 text-xs text-slate-300 md:grid-cols-2 ${isRtl ? "text-right" : ""}`}>
                  {vessel.destination && (
                    <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                      <Compass className="h-4 w-4 text-slate-400" />
                      <span>
                        {t({ en: "Destination:", fa: "مقصد:" })} {vessel.destination}
                      </span>
                    </div>
                  )}
                  {vessel.latitude && vessel.longitude && (
                    <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>
                        {vessel.latitude.toFixed(2)}, {vessel.longitude.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
                {vessel.updated_date && (
                  <p className="mt-3 text-[11px] uppercase tracking-wide text-slate-500">
                    {t({ en: "Updated", fa: "به‌روزرسانی" })} {formatDateTime(vessel.updated_date)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
