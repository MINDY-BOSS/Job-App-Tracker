"use client";

import { useParams, useRouter } from "next/navigation";

import { PageHeader } from "@/components/ui/feedback";
import { ROUTES } from "@/constants/routes";
import { useApplication, useUpdateApplication } from "@/lib/queries";
import { applicationToValues } from "@/lib/validations/application";
import { ApplicationForm } from "./application-form";
import { ApplicationLoadError, ApplicationSkeleton } from "./application-states";

export function EditApplication() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: app, isPending, error } = useApplication(id);
  const update = useUpdateApplication(id);

  if (isPending) return <ApplicationSkeleton />;
  if (error || !app) return <ApplicationLoadError error={error} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Edit application" description={`${app.role} at ${app.company}`} />
      <ApplicationForm
        // Remount if a refetch brings newer data, so the form shows it.
        key={app.updatedAt}
        defaultValues={applicationToValues(app)}
        submitLabel="Save changes"
        cancelHref={ROUTES.application(app.id)}
        error={update.error}
        onSubmit={async (input) => {
          await update.mutateAsync(input);
          router.push(ROUTES.application(app.id));
        }}
      />
    </div>
  );
}
