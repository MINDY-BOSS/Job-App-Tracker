"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { CURRENT_USER_KEY, type CurrentUser, useCurrentUser } from "@/components/dashboard/user-provider";
import { Button } from "@/components/ui/button";
import { ErrorMessage, Skeleton } from "@/components/ui/feedback";
import { InputField } from "@/components/ui/field";
import { useUpdateProfile } from "@/lib/queries";
import { profileSchema, type ProfileValues } from "@/lib/validations/settings";
import { SettingsSection, SuccessMessage } from "./settings-section";

export function ProfileCard() {
  const user = useCurrentUser();

  return (
    <SettingsSection icon={UserRound} title="Profile" description="How your name appears across JobTracker.">
      {user ? (
        <ProfileForm key={user.id} user={user} />
      ) : (
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      )}
    </SettingsSection>
  );
}

function ProfileForm({ user }: { user: CurrentUser }) {
  const client = useQueryClient();
  const update = useUpdateProfile();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name ?? "" },
  });

  const onSubmit = (values: ProfileValues) => {
    setSaved(false);
    update.mutate(values, {
      onSuccess: (updated) => {
        // Refreshes the name in the sidebar and welcome heading.
        client.setQueryData(CURRENT_USER_KEY, updated);
        reset({ name: updated.name ?? "" });
        setSaved(true);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <ErrorMessage error={update.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Full name"
          autoComplete="name"
          required
          error={errors.name?.message}
          {...register("name", { onChange: () => setSaved(false) })}
        />
        <InputField
          label="Email"
          type="email"
          value={user.email}
          readOnly
          disabled
          hint="Your email is used to log in and can't be changed here."
        />
      </div>
      <div className="flex items-center justify-end gap-4">
        {saved && <SuccessMessage>Profile updated.</SuccessMessage>}
        <Button type="submit" loading={update.isPending} disabled={!isDirty}>
          Save profile
        </Button>
      </div>
    </form>
  );
}
