import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus } from "lucide-react";
import { formatDateTime } from "@/utils";
import { incidentSeverityLabels, incidentStatusLabels } from "@/utils/labels";

const toFa = (labels, value) => labels[value]?.fa ?? value;

export default function IncidentsManagement() {
  const { data: incidents = [] } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => base44.entities.Incident.list("-date"),
  });

  const criticalCount = incidents.filter((incident) => incident.severity === "Critical").length;
  const inProgressCount = incidents.filter((incident) => incident.status === "In Progress").length;
  const openCount = incidents.filter((incident) => incident.status === "Open").length;

  return (
    <div className="space-y-6" dir="rtl">
      <section className="space-y-2 text-right">
        <h1 className="flex items-center justify-end gap-3 text-3xl font-semibold text-white">
          <span>مرکز مدیریت رخدادها</span>
          <AlertTriangle className="h-8 w-8 text-amber-400" />
        </h1>
        <p className="max-w-2xl text-sm text-slate-300/90">
          وضعیت لحظه‌ای رخدادهای عملیاتی، تیم‌های پاسخ‌گو و هشدارهای فعال در منطقه تحت پوشش در این بخش
          قابل مشاهده و مدیریت است.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3 text-right">
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-400">هشدارهای بحرانی فعال</p>
            <p className="mt-1 text-3xl font-semibold text-white">{criticalCount}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-400">در حال رسیدگی</p>
            <p className="mt-1 text-3xl font-semibold text-white">{inProgressCount}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-slate-400">رخدادهای باز</p>
            <p className="mt-1 text-3xl font-semibold text-white">{openCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-800/80 bg-slate-900/60">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-right">ثبت و پایش رخدادها</CardTitle>
          <Button className="flex items-center gap-2 bg-amber-500 text-slate-950 hover:bg-amber-400">
            ثبت رخداد جدید
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">عملیات</TableHead>
                <TableHead className="text-right">زمان وقوع</TableHead>
                <TableHead className="text-right">موقعیت</TableHead>
                <TableHead className="text-right">وضعیت</TableHead>
                <TableHead className="text-right">شدت</TableHead>
                <TableHead className="text-right">عنوان رخداد</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost">
                      ویرایش
                    </Button>
                    <Button size="sm" variant="ghost">
                      حذف
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDateTime(incident.date)}
                  </TableCell>
                  <TableCell className="text-right">{incident.location_name}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">
                      {toFa(incidentStatusLabels, incident.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge>{toFa(incidentSeverityLabels, incident.severity)}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-white font-medium">
                    {incident.title}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
