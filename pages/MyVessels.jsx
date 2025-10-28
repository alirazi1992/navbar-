import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { MapPin } from "lucide-react";
import QuickMap from "@/components/client/QuickMap";
import { formatDateTime } from "@/utils";
import { vesselStatusLabels } from "@/utils/labels";

const statusToFa = (status) => vesselStatusLabels[status]?.fa ?? status;

export default function MyVessels() {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: vessels = [], isLoading } = useQuery({
    queryKey: ["vessels"],
    queryFn: () => base44.entities.Vessel.list(),
  });

  const myVessels = useMemo(() => {
    if (!user) return [];
    return vessels.filter((vessel) => vessel.owner_id === user.id);
  }, [vessels, user]);

  return (
    <div className="space-y-6" dir="rtl">
      <section className="space-y-2 text-right">
        <h1 className="flex items-center justify-end gap-3 text-3xl font-semibold text-white">
          <span>ناوگان من</span>
          <MapPin className="h-8 w-8 text-cyan-400" />
        </h1>
        <p className="max-w-2xl text-sm text-slate-300/90">
          در این صفحه آخرین وضعیت شناورهای متعلق به حساب شما، موقعیت مکانی، مقصد و اطلاعات عملیاتی
          مرتبط به‌صورت لحظه‌ای نمایش داده می‌شود.
        </p>
      </section>

      <Card className="border-slate-800/80 bg-slate-900/60">
        <CardHeader className="text-right">
          <CardTitle>موقعیت لحظه‌ای ناوگان</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <QuickMap vessels={myVessels} />
          <p className="text-xs text-slate-500">
            * در صورت نبود مختصات، شناور مربوطه روی نقشه نمایش داده نخواهد شد.
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-800/80 bg-slate-900/60">
        <CardHeader className="text-right">
          <CardTitle>جزئیات شناورها</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">نام شناور</TableHead>
                <TableHead className="text-right">نوع</TableHead>
                <TableHead className="text-right">وضعیت</TableHead>
                <TableHead className="text-right">مقصد</TableHead>
                <TableHead className="text-right">سرعت (گره)</TableHead>
                <TableHead className="text-right">موقعیت</TableHead>
                <TableHead className="text-right">آخرین بروزرسانی</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-slate-400">
                    در حال دریافت اطلاعات ناوگان...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && myVessels.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-slate-400">
                    شناوری برای این حساب ثبت نشده است.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                myVessels.map((vessel) => (
                  <TableRow key={vessel.id}>
                    <TableCell className="text-right font-medium text-white">
                      {vessel.name}
                    </TableCell>
                    <TableCell className="text-right text-slate-300">
                      {vessel.type ?? "نامشخص"}
                    </TableCell>
                    <TableCell className="text-right text-slate-300">
                      {statusToFa(vessel.status ?? "Active")}
                    </TableCell>
                    <TableCell className="text-right text-slate-300">
                      {vessel.destination ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-slate-300">
                      {vessel.speed != null ? vessel.speed : "—"}
                    </TableCell>
                    <TableCell className="text-right text-slate-300">
                      {vessel.latitude && vessel.longitude
                        ? `${vessel.latitude.toFixed(2)}, ${vessel.longitude.toFixed(2)}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right text-slate-300">
                      {vessel.updated_date
                        ? formatDateTime(vessel.updated_date)
                        : vessel.created_date
                          ? formatDateTime(vessel.created_date)
                          : "—"}
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
