/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';


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

    @Get('verify-email/:uid')
    checkEmail(@Param('uid') uid: string) {
        return this.authService.checkverification(uid);
    }

    @Post('reset-password')
    passwordReset(@Body() dto: ResetPasswordDto) {
        return this.authService.sendPasswordReset(dto);
    }

    @Post('re-auth')
    verifyReauth(@Body('idToken') idToken: string) {
        return this.authService.verifyReauthToken(idToken);
    }
}
