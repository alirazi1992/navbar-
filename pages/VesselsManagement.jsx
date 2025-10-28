import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Ship, Search, CheckCircle2, XCircle, MapPinned } from "lucide-react";
import QuickMap from "@/components/client/QuickMap";
import { vesselStatusLabels } from "@/utils/labels.js";
import { formatDate } from "@/utils";
import { useLocale } from "@/contexts/LocaleContext.jsx";

const statusStyles = {
  Active: "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30",
  Maintenance: "bg-amber-500/20 text-amber-200 border border-amber-400/30",
  "Under Review": "bg-slate-500/20 text-slate-300 border border-slate-400/30",
  Docked: "bg-blue-500/20 text-blue-200 border border-blue-400/30",
  "Awaiting Departure": "bg-purple-500/20 text-purple-200 border border-purple-400/30",
  Rejected: "bg-rose-500/20 text-rose-200 border border-rose-400/30",
};

const statusOptions = [
  "Active",
  "Maintenance",
  "Under Review",
  "Docked",
  "Awaiting Departure",
  "Rejected",
];

export default function VesselsManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { t } = useLocale();

  const { data: vessels = [], isLoading } = useQuery({
    queryKey: ["vessels"],
    queryFn: () => base44.entities.Vessel.list("-created_date"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => base44.entities.Vessel.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vessels"] });
      setDialogOpen(false);
      setSelectedVessel(null);
    },
  });

  const filteredVessels = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return vessels;
    return vessels.filter((vessel) =>
      [vessel.name, vessel.owner_name, vessel.type, vessel.destination].some((field) =>
        field?.toLowerCase().includes(term)
      )
    );
  }, [vessels, search]);

  const metrics = useMemo(() => {
    const در_حال_عملیات = vessels.filter((vessel) => vessel.status === "Active").length;
    const در_انتظار = vessels.filter((vessel) => vessel.status === "Under Review").length;
    const پهلو_گرفته = vessels.filter((vessel) => vessel.status === "Docked").length;
    const در_تعمیر = vessels.filter((vessel) => vessel.status === "Maintenance").length;
    return { در_حال_عملیات, در_انتظار, پهلو_گرفته, در_تعمیر };
  }, [vessels]);

  const openEditor = (vessel) => {
    setSelectedVessel(vessel);
    setDialogOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedVessel) return;
    const formData = new FormData(event.currentTarget);
    updateMutation.mutate({
      id: selectedVessel.id,
      payload: {
        name: formData.get("name"),
        type: formData.get("type"),
        flag: formData.get("flag"),
        destination: formData.get("destination"),
        status: formData.get("status"),
        length: parseFloat(formData.get("length") ?? "") || null,
        beam: parseFloat(formData.get("beam") ?? "") || null,
        draft: parseFloat(formData.get("draft") ?? "") || null,
        speed: parseFloat(formData.get("speed") ?? "") || null,
        heading: parseFloat(formData.get("heading") ?? "") || null,
      },
    });
  };

  const setStatus = (vessel, status) => {
    updateMutation.mutate({
      id: vessel.id,
      payload: { status },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <section className="space-y-2 text-right">
        <h1 className="flex items-center justify-end gap-3 text-3xl font-semibold text-white">
          <span>مدیریت ناوگان</span>
          <Ship className="h-8 w-8 text-cyan-400" />
        </h1>
        <p className="text-sm text-slate-300/90">
          وضعیت عملیاتی شناورها را در کریدور خلیج فارس پایش کرده و اولویت‌های پهلوگیری و حرکت را از یک
          نگاه مدیریت کنید.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 text-right">
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-400">شناورهای در حال عملیات</p>
            <p className="mt-1 text-2xl font-semibold text-white">{metrics.در_حال_عملیات}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-400">در انتظار تأیید</p>
            <p className="mt-1 text-2xl font-semibold text-white">{metrics.در_انتظار}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-400">پهلودهی شده در بندر</p>
            <p className="mt-1 text-2xl font-semibold text-white">{metrics.پهلو_گرفته}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-400">شناورهای در تعمیر</p>
            <p className="mt-1 text-2xl font-semibold text-white">{metrics.در_تعمیر}</p>
          </CardContent>
        </Card>
      </section>

      <QuickMap vessels={vessels} />

      <Card className="border-slate-800/80 bg-slate-900/60">
        <CardHeader className="border-b border-slate-800/70 text-right">
          <CardTitle className="flex items-center justify-between text-white">
            <span>فهرست ناوگان ثبت شده</span>
            <div className="relative max-w-xs">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جستجو بر اساس نام یا مقصد..."
                className="pr-10 text-right"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="text-right">
            <TableHeader>
              <TableRow className="bg-slate-900/70">
                <TableHead className="text-right">نام شناور</TableHead>
                <TableHead className="text-right">مالک</TableHead>
                <TableHead className="text-right">نوع</TableHead>
                <TableHead className="text-right">وضعیت</TableHead>
                <TableHead className="text-right">مقصد</TableHead>
                <TableHead className="text-right">سرعت (گره)</TableHead>
                <TableHead className="text-right">آخرین بروزرسانی</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="py-6 text-center text-slate-400">
                    در حال دریافت اطلاعات ناوگان...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filteredVessels.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-6 text-center text-slate-400">
                    شناوری با این مشخصات یافت نشد.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                filteredVessels.map((vessel) => (
                  <TableRow key={vessel.id} className="border-slate-800/60">
                    <TableCell className="font-medium text-white">{vessel.name}</TableCell>
                    <TableCell className="text-slate-300">{vessel.owner_name ?? "—"}</TableCell>
                    <TableCell className="text-slate-300">{vessel.type}</TableCell>
                    <TableCell>
                      <Badge className={statusStyles[vessel.status] ?? statusStyles["Under Review"]}>
                        {t(vesselStatusLabels[vessel.status] ?? vessel.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{vessel.destination ?? "—"}</TableCell>
                    <TableCell className="text-slate-300">
                      {vessel.speed != null ? `${vessel.speed}` : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-slate-400">
                      {formatDate(vessel.updated_date ?? vessel.created_date)}
                    </TableCell>
                    <TableCell className="space-y-2 text-left">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-100"
                          onClick={() => setStatus(vessel, "Active")}
                        >
                          <CheckCircle2 className="ml-1 h-4 w-4" />
                          تأیید
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-300 hover:bg-rose-500/10 hover:text-rose-100"
                          onClick={() => setStatus(vessel, "Rejected")}
                        >
                          <XCircle className="ml-1 h-4 w-4" />
                          رد درخواست
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-slate-700/80 text-slate-300 hover:bg-slate-800"
                        onClick={() => openEditor(vessel)}
                      >
                        ویرایش جزئیات
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-slate-800/80 bg-slate-900/90">
          <DialogHeader className="text-right">
            <DialogTitle className="text-white">
              {selectedVessel ? `ویرایش ${selectedVessel.name}` : "ویرایش شناور"}
            </DialogTitle>
          </DialogHeader>
          {selectedVessel && (
            <form onSubmit={handleSubmit} className="space-y-4 text-right">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">نام شناور</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={selectedVessel.name}
                    required
                    className="text-right"
                  />
                </div>
                <div>
                  <Label htmlFor="type">نوع شناور</Label>
                  <Input
                    id="type"
                    name="type"
                    defaultValue={selectedVessel.type}
                    required
                    className="text-right"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="flag">پرچم</Label>
                  <Input
                    id="flag"
                    name="flag"
                    defaultValue={selectedVessel.flag ?? ""}
                    className="text-right"
                  />
                </div>
                <div>
                  <Label htmlFor="destination">مقصد</Label>
                  <Input
                    id="destination"
                    name="destination"
                    defaultValue={selectedVessel.destination ?? ""}
                    className="text-right"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="status">وضعیت</Label>
                  <Select name="status" defaultValue={selectedVessel.status ?? "Under Review"}>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="انتخاب وضعیت" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(vesselStatusLabels[status] ?? status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="speed">سرعت (گره)</Label>
                  <Input
                    id="speed"
                    name="speed"
                    type="number"
                    step="0.1"
                    defaultValue={selectedVessel.speed ?? ""}
                    className="text-right"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="length">طول (متر)</Label>
                  <Input
                    id="length"
                    name="length"
                    type="number"
                    step="0.1"
                    defaultValue={selectedVessel.length ?? ""}
                    className="text-right"
                  />
                </div>
                <div>
                  <Label htmlFor="beam">عرض عرشه (متر)</Label>
                  <Input
                    id="beam"
                    name="beam"
                    type="number"
                    step="0.1"
                    defaultValue={selectedVessel.beam ?? ""}
                    className="text-right"
                  />
                </div>
                <div>
                  <Label htmlFor="draft">آبخور (متر)</Label>
                  <Input
                    id="draft"
                    name="draft"
                    type="number"
                    step="0.1"
                    defaultValue={selectedVessel.draft ?? ""}
                    className="text-right"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="heading">جهت حرکت (درجه)</Label>
                <Input
                  id="heading"
                  name="heading"
                  type="number"
                  step="1"
                  defaultValue={selectedVessel.heading ?? ""}
                  className="text-right"
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-700/80 text-slate-300 hover:bg-slate-800"
                  onClick={() => setDialogOpen(false)}
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
