import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { type AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompaniesService } from './companies.service';
import {
  CreateCompanyDto,
  OpeningsQueryDto,
  UpdateCompanyDto,
} from './dto/company.dto';

@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companies: CompaniesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.companies.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCompanyDto) {
    return this.companies.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companies.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.companies.remove(user.id, id);
  }

  @Get(':id/openings')
  openings(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: OpeningsQueryDto,
  ) {
    return this.companies.openings(user.id, id, query.refresh === 'true');
  }

  @Post(':id/detect-board')
  @HttpCode(200)
  detectBoard(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.companies.detectBoard(user.id, id);
  }
}
