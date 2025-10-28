import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext.jsx";

const palette = {
  cyan: {
    bg: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/30",
    icon: "text-cyan-300",
    glow: "shadow-cyan-600/20",
  },
  blue: {
    bg: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/30",
    icon: "text-blue-300",
    glow: "shadow-blue-600/20",
  },
  pink: {
    bg: "from-pink-500/20 to-pink-500/5",
    border: "border-pink-500/30",
    icon: "text-pink-300",
    glow: "shadow-pink-600/20",
  },
  green: {
    bg: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/30",
    icon: "text-emerald-300",
    glow: "shadow-emerald-600/20",
  },
};

export default function StatsCard({ title, value, icon: Icon, color = "cyan", trend }) {
  const { t } = useLocale();
  const classes = palette[color] ?? palette.cyan;

  return (
    <Card
      className={`bg-gradient-to-br ${classes.bg} border ${classes.border} ${classes.glow} transition-transform duration-300 hover:-translate-y-1`}
    >
      <CardHeader className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-200/80">{t(title)}</p>
            <CardTitle className="mt-1 text-4xl font-bold text-white">
              {typeof value === "number" ? value.toLocaleString() : value}
            </CardTitle>
          </div>
          {Icon && (
            <div className={`rounded-xl border ${classes.border} bg-slate-900/70 p-4`}>
              <Icon className={`h-7 w-7 ${classes.icon}`} />
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-200/70">
            <TrendingUp className={`h-4 w-4 ${classes.icon}`} />
            {t(trend)}
          </div>
        )}
      </CardHeader>
    </Card>
  );
}
