import { CircleCheck, type LucideIcon } from "lucide-react";

import { Card } from "@/components/dashboard/card";

interface SettingsSectionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function SettingsSection({ icon: Icon, title, description, children }: SettingsSectionProps) {
  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}

export function SuccessMessage({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-success">
      <CircleCheck className="size-4" aria-hidden="true" />
      {children}
    </p>
  );
}
