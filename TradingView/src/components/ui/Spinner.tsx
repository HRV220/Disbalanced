import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-3",
};

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-spin rounded-full border-foreground-muted border-t-accent-blue",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

Spinner.displayName = "Spinner";

// Full page loading spinner
const PageSpinner: React.FC = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background-primary">
      <Spinner size="lg" />
    </div>
  );
};

// Inline loading state
interface LoadingProps {
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ text = "Загрузка..." }) => {
  return (
    <div className="flex items-center gap-2 text-foreground-secondary">
      <Spinner size="sm" />
      <span className="text-sm">{text}</span>
    </div>
  );
};

export { Spinner, PageSpinner, Loading };
