import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { JobBoardsService } from './job-boards.service';

@Module({
  providers: [CompaniesService, JobBoardsService],
  controllers: [CompaniesController],
})
export class CompaniesModule {}
