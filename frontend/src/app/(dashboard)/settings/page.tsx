import type { Metadata } from "next";

import { PasswordCard } from "@/components/settings/password-card";
import { PreferencesCard, SessionCard } from "@/components/settings/preferences-card";
import { ProfileCard } from "@/components/settings/profile-card";
import { PageHeader } from "@/components/ui/feedback";

export const metadata: Metadata = {
  title: "Settings · JobTracker",
};

export default function SettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Manage your profile, password and preferences." />
      <ProfileCard />
      <PasswordCard />
      <PreferencesCard />
      <SessionCard />
    </div>
  );
}
