import clsx from "clsx";

export function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={clsx(
          "w-full min-w-[600px] border-collapse text-left text-sm text-slate-200",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function TableHeader(props) {
  return <thead className="bg-slate-800/60 text-xs uppercase tracking-wide" {...props} />;
}

export function TableBody(props) {
  return <tbody className="divide-y divide-slate-700/70" {...props} />;
}

export function TableRow({ className, ...props }) {
  return (
    <tr
      className={clsx("hover:bg-slate-800/40 transition-colors", className)}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }) {
  return (
    <th
      className={clsx("px-4 py-3 font-semibold text-slate-300", className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }) {
  return (
    <td
      className={clsx("px-4 py-3 align-top text-slate-200", className)}
      {...props}
    />
  );
}

export const THead = TableHeader;
export const TBody = TableBody;
export const TRow = TableRow;
export const TH = TableHead;
export const TD = TableCell;
