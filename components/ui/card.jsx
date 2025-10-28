import clsx from "clsx";

export function Card({ className, ...props }) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-slate-700/60 bg-slate-900/70 shadow-lg shadow-slate-900/30 backdrop-blur-md",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={clsx("flex flex-col gap-1 border-b border-slate-700/60 p-5", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={clsx("text-lg font-semibold leading-tight text-slate-100", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return <div className={clsx("p-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return (
    <div
      className={clsx("border-t border-slate-700/60 p-4 text-sm text-slate-300", className)}
      {...props}
    />
  );
}
