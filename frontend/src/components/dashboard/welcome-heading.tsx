"use client";

import { getFirstName, useCurrentUser } from "./user-provider";

export function WelcomeHeading() {
  const firstName = getFirstName(useCurrentUser());

  return (
    <h2 className="text-2xl font-semibold">
      Welcome back{firstName ? `, ${firstName}` : ""}! 👋
    </h2>
  );
}
