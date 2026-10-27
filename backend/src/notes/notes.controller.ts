import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { type AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateNoteDto, QueryNotesDto, UpdateNoteDto } from './dto/note.dto';
import { NotesService } from './notes.service';

@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryNotesDto) {
    return this.notes.findAll(user.id, query);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateNoteDto) {
    return this.notes.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notes.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notes.remove(user.id, id);
  }
}
