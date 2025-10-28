import clsx from "clsx";

export function Badge({ className, children, ...props }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border border-transparent bg-slate-700/60 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
