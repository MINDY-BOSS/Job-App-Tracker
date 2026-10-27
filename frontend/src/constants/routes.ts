export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  applications: "/applications",
  newApplication: "/applications/new",
  application: (id: string) => `/applications/${id}`,
  editApplication: (id: string) => `/applications/${id}/edit`,
  calendar: "/calendar",
  statistics: "/statistics",
  documents: "/documents",
  companies: "/companies",
  notes: "/notes",
  settings: "/settings",
} as const;

/** Routes reachable without a session. */
export const PUBLIC_ROUTES = [ROUTES.home, ROUTES.login, ROUTES.register];

/** Route prefixes that require a session. */
export const PROTECTED_PREFIXES = [
  ROUTES.dashboard,
  ROUTES.applications,
  ROUTES.calendar,
  ROUTES.statistics,
  ROUTES.documents,
  ROUTES.companies,
  ROUTES.notes,
  ROUTES.settings,
];
