"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ErrorMessage } from "@/components/ui/feedback";
import { InputField, SelectField, TextareaField } from "@/components/ui/field";
import { useSaveCompany } from "@/lib/queries";
import type { AtsProvider, CompanySummary } from "@/types/workspace.types";
import { boardUrlHint, PROVIDERS, SLUG_PATTERN } from "./job-board";

const companySchema = z
  .object({
    name: z.string().trim().min(1, "Enter the company name").max(120, "Keep it under 120 characters"),
    website: z.string().trim().max(255),
    atsProvider: z.enum(["", "greenhouse", "lever", "ashby"]),
    atsSlug: z
      .string()
      .trim()
      .refine((slug) => !slug || SLUG_PATTERN.test(slug), 'Use only letters, numbers, ".", "_" and "-"'),
    notes: z.string(),
  })
  .refine((values) => !values.atsProvider || values.atsSlug, {
    path: ["atsSlug"],
    message: "Enter the board slug for this provider",
  });

type CompanyValues = z.infer<typeof companySchema>;

interface CompanyFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Company being edited (id may be null for one known only from applications). */
  company?: CompanySummary | null;
}

export function CompanyFormDialog({ open, onClose, company }: CompanyFormDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={company ? `Edit ${company.name}` : "Add company"}
      description="Connect the company's job board to see its open positions."
    >
      <CompanyForm company={company ?? null} onDone={onClose} />
    </Dialog>
  );
}

function CompanyForm({ company, onDone }: { company: CompanySummary | null; onDone: () => void }) {
  const save = useSaveCompany();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CompanyValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name ?? "",
      website: company?.website ?? "",
      atsProvider: company?.atsProvider ?? "",
      atsSlug: company?.atsSlug ?? "",
      notes: company?.notes ?? "",
    },
  });

  const provider = useWatch({ control, name: "atsProvider" });
  const slug = useWatch({ control, name: "atsSlug" });

  const onSubmit = async (values: CompanyValues) => {
    await save.mutateAsync({
      id: company?.id,
      name: values.name,
      website: values.website || null,
      atsProvider: (values.atsProvider || null) as AtsProvider | null,
      atsSlug: values.atsProvider ? values.atsSlug : null,
      notes: values.notes.trim() || null,
    });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values).catch(() => {}))} noValidate className="space-y-4">
      <ErrorMessage error={save.error} />
      <InputField label="Company name" required error={errors.name?.message} {...register("name")} />
      <InputField
        label="Website"
        placeholder="stripe.com"
        inputMode="url"
        error={errors.website?.message}
        {...register("website")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Job board provider" {...register("atsProvider")}>
          <option value="">None</option>
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </SelectField>
        <InputField
          label="Board slug"
          placeholder="stripe"
          disabled={!provider}
          error={errors.atsSlug?.message}
          {...register("atsSlug")}
        />
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">{boardUrlHint(provider, slug)}</p>
      <TextareaField label="Notes" rows={3} {...register("notes")} />
      <div className="flex justify-end gap-3 pt-1">
        <Button variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={save.isPending}>
          {company?.id ? "Save changes" : "Save company"}
        </Button>
      </div>
    </form>
  );
}
