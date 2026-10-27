"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { PageHeader } from "@/components/ui/feedback";
import { ROUTES } from "@/constants/routes";
import { useCreateApplication } from "@/lib/queries";
import { emptyApplicationValues } from "@/lib/validations/application";
import { ApplicationForm } from "./application-form";

export function NewApplication() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const create = useCreateApplication();

  // Prefill from a link such as Companies → "Track this job"; read once so typing isn't reset.
  const [defaults] = useState(() =>
    emptyApplicationValues({
      company: searchParams.get("company") ?? "",
      role: searchParams.get("role") ?? "",
      jobUrl: searchParams.get("jobUrl") ?? "",
      location: searchParams.get("location") ?? "",
    }),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Add application" description="Log a job you've applied to (or are about to)." />
      <ApplicationForm
        defaultValues={defaults}
        submitLabel="Save application"
        cancelHref={ROUTES.applications}
        error={create.error}
        onSubmit={async (input) => {
          const application = await create.mutateAsync(input);
          router.push(ROUTES.application(application.id));
        }}
      />
    </div>
  );
}
