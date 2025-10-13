/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { RegisterDto } from './dto/register.dto';
import * as admin from 'firebase-admin';
import axios from 'axios';
import { url } from 'inspector';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()        
export class AuthService {
    constructor(private firebaseService: FirebaseService) { }
    
    // 🔹 Register user + send verification email
    async registerUser(dto: RegisterDto) {
        const { name, email, password } = dto;
        const userRecord = await this.firebaseService.getAuth().createUser({
            email, 
            password,
            displayName: name
        })

        // Generate email verification link
        const actionCodeSettings = {
            url: 'http://localhost:3000',
            handleCodeInApp: true          //means link can be handled by your app (e.g., frontend).
        }

        const link = await this.firebaseService.getAuth().generateEmailVerificationLink(
            email,
            actionCodeSettings
        )

        // send email using your mail service 
        console.log('Verification link:', link)

        // Create Firestore user record
        await this.firebaseService.getFirestore().collection('users').doc(userRecord.uid).set({
            name, 
            email, 
            verified: false,
            createdAt: new Date()
        })

        return { message: 'User created. Please verify your email', link };
    }

    // 🔹 Login user using Firebase 
    async loginUser(dto: LoginDto) {
        const { email, password } = dto;
        try {
            const firebaseApiKey = process.env.FIREBASE_API_KEY; // 🔑 from .env    
            const response = await axios.post(
                `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
                {
                    email,
                    password, 
                    returnSecureToken: true           // Firebase returns idToken and refreshToken.
                }
            )

            const { idToken, refreshToken } = response.data;

            // Verify token using Admin SDK
            const decodedtoken = await admin.auth().verifyIdToken(idToken);
            if (!decodedtoken.email_verified) throw new UnauthorizedException('Please verify your email before logging in...')
            
            return {
                message: 'Login Successful',
                idToken,
                refreshToken,
                email: decodedtoken.email,
                uid: decodedtoken.uid
            }
        } catch (error) {
            console.error('Login failed', error.response?.data || error.message);
        }
    }

    // 🔹 Check email verification status
    async checkverification(uid: string) {
        const user = await this.firebaseService.getAuth().getUser(uid);
        if (!user.emailVerified) {
            throw new UnauthorizedException("Email not verified");
        }
        return { message: "Email verified successfully" };
    }

    // 🔹 Generate password reset link
    async sendPasswordReset(dto: ResetPasswordDto) {
        const actionCodeSettings = {
            url: 'http://localhost:3000',
            handleCodeInApp: true
        }

        const link = await this.firebaseService.getAuth().generatePasswordResetLink(
            dto.email,
            actionCodeSettings
        )

        console.log('Reset link', link);
        return { message: "Password reset email sent", link };
    }

    // 🔹 Re-authenticate user (via client token refresh)
    async verifyReauthToken(idToken: string) {
        const decode = await admin.auth().verifyIdToken(idToken, true);  // true = force refresh
        return { uid: decode.uid, email: decode.email };
    }
}  