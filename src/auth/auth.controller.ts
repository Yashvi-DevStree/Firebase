/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Body, Controller, Post, Req, UseGuards, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.registerUser(dto)
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.loginUser(dto)
    }

    @Post('assign-role')
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('admin')
    async assignRole(@Body() body: { email: string; role: string }) {
        return this.authService.assignRole(body.email, body.role);
    }

    // 🔹 New endpoint for refreshing role
    @Post('refresh')
    @UseGuards(FirebaseAuthGuard)
    async refresh(@Req() req) {
        const idToken = req.headers.authorization?.split(' ')[1];
        return this.authService.refreshUserRole(idToken);
    }

    @Post('reset-password')
    passwordReset(@Body() dto: ResetPasswordDto) {
        return this.authService.sendPasswordReset(dto);
    }

    // @Post('re-auth')
    // verifyReauth(@Body('idToken') idToken: string) {
    //     return this.authService.verifyReauthToken(idToken);
    // }
}
