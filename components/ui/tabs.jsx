import clsx from "clsx";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const TabsContext = createContext(null);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used inside <Tabs>");
  }
  return context;
};

export function Tabs({ value: controlledValue, defaultValue, onValueChange, children, className }) {
  const [internalValue, setInternalValue] = useState(defaultValue);
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

  const contextValue = useMemo(() => ({ value, setValue }), [value, setValue]);

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }) {
  return (
    <div
      className={clsx(
        "inline-flex w-full items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/60 p-1 text-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className, children }) {
  const { value: activeValue, setValue } = useTabsContext();
  const isActive = value === activeValue;

  return (
    <button
      type="button"
      onClick={() => setValue(value)}
      className={clsx(
        "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-slate-900 text-cyan-300 shadow-inner shadow-cyan-500/20"
          : "text-slate-300 hover:bg-slate-900/60 hover:text-cyan-200",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }) {
  const { value: activeValue } = useTabsContext();
  if (value !== activeValue) return null;
  return <div className={clsx("mt-4", className)}>{children}</div>;
}
