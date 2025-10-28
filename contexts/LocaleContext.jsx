// /src/contexts/LocaleContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  // پیش‌فرض: فارسی
  const [locale, setLocale] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("locale") || "fa";
    }
    return "fa";
  });

  const isRtl = true; // این پروژه برای سرویس‌های ایرانی است => همیشه RTL

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = "fa";
      document.documentElement.dir = "rtl";
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", locale);
    }
  }, [locale]);

  // t: اگر آبجکت {fa,en} بود، fa را برمی‌گرداند؛ اگر رشته باشد همان را.
  const t = (value) => {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if ("fa" in value) return value.fa;
      if ("label" in value) return value.label;
    }
    return String(value);
  };

  const value = useMemo(() => ({ locale, setLocale, isRtl, t }), [locale, isRtl]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within <LocaleProvider>");
  return ctx;
};
