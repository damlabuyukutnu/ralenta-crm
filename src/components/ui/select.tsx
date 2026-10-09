import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, invalid, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid}
        className={cn(
          "h-9 w-full appearance-none rounded-lg border bg-white px-3 pr-9 text-sm text-slate-900 transition-colors focus:outline-2 focus:outline-offset-1 focus:outline-brand-600 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
          invalid ? "border-rose-400" : "border-slate-300",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  ),
);

Select.displayName = "Select";
