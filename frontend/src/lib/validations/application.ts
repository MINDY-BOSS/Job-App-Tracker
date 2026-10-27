import { z } from "zod";

import type { Application, ApplicationInput, ApplicationStatus } from "@/types/application.types";
import { toDateInput, toDateTimeInput, todayInput } from "@/lib/utils";

const optionalText = z.string().trim().max(500, "Keep this under 500 characters");

export const applicationSchema = z.object({
  company: z.string().trim().min(1, "Enter the company name").max(120, "Keep this under 120 characters"),
  role: z.string().trim().min(1, "Enter the role").max(160, "Keep this under 160 characters"),
  status: z.enum(["applied", "interview", "rejected", "offer"]),
  appliedAt: z.string().min(1, "Enter the date you applied"),
  dueAt: z.string(),
  interviewAt: z.string(),
  location: optionalText,
  jobUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || /^https?:\/\/\S+\.\S+/i.test(value), "Enter a full link, e.g. https://…"),
  salary: optionalText,
  notes: z.string().max(5000, "Keep notes under 5000 characters"),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;

/** Blank form, optionally prefilled (e.g. from a job opening's "Track this job"). */
export function emptyApplicationValues(prefill: Partial<ApplicationFormValues> = {}): ApplicationFormValues {
  return {
    company: "",
    role: "",
    status: "applied" satisfies ApplicationStatus,
    appliedAt: todayInput(),
    dueAt: "",
    interviewAt: "",
    location: "",
    jobUrl: "",
    salary: "",
    notes: "",
    ...prefill,
  };
}

export function applicationToValues(application: Application): ApplicationFormValues {
  return {
    company: application.company,
    role: application.role,
    status: application.status,
    appliedAt: toDateInput(application.appliedAt),
    dueAt: toDateInput(application.dueAt),
    interviewAt: toDateTimeInput(application.interviewAt),
    location: application.location ?? "",
    jobUrl: application.jobUrl ?? "",
    salary: application.salary ?? "",
    notes: application.notes ?? "",
  };
}

/** Form values → API payload. Empty optional fields become null so edits can clear them. */
export function valuesToInput(values: ApplicationFormValues): ApplicationInput {
  const orNull = (value: string) => (value.trim() === "" ? null : value.trim());
  return {
    company: values.company.trim(),
    role: values.role.trim(),
    status: values.status,
    appliedAt: values.appliedAt,
    dueAt: values.dueAt || null,
    // datetime-local has no timezone; new Date() reads it as local time.
    interviewAt: values.interviewAt ? new Date(values.interviewAt).toISOString() : null,
    location: orNull(values.location),
    jobUrl: orNull(values.jobUrl),
    salary: orNull(values.salary),
    notes: values.notes.trim() === "" ? null : values.notes,
  };
}
