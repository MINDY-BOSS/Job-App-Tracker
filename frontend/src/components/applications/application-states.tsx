import axios from "axios";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/dashboard/card";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState, ErrorMessage, Skeleton } from "@/components/ui/feedback";
import { ROUTES } from "@/constants/routes";

export function isNotFound(error: unknown) {
  // A malformed id fails the backend's UUID check with 400; treat it as missing too.
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  return status === 404 || status === 400;
}

/** Not-found or generic error for a single application. */
export function ApplicationLoadError({ error }: { error: unknown }) {
  if (!isNotFound(error)) return <ErrorMessage error={error} />;
  return (
    <Card>
      <EmptyState
        icon={FileQuestion}
        title="Application not found"
        description="It may have been deleted, or the link is wrong."
        action={
          <Link href={ROUTES.applications} className={buttonVariants({ variant: "outline" })}>
            Back to applications
          </Link>
        }
      />
    </Card>
  );
}

export function ApplicationSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading application">
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}
