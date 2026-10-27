import type { Metadata } from "next";

import { CalendarView } from "@/components/calendar/calendar-view";
import { PageHeader } from "@/components/ui/feedback";

export const metadata: Metadata = {
  title: "Calendar · JobTracker",
};

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Calendar" description="Application deadlines and interviews at a glance." />
      <CalendarView />
    </div>
  );
}
