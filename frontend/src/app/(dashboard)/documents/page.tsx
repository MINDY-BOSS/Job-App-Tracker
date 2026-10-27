import type { Metadata } from "next";

import { DocumentList } from "@/components/documents/document-list";
import { UploadCard } from "@/components/documents/upload-card";
import { PageHeader } from "@/components/ui/feedback";

export const metadata: Metadata = {
  title: "Documents · JobTracker",
};

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Keep every CV and cover letter in one place, linked to the applications you used them for."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,380px)_1fr]">
        <UploadCard />
        <DocumentList />
      </div>
    </div>
  );
}
