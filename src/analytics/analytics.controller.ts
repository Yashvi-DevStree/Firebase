/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('analytics')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }
    
    // 📊 Get Admin Dashboard Data
    @Get('dashboard')
    @Roles('admin')
    async getDashboard(@Req() req: any) {
        return this.analyticsService.getDashboardData(req.user)
    }
}
    