/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split(' ')[1];

        if (!token) throw new UnauthorizedException('Missing token');

        try {
            const decoded = await admin.auth().verifyIdToken(token);
            const userRecord = await admin.auth().getUser(decoded.uid);
            const role = userRecord.customClaims?.role || 'user';

            request.user = { uid: decoded.uid, email: decoded.email, role };
            console.log('Authenticated user:', request.user);
            return true;
        } catch (err) {
            console.error('Auth error:', err);
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}