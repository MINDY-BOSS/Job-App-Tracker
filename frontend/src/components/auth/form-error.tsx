"use client";

import { CircleAlert } from "lucide-react";
import { useEffect, useRef } from "react";

export function FormError({ message }: { message: string | null }) {
  const ref = useRef<HTMLDivElement>(null);

  // Move focus to the alert so keyboard and screen-reader users land on the problem.
  useEffect(() => {
    if (message) ref.current?.focus();
  }, [message]);

  if (!message) return null;

  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive focus-visible:outline-none"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
