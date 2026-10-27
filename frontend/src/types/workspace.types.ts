import type { Application, ApplicationStatus, StatusCounts } from "./application.types";

export type AtsProvider = "greenhouse" | "lever" | "ashby";

/** A company from the user's applications and/or saved details (id is null until saved). */
export interface CompanySummary {
  id: string | null;
  name: string;
  website: string | null;
  atsProvider: AtsProvider | null;
  atsSlug: string | null;
  notes: string | null;
  applicationCount: number;
  statusCounts: StatusCounts;
  latestStatus: ApplicationStatus | null;
  lastAppliedAt: string | null;
}

export interface Company {
  id: string;
  name: string;
  website: string | null;
  atsProvider: AtsProvider | null;
  atsSlug: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyInput {
  name?: string;
  website?: string | null;
  atsProvider?: AtsProvider | null;
  atsSlug?: string | null;
  notes?: string | null;
}

export interface JobOpening {
  id: string;
  title: string;
  location: string | null;
  department: string | null;
  employmentType: string | null;
  remote: boolean;
  url: string;
  postedAt: string | null;
}

export interface JobBoard {
  provider: AtsProvider;
  slug: string;
  boardUrl: string;
  fetchedAt: string;
  jobs: JobOpening[];
}

export type DetectBoardResult =
  | { found: true; company: Company; board: JobBoard }
  | { found: false; company: Company };

export type LinkedApplication = Pick<Application, "id" | "company" | "role">;

export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  applicationId: string | null;
  application: LinkedApplication | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoteInput {
  title?: string;
  content?: string;
  pinned?: boolean;
  applicationId?: string | null;
}

export type DocumentKind = "cv" | "cover_letter" | "other";

export interface JobDocument {
  id: string;
  name: string;
  kind: DocumentKind;
  fileName: string;
  mimeType: string;
  size: number;
  applicationId: string | null;
  application: LinkedApplication | null;
  createdAt: string;
}
