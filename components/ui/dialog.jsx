import clsx from "clsx";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

const DialogContext = createContext(null);

const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within <Dialog>");
  }
  return context;
};

export function Dialog({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;

  const setOpen = useCallback(
    (next) => {
      const nextValue = typeof next === "function" ? next(open) : next;
      if (controlledOpen === undefined) {
        setInternalOpen(nextValue);
      }
      onOpenChange?.(nextValue);
    },
    [controlledOpen, onOpenChange, open]
  );

  const value = useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ children, asChild = false }) {
  const { setOpen } = useDialog();

  if (asChild && children) {
    return children;
  }

  const handleClick = (event) => {
    children?.props?.onClick?.(event);
    setOpen(true);
  };

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
}

export function DialogContent({ className, children, ...props }) {
  const { open, setOpen } = useDialog();

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      setOpen(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur"
      onMouseDown={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={clsx(
          "w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900/95 shadow-2xl shadow-slate-900/70",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export function DialogHeader({ className, ...props }) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-1 border-b border-slate-700 px-6 py-5 text-left",
        className
      )}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }) {
  return (
    <h2
      id={props.id}
      className={clsx("text-lg font-semibold text-slate-100", className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }) {
  return (
    <p className={clsx("text-sm text-slate-400", className)} {...props} />
  );
}
