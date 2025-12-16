"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string;
  description?: string;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, description, id, ...props }, ref) => {
  const checkboxId = id || React.useId();

  const checkbox = (
    <CheckboxPrimitive.Root
      ref={ref}
      id={checkboxId}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded border border-border bg-background-secondary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-accent-blue data-[state=checked]:border-accent-blue",
        "transition-colors duration-150",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-white")}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  if (!label) {
    return checkbox;
  }

  return (
    <div className="flex items-start gap-2">
      {checkbox}
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor={checkboxId}
          className="text-sm font-medium text-foreground cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
        >
          {label}
        </label>
        {description && (
          <span className="text-xs text-foreground-muted">{description}</span>
        )}
      </div>
    </div>
  );
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
