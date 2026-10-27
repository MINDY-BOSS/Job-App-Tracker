"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { STATUS_META, STATUS_ORDER } from "@/components/dashboard/status";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/dashboard/card";
import { ErrorMessage } from "@/components/ui/feedback";
import { InputField, SelectField, TextareaField } from "@/components/ui/field";
import {
  applicationSchema,
  valuesToInput,
  type ApplicationFormValues,
} from "@/lib/validations/application";
import type { ApplicationInput } from "@/types/application.types";

interface ApplicationFormProps {
  defaultValues: ApplicationFormValues;
  submitLabel: string;
  cancelHref: string;
  onSubmit: (input: ApplicationInput) => Promise<unknown>;
  /** Error from the save mutation, shown above the form. */
  error?: unknown;
}

export function ApplicationForm({ defaultValues, submitLabel, cancelHref, onSubmit, error }: ApplicationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues,
    mode: "onTouched",
  });

  const submit = async (values: ApplicationFormValues) => {
    try {
      await onSubmit(valuesToInput(values));
    } catch {
      // Shown through the `error` prop from the mutation.
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-6">
      <ErrorMessage error={error} />

      <Card className="p-4 sm:p-6">
        <h3 className="mb-4 font-semibold">Job details</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField label="Company" required autoComplete="organization" placeholder="e.g. Stripe" error={errors.company?.message} {...register("company")} />
          <InputField label="Role" required placeholder="e.g. Frontend Engineer" error={errors.role?.message} {...register("role")} />
          <InputField label="Location" placeholder="e.g. Remote, Lagos" error={errors.location?.message} {...register("location")} />
          <InputField label="Salary" placeholder="e.g. $90k – $120k" error={errors.salary?.message} {...register("salary")} />
          <InputField
            label="Job posting link"
            type="url"
            inputMode="url"
            placeholder="https://"
            className="sm:col-span-2"
            error={errors.jobUrl?.message}
            {...register("jobUrl")}
          />
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <h3 className="mb-4 font-semibold">Progress</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField label="Status" error={errors.status?.message} {...register("status")}>
            {STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {STATUS_META[status].label}
              </option>
            ))}
          </SelectField>
          <InputField label="Date applied" type="date" required error={errors.appliedAt?.message} {...register("appliedAt")} />
          <InputField
            label="Application deadline"
            type="date"
            hint="Shows in Upcoming Deadlines and the calendar."
            error={errors.dueAt?.message}
            {...register("dueAt")}
          />
          <InputField
            label="Interview"
            type="datetime-local"
            hint="Date and time of your next interview, if scheduled."
            error={errors.interviewAt?.message}
            {...register("interviewAt")}
          />
          <TextareaField
            label="Notes"
            rows={5}
            placeholder="Contacts, referral, what to prepare…"
            className="sm:col-span-2"
            error={errors.notes?.message}
            {...register("notes")}
          />
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={cancelHref} className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
