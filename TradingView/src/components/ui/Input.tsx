import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, hint, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            "flex h-10 w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-sm text-foreground",
            "placeholder:text-foreground-muted",
            "focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-150",
            error &&
              "border-accent-red focus:ring-accent-red/50 focus:border-accent-red",
            className
          )}
          ref={ref}
          {...props}
        />
        {hint && !error && (
          <span className="text-xs text-foreground-muted">{hint}</span>
        )}
        {error && <span className="text-xs text-accent-red">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
