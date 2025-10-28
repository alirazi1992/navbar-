import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users as UsersIcon, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { backendClient } from "@/api/backendClient.js";
import { useLocale } from "@/contexts/LocaleContext.jsx";
import { formatDate, formatNumber } from "@/utils/index.js";
import {
  userStatusLabels,
  subUserRoleLabels,
} from "@/utils/labels.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const primaryStatusOptions = [
  { value: "Active", label: "فعال" },
  { value: "Suspended", label: "معلق" },
  { value: "Locked", label: "قفل شده" },
];

const subStatusOptions = [
  { value: "Active", label: "فعال" },
  { value: "Suspended", label: "معلق" },
  { value: "Locked", label: "قفل شده" },
];

const roleOptions = [
  { value: "operations_manager", label: "مدیر عملیات" },
  { value: "finance_controller", label: "کنترل مالی" },
  { value: "port_supervisor", label: "سرپرست بندر" },
  { value: "safety_officer", label: "مسئول ایمنی" },
  { value: "customer_success", label: "پشتیبانی مشتری" },
  { value: "staff", label: "کارشناس" },
];

const percent = (value) => Math.max(0, Math.min(100, Math.round(value)));

const classifyCreditUsage = ({ creditLimit, creditUsed }) => {
  if (creditLimit == null) {
    return { tone: "info", percent: null, overLimit: false };
  }
  const ratio = creditLimit === 0 ? 0 : (creditUsed / creditLimit) * 100;
  const usagePercent = percent(ratio);
  if (creditUsed > creditLimit) {
    return { tone: "danger", percent: usagePercent, overLimit: true };
  }
  if (usagePercent >= 85) {
    return { tone: "warning", percent: usagePercent, overLimit: false };
  }
  return { tone: "success", percent: usagePercent, overLimit: false };
};

const creditToneStyles = {
  success: "bg-emerald-500",
  warning: "bg-amber-400",
  danger: "bg-rose-500",
  info: "bg-slate-600",
};

const badgeToneStyles = {
  Active: "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30",
  Suspended: "bg-amber-500/15 text-amber-200 border border-amber-400/30",
  Locked: "bg-rose-500/15 text-rose-200 border border-rose-400/30",
};

const formatCreditValue = (value) => {
  if (value == null) return "بدون سقف";
  return `${formatNumber(value, { maximumFractionDigits: 0 })} ریال`;
};

const formatDueState = (creditDueDate) => {
  if (!creditDueDate) {
    return { label: "ثبت نشده", tone: "info", overdue: false };
  }
  const due = new Date(creditDueDate);
  if (Number.isNaN(due.getTime())) {
    return { label: "ثبت نشده", tone: "info", overdue: false };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    return { label: `${formatDate(creditDueDate)} • سررسید گذشته`, tone: "danger", overdue: true };
  }
  if (diffDays <= 10) {
    return { label: `${formatDate(creditDueDate)} • نزدیک به سررسید`, tone: "warning", overdue: false };
  }
  return { label: `${formatDate(creditDueDate)} • معتبر`, tone: "success", overdue: false };
};

function CreditUsageBar({ creditLimit, creditUsed }) {
  const status = classifyCreditUsage({ creditLimit, creditUsed });
  if (creditLimit == null) {
    return (
      <div className="text-sm text-slate-300">سقف اعتباری ثبت نشده است.</div>
    );
  }
  const width = `${status.percent}%`;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>مصرف شده: {formatCreditValue(creditUsed)}</span>
        <span>سقف: {formatCreditValue(creditLimit)}</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-slate-800/80">
        <div
          className={`absolute inset-y-0 rounded-full ${creditToneStyles[status.tone]}`}
          style={{ width }}
        />
      </div>
      {status.overLimit && (
        <p className="text-xs text-rose-300">
          مصرف اعتباری از سقف تعیین شده فراتر رفته است.
        </p>
      )}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <header className="space-y-2 text-right">
      <h1 className="flex items-center justify-end gap-3 text-3xl font-semibold text-white">
        <span>{title}</span>
        {Icon ? <Icon className="h-8 w-8 text-cyan-400" /> : null}
      </h1>
      {description ? <p className="text-sm text-slate-300/90">{description}</p> : null}
    </header>
  );
}

