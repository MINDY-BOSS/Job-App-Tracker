import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { type AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MAX_UPLOAD_BYTES, DocumentsService } from './documents.service';
import { UpdateDocumentDto, UploadDocumentDto } from './dto/document.dto';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.documents.findAll(user.id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES } }),
  )
  upload(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.documents.upload(user.id, file, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documents.update(user.id, id, dto);
  }

  @Get(':id/file')
  async download(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const { document, stream } = await this.documents.open(user.id, id);
    return new StreamableFile(stream, {
      type: document.mimeType,
      length: document.size,
      disposition: `attachment; filename*=UTF-8''${encodeURIComponent(document.fileName)}`,
    });
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.documents.remove(user.id, id);
  }
}
