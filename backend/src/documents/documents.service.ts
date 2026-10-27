import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateDocumentDto, UploadDocumentDto } from './dto/document.dto';

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'image/png',
  'image/jpeg',
]);

const UPLOAD_ROOT = resolve(process.env.UPLOAD_DIR ?? 'uploads');

const APPLICATION_SUMMARY = {
  select: { id: true, company: true, role: true },
} as const;

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      omit: { storagePath: true },
      include: { application: APPLICATION_SUMMARY },
    });
  }

  async upload(
    userId: string,
    file: Express.Multer.File | undefined,
    dto: UploadDocumentDto,
  ) {
    if (!file) throw new BadRequestException('Choose a file to upload');
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        'Upload a PDF, Word document, text file or image',
      );
    }
    await this.assertApplication(userId, dto.applicationId);

    // Stored under a random name so user-supplied file names never touch the path.
    const relativePath = join(
      userId,
      `${randomUUID()}${extname(file.originalname).toLowerCase()}`,
    );
    await mkdir(join(UPLOAD_ROOT, userId), { recursive: true });
    await writeFile(join(UPLOAD_ROOT, relativePath), file.buffer);

    return this.prisma.document.create({
      data: {
        userId,
        name: dto.name?.trim() || file.originalname,
        kind: dto.kind,
        applicationId: dto.applicationId ?? null,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storagePath: relativePath,
      },
      omit: { storagePath: true },
      include: { application: APPLICATION_SUMMARY },
    });
  }

  async update(userId: string, id: string, dto: UpdateDocumentDto) {
    await this.findOne(userId, id);
    await this.assertApplication(userId, dto.applicationId);
    return this.prisma.document.update({
      where: { id },
      data: dto,
      omit: { storagePath: true },
      include: { application: APPLICATION_SUMMARY },
    });
  }

  async open(userId: string, id: string) {
    const document = await this.findOne(userId, id);
    return {
      document,
      stream: createReadStream(join(UPLOAD_ROOT, document.storagePath)),
    };
  }

  async remove(userId: string, id: string) {
    const document = await this.findOne(userId, id);
    await this.prisma.document.delete({ where: { id } });
    await rm(join(UPLOAD_ROOT, document.storagePath), { force: true });
    return { message: 'Document deleted' };
  }

  private async findOne(userId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, userId },
    });
    if (!document) throw new NotFoundException('Document not found');
    return document;
  }

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
