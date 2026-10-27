"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/feedback";
import { InputField } from "@/components/ui/field";
import { useChangePassword } from "@/lib/queries";
import { passwordSchema, type PasswordValues } from "@/lib/validations/settings";
import { SettingsSection, SuccessMessage } from "./settings-section";

export function PasswordCard() {
  const change = useChangePassword();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onTouched",
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = ({ currentPassword, newPassword }: PasswordValues) => {
    setSaved(false);
    change.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          reset();
          setSaved(true);
        },
      },
    );
  };

  return (
    <SettingsSection icon={KeyRound} title="Password" description="Use at least 8 characters.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <ErrorMessage error={change.error} />
        <InputField
          label="Current password"
          type="password"
          autoComplete="current-password"
          required
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="New password"
            type="password"
            autoComplete="new-password"
            required
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <InputField
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            required
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </div>
        <div className="flex items-center justify-end gap-4">
          {saved && <SuccessMessage>Password changed.</SuccessMessage>}
          <Button type="submit" loading={change.isPending}>
            Update password
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}
