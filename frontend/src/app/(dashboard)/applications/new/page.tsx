import type { Metadata } from "next";
import { Suspense } from "react";

import { NewApplication } from "@/components/applications/new-application";

export const metadata: Metadata = {
  title: "Add Application · JobTracker",
};

export default function NewApplicationPage() {
  // Prefill values come from the URL (useSearchParams), which needs a Suspense boundary.
  return (
    <Suspense>
      <NewApplication />
    </Suspense>
  );
}
