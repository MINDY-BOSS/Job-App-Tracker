import { ChevronDown } from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/utils";

const controlClass =
  "w-full rounded-lg border border-input bg-card px-3 text-sm transition-colors placeholder:text-muted-foreground/70 hover:border-foreground/30 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/15";

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: (control: { id: string; describedBy?: string; invalid?: true }) => React.ReactNode;
}

/** Label + control + hint/error, wired up for screen readers. */
export function Field({ label, error, hint, required, className, children }: FieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children({ id, describedBy, invalid: error ? true : undefined })}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

type FieldShared = Omit<FieldProps, "children">;

export function InputField({
  label,
  error,
  hint,
  required,
  className,
  ...props
}: FieldShared & React.ComponentProps<"input">) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          required={required}
          className={cn(controlClass, "h-10")}
          {...props}
        />
      )}
    </Field>
  );
}

export function TextareaField({
  label,
  error,
  hint,
  required,
  className,
  ...props
}: FieldShared & React.ComponentProps<"textarea">) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          required={required}
          className={cn(controlClass, "min-h-24 py-2")}
          {...props}
        />
      )}
    </Field>
  );
}

export function SelectField({
  label,
  error,
  hint,
  required,
  className,
  children,
  ...props
}: FieldShared & React.ComponentProps<"select">) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className}>
      {({ id, describedBy, invalid }) => (
        <Select id={id} aria-describedby={describedBy} aria-invalid={invalid} required={required} {...props}>
          {children}
        </Select>
      )}
    </Field>
  );
}

/** Bare select (no label) for toolbars; give it an aria-label. */
export function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className={cn("relative", className)}>
      <select className={cn(controlClass, "h-10 cursor-pointer appearance-none pr-9")} {...props}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}

/** Bare text input (no label) for toolbars; give it an aria-label. */
export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(controlClass, "h-10", className)} {...props} />;
}
