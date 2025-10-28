// /src/components/ui/select.jsx
import clsx from "clsx";
import {
  Children,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const SelectContext = createContext(null);

const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within <Select>");
  }
  return context;
};

export function Select({
  value: controlledValue,
  defaultValue,
  onValueChange,
  disabled = false,
  children,
  className,
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  const value = controlledValue ?? internalValue;

  const setValue = useCallback(
    (next) => {
      const nextValue = typeof next === "function" ? next(value) : next;
      if (controlledValue === undefined) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [controlledValue, onValueChange, value]
  );

  const registerItem = useCallback((item) => {
    setItems((previous) => {
      const filtered = previous.filter((existing) => existing.value !== item.value);
      return [...filtered, item];
    });
  }, []);

  const unregisterItem = useCallback((valueToRemove) => {
    setItems((previous) => previous.filter((item) => item.value !== valueToRemove));
  }, []);

  const contextValue = useMemo(
    () => ({
      value,
      setValue,
      open,
      setOpen,
      disabled,
      registerItem,
      unregisterItem,
      items,
    }),
    [value, setValue, open, disabled, registerItem, unregisterItem, items]
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <div className={clsx("relative w-full", className)}>{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className, children, disabled }) {
  const { open, setOpen, disabled: contextDisabled } = useSelectContext();
  const isDisabled = disabled ?? contextDisabled;

  return (
    <button
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      disabled={isDisabled}
      onClick={() => setOpen((prev) => !prev)}
      className={clsx(
        "flex w-full items-center justify-between rounded-lg border border-slate-600 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 shadow-inner shadow-slate-900/60 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
    >
      {children}
      <svg
        aria-hidden
        className={clsx("ml-2 h-4 w-4 transition-transform", open && "rotate-180")}
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M5 7l5 6 5-6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function SelectValue({ placeholder = "یک گزینه را انتخاب کنید…" }) {
  const { value, items } = useSelectContext();
  const selectedItem = items.find((item) => item.value === value);
  return (
    <span className={clsx(selectedItem ? "text-slate-100" : "text-slate-500")}>
      {selectedItem?.label ?? placeholder}
    </span>
  );
}

export function SelectContent({ className, children }) {
  const { open, setOpen } = useSelectContext();
  const contentRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => {
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={clsx(
        "absolute z-50 mt-2 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-700 bg-slate-900/95 shadow-xl shadow-slate-950/70",
        className
      )}
      role="listbox"
    >
      <div className="py-1">{children}</div>
    </div>
  );
}

export function SelectItem({ value, children, className }) {
  const { setValue, setOpen, registerItem, unregisterItem } = useSelectContext();
  const label = Children.toArray(children).join(" ");

  useEffect(() => {
    registerItem({ value, label });
    return () => unregisterItem(value);
  }, [value, label, registerItem, unregisterItem]);

  return (
    <button
      type="button"
      role="option"
      onClick={() => {
        setValue(value);
        setOpen(false);
      }}
      className={clsx(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800/80",
        className
      )}
    >
      {children}
    </button>
  );
}
