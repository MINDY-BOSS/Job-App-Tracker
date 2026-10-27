export type ApplicationStatus = "applied" | "interview" | "rejected" | "offer";

export type Period = "week" | "month" | "year";

export interface Application {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedAt: string;
  dueAt: string | null;
  interviewAt: string | null;
  location: string | null;
  jobUrl: string | null;
  salary: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Fields the create/update endpoints accept. Dates are ISO strings; null clears a field. */
export interface ApplicationInput {
  company: string;
  role: string;
  status?: ApplicationStatus;
  appliedAt?: string;
  dueAt?: string | null;
  interviewAt?: string | null;
  location?: string | null;
  jobUrl?: string | null;
  salary?: string | null;
  notes?: string | null;
}

export type ApplicationSort =
  | "appliedAt"
  | "-appliedAt"
  | "company"
  | "-company"
  | "dueAt"
  | "-dueAt"
  | "updatedAt"
  | "-updatedAt";

export interface ApplicationQuery {
  q?: string;
  status?: ApplicationStatus;
  company?: string;
  sort?: ApplicationSort;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CalendarEvent {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  type: "deadline" | "interview";
  date: string;
}

export type RecentApplication = Pick<Application, "id" | "company" | "role" | "status" | "appliedAt">;

export interface Deadline {
  id: string;
  company: string;
  role: string;
  dueAt: string;
}

export interface DashboardStat {
  key: "total" | ApplicationStatus;
  label: string;
  value: number;
  /** Percentage change versus the previous period. */
  change: number;
}

export interface TimeSeriesPoint {
  label: string;
  value: number;
}

export interface DashboardData {
  period: Period;
  stats: DashboardStat[];
  statusBreakdown: Record<ApplicationStatus, number>;
  overTime: TimeSeriesPoint[];
  recent: RecentApplication[];
  deadlines: Deadline[];
  /** Deadlines and interviews in the next 7 days. */
  alerts: number;
}

export type StatusCounts = Record<ApplicationStatus, number>;

export interface StatsData {
  total: number;
  totals: StatusCounts;
  rates: { response: number; interview: number; offer: number };
  funnel: TimeSeriesPoint[];
  /** Average days from applying to the last status change; null with no responses yet. */
  avgDaysToResponse: number | null;
  monthly: ({ label: string } & StatusCounts)[];
  topCompanies: ({ name: string; total: number } & StatusCounts)[];
  topRoles: ({ name: string; total: number } & StatusCounts)[];
}
