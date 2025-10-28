// /src/pages/NotificationsManagement.jsx
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TRow, TH, TBody, TD } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";
import { formatDateTime } from "@/utils";
import { toFa, fa } from "@/labels";

export default function NotificationsManagement() {
  const { data: notices = [] } = useQuery({
    queryKey: ["notices"],
    queryFn: () => base44.entities.Notice.list("-scheduled_at"),
  });

  return (
    <div className="space-y-6" dir="rtl">
      <section className="space-y-2 text-right">
        <h1 className="flex items-center justify-end gap-3 text-3xl font-semibold text-white">
          <span>مرکز اعلان‌ها</span>
          <Bell className="h-8 w-8 text-yellow-400" />
        </h1>
        <p className="max-w-2xl text-sm text-slate-300/90">
          پیش‌نویس، زمان‌بندی و ارسال اعلان‌های اولویت‌دار برای مخاطبان بندر.
        </p>
      </section>

      <Card className="border-slate-800/80 bg-slate-900/60">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-right">صف اعلان‌ها</CardTitle>
          <Button className="flex items-center gap-2">
            ایجاد اعلان <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TRow>
                <TH className="text-right">{fa.table.actions}</TH>
                <TH className="text-right">{fa.table.sent}</TH>
                <TH className="text-right">{fa.table.scheduled}</TH>
                <TH className="text-right">ناحیه</TH>
                <TH className="text-right">{fa.table.status}</TH>
                <TH className="text-right">{fa.table.priority}</TH>
                <TH className="text-right">{fa.table.audience}</TH>
                <TH className="text-right">{fa.table.title}</TH>
              </TRow>
            </THead>
            <TBody>
              {notices.map((n) => (
                <TRow key={n.id}>
                  <TD className="text-right space-x-2 space-x-reverse">
                    <Button size="sm" variant="ghost">ارسال</Button>
                    <Button size="sm" variant="ghost">ویرایش</Button>
                    <Button size="sm" variant="ghost">حذف</Button>
                  </TD>
                  <TD className="text-right">{n.sent_at ? formatDateTime(n.sent_at) : "—"}</TD>
                  <TD className="text-right">{n.scheduled_at ? formatDateTime(n.scheduled_at) : "—"}</TD>
                  <TD className="text-right">{n.region ?? "-"}</TD>
                  <TD className="text-right">{toFa("publishStatus", n.status)}</TD>
                  <TD className="text-right">{n.priority ?? "-"}</TD>
                  <TD className="text-right">{toFa("audience", n.audience ?? "All")}</TD>
                  <TD className="text-right">{n.title}</TD>
                </TRow>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
