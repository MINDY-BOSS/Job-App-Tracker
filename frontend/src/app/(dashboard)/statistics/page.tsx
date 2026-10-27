import type { Metadata } from "next";

import { StatisticsView } from "@/components/statistics/statistics-view";
import { PageHeader } from "@/components/ui/feedback";

export const metadata: Metadata = {
  title: "Statistics · JobTracker",
};

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Statistics" description="How your job search is going, across every application." />
      <StatisticsView />
    </div>
  );
}
