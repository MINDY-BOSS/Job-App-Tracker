"use client";

import { useState } from "react";

import { companyLogoUrl } from "@/lib/company-logo";

// Theme tokens (see globals.css) cycled per company; tint and ink are derived with color-mix.
const AVATAR_TOKENS = [
  "--blue-bright",
  "--status-interview",
  "--status-rejected",
  "--status-offer",
  "--blue-mid",
  "--destructive",
];

/** Company logo; falls back to an initial-letter badge (stable colour per company) if it can't load. */
export function CompanyAvatar({ name }: { name: string }) {
  const logo = companyLogoUrl(name);
  const [failedLogo, setFailedLogo] = useState<string | null>(null);

  if (logo && failedLogo !== logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- tiny third-party favicon, nothing for next/image to optimise
      <img
        src={logo}
        alt=""
        width={32}
        height={32}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailedLogo(logo)}
        className="size-8 shrink-0 rounded-lg border bg-card object-contain p-1"
      />
    );
  }

  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const token = AVATAR_TOKENS[hash % AVATAR_TOKENS.length];
  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold"
      style={{
        backgroundColor: `color-mix(in oklab, var(${token}) 16%, white)`,
        color: `color-mix(in oklab, var(${token}) 55%, black)`,
      }}
      aria-hidden
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
