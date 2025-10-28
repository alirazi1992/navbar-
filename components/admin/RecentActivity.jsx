import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Ship, FileText } from "lucide-react";
import { formatDateTime } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/contexts/LocaleContext.jsx";
import { vesselStatusLabels } from "@/utils/labels.js";

const colorMap = {
  vessel: "bg-cyan-500/15 text-cyan-200 border border-cyan-400/30",
  article: "bg-purple-500/15 text-purple-200 border border-purple-400/30",
};

export default function RecentActivity({ vessels = [], articles = [] }) {
  const { t, isRtl } = useLocale();

  const vesselEvents = vessels.map((vessel) => ({
    type: "vessel",
    icon: Ship,
    title: vessel.name,
    status: vessel.status,
    timestamp: vessel.updated_date ?? vessel.created_date,
  }));

  const articleEvents = articles
    .filter((article) => article.status === "Published")
    .map((article) => ({
      type: "article",
      icon: FileText,
      title: article.title,
      description: article.category,
      timestamp: article.publish_date ?? article.created_date,
    }));

  const activities = [...vesselEvents, ...articleEvents]
    .filter((item) => item.timestamp)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 8);

  return (
    <Card className="bg-slate-900/60 border-slate-800/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Activity className="h-5 w-5 text-emerald-400" />
          {t({ en: "Recent activity", fa: "فعالیت‌های اخیر" })}
        </CardTitle>
      </CardHeader>
      <CardContent className={`space-y-4 ${isRtl ? "text-right" : ""}`}>
        {activities.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-700/70 bg-slate-800/50 p-6 text-sm text-slate-400">
            {t({
              en: "There are no recent updates in the last 48 hours.",
              fa: "در ۴۸ ساعت گذشته به‌روزرسانی تازه‌ای ثبت نشده است.",
            })}
          </p>
        )}
        {activities.map((event, index) => {
          const Icon = event.icon;
          const badgeLabel =
            event.type === "vessel"
              ? t({ en: "Fleet", fa: "ناوگان" })
              : t({ en: "Insights", fa: "تحلیل‌ها" });

          const description =
            event.type === "vessel"
              ? t({
                  en: `Status: ${event.status}`,
                  fa: `وضعیت: ${t(vesselStatusLabels[event.status] ?? event.status)}`,
                })
              : event.description;

          return (
            <div
              key={`${event.type}-${index}`}
              className={`flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/70 p-3 transition hover:border-cyan-500/30 hover:bg-slate-900 ${isRtl ? "flex-row-reverse" : ""}`}
            >
              <div className="rounded-lg bg-slate-800/60 p-2">
                <Icon className="h-4 w-4 text-cyan-300" />
              </div>
              <div className="flex-1">
                <div className={`flex items-center justify-between gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <h4 className="text-sm font-semibold text-white">{event.title}</h4>
                  <Badge className={colorMap[event.type] ?? colorMap.vessel}>{badgeLabel}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-300/80">{description}</p>
                <p className="mt-2 text-xs text-slate-500">{formatDateTime(event.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
