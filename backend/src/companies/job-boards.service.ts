import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { AtsProvider } from '../../generated/prisma/enums';

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

const CACHE_TTL_MS = 60 * 60 * 1000;
const TIMEOUT_MS = 10_000;

interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  updated_at?: string;
  first_published?: string;
  location?: { name?: string };
  departments?: { name: string }[];
}

interface LeverPosting {
  id: string;
  text: string;
  hostedUrl: string;
  createdAt?: number;
  workplaceType?: string;
  categories?: {
    location?: string;
    team?: string;
    department?: string;
    commitment?: string;
  };
}

interface AshbyJob {
  id: string;
  title: string;
  jobUrl: string;
  location?: string;
  department?: string;
  team?: string;
  employmentType?: string;
  isRemote?: boolean;
  workplaceType?: string;
  publishedAt?: string;
  isListed?: boolean;
}

const isRemote = (...values: (string | null | undefined)[]) =>
  values.some((value) => value?.toLowerCase().includes('remote'));

/**
 * Reads open positions from the public (keyless) job-board APIs of the
 * Greenhouse, Lever and Ashby applicant tracking systems.
 */
@Injectable()
export class JobBoardsService {
  private readonly logger = new Logger(JobBoardsService.name);
  private readonly cache = new Map<string, { at: number; board: JobBoard }>();

  /** Fetches a board's openings; null when the provider has no board under that slug. */
  async fetchBoard(
    provider: AtsProvider,
    slug: string,
    refresh = false,
  ): Promise<JobBoard | null> {
    const key = `${provider}:${slug.toLowerCase()}`;
    const cached = this.cache.get(key);
    if (!refresh && cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return cached.board;
    }

    const jobs = await this.fetchJobs(provider, slug);
    if (!jobs) return null;

    const board: JobBoard = {
      provider,
      slug,
      boardUrl: this.boardUrl(provider, slug),
      fetchedAt: new Date().toISOString(),
      jobs: jobs.sort((a, b) =>
        (b.postedAt ?? '').localeCompare(a.postedAt ?? ''),
      ),
    };
    this.cache.set(key, { at: Date.now(), board });
    return board;
  }

  /** Tries likely slugs for a company name on every provider; first board found wins. */
  async detect(name: string, website?: string | null) {
    for (const slug of this.slugCandidates(name, website)) {
      for (const provider of Object.values(AtsProvider)) {
        try {
          const board = await this.fetchBoard(provider, slug);
          if (board) return board;
        } catch {
          // One provider being down shouldn't stop us checking the others.
        }
      }
    }
    return null;
  }

  slugCandidates(name: string, website?: string | null) {
    const base = name
      .trim()
      .toLowerCase()
      .replace(
        /\b(inc|llc|ltd|limited|plc|corp|corporation|co|company|group|technologies|labs)\b\.?/g,
        '',
      )
      .trim();
    const candidates = [
      base.replace(/[^a-z0-9]/g, ''),
      base.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    ];
    if (website) {
      try {
        const host = new URL(
          website.includes('://') ? website : `https://${website}`,
        ).hostname.replace(/^www\./, '');
        candidates.push(host.split('.')[0]);
      } catch {
        // Not a usable URL; ignore it.
      }
    }
    return [...new Set(candidates.filter(Boolean))];
  }

  boardUrl(provider: AtsProvider, slug: string) {
    switch (provider) {
      case AtsProvider.greenhouse:
        return `https://job-boards.greenhouse.io/${slug}`;
      case AtsProvider.lever:
        return `https://jobs.lever.co/${slug}`;
      case AtsProvider.ashby:
        return `https://jobs.ashbyhq.com/${slug}`;
    }
  }

  private async fetchJobs(
    provider: AtsProvider,
    slug: string,
  ): Promise<JobOpening[] | null> {
    const encoded = encodeURIComponent(slug);
    switch (provider) {
      case AtsProvider.greenhouse: {
        const data = await this.getJson<{ jobs: GreenhouseJob[] }>(
          `https://boards-api.greenhouse.io/v1/boards/${encoded}/jobs?content=true`,
        );
        return (
          data?.jobs.map((job) => ({
            id: String(job.id),
            title: job.title,
            location: job.location?.name ?? null,
            department: job.departments?.[0]?.name ?? null,
            employmentType: null,
            remote: isRemote(job.location?.name, job.title),
            url: job.absolute_url,
            postedAt: job.first_published ?? job.updated_at ?? null,
          })) ?? null
        );
      }
      case AtsProvider.lever: {
        const data = await this.getJson<LeverPosting[]>(
          `https://api.lever.co/v0/postings/${encoded}?mode=json`,
        );
        return (
          data?.map((job) => ({
            id: job.id,
            title: job.text,
            location: job.categories?.location ?? null,
            department:
              job.categories?.team ?? job.categories?.department ?? null,
            employmentType: job.categories?.commitment ?? null,
            remote:
              job.workplaceType === 'remote' ||
              isRemote(job.categories?.location),
            url: job.hostedUrl,
            postedAt: job.createdAt
              ? new Date(job.createdAt).toISOString()
              : null,
          })) ?? null
        );
      }
      case AtsProvider.ashby: {
        const data = await this.getJson<{ jobs: AshbyJob[] }>(
          `https://api.ashbyhq.com/posting-api/job-board/${encoded}`,
        );
        return (
          data?.jobs
            .filter((job) => job.isListed !== false)
            .map((job) => ({
              id: job.id,
              title: job.title,
              location: job.location ?? null,
              department: job.department ?? job.team ?? null,
              employmentType: job.employmentType ?? null,
              remote:
                !!job.isRemote ||
                job.workplaceType === 'Remote' ||
                isRemote(job.location),
              url: job.jobUrl,
              postedAt: job.publishedAt ?? null,
            })) ?? null
        );
      }
    }
  }

  /** GET a JSON resource; null on 404 (no such board), throws on other failures. */
  private async getJson<T>(url: string): Promise<T | null> {
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.warn(`Job board request failed: ${url} (${String(error)})`);
      throw new BadGatewayException('Could not reach the job board');
    }
    if (response.status === 404) return null;
    if (!response.ok) {
      this.logger.warn(`Job board responded ${response.status}: ${url}`);
      throw new BadGatewayException('The job board returned an error');
    }
    return (await response.json()) as T;
  }
}
