import { cn } from "@/lib/utils";

type StatusVariant = "success" | "warning" | "danger" | "default";

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-success-muted text-success border-success/20",
  warning: "bg-warning-muted text-warning border-warning/20",
  danger: "bg-danger-muted text-danger border-danger/20",
  default: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
