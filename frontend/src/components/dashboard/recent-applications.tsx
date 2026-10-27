import Link from "next/link";
import { ChevronRight, ClipboardList } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { StatusBadge } from "@/components/ui/status-badge";
import { ROUTES } from "@/constants/routes";
import { formatDay } from "@/lib/utils";
import type { RecentApplication } from "@/types/application.types";
import { Card, CardHeader } from "./card";
import { CompanyAvatar } from "./company-avatar";

export function RecentApplications({ applications }: { applications: RecentApplication[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader title="Recent Applications" viewAllHref={ROUTES.applications} className="pb-4" />
      {applications.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No applications yet"
          description="Track your first application to see it here."
          className="border-t"
          action={
            <Link href={ROUTES.newApplication} className={buttonVariants()}>
              Add application
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-y text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium sm:px-5">Company</th>
                <th className="px-3 py-3 font-medium">Role</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Applied Date</th>
                <th className="w-10 px-3 py-3">
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {applications.map((app) => (
                <tr key={app.id} className="group relative hover:bg-muted/50">
                  <td className="px-4 py-3 sm:px-5">
                    <span className="flex items-center gap-3 font-medium">
                      <CompanyAvatar name={app.company} />
                      {/* The link's ::after stretches over the whole row so it's all clickable. */}
                      <Link
                        href={ROUTES.application(app.id)}
                        className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
                      >
                        {app.company}
                      </Link>
                    </span>
                  </td>
                  <td className="px-3 py-3">{app.role}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">{formatDay(app.appliedAt)}</td>
                  <td className="px-3 py-3 text-muted-foreground group-hover:text-foreground">
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
