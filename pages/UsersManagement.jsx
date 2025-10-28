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
import { Users as UsersIcon, Search, Edit } from "lucide-react";
import { formatDate } from "@/utils";
import { useLocale } from "@/contexts/LocaleContext.jsx";
import { userRoleLabels, userStatusLabels } from "@/utils/labels.js";

export default function UsersManagement() {
  const queryClient = useQueryClient();
  const [جستجو, setجستجو] = useState("");
  const [کاربرمنتخب, setکاربرمنتخب] = useState(null);
  const [بازبودنفرم, setبازبودنفرم] = useState(false);
  const { isRtl, t } = useLocale();

  const { data: کاربران = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list("-created_date"),
  });

  const ویرایش = useMutation({
    mutationFn: ({ id, payload }) => base44.entities.User.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setبازبودنفرم(false);
      setکاربرمنتخب(null);
    },
  });

  const کاربرانفیلترشده = useMemo(() => {
    const عبارت = جستجو.trim().toLowerCase();
    if (!عبارت) return کاربران;
    return کاربران.filter((کاربر) =>
      [کاربر.full_name, کاربر.email, کاربر.company]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(عبارت))
    );
  }, [کاربران, جستجو]);

  const آمار = useMemo(() => {
    const کل = کاربران.length;
    const مدیران = کاربران.filter((کاربر) => کاربر.role === "admin").length;
    const مشتریان = کاربران.filter((کاربر) => کاربر.role === "client").length;
    const فعال = کاربران.filter((کاربر) => کاربر.status === "Active").length;
    return { کل, مدیران, مشتریان, فعال };
  }, [کاربران]);

  const بازکردنفرم = (کاربر) => {
    setکاربرمنتخب(کاربر);
    setبازبودنفرم(true);
  };

  const ثبتفرم = (event) => {
    event.preventDefault();
    if (!کاربرمنتخب) return;
    const formData = new FormData(event.currentTarget);
    ویرایش.mutate({
      id: کاربرمنتخب.id,
      payload: {
        full_name: formData.get("full_name"),
        phone: formData.get("phone"),
        company: formData.get("company"),
        address: formData.get("address"),
        role: formData.get("role"),
        status: formData.get("status"),
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <header className="space-y-2 text-right">
        <h1 className="flex items-center justify-end gap-3 text-3xl font-semibold text-white">
          <span>مدیریت کاربران و دسترسی‌ها</span>
          <UsersIcon className="h-8 w-8 text-cyan-400" />
        </h1>
        <p className="text-sm text-slate-300/90">
          نظارت کامل بر دسترسی تیم‌های عملیاتی بندر و شرکت‌های مشتری را از این بخش انجام دهید.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardContent className="flex items-center justify-between p-5">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-400">تعداد کل حساب‌ها</p>
              <p className="mt-1 text-2xl font-semibold text-white">{آمار.کل}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-cyan-300/80" />
          </CardContent>
        </Card>
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardContent className="flex items-center justify-between p-5">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-400">کاربران مدیریتی</p>
              <p className="mt-1 text-2xl font-semibold text-white">{آمار.مدیران}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-purple-300/80" />
          </CardContent>
        </Card>
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardContent className="flex items-center justify-between p-5">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-400">نشست‌های مشتریان</p>
              <p className="mt-1 text-2xl font-semibold text-white">{آمار.مشتریان}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-blue-300/80" />
          </CardContent>
        </Card>
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardContent className="flex items-center justify-between p-5">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-400">حساب‌های فعال</p>
              <p className="mt-1 text-2xl font-semibold text-white">{آمار.فعال}</p>
            </div>
            <UsersIcon className="h-8 w-8 text-emerald-300/80" />
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-800/80 bg-slate-900/60">
        <CardHeader className="border-b border-slate-800/70 text-right">
          <CardTitle className="text-white">دفترچه کاربران</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="relative max-w-xl self-end">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <Input
              value={جستجو}
              onChange={(event) => setجستجو(event.target.value)}
              placeholder="جستجو بر اساس نام، ایمیل یا شرکت..."
              className="pr-10 text-right"
            />
          </div>

          <Table className="text-right">
            <TableHeader>
              <TableRow className="bg-slate-900/70">
                <TableHead className="text-right">نام و نام خانوادگی</TableHead>
                <TableHead className="text-right">شرکت</TableHead>
                <TableHead className="text-right">ایمیل</TableHead>
                <TableHead className="text-right">تلفن</TableHead>
                <TableHead className="text-right">نقش</TableHead>
                <TableHead className="text-right">وضعیت</TableHead>
                <TableHead className="text-right">تاریخ عضویت</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="py-6 text-center text-slate-400">
                    در حال دریافت اطلاعات...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && کاربرانفیلترشده.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-6 text-center text-slate-400">
                    نتیجه‌ای مطابق جستجو پیدا نشد.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                کاربرانفیلترشده.map((کاربر) => (
                  <TableRow key={کاربر.id} className="border-slate-800/60">
                    <TableCell>
                      <div className="flex flex-col items-end">
                        <span className="font-medium text-white">{کاربر.full_name}</span>
                        <span className="text-xs text-slate-500">
                          {کاربر.address || "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{کاربر.company ?? "—"}</TableCell>
                    <TableCell className="text-slate-300">{کاربر.email}</TableCell>
                    <TableCell className="text-slate-300">{کاربر.phone ?? "—"}</TableCell>
                    <TableCell>
                      <Badge className={کاربر.role === "admin" ? "bg-purple-500/15 text-purple-200 border border-purple-400/30" : "bg-blue-500/15 text-blue-200 border border-blue-400/30"}>
                        {t(userRoleLabels[کاربر.role] ?? کاربر.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/15 text-emerald-200 border border-emerald-400/30">
                        {t(userStatusLabels[کاربر.status] ?? کاربر.status ?? "دعوت شده")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-400">{formatDate(کاربر.created_date)}</TableCell>
                    <TableCell className="text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-100"
                        onClick={() => بازکردنفرم(کاربر)}
                      >
                        <Edit className="ml-1 h-4 w-4" />
                        ویرایش
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={بازبودنفرم} onOpenChange={setبازبودنفرم}>
        <DialogContent className="border-slate-800/80 bg-slate-900/90">
          <DialogHeader className="text-right">
            <DialogTitle className="text-white">
              {کاربرمنتخب ? `ویرایش ${کاربرمنتخب.full_name}` : "ویرایش کاربر"}
            </DialogTitle>
          </DialogHeader>
          {کاربرمنتخب && (
            <form onSubmit={ثبتفرم} className="space-y-4 text-right">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="full_name">نام و نام خانوادگی</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    defaultValue={کاربرمنتخب.full_name}
                    required
                    className="text-right"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">تلفن تماس</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={کاربرمنتخب.phone ?? ""}
                    className="text-right"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="company">نام سازمان</Label>
                  <Input
                    id="company"
                    name="company"
                    defaultValue={کاربرمنتخب.company ?? ""}
                    className="text-right"
                  />
                </div>
                <div>
                  <Label htmlFor="address">نشانی</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={کاربرمنتخب.address ?? ""}
                    className="text-right"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="role">نقش کاربر</Label>
                  <Select name="role" defaultValue={کاربرمنتخب.role ?? "client"}>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="انتخاب نقش" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">{t(userRoleLabels.admin)}</SelectItem>
                      <SelectItem value="client">{t(userRoleLabels.client)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">وضعیت</Label>
                  <Select name="status" defaultValue={کاربرمنتخب.status ?? "Invited"}>
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="انتخاب وضعیت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">{t(userStatusLabels.Active)}</SelectItem>
                      <SelectItem value="Suspended">{t(userStatusLabels.Suspended)}</SelectItem>
                      <SelectItem value="Invited">{t(userStatusLabels.Invited)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-700/80 text-slate-300 hover:bg-slate-800"
                  onClick={() => setبازبودنفرم(false)}
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                  disabled={ویرایش.isPending}
                >
                  {ویرایش.isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
