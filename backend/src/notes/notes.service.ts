import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto, QueryNotesDto, UpdateNoteDto } from './dto/note.dto';

const APPLICATION_SUMMARY = {
  select: { id: true, company: true, role: true },
} as const;

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string, query: QueryNotesDto) {
    const q = query.q?.trim();
    return this.prisma.note.findMany({
      where: {
        userId,
        applicationId: query.applicationId,
        OR: q
          ? [
              { title: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } },
            ]
          : undefined,
      },
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
      include: { application: APPLICATION_SUMMARY },
    });
  }

  async create(userId: string, dto: CreateNoteDto) {
    await this.assertApplication(userId, dto.applicationId);
    return this.prisma.note.create({
      data: { ...dto, userId },
      include: { application: APPLICATION_SUMMARY },
    });
  }

  async update(userId: string, id: string, dto: UpdateNoteDto) {
    await this.findOne(userId, id);
    await this.assertApplication(userId, dto.applicationId);
    return this.prisma.note.update({
      where: { id },
      data: dto,
      include: { application: APPLICATION_SUMMARY },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.note.delete({ where: { id } });
    return { message: 'Note deleted' };
  }

  private async findOne(userId: string, id: string) {
    const note = await this.prisma.note.findFirst({ where: { id, userId } });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  /** Stops a note being linked to another user's application. */
  private async assertApplication(
    userId: string,
    applicationId?: string | null,
  ) {
    if (!applicationId) return;
    const exists = await this.prisma.application.count({
      where: { id: applicationId, userId },
    });
    if (!exists) throw new NotFoundException('Application not found');
  }
}
