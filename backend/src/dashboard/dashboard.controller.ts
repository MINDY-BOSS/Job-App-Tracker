import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { type AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardQueryDto } from './dashboard.dto';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  summary(@CurrentUser() user: AuthUser, @Query() query: DashboardQueryDto) {
    return this.dashboard.summary(user.id, query.period);
  }

  @Get('stats')
  stats(@CurrentUser() user: AuthUser) {
    return this.dashboard.stats(user.id);
  }
}
