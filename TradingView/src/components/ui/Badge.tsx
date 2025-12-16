import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-accent-blue text-white",
        secondary:
          "border-transparent bg-background-tertiary text-foreground-secondary",
        destructive: "border-transparent bg-accent-red text-white",
        success: "border-transparent bg-accent-green text-white",
        warning: "border-transparent bg-accent-orange text-white",
        outline: "border-border text-foreground",
        // Trading specific variants
        bid: "border-transparent bg-accent-green-dim text-accent-green",
        ask: "border-transparent bg-accent-red-dim text-accent-red",
        diff: "border-transparent bg-accent-blue-dim text-accent-blue",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
