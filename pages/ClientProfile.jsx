// /src/pages/ClientProfile.jsx
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Shield, User } from "lucide-react";

export default function ClientProfile() {
  const { data: user, refetch } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const [roleSwitching, setRoleSwitching] = useState(false);

  const handleSwitch = async () => {
    if (!user) return;
    setRoleSwitching(true);
    const nextRole = user.role === "admin" ? "client" : "admin";
    await base44.auth.switchRole(nextRole);
    await refetch();
    setRoleSwitching(false);
  };

  return (
    <>
      <section className="space-y-2" dir="rtl">
        <h1 className="flex items-center justify-end gap-3 text-3xl font-semibold text-white">
          <span>پروفایل کاربری</span>
          <User className="h-8 w-8 text-cyan-400" />
        </h1>
        <p className="max-w-2xl text-sm text-slate-300/90 text-right">
          اطلاعات تماس خود را ببینید و در صورت نیاز بین نمای «مدیر» و «مشتری» جابه‌جا شوید.
        </p>
      </section>

      {user && (
        <Card className="border-slate-800/80 bg-slate-900/60" dir="rtl">
          <CardHeader className="text-right">
            <CardTitle className="text-white">جزئیات حساب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>نام و نام خانوادگی</Label>
                <Input value={user.full_name ?? ""} readOnly />
              </div>
              <div>
                <Label>ایمیل</Label>
                <Input value={user.email ?? ""} readOnly />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>شرکت</Label>
                <Input value={user.company ?? ""} readOnly />
              </div>
              <div>
                <Label>تلفن</Label>
                <Input value={user.phone ?? ""} readOnly />
              </div>
            </div>
            <div>
              <Label>آدرس</Label>
              <Input value={user.address ?? ""} readOnly />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-800/80 bg-slate-900/60" dir="rtl">
        <CardHeader className="text-right">
          <CardTitle className="flex items-center justify-end gap-2 text-white">
            <span>نقش فعلی نشست</span>
            <Shield className="h-5 w-5 text-purple-300" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-slate-300 text-right">
          <p>
            شما هم‌اکنون در نقش{" "}
            <span className="font-semibold text-white">
              {user?.role === "admin" ? "مدیر" : "مشتری"}
            </span>{" "}
            وارد شده‌اید.
          </p>
          <Button
            variant="outline"
            className="w-fit self-start border-slate-700/80 text-slate-200 hover:bg-slate-800"
            onClick={handleSwitch}
            disabled={roleSwitching}
          >
            تغییر به نمای {user?.role === "admin" ? "مشتری" : "مدیر"}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
