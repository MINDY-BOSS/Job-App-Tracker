import type { Metadata } from "next";

import { EditApplication } from "@/components/applications/edit-application";

export const metadata: Metadata = {
  title: "Edit Application · JobTracker",
};

export default function EditApplicationPage() {
  return <EditApplication />;
}
