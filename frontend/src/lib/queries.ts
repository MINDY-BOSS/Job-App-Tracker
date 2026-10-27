"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  Application,
  ApplicationInput,
  ApplicationQuery,
  CalendarEvent,
  DashboardData,
  Paginated,
  Period,
  StatsData,
} from "@/types/application.types";
import type {
  Company,
  CompanyInput,
  CompanySummary,
  DetectBoardResult,
  DocumentKind,
  JobBoard,
  JobDocument,
  Note,
  NoteInput,
} from "@/types/workspace.types";
import type { User } from "@/types/auth.types";

/** Query keys, grouped so a mutation can invalidate everything it affects. */
export const queryKeys = {
  dashboard: (period: Period) => ["dashboard", period] as const,
  stats: ["stats"] as const,
  applications: (query?: ApplicationQuery) => ["applications", "list", query ?? {}] as const,
  application: (id: string) => ["applications", "detail", id] as const,
  calendar: (from: string, to: string) => ["applications", "calendar", from, to] as const,
  companies: ["companies"] as const,
  openings: (companyId: string) => ["companies", "openings", companyId] as const,
  notes: (q?: string) => ["notes", q ?? ""] as const,
  documents: ["documents"] as const,
};

/** Application changes ripple into the dashboard, stats and company counts. */
function useInvalidateApplicationData() {
  const client = useQueryClient();
  return () =>
    Promise.all(
      [["applications"], ["dashboard"], ["stats"], ["companies"]].map((queryKey) =>
        client.invalidateQueries({ queryKey }),
      ),
    );
}

/* ---------- Dashboard & stats ---------- */

export function useDashboard(period: Period) {
  return useQuery({
    queryKey: queryKeys.dashboard(period),
    queryFn: async () => (await api.get<DashboardData>("/dashboard", { params: { period } })).data,
    placeholderData: keepPreviousData,
  });
}

export function useStats() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: async () => (await api.get<StatsData>("/dashboard/stats")).data,
  });
}

/* ---------- Applications ---------- */

export function useApplications(query: ApplicationQuery) {
  return useQuery({
    queryKey: queryKeys.applications(query),
    queryFn: async () =>
      (await api.get<Paginated<Application>>("/applications", { params: query })).data,
    placeholderData: keepPreviousData,
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: queryKeys.application(id),
    queryFn: async () => (await api.get<Application>(`/applications/${id}`)).data,
  });
}

export function useCalendar(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.calendar(from, to),
    queryFn: async () =>
      (await api.get<CalendarEvent[]>("/applications/calendar", { params: { from, to } })).data,
    placeholderData: keepPreviousData,
  });
}

export function useCreateApplication() {
  const invalidate = useInvalidateApplicationData();
  return useMutation({
    mutationFn: async (input: ApplicationInput) =>
      (await api.post<Application>("/applications", input)).data,
    onSuccess: invalidate,
  });
}

export function useUpdateApplication(id: string) {
  const invalidate = useInvalidateApplicationData();
  return useMutation({
    mutationFn: async (input: Partial<ApplicationInput>) =>
      (await api.patch<Application>(`/applications/${id}`, input)).data,
    onSuccess: invalidate,
  });
}

export function useDeleteApplication() {
  const invalidate = useInvalidateApplicationData();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/applications/${id}`)).data,
    onSuccess: invalidate,
  });
}

/* ---------- Companies & job boards ---------- */

export function useCompanies() {
  return useQuery({
    queryKey: queryKeys.companies,
    queryFn: async () => (await api.get<CompanySummary[]>("/companies")).data,
  });
}

export function useSaveCompany() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: CompanyInput & { id?: string | null }) =>
      id
        ? (await api.patch<Company>(`/companies/${id}`, input)).data
        : (await api.post<Company>("/companies", input)).data,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.companies }),
  });
}

export function useDeleteCompany() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/companies/${id}`)).data,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.companies }),
  });
}

export function useDetectBoard() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      (await api.post<DetectBoardResult>(`/companies/${id}/detect-board`)).data,
    onSuccess: (result) => {
      if (result.found) client.setQueryData(queryKeys.openings(result.company.id), result.board);
      return client.invalidateQueries({ queryKey: queryKeys.companies, exact: true });
    },
  });
}

/** Open positions for a saved company with a connected job board. */
export function useOpenings(companyId: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.openings(companyId ?? ""),
    queryFn: async () => (await api.get<JobBoard>(`/companies/${companyId}/openings`)).data,
    enabled: !!companyId && enabled,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

export function useRefreshOpenings(companyId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      (await api.get<JobBoard>(`/companies/${companyId}/openings`, { params: { refresh: "true" } }))
        .data,
    onSuccess: (board) => client.setQueryData(queryKeys.openings(companyId), board),
  });
}

/* ---------- Notes ---------- */

export function useNotes(q?: string) {
  return useQuery({
    queryKey: queryKeys.notes(q),
    queryFn: async () => (await api.get<Note[]>("/notes", { params: q ? { q } : {} })).data,
    placeholderData: keepPreviousData,
  });
}

export function useSaveNote() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: NoteInput & { id?: string }) =>
      id
        ? (await api.patch<Note>(`/notes/${id}`, input)).data
        : (await api.post<Note>("/notes", input)).data,
    onSuccess: () => client.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useDeleteNote() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/notes/${id}`)).data,
    onSuccess: () => client.invalidateQueries({ queryKey: ["notes"] }),
  });
}

/* ---------- Documents ---------- */

export function useDocuments() {
  return useQuery({
    queryKey: queryKeys.documents,
    queryFn: async () => (await api.get<JobDocument[]>("/documents")).data,
  });
}

export function useUploadDocument() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      file: File;
      name?: string;
      kind: DocumentKind;
      applicationId?: string | null;
    }) => {
      const form = new FormData();
      form.append("file", input.file);
      form.append("kind", input.kind);
      if (input.name) form.append("name", input.name);
      if (input.applicationId) form.append("applicationId", input.applicationId);
      // Let the browser set the multipart boundary.
      return (
        await api.post<JobDocument>("/documents", form, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      ).data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.documents }),
  });
}

export function useUpdateDocument() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: {
      id: string;
      name?: string;
      kind?: DocumentKind;
      applicationId?: string | null;
    }) => (await api.patch<JobDocument>(`/documents/${id}`, input)).data,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.documents }),
  });
}

export function useDeleteDocument() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/documents/${id}`)).data,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.documents }),
  });
}

/** Downloads a document (the endpoint needs the auth header, so a plain link won't do). */
export async function downloadDocument(doc: Pick<JobDocument, "id" | "fileName">) {
  const { data } = await api.get<Blob>(`/documents/${doc.id}/file`, { responseType: "blob" });
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = doc.fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/* ---------- Account ---------- */

export function useUpdateProfile() {
  return useMutation({
    mutationFn: async (input: { name: string }) =>
      (await api.patch<Pick<User, "id" | "email" | "name">>("/users/me", input)).data,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (input: { currentPassword: string; newPassword: string }) =>
      (await api.patch<{ message: string }>("/users/me/password", input)).data,
  });
}
