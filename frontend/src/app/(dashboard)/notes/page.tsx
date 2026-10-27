import type { Metadata } from "next";

import { NotesView } from "@/components/notes/notes-view";

export const metadata: Metadata = {
  title: "Notes · JobTracker",
};

export default function NotesPage() {
  return <NotesView />;
}
