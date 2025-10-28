import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";
import { useLocale } from "@/contexts/LocaleContext.jsx";
import { vesselStatusLabels } from "@/utils/labels.js";

export default function VesselsChart({ data = [] }) {
  const { t, isRtl } = useLocale();
  const chartData = data.map((item) => ({
    ...item,
    label: t(vesselStatusLabels[item.name] ?? item.name),
  }));

  return (
    <Card className="bg-slate-900/60 border-slate-800/80">
      <CardHeader>
        <CardTitle className="text-white">
          {t({ en: "Fleet status distribution", fa: "توزیع وضعیت ناوگان" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="horizontal" reverseStackOrder={isRtl}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              interval={0}
            />
            <YAxis stroke="#94a3b8" allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: "rgba(14, 116, 144, 0.15)" }}
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: "0.75rem",
                border: "1px solid rgba(94, 234, 212, 0.35)",
                color: "#e2e8f0",
              }}
              labelFormatter={(label) => label}
            />
            <Bar dataKey="value" fill="#22d3ee" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