export default function UsersManagement() {
  const queryClient = useQueryClient();
  const { t } = useLocale();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedRow, setExpandedRow] = useState(null);
  const [isPrimaryDialogOpen, setPrimaryDialogOpen] = useState(false);
  const [editingPrimary, setEditingPrimary] = useState(null);
  const [isSubDialogOpen, setSubDialogOpen] = useState(false);
  const [subFormPrimary, setSubFormPrimary] = useState(null);
  const [editingSub, setEditingSub] = useState(null);

  const { data: primaryUsers = [], isLoading } = useQuery({
    queryKey: ["primary-users"],
    queryFn: () => backendClient.listPrimaryUsers({ includeSubUsers: true }),
  });

  const { data: summary = {} } = useQuery({
    queryKey: ["primary-summary"],
    queryFn: () => backendClient.getSummary(),
  });

  const primaryMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      id ? backendClient.updatePrimaryUser(id, payload) : backendClient.createPrimaryUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["primary-users"] });
      queryClient.invalidateQueries({ queryKey: ["primary-summary"] });
      setPrimaryDialogOpen(false);
      setEditingPrimary(null);
    },
  });

  const subMutation = useMutation({
    mutationFn: ({ id, primaryUserId, payload }) =>
      id
        ? backendClient.updateSubUser(id, payload)
        : backendClient.createSubUser(primaryUserId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["primary-users"] });
      queryClient.invalidateQueries({ queryKey: ["primary-summary"] });
      setSubDialogOpen(false);
      setEditingSub(null);
    },
  });

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return primaryUsers.filter((primary) => {
      if (statusFilter !== "all" && primary.status !== statusFilter) {
        return false;
      }
      if (!term) return true;
      const fields = [
        primary.name,
        primary.branchName,
        primary.nationalCode,
        primary.phone,
        primary.email,
        primary.notes,
      ];
      if (Array.isArray(primary.subUsers)) {
        primary.subUsers.forEach((sub) => {
          fields.push(sub.name, sub.role, sub.phone, sub.email, sub.nationalCode);
        });
      }
      return fields
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [primaryUsers, search, statusFilter]);

  const metrics = {
    totalPrimary: summary.totalPrimary ?? primaryUsers.length,
    activePrimary:
      summary.activePrimary ?? primaryUsers.filter((user) => user.status === "Active").length,
    lockedPrimary:
      summary.lockedPrimary ?? primaryUsers.filter((user) => user.status === "Locked").length,
    totalSub:
      summary.totalSub ??
      primaryUsers.reduce((acc, primary) => acc + (primary.subUsers?.length ?? 0), 0),
    lockedSub:
      summary.lockedSub ??
      primaryUsers.reduce(
        (acc, primary) => acc + (primary.subUsers?.filter((sub) => sub.status === "Locked").length ?? 0),
        0
      ),
  };

  const openPrimaryForm = (primary = null) => {
    setEditingPrimary(primary);
    setPrimaryDialogOpen(true);
  };

  const openSubForm = (primary, subUser = null) => {
    setSubFormPrimary(primary);
    setEditingSub(subUser);
    setSubDialogOpen(true);
  };

  const handlePrimarySubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      branchName: formData.get("branchName"),
      nationalCode: formData.get("nationalCode"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      notes: formData.get("notes"),
      creditLimit: formData.get("creditLimit") ? Number(formData.get("creditLimit")) : null,
      creditUsed: formData.get("creditUsed") ? Number(formData.get("creditUsed")) : 0,
      creditDueDate: formData.get("creditDueDate") || null,
      status: formData.get("status"),
    };
    primaryMutation.mutate({ id: editingPrimary?.id ?? null, payload });
  };

  const handleSubSubmit = (event) => {
    event.preventDefault();
    if (!subFormPrimary) return;
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      nationalCode: formData.get("nationalCode"),
      role: formData.get("role"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      status: formData.get("status"),
    };
    subMutation.mutate({
      id: editingSub?.id ?? null,
      primaryUserId: subFormPrimary.id,
      payload,
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <SectionTitle
        icon={UsersIcon}
        title="مدیریت حساب‌های اصلی و کاربران زیرمجموعه"
        description="اعتبار شعب، نقش‌ کاربران و وضعیت دسترسی را به‌صورت متمرکز پایش کنید."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardContent className="space-y-1 p-5 text-right">
            <p className="text-xs font-semibold text-slate-400">تعداد حساب‌های اصلی</p>
            <p className="text-2xl font-semibold text-white">{metrics.totalPrimary}</p>
            <p className="text-xs text-slate-400">{metrics.activePrimary} فعال</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardContent className="space-y-1 p-5 text-right">
            <p className="text-xs font-semibold text-slate-400">حساب‌های قفل شده</p>
            <p className="text-2xl font-semibold text-rose-200">{metrics.lockedPrimary}</p>
            <p className="text-xs text-rose-200/80">قفل به دلیل بدهی یا دستور سیستم</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardContent className="space-y-1 p-5 text-right">
            <p className="text-xs font-semibold text-slate-400">زیرمجموعه‌ها</p>
            <p className="text-2xl font-semibold text-white">{metrics.totalSub}</p>
            <p className="text-xs text-slate-400">{metrics.lockedSub} حساب قفل شده</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800/80 bg-slate-900/60">
          <CardContent className="space-y-1 p-5 text-right">
            <p className="text-xs font-semibold text-slate-400">ابزار مدیریت</p>
            <Button
              className="mt-2 w-full bg-cyan-500 text-slate-900 hover:bg-cyan-400"
              onClick={() => openPrimaryForm(null)}
            >
              <Plus className="ml-2 h-4 w-4" /> افزودن حساب اصلی
            </Button>
            <p className="text-[11px] text-slate-400">
              افزودن شعبه جدید، تعریف سقف اعتباری و تعیین مدیران آنی
            </p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-800/80 bg-slate-900/60">
        <CardHeader className="border-b border-slate-800/70 text-right">
          <CardTitle className="flex flex-col gap-3 text-white md:flex-row md:items-center md:justify-between">
            <span>دفترچه حساب‌های اصلی</span>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full md:w-64">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="جستجو بر اساس نام، شعبه یا کاربر زیرمجموعه..."
                  className="text-right"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full text-right md:w-40">
                  <SelectValue placeholder="همه وضعیت‌ها" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                  {primaryStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <Table className="text-right">
            <TableHeader>
              <TableRow className="bg-slate-900/70">
                <TableHead className="text-right">حساب اصلی</TableHead>
                <TableHead className="text-right">وضعیت اعتبار</TableHead>
                <TableHead className="text-right">سررسید اعتبار</TableHead>
                <TableHead className="text-right">وضعیت</TableHead>
                <TableHead className="text-right">کاربران زیرمجموعه</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-slate-400">
                    در حال دریافت اطلاعات...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-slate-400">
                    موردی مطابق با فیلترها یافت نشد.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                filteredUsers.map((primary) => {
                  const dueState = formatDueState(primary.creditDueDate);
                  const isExpanded = expandedRow === primary.id;
                  return (
                    <>
                      <TableRow key={primary.id} className="border-slate-800/60">
                        <TableCell>
                          <div className="space-y-2 text-right">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-base font-semibold text-white">{primary.name}</p>
                                <p className="text-xs text-slate-400">{primary.branchName}</p>
                              </div>
                              <Badge className="bg-slate-800/80 text-[11px] text-slate-200">
                                کد اقتصادی: {primary.nationalCode || "ثبت نشده"}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                              <span>تماس: {primary.phone || "—"}</span>
                              <span>•</span>
                              <span>ایمیل: {primary.email || "—"}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <CreditUsageBar
                            creditLimit={primary.creditLimit}
                            creditUsed={primary.creditUsed}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[11px] ${
                              dueState.tone === "danger"
                                ? "bg-rose-500/15 text-rose-200 border border-rose-400/30"
                                : dueState.tone === "warning"
                                ? "bg-amber-500/15 text-amber-200 border border-amber-400/30"
                                : dueState.tone === "success"
                                ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30"
                                : "bg-slate-700/40 text-slate-200 border border-slate-500/30"
                            }`}
                          >
                            {dueState.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={badgeToneStyles[primary.status] ?? badgeToneStyles.Active}>
                            {t(userStatusLabels[primary.status] ?? primary.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap justify-end gap-2">
                            {(primary.subUsers ?? []).map((sub) => (
                              <Badge
                                key={sub.id}
                                className="bg-cyan-500/10 text-[11px] text-cyan-100"
                              >
                                {sub.name} • {t(subUserRoleLabels[sub.role] ?? sub.role)}
                              </Badge>
                            ))}
                            {primary.subUsers?.length === 0 && (
                              <span className="text-xs text-slate-400">کاربری ثبت نشده است.</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-left">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-700/80 text-slate-200 hover:bg-slate-800"
                              onClick={() => openPrimaryForm(primary)}
                            >
                              ویرایش حساب
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-cyan-500/60 text-cyan-200 hover:bg-cyan-500/10"
                              onClick={() => openSubForm(primary, null)}
                            >
                              افزودن کاربر فرعی
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-300 hover:text-white"
                              onClick={() => setExpandedRow(isExpanded ? null : primary.id)}
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="ml-1 h-4 w-4" /> جزئیات
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="ml-1 h-4 w-4" /> جزئیات
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow key={`${primary.id}-details`} className="bg-slate-950/40">
                          <TableCell colSpan={6}>
                            <div className="space-y-4 rounded-xl border border-slate-800/60 bg-slate-900/70 p-4 text-right">
                              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div>
                                  <p className="text-xs text-slate-400">یادداشت مدیر حساب</p>
                                  <p className="mt-1 text-sm text-slate-200">{primary.notes || "—"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-400">آخرین بروزرسانی</p>
                                  <p className="mt-1 text-sm text-slate-200">{formatDate(primary.updatedAt)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-400">وضعیت قفل سیستمی</p>
                                  <p className="mt-1 text-sm text-slate-200">
                                    {primary.lockedByCredit ? "قفل به دلیل بدهی" : "آزاد"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-400">تعداد کاربران فعال</p>
                                  <p className="mt-1 text-sm text-slate-200">
                                    {primary.subUsers?.filter((sub) => sub.status === "Active").length ?? 0}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-semibold text-white">کاربران زیرمجموعه</h3>
                                  <Button
                                    size="sm"
                                    className="bg-cyan-500/90 text-slate-900 hover:bg-cyan-400"
                                    onClick={() => openSubForm(primary, null)}
                                  >
                                    <Plus className="ml-1 h-4 w-4" /> افزودن
                                  </Button>
                                </div>
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="text-right">نام</TableHead>
                                        <TableHead className="text-right">نقش</TableHead>
                                        <TableHead className="text-right">کد ملی</TableHead>
                                        <TableHead className="text-right">تلفن</TableHead>
                                        <TableHead className="text-right">ایمیل</TableHead>
                                        <TableHead className="text-right">وضعیت</TableHead>
                                        <TableHead />
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {primary.subUsers?.length ? (
                                        primary.subUsers.map((sub) => (
                                          <TableRow key={sub.id}>
                                            <TableCell className="text-slate-200">{sub.name}</TableCell>
                                            <TableCell className="text-slate-200">
                                              {t(subUserRoleLabels[sub.role] ?? sub.role)}
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                              {sub.nationalCode || "—"}
                                            </TableCell>
                                            <TableCell className="text-slate-300">{sub.phone || "—"}</TableCell>
                                            <TableCell className="text-slate-300">{sub.email || "—"}</TableCell>
                                            <TableCell>
                                              <Badge
                                                className={
                                                  badgeToneStyles[sub.status] ?? badgeToneStyles.Active
                                                }
                                              >
                                                {t(userStatusLabels[sub.status] ?? sub.status)}
                                              </Badge>
                                            </TableCell>
                                            <TableCell className="text-left">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-cyan-300 hover:text-cyan-100"
                                                onClick={() => openSubForm(primary, sub)}
                                              >
                                                ویرایش
                                              </Button>
                                            </TableCell>
                                          </TableRow>
                                        ))
                                      ) : (
                                        <TableRow>
                                          <TableCell colSpan={7} className="py-4 text-center text-slate-400">
                                            هیچ کاربری تعریف نشده است.
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={isPrimaryDialogOpen}
        onOpenChange={(open) => {
          setPrimaryDialogOpen(open);
          if (!open) {
            setEditingPrimary(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl border-slate-800/80 bg-slate-900/90">
          <DialogHeader className="text-right">
            <DialogTitle className="text-white">
              {editingPrimary ? `ویرایش ${editingPrimary.name}` : "ثبت حساب اصلی جدید"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePrimarySubmit} className="space-y-4 text-right">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">نام حساب اصلی</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  defaultValue={editingPrimary?.name ?? ""}
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="branchName">شعبه / موقعیت</Label>
                <Input
                  id="branchName"
                  name="branchName"
                  required
                  defaultValue={editingPrimary?.branchName ?? ""}
                  className="text-right"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="nationalCode">شناسه اقتصادی</Label>
                <Input
                  id="nationalCode"
                  name="nationalCode"
                  defaultValue={editingPrimary?.nationalCode ?? ""}
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="phone">تلفن تماس</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={editingPrimary?.phone ?? ""}
                  className="text-right"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="email">ایمیل مالی</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingPrimary?.email ?? ""}
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="status">وضعیت حساب</Label>
                <Select
                  name="status"
                  defaultValue={editingPrimary?.status ?? "Active"}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="انتخاب وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    {primaryStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="creditLimit">سقف اعتباری (ریال)</Label>
                <Input
                  id="creditLimit"
                  name="creditLimit"
                  type="number"
                  min="0"
                  step="1000000"
                  defaultValue={editingPrimary?.creditLimit ?? ""}
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="creditUsed">مصرف شده (ریال)</Label>
                <Input
                  id="creditUsed"
                  name="creditUsed"
                  type="number"
                  min="0"
                  step="1000000"
                  defaultValue={editingPrimary?.creditUsed ?? 0}
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="creditDueDate">سررسید اعتبار</Label>
                <Input
                  id="creditDueDate"
                  name="creditDueDate"
                  type="date"
                  defaultValue={editingPrimary?.creditDueDate?.slice(0, 10) ?? ""}
                  className="text-right"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">یادداشت داخلی</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={editingPrimary?.notes ?? ""}
                className="text-right"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-slate-700/80 text-slate-300 hover:bg-slate-800"
                onClick={() => setPrimaryDialogOpen(false)}
              >
                انصراف
              </Button>
              <Button
                type="submit"
                className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                disabled={primaryMutation.isPending}
              >
                {primaryMutation.isPending ? "در حال ذخیره..." : "ثبت"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isSubDialogOpen}
        onOpenChange={(open) => {
          setSubDialogOpen(open);
          if (!open) {
            setEditingSub(null);
            setSubFormPrimary(null);
          }
        }}
      >
        <DialogContent className="max-w-xl border-slate-800/80 bg-slate-900/90">
          <DialogHeader className="text-right">
            <DialogTitle className="text-white">
              {editingSub
                ? `ویرایش ${editingSub.name}`
                : subFormPrimary
                ? `افزودن کاربر برای ${subFormPrimary.name}`
                : "افزودن کاربر زیرمجموعه"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubSubmit} className="space-y-4 text-right">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="sub-name">نام و نام خانوادگی</Label>
                <Input
                  id="sub-name"
                  name="name"
                  required
                  defaultValue={editingSub?.name ?? ""}
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="sub-nationalCode">کد ملی</Label>
                <Input
                  id="sub-nationalCode"
                  name="nationalCode"
                  defaultValue={editingSub?.nationalCode ?? ""}
                  className="text-right"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="sub-role">نقش کاربری</Label>
                <Select name="role" defaultValue={editingSub?.role ?? "staff"}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="انتخاب نقش" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sub-status">وضعیت</Label>
                <Select name="status" defaultValue={editingSub?.status ?? "Active"}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="انتخاب وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    {subStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="sub-phone">تلفن تماس</Label>
                <Input
                  id="sub-phone"
                  name="phone"
                  defaultValue={editingSub?.phone ?? ""}
                  className="text-right"
                />
              </div>
              <div>
                <Label htmlFor="sub-email">ایمیل</Label>
                <Input
                  id="sub-email"
                  name="email"
                  type="email"
                  defaultValue={editingSub?.email ?? ""}
                  className="text-right"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-slate-700/80 text-slate-300 hover:bg-slate-800"
                onClick={() => setSubDialogOpen(false)}
              >
                انصراف
              </Button>
              <Button
                type="submit"
                className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                disabled={subMutation.isPending}
              >
                {subMutation.isPending ? "در حال ذخیره..." : "ثبت"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
