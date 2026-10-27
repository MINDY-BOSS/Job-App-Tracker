import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().trim().min(1, "Give the note a title").max(200, "Keep the title under 200 characters"),
  content: z.string(),
  pinned: z.boolean(),
  /** "" means not linked to an application. */
  applicationId: z.string(),
});

export type NoteValues = z.infer<typeof noteSchema>;
