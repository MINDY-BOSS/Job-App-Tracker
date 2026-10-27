import { useId } from "react";

import { cn } from "@/lib/utils";

export interface TextFieldProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
  hint?: string;
  trailing?: React.ReactNode;
}

export function TextField({ label, error, hint, trailing, className, id, ...props }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-12 w-full rounded-lg border border-input bg-card px-3.5 text-base transition-colors",
            "placeholder:text-muted-foreground/70 hover:border-foreground/30",
            "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
            "disabled:cursor-not-allowed disabled:opacity-60",
            error &&
              "border-destructive hover:border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
            trailing && "pr-12",
            className,
          )}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-0 flex items-center pr-1">{trailing}</div>}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
