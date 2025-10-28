import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Wind, Waves, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/utils";
import { useLocale } from "@/contexts/LocaleContext.jsx";

const seaStateStyles = {
  Calm: "bg-emerald-500/20 text-emerald-200",
  Moderate: "bg-cyan-500/20 text-cyan-200",
  Rough: "bg-orange-500/20 text-orange-200",
  "Very Rough": "bg-rose-500/20 text-rose-200",
  Storm: "bg-red-600/20 text-red-200",
};

const seaStateLabels = {
  Calm: { en: "Calm", fa: "آرام" },
  Moderate: { en: "Moderate", fa: "متوسط" },
  Rough: { en: "Rough", fa: "متلاطم" },
  "Very Rough": { en: "Very Rough", fa: "بسیار متلاطم" },
  Storm: { en: "Storm", fa: "طوفانی" },
};

export default function WeatherWidget({ reports = [], loading = false }) {
  const { t, isRtl } = useLocale();
  const topReports = reports.slice(0, 3);

  return (
    <Card className="border-slate-800/80 bg-slate-900/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Cloud className="h-5 w-5 text-blue-300" />
          {t({ en: "Coastal weather intelligence", fa: "هوشمندی آب‌وهوای دریایی" })}
        </CardTitle>
      </CardHeader>
      <CardContent className={`space-y-4 ${isRtl ? "text-right" : ""}`}>
        {loading && (
          <p className="rounded-xl border border-slate-700/70 bg-slate-800/50 p-6 text-center text-sm text-slate-300">
            {t({ en: "Fetching latest maritime forecasts…", fa: "در حال دریافت پیش‌بینی‌های دریایی…" })}
          </p>
        )}
        {!loading && topReports.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-700/70 bg-slate-800/50 p-6 text-center text-sm text-slate-400">
            {t({ en: "No weather reports available for your routes.", fa: "گزارش آب‌وهوایی برای مسیرهای شما موجود نیست." })}
          </div>
        )}
        {!loading &&
          topReports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4 transition hover:border-cyan-500/30 hover:bg-slate-900"
              >
              <div className={`flex items-start justify-between gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                <div>
                  <h4 className="text-sm font-semibold text-white">{report.location_name}</h4>
                  <p className="text-xs text-slate-400">
                    {t({ en: "Updated", fa: "به‌روزرسانی" })} {formatDateTime(report.created_date)}
                  </p>
                </div>
                <Badge className={seaStateStyles[report.sea_state] ?? seaStateStyles.Moderate}>
                  {t(seaStateLabels[report.sea_state] ?? report.sea_state)}
                </Badge>
              </div>
              <div className={`mt-3 grid grid-cols-2 gap-3 text-xs text-slate-300 ${isRtl ? "text-right" : ""}`}>
                <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <span className="text-slate-400">{t({ en: "Temp", fa: "دما" })}</span>
                  <span className="text-white">{report.temperature}&deg;C</span>
                </div>
                <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <Wind className="h-4 w-4 text-slate-400" />
                  <span>{report.wind_speed} km/h</span>
                </div>
                <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <Waves className="h-4 w-4 text-slate-400" />
                  <span>{report.wave_height} m</span>
                </div>
                <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <Eye className="h-4 w-4 text-slate-400" />
                  <span>{report.visibility} km</span>
                </div>
              </div>
              {report.description && (
                <p className="mt-3 text-xs text-slate-300/80">{report.description}</p>
              )}
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
