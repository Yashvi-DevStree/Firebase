/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../../firebase/firebase.service';

@Injectable()
export class ReportService {
    constructor(private readonly firebaseService: FirebaseService) { }
    
    private reportCollection() {
        return this.firebaseService.getFirestore().collection('reports');
    }

    // 📝 Submit a report
    async submitReport(body: any, user: any) {
        try {
            const { newsId, reason } = body;

            if (!newsId || !reason) {
                throw new Error('Missing required fields: newsId or reason');
            }

            const newReport = {
                newsId,
                reason,
                userId: user.uid, // ✅ correct reporter UID
                status: 'pending',
                createdAt: new Date(),
            };

            const docRef = await this.reportCollection().add(newReport);
            return { id: docRef.id, message: '✅ Report submitted successfully' };
        } catch (error) {
            console.error('🔥 [createReport] Error:', error.message);
            throw error;
        }
    }

    // 📋 Fetch all reports ( Admin-Only )
    async fetchReport() {
        const snapshot = await this.reportCollection().get();
        const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { totalReports: reports.length, reports };
    }

    // ⚙️ Mark report as completed or update status ( Admin-Only )
    async updateReportStatus(reportId: string, status: string) {
        const ref = this.reportCollection().doc(reportId);
        const doc = await ref.get();
        if (!doc.exists) throw new NotFoundException('Report not found');

        // Auto-mark as completed when status is 'resolved' or 'handled'
        const newStatus = (status === 'resolve' || status === 'handled') ? 'completed' : status;

        await ref.update({
            status: newStatus,
            updatedAt: new Date()
        })

        return { message: `Report status updated to ${newStatus}` };
    }

    // 🗑️ Delete report (user can delete pending only, admin can delete any)
    async deleteReport(reportId: string, user: any) {
        const docRef = this.reportCollection().doc(reportId);
        const doc = await docRef.get();

        if (!doc.exists) throw new NotFoundException('Report not found');
        const report = doc.data();
        if (!report) throw new NotFoundException('Report data is missing');

        // ✅ DEBUG LOGS
        console.log('🧩 Debug Info >>>');
        console.log('user.uid:', user.uid);
        console.log('user.role:', user.role);
        console.log('report.userId:', report.userId);
        console.log('report.status:', report.status);

        const isAdmin = user.role === 'admin';
        const isReporter = report.userId === user.uid;
        const isPending = report.status?.toLowerCase() === 'pending';

        if (!isAdmin && !(isReporter && isPending)) {
            throw new ForbiddenException('Not allowed to delete this report');
        }
        console.log('isAdmin:', isAdmin, 'isReporter:', isReporter, 'isPending:', isPending);

        await docRef.delete();
        return { message: '🗑️ Report deleted successfully' };     
    }


}                             