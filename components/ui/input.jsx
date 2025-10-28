import clsx from "clsx";
import { forwardRef } from "react";

export const Input = forwardRef(function Input({ className, type = "text", ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={clsx(
        "w-full rounded-lg border border-slate-600 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 shadow-inner shadow-slate-900/60 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40",
        className
      )}
      {...props}
    />
  );
});
