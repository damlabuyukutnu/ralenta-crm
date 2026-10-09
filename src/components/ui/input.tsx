import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid}
      className={cn(
        "h-9 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-2 focus:outline-offset-1 focus:outline-brand-600 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
        invalid ? "border-rose-400" : "border-slate-300",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
