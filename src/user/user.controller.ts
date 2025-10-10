/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './create-user.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    

    @Post('signup')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async signup(@Body() createUserDto: CreateUserDto) {
        const { email, password, name } = createUserDto;
        return this.userService.createUser(email, password, name);
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
