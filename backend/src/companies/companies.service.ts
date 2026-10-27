import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { JobBoardsService } from './job-boards.service';

const key = (name: string) => name.trim().toLowerCase();

@Injectable()
export class CompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boards: JobBoardsService,
  ) {}

  /**
   * Every company the user has saved or applied to. Applications reference
   * companies by name, so the two are merged case-insensitively.
   */
  async findAll(userId: string) {
    const [companies, applications] = await Promise.all([
      this.prisma.company.findMany({ where: { userId } }),
      this.prisma.application.findMany({
        where: { userId },
        orderBy: { appliedAt: 'desc' },
        select: { company: true, status: true, appliedAt: true },
      }),
    ]);

    const rows = new Map<
      string,
      {
        id: string | null;
        name: string;
        website: string | null;
        atsProvider: string | null;
        atsSlug: string | null;
        notes: string | null;
        applicationCount: number;
        statusCounts: Record<ApplicationStatus, number>;
        latestStatus: ApplicationStatus | null;
        lastAppliedAt: Date | null;
      }
    >();

    for (const company of companies) {
      rows.set(key(company.name), {
        id: company.id,
        name: company.name,
        website: company.website,
        atsProvider: company.atsProvider,
        atsSlug: company.atsSlug,
        notes: company.notes,
        applicationCount: 0,
        statusCounts: { applied: 0, interview: 0, rejected: 0, offer: 0 },
        latestStatus: null,
        lastAppliedAt: null,
      });
    }

    // Applications are newest first, so the first one seen sets the latest status.
    for (const app of applications) {
      const row = rows.get(key(app.company)) ?? {
        id: null,
        name: app.company.trim(),
        website: null,
        atsProvider: null,
        atsSlug: null,
        notes: null,
        applicationCount: 0,
        statusCounts: { applied: 0, interview: 0, rejected: 0, offer: 0 },
        latestStatus: null,
        lastAppliedAt: null,
      };
      row.applicationCount++;
      row.statusCounts[app.status]++;
      row.latestStatus ??= app.status;
      row.lastAppliedAt ??= app.appliedAt;
      rows.set(key(app.company), row);
    }

    return [...rows.values()].sort(
      (a, b) =>
        (b.lastAppliedAt?.getTime() ?? 0) - (a.lastAppliedAt?.getTime() ?? 0) ||
        a.name.localeCompare(b.name),
    );
  }

  async create(userId: string, dto: CreateCompanyDto) {
    const existing = await this.findByName(userId, dto.name);
    if (existing) throw new ConflictException('Company already saved');
    return this.prisma.company.create({
      data: { ...dto, atsSlug: dto.atsSlug || null, userId },
    });
  }

  async findOne(userId: string, id: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, userId },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async update(userId: string, id: string, dto: UpdateCompanyDto) {
    await this.findOne(userId, id);
    if (dto.name) {
      const clash = await this.findByName(userId, dto.name);
      if (clash && clash.id !== id) {
        throw new ConflictException('Another company has that name');
      }
    }
    return this.prisma.company.update({
      where: { id },
      data: { ...dto, atsSlug: dto.atsSlug === '' ? null : dto.atsSlug },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.company.delete({ where: { id } });
    return { message: 'Company deleted' };
  }

  async openings(userId: string, id: string, refresh: boolean) {
    const company = await this.findOne(userId, id);
    if (!company.atsProvider || !company.atsSlug) {
      throw new BadRequestException(
        'Connect a job board for this company first',
      );
    }
    const board = await this.boards.fetchBoard(
      company.atsProvider,
      company.atsSlug,
      refresh,
    );
    if (!board) {
      throw new NotFoundException(
        `No ${company.atsProvider} job board found for "${company.atsSlug}"`,
      );
    }
    return board;
  }

  /** Looks for the company's job board and saves it when found. */
  async detectBoard(userId: string, id: string) {
    const company = await this.findOne(userId, id);
    const board = await this.boards.detect(company.name, company.website);
    if (!board) return { found: false as const, company };

    const updated = await this.prisma.company.update({
      where: { id },
      data: { atsProvider: board.provider, atsSlug: board.slug },
    });
    return { found: true as const, company: updated, board };
  }

  private findByName(userId: string, name: string) {
    return this.prisma.company.findFirst({
      where: { userId, name: { equals: name.trim(), mode: 'insensitive' } },
    });
  }
}
