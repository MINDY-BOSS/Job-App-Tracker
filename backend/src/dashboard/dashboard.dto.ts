import { IsIn, IsOptional } from 'class-validator';
import { PERIODS, type Period } from '../common/period';

export class DashboardQueryDto {
  @IsOptional()
  @IsIn(PERIODS)
  period?: Period;
}
