// /src/pages/NewsRegulations.jsx
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { formatDateTime } from "@/utils";
import { toFa } from "@/labels";

export default function NewsRegulations() {
  const { data: articles = [] } = useQuery({
    queryKey: ["articles"],
    queryFn: () => base44.entities.Article.list("-publish_date"),
  });

  return (
    <div className="space-y-6" dir="rtl">
      <section className="space-y-2 text-right">
        <h1 className="flex items-center justify-end gap-3 text-3xl font-semibold text-white">
          <span>دستورالعمل‌ها</span>
          <FileText className="h-8 w-8 text-cyan-400" />
        </h1>
        <p className="max-w-2xl text-sm text-slate-300/90">
          مجموعه‌ای برگزیده از اطلاعیه‌ها و مقرراتِ مرتبط با عملیات بندری و دریایی.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        {articles.slice(0, 6).map((a) => (
          <Card key={a.id} className="border-slate-800/80 bg-slate-900/60">
            <CardHeader className="text-right">
              <CardTitle className="text-white">{a.title}</CardTitle>
              <div className="mt-2 flex flex-wrap justify-end gap-2">
                {a.tags?.slice(0, 3).map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardHeader>

            <CardContent className="text-right">
              <p className="text-xs text-slate-400">
                {a.category ?? "-"} • {a.region ?? "بین‌المللی"} •{" "}
                {formatDateTime(a.publish_date ?? a.created_date)}
              </p>

              {a.summary && (
                <p className="mt-2 text-sm text-slate-300/90">{a.summary}</p>
              )}

              <div className="mt-3">
                <Badge>{toFa("publishStatus", a.status)}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
