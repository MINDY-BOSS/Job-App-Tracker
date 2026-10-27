import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import {
  CalendarQueryDto,
  QueryApplicationsDto,
} from './dto/query-applications.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateApplicationDto) {
    return this.prisma.application.create({ data: { ...dto, userId } });
  }

  async findAll(userId: string, query: QueryApplicationsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const q = query.q?.trim();

    const where: Prisma.ApplicationWhereInput = {
      userId,
      status: query.status,
      company: query.company
        ? { equals: query.company.trim(), mode: 'insensitive' }
        : undefined,
      OR: q
        ? [
            { company: { contains: q, mode: 'insensitive' } },
            { role: { contains: q, mode: 'insensitive' } },
            { location: { contains: q, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const sort = query.sort ?? '-appliedAt';
    const field = sort.replace(/^-/, '') as
      'appliedAt' | 'company' | 'dueAt' | 'updatedAt';
    const direction = sort.startsWith('-') ? 'desc' : 'asc';
    const orderBy: Prisma.ApplicationOrderByWithRelationInput[] = [
      field === 'dueAt'
        ? { dueAt: { sort: direction, nulls: 'last' } }
        : { [field]: direction },
      { createdAt: 'desc' },
    ];

    const [items, total] = await this.prisma.$transaction([
      this.prisma.application.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.application.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /** Deadlines and interviews that fall inside [from, to]. */
  async calendar(userId: string, { from, to }: CalendarQueryDto) {
    const applications = await this.prisma.application.findMany({
      where: {
        userId,
        OR: [
          { dueAt: { gte: from, lte: to } },
          { interviewAt: { gte: from, lte: to } },
        ],
      },
      select: {
        id: true,
        company: true,
        role: true,
        status: true,
        dueAt: true,
        interviewAt: true,
      },
    });

    const inRange = (date: Date | null): date is Date =>
      !!date && date >= from && date <= to;

    return applications
      .flatMap(({ dueAt, interviewAt, ...app }) => [
        ...(inRange(dueAt)
          ? [{ ...app, type: 'deadline' as const, date: dueAt }]
          : []),
        ...(inRange(interviewAt)
          ? [{ ...app, type: 'interview' as const, date: interviewAt }]
          : []),
      ])
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async findOne(userId: string, id: string) {
    // Filtering by userId too means someone else's id looks like "not found".
    const application = await this.prisma.application.findFirst({
      where: { id, userId },
    });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  async update(userId: string, id: string, dto: UpdateApplicationDto) {
    await this.findOne(userId, id);
    return this.prisma.application.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.application.delete({ where: { id } });
    return { message: 'Application deleted' };
  }
}
