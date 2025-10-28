import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, MapPinned } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/utils";
import { useLocale } from "@/contexts/LocaleContext.jsx";

const severityColors = {
  Critical: "bg-red-500/20 text-red-300 border border-red-500/30",
  High: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  Medium: "bg-amber-500/20 text-amber-200 border border-amber-500/30",
  Low: "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30",
};

const severityLabels = {
  Critical: { en: "Critical", fa: "بحرانی" },
  High: { en: "High", fa: "زیاد" },
  Medium: { en: "Medium", fa: "متوسط" },
  Low: { en: "Low", fa: "کم" },
};

export default function AlertsPanel({ incidents = [] }) {
  const { t, isRtl } = useLocale();

  return (
    <Card className="bg-slate-900/60 border-slate-800/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          {t({ en: "Live Risk Alerts", fa: "هشدارهای ریسکی لحظه‌ای" })}
        </CardTitle>
      </CardHeader>
      <CardContent className={`space-y-3 ${isRtl ? "text-right" : ""}`}>
        {incidents.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-700/70 bg-slate-800/50 px-4 py-8 text-center text-sm text-slate-400">
            <AlertTriangle className="h-10 w-10 text-slate-500/40" />
            <p>
              {t({
                en: "No active incidents. All monitored zones are stable.",
                fa: "رخداد فعالی وجود ندارد. همه مناطق تحت نظارت پایدار هستند.",
              })}
            </p>
          </div>
        )}
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4 transition-colors hover:border-cyan-500/40 hover:bg-slate-900"
          >
            <div className={`flex items-start justify-between gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
              <h4 className="flex-1 text-sm font-semibold text-white">{incident.title}</h4>
              <Badge className={severityColors[incident.severity] ?? severityColors.Low}>
                {t(severityLabels[incident.severity] ?? incident.severity)}
              </Badge>
            </div>
            <div className={`mt-2 flex items-center gap-2 text-xs text-slate-400 ${isRtl ? "flex-row-reverse" : ""}`}>
              <MapPinned className="h-3.5 w-3.5" />
              <span>{incident.location_name}</span>
              <span className="text-slate-600">•</span>
              <span>{formatDateTime(incident.date)}</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-300/80">{incident.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
