import type { Metadata } from "next";

import { ApplicationDetail } from "@/components/applications/application-detail";

export const metadata: Metadata = {
  title: "Application · JobTracker",
};

export default function ApplicationPage() {
  return <ApplicationDetail />;
}
