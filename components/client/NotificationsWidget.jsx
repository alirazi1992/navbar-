import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/utils";
import { useLocale } from "@/contexts/LocaleContext.jsx";
import { notificationPriorityLabels } from "@/utils/labels.js";

const priorityStyles = {
  Low: "bg-emerald-500/20 text-emerald-200",
  Medium: "bg-amber-500/20 text-amber-200",
  High: "bg-orange-500/20 text-orange-200",
  Critical: "bg-rose-500/20 text-rose-200",
};

export default function NotificationsWidget({
  notifications = [],
  loading = false,
  userEmail,
}) {
  const { t, isRtl } = useLocale();

  return (
    <Card className="border-slate-800/80 bg-slate-900/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Bell className="h-5 w-5 text-yellow-400" />
          {t({ en: "Inbox updates", fa: "بروزرسانی‌های صندوق پیام" })}
        </CardTitle>
      </CardHeader>
      <CardContent className={`space-y-3 ${isRtl ? "text-right" : ""}`}>
        {loading && (
          <p className="rounded-xl border border-slate-700/70 bg-slate-800/50 p-6 text-center text-sm text-slate-300">
            {t({ en: "Checking for new broadcast messages…", fa: "در حال بررسی اعلان‌های جدید…" })}
          </p>
        )}
        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-700/70 bg-slate-800/50 px-4 py-8 text-center text-sm text-slate-400">
            <Bell className="h-10 w-10 text-slate-500/40" />
            <p>{t({ en: "No notifications assigned to you.", fa: "اعلانی برای شما ثبت نشده است." })}</p>
          </div>
        )}
        {!loading &&
          notifications.map((notification) => {
            const isRead = notification.read_by?.includes(userEmail);
            return (
              <div
                key={notification.id}
                className={`rounded-xl border px-4 py-3 transition ${
                  isRead
                    ? "border-slate-800/80 bg-slate-900/50"
                    : "border-yellow-500/40 bg-yellow-500/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-2 h-2 w-2 rounded-full ${
                      notification.priority === "Critical"
                        ? "bg-rose-400"
                        : notification.priority === "High"
                          ? "bg-orange-400"
                          : notification.priority === "Medium"
                            ? "bg-amber-300"
                            : "bg-emerald-300"
                    }`}
                  />
                  <div className={`flex-1 space-y-2 ${isRtl ? "text-right" : ""}`}>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {notification.title}
                      </h4>
                      <p className="text-xs text-slate-300/90">{notification.message}</p>
                    </div>
                    <div className={`flex flex-wrap items-center gap-2 text-xs text-slate-400 ${isRtl ? "flex-row-reverse space-x-reverse" : ""}`}>
                      <Badge className={priorityStyles[notification.priority] ?? priorityStyles.Low}>
                        {t(notificationPriorityLabels[notification.priority] ?? notification.priority)}
                      </Badge>
                      <span>{notification.type}</span>
                      <span>•</span>
                      <span>{notification.region}</span>
                      {notification.sent_date && (
                        <>
                          <span>•</span>
                          <span>
                            {t({ en: "Sent", fa: "ارسال" })} {formatDateTime(notification.sent_date)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
}
