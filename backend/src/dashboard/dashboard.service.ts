import { Injectable } from '@nestjs/common';
import { ApplicationStatus } from '../../generated/prisma/enums';
import {
  addDays,
  type Period,
  periodRange,
  startOfDay,
} from '../common/period';
import { PrismaService } from '../prisma/prisma.service';

const STATUSES = Object.values(ApplicationStatus);
const DAY_MS = 24 * 60 * 60 * 1000;

type Counts = Record<ApplicationStatus, number>;

function emptyCounts(): Counts {
  return { applied: 0, interview: 0, rejected: 0, offer: 0 };
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

interface Bucket {
  label: string;
  start: Date;
  end: Date;
}

/** Chart buckets for a period: 7 days, 5 weeks or 12 months, oldest first. */
function buckets(period: Period, now = new Date()): Bucket[] {
  const today = startOfDay(now);
  if (period === 'week') {
    return Array.from({ length: 7 }, (_, i) => {
      const start = addDays(today, i - 6);
      return {
        label: start.toLocaleDateString('en-US', { weekday: 'short' }),
        start,
        end: addDays(start, 1),
      };
    });
  }
  if (period === 'month') {
    return Array.from({ length: 5 }, (_, i) => {
      const start = addDays(today, (i - 4) * 7 - 6);
      return {
        label: start.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        start,
        end: addDays(start, 7),
      };
    });
  }
  return Array.from({ length: 12 }, (_, i) => {
    const start = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return {
      label: start.toLocaleDateString('en-US', { month: 'short' }),
      start,
      end: new Date(start.getFullYear(), start.getMonth() + 1, 1),
    };
  });
}

const STAT_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  interview: 'Interview',
  rejected: 'Rejected',
  offer: 'Offers',
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(userId: string, period: Period = 'month') {
    const now = new Date();
    const today = startOfDay(now);
    const { start, previousStart } = periodRange(period, now);
    const chart = buckets(period, now);
    const earliest =
      chart[0].start < previousStart ? chart[0].start : previousStart;

    const [windowApps, recent, deadlines, alerts] = await Promise.all([
      this.prisma.application.findMany({
        where: { userId, appliedAt: { gte: earliest } },
        select: { status: true, appliedAt: true },
      }),
      this.prisma.application.findMany({
        where: { userId },
        orderBy: [{ appliedAt: 'desc' }, { createdAt: 'desc' }],
        take: 5,
        select: {
          id: true,
          company: true,
          role: true,
          status: true,
          appliedAt: true,
        },
      }),
      this.prisma.application.findMany({
        where: {
          userId,
          dueAt: { gte: today },
          status: { not: ApplicationStatus.rejected },
        },
        orderBy: { dueAt: 'asc' },
        take: 4,
        select: { id: true, company: true, role: true, dueAt: true },
      }),
      // Deadlines or interviews in the next 7 days, for the notification bell.
      this.prisma.application.count({
        where: {
          userId,
          status: { not: ApplicationStatus.rejected },
          OR: [
            { dueAt: { gte: today, lt: addDays(today, 8) } },
            { interviewAt: { gte: now, lt: addDays(today, 8) } },
          ],
        },
      }),
    ]);

    const current = emptyCounts();
    const previous = emptyCounts();
    for (const app of windowApps) {
      if (app.appliedAt >= start) current[app.status]++;
      else if (app.appliedAt >= previousStart) previous[app.status]++;
    }
    const total = STATUSES.reduce((sum, s) => sum + current[s], 0);
    const previousTotal = STATUSES.reduce((sum, s) => sum + previous[s], 0);

    return {
      period,
      stats: [
        {
          key: 'total',
          label: 'Total Applications',
          value: total,
          change: percentChange(total, previousTotal),
        },
        ...STATUSES.map((status) => ({
          key: status,
          label: STAT_LABELS[status],
          value: current[status],
          change: percentChange(current[status], previous[status]),
        })),
      ],
      statusBreakdown: current,
      overTime: chart.map((bucket) => ({
        label: bucket.label,
        value: windowApps.filter(
          (app) => app.appliedAt >= bucket.start && app.appliedAt < bucket.end,
        ).length,
      })),
      recent,
      deadlines,
      alerts,
    };
  }

  async stats(userId: string) {
    const apps = await this.prisma.application.findMany({
      where: { userId },
      select: {
        company: true,
        role: true,
        status: true,
        appliedAt: true,
        updatedAt: true,
      },
    });

    const totals = emptyCounts();
    for (const app of apps) totals[app.status]++;
    const total = apps.length;
    const rate = (n: number) =>
      total ? Math.round((n / total) * 1000) / 10 : 0;

    const responded = apps.filter(
      (app) => app.status !== ApplicationStatus.applied,
    );
    // There's no status history, so the last update is the best signal of when they replied.
    const avgDaysToResponse = responded.length
      ? Math.round(
          (responded.reduce(
            (sum, app) =>
              sum +
              Math.max(0, app.updatedAt.getTime() - app.appliedAt.getTime()),
            0,
          ) /
            responded.length /
            DAY_MS) *
            10,
        ) / 10
      : null;

    const monthly = buckets('year').map((bucket) => {
      const counts = emptyCounts();
      for (const app of apps) {
        if (app.appliedAt >= bucket.start && app.appliedAt < bucket.end) {
          counts[app.status]++;
        }
      }
      return { label: bucket.label, ...counts };
    });

    const groupBy = (key: 'company' | 'role') => {
      const groups = new Map<
        string,
        { name: string; total: number } & Counts
      >();
      for (const app of apps) {
        const id = app[key].trim().toLowerCase();
        const group = groups.get(id) ?? {
          name: app[key].trim(),
          total: 0,
          ...emptyCounts(),
        };
        group.total++;
        group[app.status]++;
        groups.set(id, group);
      }
      return [...groups.values()].sort((a, b) => b.total - a.total).slice(0, 8);
    };

    return {
      total,
      totals,
      rates: {
        response: rate(responded.length),
        interview: rate(totals.interview + totals.offer),
        offer: rate(totals.offer),
      },
      funnel: [
        { label: 'Applied', value: total },
        { label: 'Responded', value: responded.length },
        { label: 'Interviewed', value: totals.interview + totals.offer },
        { label: 'Offers', value: totals.offer },
      ],
      avgDaysToResponse,
      monthly,
      topCompanies: groupBy('company'),
      topRoles: groupBy('role'),
    };
  }
}
