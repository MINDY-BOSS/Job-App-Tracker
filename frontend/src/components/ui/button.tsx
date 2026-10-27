import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border bg-card text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        "danger-ghost": "text-destructive hover:bg-destructive/10",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        icon: "size-9",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  loading,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading && <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
      {children}
    </button>
  );
}
