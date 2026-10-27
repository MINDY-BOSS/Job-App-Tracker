import type { ApplicationStatus } from "@/types/application.types";

export const STATUS_META: Record<
  ApplicationStatus,
  { label: string; color: string; badgeClass: string }
> = {
  applied: {
    label: "Applied",
    color: "var(--status-applied)",
    badgeClass: "bg-status-applied-soft text-status-applied-ink",
  },
  interview: {
    label: "Interview",
    color: "var(--status-interview)",
    badgeClass: "bg-status-interview-soft text-status-interview-ink",
  },
  rejected: {
    label: "Rejected",
    color: "var(--status-rejected)",
    badgeClass: "bg-status-rejected-soft text-status-rejected-ink",
  },
  offer: {
    label: "Offer",
    color: "var(--status-offer)",
    badgeClass: "bg-status-offer-soft text-status-offer-ink",
  },
};

export const STATUS_ORDER: ApplicationStatus[] = ["applied", "interview", "rejected", "offer"];
