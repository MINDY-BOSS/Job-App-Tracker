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
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import {
  CalendarQueryDto,
  QueryApplicationsDto,
} from './dto/query-applications.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateApplicationDto) {
    return this.applications.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryApplicationsDto) {
    return this.applications.findAll(user.id, query);
  }

  // Declared before ':id' so "calendar" isn't parsed as an id.
  @Get('calendar')
  calendar(@CurrentUser() user: AuthUser, @Query() query: CalendarQueryDto) {
    return this.applications.calendar(user.id, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.applications.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applications.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.applications.remove(user.id, id);
  }
}
