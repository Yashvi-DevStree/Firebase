/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './create-user.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    

    @Post('signup')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async signup(@Body() createUserDto: CreateUserDto) {
        const { email, password, name } = createUserDto;
        return this.userService.createUser(email, password, name);
    }

     @UseGuards(FirebaseAuthGuard)
        @Get('profile')
        getProfile(@Req() req) {
            return {
                message: 'Access granted',
                user: req.user, // contains uid, email, email_verified, etc.
            };
        }

    @Get()
    async getAll() {
        return this.userService.getAllUsers();
    }

    @Get(':uid')
    async getById(
        @Param('uid') uid: string
    ) {
        return this.userService.getUserById(uid)
    }

    @Put('update-user/:uid')
    async updateUser(
        @Param('uid') uid: string,
        @Body() body: {name?: string, email?: string}
    ) {
        return this.userService.updateUser(uid, body);
    }

    @Delete(':uid')
    async deleteUser(
        @Param('uid') uid: string
    ) {
        return this.userService.deleteUser(uid);
    }
}
