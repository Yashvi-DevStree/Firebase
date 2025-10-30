import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
  providers: [ReportService, FirebaseService],
  controllers: [ReportController],
})
export class ReportModule {}
