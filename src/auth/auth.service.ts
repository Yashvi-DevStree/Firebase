/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import * as admin from 'firebase-admin';
import axios from 'axios';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
    constructor(private firebaseService: FirebaseService) { }

    // ✅ Register user
    async registerUser(dto: RegisterDto) {
        const { name, email, password } = dto;
        const userRecord = await this.firebaseService.getAuth().createUser({
            email,
            password,
            displayName: name,
        });

        // Default role = 'user'
        await this.firebaseService
            .getFirestore()
            .collection('users')
            .doc(userRecord.uid)
            .set({
                name,
                email,
                role: 'user',
                createdAt: new Date(),
            });

        return { message: 'User registered successfully' };
    }

    // ✅ Login user
    async loginUser(dto: LoginDto) {
        const { email, password } = dto;
        try {
            const firebaseApiKey = process.env.FIREBASE_API_KEY;

            const response = await axios.post(
                `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
                { email, password, returnSecureToken: true },
            );

            const { idToken, refreshToken } = response.data;
            const decoded = await admin.auth().verifyIdToken(idToken);

            const userDoc = await this.firebaseService
                .getFirestore()
                .collection('users')
                .doc(decoded.uid)
                .get();

            const userData = userDoc.data();

            return {
                message: 'Login successful',
                idToken,
                refreshToken,
                email: decoded.email,
                uid: decoded.uid,
                role: userData?.role || 'user',
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid email or password');
        }
    }

    // ✅ Assign role (only admin)
    async assignRole(email: string, role: string) {
        const auth = this.firebaseService.getAuth();
        const user = await auth.getUserByEmail(email);

        await auth.setCustomUserClaims(user.uid, { role });
        await this.firebaseService
            .getFirestore()
            .collection('users')
            .doc(user.uid)
            .update({ role });

        return { message: `Role '${role}' assigned to ${email}` };
    }

    // ✅ Refresh role (for /auth/me/refresh)
    async refreshUserRole(idToken: string) {
        const decoded = await admin.auth().verifyIdToken(idToken, true); // force refresh
        const user = await this.firebaseService.getAuth().getUser(decoded.uid);

        const role = user.customClaims?.role || 'user';
        return {
            uid: decoded.uid,
            email: decoded.email,
            role,
            refreshed: true,
        };
    }

    // ✅ Forgot password
    async sendPasswordReset(dto: ResetPasswordDto) {
        const actionCodeSettings = {
            url: 'http://localhost:3000',
            handleCodeInApp: true,
        };

        const link = await this.firebaseService
            .getAuth()
            .generatePasswordResetLink(dto.email, actionCodeSettings);

        return { message: 'Password reset link generated', link };
    }
}
