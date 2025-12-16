"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils/cn";

interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: string;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, label, id, ...props }, ref) => {
  const switchId = id || React.useId();

  const switchElement = (
    <SwitchPrimitive.Root
      id={switchId}
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-accent-blue data-[state=unchecked]:bg-background-tertiary",
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0",
          "transition-transform duration-200",
          "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );

  if (!label) {
    return switchElement;
  }

  return (
    <div className="flex items-center gap-2">
      {switchElement}
      <label
        htmlFor={switchId}
        className="text-sm font-medium text-foreground cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      >
        {label}
      </label>
    </div>
  );
});

Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
