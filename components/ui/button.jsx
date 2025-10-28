import clsx from "clsx";
import { forwardRef } from "react";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50";

const variantStyles = {
  primary: "bg-cyan-500 text-slate-900 hover:bg-cyan-400",
  secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700",
  outline:
    "border border-slate-600 text-slate-100 hover:border-cyan-400 hover:text-cyan-200",
  ghost: "text-slate-300 hover:bg-slate-800/70",
  danger: "bg-red-500 text-white hover:bg-red-400",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export const Button = forwardRef(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    />
  );
});
