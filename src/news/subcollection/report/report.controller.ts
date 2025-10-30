/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Delete,
    Req,
    UnauthorizedException,
    UseGuards
} from "@nestjs/common";
import { ReportService } from "./report.service";
import { FirebaseAuthGuard } from "src/auth/guards/firebase-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";

@Controller("reports")
export class ReportController {
    constructor(private readonly reportService: ReportService) { }

    // 📝 USER → Create a new report
    @UseGuards(FirebaseAuthGuard)
    @Post()
    async createReport(@Body() body: any, @Req() req: any) {
        return this.reportService.submitReport(body, req.user);
    }

    // 📋 ADMIN → Get all reports
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('admin')
    @Get()
    async getAllReports(@Req() req: any) {
        if (req.user?.role !== "admin") {
            throw new UnauthorizedException("Only admins can view all reports");
        }
        return this.reportService.fetchReport();
    }

    // ⚙️ ADMIN → Update report status (auto-completes when resolved/handled)
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch(":reportId")
    async updateStatus(
        @Param("reportId") reportId: string,
        @Body() body: { status: string },
        @Req() req: any
    ) {
        if (req.user?.role !== "admin") {
            throw new UnauthorizedException("Only admins can update report status");
        }
        return this.reportService.updateReportStatus(reportId, body.status);
    }

    // 🗑️ Delete a report (Admin or Reporter)
    @UseGuards(FirebaseAuthGuard)
    @Delete(':reportId')
    async deleteReport(@Param('reportId') reportId: string, @Req() req: Request) {
        const user = req['user'];
        return this.reportService.deleteReport(reportId, user);
    }

}      