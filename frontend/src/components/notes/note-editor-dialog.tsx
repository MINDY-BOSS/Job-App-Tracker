"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { ApplicationSelect } from "@/components/workspace/application-select";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ErrorMessage } from "@/components/ui/feedback";
import { InputField, TextareaField } from "@/components/ui/field";
import { useDeleteNote, useSaveNote } from "@/lib/queries";
import { noteSchema, type NoteValues } from "@/lib/validations/notes";
import type { Note } from "@/types/workspace.types";

interface NoteEditorDialogProps {
  open: boolean;
  /** The note being edited; null for a new note. */
  note: Note | null;
  onClose: () => void;
}

export function NoteEditorDialog({ open, note, onClose }: NoteEditorDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={note ? "Edit note" : "New note"} className="max-w-2xl">
      {/* Keyed so the form resets between notes. */}
      {open && <NoteForm key={note?.id ?? "new"} note={note} onDone={onClose} />}
    </Dialog>
  );
}

function NoteForm({ note, onDone }: { note: Note | null; onDone: () => void }) {
  const save = useSaveNote();
  const remove = useDeleteNote();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NoteValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: note?.title ?? "",
      content: note?.content ?? "",
      pinned: note?.pinned ?? false,
      applicationId: note?.applicationId ?? "",
    },
  });

  const onSubmit = (values: NoteValues) =>
    save.mutate(
      {
        id: note?.id,
        title: values.title,
        content: values.content,
        pinned: values.pinned,
        applicationId: values.applicationId || null,
      },
      { onSuccess: onDone },
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <ErrorMessage error={save.error ?? remove.error} />
      <InputField
        label="Title"
        required
        maxLength={200}
        placeholder="e.g. Interview prep for Stripe"
        error={errors.title?.message}
        autoFocus
        {...register("title")}
      />
      <TextareaField
        label="Note"
        rows={9}
        placeholder="Questions to ask, STAR stories, follow-ups…"
        {...register("content")}
      />
      <Controller
        control={control}
        name="applicationId"
        render={({ field }) => (
          <ApplicationSelect value={field.value} onChange={field.onChange} current={note?.application} />
        )}
      />
      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-medium">
        <input type="checkbox" className="size-4 accent-primary" {...register("pinned")} />
        Pin to top
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        {note ? (
          confirmingDelete ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Delete this note?</span>
              <Button
                variant="danger"
                size="sm"
                loading={remove.isPending}
                onClick={() => remove.mutate(note.id, { onSuccess: onDone })}
              >
                Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
                Keep
              </Button>
            </div>
          ) : (
            <Button variant="danger-ghost" size="sm" onClick={() => setConfirmingDelete(true)}>
              <Trash2 />
              Delete
            </Button>
          )
        ) : (
          <span />
        )}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            {note ? "Save changes" : "Create note"}
          </Button>
        </div>
      </div>
    </form>
  );
}
