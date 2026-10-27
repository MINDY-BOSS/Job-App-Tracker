"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { TextField, type TextFieldProps } from "./text-field";

export function PasswordField(props: Omit<TextFieldProps, "type" | "trailing">) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="flex size-11 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
        >
          <Icon className="size-5" aria-hidden="true" />
        </button>
      }
    />
  );
}
