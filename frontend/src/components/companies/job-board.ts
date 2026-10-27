import type { AtsProvider } from "@/types/workspace.types";

export const PROVIDERS: { value: AtsProvider; label: string; pattern: string }[] = [
  { value: "greenhouse", label: "Greenhouse", pattern: "job-boards.greenhouse.io/" },
  { value: "lever", label: "Lever", pattern: "jobs.lever.co/" },
  { value: "ashby", label: "Ashby", pattern: "jobs.ashbyhq.com/" },
];

export function providerLabel(provider: AtsProvider) {
  return PROVIDERS.find((p) => p.value === provider)?.label ?? provider;
}

/** Example public board URL, shown as a hint next to the slug input. */
export function boardUrlHint(provider: AtsProvider | "" | null, slug?: string | null) {
  const match = PROVIDERS.find((p) => p.value === provider);
  if (!match) return "Pick a provider to connect the company's careers page.";
  return `The part after https://${match.pattern} — e.g. https://${match.pattern}${slug || "stripe"}`;
}

export const SLUG_PATTERN = /^[A-Za-z0-9._-]+$/;

/** "https://"-prefixed href for a website typed without a scheme. */
export function websiteHref(website: string) {
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

/** "just now", "12 minutes ago", "3 hours ago", "2 days ago". */
export function formatAgo(value: string) {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
  if (Math.abs(seconds) < 60) return "just now";
  if (Math.abs(seconds) < 3600) return rtf.format(Math.round(seconds / 60), "minute");
  if (Math.abs(seconds) < 86400) return rtf.format(Math.round(seconds / 3600), "hour");
  return rtf.format(Math.round(seconds / 86400), "day");
}
