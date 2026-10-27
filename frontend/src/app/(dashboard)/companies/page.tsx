import type { Metadata } from "next";

import { CompaniesView } from "@/components/companies/companies-view";

export const metadata: Metadata = {
  title: "Companies · JobTracker",
};

export default function CompaniesPage() {
  return <CompaniesView />;
}
