// /src/pages/ContentManagement.jsx
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TRow, TH, TBody, TD } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PenSquare, BookOpen } from "lucide-react";
import { formatDateTime } from "@/utils";
import { toFa, fa } from "@/labels";

export default function ContentManagement() {
  const { data: articles = [] } = useQuery({
    queryKey: ["articles"],
    queryFn: () => base44.entities.Article.list("-publish_date"),
  });

  return (
    <div className="space-y-6" dir="rtl">
      <section className="space-y-2 text-right">
        <h1 className="flex items-center justify-end gap-3 text-3xl font-semibold text-white">
          <span>استودیو محتوا</span>
          <BookOpen className="h-8 w-8 text-cyan-400" />
        </h1>
        <p className="max-w-2xl text-sm text-slate-300/90">
          انتشار به‌روزرسانی‌های عملیاتی و اطلاعیه‌های انطباق برای ذی‌نفعان بندر.
        </p>
      </section>

      <Card className="border-slate-800/80 bg-slate-900/60">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-right">پایگاه دانش</CardTitle>
          <Button className="flex items-center gap-2">
            نگارش مقاله <PenSquare className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TRow>
                <TH className="text-right">{fa.table.actions}</TH>
                <TH className="text-right">{fa.table.tags}</TH>
                <TH className="text-right">{fa.table.updated}</TH>
                <TH className="text-right">{fa.table.author}</TH>
                <TH className="text-right">{fa.table.status}</TH>
                <TH className="text-right">{fa.table.priority}</TH>
                <TH className="text-right">{fa.table.category}</TH>
                <TH className="text-right">{fa.table.title}</TH>
              </TRow>
            </THead>
            <TBody>
              {articles.map((a) => (
                <TRow key={a.id}>
                  <TD className="text-right space-x-2 space-x-reverse">
                    <Button size="sm" variant="ghost">ویرایش</Button>
                    <Button size="sm" variant="ghost">حذف</Button>
                  </TD>
                  <TD className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {a.tags?.map((t) => (
                        <span key={t} className="rounded-full bg-slate-800 px-2 py-0.5 text-xs">
                          {t}
                        </span>
                      ))}
                    </div>
                  </TD>
                  <TD className="text-right">{formatDateTime(a.publish_date ?? a.created_date)}</TD>
                  <TD className="text-right">{a.author ?? "نامشخص"}</TD>
                  <TD className="text-right">{toFa("publishStatus", a.status)}</TD>
                  <TD className="text-right">{a.priority ?? "-"}</TD>
                  <TD className="text-right">{a.category ?? "-"}</TD>
                  <TD className="text-right">{a.title}</TD>
                </TRow>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
