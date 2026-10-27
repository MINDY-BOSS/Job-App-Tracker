"use client";

import { Link2, NotebookText, Pin, PinOff, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState, ErrorMessage, PageHeader, Skeleton } from "@/components/ui/feedback";
import { Input } from "@/components/ui/field";
import { ROUTES } from "@/constants/routes";
import { useNotes, useSaveNote } from "@/lib/queries";
import { cn, formatRelativeDays } from "@/lib/utils";
import type { Note } from "@/types/workspace.types";
import { NoteEditorDialog } from "./note-editor-dialog";

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function NotesView() {
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search.trim());
  const { data: notes, isPending, error, isFetching } = useNotes(q || undefined);

  // `editing` is the open note; "new" opens a blank editor.
  const [editing, setEditing] = useState<Note | "new" | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notes"
        description="Interview prep, follow-ups and anything else worth remembering."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus />
            New note
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search notes…"
          aria-label="Search notes"
          className="pl-9"
        />
      </div>

      {error ? (
        <ErrorMessage error={error} />
      ) : isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-xl border bg-card">
          {q ? (
            <EmptyState
              icon={Search}
              title="No matching notes"
              description={`Nothing matches “${q}”. Try a different search.`}
            />
          ) : (
            <EmptyState
              icon={NotebookText}
              title="No notes yet"
              description="Jot down interview prep, questions to ask or follow-ups."
              action={
                <Button onClick={() => setEditing("new")}>
                  <Plus />
                  New note
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <ul
          className={cn(
            "grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3",
            isFetching && "opacity-70",
          )}
        >
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onOpen={() => setEditing(note)} />
          ))}
        </ul>
      )}

      <NoteEditorDialog
        open={editing !== null}
        note={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

function NoteCard({ note, onOpen }: { note: Note; onOpen: () => void }) {
  const save = useSaveNote();
  const PinIcon = note.pinned ? PinOff : Pin;

  return (
    <li
      className={cn(
        "group relative flex min-h-44 flex-col rounded-xl border bg-card p-4 shadow-xs transition-shadow hover:shadow-md",
        note.pinned && "border-primary/40",
      )}
    >
      <div className="flex items-start gap-2">
        <h3 className="min-w-0 flex-1 font-semibold">
          {/* The button's ::after covers the card so the whole card opens the note. */}
          <button
            type="button"
            onClick={onOpen}
            className="w-full cursor-pointer truncate text-left after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-4 focus-visible:after:ring-ring/30"
          >
            {note.title}
          </button>
        </h3>
        <button
          type="button"
          onClick={() => save.mutate({ id: note.id, pinned: !note.pinned })}
          disabled={save.isPending}
          aria-label={note.pinned ? `Unpin ${note.title}` : `Pin ${note.title}`}
          aria-pressed={note.pinned}
          title={note.pinned ? "Unpin" : "Pin"}
          className={cn(
            "relative z-10 -mt-1 -mr-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none disabled:opacity-50",
            note.pinned ? "text-primary" : "text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
          )}
        >
          <PinIcon className="size-4" aria-hidden="true" />
        </button>
      </div>

      <p className="mt-2 line-clamp-4 flex-1 text-sm whitespace-pre-line text-muted-foreground">
        {note.content || <span className="italic">No content</span>}
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        {note.application ? (
          <Link
            href={ROUTES.application(note.application.id)}
            className="relative z-10 inline-flex max-w-full items-center gap-1 truncate rounded-md bg-primary/10 px-2 py-1 font-medium text-primary hover:underline"
          >
            <Link2 className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{note.application.company}</span>
          </Link>
        ) : (
          <span />
        )}
        <span>Updated {formatRelativeDays(note.updatedAt)}</span>
      </div>
    </li>
  );
}
