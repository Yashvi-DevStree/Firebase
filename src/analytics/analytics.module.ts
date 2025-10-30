import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
  providers: [AnalyticsService, FirebaseService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
