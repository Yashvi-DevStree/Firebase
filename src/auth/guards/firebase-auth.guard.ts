/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // 1️⃣ Get the token from Authorization header
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid Authorization header');
        }

        const idToken = authHeader.split(' ')[1];

        if (!idToken || typeof idToken !== 'string') {
            throw new UnauthorizedException('Invalid Firebase ID token');
        }

        try {
            // 2️⃣ Verify the token with Firebase Admin SDK
            const decodedToken = await admin.auth().verifyIdToken(idToken);

            // 3️⃣ Attach user info to request object
            request.user = decodedToken;
            return true;
        } catch (error) {
            console.error('FirebaseAuthGuard error:', error);
            throw new UnauthorizedException('Invalid or expired Firebase ID token');
        }
    }
}